const mongoose = require('mongoose');

const symptomQuerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms description is required'],
    trim: true,
    maxlength: [1000, 'Symptoms description cannot exceed 1000 characters']
  },
  prediction: {
    disease: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    description: String,
    precautions: [String],
    homeRemedies: [String],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'reviewed'],
    default: 'analyzed'
  },
  consultationRecommended: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  notes: String
}, {
  timestamps: true
});

// Index for faster queries
symptomQuerySchema.index({ userId: 1, createdAt: -1 });
symptomQuerySchema.index({ 'prediction.disease': 1 });

module.exports = mongoose.model('SymptomQuery', symptomQuerySchema);