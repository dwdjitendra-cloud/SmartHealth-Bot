const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
require('dotenv').config();

const sampleDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD',
    experience: 8,
    rating: 4.8,
    consultationFee: 99,
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' }
      ]
    },
    contact: {
      phone: '+1-555-0101',
      email: 'sarah.johnson@hospital.com'
    },
    hospital: {
      name: 'City General Hospital',
      address: '123 Medical Center Dr',
      city: 'New York'
    },
    profileImage: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg',
    languages: ['English', 'Spanish'],
    consultationModes: ['video', 'audio', 'chat'],
    totalConsultations: 245
  },
  {
    name: 'Dr. Michael Chen',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD, DM Cardiology',
    experience: 12,
    rating: 4.9,
    consultationFee: 149,
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      timeSlots: [
        { start: '10:00', end: '13:00' },
        { start: '15:00', end: '18:00' }
      ]
    },
    contact: {
      phone: '+1-555-0102',
      email: 'michael.chen@cardiaccare.com'
    },
    hospital: {
      name: 'Heart Care Specialist Center',
      address: '456 Cardiac Ave',
      city: 'Los Angeles'
    },
    profileImage: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg',
    languages: ['English', 'Mandarin'],
    consultationModes: ['video', 'audio'],
    totalConsultations: 189
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialization: 'Dermatology',
    qualification: 'MBBS, MD Dermatology',
    experience: 6,
    rating: 4.7,
    consultationFee: 119,
    availability: {
      days: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [
        { start: '09:30', end: '12:30' },
        { start: '14:30', end: '17:30' }
      ]
    },
    contact: {
      phone: '+1-555-0103',
      email: 'emily.rodriguez@skincare.com'
    },
    hospital: {
      name: 'Advanced Skin Care Clinic',
      address: '789 Beauty Blvd',
      city: 'Miami'
    },
    profileImage: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg',
    languages: ['English', 'Spanish', 'Portuguese'],
    consultationModes: ['video', 'chat'],
    totalConsultations: 156
  },
  {
    name: 'Dr. James Wilson',
    specialization: 'Neurology',
    qualification: 'MBBS, MD, DM Neurology',
    experience: 15,
    rating: 4.9,
    consultationFee: 179,
    availability: {
      days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      timeSlots: [
        { start: '08:00', end: '11:00' },
        { start: '13:00', end: '16:00' }
      ]
    },
    contact: {
      phone: '+1-555-0104',
      email: 'james.wilson@neurocare.com'
    },
    hospital: {
      name: 'Neurological Institute',
      address: '321 Brain St',
      city: 'Chicago'
    },
    profileImage: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg',
    languages: ['English'],
    consultationModes: ['video', 'audio'],
    totalConsultations: 298
  },
  {
    name: 'Dr. Priya Patel',
    specialization: 'Pediatrics',
    qualification: 'MBBS, MD Pediatrics',
    experience: 9,
    rating: 4.8,
    consultationFee: 109,
    availability: {
      days: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
      timeSlots: [
        { start: '10:00', end: '13:00' },
        { start: '15:00', end: '18:00' }
      ]
    },
    contact: {
      phone: '+1-555-0105',
      email: 'priya.patel@childcare.com'
    },
    hospital: {
      name: 'Children\'s Medical Center',
      address: '654 Kids Lane',
      city: 'Houston'
    },
    profileImage: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg',
    languages: ['English', 'Hindi', 'Gujarati'],
    consultationModes: ['video', 'audio', 'chat'],
    totalConsultations: 203
  },
  {
    name: 'Dr. Robert Kim',
    specialization: 'Orthopedics',
    qualification: 'MBBS, MS Orthopedics',
    experience: 11,
    rating: 4.6,
    consultationFee: 139,
    availability: {
      days: ['Tuesday', 'Wednesday', 'Friday', 'Saturday'],
      timeSlots: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' }
      ]
    },
    contact: {
      phone: '+1-555-0106',
      email: 'robert.kim@orthocenter.com'
    },
    hospital: {
      name: 'Orthopedic Specialty Hospital',
      address: '987 Bone Ave',
      city: 'Seattle'
    },
    profileImage: 'https://images.pexels.com/photos/6749777/pexels-photo-6749777.jpeg',
    languages: ['English', 'Korean'],
    consultationModes: ['video', 'audio'],
    totalConsultations: 167
  }
];

async function seedDoctors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthealthbot');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Insert sample doctors
    await Doctor.insertMany(sampleDoctors);
    console.log(`✅ Successfully seeded ${sampleDoctors.length} doctors`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedDoctors();
}

module.exports = { seedDoctors, sampleDoctors };