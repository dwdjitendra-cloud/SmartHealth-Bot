const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');


const router = express.Router();

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️  Razorpay credentials not configured. Payment features will be disabled.');
}


/**
 * @route   POST /api/payments/create-order
 * @desc    Create a Razorpay order for consultation payment
 * @access  Private
 */
router.post('/create-order', auth, [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom(value => value > 0)
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  body('doctorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('consultationType')
    .optional()
    .isIn(['video', 'audio', 'chat'])
    .withMessage('Invalid consultation type')
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

    const { 
      amount, 
      currency = 'INR', 
      doctorId, 
      consultationType = 'video',
      description = 'Doctor Consultation Fee'
    } = req.body;

    // Verify doctor exists if doctorId provided
    let doctor = null;
    if (doctorId) {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          message: 'Doctor not found'
        });
      }
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        doctorId: doctorId || '',
        consultationType
      }
    };

    if (!razorpay) {
      return res.status(503).json({
        message: 'Payment service not configured',
        error: 'Razorpay credentials are missing'
      });
    }

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      userId: req.user._id,
      doctorId: doctorId || null,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency,
      description,
      consultationType,
      status: 'created'
    });

    await payment.save();

    res.json({
      message: 'Payment order created successfully',
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      paymentId: payment._id,
      doctor: doctor ? {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization
      } : null
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      message: 'Server error creating payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify', auth, [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ 
      razorpayOrderId: razorpay_order_id,
      userId: req.user._id 
    }).populate('doctorId');

    if (!payment) {
      return res.status(404).json({
        message: 'Payment record not found'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'paid';
      
      // Generate consultation link (demo)
      payment.consultationLink = generateConsultationLink(payment.consultationType);
      payment.consultationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      await payment.save();

      // Update doctor's consultation count
      if (payment.doctorId) {
        await Doctor.findByIdAndUpdate(payment.doctorId._id, {
          $inc: { totalConsultations: 1 }
        });
      }

      res.json({
        message: 'Payment verified successfully',
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          consultationLink: payment.consultationLink,
          consultationDate: payment.consultationDate,
          doctor: payment.doctorId ? {
            name: payment.doctorId.name,
            specialization: payment.doctorId.specialization
          } : null
        }
      });

    } else {
      // Update payment status to failed
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      message: 'Server error during payment verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId: req.user._id })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ userId: req.user._id });

    res.json({
      message: 'Payment history retrieved successfully',
      data: {
        payments,
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
    console.error('Get payment history error:', error);
    res.status(500).json({
      message: 'Server error retrieving payment history'
    });
  }
});

/**
 * Helper function to generate demo consultation links
 */
function generateConsultationLink(type) {
  const baseUrl = 'https://meet.google.com/';
  const roomId = Math.random().toString(36).substring(2, 15);
  
  switch (type) {
    case 'video':
      return `${baseUrl}${roomId}`;
    case 'audio':
      return `${baseUrl}${roomId}?audio-only=true`;
    case 'chat':
      return `https://chat.example.com/room/${roomId}`;
    default:
      return `${baseUrl}${roomId}`;
  }
}

module.exports = router;