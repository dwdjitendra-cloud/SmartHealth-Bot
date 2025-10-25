![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

# SmartHealthBot - AI-Powered Healthcare Application

A comprehensive full-stack healthcare application with AI-powered symptom analysis, doctor consultations, payment integration, and modern responsive UI. Built with React, Node.js, Python Flask, and MongoDB for a complete healthcare management experience.

## 🌐 Live Demo

**🚀 [View Live Application](https://smart-health-bot-ru2g.vercel.app/)**

Experience the SmartHealthBot application live! The frontend is deployed and fully functional on Vercel.

[![Deployment Status](https://img.shields.io/badge/Deployment-Live-brightgreen?style=for-the-badge&logo=vercel)](https://smart-health-bot-ru2g.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue?style=for-the-badge&logo=react)](https://smart-health-bot-ru2g.vercel.app/)
[![Platform](https://img.shields.io/badge/Platform-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

## 👨‍💻 Developer

**Jitendra Kumar Dodwadiya**  
📧 Email: [jitendrakumar637587@gmail.com](mailto:jitendrakumar637587@gmail.com)  
🌐 Portfolio: [dwdjitendra-portfolio.vercel.app](https://dwdjitendra-portfolio.vercel.app/)  
💼 LinkedIn: [dwdjitendra](https://www.linkedin.com/in/dwdjitendra/)  
🚀 Full-Stack Developer specializing in MERN Stack & AI/ML Integration

## 🚀 Quick Start

### 🌐 Try the Live Application
**[🔗 SmartHealthBot Live Demo](https://smart-health-bot-ru2g.vercel.app/)**

### 💻 Local Development Setup

#### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- MongoDB (local or cloud)

### Option 1: Automatic Setup (Windows)
```powershell
# Run the PowerShell startup script
./start-services.ps1
```

### Option 2: Manual Setup

#### 1. Start AI Model Service
```bash
cd ai-model
pip install -r requirements.txt
python app.py
```
The AI model will be available at `http://localhost:5000`

#### 2. Start Backend Server
```bash
cd server
npm install
npm run dev
```
The server will be available at `http://localhost:5001`

#### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
The client will be available at `http://localhost:5173`

## ✅ Recent Updates & Fixes Applied

- ✅ **Enhanced UI/UX**: Converted dashboard and components to clean white theme for better visibility
- ✅ **Fixed Navigation**: Implemented proper profile dropdown with click-outside detection
- ✅ **AI Service Integration**: Resolved port conflicts and improved AI model connectivity (Python Flask on port 5000)
- ✅ **Professional Branding**: Added elegant "Meet the Developer" sections with minimalist popup design
- ✅ **Code Quality**: Cleaned up unused imports, fixed TypeScript errors, and improved code organization
- ✅ **PowerShell Integration**: Created automated service startup script with proper error handling
- ✅ **Responsive Design**: Enhanced mobile-first design with professional styling and proper contrast ratios
- ✅ **Authentication Flow**: Improved login/logout functionality with protected routes
- ✅ **Python Dependencies**: Fixed compatibility for Python 3.13 and resolved package conflicts
- ✅ **Database Integration**: Resolved Mongoose warnings and optimized MongoDB connections
- ✅ **Security Enhancements**: Updated npm dependencies and resolved security vulnerabilities

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smarthealthbot
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
AI_MODEL_URL=http://localhost:5000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5001/api
VITE_AI_MODEL_URL=http://localhost:5000
```

## 🚀 Features

### Core Healthcare Features
- **🤖 AI Symptom Checker**: Advanced machine learning model for accurate symptom analysis and disease prediction
- **👨‍⚕️ Doctor Consultation**: Connect with certified healthcare professionals across specializations
- **💳 Payment Integration**: Secure Razorpay integration for seamless consultation fee processing
- **📋 Health Records**: Comprehensive health history tracking and symptom monitoring
- **📱 Responsive Design**: Mobile-first responsive UI with professional white theme
- **🔐 Secure Authentication**: JWT-based authentication with protected routes and profile management

### Advanced UI/UX Features
- **🎨 Professional Design**: Clean white theme with optimal contrast ratios for better accessibility
- **🏠 Interactive Dashboard**: Comprehensive health dashboard with navigation cards and statistics
- **👤 Profile Management**: Enhanced profile dropdown with smooth animations and click-outside detection
- **📱 Mobile Optimization**: Fully responsive design that works seamlessly across all devices
- **✨ Developer Attribution**: Professional "Meet the Developer" sections with LinkedIn integration
- **🎯 Modern Navigation**: Intuitive sidebar navigation with proper active states and routing

### AI/ML Capabilities
- **🧠 Disease Prediction**: ML-powered disease prediction based on symptom descriptions
- **📝 Natural Language Processing**: Advanced NLP for symptom analysis and interpretation
- **📊 Confidence Scoring**: Accurate confidence scores for AI predictions and recommendations
- **🎯 Personalized Recommendations**: Tailored health recommendations based on user symptoms
- **⚖️ Symptom Severity Assessment**: Intelligent severity analysis for better health insights

## 🏗️ Architecture

```
SmartHealthBot/
├── client/                 # React.js Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Express.js Backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Server utilities
├── ai-model/             # Python Flask AI Service
│   ├── data/            # Training datasets
│   ├── app.py           # Flask application
│   └── requirements.txt # Python dependencies
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React.js 18.3.1** - Modern UI framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing and navigation
- **Lucide React** - Beautiful icon library for modern UI
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript for better development experience

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing and security

### AI/ML Service
- **Python Flask** - Lightweight web framework for AI service
- **Scikit-learn** - Machine learning library for disease prediction
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing for ML operations
- **Natural Language Processing** - Text analysis and symptom interpretation

### Payment & External Services
- **Razorpay** - Payment gateway for secure transactions
- **MongoDB Atlas** - Cloud database hosting
- **PowerShell Automation** - Service management and deployment scripts

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or Atlas)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/dwdjitendra-cloud/SmartHealth-Bot.git
cd SmartHealth-Bot
```

### 2. Install Dependencies

#### Install all dependencies at once:
```bash
npm run install-all
```

#### Or install manually:

**Root dependencies:**
```bash
npm install
```

**Frontend dependencies:**
```bash
cd client
npm install
cd ..
```

**Backend dependencies:**
```bash
cd server
npm install
cd ..
```

**AI Model dependencies:**
```bash
cd ai-model
pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration

#### Backend Environment (.env)
Create `server/.env` file:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smarthealthbot

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# AI Model Service
AI_MODEL_URL=http://localhost:5000

# Razorpay Configuration (Demo)
RAZORPAY_KEY_ID=rzp_test_demo_key
RAZORPAY_KEY_SECRET=demo_secret_key

# CORS Origin
CLIENT_URL=http://localhost:5173
```

### 4. Database Setup

#### MongoDB Atlas Setup:
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get the connection string
5. Replace the MONGODB_URI in your .env file

#### Seed Sample Data:
```bash
cd server
node utils/seedDoctors.js
```

### 5. Start the Application

#### Quick Start (Windows - Recommended):
```powershell
# Use the automated startup script
./start-services.ps1
```

#### Development Mode (All services):
```bash
npm run dev
```

#### Or start services individually:

**AI Model Service (Port 5000):**
```bash
cd ai-model
python app.py
```

**Backend Server (Port 5001):**
```bash
cd server
npm run dev
```

**Frontend Client (Port 5173):**
```bash
cd client
npm run dev
```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Symptom Analysis Endpoints
- `POST /api/symptoms/analyze` - Analyze symptoms
- `GET /api/symptoms/history` - Get symptom history
- `GET /api/symptoms/history/:id` - Get specific record

### Payment Endpoints
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors/search` - Search doctors

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/health-summary` - Get health summary

## 🧪 Testing

### API Testing with Postman/Thunder Client

#### Sample Requests:

**Register User:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "age": 30
}
```

**Analyze Symptoms:**
```json
POST /api/symptoms/analyze
Authorization: Bearer <token>
{
  "symptoms": "I have a headache, fever, and body aches for the past 2 days"
}
```

**Create Payment Order:**
```json
POST /api/payments/create-order
Authorization: Bearer <token>
{
  "amount": 99,
  "currency": "INR",
  "description": "Doctor Consultation Fee"
}
```

## 🚀 Deployment

### ✅ Frontend Deployment (Vercel) - LIVE
**🌐 Live URL**: [https://smart-health-bot-ru2g.vercel.app/](https://smart-health-bot-ru2g.vercel.app/)

The frontend is successfully deployed on Vercel with:
- ✅ Automatic deployments from GitHub
- ✅ HTTPS enabled
- ✅ Global CDN distribution
- ✅ Optimized React build
- ✅ Production environment variables configured

### ✅ Backend Deployment (Render) - LIVE
**🔧 Backend URL**: [https://smarthealth-bot-server.onrender.com](https://smarthealth-bot-server.onrender.com)

The backend service is successfully deployed on Render with:
- ✅ Node.js 22.16.0 with Express server
- ✅ MongoDB Atlas connection configured
- ✅ All API endpoints active
- ✅ CORS configured for frontend integration

### ✅ AI Model Deployment (Render) - LIVE
**🤖 AI Model URL**: [https://smarthealth-bot-ai-model.onrender.com](https://smarthealth-bot-ai-model.onrender.com)

The AI model service is successfully deployed on Render with:
- ✅ Python 3.13.4 with compatible pandas/numpy
- ✅ Flask API with CORS configured
- ✅ Machine learning models loaded
- ✅ Symptom analysis endpoints active

### 🏗️ Production Architecture

```
Frontend (Vercel)     ←→     Backend (Render)     ←→     AI Model (Render)
React + TypeScript             Node.js + Express           Python + Flask
smart-health-bot-             smarthealth-bot-            smarthealth-bot-
ru2g.vercel.app              server.onrender.com         ai-model.onrender.com
        ↓                            ↓
Environment Variables         MongoDB Atlas
- VITE_API_URL               (Cloud Database)
- VITE_AI_MODEL_URL          - Users
- VITE_RAZORPAY_KEY_ID       - Doctors
                             - Payments
                             - Symptoms
```

### 🔗 Service Endpoints

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://smart-health-bot-ru2g.vercel.app/ | 🟢 Live |
| **Backend API** | https://smarthealth-bot-server.onrender.com/api | 🟢 Live |
| **AI Model** | https://smarthealth-bot-ai-model.onrender.com | 🟢 Live |
| **Database** | MongoDB Atlas | 🟢 Connected |

### 🚀 Deployment Instructions

**To deploy your own instance:**
1. Build the frontend:
```bash
cd client
npm run build
```
2. Deploy the `dist` folder to Vercel or your hosting service
3. Set environment variables for API endpoints

### ✅ AI Model Deployment (Render) - LIVE
**🤖 AI Model URL**: [https://smarthealth-bot-ai-model.onrender.com](https://smarthealth-bot-ai-model.onrender.com)

The AI model service is successfully deployed on Render with:
- ✅ Python 3.13.4 with compatible pandas/numpy
- ✅ Flask API with CORS configured
- ✅ Machine learning models loaded
- ✅ Symptom analysis endpoints active

### ✅ Backend Deployment (Render) - LIVE
**🔧 Backend URL**: [https://smarthealth-bot-server.onrender.com](https://smarthealth-bot-server.onrender.com)

The backend service is successfully deployed on Render with:
- ✅ Node.js 22.16.0 with Express server
- ✅ All dependencies installed successfully
- ✅ Connected to AI model service
- ⚠️ **Needs MongoDB Atlas configuration** (add MONGODB_URI environment variable)

### 🔧 Final Configuration Steps
1. **Set up MongoDB Atlas** and add connection string to Render environment variables
2. **Update Vercel frontend** environment variables with backend URL
3. **Test full end-to-end functionality**

## 📱 Usage Guide

### For End Users

1. **Registration/Login**
   - Create an account with email and password
   - Complete your profile with health information

2. **Symptom Analysis**
   - Navigate to Symptom Checker
   - Describe your symptoms in detail
   - Review AI analysis and recommendations

3. **Doctor Consultation**
   - Browse available doctors
   - Filter by specialization
   - Pay consultation fee
   - Connect via video/audio/chat

4. **Health Records**
   - View your symptom history
   - Track consultation records
   - Monitor health trends

### For Developers

1. **Adding New Features**
   - Follow the existing code structure
   - Add proper validation and error handling
   - Update API documentation

2. **Modifying AI Model**
   - Update training data in `ai-model/data/`
   - Retrain model using `/train` endpoint
   - Test predictions with `/predict` endpoint

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **Input Validation** - Express-validator middleware
- **Rate Limiting** - API request throttling
- **CORS Protection** - Cross-origin security
- **Helmet.js** - Security headers

## 🤝 Contributing

We welcome contributions to improve SmartHealthBot! Here's how you can contribute:

1. **Fork the repository** on GitHub
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper code formatting and comments
4. **Add tests** if applicable and ensure existing tests pass
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Submit a pull request** with a clear description of your changes

### Development Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add proper TypeScript types for new features
- Test your changes thoroughly before submitting
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Contact

For support, questions, or collaboration opportunities:

**Developer Contact:**
- 📧 **Email**: [jitendrakumar637587@gmail.com](mailto:jitendrakumar637587@gmail.com)
- 🌐 **Portfolio**: [dwdjitendra-portfolio.vercel.app](https://dwdjitendra-portfolio.vercel.app/)
- 💼 **LinkedIn**: [dwdjitendra](https://www.linkedin.com/in/dwdjitendra/)
- 🐛 **Issues**: Create an issue on [GitHub Issues](https://github.com/dwdjitendra-cloud/SmartHealth-Bot/issues)
- 📖 **Documentation**: [Project Wiki](https://github.com/dwdjitendra-cloud/SmartHealth-Bot/wiki)

### Quick Response Times
- **Bug Reports**: Usually within 24-48 hours
- **Feature Requests**: Reviewed weekly
- **Pull Requests**: Reviewed within 2-3 business days
- **General Questions**: Response within 1-2 business days

## 🙏 Acknowledgments

Special thanks to the following resources and communities that made this project possible:

- **🤖 Kaggle Community** - For the comprehensive disease symptom datasets and ML resources
- **📸 Pexels & Unsplash** - For high-quality stock photos and healthcare imagery
- **⚛️ React Community** - For excellent documentation and community support
- **🍃 MongoDB** - For reliable database services and Atlas cloud hosting
- **💳 Razorpay** - For seamless payment integration and developer-friendly APIs
- **🐍 Python Community** - For machine learning libraries and Flask framework
- **🎨 Tailwind CSS** - For the utility-first CSS framework enabling rapid UI development
- **💡 Open Source Community** - For the countless libraries and tools that power this application

### Special Recognition
- **Healthcare Professionals** - For insights into medical workflow requirements
- **Beta Testers** - For valuable feedback during development phases
- **Open Source Contributors** - For improving the codebase through pull requests and issues

---

## ⚠️ Medical Disclaimer

**Important Notice**: This application is designed for **educational and demonstration purposes only**. 

### Legal Disclaimer
- 🚫 **Not a Medical Device**: This software is not intended to be a medical device or diagnostic tool
- 👨‍⚕️ **Professional Consultation Required**: Always consult with qualified healthcare professionals for medical concerns
- 🔬 **No Medical Advice**: The AI predictions and recommendations should not be considered as professional medical advice
- 📋 **Emergency Situations**: In case of medical emergencies, contact emergency services immediately
- ⚖️ **Limitation of Liability**: The developers are not responsible for any medical decisions based on this application

### Recommended Use
- ✅ Educational learning about healthcare technology
- ✅ Technology demonstration and portfolio showcase
- ✅ Understanding AI/ML applications in healthcare
- ✅ Learning about full-stack development patterns

---

**Built with ❤️ by [Jitendra Kumar](https://www.linkedin.com/in/dwdjitendra/) | Connect for collaboration opportunities!**
