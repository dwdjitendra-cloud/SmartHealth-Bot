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
  Clock,
  Users
} from 'lucide-react';
import LoadingSpinner from '../../LoadingSpinner';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your health journey with SmartHealthBot.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/symptom-checker"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            <div className="flex items-center">
              <Activity className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-xl font-semibold">Check Symptoms</h3>
                <p className="text-blue-100">Get AI-powered health insights</p>
              </div>
            </div>
          </Link>

          <Link
            to="/doctors"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-xl font-semibold">Find Doctors</h3>
                <p className="text-green-100">Connect with healthcare experts</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
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

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
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

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
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

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            
            {stats?.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <Link
                  to="/symptom-checker"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Check your symptoms now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentActivity.map((activity) => (
                  <div key={activity._id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {activity.prediction.disease}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(activity.prediction.severity)}`}>
                        {activity.prediction.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {activity.symptoms.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Common Conditions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Common Conditions
            </h2>
            
            {stats?.commonConditions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No conditions tracked yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.commonConditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">
                      {condition.condition}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {condition.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
      </div>
    </div>
  );
};

export default Dashboard;