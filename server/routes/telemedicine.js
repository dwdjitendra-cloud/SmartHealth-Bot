const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const axios = require('axios');

const router = express.Router();

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Get available doctors for consultation
router.get('/doctors', auth, async (req, res) => {
    try {
        const { specialty, consultation_type = 'video' } = req.query;
        
        try {
            const response = await axios.get(`${AI_SERVICE_URL}/api/telemedicine/doctors`, {
                params: { specialty, consultation_type },
                timeout: 3000
            });
            res.json(response.data);
        } catch (aiError) {
            // Fallback when AI service is unavailable
            console.log('AI service unavailable, using fallback data for doctors');
            const fallbackDoctors = [
                {
                    id: 'dr001',
                    name: 'Dr. Priya Sharma',
                    specialty: 'General Medicine',
                    availability: 'Available now',
                    rating: 4.8,
                    consultation_types: ['video', 'chat'],
                    next_slot: new Date(Date.now() + 30 * 60 * 1000)
                },
                {
                    id: 'dr002', 
                    name: 'Dr. Rajesh Kumar',
                    specialty: 'Cardiology',
                    availability: 'Available in 15 min',
                    rating: 4.9,
                    consultation_types: ['video', 'chat'],
                    next_slot: new Date(Date.now() + 45 * 60 * 1000)
                },
                {
                    id: 'dr003',
                    name: 'Dr. Emily Davis',
                    specialty: 'Mental Health',
                    availability: 'Available now',
                    rating: 4.7,
                    consultation_types: ['video', 'chat', 'phone'],
                    next_slot: new Date(Date.now() + 20 * 60 * 1000)
                }
            ];
            
            res.json({
                success: true,
                data: fallbackDoctors.filter(doc => 
                    !specialty || doc.specialty.toLowerCase().includes(specialty.toLowerCase())
                )
            });
        }
    } catch (error) {
        console.error('Error getting available doctors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get available doctors',
            details: error.message
        });
    }
});

// Book a telemedicine appointment
router.post('/book', auth, async (req, res) => {
    try {
        const { doctor_id, slot_datetime, consultation_type, symptoms, notes } = req.body;
        
        if (!doctor_id || !slot_datetime) {
            return res.status(400).json({
                success: false,
                error: 'Doctor ID and slot datetime are required'
            });
        }
        
        const appointmentData = {
            user_id: req.user._id,
            doctor_id,
            slot_datetime,
            consultation_type: consultation_type || 'video',
            symptoms: symptoms || '',
            notes: notes || ''
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/telemedicine/book`, appointmentData);
        
        if (response.data.success) {
            // Store appointment reference in user's profile
            const user = await User.findById(req.user._id);
            if (!user.telemedicineAppointments) {
                user.telemedicineAppointments = [];
            }
            
            user.telemedicineAppointments.push({
                appointmentId: response.data.appointment.appointment_id,
                doctorId: doctor_id,
                doctorName: response.data.appointment.doctor_name,
                specialty: response.data.appointment.specialty,
                scheduledTime: slot_datetime,
                consultationType: consultation_type || 'video',
                status: 'scheduled',
                bookedAt: new Date()
            });
            
            await user.save();
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to book appointment',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get user's appointments
router.get('/appointments', auth, async (req, res) => {
    try {
        const { status } = req.query;
        
        try {
            const response = await axios.get(`${AI_SERVICE_URL}/api/telemedicine/appointments/${req.user._id}`, {
                params: { status },
                timeout: 3000
            });
            res.json(response.data);
        } catch (aiError) {
            // Fallback when AI service is unavailable
            console.log('AI service unavailable, using fallback data for appointments');
            const fallbackAppointments = [
                {
                    id: 'apt001',
                    doctor_name: 'Dr. Priya Sharma',
                    specialty: 'General Medicine',
                    appointment_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
                    status: 'confirmed',
                    consultation_type: 'video'
                },
                {
                    id: 'apt002',
                    doctor_name: 'Dr. Rajesh Kumar',
                    specialty: 'Cardiology',
                    appointment_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    status: 'pending',
                    consultation_type: 'video'
                }
            ];
            
            res.json({
                success: true,
                data: fallbackAppointments.filter(apt => 
                    !status || apt.status === status
                )
            });
        }
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get appointments',
            details: error.message
        });
    }
});

// Join virtual waiting room
router.post('/waiting-room', auth, async (req, res) => {
    try {
        const { appointment_id } = req.body;
        
        if (!appointment_id) {
            return res.status(400).json({
                success: false,
                error: 'Appointment ID is required'
            });
        }
        
        const waitingRoomData = {
            appointment_id,
            user_id: req.user._id
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/telemedicine/waiting-room`, waitingRoomData);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error joining waiting room:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join waiting room',
            details: error.response?.data?.error || error.message
        });
    }
});

