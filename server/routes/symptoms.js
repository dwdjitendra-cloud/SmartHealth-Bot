const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const SymptomQuery = require('../models/SymptomQuery');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Parse natural language symptoms and map to AI model symptoms
 */
async function parseSymptoms(naturalLanguageSymptoms) {
  try {
    // Get available symptoms from AI model
    const symptomsResponse = await axios.get(`${process.env.AI_MODEL_URL}/symptoms`, {
      timeout: 10000
    });
    const availableSymptoms = symptomsResponse.data.symptoms;
    
    // Convert input to lowercase for matching
    const input = naturalLanguageSymptoms.toLowerCase();
    const matchedSymptoms = [];
    
    // Keyword mapping for better symptom detection
    const symptomMappings = {
      'fever': ['high_fever', 'mild_fever'],
      'headache': ['headache'],
      'head ache': ['headache'],
      'pain in head': ['headache'],
      'cough': ['cough'],
      'coughing': ['cough'],
      'cold': ['runny_nose', 'congestion'],
      'runny nose': ['runny_nose'],
      'sore throat': ['throat_irritation'],
      'throat pain': ['throat_irritation'],
      'stomach pain': ['stomach_pain', 'abdominal_pain'],
      'stomach ache': ['stomach_pain', 'abdominal_pain'],
      'belly pain': ['belly_pain'],
      'nausea': ['nausea'],
      'vomiting': ['vomiting'],
      'diarrhea': ['diarrhoea'],
      'diarrhoea': ['diarrhoea'],
      'fatigue': ['fatigue'],
      'tired': ['fatigue'],
      'weakness': ['weakness_in_limbs'],
      'dizzy': ['dizziness'],
      'dizziness': ['dizziness'],
      'chest pain': ['chest_pain'],
      'breathing problem': ['breathlessness'],
      'difficulty breathing': ['breathlessness'],
      'shortness of breath': ['breathlessness'],
      'joint pain': ['joint_pain'],
      'muscle pain': ['muscle_pain'],
      'back pain': ['back_pain'],
      'neck pain': ['neck_pain'],
      'knee pain': ['knee_pain'],
      'hip pain': ['hip_joint_pain'],
      'skin rash': ['skin_rash'],
      'rash': ['skin_rash'],
      'itching': ['itching'],
      'constipation': ['constipation'],
      'loss of appetite': ['loss_of_appetite'],
      'weight loss': ['weight_loss'],
      'weight gain': ['weight_gain'],
      'sweating': ['sweating'],
      'chills': ['chills'],
      'shivering': ['shivering'],
      'blurred vision': ['blurred_and_distorted_vision'],
      'red eyes': ['redness_of_eyes'],
      'watery eyes': ['watering_from_eyes'],
      'anxiety': ['anxiety'],
      'depression': ['depression'],
      'mood swings': ['mood_swings'],
      'restlessness': ['restlessness'],
      'sleep problems': ['restlessness'],
      'insomnia': ['restlessness']
    };
    
    // Check for direct keyword matches
    for (const [keyword, symptoms] of Object.entries(symptomMappings)) {
      if (input.includes(keyword)) {
        symptoms.forEach(symptom => {
          if (availableSymptoms.includes(symptom) && !matchedSymptoms.includes(symptom)) {
            matchedSymptoms.push(symptom);
          }
        });
      }
    }
    
    // Also check for direct symptom name matches (with underscore format)
    availableSymptoms.forEach(symptom => {
      const symptomForMatching = symptom.replace(/_/g, ' ');
      if (input.includes(symptomForMatching) && !matchedSymptoms.includes(symptom)) {
        matchedSymptoms.push(symptom);
      }
    });
    
    return matchedSymptoms;
  } catch (error) {
    console.error('Error parsing symptoms:', error);
    // Return some common symptoms as fallback
    return ['headache', 'fatigue'];
  }
}

/**
 * @route   POST /api/symptoms/analyze
 * @desc    Analyze symptoms using AI model
 * @access  Private
 */
