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
  Bot,
  Sparkles
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
    console.log('Logout button clicked!'); // Debug log
    logout();
    setIsProfileOpen(false);
    navigate('/login'); // Redirect to login page after logout
  };

  const coreNavLinks = [
    { path: '/healthcare-dashboard', label: 'Healthcare Services', icon: Home, description: 'Access All Health Features' },
    { path: '/profile', label: 'Profile', icon: User, description: 'Manage Your Account' }
  ];

  return (
    <>
      {/* Modern Vertical Sidebar for Desktop */}
      <nav className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-72 lg:bg-gradient-to-b lg:from-slate-900 lg:via-slate-800 lg:to-slate-900 lg:shadow-2xl lg:border-r lg:border-slate-700">
        {/* Elegant Logo Section */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
          <Link to="/" className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white drop-shadow-lg">SmartHealth</span>
              <span className="text-xs text-slate-300 font-medium">AI-Powered Healthcare</span>
            </div>
          </Link>
        </div>

        {/* Enhanced Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Core Navigation - Show only when logged in and not on home page */}
          {user && location.pathname !== '/' && (
            <div className="space-y-6">
              <div className="px-4 py-4 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white drop-shadow-lg uppercase tracking-wide flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <span>Quick Access</span>
                </h3>
                <p className="text-sm text-slate-300 mt-2 ml-14 font-medium">Essential navigation and account management</p>
              </div>
              
              {/* Core Features in 3D Interactive Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {coreNavLinks.map(({ path, label, description, icon: Icon }, index) => (
                  <Link
                    key={path}
                    to={path}
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                      isActive(path)
                        ? 'bg-gradient-to-br from-blue-500/60 to-purple-500/60 shadow-2xl shadow-blue-500/30 border-2 border-blue-300'
                        : 'bg-gradient-to-br from-white/10 to-gray-100/10 hover:from-white/20 hover:to-gray-100/20 shadow-xl hover:shadow-2xl border-2 border-gray-300/40 hover:border-gray-200/60'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* 3D Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Animated Border */}
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                      isActive(path) 
                        ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse' 
                        : 'bg-gradient-to-r from-transparent via-slate-500/10 to-transparent group-hover:via-slate-400/20'
                    }`}></div>
                    
                    <div className="relative p-6 flex flex-col items-center text-center space-y-4">
                      <div className={`relative p-4 rounded-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ${
                        isActive(path) 
                          ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-blue-500/50' 
                          : 'bg-gradient-to-br from-gray-600 to-gray-700 group-hover:from-blue-500 group-hover:to-purple-500 shadow-xl group-hover:shadow-2xl'
                      }`}>
                        <Icon className="h-8 w-8 text-white" />
                        
                        {/* Glowing Effect */}
                        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                          isActive(path) 
                            ? 'bg-gradient-to-br from-blue-400/50 to-purple-400/50 blur-md animate-pulse' 
                            : 'bg-gradient-to-br from-slate-400/20 to-slate-500/20 blur-md opacity-0 group-hover:opacity-100'
                        }`}></div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg text-white drop-shadow-lg group-hover:text-blue-100 transition-colors duration-300">{label}</h4>
                        <p className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors duration-300 leading-relaxed font-medium">{description}</p>
                      </div>
                      
                      {/* Active Indicator */}
                      {isActive(path) && (
                        <div className="absolute top-4 right-4 flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Welcome section - show for testing */}
          {!user && (
            <div className="space-y-4">
              <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl border border-emerald-400/40">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <span>Welcome to SmartHealthBot</span>
                </h3>
              </div>
              <div className="px-6 py-6 bg-gradient-to-br from-white/95 to-blue-50/95 rounded-2xl border-2 border-blue-400 shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:rotate-12 transition-all duration-500">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white">AI-Powered Healthcare</h4>
                    <p className="text-sm text-white leading-relaxed">
                      Sign in to access your personalized health dashboard and AI insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Elegant User Profile Section */}
        <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-4">
          {user ? (
            <div className="space-y-3">
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => {
                    console.log('Profile dropdown button clicked!'); // Debug log
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-300 group border border-slate-700/50 hover:border-slate-600"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-slate-800"></div>
                  </div>
                  <div className="flex-1 text-left ml-3">
                    <div className="truncate font-bold text-white text-base drop-shadow-lg">{user.name}</div>
                    <div className="text-sm text-slate-300 truncate font-medium">Premium Member</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 ml-2 flex-shrink-0 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Enhanced Profile Dropdown */}
                {isProfileOpen && (
                  <div 
                    className="absolute bottom-full left-0 right-0 mb-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm" 
                    style={{ zIndex: 9999 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-3 border-b border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{user.name}</div>
                          <div className="text-xs text-slate-400">Premium Member</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Profile link clicked!'); // Debug log
                          setIsProfileOpen(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-3 text-slate-400 group-hover:text-blue-400" />
                        <span>Profile Settings</span>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Logout button clicked!'); // Debug log
                          handleLogout();
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-slate-200 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all duration-200 group"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-slate-400 group-hover:text-red-400" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Login
              </Link>
              <button
                onClick={() => {
                  console.log('Sign Up button clicked!');
                  navigate('/register');
                }}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Modern Mobile Header */}
      <nav className="lg:hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-xl relative z-50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Mobile Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white drop-shadow-lg">SmartHealth</span>
                <span className="text-xs text-slate-300 font-medium">AI Healthcare</span>
              </div>
            </Link>

            {/* Stylish Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
            >
              <div className="relative">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                {!isMobileMenuOpen && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping"></div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-2xl">
            <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
              {/* Core Navigation for Mobile - Show only when logged in and not on home page */}
              {user && location.pathname !== '/' && (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Healthcare Dashboard</h3>
                  </div>
                  {coreNavLinks.map(({ path, label, description, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive(path)
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive(path) ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-800'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div>{label}</div>
                        <div className="text-xs text-slate-400">{description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* User Actions for Mobile */}
              <div className="space-y-2 border-t border-slate-700 pt-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="p-2 rounded-lg bg-slate-800">
                        <User className="h-5 w-5" />
                      </div>
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-slate-800">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white border border-slate-700 hover:border-slate-600 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <button
                      onClick={() => {
                        console.log('Mobile Sign Up button clicked!');
                        setIsMobileMenuOpen(false);
                        navigate('/register');
                      }}
                      className="block w-full px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;