import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Heart, Shield, Activity, Brain, Stethoscope, User, Linkedin, X } from 'lucide-react';
import LoadingSpinner from '../../LoadingSpinner';
import { validateForm, ValidationRules, sanitizeInput } from '../utils/validation';

const Register: React.FC = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeveloperPopup, setShowDeveloperPopup] = useState(false);

  const validationRules: ValidationRules = {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, email: true },
    password: { required: true, password: true },
    confirmPassword: { required: true },
    phone: { required: true, phone: true },
    age: { required: true, age: true },
    gender: { required: true }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, validationRules);
    
    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const success = await register({
      name: formData.name.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      age: parseInt(formData.age),
      gender: formData.gender
    });

    if (success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex">
        {/* Left Side - About SmartHealthBot */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 items-center">
          <div className="text-white space-y-8">
            {/* Logo */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">SmartHealth</h1>
                  <p className="text-blue-100 text-sm">AI-Powered Healthcare</p>
                </div>
              </div>
            </div>

            {/* About Content */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-4xl font-bold leading-tight">
                  Welcome to SmartHealthBot
                </h2>
              </div>
              <p className="text-xl text-blue-100 leading-relaxed">
                Experience the future of healthcare with our advanced AI-driven platform. 
                Get personalized health insights, track vital signs, and connect with healthcare professionals.
              </p>

              {/* Features */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center space-x-3">
                  <Activity className="h-6 w-6 text-blue-200 flex-shrink-0" />
                  <span className="text-lg">Real-time health monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-blue-200 flex-shrink-0" />
                  <span className="text-lg">AI-powered symptom analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Stethoscope className="h-6 w-6 text-blue-200 flex-shrink-0" />
                  <span className="text-lg">Connect with verified doctors</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-blue-200 flex-shrink-0" />
                  <span className="text-lg">Secure & private health data</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">SmartHealth</h1>
                <p className="text-gray-600">AI-Powered Healthcare</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Welcome to SmartHealthBot</h2>
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 text-center lg:text-left">
                Create Your Account
              </h2>
              <p className="mt-2 text-gray-600 text-center lg:text-left">
                Join SmartHealthBot and start your health journey
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter 10-digit phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter your age"
                    />
                  </div>
                  {errors.age && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.age}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.gender}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="font-semibold text-blue-600 hover:text-purple-600 transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Trust Indicators */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">Trusted by thousands of healthcare professionals</p>
              <div className="flex justify-center items-center space-x-4 text-gray-400">
                <Shield className="h-4 w-4" />
                <span className="text-xs">256-bit SSL Encryption</span>
                <span className="text-xs">•</span>
                <span className="text-xs">HIPAA Compliant</span>
              </div>
            </div>

            {/* Meet the Developer - Minimalist */}
            <div className="text-center py-8">
              <button
                onClick={() => setShowDeveloperPopup(true)}
                className="text-gray-700 hover:text-blue-700 font-semibold text-sm transition-all duration-300 tracking-wide group"
              >
                <span className="text-blue-600 font-mono">&lt;</span>
                <span className="mx-2 group-hover:text-blue-600 transition-colors duration-300">Meet the Developer</span>
                <span className="text-blue-600 font-mono">/&gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Popup */}
      {showDeveloperPopup && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowDeveloperPopup(false)}
          >
            {/* Popup Content */}
            <div 
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative transform transition-all duration-300 scale-100 border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowDeveloperPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="text-center space-y-6">
                {/* Developer Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg mx-auto">
                  <span className="text-xl font-bold text-white">J</span>
                </div>
                
                {/* Developer Name */}
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    Jitendra
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">Full Stack Developer</p>
                </div>
                
                {/* LinkedIn Button */}
                <a
                  href="https://www.linkedin.com/in/dwdjitendra/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>Connect on LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Register;