router.post('/analyze', auth, [
  body('symptoms')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Symptoms description must be between 10 and 1000 characters')
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

    const { symptoms } = req.body;

    // Parse natural language symptoms to AI model format
    const parsedSymptoms = await parseSymptoms(symptoms);
    
    if (parsedSymptoms.length === 0) {
      return res.status(400).json({
        message: 'No recognizable symptoms found',
        suggestion: 'Please describe your symptoms using common terms like fever, headache, cough, stomach pain, etc.'
      });
    }

    // Call AI model service
    let aiResponse;
    try {
      const response = await axios.post(`${process.env.AI_MODEL_URL}/predict`, {
        symptoms: parsedSymptoms  // Send as array now
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      aiResponse = response.data;
    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      
      // Fallback response if AI service is unavailable
      aiResponse = {
        disease: 'Service Unavailable',
        description: 'AI analysis service is currently unavailable. Please try again later or consult a healthcare professional.',
        precautions: ['Consult a healthcare professional', 'Monitor your symptoms', 'Rest and stay hydrated'],
        home_remedies: ['Rest', 'Stay hydrated', 'Monitor symptoms'],
        confidence: 0.0
      };
    }

    // Determine severity based on symptoms and disease
    const severity = determineSeverity(symptoms, aiResponse.disease);
    const consultationRecommended = severity === 'high' || severity === 'critical';

    // Create symptom query record
    const symptomQuery = new SymptomQuery({
      userId: req.user._id,
      symptoms,
      prediction: {
        disease: aiResponse.disease || 'Unknown',
        confidence: aiResponse.confidence || 0,
        description: aiResponse.description || 'No description available',
        precautions: aiResponse.precautions || [],
        homeRemedies: aiResponse.home_remedies || [],
        severity
      },
      aiResponse,
      consultationRecommended
    });

    await symptomQuery.save();

    res.json({
      message: 'Symptoms analyzed successfully',
      analysis: {
        id: symptomQuery._id,
        disease: aiResponse.disease,
        description: aiResponse.description,
        precautions: aiResponse.precautions,
        homeRemedies: aiResponse.home_remedies,
        confidence: aiResponse.confidence,
        severity,
        consultationRecommended,
        timestamp: symptomQuery.createdAt
      }
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({
      message: 'Server error during symptom analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/symptoms/history
 * @desc    Get user's symptom analysis history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const queries = await SymptomQuery.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-aiResponse'); // Exclude raw AI response for cleaner output

    const total = await SymptomQuery.countDocuments({ userId: req.user._id });

    res.json({
      message: 'Symptom history retrieved successfully',
      data: {
        queries,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get symptom history error:', error);
    res.status(500).json({
      message: 'Server error retrieving symptom history'
    });
  }
});

/**
 * @route   GET /api/symptoms/history/:id
 * @desc    Get specific symptom analysis record
 * @access  Private
 */
router.get('/history/:id', auth, async (req, res) => {
  try {
    const query = await SymptomQuery.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!query) {
      return res.status(404).json({
        message: 'Symptom analysis record not found'
      });
    }

    res.json({
      message: 'Symptom analysis record retrieved successfully',
      data: query
    });

  } catch (error) {
    console.error('Get symptom record error:', error);
    res.status(500).json({
      message: 'Server error retrieving symptom record'
    });
  }
});

/**
 * Helper function to determine symptom severity
 */
function determineSeverity(symptoms, disease) {
  const criticalKeywords = ['chest pain', 'difficulty breathing', 'severe headache', 'heart attack', 'stroke'];
  const highKeywords = ['fever', 'vomiting', 'severe pain', 'bleeding'];
  const mediumKeywords = ['headache', 'nausea', 'fatigue', 'cough'];

  const symptomsLower = symptoms.toLowerCase();
  const diseaseLower = (disease || '').toLowerCase();

  if (criticalKeywords.some(keyword => 
    symptomsLower.includes(keyword) || diseaseLower.includes(keyword)
  )) {
    return 'critical';
  }

  if (highKeywords.some(keyword => 
    symptomsLower.includes(keyword) || diseaseLower.includes(keyword)
  )) {
    return 'high';
  }

  if (mediumKeywords.some(keyword => 
    symptomsLower.includes(keyword) || diseaseLower.includes(keyword)
  )) {
    return 'medium';
  }

  return 'low';
}

module.exports = router;