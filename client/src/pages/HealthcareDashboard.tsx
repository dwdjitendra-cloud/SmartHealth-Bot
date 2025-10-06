import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Stethoscope,
  Activity,
  Bot,
  TrendingUp,
  Heart,
  Pill,
  Video,
  Brain,
  Sparkles,
  ArrowLeft,
  Shield,
  Users,
  Calendar,
  FileText
} from 'lucide-react';

const HealthcareDashboard: React.FC = () => {
  const coreFeatures = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Health Overview & Analytics',
      longDescription: 'Comprehensive health overview with personalized analytics and insights',
      color: 'from-blue-500 to-purple-500'
    },
    {
      path: '/doctors',
      label: 'Find Doctors',
      icon: Stethoscope,
      description: 'Connect with Specialists',
      longDescription: 'Search and connect with qualified healthcare specialists in your area',
      color: 'from-green-500 to-emerald-500'
    },
    {
      path: '/symptom-checker',
      label: 'Symptom Checker',
      icon: Activity,
      description: 'AI Health Assessment',
      longDescription: 'AI-powered symptom analysis with preliminary health assessments',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const aiHealthcareFeatures = [
    {
      path: '/health-risk',
      label: 'Health Risk Assessment',
      icon: TrendingUp,
      description: 'Predictive Health Analytics',
      longDescription: 'Advanced AI algorithms analyze your health data to predict potential risks',
      color: 'from-red-500 to-pink-500'
    },
    {
      path: '/vital-signs',
      label: 'Vital Signs Monitor',
      icon: Heart,
      description: 'Real-time Health Tracking',
      longDescription: 'Monitor your vital signs in real-time with IoT integration and alerts',
      color: 'from-green-500 to-emerald-500'
    },
    {
      path: '/medications',
      label: 'Smart Medication',
      icon: Pill,
      description: 'Intelligent Pill Management',
      longDescription: 'AI-powered medication tracking with dosage reminders and interactions',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      path: '/telemedicine',
      label: 'Telemedicine Portal',
      icon: Video,
      description: 'Virtual Medical Consultations',
      longDescription: 'Connect with healthcare professionals through secure video calls',
      color: 'from-purple-500 to-violet-500'
    },
    {
      path: '/mental-health',
      label: 'Mental Wellness',
      icon: Brain,
      description: 'Mood & Psychological Support',
      longDescription: 'AI-driven mental health assessment with personalized therapy recommendations',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const FeatureCard = ({ feature, index }: { feature: any; index: number }) => (
    <Link
      to={feature.path}
      className="group relative overflow-hidden rounded-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 bg-gradient-to-br from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-2xl hover:shadow-3xl border border-white/30 hover:border-white/50 backdrop-blur-lg"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <Sparkles className="absolute top-6 left-6 h-4 w-4 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute top-12 right-8 h-3 w-3 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-8 left-8 h-2 w-2 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative p-8 flex flex-col items-center text-center space-y-6 h-full">
        {/* Icon Container */}
        <div className={`relative p-6 rounded-3xl transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-12 bg-gradient-to-br ${feature.color} shadow-2xl`}>
          <feature.icon className="h-10 w-10 text-white" />
          
          {/* Glowing Effect */}
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color}/60 blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse opacity-0 group-hover:opacity-100`}></div>
        </div>
        
        {/* Content */}
        <div className="space-y-4 flex-1">
          <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
            {feature.label}
          </h3>
          <p className="text-lg font-medium text-blue-200 group-hover:text-blue-100 transition-colors duration-300">
            {feature.description}
          </p>
          <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
            {feature.longDescription}
          </p>
        </div>
        
        {/* Call to Action */}
        <div className={`w-full py-3 px-6 rounded-2xl bg-gradient-to-r ${feature.color} text-white font-semibold transform transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-xl`}>
          Access Feature
        </div>
        
        {/* Corner Accent */}
        <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping`}></div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors duration-300"
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="text-lg font-medium">Back to Home</span>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-2xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Healthcare Dashboard
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive healthcare management tools and AI-powered services
            </p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Core Healthcare Management Tools */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Core Healthcare Management</h2>
            </div>
            <p className="text-gray-300 text-lg">Essential tools for managing your health journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <FeatureCard key={feature.path} feature={feature} index={index} />
            ))}
          </div>
        </div>

        {/* AI Healthcare Suite */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">AI Healthcare Suite</h2>
            </div>
            <p className="text-gray-300 text-lg">Advanced AI-powered health tools and services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {aiHealthcareFeatures.map((feature, index) => (
              <FeatureCard key={feature.path} feature={feature} index={index + 3} />
            ))}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">50K+</div>
            <div className="text-gray-300">Active Users</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <Calendar className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">1M+</div>
            <div className="text-gray-300">Appointments</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <FileText className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">500K+</div>
            <div className="text-gray-300">Health Records</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <Bot className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-gray-300">AI Accuracy</div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Start Your Health Journey Today</h2>
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Take control of your health with our comprehensive suite of AI-powered tools and professional healthcare services.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span>Go to Dashboard</span>
              <Sparkles className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;