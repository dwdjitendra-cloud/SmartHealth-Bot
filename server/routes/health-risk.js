const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

/**
 * @route   POST /api/health-risk/assessment
 * @desc    Generate comprehensive health risk assessment
 * @access  Private
 */
router.post('/assessment', auth, [
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array'),
  body('user_profile.age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be between 1 and 120'),
  body('user_profile.bmi')
    .optional()
    .isFloat({ min: 10, max: 50 })
    .withMessage('BMI must be between 10 and 50')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symptoms = [], user_profile = {} } = req.body;

    // Get user data from database
    const user = await User.findById(req.user._id);
    
    // Merge user profile with database data
    const completeProfile = {
      age: user_profile.age || user.age || 25,
      bmi: user_profile.bmi || calculateBMI(user.weight, user.height),
      smoking: user_profile.smoking || user.smoking || false,
      exercise_frequency: user_profile.exercise_frequency || user.exercise_frequency || 3,
      family_history: user_profile.family_history || user.family_history || [],
      chronic_conditions: user_profile.chronic_conditions || user.chronic_conditions || [],
      risk_factors: user_profile.risk_factors || extractRiskFactors(user),
      alcohol: user_profile.alcohol || user.alcohol_consumption || false
    };

    // Call AI service for comprehensive assessment with fallback
    let healthInsights;
    try {
      // Only attempt AI service call if AI_MODEL_URL is configured and not pointing to self
      if (process.env.AI_MODEL_URL && process.env.AI_MODEL_URL !== 'http://localhost:5001') {
        const aiResponse = await axios.post(`${process.env.AI_MODEL_URL}/risk-assessment`, {
          user_profile: completeProfile,
          symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean)
        }, {
          timeout: 5000 // 5 second timeout
        });
        healthInsights = aiResponse.data;
      } else {
        throw new Error('AI service not configured or unavailable');
      }
    } catch (aiError) {
      console.log('AI service unavailable, using fallback analysis...');
      // Use fallback logic
      healthInsights = generateFallbackAssessment(completeProfile, symptoms);
    }

    // Store assessment in user profile for tracking
    await User.findByIdAndUpdate(req.user._id, {
      last_health_assessment: {
        date: new Date(),
        risk_score: healthInsights.health_insights?.overall_risk?.score || 0,
        risk_level: healthInsights.health_insights?.overall_risk?.level || 'Unknown',
        priority_areas: healthInsights.health_insights?.priority_areas || []
      }
    });

    res.json({
      message: 'Health risk assessment completed successfully',
      ...healthInsights,
      user_tracking: {
        assessment_date: new Date(),
        next_recommended_assessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        improvement_areas: healthInsights.health_insights?.priority_areas || []
      }
    });

  } catch (error) {
    console.error('Health risk assessment error:', error);

    // Fallback response if AI service is unavailable
    if (error.response?.status === 500 || error.code === 'ECONNREFUSED') {
      return res.json({
        message: 'Health risk assessment completed with basic analysis',
        status: 'partial_success',
        health_insights: {
          overall_risk: {
            score: 0.3,
            level: 'Low',
            breakdown: {}
          },
          health_score: 70,
          priority_areas: ['General Wellness'],
          personalized_plan: {
            immediate_actions: ['Schedule routine health checkup'],
            lifestyle_recommendations: ['Maintain healthy diet and regular exercise'],
            screening_schedule: ['Annual health screening']
          }
        },
        recommendations: {
          immediate: ['Schedule routine health checkup'],
          lifestyle: ['Maintain healthy diet', 'Regular exercise'],
          screening: ['Annual health screening']
        },
        fallback: true
      });
    }

    res.status(500).json({
      message: 'Server error during health risk assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/health-risk/history
 * @desc    Get user's health assessment history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('last_health_assessment health_assessments')
      .lean();

    res.json({
      message: 'Health assessment history retrieved successfully',
      data: {
        last_assessment: user.last_health_assessment || null,
        history: user.health_assessments || [],
        trends: calculateHealthTrends(user.health_assessments || [])
      }
    });

  } catch (error) {
    console.error('Get health history error:', error);
    res.status(500).json({
      message: 'Server error retrieving health history'
    });
  }
});

/**
 * @route   POST /api/health-risk/update-profile
 * @desc    Update user health profile for better assessments
 * @access  Private
 */
