import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Heart, Shield, Activity, ArrowRight, Bot } from 'lucide-react';
import LoadingSpinner from '../../LoadingSpinner';
import { validateForm, ValidationRules, sanitizeInput } from '../utils/validation';

const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validationRules: ValidationRules = {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  };

  const from = location.state?.from?.pathname || '/dashboard';

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
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const success = await login(formData.email, formData.password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'test@example.com',
      password: 'test123'
    });
    setErrors({});
  };

  if (loading) {
    return <LoadingSpinner variant="heart" text="Signing you in..." />;
  }

  return (
    <div className="min-h-screen gradient-healthcare">
      <div className="min-h-screen flex">
        {/* Left Side - Healthcare Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-healthcare-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-healthcare-primary-800 to-healthcare-primary-900"></div>
          <div className="relative z-10 p-12 flex flex-col justify-center text-white">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold">SmartHealth</h1>
                <p className="text-healthcare-primary-200 text-sm">AI Healthcare Assistant</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-heading font-bold leading-tight mb-6">
                  Your Health,
                  <span className="block text-healthcare-accent-300">Intelligently Managed</span>
                </h2>
                <p className="text-xl text-healthcare-primary-100 leading-relaxed">
                  Experience personalized healthcare with AI-powered insights, expert consultations, 
                  and comprehensive health monitoring.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-healthcare-accent-500/20 rounded-xl flex items-center justify-center">
                    <Bot className="h-6 w-6 text-healthcare-accent-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Symptom Analysis</h3>
                    <p className="text-healthcare-primary-200">Instant, accurate health assessments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-healthcare-accent-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-healthcare-accent-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Health Monitoring</h3>
                    <p className="text-healthcare-primary-200">Track vitals and progress over time</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-healthcare-accent-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-healthcare-accent-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure & Private</h3>
                    <p className="text-healthcare-primary-200">Enterprise-grade data protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-healthcare">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-heading font-bold text-healthcare-neutral-900 mb-2">SmartHealth</h1>
              <p className="text-healthcare-neutral-600">AI Healthcare Assistant</p>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-heading font-bold text-healthcare-neutral-900 mb-3">
                Welcome Back
              </h2>
              <p className="text-healthcare-neutral-600">
                Sign in to access your health dashboard and continue your wellness journey.
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="healthcare-card-compact bg-healthcare-accent-50 border-healthcare-accent-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-healthcare-accent-500 rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-healthcare-accent-800">Try Demo Account</h3>
              </div>
              <div className="space-y-2 text-sm">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-healthcare-accent-200 hover:border-healthcare-accent-300 hover:bg-healthcare-accent-25 transition-colors duration-200 group"
                >
                  <span className="text-healthcare-neutral-600">📧 Email:</span>
                  <code className="text-healthcare-accent-700 font-medium bg-healthcare-accent-100 px-2 py-1 rounded group-hover:bg-healthcare-accent-200">test@example.com</code>
                </button>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-healthcare-accent-200">
                  <span className="text-healthcare-neutral-600">🔒 Password:</span>
                  <code className="text-healthcare-accent-700 font-medium bg-healthcare-accent-100 px-2 py-1 rounded">test123</code>
                </div>
                <p className="text-xs text-healthcare-accent-600 mt-2 text-center">
                  👆 Click above to auto-fill demo credentials
                </p>
              </div>
            </div>

            {/* Login Form */}
            <div className="healthcare-card">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-healthcare-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input pl-11 ${
                        errors.email ? 'border-healthcare-danger-300 bg-healthcare-danger-50' : ''
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="form-error">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-healthcare-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input pl-11 pr-11 ${
                        errors.password ? 'border-healthcare-danger-300 bg-healthcare-danger-50' : ''
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-healthcare-neutral-400 hover:text-healthcare-neutral-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-healthcare-neutral-400 hover:text-healthcare-neutral-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="form-error">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-healthcare-primary-600 focus:ring-healthcare-primary-500 border-healthcare-neutral-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-healthcare-neutral-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-healthcare-primary-600 hover:text-healthcare-primary-700 transition-colors duration-200"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      Sign in to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-healthcare-neutral-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-healthcare-primary-600 hover:text-healthcare-primary-700 transition-colors duration-200"
                  >
                    Create one now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;