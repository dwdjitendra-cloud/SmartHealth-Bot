// Configuration for API endpoints
// This file is included in the build and ensures proper API configuration

const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://smarthealth-bot.onrender.com/api',
  AI_MODEL_URL: import.meta.env.VITE_AI_MODEL_URL || 'https://smarthealth-bot-ai-model.onrender.com',
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RQJwvuqXlq4sL6',
  
  // Development vs Production detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;