import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Heart,
  Calendar,
  Stethoscope,
  Target,
  Award,
  Clock,
  User,
  Cigarette,
  Coffee
} from 'lucide-react';

interface HealthInsights {
  overall_risk: {
    score: number;
    level: string;
    breakdown: Record<string, any>;
  };
  health_score: number;
  priority_areas: string[];
  personalized_plan: {
    immediate_actions: string[];
    lifestyle_recommendations: string[];
    screening_schedule: string[];
  };
  disease_risks: Record<string, any>;
}

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  smoking?: boolean;
  alcohol_consumption?: boolean;
  exercise_frequency?: number;
  family_history?: string[];
  chronic_conditions?: string[];
}

const AdvancedHealthDashboard: React.FC = () => {
  const [healthInsights, setHealthInsights] = useState<HealthInsights | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [symptoms, setSymptoms] = useState<string>('');
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      // Load existing health insights if available
      const response = await axios.get('/health-risk/history');
      if (response.data.data.last_assessment) {
        // You would need to store the full insights in the history
        // For now, we'll trigger a new assessment
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    }
    setLoading(false);
  };

  const runHealthAssessment = async () => {
    setAssessmentLoading(true);
    try {
      const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const response = await axios.post('/health-risk/assessment', {
        user_profile: userProfile,
        symptoms: symptomsArray
      });

      setHealthInsights(response.data.health_insights);
      toast.success('Health assessment completed successfully!');
    } catch (error: any) {
      console.error('Error running health assessment:', error);
      toast.error(error.response?.data?.message || 'Failed to run health assessment');
    }
    setAssessmentLoading(false);
  };

  const updateProfile = async () => {
    try {
      await axios.post('/health-risk/update-profile', userProfile);
      toast.success('Health profile updated successfully!');
      setShowProfileEditor(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return <CheckCircle className="h-5 w-5" />;
      case 'medium': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                Advanced Health Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                AI-powered health insights and personalized recommendations
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProfileEditor(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </button>
              <button
                onClick={runHealthAssessment}
                disabled={assessmentLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {assessmentLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Stethoscope className="h-4 w-4 mr-2" />
                )}
                Run Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Symptoms Input */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Symptoms (Optional)
          </h2>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe any current symptoms separated by commas (e.g., headache, fatigue, nausea)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Health Insights */}
        {healthInsights && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Health Score */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Health Score</p>
                    <p className={`text-3xl font-bold ${getHealthScoreColor(healthInsights.health_score)}`}>
                      {healthInsights.health_score}
                    </p>
                  </div>
                  <Award className={`h-8 w-8 ${getHealthScoreColor(healthInsights.health_score)}`} />
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        healthInsights.health_score >= 80 ? 'bg-green-500' :
                        healthInsights.health_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthInsights.health_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Risk Level */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Level</p>
                    <p className={`text-xl font-bold px-3 py-1 rounded-full inline-flex items-center ${getRiskLevelColor(healthInsights.overall_risk.level)}`}>
                      {getRiskIcon(healthInsights.overall_risk.level)}
                      <span className="ml-2">{healthInsights.overall_risk.level}</span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Risk Score: {(healthInsights.overall_risk.score * 100).toFixed(0)}%
                </p>
              </div>

              {/* Priority Areas */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Priority Areas</p>
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div className="space-y-2">
                  {(healthInsights.priority_areas || []).slice(0, 3).map((area, index) => (
                    <div key={index} className="bg-orange-50 text-orange-800 text-xs px-2 py-1 rounded">
                      {area}
                    </div>
                  ))}
                  {(!healthInsights.priority_areas || healthInsights.priority_areas.length === 0) && (
                    <div className="text-xs text-gray-500">No priority areas identified</div>
                  )}
                </div>
              </div>

              {/* Next Action */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Next Action</p>
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {healthInsights.personalized_plan.immediate_actions[0] || 'Continue healthy lifestyle'}
                </p>
              </div>
            </div>

            {/* Personalized Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Immediate Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  Immediate Actions
                </h3>
                <div className="space-y-3">
                  {(healthInsights.personalized_plan.immediate_actions || []).map((action, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-red-100 rounded-full p-1 mr-3 mt-0.5">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-700">{action}</p>
                    </div>
                  ))}
                  {(!healthInsights.personalized_plan.immediate_actions || healthInsights.personalized_plan.immediate_actions.length === 0) && (
                    <p className="text-sm text-gray-500">No immediate actions required at this time.</p>
                  )}
                </div>
              </div>

              {/* Lifestyle Recommendations */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-green-600 mr-2" />
                  Lifestyle Recommendations
                </h3>
                <div className="space-y-3">
                  {(healthInsights.personalized_plan.lifestyle_recommendations || []).map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                  {(!healthInsights.personalized_plan.lifestyle_recommendations || healthInsights.personalized_plan.lifestyle_recommendations.length === 0) && (
                    <p className="text-sm text-gray-500">General wellness recommendations will be provided after consultation.</p>
                  )}
                </div>
              </div>

              {/* Screening Schedule */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Screening Schedule
                </h3>
                <div className="space-y-3">
                  {(healthInsights.personalized_plan.screening_schedule || []).map((screening, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-700">{screening}</p>
                    </div>
                  ))}
                  {(!healthInsights.personalized_plan.screening_schedule || healthInsights.personalized_plan.screening_schedule.length === 0) && (
                    <p className="text-sm text-gray-500">No specific screening schedule available. Please consult with your healthcare provider.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Disease Risk Assessment */}
        {healthInsights?.disease_risks && Object.keys(healthInsights.disease_risks).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Heart className="h-6 w-6 text-red-600 mr-2" />
              Disease Risk Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(healthInsights.disease_risks || {}).map(([disease, data]: [string, any]) => (
                <div key={disease} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {disease.replace('_', ' ')}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(data?.risk_category || data)}`}>
                      {data?.risk_category || data || 'normal'}
                    </span>
                  </div>
                  {data?.recommendation && (
                    <p className="text-sm text-gray-600 mb-3">{data.recommendation}</p>
                  )}
                  {data?.preventive_measures && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">Top Preventive Measures:</p>
                      {(data.preventive_measures || []).slice(0, 2).map((measure: string, index: number) => (
                        <p key={index} className="text-xs text-gray-600">• {measure}</p>
                      ))}
                    </div>
                  )}
                  {!data?.preventive_measures && (
                    <p className="text-xs text-gray-600">Risk level: {data?.risk_category || data}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Editor Modal */}
        {showProfileEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Health Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={userProfile.age || ''}
                    onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value) || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={userProfile.weight || ''}
                    onChange={(e) => setUserProfile({...userProfile, weight: parseFloat(e.target.value) || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={userProfile.height || ''}
                    onChange={(e) => setUserProfile({...userProfile, height: parseFloat(e.target.value) || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Frequency (days/week)</label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={userProfile.exercise_frequency || ''}
                    onChange={(e) => setUserProfile({...userProfile, exercise_frequency: parseInt(e.target.value) || undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userProfile.smoking || false}
                    onChange={(e) => setUserProfile({...userProfile, smoking: e.target.checked})}
                    className="mr-2"
                  />
                  <Cigarette className="h-4 w-4 mr-2 text-gray-600" />
                  <label className="text-sm text-gray-700">Smoking</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userProfile.alcohol_consumption || false}
                    onChange={(e) => setUserProfile({...userProfile, alcohol_consumption: e.target.checked})}
                    className="mr-2"
                  />
                  <Coffee className="h-4 w-4 mr-2 text-gray-600" />
                  <label className="text-sm text-gray-700">Alcohol Consumption</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowProfileEditor(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Assessment Message */}
        {!healthInsights && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Run Your First Health Assessment
            </h2>
            <p className="text-gray-600 mb-6">
              Get personalized health insights and recommendations powered by AI
            </p>
            <button
              onClick={runHealthAssessment}
              disabled={assessmentLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
            >
              {assessmentLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Stethoscope className="h-5 w-5 mr-2" />
              )}
              Start Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedHealthDashboard;