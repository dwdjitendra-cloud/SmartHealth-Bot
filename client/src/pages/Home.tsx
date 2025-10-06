import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Award,
  ArrowRight,
  CheckCircle,
  Linkedin,
  X
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [showDeveloperPopup, setShowDeveloperPopup] = useState(false);

  const stats = [
    { number: '10,000+', label: 'Happy Users' },
    { number: '500+', label: 'Expert Doctors' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Support' }
  ];

  const benefits = [
    'Instant symptom analysis with AI',
    'Connect with certified doctors',
    'Secure payment processing',
    'Complete health history tracking',
    'Mobile-responsive design',
    'Affordable consultation fees'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your AI-Powered
              <span className="text-blue-600 block">Health Assistant</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get instant symptom analysis, connect with expert doctors, and take control 
              of your health with our comprehensive healthcare platform.
            </p>
            
            {user ? (
              <div className="flex justify-center">
                <p className="text-lg text-gray-600 bg-green-50 border border-green-200 px-6 py-4 rounded-lg">
                  Welcome back! Use the navigation menu to access your dashboard and health tools.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need for Better Health
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our comprehensive platform combines cutting-edge AI technology with 
                human expertise to provide you with the best healthcare experience.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Healthcare professional using technology"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Certified Platform</div>
                    <div className="text-sm text-gray-600">Healthcare Approved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust SmartHealthBot for their healthcare needs.
          </p>
          
          {!user && (
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              Start Your Health Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Meet the Developer - Minimalist */}
      <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 border-t border-gray-100">
        <button
          onClick={() => setShowDeveloperPopup(true)}
          className="text-gray-700 hover:text-blue-700 font-semibold text-lg transition-all duration-300 tracking-wide group"
        >
          <span className="text-blue-600 font-mono">&lt;</span>
          <span className="mx-2 group-hover:text-blue-600 transition-colors duration-300">Meet the Developer</span>
          <span className="text-blue-600 font-mono">/&gt;</span>
        </button>
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

export default Home;