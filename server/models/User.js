const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age cannot exceed 120']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  // Enhanced health tracking fields
  weight: {
    type: Number,
    min: [20, 'Weight must be at least 20 kg'],
    max: [300, 'Weight cannot exceed 300 kg']
  },
  height: {
    type: Number,
    min: [50, 'Height must be at least 50 cm'],
    max: [250, 'Height cannot exceed 250 cm']
  },
  bmi: {
    type: Number,
    min: [10, 'BMI must be at least 10'],
    max: [50, 'BMI cannot exceed 50']
  },
  smoking: {
    type: Boolean,
    default: false
  },
  alcohol_consumption: {
    type: Boolean,
    default: false
  },
  exercise_frequency: {
    type: Number,
    min: [0, 'Exercise frequency cannot be negative'],
    max: [7, 'Exercise frequency cannot exceed 7 days per week'],
    default: 3
  },
  family_history: [{
    type: String,
    enum: ['diabetes', 'hypertension', 'heart_disease', 'cancer', 'stroke', 'obesity', 'mental_health']
  }],
  chronic_conditions: [{
    type: String,
    enum: ['diabetes', 'hypertension', 'asthma', 'arthritis', 'depression', 'anxiety', 'heart_disease']
  }],
  last_health_assessment: {
    date: Date,
    risk_score: Number,
    risk_level: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    priority_areas: [String]
  },
  health_assessments: [{
    date: { type: Date, default: Date.now },
    risk_score: Number,
    risk_level: String,
    priority_areas: [String],
    recommendations: [String]
  }],
  vital_signs: [{
    date: { type: Date, default: Date.now },
    blood_pressure: {
      systolic: Number,
      diastolic: Number
    },
    heart_rate: Number,
    temperature: Number,
    weight: Number,
    notes: String
  }],
  // Enhanced vital signs monitoring with wearable device simulation
  vitalSignsHistory: [{
    timestamp: { type: Date, default: Date.now },
    heart_rate: {
      type: Number,
      min: [30, 'Heart rate too low'],
      max: [220, 'Heart rate too high']
    },
    blood_pressure_systolic: {
      type: Number,
      min: [70, 'Systolic BP too low'],
      max: [250, 'Systolic BP too high']
    },
    blood_pressure_diastolic: {
      type: Number,
      min: [40, 'Diastolic BP too low'],
      max: [150, 'Diastolic BP too high']
    },
    temperature: {
      type: Number,
      min: [32.0, 'Temperature too low'],
      max: [45.0, 'Temperature too high']
    },
    oxygen_saturation: {
      type: Number,
      min: [70, 'Oxygen saturation too low'],
      max: [100, 'Oxygen saturation too high']
    },
    steps: {
      type: Number,
      min: [0, 'Steps cannot be negative'],
      max: [100000, 'Steps too high'],
      default: 0
    },
    calories_burned: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      max: [10000, 'Calories too high'],
      default: 0
    },
    sleep_hours: {
      type: Number,
      min: [0, 'Sleep hours cannot be negative'],
      max: [24, 'Sleep hours cannot exceed 24'],
      default: 0
    },
    stress_level: {
      type: Number,
      min: [1, 'Stress level minimum is 1'],
      max: [10, 'Stress level maximum is 10']
    }
  }],
  // Additional health metrics
  smokingStatus: {
    type: String,
    enum: ['never', 'former', 'smoker'],
    default: 'never'
  },
  exerciseFrequency: {
    type: Number,
    min: [0, 'Exercise frequency cannot be negative'],
    max: [7, 'Exercise frequency cannot exceed 7 days per week'],
    default: 3
  },
  // Medication management
  medications: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    generic_name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { 
      type: String, 
      enum: ['once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'every_6_hours', 'every_8_hours', 'every_12_hours', 'bedtime', 'morning', 'with_meals', 'as_needed'],
      required: true 
    },
    times: [{ type: String }], // Array of time strings like ["08:00", "20:00"]
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    instructions: { type: String, default: '' },
    prescribing_doctor: { type: String, default: '' },
    refills_remaining: { type: Number, min: 0, default: 0 },
    quantity: { type: Number, min: 1, default: 30 },
    status: { 
      type: String, 
      enum: ['active', 'paused', 'discontinued', 'completed'],
      default: 'active' 
    },
    side_effects: [{ type: String }],
    condition_treated: { type: String, default: '' }
  }],
  // Medication history and adherence tracking
  medicationHistory: [{
    medication_id: { type: String, required: true },
    medication_name: { type: String, required: true },
    dosage: { type: String, required: true },
    scheduled_time: { type: Date, required: true },
    taken_time: { type: Date },
    taken: { type: Boolean, default: false },
    missed: { type: Boolean, default: false },
    notes: { type: String, default: '' }
  }],
  // Medication reminders settings
  medicationReminderSettings: {
    enabled: { type: Boolean, default: true },
    advance_notification_minutes: { type: Number, default: 15 },
    missed_dose_followup_minutes: { type: Number, default: 30 },
    refill_reminder_days: { type: Number, default: 7 }
  },
  // Telemedicine appointments
  telemedicineAppointments: [{
    appointmentId: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    consultationType: { 
      type: String, 
      enum: ['video', 'audio', 'chat'],
      default: 'video' 
    },
    status: { 
      type: String, 
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled' 
    },
    symptoms: { type: String, default: '' },
    notes: { type: String, default: '' },
    bookedAt: { type: Date, default: Date.now },
    rescheduledAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    roomId: { type: String, default: '' }
  }],
  // Consultation history
  consultationHistory: [{
    consultationId: { type: String, required: true },
    appointmentId: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true },
    consultationDate: { type: Date, required: true },
    duration: { type: Number, default: 0 }, // in minutes
    consultationType: { 
      type: String, 
      enum: ['video', 'audio', 'chat'],
      default: 'video' 
    },
    symptoms: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    prescription: { type: String, default: '' },
    followUpNeeded: { type: Boolean, default: false },
    followUpDate: { type: Date },
    notes: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String, default: '' },
    completedAt: { type: Date, default: Date.now }
  }],
  // Mental Health Data
  mentalHealthData: {
    moodEntries: [{
      entryId: { type: String, required: true },
      moodRating: { type: Number, min: 1, max: 10, required: true },
      stressLevel: { type: Number, min: 1, max: 10, required: true },
      anxietyLevel: { type: Number, min: 1, max: 10, required: true },
      energyLevel: { type: Number, min: 1, max: 10, required: true },
      sleepQuality: { type: Number, min: 1, max: 10, required: true },
      notes: { type: String, default: '' },
      trackedAt: { type: Date, default: Date.now }
    }],
    assessments: [{
      assessmentId: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['PHQ-9', 'GAD-7'],
        required: true 
      },
      score: { type: Number, required: true },
      severity: { 
        type: String, 
        enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe'],
        required: true 
      },
      suicidalRisk: { type: Boolean, default: false },
      completedAt: { type: Date, default: Date.now }
    }],
    mindfulnessSessions: [{
      sessionId: { type: String, required: true },
      exerciseName: { type: String, required: true },
      durationCompleted: { type: Number, required: true }, // in minutes
      rating: { type: Number, min: 1, max: 5, required: true },
      notes: { type: String, default: '' },
      completedAt: { type: Date, default: Date.now }
    }],
    preferences: {
      reminderEnabled: { type: Boolean, default: true },
      reminderTime: { type: String, default: '19:00' }, // 7 PM default
      crisisContactsNotified: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);