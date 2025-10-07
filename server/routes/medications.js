const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const axios = require('axios');

// @route   POST /api/medications/add
// @desc    Add a new medication to user's regimen
// @access  Private
router.post('/add', auth, async (req, res) => {
    try {
        const {
            name,
            generic_name,
            dosage,
            frequency,
            custom_times,
            start_date,
            end_date,
            instructions,
            prescribing_doctor,
            refills_remaining,
            quantity,
            condition_treated,
            side_effects
        } = req.body;

        // Validate required fields
        if (!name || !dosage || !frequency || !start_date) {
            return res.status(400).json({
                message: 'Name, dosage, frequency, and start date are required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare medication data
        const medicationData = {
            id: Date.now().toString(),
            name: name.trim(),
            generic_name: generic_name || name.trim(),
            dosage: dosage.trim(),
            frequency,
            custom_times,
            start_date,
            end_date,
            instructions: instructions || '',
            prescribing_doctor: prescribing_doctor || '',
            refills_remaining: parseInt(refills_remaining) || 0,
            quantity: parseInt(quantity) || 30,
            condition_treated: condition_treated || '',
            side_effects: side_effects || [],
            status: 'active',
            created_at: new Date().toISOString()
        };

        // Try AI service for medication analysis with fallback
        let aiAnalysis;
        try {
            // Only attempt AI service call if configured properly
            if (process.env.AI_MODEL_URL && process.env.AI_MODEL_URL !== 'http://localhost:5001') {
                const aiResponse = await axios.post(`${process.env.AI_MODEL_URL}/medications/analyze`, {
                    medication_data: medicationData,
                    user_profile: {
                        age: user.age,
                        weight: user.weight,
                        height: user.height,
                        chronic_conditions: user.chronic_conditions || [],
                        current_medications: user.medications || []
                    }
                }, {
                    timeout: 5000
                });
                
                if (aiResponse.status === 200) {
                    aiAnalysis = aiResponse.data;
                }
            } else {
                throw new Error('AI service not configured');
            }
        } catch (aiError) {
            console.log('AI service unavailable, using fallback medication analysis...');
            // Generate fallback analysis
            aiAnalysis = generateFallbackMedicationAnalysis(medicationData, user);
        }

        // Initialize medications array if not exists
        if (!user.medications) {
            user.medications = [];
        }

        // Add medication to user's medications
        user.medications.push(medicationData);
        await user.save();

        res.json({
            success: true,
            message: 'Medication added successfully',
            data: {
                medication: medicationData,
                medication_info: aiAnalysis.medication_info || {},
                dosage_validation: aiAnalysis.dosage_validation || { status: 'safe', message: 'Standard dosage' },
                next_doses: aiAnalysis.next_doses || [],
                interactions: aiAnalysis.interactions || [],
                recommendations: aiAnalysis.recommendations || []
            }
        });

    } catch (error) {
        console.error('Error adding medication:', error);
        res.status(500).json({ 
            message: 'Error adding medication',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/medications/list
// @desc    Get all user medications
// @access  Private
router.get('/list', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const activeMedications = medications.filter(med => med.status === 'active');

        res.json({
            success: true,
            data: {
                all_medications: medications,
                active_medications: activeMedications,
                total_count: medications.length,
                active_count: activeMedications.length
            }
        });

    } catch (error) {
        console.error('Error fetching medications:', error);
        res.status(500).json({ 
            message: 'Error fetching medications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/medications/interactions
// @desc    Check for drug interactions
// @access  Private
router.post('/interactions', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const activeMedications = medications.filter(med => med.status === 'active');

        if (activeMedications.length === 0) {
            return res.json({
                success: true,
                data: {
                    total_interactions: 0,
                    severe: [],
                    major: [],
                    moderate: [],
                    minor: [],
                    risk_level: 'minimal',
                    recommendations: ['No medications to check for interactions']
                }
            });
        }

        // Try calling AI service for interaction checking
        try {
            const aiResponse = await axios.post('http://localhost:3001/analyze_interactions', {
                medications: activeMedications
            }, { timeout: 5000 });

            if (aiResponse.status === 200) {
                return res.json({
                    success: true,
                    data: aiResponse.data
                });
            }
        } catch (aiError) {
            console.log('AI service unavailable for interactions, using fallback...');
        }

        // Fallback when AI service is unavailable
        const fallbackData = generateFallbackInteractions(activeMedications);
        
        res.json({
            success: true,
            data: fallbackData
        });

    } catch (error) {
        console.error('Error checking drug interactions:', error);
        res.status(500).json({ 
            message: 'Error checking drug interactions',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/medications/reminders
// @desc    Get medication reminders
// @access  Private
router.get('/reminders', auth, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const activeMedications = medications.filter(med => med.status === 'active');

        if (activeMedications.length === 0) {
            return res.json({
                success: true,
                data: {
                    reminders: [],
                    today_count: 0,
                    upcoming_count: 0
                }
            });
        }

        // Try calling AI service for reminder generation
        try {
            const aiResponse = await axios.post('http://localhost:3001/analyze_reminders', {
                medications: activeMedications,
                days: days
            }, { timeout: 5000 });

            if (aiResponse.status === 200) {
                const reminders = aiResponse.data.reminders;
                const today = new Date().toDateString();
                const todayReminders = reminders.filter(r => 
                    new Date(r.scheduled_time).toDateString() === today
                );

                return res.json({
                    success: true,
                    data: {
                        reminders: reminders,
                        today_count: todayReminders.length,
                        upcoming_count: reminders.length - todayReminders.length,
                        days: days
                    }
                });
            }
        } catch (aiError) {
            console.log('AI service unavailable for reminders, using fallback...');
        }

        // Fallback when AI service is unavailable
        const fallbackData = generateFallbackReminders(activeMedications, days);
        
        res.json({
            success: true,
            data: fallbackData
        });

    } catch (error) {
        console.error('Error generating reminders:', error);
        res.status(500).json({ 
            message: 'Error generating reminders',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/medications/take
// @desc    Mark medication as taken
// @access  Private
router.post('/take', auth, async (req, res) => {
    try {
        const { medication_id, scheduled_time, actual_time, notes } = req.body;

        if (!medication_id || !scheduled_time) {
            return res.status(400).json({
                message: 'Medication ID and scheduled time are required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize medication history if not exists
        if (!user.medicationHistory) {
            user.medicationHistory = [];
        }

        // Add to medication history
        const medicationTaken = {
            medication_id,
            scheduled_time: new Date(scheduled_time),
            taken_time: actual_time ? new Date(actual_time) : new Date(),
            taken: true,
            missed: false,
            notes: notes || ''
        };

        user.medicationHistory.push(medicationTaken);
        await user.save();

        res.json({
            success: true,
            message: 'Medication marked as taken',
            data: medicationTaken
        });

    } catch (error) {
        console.error('Error marking medication as taken:', error);
        res.status(500).json({ 
            message: 'Error updating medication status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/medications/miss
// @desc    Mark medication as missed
// @access  Private
router.post('/miss', auth, async (req, res) => {
    try {
        const { medication_id, scheduled_time, reason } = req.body;

        if (!medication_id || !scheduled_time) {
            return res.status(400).json({
                message: 'Medication ID and scheduled time are required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize medication history if not exists
        if (!user.medicationHistory) {
            user.medicationHistory = [];
        }

        // Add to medication history
        const medicationMissed = {
            medication_id,
            scheduled_time: new Date(scheduled_time),
            taken_time: null,
            taken: false,
            missed: true,
            notes: reason || 'Marked as missed'
        };

        user.medicationHistory.push(medicationMissed);
        await user.save();

        res.json({
            success: true,
            message: 'Medication marked as missed',
            data: medicationMissed
        });

    } catch (error) {
        console.error('Error marking medication as missed:', error);
        res.status(500).json({ 
            message: 'Error updating medication status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/medications/adherence
// @desc    Get medication adherence statistics
// @access  Private
router.get('/adherence', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const medicationHistory = user.medicationHistory || [];
        const activeMedications = medications.filter(med => med.status === 'active');

        if (activeMedications.length === 0) {
            return res.json({
                success: true,
                data: {
                    adherence_reports: [],
                    overall_adherence: 0
                }
            });
        }

        // Call AI service for adherence calculation
        const adherencePromises = activeMedications.map(async (med) => {
            try {
                const aiResponse = await axios.post('http://localhost:5001/api/medications/adherence', {
                    medication_id: med.id,
                    medication_history: medicationHistory.filter(h => h.medication_id === med.id)
                });
                
                if (aiResponse.status === 200) {
                    return aiResponse.data;
                }
                return null;
            } catch (error) {
                console.error(`Error calculating adherence for ${med.id}:`, error);
                return null;
            }
        });

        const adherenceReports = (await Promise.all(adherencePromises)).filter(report => report !== null);
        
        // Calculate overall adherence
        const totalAdherence = adherenceReports.reduce((sum, report) => sum + report.adherence_percentage, 0);
        const overallAdherence = adherenceReports.length > 0 ? totalAdherence / adherenceReports.length : 0;

        res.json({
            success: true,
            data: {
                adherence_reports: adherenceReports,
                overall_adherence: Math.round(overallAdherence * 10) / 10
            }
        });

    } catch (error) {
        console.error('Error calculating adherence:', error);
        res.status(500).json({ 
            message: 'Error calculating adherence',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/medications/refill-alerts
// @desc    Get refill alerts for medications
// @access  Private
router.get('/refill-alerts', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const activeMedications = medications.filter(med => med.status === 'active');

        if (activeMedications.length === 0) {
            return res.json({
                success: true,
                data: {
                    refill_alerts: [],
                    critical_count: 0,
                    warning_count: 0
                }
            });
        }

        // Try calling AI service for refill checking
        try {
            const aiResponse = await axios.post('http://localhost:3001/analyze_refills', {
                medications: activeMedications
            }, { timeout: 5000 });

            if (aiResponse.status === 200) {
                const alerts = aiResponse.data.refill_alerts;
                const criticalAlerts = alerts.filter(alert => alert.alert_level === 'critical');
                const warningAlerts = alerts.filter(alert => alert.alert_level === 'warning');

                return res.json({
                    success: true,
                    data: {
                        refill_alerts: alerts,
                        critical_count: criticalAlerts.length,
                        warning_count: warningAlerts.length,
                        total_alerts: alerts.length
                    }
                });
            }
        } catch (aiError) {
            console.log('AI service unavailable for refill alerts, using fallback...');
        }

        // Fallback when AI service is unavailable
        const fallbackData = generateFallbackRefillAlerts(activeMedications);
        
        res.json({
            success: true,
            data: fallbackData
        });

    } catch (error) {
        console.error('Error checking refill alerts:', error);
        res.status(500).json({ 
            message: 'Error checking refill alerts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/medications/side-effects
// @desc    Analyze potential medication side effects
// @access  Private
router.post('/side-effects', auth, async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms)) {
            return res.status(400).json({
                message: 'Symptoms array is required'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const activeMedications = medications.filter(med => med.status === 'active');

        // Call AI service for side effect analysis
        const aiResponse = await axios.post('http://localhost:5001/api/medications/side-effects', {
            medications: activeMedications,
            reported_symptoms: symptoms
        });

        if (aiResponse.status === 200) {
            res.json({
                success: true,
                data: aiResponse.data
            });
        } else {
            res.status(500).json({ 
                message: 'Failed to analyze side effects',
                error: 'AI service unavailable'
            });
        }

    } catch (error) {
        console.error('Error analyzing side effects:', error);
        res.status(500).json({ 
            message: 'Error analyzing side effects',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   PUT /api/medications/:id/update
// @desc    Update medication details
// @access  Private
router.put('/:id/update', auth, async (req, res) => {
    try {
        const medicationId = req.params.id;
        const updates = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const medicationIndex = medications.findIndex(med => med.id === medicationId);

        if (medicationIndex === -1) {
            return res.status(404).json({ message: 'Medication not found' });
        }

        // Update medication
        medications[medicationIndex] = { ...medications[medicationIndex], ...updates };
        user.medications = medications;
        await user.save();

        res.json({
            success: true,
            message: 'Medication updated successfully',
            data: medications[medicationIndex]
        });

    } catch (error) {
        console.error('Error updating medication:', error);
        res.status(500).json({ 
            message: 'Error updating medication',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   DELETE /api/medications/:id
// @desc    Delete/discontinue medication
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const medicationId = req.params.id;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const medications = user.medications || [];
        const medicationIndex = medications.findIndex(med => med.id === medicationId);

        if (medicationIndex === -1) {
            return res.status(404).json({ message: 'Medication not found' });
        }

        // Mark as discontinued instead of deleting
        medications[medicationIndex].status = 'discontinued';
        medications[medicationIndex].end_date = new Date().toISOString();
        
        user.medications = medications;
        await user.save();

        res.json({
            success: true,
            message: 'Medication discontinued successfully'
        });

    } catch (error) {
        console.error('Error discontinuing medication:', error);
        res.status(500).json({ 
            message: 'Error discontinuing medication',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Fallback function to generate medication analysis when AI service is unavailable
function generateFallbackMedicationAnalysis(medicationData, user) {
    console.log('Generating fallback medication analysis...');
    
    const commonMedications = {
        'aspirin': { category: 'Pain Relief', common_side_effects: ['Stomach upset', 'Bleeding risk'] },
        'ibuprofen': { category: 'Anti-inflammatory', common_side_effects: ['Stomach irritation', 'Dizziness'] },
        'acetaminophen': { category: 'Pain Relief', common_side_effects: ['Liver damage (high doses)'] },
        'metformin': { category: 'Diabetes', common_side_effects: ['Nausea', 'Diarrhea'] },
        'lisinopril': { category: 'Blood Pressure', common_side_effects: ['Dry cough', 'Dizziness'] },
        'omeprazole': { category: 'Acid Reducer', common_side_effects: ['Headache', 'Nausea'] }
    };
    
    const medicationName = medicationData.name.toLowerCase();
    const knownMed = Object.keys(commonMedications).find(med => 
        medicationName.includes(med)
    );
    
    const medicationInfo = knownMed ? commonMedications[knownMed] : {
        category: 'General',
        common_side_effects: ['Consult your healthcare provider for specific side effects']
    };
    
    // Generate next doses based on frequency
    const nextDoses = [];
    const now = new Date();
    const frequency = medicationData.frequency;
    
    let timesPerDay = 1;
    if (frequency.includes('twice') || frequency.includes('2')) timesPerDay = 2;
    else if (frequency.includes('three') || frequency.includes('3')) timesPerDay = 3;
    else if (frequency.includes('four') || frequency.includes('4')) timesPerDay = 4;
    
    const hoursInterval = 24 / timesPerDay;
    
    for (let i = 0; i < 3; i++) {
        const nextDoseTime = new Date(now.getTime() + (i * hoursInterval * 60 * 60 * 1000));
        nextDoses.push({
            time: nextDoseTime.toISOString(),
            dosage: medicationData.dosage,
            status: 'scheduled'
        });
    }
    
    // Check for basic interactions with current medications
    const interactions = [];
    const currentMeds = user.medications || [];
    
    currentMeds.forEach(existingMed => {
        if (existingMed.name.toLowerCase().includes('warfarin') && 
            medicationName.includes('aspirin')) {
            interactions.push({
                medication: existingMed.name,
                severity: 'high',
                description: 'Increased bleeding risk when combined with blood thinners'
            });
        }
    });
    
    return {
        medication_info: {
            category: medicationInfo.category,
            common_side_effects: medicationInfo.common_side_effects,
            description: `${medicationData.name} - ${medicationInfo.category} medication`
        },
        dosage_validation: {
            status: 'safe',
            message: 'Standard dosage - consult healthcare provider for specific guidance'
        },
        next_doses: nextDoses,
        interactions: interactions,
        recommendations: [
            'Take medication as prescribed',
            'Monitor for side effects',
            'Consult healthcare provider if you experience unusual symptoms',
            'Keep medication in a safe, dry place'
        ],
        service_status: 'fallback'
    };
}

// Fallback function to generate reminders when AI service is unavailable
function generateFallbackReminders(medications, days) {
    console.log('Generating fallback medication reminders...');
    
    const reminders = [];
    const now = new Date();
    
    medications.forEach(med => {
        const frequency = med.frequency || 'once daily';
        let timesPerDay = 1;
        
        if (frequency.includes('twice') || frequency.includes('2')) timesPerDay = 2;
        else if (frequency.includes('three') || frequency.includes('3')) timesPerDay = 3;
        else if (frequency.includes('four') || frequency.includes('4')) timesPerDay = 4;
        
        const hoursInterval = 24 / timesPerDay;
        
        // Generate reminders for the specified number of days
        for (let day = 0; day < days; day++) {
            for (let dose = 0; dose < timesPerDay; dose++) {
                const reminderTime = new Date(now);
                reminderTime.setDate(now.getDate() + day);
                reminderTime.setHours(8 + (dose * hoursInterval), 0, 0, 0); // Start at 8 AM
                
                reminders.push({
                    medication_id: med._id,
                    medication_name: med.name,
                    dosage: med.dosage,
                    scheduled_time: reminderTime.toISOString(),
                    status: 'pending',
                    type: 'scheduled_dose',
                    instructions: med.instructions || 'Take as prescribed'
                });
            }
        }
    });
    
    const today = new Date().toDateString();
    const todayReminders = reminders.filter(r => 
        new Date(r.scheduled_time).toDateString() === today
    );
    
    return {
        reminders: reminders,
        today_count: todayReminders.length,
        upcoming_count: reminders.length - todayReminders.length,
        days: days,
        service_status: 'fallback'
    };
}

// Fallback function to check interactions when AI service is unavailable
function generateFallbackInteractions(medications) {
    console.log('Generating fallback drug interactions...');
    
    const interactions = [];
    const knownInteractions = {
        'warfarin': ['aspirin', 'ibuprofen'],
        'aspirin': ['warfarin', 'metformin'],
        'lisinopril': ['potassium', 'lithium'],
        'metformin': ['alcohol', 'aspirin']
    };
    
    // Check for known interactions
    for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
            const med1 = medications[i].name.toLowerCase();
            const med2 = medications[j].name.toLowerCase();
            
            const med1Key = Object.keys(knownInteractions).find(key => med1.includes(key));
            const med2Key = Object.keys(knownInteractions).find(key => med2.includes(key));
            
            if (med1Key && knownInteractions[med1Key].some(interacting => med2.includes(interacting))) {
                interactions.push({
                    medication1: medications[i].name,
                    medication2: medications[j].name,
                    severity: 'moderate',
                    description: 'Potential interaction detected - consult healthcare provider',
                    recommendation: 'Monitor for side effects and consult your doctor'
                });
            }
        }
    }
    
    const severe = interactions.filter(i => i.severity === 'severe');
    const major = interactions.filter(i => i.severity === 'major');
    const moderate = interactions.filter(i => i.severity === 'moderate');
    const minor = interactions.filter(i => i.severity === 'minor');
    
    let riskLevel = 'minimal';
    if (severe.length > 0) riskLevel = 'high';
    else if (major.length > 0) riskLevel = 'moderate';
    else if (moderate.length > 0) riskLevel = 'low';
    
    return {
        total_interactions: interactions.length,
        severe: severe,
        major: major,
        moderate: moderate,
        minor: minor,
        risk_level: riskLevel,
        recommendations: interactions.length > 0 ? 
            ['Review medications with healthcare provider', 'Monitor for side effects'] :
            ['No significant interactions detected'],
        service_status: 'fallback'
    };
}

// Fallback function to generate refill alerts when AI service is unavailable
function generateFallbackRefillAlerts(medications) {
    console.log('Generating fallback refill alerts...');
    
    const alerts = [];
    
    medications.forEach(med => {
        const refillsRemaining = med.refills_remaining || 0;
        const quantity = med.quantity || 30;
        const startDate = new Date(med.start_date);
        const daysSinceStart = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
        
        // Estimate remaining pills based on frequency
        const frequency = med.frequency || 'once daily';
        let pillsPerDay = 1;
        if (frequency.includes('twice') || frequency.includes('2')) pillsPerDay = 2;
        else if (frequency.includes('three') || frequency.includes('3')) pillsPerDay = 3;
        else if (frequency.includes('four') || frequency.includes('4')) pillsPerDay = 4;
        
        const pillsUsed = daysSinceStart * pillsPerDay;
        const estimatedRemaining = Math.max(0, quantity - pillsUsed);
        const daysRemaining = Math.floor(estimatedRemaining / pillsPerDay);
        
        let alertLevel = 'info';
        let message = 'Refill not needed yet';
        
        if (daysRemaining <= 3) {
            alertLevel = 'critical';
            message = 'Refill needed immediately - only a few days remaining';
        } else if (daysRemaining <= 7) {
            alertLevel = 'warning';
            message = 'Refill needed soon - less than a week remaining';
        } else if (daysRemaining <= 14) {
            alertLevel = 'info';
            message = 'Consider refilling soon';
        }
        
        if (daysRemaining <= 14) {
            alerts.push({
                medication_id: med._id,
                medication_name: med.name,
                alert_level: alertLevel,
                days_remaining: daysRemaining,
                estimated_pills_remaining: estimatedRemaining,
                refills_remaining: refillsRemaining,
                message: message,
                action_required: daysRemaining <= 7
            });
        }
    });
    
    const criticalAlerts = alerts.filter(alert => alert.alert_level === 'critical');
    const warningAlerts = alerts.filter(alert => alert.alert_level === 'warning');
    
    return {
        refill_alerts: alerts,
        critical_count: criticalAlerts.length,
        warning_count: warningAlerts.length,
        total_alerts: alerts.length,
        service_status: 'fallback'
    };
}

module.exports = router;