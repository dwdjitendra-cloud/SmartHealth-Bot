const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'General Medicine',
      'Cardiology',
      'Dermatology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Gynecology',
      'ENT',
      'Ophthalmology',
      'Gastroenterology',
      'Endocrinology'
    ]
  },
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true,
    min: [0, 'Experience cannot be negative']
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  consultationFee: {
    type: Number,
    required: true,
    default: 99
  },
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      start: String,
      end: String
    }]
  },
  contact: {
    phone: String,
    email: String
  },
  hospital: {
    name: String,
    address: String,
    city: String
  },
  profileImage: {
    type: String,
    default: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg'
  },
  languages: [String],
  consultationModes: [{
    type: String,
    enum: ['video', 'audio', 'chat'],
    default: 'video'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  totalConsultations: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
doctorSchema.index({ specialization: 1, isActive: 1 });
doctorSchema.index({ name: 'text', specialization: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);