# SmartHealthBot - AI-Powered Healthcare Application

A comprehensive MERN-based healthcare application with AI-powered symptom analysis, doctor consultations, and payment integration.

## 🚀 Features

### Core Features
- **AI Symptom Checker**: Advanced machine learning model for symptom analysis
- **User Authentication**: Secure JWT-based authentication system
- **Doctor Consultation**: Connect with certified healthcare professionals
- **Payment Integration**: Razorpay integration for consultation fees
- **Health Records**: Comprehensive health history tracking
- **Responsive Design**: Mobile-first responsive UI

### AI/ML Capabilities
- Disease prediction based on symptom description
- Natural language processing for symptom analysis
- Confidence scoring for predictions
- Personalized health recommendations
- Symptom severity assessment

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
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### AI/ML Service
- **Python** - Programming language
- **Flask** - Web framework
- **Scikit-learn** - Machine learning
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing

### Payment & External Services
- **Razorpay** - Payment gateway
- **MongoDB Atlas** - Cloud database

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or Atlas)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smarthealthbot.git
cd smarthealthbot
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
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smarthealthbot

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# AI Model Service
AI_MODEL_URL=http://localhost:5001

# Razorpay Configuration (Demo)
RAZORPAY_KEY_ID=rzp_test_demo_key
RAZORPAY_KEY_SECRET=demo_secret_key

# CORS Origin
CLIENT_URL=http://localhost:3000
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

#### Development Mode (All services):
```bash
npm run dev
```

#### Or start services individually:

**Frontend:**
```bash
cd client
npm start
```

**Backend:**
```bash
cd server
npm run dev
```

**AI Model Service:**
```bash
cd ai-model
python app.py
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

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend:
```bash
cd client
npm run build
```
2. Deploy the `build` folder to your hosting service

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Deploy the `server` folder
3. Ensure MongoDB Atlas is configured

### AI Model Deployment (Railway/Render)
1. Deploy the `ai-model` folder
2. Set Python runtime
3. Install requirements.txt

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

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@smarthealthbot.com
- Documentation: [Wiki](https://github.com/yourusername/smarthealthbot/wiki)

## 🙏 Acknowledgments

- **Kaggle** - For the disease symptom dataset
- **Pexels** - For stock photos
- **React Community** - For excellent documentation
- **MongoDB** - For database services
- **Razorpay** - For payment integration

---

**⚠️ Disclaimer**: This application is for educational and demonstration purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.