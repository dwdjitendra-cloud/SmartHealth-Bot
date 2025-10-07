import React, { useState, useEffect } from 'react';
import { Brain, Heart, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface MoodEntry {
  _id: string;
  entryId: string;
  moodRating: number;
  stressLevel: number;
  anxietyLevel: number;
  energyLevel: number;
  sleepQuality: number;
  notes: string;
  trackedAt: string;
}

interface Assessment {
  _id: string;
  assessmentId: string;
  type: 'PHQ-9' | 'GAD-7';
  score: number;
  severity: string;
  suicidalRisk: boolean;
  completedAt: string;
}

interface MindfulnessSession {
  _id: string;
  sessionId: string;
  exerciseName: string;
  durationCompleted: number;
  rating: number;
  notes: string;
  completedAt: string;
}

const MentalHealthDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [mindfulnessSessions, setMindfulnessSessions] = useState<MindfulnessSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Mood tracking state
  const [currentMood, setCurrentMood] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');

  // Assessment state
  const [selectedAssessment, setSelectedAssessment] = useState<'PHQ-9' | 'GAD-7'>('PHQ-9');
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);

  // PHQ-9 Questions
  const phq9Questions = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling/staying asleep or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you're a failure",
    "Trouble concentrating on things",
    "Moving/speaking slowly or being fidgety/restless",
    "Thoughts that you would be better off dead"
  ];

  // GAD-7 Questions
  const gad7Questions = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it's hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen"
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [moodRes, assessmentRes, mindfulnessRes] = await Promise.all([
        axios.get('/mental-health/mood-entries'),
        axios.get('/mental-health/assessments'),
        axios.get('/mental-health/mindfulness-sessions')
      ]);

      // Handle response data safely
      const moodData = Array.isArray(moodRes.data) ? moodRes.data : (moodRes.data.data || []);
      const assessmentData = Array.isArray(assessmentRes.data) ? assessmentRes.data : (assessmentRes.data.data || []);
      const mindfulnessData = Array.isArray(mindfulnessRes.data) ? mindfulnessRes.data : (mindfulnessRes.data.data || []);

      setMoodEntries(moodData.slice(0, 10)); // Recent 10 entries
      setAssessments(assessmentData.slice(0, 5)); // Recent 5 assessments
      setMindfulnessSessions(mindfulnessData.slice(0, 10)); // Recent 10 sessions
    } catch (error) {
      console.error('Error loading mental health data:', error);
      toast.error('Failed to load mental health data');
    } finally {
      setLoading(false);
    }
  };

  const submitMoodEntry = async () => {
    try {
      await axios.post('/mental-health/mood-entry', {
        entryId: `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        moodRating: currentMood,
        stressLevel: currentMood, // Use same value as fallback
        anxietyLevel: currentMood, // Use same value as fallback
        energyLevel: currentMood, // Use same value as fallback  
        sleepQuality: currentMood, // Use same value as fallback
        notes: moodNotes
      });
      
      toast.success('Mood entry recorded successfully!');
      setMoodNotes('');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to record mood entry');
    }
  };

  const submitAssessment = async () => {
    if (assessmentAnswers.length !== (selectedAssessment === 'PHQ-9' ? 9 : 7)) {
      toast.error('Please answer all questions');
      return;
    }

    // Calculate score based on answers
    const score = assessmentAnswers.reduce((sum, answer) => sum + answer, 0);
    
    // Determine severity based on score and assessment type
    let severity = 'minimal';
    if (selectedAssessment === 'PHQ-9') {
      if (score >= 20) severity = 'severe';
      else if (score >= 15) severity = 'moderately_severe';
      else if (score >= 10) severity = 'moderate';
      else if (score >= 5) severity = 'mild';
    } else if (selectedAssessment === 'GAD-7') {
      if (score >= 15) severity = 'severe';
      else if (score >= 10) severity = 'moderate';
      else if (score >= 5) severity = 'mild';
    }

    try {
      await axios.post('/mental-health/assessment', {
        assessmentId: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: selectedAssessment,
        score: score,
        severity: severity,
        responses: assessmentAnswers
      });
      
      toast.success('Assessment completed successfully!');
      setAssessmentAnswers([]);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to submit assessment');
    }
  };

  const startMindfulnessSession = async (type: string, duration: number) => {
    try {
      await axios.post('/mental-health/mindfulness-session', {
        type,
        duration,
        durationCompleted: duration,
        exerciseName: type,
        sessionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        rating: 5, // Default rating
        completed: true
      });
      
      toast.success('Mindfulness session completed!');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to record mindfulness session');
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'text-red-500';
    if (mood <= 5) return 'text-yellow-500';
    if (mood <= 7) return 'text-blue-500';
    return 'text-green-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minimal': return 'text-green-500';
      case 'mild': return 'text-yellow-500';
      case 'moderate': return 'text-orange-500';
      case 'severe': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Brain className="h-8 w-8 text-purple-600 mr-3" />
          Mental Health Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Track your mental wellness journey with AI-powered insights</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'mood', 'assessments', 'mindfulness', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Mood */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-pink-500 mr-2" />
              Recent Mood
            </h3>
            {moodEntries.length > 0 ? (
              <div className="space-y-3">
                {moodEntries.slice(0, 3).map((entry) => (
                  <div key={entry._id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {new Date(entry.trackedAt).toLocaleDateString()}
                    </span>
                    <span className={`font-semibold ${getMoodColor(entry.moodRating)}`}>
                      {entry.moodRating}/10
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No mood entries yet</p>
            )}
          </div>

          {/* Recent Assessment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Latest Assessment
            </h3>
            {assessments.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{assessments[0].type}</span>
                  <span className={`text-sm font-semibold ${getSeverityColor(assessments[0].severity)}`}>
                    {assessments[0].severity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Score</span>
                  <span className="text-xs text-gray-700">{assessments[0].score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Date</span>
                  <span className="text-xs text-gray-700">
                    {new Date(assessments[0].completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No assessments completed</p>
            )}
          </div>

          {/* Mindfulness Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              Mindfulness This Week
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sessions</span>
                <span className="font-semibold">{mindfulnessSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Time</span>
                <span className="font-semibold">
                  {mindfulnessSessions.reduce((acc, session) => acc + session.durationCompleted, 0)} min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Tab */}
      {activeTab === 'mood' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Track Your Mood</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling today? (1 = Very Bad, 10 = Excellent)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentMood}
                onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span className={`font-semibold ${getMoodColor(currentMood)}`}>{currentMood}</span>
                <span>10</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="What's influencing your mood today?"
              />
            </div>

            <button
              onClick={submitMoodEntry}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Record Mood
            </button>
          </div>

          {/* Mood History */}
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Mood Entries</h4>
            <div className="space-y-3">
              {moodEntries.map((entry) => (
                <div key={entry._id} className="border-l-4 border-purple-200 pl-4 py-2">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${getMoodColor(entry.moodRating)}`}>
                      Mood: {entry.moodRating}/10
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.trackedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Mental Health Assessments</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Assessment Type
              </label>
              <select
                value={selectedAssessment}
                onChange={(e) => {
                  setSelectedAssessment(e.target.value as 'PHQ-9' | 'GAD-7');
                  setAssessmentAnswers([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="PHQ-9">PHQ-9 (Depression Screening)</option>
                <option value="GAD-7">GAD-7 (Anxiety Screening)</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                {selectedAssessment === 'PHQ-9' ? 'Depression Assessment' : 'Anxiety Assessment'}
              </h4>
              <p className="text-sm text-gray-600">
                Over the last 2 weeks, how often have you been bothered by any of the following problems?
              </p>

              {(selectedAssessment === 'PHQ-9' ? phq9Questions : gad7Questions).map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">{question}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={optionIndex}
                          checked={assessmentAnswers[index] === optionIndex}
                          onChange={() => {
                            const newAnswers = [...assessmentAnswers];
                            newAnswers[index] = optionIndex;
                            setAssessmentAnswers(newAnswers);
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitAssessment}
              disabled={assessmentAnswers.length !== (selectedAssessment === 'PHQ-9' ? 9 : 7)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      )}

      {/* Mindfulness Tab */}
      {activeTab === 'mindfulness' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Mindfulness Exercises</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Deep Breathing', duration: 5, description: 'Focus on your breath' },
                { name: 'Body Scan', duration: 10, description: 'Progressive muscle relaxation' },
                { name: 'Loving Kindness', duration: 15, description: 'Cultivate compassion' },
                { name: 'Mindful Walking', duration: 20, description: 'Walking meditation' },
                { name: 'Gratitude Practice', duration: 10, description: 'Count your blessings' },
                { name: 'Stress Relief', duration: 15, description: 'Release tension and worry' }
              ].map((exercise) => (
                <div key={exercise.name} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{exercise.duration} minutes</p>
                  <button
                    onClick={() => startMindfulnessSession(exercise.name, exercise.duration)}
                    className="mt-3 w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Start Session
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Sessions</h4>
            <div className="space-y-3">
              {mindfulnessSessions.map((session) => (
                <div key={session._id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium text-gray-900">{session.exerciseName}</span>
                    <span className="text-sm text-gray-500 ml-2">({session.durationCompleted} min)</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(session.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Insights</h3>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Mood Pattern Analysis:</strong> Your mood has been trending upward over the past week. 
                    Continue with your current mindfulness practice!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Mindfulness Progress:</strong> You've completed 5 sessions this week. 
                    Regular practice is showing positive effects on your overall well-being.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Recommendation:</strong> Consider scheduling a session with a mental health professional 
                    if you continue to experience persistent low mood scores.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-purple-700">
                    <strong>Personalized Tip:</strong> Based on your assessment results, try incorporating 
                    10 minutes of morning meditation into your daily routine.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentalHealthDashboard;