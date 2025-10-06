const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const axios = require('axios');

const router = express.Router();

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Track daily mood
router.post('/mood/track', auth, async (req, res) => {
    try {
        const { 
            mood_rating, 
            mood_notes = '', 
            energy_level = 5, 
            sleep_quality = 5, 
            stress_level = 5, 
            anxiety_level = 5 
        } = req.body;
        
        if (mood_rating === undefined || mood_rating < 1 || mood_rating > 10) {
            return res.status(400).json({
                success: false,
                error: 'Mood rating must be between 1 and 10'
            });
        }
        
        const moodData = {
            user_id: req.user._id,
            mood_rating,
            mood_notes,
            energy_level,
            sleep_quality,
            stress_level,
            anxiety_level
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/mental-health/mood/track`, moodData);
        
        if (response.data.success) {
            // Store mood entry reference in user's profile
            const user = await User.findById(req.user._id);
            if (!user.mentalHealthData) {
                user.mentalHealthData = {
                    moodEntries: [],
                    assessments: [],
                    mindfulnessSessions: []
                };
            }
            
            user.mentalHealthData.moodEntries.push({
                entryId: response.data.mood_entry.entry_id,
                moodRating: mood_rating,
                stressLevel: stress_level,
                anxietyLevel: anxiety_level,
                energyLevel: energy_level,
                sleepQuality: sleep_quality,
                notes: mood_notes,
                trackedAt: new Date()
            });
            
            // Keep only last 100 entries
            if (user.mentalHealthData.moodEntries.length > 100) {
                user.mentalHealthData.moodEntries = user.mentalHealthData.moodEntries.slice(-100);
            }
            
            await user.save();
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error tracking mood:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track mood',
            details: error.response?.data?.error || error.message
        });
    }
});

// Conduct PHQ-9 depression assessment
router.post('/assessment/phq9', auth, async (req, res) => {
    try {
        const { responses } = req.body;
        
        if (!responses || !Array.isArray(responses) || responses.length !== 9) {
            return res.status(400).json({
                success: false,
                error: 'PHQ-9 assessment requires exactly 9 responses (0-3 scale)'
            });
        }
        
        // Validate response values
        if (!responses.every(r => Number.isInteger(r) && r >= 0 && r <= 3)) {
            return res.status(400).json({
                success: false,
                error: 'All responses must be integers between 0 and 3'
            });
        }
        
        const assessmentData = {
            user_id: req.user._id,
            responses
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/mental-health/assessment/phq9`, assessmentData);
        
        if (response.data.success) {
            // Store assessment result in user's profile
            const user = await User.findById(req.user._id);
            if (!user.mentalHealthData) {
                user.mentalHealthData = {
                    moodEntries: [],
                    assessments: [],
                    mindfulnessSessions: []
                };
            }
            
            user.mentalHealthData.assessments.push({
                assessmentId: response.data.assessment.assessment_id,
                type: 'PHQ-9',
                score: response.data.assessment.total_score,
                severity: response.data.assessment.severity,
                suicidalRisk: response.data.assessment.suicidal_risk,
                completedAt: new Date()
            });
            
            await user.save();
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error conducting PHQ-9 assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to conduct PHQ-9 assessment',
            details: error.response?.data?.error || error.message
        });
    }
});

// Conduct GAD-7 anxiety assessment
router.post('/assessment/gad7', auth, async (req, res) => {
    try {
        const { responses } = req.body;
        
        if (!responses || !Array.isArray(responses) || responses.length !== 7) {
            return res.status(400).json({
                success: false,
                error: 'GAD-7 assessment requires exactly 7 responses (0-3 scale)'
            });
        }
        
        // Validate response values
        if (!responses.every(r => Number.isInteger(r) && r >= 0 && r <= 3)) {
            return res.status(400).json({
                success: false,
                error: 'All responses must be integers between 0 and 3'
            });
        }
        
        const assessmentData = {
            user_id: req.user._id,
            responses
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/mental-health/assessment/gad7`, assessmentData);
        
        if (response.data.success) {
            // Store assessment result in user's profile
            const user = await User.findById(req.user._id);
            if (!user.mentalHealthData) {
                user.mentalHealthData = {
                    moodEntries: [],
                    assessments: [],
                    mindfulnessSessions: []
                };
            }
            
            user.mentalHealthData.assessments.push({
                assessmentId: response.data.assessment.assessment_id,
                type: 'GAD-7',
                score: response.data.assessment.total_score,
                severity: response.data.assessment.severity,
                completedAt: new Date()
            });
            
            await user.save();
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error conducting GAD-7 assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to conduct GAD-7 assessment',
            details: error.response?.data?.error || error.message
        });
    }
});

// Recommend mindfulness exercise
router.post('/mindfulness/recommend', auth, async (req, res) => {
    try {
        const { current_mood, stress_level, available_time = 10 } = req.body;
        
        if (current_mood === undefined || stress_level === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Current mood and stress level are required'
            });
        }
        
        const recommendationData = {
            user_id: req.user._id,
            current_mood,
            stress_level,
            available_time
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/mental-health/mindfulness/recommend`, recommendationData);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error recommending mindfulness exercise:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to recommend mindfulness exercise',
            details: error.response?.data?.error || error.message
        });
    }
});

