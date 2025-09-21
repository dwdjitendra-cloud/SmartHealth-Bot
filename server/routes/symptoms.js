const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const SymptomQuery = require('../models/SymptomQuery');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/symptoms/test
 * @desc    Test symptoms analysis without authentication (for testing)
 * @access  Public
 */
router.post('/test', [
  body('symptoms')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Symptoms description must be between 3 and 1000 characters')
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

    // Parse symptoms from text to array (split by common delimiters)
    let symptomList;
    if (Array.isArray(symptoms)) {
      symptomList = symptoms;
    } else {
      // Convert text to array by splitting on common delimiters
      symptomList = symptoms
        .split(/[,;.\n]+/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
    }

    // Call AI model service
    let aiResponse;
    try {
      const response = await axios.post(`${process.env.AI_MODEL_URL}/predict`, {
        symptoms: symptomList
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

    res.json({
      message: 'Symptoms analyzed successfully (test mode)',
      analysis: {
        disease: aiResponse.disease,
        description: aiResponse.description,
        precautions: aiResponse.precautions,
        homeRemedies: aiResponse.home_remedies,
        confidence: aiResponse.confidence,
        severity,
        consultationRecommended,
        matched_symptoms: aiResponse.matched_symptoms,
        total_symptoms_matched: aiResponse.total_symptoms_matched,
        timestamp: new Date().toISOString()
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

    // Parse symptoms from text to array (split by common delimiters)
    let symptomList;
    if (Array.isArray(symptoms)) {
      symptomList = symptoms;
    } else {
      // Convert text to array by splitting on common delimiters
      symptomList = symptoms
        .split(/[,;.\n]+/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
    }

    // Call AI model service
    let aiResponse;
    try {
      const response = await axios.post(`${process.env.AI_MODEL_URL}/predict`, {
        symptoms: symptomList
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