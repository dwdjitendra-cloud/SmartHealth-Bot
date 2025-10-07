const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const axios = require('axios');

// @route   GET /api/vital-signs/simulate
// @desc    Simulate wearable device data for a user
// @access  Private
router.get('/simulate', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Duration in hours (default 24 hours)
        const duration = req.query.duration || 24;

        // Prepare user profile for AI service
        const userProfile = {
            age: user.age || 30,
            bmi: user.height && user.weight ? 
                (user.weight / Math.pow(user.height / 100, 2)) : 22,
            smoking: user.smokingStatus === 'smoker',
            exercise_frequency: user.exerciseFrequency || 3,
            chronic_conditions: user.chronicConditions || []
        };

        // Call AI service to simulate wearable data with fallback
        let vitalSignsData, analysis;
        
        try {
            // Only attempt AI service call if configured properly
            if (process.env.AI_MODEL_URL && process.env.AI_MODEL_URL !== 'http://localhost:5001') {
                const aiResponse = await axios.post(`${process.env.AI_MODEL_URL}/vital-signs/simulate`, {
                    user_profile: userProfile,
                    duration_hours: parseInt(duration)
                }, {
                    timeout: 5000
                });
                
                if (aiResponse.status === 200) {
                    vitalSignsData = aiResponse.data.vital_signs_data;
                    analysis = aiResponse.data.analysis;
                }
            } else {
                throw new Error('AI service not configured');
            }
        } catch (aiError) {
            console.log('AI service unavailable, generating fallback vital signs data...');
            // Generate fallback vital signs data
            const fallbackData = generateFallbackVitalSigns(userProfile, parseInt(duration));
            vitalSignsData = fallbackData.vital_signs_data;
            analysis = fallbackData.analysis;
        }

        // Store the simulated data
        if (!user.vitalSignsHistory) {
            user.vitalSignsHistory = [];
        }

        // Add new readings to history (keep last 168 hours = 7 days)
        user.vitalSignsHistory = user.vitalSignsHistory.concat(vitalSignsData)
            .slice(-168);

        await user.save();

        res.json({
            success: true,
            message: 'Wearable data simulated successfully',
            data: {
                vital_signs: vitalSignsData,
                analysis: analysis,
                duration_hours: duration
            }
        });

    } catch (error) {
        console.error('Error simulating vital signs:', error);
        res.status(500).json({ 
            message: 'Error simulating vital signs',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/vital-signs/latest
// @desc    Get latest vital signs readings for a user
// @access  Private
router.get('/latest', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const vitalSignsHistory = user.vitalSignsHistory || [];
        
        if (vitalSignsHistory.length === 0) {
            return res.json({
                success: true,
                message: 'No vital signs data available',
                data: {
                    latest_reading: null,
                    recent_readings: [],
                    has_data: false
                }
            });
        }

        // Get latest reading and last 24 hours
        const latest = vitalSignsHistory[vitalSignsHistory.length - 1];
        const last24Hours = vitalSignsHistory.slice(-24);

        res.json({
            success: true,
            data: {
                latest_reading: latest,
                recent_readings: last24Hours,
                has_data: true,
                total_readings: vitalSignsHistory.length
            }
        });

    } catch (error) {
        console.error('Error fetching latest vital signs:', error);
        res.status(500).json({ 
            message: 'Error fetching vital signs',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/vital-signs/analysis
// @desc    Get comprehensive analysis of vital signs data
// @access  Private
router.get('/analysis', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const vitalSignsHistory = user.vitalSignsHistory || [];
        
        if (vitalSignsHistory.length === 0) {
            return res.json({
                success: true,
                message: 'No vital signs data available for analysis',
                data: null
            });
        }

        // Call AI service for analysis with fallback
        let analysis;
        
        try {
            // Only attempt AI service call if configured properly
            if (process.env.AI_MODEL_URL && process.env.AI_MODEL_URL !== 'http://localhost:5001') {
                const aiResponse = await axios.post(`${process.env.AI_MODEL_URL}/vital-signs/analyze`, {
                    vital_signs_data: vitalSignsHistory
                }, {
                    timeout: 5000
                });
                
                if (aiResponse.status === 200) {
                    analysis = aiResponse.data.analysis;
                }
            } else {
                throw new Error('AI service not configured');
            }
        } catch (aiError) {
            console.log('AI service unavailable, generating fallback analysis...');
            // Generate fallback analysis
            analysis = generateFallbackAnalysis(vitalSignsHistory);
        }

        res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Error analyzing vital signs:', error);
        res.status(500).json({ 
            message: 'Error analyzing vital signs',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/vital-signs/manual
// @desc    Manually add vital signs reading
// @access  Private
router.post('/manual', auth, async (req, res) => {
    try {
        const {
            heart_rate,
            blood_pressure_systolic,
            blood_pressure_diastolic,
            temperature,
            oxygen_saturation,
            steps,
            sleep_hours,
            stress_level
        } = req.body;

        // Validate required fields
        if (!heart_rate || !blood_pressure_systolic || !blood_pressure_diastolic) {
            return res.status(400).json({
                message: 'Heart rate and blood pressure readings are required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create new vital signs reading with better validation
        const newReading = {
            timestamp: new Date(),
            heart_rate: parseInt(heart_rate) || 0,
            blood_pressure_systolic: parseInt(blood_pressure_systolic) || 0,
            blood_pressure_diastolic: parseInt(blood_pressure_diastolic) || 0,
            temperature: temperature && temperature !== '' ? parseFloat(temperature) : null,
            oxygen_saturation: oxygen_saturation && oxygen_saturation !== '' ? parseInt(oxygen_saturation) : null,
            steps: steps && steps !== '' ? parseInt(steps) : 0,
            calories_burned: 0, // Can be calculated based on other metrics
            sleep_hours: sleep_hours && sleep_hours !== '' ? parseFloat(sleep_hours) : 0,
            stress_level: stress_level && stress_level !== '' ? parseInt(stress_level) : null
        };

        // Initialize vital signs history if not exists
        if (!user.vitalSignsHistory) {
            user.vitalSignsHistory = [];
        }

        // Add new reading
        user.vitalSignsHistory.push(newReading);

        // Keep only last 168 readings (7 days)
        if (user.vitalSignsHistory.length > 168) {
            user.vitalSignsHistory = user.vitalSignsHistory.slice(-168);
        }

        await user.save();

        res.json({
            success: true,
            message: 'Vital signs reading added successfully',
            data: {
                reading: newReading,
                total_readings: user.vitalSignsHistory.length
            }
        });

    } catch (error) {
        console.error('Error adding manual vital signs:', error);
        console.error('Request body:', req.body);
        console.error('User ID:', req.user?._id);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            message: 'Error adding vital signs reading',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/vital-signs/alerts
// @desc    Get current health alerts based on vital signs
// @access  Private
router.get('/alerts', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const vitalSignsHistory = user.vitalSignsHistory || [];
        
        if (vitalSignsHistory.length === 0) {
            return res.json({
                success: true,
                data: {
                    alerts: [],
                    alert_count: 0,
                    has_critical_alerts: false
                }
            });
        }

        // Get recent readings for alert analysis
        const recentReadings = vitalSignsHistory.slice(-10);

        // Call AI service for alert generation
        const aiResponse = await axios.post('http://localhost:5000/api/vital-signs/alerts', {
            recent_vitals: recentReadings
        });

        if (aiResponse.status === 200) {
            const alerts = aiResponse.data.alerts || [];
            const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
            
            res.json({
                success: true,
                data: {
                    alerts: alerts,
                    alert_count: alerts.length,
                    has_critical_alerts: criticalAlerts.length > 0,
                    critical_count: criticalAlerts.length
                }
            });
        } else {
            res.status(500).json({ 
                message: 'Failed to generate alerts',
                error: 'AI service unavailable'
            });
        }

    } catch (error) {
        console.error('Error fetching vital signs alerts:', error);
        res.status(500).json({ 
            message: 'Error fetching alerts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/vital-signs/trends
// @desc    Get vital signs trends over time
// @access  Private
router.get('/trends', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const period = req.query.period || '7d'; // 24h, 7d, 30d
        const vitalSignsHistory = user.vitalSignsHistory || [];
        
        if (vitalSignsHistory.length === 0) {
            return res.json({
                success: true,
                message: 'No vital signs data available for trends',
                data: null
            });
        }

        // Filter data based on period
        let filteredData = vitalSignsHistory;
        const now = new Date();
        
        switch (period) {
            case '24h':
                const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                filteredData = vitalSignsHistory.filter(reading => 
                    new Date(reading.timestamp) >= twentyFourHoursAgo
                );
                break;
            case '7d':
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredData = vitalSignsHistory.filter(reading => 
                    new Date(reading.timestamp) >= sevenDaysAgo
                );
                break;
            case '30d':
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredData = vitalSignsHistory.filter(reading => 
                    new Date(reading.timestamp) >= thirtyDaysAgo
                );
                break;
        }

        // Call AI service for trend analysis
        const aiResponse = await axios.post('http://localhost:5000/api/vital-signs/trends', {
            vital_signs_data: filteredData,
            period: period
        });

        if (aiResponse.status === 200) {
            res.json({
                success: true,
                data: {
                    period: period,
                    data_points: filteredData.length,
                    trends: aiResponse.data.trends
                }
            });
        } else {
            res.status(500).json({ 
                message: 'Failed to analyze trends',
                error: 'AI service unavailable'
            });
        }

    } catch (error) {
        console.error('Error analyzing vital signs trends:', error);
        res.status(500).json({ 
            message: 'Error analyzing trends',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Fallback function to generate vital signs data when AI service is unavailable
function generateFallbackVitalSigns(userProfile, duration) {
    console.log('Generating fallback vital signs data...');
    
    const baseValues = {
        heart_rate: userProfile.age > 60 ? 75 : 70,
        systolic_bp: userProfile.age > 50 ? 130 : 120,
        diastolic_bp: userProfile.age > 50 ? 85 : 80,
        temperature: 98.6,
        oxygen_saturation: userProfile.smoking ? 96 : 98,
        stress_level: userProfile.smoking ? 'moderate' : 'low'
    };
    
    // Adjust for health conditions
    if (userProfile.smoking) {
        baseValues.heart_rate += 10;
        baseValues.systolic_bp += 15;
    }
    
    if (userProfile.bmi > 25) {
        baseValues.heart_rate += 5;
        baseValues.systolic_bp += 10;
    }
    
    const vitalSignsData = [];
    const now = new Date();
    
    for (let i = 0; i < duration; i++) {
        const timestamp = new Date(now.getTime() - (duration - i - 1) * 60 * 60 * 1000);
        
        // Add some realistic variation
        const variation = {
            heart_rate: Math.random() * 20 - 10,
            systolic_bp: Math.random() * 20 - 10,
            diastolic_bp: Math.random() * 10 - 5,
            temperature: Math.random() * 2 - 1,
            oxygen_saturation: Math.random() * 2 - 1
        };
        
        vitalSignsData.push({
            timestamp: timestamp.toISOString(),
            heart_rate: Math.round(baseValues.heart_rate + variation.heart_rate),
            blood_pressure_systolic: Math.round(baseValues.systolic_bp + variation.systolic_bp),
            blood_pressure_diastolic: Math.round(baseValues.diastolic_bp + variation.diastolic_bp),
            temperature: Math.round((baseValues.temperature + variation.temperature) * 10) / 10,
            oxygen_saturation: Math.round((baseValues.oxygen_saturation + variation.oxygen_saturation) * 10) / 10,
            stress_level: baseValues.stress_level
        });
    }
    
    const analysis = generateFallbackAnalysis(vitalSignsData);
    
    return {
        vital_signs_data: vitalSignsData,
        analysis: analysis
    };
}

// Fallback function to generate analysis when AI service is unavailable
function generateFallbackAnalysis(vitalSignsData) {
    if (!vitalSignsData || vitalSignsData.length === 0) {
        return {
            status: 'no_data',
            message: 'No vital signs data available for analysis',
            recommendations: ['Start monitoring your vital signs regularly']
        };
    }
    
    const latest = vitalSignsData[vitalSignsData.length - 1];
    const average = vitalSignsData.reduce((acc, reading) => {
        acc.heart_rate += reading.heart_rate || 0;
        acc.systolic += reading.blood_pressure_systolic || 0;
        acc.diastolic += reading.blood_pressure_diastolic || 0;
        acc.temp += reading.temperature || 0;
        acc.oxygen += reading.oxygen_saturation || 0;
        return acc;
    }, { heart_rate: 0, systolic: 0, diastolic: 0, temp: 0, oxygen: 0 });
    
    const count = vitalSignsData.length;
    Object.keys(average).forEach(key => {
        average[key] = Math.round((average[key] / count) * 10) / 10;
    });
    
    let status = 'normal';
    let concerns = [];
    let recommendations = [];
    
    // Check for concerning values
    if (latest.heart_rate > 100) {
        status = 'attention_needed';
        concerns.push('Elevated heart rate detected');
        recommendations.push('Monitor heart rate and consider consulting healthcare provider');
    }
    
    if (latest.blood_pressure_systolic > 140 || latest.blood_pressure_diastolic > 90) {
        status = 'attention_needed';
        concerns.push('High blood pressure detected');
        recommendations.push('Monitor blood pressure regularly and consider lifestyle changes');
    }
    
    if (latest.oxygen_saturation < 95) {
        status = 'concerning';
        concerns.push('Low oxygen saturation detected');
        recommendations.push('Seek immediate medical attention if symptoms persist');
    }
    
    if (concerns.length === 0) {
        recommendations = [
            'Continue regular monitoring',
            'Maintain healthy lifestyle habits',
            'Stay hydrated and get adequate rest'
        ];
    }
    
    return {
        status: status,
        overall_health_score: status === 'normal' ? 85 : status === 'attention_needed' ? 70 : 50,
        latest_reading: latest,
        averages: average,
        trends: {
            heart_rate: 'stable',
            blood_pressure: 'stable',
            temperature: 'normal',
            oxygen_saturation: 'stable'
        },
        concerns: concerns,
        recommendations: recommendations,
        data_points: count,
        analysis_date: new Date().toISOString(),
        service_status: 'fallback'
    };
}

module.exports = router;