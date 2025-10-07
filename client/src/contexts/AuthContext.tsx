import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  gender: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smarthealth-bot.onrender.com/api';
axios.defaults.baseURL = API_BASE_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token is still valid
          await axios.get('/auth/me');
        } catch (error: any) {
          // For 401 errors, try to refresh token before clearing session
          if (error?.response?.status === 401) {
            console.log('Token expired, attempting refresh...');
            
            // Try to refresh token
            try {
              const response = await axios.post('/auth/refresh');
              const { token: newToken, user: userData } = response.data;
              
              // Update stored token
              localStorage.setItem('token', newToken);
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Update state
              setToken(newToken);
              setUser(userData);
              
              // Update axios header
              axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              
              console.log('Token refreshed successfully');
            } catch (refreshError) {
              console.log('Token refresh failed, clearing session');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              delete axios.defaults.headers.common['Authorization'];
            }
          } else {
            console.error('Token validation failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Debug logging
      console.log('Login attempt:', { email, hasPassword: !!password });
      console.log('API Base URL:', axios.defaults.baseURL);
      console.log('Request payload:', { email: email.trim(), password: password.substring(0, 2) + '***' });
      
      const response = await axios.post('/auth/login', { 
        email: email.trim(), 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { token: newToken, user: userData } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      // Enhanced error logging
      console.error('Login error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      
      // Log the detailed error message
      console.error('Detailed error data:', JSON.stringify(error.response?.data, null, 2));
      
      let message = 'Login failed';
      
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 900; // Default 15 minutes
        const minutes = Math.ceil(retryAfter / 60);
        message = `Too many login attempts. Please try again in ${minutes} minutes.`;
      } else if (error.response?.status === 400) {
        message = error.response?.data?.message || 
                 error.response?.data?.errors?.[0]?.msg || 
                 'Invalid credentials';
      } else {
        message = error.response?.data?.message || 'Login failed';
      }
      
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Registration successful!');
      return true;
    } catch (error: any) {
      // Enhanced error handling for registration
      console.error('Registration error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Log the detailed error message
      console.error('Detailed registration error:', JSON.stringify(error.response?.data, null, 2));
      
      let message = 'Registration failed';
      
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 900; // Default 15 minutes
        const minutes = Math.ceil(retryAfter / 60);
        message = `Too many registration attempts. Please try again in ${minutes} minutes.`;
      } else if (error.response?.status === 400) {
        message = error.response?.data?.message || 
                 error.response?.data?.errors?.[0]?.msg || 
                 'Invalid registration data';
      } else {
        message = error.response?.data?.message || 'Registration failed';
      }
      
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.put('/auth/profile', userData);
      
      const updatedUser = response.data.user;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token) {
        return false;
      }

      const response = await axios.post('/auth/refresh');
      const { token: newToken, user: userData } = response.data;
      
      // Update stored token
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      // Update axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return true;
    } catch (error: any) {
      console.log('Token refresh failed, logging out');
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateProfile,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};