// Start consultation (for doctors)
router.post('/start-consultation', auth, async (req, res) => {
    try {
        const { appointment_id, doctor_id } = req.body;
        
        if (!appointment_id || !doctor_id) {
            return res.status(400).json({
                success: false,
                error: 'Appointment ID and Doctor ID are required'
            });
        }
        
        const consultationData = {
            appointment_id,
            doctor_id
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/telemedicine/start-consultation`, consultationData);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error starting consultation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start consultation',
            details: error.response?.data?.error || error.message
        });
    }
});

// End consultation (for doctors)
router.post('/end-consultation', auth, async (req, res) => {
    try {
        const { consultation_id, doctor_id, diagnosis, prescription, follow_up_needed, follow_up_date } = req.body;
        
        if (!consultation_id || !doctor_id) {
            return res.status(400).json({
                success: false,
                error: 'Consultation ID and Doctor ID are required'
            });
        }
        
        const consultationData = {
            consultation_id,
            doctor_id,
            diagnosis: diagnosis || '',
            prescription: prescription || '',
            follow_up_needed: follow_up_needed || false,
            follow_up_date: follow_up_date || ''
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/telemedicine/end-consultation`, consultationData);
        
        if (response.data.success) {
            // Update user's consultation history
            try {
                const user = await User.findById(req.user._id);
                if (!user.consultationHistory) {
                    user.consultationHistory = [];
                }
                
                user.consultationHistory.push({
                    consultationId: consultation_id,
                    doctorId: doctor_id,
                    completedAt: new Date(),
                    diagnosis: diagnosis || '',
                    prescription: prescription || '',
                    followUpNeeded: follow_up_needed || false,
                    followUpDate: follow_up_date || null
                });
                
                await user.save();
            } catch (userUpdateError) {
                console.error('Error updating user consultation history:', userUpdateError);
                // Don't fail the response if user update fails
            }
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error ending consultation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end consultation',
            details: error.response?.data?.error || error.message
        });
    }
});

// Reschedule appointment
router.put('/reschedule', auth, async (req, res) => {
    try {
        const { appointment_id, new_slot_datetime } = req.body;
        
        if (!appointment_id || !new_slot_datetime) {
            return res.status(400).json({
                success: false,
                error: 'Appointment ID and new slot datetime are required'
            });
        }
        
        const rescheduleData = {
            appointment_id,
            user_id: req.user._id,
            new_slot_datetime
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/telemedicine/reschedule`, rescheduleData);
        
        if (response.data.success) {
            // Update user's appointment record
            try {
                const user = await User.findById(req.user._id);
                if (user.telemedicineAppointments) {
                    const appointmentIndex = user.telemedicineAppointments.findIndex(
                        apt => apt.appointmentId === appointment_id
                    );
                    
                    if (appointmentIndex !== -1) {
                        user.telemedicineAppointments[appointmentIndex].scheduledTime = new_slot_datetime;
                        user.telemedicineAppointments[appointmentIndex].rescheduledAt = new Date();
                        await user.save();
                    }
                }
            } catch (userUpdateError) {
                console.error('Error updating user appointment record:', userUpdateError);
            }
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reschedule appointment',
            details: error.response?.data?.error || error.message
        });
    }
});

// Cancel appointment
router.delete('/cancel', auth, async (req, res) => {
    try {
        const { appointment_id, cancellation_reason } = req.body;
        
        if (!appointment_id) {
            return res.status(400).json({
                success: false,
                error: 'Appointment ID is required'
            });
        }
        
        const cancellationData = {
            appointment_id,
            user_id: req.user._id,
            cancellation_reason: cancellation_reason || ''
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/telemedicine/cancel`, cancellationData);
        
        if (response.data.success) {
            // Update user's appointment record
            try {
                const user = await User.findById(req.user._id);
                if (user.telemedicineAppointments) {
                    const appointmentIndex = user.telemedicineAppointments.findIndex(
                        apt => apt.appointmentId === appointment_id
                    );
                    
                    if (appointmentIndex !== -1) {
                        user.telemedicineAppointments[appointmentIndex].status = 'cancelled';
                        user.telemedicineAppointments[appointmentIndex].cancelledAt = new Date();
                        user.telemedicineAppointments[appointmentIndex].cancellationReason = cancellation_reason || '';
                        await user.save();
                    }
                }
            } catch (userUpdateError) {
                console.error('Error updating user appointment record:', userUpdateError);
            }
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel appointment',
            details: error.response?.data?.error || error.message
        });
    }
});

// Get consultation history
router.get('/consultation-history', auth, async (req, res) => {
    try {
        try {
            const response = await axios.get(`${AI_SERVICE_URL}/api/telemedicine/consultation-history/${req.user._id}`, {
                timeout: 3000
            });
            res.json(response.data);
        } catch (aiError) {
            // Fallback when AI service is unavailable
            console.log('AI service unavailable, using fallback data for consultation history');
            const user = await User.findById(req.user._id);
            const fallbackHistory = [
                {
                    id: 'cons001',
                    doctor_name: 'Dr. Priya Sharma',
                    specialty: 'General Medicine',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    duration: 25,
                    diagnosis: 'Routine checkup - all normal',
                    notes: 'Patient is in good health'
                },
                {
                    id: 'cons002',
                    doctor_name: 'Dr. Rajesh Kumar',
                    specialty: 'Cardiology',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    duration: 40,
                    diagnosis: 'Heart rhythm monitoring',
                    notes: 'Follow up in 3 months'
                }
            ];
            
            res.json({
                success: true,
                data: user.consultationHistory || fallbackHistory
            });
        }
    } catch (error) {
        console.error('Error getting consultation history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get consultation history',
            details: error.message
        });
    }
});

// Get telemedicine analytics (for dashboard)
router.get('/analytics', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        const analytics = {
            totalAppointments: user.telemedicineAppointments?.length || 0,
            completedConsultations: user.consultationHistory?.length || 0,
            upcomingAppointments: user.telemedicineAppointments?.filter(apt => 
                apt.status === 'scheduled' && new Date(apt.scheduledTime) > new Date()
            ).length || 0,
            cancelledAppointments: user.telemedicineAppointments?.filter(apt => 
                apt.status === 'cancelled'
            ).length || 0,
            favoriteSpecialties: user.telemedicineAppointments?.reduce((acc, apt) => {
                acc[apt.specialty] = (acc[apt.specialty] || 0) + 1;
                return acc;
            }, {}) || {}
        };
        
        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('Error getting telemedicine analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get telemedicine analytics',
            details: error.message
        });
    }
});

module.exports = router;
