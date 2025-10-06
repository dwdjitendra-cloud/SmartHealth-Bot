import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Activity, 
  Stethoscope, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Users,
  Pill,
  Video,
  Shield,
  HeartPulse,
  Brain
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardStats {
  overview: {
    totalSymptomQueries: number;
    recentSymptomQueries: number;
    totalConsultations: number;
    totalSpent: number;
  };
  commonConditions: Array<{
    condition: string;
    count: number;
  }>;
  recentActivity: Array<{
    _id: string;
    symptoms: string;
    prediction: {
      disease: string;
      severity: string;
    };
    createdAt: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/dashboard/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* White Background Container for All Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[calc(100vh-4rem)]">
          {/* Top User Header for Better Visibility */}
          <div className="mb-6 rounded-xl shadow-lg border p-4" style={{ backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
                  <p className="text-gray-600">Logged in • Premium Member</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-700">SmartHealth Dashboard</div>
                <div className="text-xs text-gray-500">AI-Powered Healthcare</div>
              </div>
            </div>
          </div>

        {/* Enhanced Header with Navigation Highlight */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  Access all your healthcare tools and get instant AI-powered health insights
                </p>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 mb-6 border border-white/30">
                  <p className="text-white text-sm font-medium">
                    📍 <strong>Navigation:</strong> Use the sidebar on the left for main navigation, or click the buttons below for quick access!
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/healthcare-dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center text-lg border-2 border-blue-500 hover:border-blue-400"
                  >
                    <Activity className="h-6 w-6 mr-3" />
                    Healthcare Services
                    <span className="ml-3 text-xs bg-blue-500 px-2 py-1 rounded-full">
                      Access All Health Features
                    </span>
                  </Link>
                  <Link
                    to="/profile"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center text-lg border-2 border-purple-500 hover:border-purple-400"
                  >
                    <Users className="h-6 w-6 mr-3" />
                    Manage Profile
                    <span className="ml-3 text-xs bg-purple-500 px-2 py-1 rounded-full">
                      Manage Your Account
                    </span>
                  </Link>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold mb-2">Your Health Hub</div>
                  <div className="text-blue-100 mb-4">Everything you need in one place</div>
                  <div className="flex justify-center lg:justify-end space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-xs text-blue-200">AI Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-xs text-blue-200">Doctors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-xs text-blue-200">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions with Enhanced Visibility */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            <div className="text-sm px-4 py-2 rounded-full border text-white" style={{ 
              backgroundColor: '#8C7BFF', 
              borderColor: '#9D8CFF' 
            }}>
              ✨ Essential navigation and account management
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Quick Access Card */}
            <Link
              to="/dashboard"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e9ecef',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#8C7BFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#8C7BFF' }}>
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Quick Access</h3>
                  <p className="text-sm text-gray-600">Essential navigation and account management</p>
                </div>
              </div>
            </Link>

            <Link
              to="/symptom-checker"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f1f3f4',
                borderColor: '#dee2e6',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#4EA8FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f3f4';
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#4EA8FF' }}>
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Check Symptoms</h3>
                  <p className="text-sm text-gray-600">Get AI-powered health insights</p>
                </div>
              </div>
            </Link>

            <Link
              to="/health-risk"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e9ecef',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#8C7BFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#8C7BFF' }}>
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Health Risk</h3>
                  <p className="text-sm text-gray-600">Advanced AI health assessment</p>
                </div>
              </div>
            </Link>

            <Link
              to="/vital-signs"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f1f3f4',
                borderColor: '#dee2e6',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#4EA8FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f3f4';
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#4EA8FF' }}>
                  <HeartPulse className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Vital Signs</h3>
                  <p className="text-sm text-gray-600">Real-time health monitoring</p>
                </div>
              </div>
            </Link>

            <Link
              to="/medications"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e9ecef',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#8C7BFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#8C7BFF' }}>
                  <Pill className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Medications</h3>
                  <p className="text-sm text-gray-600">Smart medication tracking</p>
                </div>
              </div>
            </Link>

            <Link
              to="/telemedicine"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f1f3f4',
                borderColor: '#dee2e6',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#4EA8FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f3f4';
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#4EA8FF' }}>
                  <Video className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Telemedicine</h3>
                  <p className="text-sm text-gray-600">Virtual consultations</p>
                </div>
              </div>
            </Link>

            <Link
              to="/mental-health"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e9ecef',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#8C7BFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#8C7BFF' }}>
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Mental Health</h3>
                  <p className="text-sm text-gray-600">Mood tracking & wellness</p>
                </div>
              </div>
            </Link>

            <Link
              to="/doctors"
              className="p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl border-2 group"
              style={{ 
                backgroundColor: '#f1f3f4',
                borderColor: '#dee2e6',
                color: '#495057'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
                e.currentTarget.style.borderColor = '#4EA8FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f3f4';
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#4EA8FF' }}>
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Find Doctors</h3>
                  <p className="text-sm text-gray-600">Connect with healthcare experts</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border bg-gray-50 border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Queries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overview.totalSymptomQueries}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border bg-gray-50 border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overview.recentSymptomQueries}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border bg-gray-50 border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overview.totalConsultations}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border bg-gray-50 border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{stats.overview.totalSpent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="rounded-xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl bg-gray-50 border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Recent Activity
            </h2>
            
            {stats?.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No recent activity</p>
                <Link
                  to="/symptom-checker"
                  className="font-medium hover:underline text-blue-600"
                >
                  Check your symptoms now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentActivity.map((activity) => (
                  <div key={activity._id} className="pl-4 py-2 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">
                        {activity.prediction.disease}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(activity.prediction.severity)}`}>
                        {activity.prediction.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-1 text-gray-700">
                      {activity.symptoms.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Common Conditions */}
          <div className="rounded-xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl bg-gray-50 border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Common Conditions
            </h2>
            
            {stats?.commonConditions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No conditions tracked yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.commonConditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                    <span className="font-bold text-gray-900">
                      {condition.condition}
                    </span>
                    <span className="px-2 py-1 rounded-full text-sm font-medium text-white bg-blue-600">
                      {condition.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 rounded-xl p-6 border shadow-lg bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <div className="p-3 rounded-lg mr-4 bg-blue-600">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">
                Health Tip of the Day
              </h3>
              <p className="text-gray-700">
                Regular health check-ups can help detect potential issues early. 
                Consider scheduling a consultation with one of our certified doctors 
                if you have ongoing health concerns.
              </p>
            </div>
          </div>
        </div>
        </div> {/* Close white background container */}
      </div>
    </div>
  );
};

export default Dashboard;