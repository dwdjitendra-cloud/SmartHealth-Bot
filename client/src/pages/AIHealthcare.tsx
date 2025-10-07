import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Heart,
  Pill,
  Video,
  Brain,
  Bot,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const AIHealthcare: React.FC = () => {
  const advancedServices = [
    { 
      path: '/health-risk', 
      label: 'Health Risk Assessment', 
      icon: TrendingUp, 
      description: 'Predictive Health Analytics',
      longDescription: 'Advanced AI algorithms analyze your health data to predict potential risks and provide personalized recommendations.',
      color: 'from-red-500 to-pink-500' 
    },
    { 
      path: '/vital-signs', 
      label: 'Vital Signs Monitor', 
      icon: Heart, 
      description: 'Real-time Health Tracking',
      longDescription: 'Monitor your vital signs in real-time with IoT integration and receive instant alerts for anomalies.',
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      path: '/medications', 
      label: 'Smart Medication', 
      icon: Pill, 
      description: 'Intelligent Pill Management',
      longDescription: 'AI-powered medication tracking with dosage reminders, interaction warnings, and adherence monitoring.',
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      path: '/telemedicine', 
      label: 'Telemedicine Portal', 
      icon: Video, 
      description: 'Virtual Medical Consultations',
      longDescription: 'Connect with healthcare professionals through secure video calls with AI-assisted diagnosis support.',
      color: 'from-purple-500 to-violet-500' 
    },
    { 
      path: '/mental-health', 
      label: 'Mental Wellness', 
      icon: Brain, 
      description: 'Mood & Psychological Support',
      longDescription: 'AI-driven mental health assessment with personalized therapy recommendations and mood tracking.',
      color: 'from-indigo-500 to-purple-500' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors duration-300"
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="text-lg font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl shadow-2xl">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                AI Healthcare Suite
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of healthcare with our advanced AI-powered tools and services
            </p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {advancedServices.map(({ path, label, description, longDescription, color, icon: Icon }, index) => (
            <Link
              key={path}
              to={path}
              className="group relative overflow-hidden rounded-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 shadow-2xl hover:shadow-3xl border border-white/20 hover:border-white/40 backdrop-blur-lg"
              style={{
                animationDelay: `${index * 200}ms`,
              }}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${color}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
              
              {/* Floating Particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <Sparkles className="absolute top-6 left-6 h-4 w-4 text-yellow-400 animate-pulse" />
                <Sparkles className="absolute top-12 right-8 h-3 w-3 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute bottom-8 left-8 h-2 w-2 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
                <Sparkles className="absolute bottom-12 right-6 h-3 w-3 text-pink-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
              </div>
              
              <div className="relative p-8 flex flex-col items-center text-center space-y-6 h-full">
                {/* Icon Container */}
                <div className={`relative p-6 rounded-3xl transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-12 bg-gradient-to-br ${color} shadow-2xl`}>
                  <Icon className="h-12 w-12 text-white" />
                  
                  {/* Glowing Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${color}/60 blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse opacity-0 group-hover:opacity-100`}></div>
                </div>
                
                {/* Content */}
                <div className="space-y-4 flex-1">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors duration-300">
                    {label}
                  </h3>
                  <p className="text-lg font-medium text-blue-200 group-hover:text-blue-100 transition-colors duration-300">
                    {description}
                  </p>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                    {longDescription}
                  </p>
                </div>
                
                {/* Call to Action */}
                <div className={`w-full py-3 px-6 rounded-2xl bg-gradient-to-r ${color} text-white font-semibold transform transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-xl`}>
                  Explore Feature
                </div>
                
                {/* Corner Accent */}
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping`}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Bot className="h-8 w-8 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Ready to Transform Your Healthcare?</h2>
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of users who have already experienced the power of AI-driven healthcare management.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span>Get Started Now</span>
              <Sparkles className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHealthcare;