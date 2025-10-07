import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './src/contexts/AuthContext';
import {
  Home,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Heart,
  Activity,
  Users,
  Stethoscope,
  Shield,
  Calendar,
  MessageCircle
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    console.log('Logout button clicked!');
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const mainNavLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/healthcare-dashboard', label: 'Dashboard', icon: Activity },
    { path: '/doctors', label: 'Find Doctors', icon: Stethoscope },
    { path: '/symptom-checker', label: 'Symptom Checker', icon: Shield },
    { path: '/vital-signs', label: 'Vital Signs', icon: Heart },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-healthcare-primary-900 backdrop-blur-lg border-b border-healthcare-primary-800 sticky top-0 z-50 shadow-soft">
        <div className="container-healthcare">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-healthcare transition-all duration-300 group-hover:scale-105">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-healthcare-accent-400 rounded-full animate-pulse-soft"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-heading font-bold text-white">SmartHealthBot</span>
                <span className="text-xs text-healthcare-primary-200 font-medium hidden sm:block">AI Healthcare Assistant</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {mainNavLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link ${isActive(path) ? 'nav-link-active' : ''}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Side - User Menu & Mobile Toggle */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-healthcare-primary-200">{user.email}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-healthcare-primary-200 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-healthcare-neutral-200/50 py-2 animate-slide-up">
                      <div className="px-4 py-3 border-b border-healthcare-neutral-200/50">
                        <p className="text-sm font-medium text-healthcare-neutral-900">{user.name}</p>
                        <p className="text-xs text-healthcare-neutral-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-healthcare-neutral-700 hover:bg-healthcare-neutral-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-healthcare-danger-600 hover:bg-healthcare-danger-50 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-colors duration-200">
                    Sign In
                  </Link>
                  <Link to="/register" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-healthcare-primary-800 border-t border-white/10 animate-slide-up">
            <div className="container-healthcare py-4">
              <div className="space-y-2">
                {mainNavLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                      isActive(path)
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;