const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testUsers = [
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    phone: '9999999999',
    age: 25,
    gender: 'male',
    isActive: true
  },
  {
    name: 'Demo User',
    email: 'demo@example.com', 
    password: 'demo123',
    phone: '8888888888',
    age: 30,
    gender: 'female',
    isActive: true
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthealthbot');
    console.log('✅ Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ 
      email: { $in: ['test@example.com', 'demo@example.com'] } 
    });
    console.log('🗑️ Cleared existing test users');

    // Create test users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Test users seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Test User: test@example.com / test123');
    console.log('Demo User: demo@example.com / demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();