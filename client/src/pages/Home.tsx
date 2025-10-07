import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Award,
  ArrowRight,
  CheckCircle,
  Linkedin,
  X,
  Heart,
  Shield,
  Activity,
  Users,
  Stethoscope,
  Bot,
  Star,
  Clock,
  Globe,
  User
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [showDeveloperPopup, setShowDeveloperPopup] = useState(false);

  const stats = [
    { number: '10,000+', label: 'Happy Patients', icon: Users },
    { number: '500+', label: 'Expert Doctors', icon: Stethoscope },
    { number: '95%', label: 'Accuracy Rate', icon: Shield },
    { number: '24/7', label: 'AI Support', icon: Clock }
  ];

  const features = [
    {
      icon: Bot,
      title: 'AI Symptom Analysis',
      description: 'Get instant, accurate symptom analysis powered by advanced AI technology',
      color: 'from-healthcare-primary-500 to-healthcare-primary-700'
    },
    {
      icon: Stethoscope,
      title: 'Expert Doctors',
      description: 'Connect with certified healthcare professionals for virtual consultations',
      color: 'from-healthcare-accent-500 to-healthcare-accent-700'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security measures',
      color: 'from-healthcare-warning-500 to-healthcare-warning-700'
    },
    {
      icon: Activity,
      title: 'Health Monitoring',
      description: 'Track vital signs, medications, and health progress over time',
      color: 'from-healthcare-danger-500 to-healthcare-danger-700'
    }
  ];

  const benefits = [
    'Instant symptom analysis with AI',
    'Connect with certified doctors',
    'Secure payment processing',
    'Complete health history tracking',
    'Mobile-responsive design',
    'Affordable consultation fees'
  ];

  const testimonials = [
    {
      name: 'Pookie',
      role: 'Patient',
      content: 'SmartHealthBot helped me get quick answers about my symptoms and connected me with the right doctor immediately.',
      rating: 5
    },
    {
      name: 'Dr. Ganesh Singh',
      role: 'Cardiologist',
      content: 'The AI-powered platform makes remote consultations more efficient and accurate than ever before.',
      rating: 5
    },
    {
      name: 'Abhilasha',
      role: 'Working Mom',
      content: 'Being able to check symptoms and consult doctors from home has been a game-changer for our family.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-healthcare-neutral-50">
      {/* Hero Section */}
      <section className="gradient-healthcare section-padding">
        <div className="container-healthcare">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-healthcare-primary-700 mb-6 shadow-soft">
              <Heart className="h-4 w-4 mr-2 text-healthcare-accent-500" />
              Trusted by 10,000+ patients worldwide
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-healthcare-neutral-900 mb-6 leading-tight">
              Your AI-Powered
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                Health Assistant
              </span>
            </h1>
            
            <p className="text-xl text-healthcare-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience the future of healthcare with instant symptom analysis, expert doctor consultations, 
              and comprehensive health monitoring — all in one intelligent platform.
            </p>
            
            {user ? (
              <div className="healthcare-card max-w-md mx-auto">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-heading font-semibold text-healthcare-neutral-900">Welcome back, {user.name}!</h3>
                    <p className="text-sm text-healthcare-neutral-600">Ready to manage your health?</p>
                  </div>
                </div>
                <Link 
                  to="/healthcare-dashboard"
                  className="btn-primary w-full"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/register"
                  className="btn-primary btn-lg group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary btn-lg"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding-sm bg-white">
        <div className="container-healthcare">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-heading font-bold text-healthcare-neutral-900 mb-2">{stat.number}</div>
                  <div className="text-healthcare-neutral-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-healthcare">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-healthcare-neutral-900 mb-6">
              Everything you need for
              <span className="text-healthcare-primary-600 block">better health</span>
            </h2>
            <p className="text-xl text-healthcare-neutral-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with human expertise 
              to deliver personalized healthcare solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="healthcare-card group hover:scale-105 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-healthcare-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-healthcare-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-white">
        <div className="container-healthcare">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-healthcare-neutral-900 mb-6">
                Everything you need for
                <span className="text-healthcare-primary-600 block">comprehensive care</span>
              </h2>
              <p className="text-lg text-healthcare-neutral-600 mb-8 leading-relaxed">
                Our platform combines cutting-edge AI technology with human expertise 
                to provide you with the most comprehensive healthcare experience.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center group">
                    <div className="w-6 h-6 bg-healthcare-accent-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-healthcare-accent-200 transition-colors duration-200">
                      <CheckCircle className="h-4 w-4 text-healthcare-accent-600" />
                    </div>
                    <span className="text-healthcare-neutral-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/register" className="btn-primary group">
                Start Your Health Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="relative">
              <div className="healthcare-card p-0 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Healthcare professional using technology"
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-healthcare-neutral-900">Award Winning</h4>
                      <p className="text-sm text-healthcare-neutral-600">Best Healthcare Platform 2024</p>
                    </div>
                  </div>
                  <p className="text-healthcare-neutral-600">
                    Recognized for excellence in AI-powered healthcare solutions and patient care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding gradient-healthcare">
        <div className="container-healthcare">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-healthcare-neutral-900 mb-6">
              What our users say
            </h2>
            <p className="text-xl text-healthcare-neutral-600 max-w-3xl mx-auto">
              Join thousands of satisfied patients and healthcare providers who trust SmartHealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="healthcare-card group hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-healthcare-warning-500 fill-current" />
                  ))}
                </div>
                <p className="text-healthcare-neutral-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-healthcare-neutral-900">{testimonial.name}</h4>
                    <p className="text-sm text-healthcare-neutral-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-healthcare-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-healthcare-primary-800 to-healthcare-primary-900"></div>
        <div className="container-healthcare relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to transform your health?
            </h2>
            <p className="text-xl text-healthcare-primary-100 mb-10 leading-relaxed">
              Join thousands of users who are already experiencing better health outcomes 
              with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="bg-white text-healthcare-primary-700 hover:bg-healthcare-neutral-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/doctors"
                className="border-2 border-white text-white hover:bg-white hover:text-healthcare-primary-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center justify-center"
              >
                <Stethoscope className="mr-2 h-5 w-5" />
                Find a Doctor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Credits */}
      <div className="text-center py-8 bg-white border-t border-healthcare-neutral-200">
        <button
          onClick={() => setShowDeveloperPopup(true)}
          className="text-healthcare-neutral-500 hover:text-healthcare-primary-600 text-sm font-medium transition-colors duration-200"
        >
          Meet the Developer
        </button>
      </div>

      {/* Developer Popup */}
      {showDeveloperPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="healthcare-card max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-healthcare-neutral-900">About the Developer</h3>
              <button
                onClick={() => setShowDeveloperPopup(false)}
                className="text-healthcare-neutral-500 hover:text-healthcare-neutral-700 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-xl font-heading font-bold text-healthcare-neutral-900 mb-2">Jitendra</h4>
              <p className="text-healthcare-neutral-600">Full Stack Developer</p>
            </div>
            <p className="text-healthcare-neutral-700 text-center mb-6 leading-relaxed">
              Passionate about creating innovative healthcare solutions that improve lives. 
              SmartHealthBot combines AI technology with user-centered design to make healthcare more accessible.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://www.linkedin.com/in/dwdjitendra/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary btn-sm group"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </a>
              <a 
                href="https://dwdjitendra-portfolio.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary btn-sm group"
              >
                <Globe className="h-4 w-4 mr-2" />
                Portfolio
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;