// Log mindfulness session
router.post('/mindfulness/log', auth, async (req, res) => {
    try {
        const { exercise_name, duration_completed, rating, notes = '' } = req.body;
        
        if (!exercise_name || duration_completed === undefined || rating === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Exercise name, duration completed, and rating are required'
            });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }
        
        const sessionData = {
            user_id: req.user._id,
            exercise_name,
            duration_completed,
            rating,
            notes
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/mental-health/mindfulness/log`, sessionData);
        
        if (response.data.success) {
            // Store session in user's profile
            const user = await User.findById(req.user._id);
            if (!user.mentalHealthData) {
                user.mentalHealthData = {
                    moodEntries: [],
                    assessments: [],
                    mindfulnessSessions: []
                };
            }
            
            user.mentalHealthData.mindfulnessSessions.push({
                sessionId: response.data.session.session_id,
                exerciseName: exercise_name,
                durationCompleted: duration_completed,
                rating,
                notes,
                completedAt: new Date()
            });
            
            // Keep only last 50 sessions
            if (user.mentalHealthData.mindfulnessSessions.length > 50) {
                user.mentalHealthData.mindfulnessSessions = user.mentalHealthData.mindfulnessSessions.slice(-50);
            }
            
            await user.save();
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error logging mindfulness session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log mindfulness session',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get mental health summary
router.get('/summary', auth, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        
        const response = await axios.get(`${AI_SERVICE_URL}/api/mental-health/summary/${req.user._id}?days=${days}`);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error getting mental health summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mental health summary',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get mood trends
router.get('/mood/trends', auth, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        
        const response = await axios.get(`${AI_SERVICE_URL}/api/mental-health/mood/trends/${req.user._id}?days=${days}`);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error getting mood trends:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood trends',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get crisis resources
router.get('/crisis-resources', auth, async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/api/mental-health/crisis-resources`);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error getting crisis resources:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get crisis resources',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get professional help resources
router.get('/professional-help', auth, async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/api/mental-health/professional-help`);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error getting professional help resources:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get professional help resources',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get assessment questions
router.get('/assessment-questions', auth, async (req, res) => {
    try {
        const type = req.query.type || 'phq9';
        
        const response = await axios.get(`${AI_SERVICE_URL}/api/mental-health/assessment-questions?type=${type}`);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error getting assessment questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get assessment questions',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get mental health analytics (for dashboard)
router.get('/analytics', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        const analytics = {
            totalMoodEntries: user.mentalHealthData?.moodEntries?.length || 0,
            totalAssessments: user.mentalHealthData?.assessments?.length || 0,
            totalMindfulnessSessions: user.mentalHealthData?.mindfulnessSessions?.length || 0,
            recentMoodAverage: 0,
            mindfulnessMinutesThisWeek: 0,
            lastAssessmentDate: null,
            improvementTrend: 'stable'
        };
        
        if (user.mentalHealthData?.moodEntries?.length > 0) {
            // Calculate recent mood average (last 7 entries)
            const recentEntries = user.mentalHealthData.moodEntries.slice(-7);
            analytics.recentMoodAverage = Math.round(
                recentEntries.reduce((sum, entry) => sum + entry.moodRating, 0) / recentEntries.length * 10
            ) / 10;
        }
        
        if (user.mentalHealthData?.mindfulnessSessions?.length > 0) {
            // Calculate mindfulness minutes this week
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recentSessions = user.mentalHealthData.mindfulnessSessions.filter(
                session => new Date(session.completedAt) >= oneWeekAgo
            );
            
            analytics.mindfulnessMinutesThisWeek = recentSessions.reduce(
                (sum, session) => sum + session.durationCompleted, 0
            );
        }
        
        if (user.mentalHealthData?.assessments?.length > 0) {
            const lastAssessment = user.mentalHealthData.assessments[user.mentalHealthData.assessments.length - 1];
            analytics.lastAssessmentDate = lastAssessment.completedAt;
        }
        
        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('Error getting mental health analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mental health analytics',
            details: error.message
        });
    }
});

// Get mood entries
router.get('/mood-entries', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const moodEntries = user.mentalHealthData?.moodEntries || [];
        
        res.json({
            success: true,
            data: moodEntries.slice(-30) // Return last 30 entries
        });
    } catch (error) {
        console.error('Error getting mood entries:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood entries',
            details: error.message
        });
    }
});

// Get assessments
router.get('/assessments', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const assessments = user.mentalHealthData?.assessments || [];
        
        res.json({
            success: true,
            data: assessments.slice(-10) // Return last 10 assessments
        });
    } catch (error) {
        console.error('Error getting assessments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get assessments',
            details: error.message
        });
    }
});

// Get mindfulness sessions
router.get('/mindfulness-sessions', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const mindfulnessSessions = user.mentalHealthData?.mindfulnessSessions || [];
        
        res.json({
            success: true,
            data: mindfulnessSessions.slice(-20) // Return last 20 sessions
        });
    } catch (error) {
        console.error('Error getting mindfulness sessions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mindfulness sessions',
            details: error.message
        });
    }
});

// POST /mood-entry - Frontend compatibility endpoint
router.post('/mood-entry', auth, async (req, res) => {
    try {
        const { 
            entryId,
            moodRating, 
            notes = '', 
            energyLevel = 5, 
            sleepQuality = 5, 
            stressLevel = 5, 
            anxietyLevel = 5 
        } = req.body;
        
        if (!entryId || moodRating === undefined || moodRating < 1 || moodRating > 10) {
            return res.status(400).json({
                success: false,
                error: 'Entry ID and mood rating (1-10) are required'
            });
        }
        
        const user = await User.findById(req.user._id);
        if (!user.mentalHealthData) {
            user.mentalHealthData = {
                moodEntries: [],
                assessments: [],
                mindfulnessSessions: []
            };
        }
        
        const moodEntry = {
            entryId,
            moodRating,
            notes,
            energyLevel,
            sleepQuality,
            stressLevel,
            anxietyLevel,
            trackedAt: new Date()
        };
        
        user.mentalHealthData.moodEntries.push(moodEntry);
        await user.save();
        
        res.json({
            success: true,
            data: moodEntry,
            message: 'Mood entry saved successfully'
        });
    } catch (error) {
        console.error('Error saving mood entry:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save mood entry',
            details: error.message
        });
    }
});

// POST /assessment - Frontend compatibility endpoint
router.post('/assessment', auth, async (req, res) => {
    try {
        const { type, responses, assessmentId, score, severity } = req.body;
        
        if (!type || !responses || !assessmentId || typeof score !== 'number' || !severity) {
            return res.status(400).json({
                success: false,
                error: 'Assessment type, responses, assessmentId, score, and severity are required'
            });
        }
        
        const user = await User.findById(req.user._id);
        if (!user.mentalHealthData) {
            user.mentalHealthData = {
                moodEntries: [],
                assessments: [],
                mindfulnessSessions: []
            };
        }
        
        const assessment = {
            assessmentId,
            type,
            score,
            severity,
            suicidalRisk: false, // Default value
            completedAt: new Date()
        };
        
        user.mentalHealthData.assessments.push(assessment);
        await user.save();
        
        res.json({
            success: true,
            data: assessment,
            message: 'Assessment completed successfully'
        });
    } catch (error) {
        console.error('Error saving assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save assessment',
            details: error.message
        });
    }
});

// POST /mindfulness-session - Frontend compatibility endpoint  
router.post('/mindfulness-session', auth, async (req, res) => {
    try {
        const { sessionId, exerciseName, durationCompleted, rating, notes = '' } = req.body;
        
        if (!sessionId || !exerciseName || typeof durationCompleted !== 'number' || typeof rating !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Session ID, exercise name, duration completed, and rating are required'
            });
        }
        
        const user = await User.findById(req.user._id);
        if (!user.mentalHealthData) {
            user.mentalHealthData = {
                moodEntries: [],
                assessments: [],
                mindfulnessSessions: []
            };
        }
        
        const session = {
            sessionId,
            exerciseName,
            durationCompleted,
            rating,
            notes,
            completedAt: new Date()
        };
        
        user.mentalHealthData.mindfulnessSessions.push(session);
        await user.save();
        
        res.json({
            success: true,
            data: session,
            message: 'Mindfulness session completed successfully'
        });
    } catch (error) {
        console.error('Error saving mindfulness session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save mindfulness session',
            details: error.message
        });
    }
});

module.exports = router;