router.post('/update-profile', auth, [
  body('age').optional().isInt({ min: 1, max: 120 }),
  body('weight').optional().isFloat({ min: 20, max: 300 }),
  body('height').optional().isFloat({ min: 50, max: 250 }),
  body('smoking').optional().isBoolean(),
  body('exercise_frequency').optional().isInt({ min: 0, max: 7 }),
  body('family_history').optional().isArray(),
  body('chronic_conditions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = req.body;
    
    // Calculate BMI if weight and height provided
    if (updateData.weight && updateData.height) {
      updateData.bmi = calculateBMI(updateData.weight, updateData.height);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Health profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update health profile error:', error);
    res.status(500).json({
      message: 'Server error updating health profile'
    });
  }
});

// Helper functions
function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

function extractRiskFactors(user) {
  const riskFactors = [];
  
  if (user.smoking) riskFactors.push('smoking');
  if (user.alcohol_consumption) riskFactors.push('alcohol');
  
  const bmi = calculateBMI(user.weight, user.height);
  if (bmi && bmi > 30) riskFactors.push('obesity');
  if (bmi && bmi > 25) riskFactors.push('overweight');
  
  if (user.age && user.age > 65) riskFactors.push('advanced_age');
  if (user.exercise_frequency < 2) riskFactors.push('sedentary_lifestyle');
  
  if (user.family_history && user.family_history.length > 0) {
    user.family_history.forEach(condition => {
      riskFactors.push(`family_history_${condition.toLowerCase()}`);
    });
  }
  
  return riskFactors;
}

function calculateHealthTrends(assessments) {
  if (!assessments || assessments.length < 2) {
    return { trend: 'insufficient_data', message: 'Need more assessments to show trends' };
  }
  
  const recent = assessments.slice(-5); // Last 5 assessments
  const scores = recent.map(a => a.risk_score || 0);
  
  const avgChange = scores.reduce((acc, score, index) => {
    if (index === 0) return acc;
    return acc + (score - scores[index - 1]);
  }, 0) / (scores.length - 1);
  
  let trend = 'stable';
  let message = 'Your health risk has remained relatively stable';
  
  if (avgChange > 0.1) {
    trend = 'improving';
    message = 'Your health risk is trending downward - great progress!';
  } else if (avgChange < -0.1) {
    trend = 'concerning';
    message = 'Your health risk is increasing - consider lifestyle changes';
  }
  
  return {
    trend,
    message,
    average_change: Math.round(avgChange * 100) / 100,
    recent_scores: scores
  };
}

// Fallback assessment function when AI service is unavailable
function generateFallbackAssessment(userProfile, symptoms) {
  console.log('Using fallback symptom analysis...');
  
  let riskScore = 0.3; // Base low risk
  let riskLevel = 'Low';
  let priorityAreas = ['General Wellness'];
  let immediateActions = ['Schedule routine health checkup'];
  let recommendations = ['Maintain a balanced diet', 'Exercise regularly', 'Get adequate sleep'];
  
  // Adjust risk based on user profile
  if (userProfile.age > 65) {
    riskScore += 0.2;
    priorityAreas.push('Age-related Health');
    recommendations.push('Regular health screenings for seniors');
  }
  
  if (userProfile.smoking) {
    riskScore += 0.3;
    priorityAreas.push('Smoking Cessation');
    immediateActions.push('Consider smoking cessation programs');
  }
  
  if (userProfile.bmi && (userProfile.bmi < 18.5 || userProfile.bmi > 25)) {
    riskScore += 0.2;
    priorityAreas.push('Weight Management');
    recommendations.push('Consult with a nutritionist');
  }
  
  // Adjust based on symptoms
  if (symptoms && symptoms.length > 0) {
    const concerningSymptoms = symptoms.filter(s => 
      s.toLowerCase().includes('chest pain') || 
      s.toLowerCase().includes('difficulty breathing') ||
      s.toLowerCase().includes('severe headache')
    );
    
    if (concerningSymptoms.length > 0) {
      riskScore += 0.4;
      riskLevel = 'High';
      immediateActions.unshift('Seek immediate medical attention');
    } else if (symptoms.length > 3) {
      riskScore += 0.2;
      immediateActions.push('Monitor symptoms and consult healthcare provider');
    }
  }
  
  // Determine final risk level
  if (riskScore >= 0.7) riskLevel = 'High';
  else if (riskScore >= 0.4) riskLevel = 'Medium';
  else riskLevel = 'Low';
  
  return {
    status: 'success',
    health_insights: {
      overall_risk: {
        score: Math.min(riskScore, 1.0),
        level: riskLevel,
        breakdown: {
          lifestyle: Math.min(riskScore * 0.6, 1.0),
          genetic: 0.2,
          environmental: 0.1
        }
      },
      health_score: Math.max(100 - (riskScore * 100), 10),
      priority_areas: priorityAreas,
      personalized_plan: {
        immediate_actions: immediateActions,
        lifestyle_recommendations: recommendations,
        screening_schedule: [
          'Annual physical examination',
          'Blood pressure monitoring',
          'Cholesterol screening',
          'Blood sugar testing',
          userProfile.age > 50 ? 'Colonoscopy screening' : 'Regular preventive checkups',
          userProfile.smoking ? 'Lung function testing' : 'Cardiovascular health screening'
        ].filter(Boolean),
        follow_up_timeline: '2-4 weeks'
      },
      disease_risks: {
        cardiovascular: userProfile.smoking ? 'elevated' : 'normal',
        diabetes: userProfile.bmi && userProfile.bmi > 25 ? 'elevated' : 'normal',
        respiratory: userProfile.smoking ? 'elevated' : 'normal'
      }
    },
    ai_service_status: 'fallback'
  };
}

module.exports = router;