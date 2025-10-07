const express = require('express');
const { query, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const { seedDoctors, sampleDoctors } = require('../utils/seedDoctors');

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Get all active doctors with filtering and pagination
 * @access  Private
 */
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('specialization').optional().trim(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    // Validate query parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { specialization, search } = req.query;

    // Build query
    let query = { isActive: true };

    if (specialization) {
      query.specialization = specialization;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { 'hospital.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const doctors = await Doctor.find(query)
      .sort({ rating: -1, totalConsultations: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Doctor.countDocuments(query);

    // Get unique specializations for filtering
    const specializations = await Doctor.distinct('specialization', { isActive: true });

    res.json({
      message: 'Doctors retrieved successfully',
      data: {
        doctors,
        specializations,
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
    console.error('Get doctors error:', error);
    res.status(500).json({
      message: 'Server error retrieving doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).select('-__v');

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found'
      });
    }

    res.json({
      message: 'Doctor retrieved successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      message: 'Server error retrieving doctor'
    });
  }
});

/**
 * @route   POST /api/doctors/search
 * @desc    Advanced doctor search
 * @access  Private
 */
router.post('/search', auth, async (req, res) => {
  try {
    const { 
      specializations = [], 
      minRating = 0, 
      maxFee = 1000,
      languages = [],
      consultationModes = [],
      availability = []
    } = req.body;

    // Build search query
    let query = { isActive: true };

    if (specializations.length > 0) {
      query.specialization = { $in: specializations };
    }

    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }

    if (maxFee < 1000) {
      query.consultationFee = { $lte: maxFee };
    }

    if (languages.length > 0) {
      query.languages = { $in: languages };
    }

    if (consultationModes.length > 0) {
      query.consultationModes = { $in: consultationModes };
    }

    if (availability.length > 0) {
      query['availability.days'] = { $in: availability };
    }

    const doctors = await Doctor.find(query)
      .sort({ rating: -1, totalConsultations: -1 })
      .limit(20)
      .select('-__v');

    res.json({
      message: 'Search completed successfully',
      data: {
        doctors,
        count: doctors.length
      }
    });

  } catch (error) {
    console.error('Doctor search error:', error);
    res.status(500).json({
      message: 'Server error during search'
    });
  }
});

/**
 * @route   POST /api/doctors/seed
 * @desc    Seed database with sample doctors (development only)
 * @access  Public
 */
router.post('/seed', async (req, res) => {
  try {
    // Check if doctors already exist
    const existingDoctors = await Doctor.countDocuments();
    
    if (existingDoctors > 0) {
      return res.json({
        message: 'Doctors already exist in database',
        count: existingDoctors
      });
    }

    // Seed the database
    await Doctor.insertMany(sampleDoctors);
    
    const count = await Doctor.countDocuments();
    
    res.json({
      message: 'Database seeded successfully with sample doctors',
      count: count
    });

  } catch (error) {
    console.error('Seed doctors error:', error);
    res.status(500).json({
      message: 'Server error during seeding',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;