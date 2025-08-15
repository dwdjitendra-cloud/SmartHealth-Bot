import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, 
  Activity, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Clock,
  Stethoscope
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface SymptomAnalysis {
  id: string;
  disease: string;
  description: string;
  precautions: string[];
  homeRemedies: string[];
  confidence: number;
  severity: string;
  consultationRecommended: boolean;
  timestamp: string;
}

const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SymptomAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/symptoms/history?limit=5');
      setHistory(response.data.data.queries.map((query: any) => ({
        id: query._id,
        disease: query.prediction.disease,
        description: query.prediction.description,
        precautions: query.prediction.precautions,
        homeRemedies: query.prediction.homeRemedies,
        confidence: query.prediction.confidence,
        severity: query.prediction.severity,
        consultationRecommended: query.consultationRecommended,
        timestamp: query.createdAt
      })));
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) return;

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await axios.post('/symptoms/analyze', {
        symptoms: symptoms.trim()
      });

      setAnalysis(response.data.analysis);
      setSymptoms('');
      
      // Refresh history
      fetchHistory();
    } catch (error: any) {
      console.error('Error analyzing symptoms:', error);
      // Handle error - could show toast or error message
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Symptom Checker
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Describe your symptoms in detail and get AI-powered health insights. 
            Our system analyzes your symptoms and provides preliminary guidance.
          </p>
        </div>

        {/* Symptom Input Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms
              </label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Please describe your symptoms in detail. For example: 'I have been experiencing headaches, fever, and body aches for the past 2 days. The headache is severe and I feel very tired.'"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
            </div>

            {/* Disease Prediction */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Predicted Condition: {analysis.disease}
                </h3>
                <div className={`flex items-center px-3 py-1 rounded-full border ${getSeverityColor(analysis.severity)}`}>
                  {getSeverityIcon(analysis.severity)}
                  <span className="ml-1 text-sm font-medium capitalize">
                    {analysis.severity} Severity
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-2">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Confidence Score</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-blue-700">
                  {Math.round(analysis.confidence * 100)}% confidence
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {analysis.description}
              </p>
            </div>

            {/* Consultation Recommendation */}
            {analysis.consultationRecommended && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Stethoscope className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-900">
                    Professional Consultation Recommended
                  </span>
                </div>
                <p className="text-red-700 text-sm">
                  Based on your symptoms, we recommend consulting with a healthcare professional 
                  for proper diagnosis and treatment.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Precautions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  Precautions
                </h4>
                <ul className="space-y-2">
                  {analysis.precautions.map((precaution, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Home Remedies */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Home Remedies
                </h4>
                <ul className="space-y-2">
                  {analysis.homeRemedies.map((remedy, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> This analysis is for informational purposes only and 
                should not replace professional medical advice. Always consult with a qualified 
                healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-6 w-6 text-gray-600 mr-2" />
              Recent History
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>

          {showHistory && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No previous symptom checks found.
                </p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.disease}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Confidence: {Math.round(item.confidence * 100)}%
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;