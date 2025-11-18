const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { apiLimiter, sanitizeInput, securityHeaders, validateRequestSize } = require('./middleware/security');
require('dotenv').config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

// Import routes
const authRoutes = require('./routes/auth');
const symptomRoutes = require('./routes/symptoms');
const paymentRoutes = require('./routes/payments');
const doctorRoutes = require('./routes/doctors');
const dashboardRoutes = require('./routes/dashboard');
const healthRiskRoutes = require('./routes/health-risk');
const vitalSignsRoutes = require('./routes/vital-signs');
const medicationRoutes = require('./routes/medications');
const telemedicineRoutes = require('./routes/telemedicine');
const mentalHealthRoutes = require('./routes/mental-health');

const app = express();

// CORS configuration (place BEFORE any middleware that may end the request)
const allowedOrigins = (process.env.CORS_ORIGIN
  || 'http://localhost:5173,http://localhost:5174,http://localhost:3000,https://smart-health-bot.vercel.app')
  .split(',')
  .map(o => o.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (no Origin) and allowed origins
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length']
};

app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(validateRequestSize);
app.use(sanitizeInput);

// Rate limiting (after CORS so preflight is not blocked)
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthealthbot')
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health-risk', healthRiskRoutes);
app.use('/api/vital-signs', vitalSignsRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/mental-health', mentalHealthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartHealthBot API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/symptoms', 
      '/api/doctors',
      '/api/payments',
      '/api/dashboard'
    ]
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SmartHealthBot API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});