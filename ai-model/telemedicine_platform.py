import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import random
from typing import Dict, List, Any, Optional
import uuid

class TelemedicinePlatform:
    def __init__(self):
        """Initialize the Telemedicine Platform with AI-powered features"""
        self.appointments = {}
        self.consultations = {}
        self.waiting_rooms = {}
        self.doctors_availability = {}
        self.specialties = [
            'General Medicine', 'Cardiology', 'Dermatology', 'Psychiatry',
            'Pediatrics', 'Gynecology', 'Orthopedics', 'Neurology',
            'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Oncology'
        ]
        self.initialize_mock_doctors()

    def initialize_mock_doctors(self):
        """Initialize mock doctor availability data"""
        doctors = [
            {'id': 'dr001', 'name': 'Dr. Priya Sharma', 'specialty': 'General Medicine', 'rating': 4.8},
            {'id': 'dr002', 'name': 'Dr. Rajesh Kumar', 'specialty': 'Cardiology', 'rating': 4.9},
            {'id': 'dr003', 'name': 'Dr. Anita Patel', 'specialty': 'Dermatology', 'rating': 4.7},
            {'id': 'dr004', 'name': 'Dr. Arjun Singh', 'specialty': 'Psychiatry', 'rating': 4.6},
            {'id': 'dr005', 'name': 'Dr. Kavya Menon', 'specialty': 'Pediatrics', 'rating': 4.9},
            {'id': 'dr006', 'name': 'Dr. Vikram Gupta', 'specialty': 'Orthopedics', 'rating': 4.8},
        ]
        
        for doctor in doctors:
            self.doctors_availability[doctor['id']] = {
                'doctor_info': doctor,
                'available_slots': self.generate_available_slots(),
                'consultation_types': ['video', 'audio', 'chat'],
                'consultation_fees': {
                    'video': random.randint(50, 150),
                    'audio': random.randint(30, 100),
                    'chat': random.randint(20, 80)
                }
            }

    def generate_available_slots(self) -> List[Dict]:
        """Generate available time slots for doctors"""
        slots = []
        base_date = datetime.now()
        
        for day in range(7):  # Next 7 days
            current_date = base_date + timedelta(days=day)
            if current_date.weekday() < 5:  # Weekdays only
                # Morning slots (9 AM - 12 PM)
                for hour in range(9, 12):
                    for minute in [0, 30]:
                        slot_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                        if slot_time > datetime.now():
                            slots.append({
                                'datetime': slot_time.isoformat(),
                                'available': random.choice([True, True, True, False])  # 75% availability
                            })
                
                # Afternoon slots (2 PM - 6 PM)
                for hour in range(14, 18):
                    for minute in [0, 30]:
                        slot_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                        if slot_time > datetime.now():
                            slots.append({
                                'datetime': slot_time.isoformat(),
                                'available': random.choice([True, True, True, False])
                            })
        
        return slots

    def get_available_doctors(self, specialty: str = None, consultation_type: str = 'video') -> List[Dict]:
        """Get list of available doctors based on specialty and consultation type"""
        available_doctors = []
        
        for doctor_id, doctor_data in self.doctors_availability.items():
            doctor_info = doctor_data['doctor_info']
            
            # Filter by specialty if specified
            if specialty and doctor_info['specialty'] != specialty:
                continue
            
            # Check if doctor supports the consultation type
            if consultation_type not in doctor_data['consultation_types']:
                continue
            
            # Get next available slot
            next_slot = self.get_next_available_slot(doctor_id)
            if next_slot:
                available_doctors.append({
                    'doctor_id': doctor_id,
                    'doctor_name': doctor_info['name'],
                    'specialty': doctor_info['specialty'],
                    'rating': doctor_info['rating'],
                    'next_available': next_slot,
                    'consultation_fee': doctor_data['consultation_fees'][consultation_type],
                    'consultation_types': doctor_data['consultation_types']
                })
        
        # Sort by rating and next available time
        available_doctors.sort(key=lambda x: (-x['rating'], x['next_available']))
        return available_doctors

    def get_next_available_slot(self, doctor_id: str) -> Optional[str]:
        """Get the next available slot for a doctor"""
        if doctor_id not in self.doctors_availability:
            return None
        
        slots = self.doctors_availability[doctor_id]['available_slots']
        for slot in slots:
            if slot['available'] and datetime.fromisoformat(slot['datetime']) > datetime.now():
                return slot['datetime']
        
        return None

    def book_appointment(self, user_id: str, doctor_id: str, slot_datetime: str, 
                        consultation_type: str, symptoms: str = "", notes: str = "") -> Dict:
        """Book an appointment with a doctor"""
        try:
            appointment_id = str(uuid.uuid4())
            
            # Validate doctor and slot availability
            if doctor_id not in self.doctors_availability:
                return {'success': False, 'error': 'Doctor not found'}
            
            doctor_data = self.doctors_availability[doctor_id]
            slot_found = False
            
            for slot in doctor_data['available_slots']:
                if slot['datetime'] == slot_datetime and slot['available']:
                    slot['available'] = False  # Mark as booked
                    slot_found = True
                    break
            
            if not slot_found:
                return {'success': False, 'error': 'Time slot not available'}
            
            # Create appointment
            appointment = {
                'appointment_id': appointment_id,
                'user_id': user_id,
                'doctor_id': doctor_id,
                'doctor_name': doctor_data['doctor_info']['name'],
                'specialty': doctor_data['doctor_info']['specialty'],
                'scheduled_time': slot_datetime,
                'consultation_type': consultation_type,
                'consultation_fee': doctor_data['consultation_fees'][consultation_type],
                'symptoms': symptoms,
                'notes': notes,
                'status': 'scheduled',
                'created_at': datetime.now().isoformat(),
                'meeting_link': f"https://smarthealth-meet.com/room/{appointment_id}",
                'room_id': appointment_id
            }
            
            self.appointments[appointment_id] = appointment
            
            # Generate pre-consultation recommendations
            recommendations = self.generate_pre_consultation_prep(symptoms, doctor_data['doctor_info']['specialty'])
            
            return {
                'success': True,
                'appointment': appointment,
                'preparation_tips': recommendations
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def generate_pre_consultation_prep(self, symptoms: str, specialty: str) -> List[str]:
        """Generate AI-powered pre-consultation preparation tips"""
        general_tips = [
            "Prepare a list of your current medications and dosages",
            "Have your medical history and previous test results ready",
            "Ensure stable internet connection for video consultation",
            "Find a quiet, well-lit space for the consultation",
            "Prepare specific questions you want to ask the doctor"
        ]
        
        specialty_tips = {
            'Cardiology': [
                "Monitor and record your blood pressure if possible",
                "Note any chest pain patterns or triggers",
                "List any family history of heart disease"
            ],
            'Dermatology': [
                "Take clear photos of skin concerns in good lighting",
                "Note when skin issues first appeared",
                "List any new skincare products or medications"
            ],
            'Psychiatry': [
                "Keep a mood diary for a few days before consultation",
                "Note sleep patterns and any triggers for symptoms",
                "List any previous mental health treatments"
            ],
            'General Medicine': [
                "Take your temperature if you have fever symptoms",
                "Note duration and severity of symptoms",
                "List any recent changes in diet or lifestyle"
            ]
        }
        
        tips = general_tips.copy()
        if specialty in specialty_tips:
            tips.extend(specialty_tips[specialty])
        
        return tips

    def join_waiting_room(self, appointment_id: str, user_id: str) -> Dict:
        """Join virtual waiting room before consultation"""
        if appointment_id not in self.appointments:
            return {'success': False, 'error': 'Appointment not found'}
        
        appointment = self.appointments[appointment_id]
        
        # Check if it's the right user
        if appointment['user_id'] != user_id:
            return {'success': False, 'error': 'Unauthorized access'}
        
        # Check if appointment time is within 15 minutes
        appointment_time = datetime.fromisoformat(appointment['scheduled_time'])
        current_time = datetime.now()
        time_diff = (appointment_time - current_time).total_seconds() / 60
        
        if time_diff > 15:
            return {'success': False, 'error': 'Waiting room opens 15 minutes before appointment'}
        
        if time_diff < -30:
            return {'success': False, 'error': 'Appointment time has passed'}
        
        # Create waiting room entry
        waiting_room_id = f"wr_{appointment_id}"
        self.waiting_rooms[waiting_room_id] = {
            'appointment_id': appointment_id,
            'user_id': user_id,
            'joined_at': current_time.isoformat(),
            'status': 'waiting',
            'estimated_wait_time': max(0, int(time_diff)) if time_diff > 0 else 0
        }
        
        return {
            'success': True,
            'waiting_room_id': waiting_room_id,
            'appointment_details': appointment,
            'estimated_wait_time': self.waiting_rooms[waiting_room_id]['estimated_wait_time'],
            'meeting_link': appointment['meeting_link']
        }

    def start_consultation(self, appointment_id: str, doctor_id: str) -> Dict:
        """Start the video consultation"""
        if appointment_id not in self.appointments:
            return {'success': False, 'error': 'Appointment not found'}
        
        appointment = self.appointments[appointment_id]
        
        if appointment['doctor_id'] != doctor_id:
            return {'success': False, 'error': 'Unauthorized doctor access'}
        
        # Update appointment status
        appointment['status'] = 'in_progress'
        appointment['started_at'] = datetime.now().isoformat()
        
        # Create consultation session
        consultation_id = f"cons_{appointment_id}"
        self.consultations[consultation_id] = {
            'consultation_id': consultation_id,
            'appointment_id': appointment_id,
            'started_at': datetime.now().isoformat(),
            'status': 'active',
            'meeting_link': appointment['meeting_link'],
            'participants': [appointment['user_id'], doctor_id]
        }
        
        return {
            'success': True,
            'consultation_id': consultation_id,
            'meeting_link': appointment['meeting_link'],
            'appointment_details': appointment
        }

    def end_consultation(self, consultation_id: str, doctor_id: str, 
                        diagnosis: str = "", prescription: str = "", 
                        follow_up_needed: bool = False, follow_up_date: str = "") -> Dict:
        """End consultation and generate summary"""
        if consultation_id not in self.consultations:
            return {'success': False, 'error': 'Consultation not found'}
        
        consultation = self.consultations[consultation_id]
        appointment_id = consultation['appointment_id']
        appointment = self.appointments[appointment_id]
        
        if appointment['doctor_id'] != doctor_id:
            return {'success': False, 'error': 'Unauthorized doctor access'}
        
        # End consultation
        end_time = datetime.now()
        consultation['ended_at'] = end_time.isoformat()
        consultation['status'] = 'completed'
        
        # Calculate duration
        start_time = datetime.fromisoformat(consultation['started_at'])
        duration = (end_time - start_time).total_seconds() / 60
        consultation['duration_minutes'] = round(duration, 2)
        
        # Update appointment
        appointment['status'] = 'completed'
        appointment['ended_at'] = end_time.isoformat()
        appointment['diagnosis'] = diagnosis
        appointment['prescription'] = prescription
        appointment['follow_up_needed'] = follow_up_needed
        appointment['follow_up_date'] = follow_up_date
        
        # Generate consultation summary
        summary = self.generate_consultation_summary(appointment, consultation)
        
        return {
            'success': True,
            'consultation_summary': summary,
            'prescription': prescription,
            'follow_up_needed': follow_up_needed,
            'follow_up_date': follow_up_date
        }

    def generate_consultation_summary(self, appointment: Dict, consultation: Dict) -> Dict:
        """Generate AI-powered consultation summary"""
        return {
            'appointment_id': appointment['appointment_id'],
            'consultation_date': consultation['started_at'],
            'duration': consultation['duration_minutes'],
            'doctor_name': appointment['doctor_name'],
            'specialty': appointment['specialty'],
            'consultation_type': appointment['consultation_type'],
            'presenting_symptoms': appointment['symptoms'],
            'diagnosis': appointment.get('diagnosis', ''),
            'prescription': appointment.get('prescription', ''),
            'follow_up_needed': appointment.get('follow_up_needed', False),
            'follow_up_date': appointment.get('follow_up_date', ''),
            'consultation_fee': appointment['consultation_fee'],
            'meeting_link': appointment['meeting_link']
        }

    def get_user_appointments(self, user_id: str, status: str = None) -> List[Dict]:
        """Get all appointments for a user"""
        user_appointments = []
        
        for appointment in self.appointments.values():
            if appointment['user_id'] == user_id:
                if status is None or appointment['status'] == status:
                    user_appointments.append(appointment)
        
        # Sort by scheduled time
        user_appointments.sort(key=lambda x: x['scheduled_time'], reverse=True)
        return user_appointments

    def reschedule_appointment(self, appointment_id: str, user_id: str, 
                             new_slot_datetime: str) -> Dict:
        """Reschedule an existing appointment"""
        if appointment_id not in self.appointments:
            return {'success': False, 'error': 'Appointment not found'}
        
        appointment = self.appointments[appointment_id]
        
        if appointment['user_id'] != user_id:
            return {'success': False, 'error': 'Unauthorized access'}
        
        if appointment['status'] != 'scheduled':
            return {'success': False, 'error': 'Cannot reschedule completed or cancelled appointment'}
        
        doctor_id = appointment['doctor_id']
        doctor_data = self.doctors_availability[doctor_id]
        
        # Check new slot availability
        slot_found = False
        for slot in doctor_data['available_slots']:
            if slot['datetime'] == new_slot_datetime and slot['available']:
                # Mark old slot as available
                old_slot_datetime = appointment['scheduled_time']
                for old_slot in doctor_data['available_slots']:
                    if old_slot['datetime'] == old_slot_datetime:
                        old_slot['available'] = True
                        break
                
                # Mark new slot as booked
                slot['available'] = False
                slot_found = True
                break
        
        if not slot_found:
            return {'success': False, 'error': 'New time slot not available'}
        
        # Update appointment
        appointment['scheduled_time'] = new_slot_datetime
        appointment['rescheduled_at'] = datetime.now().isoformat()
        
        return {
            'success': True,
            'appointment': appointment,
            'message': 'Appointment rescheduled successfully'
        }

    def cancel_appointment(self, appointment_id: str, user_id: str, 
                          cancellation_reason: str = "") -> Dict:
        """Cancel an appointment"""
        if appointment_id not in self.appointments:
            return {'success': False, 'error': 'Appointment not found'}
        
        appointment = self.appointments[appointment_id]
        
        if appointment['user_id'] != user_id:
            return {'success': False, 'error': 'Unauthorized access'}
        
        if appointment['status'] != 'scheduled':
            return {'success': False, 'error': 'Cannot cancel completed or already cancelled appointment'}
        
        # Mark slot as available again
        doctor_id = appointment['doctor_id']
        doctor_data = self.doctors_availability[doctor_id]
        slot_datetime = appointment['scheduled_time']
        
        for slot in doctor_data['available_slots']:
            if slot['datetime'] == slot_datetime:
                slot['available'] = True
                break
        
        # Update appointment
        appointment['status'] = 'cancelled'
        appointment['cancelled_at'] = datetime.now().isoformat()
        appointment['cancellation_reason'] = cancellation_reason
        
        # Calculate refund amount (example: full refund if cancelled 24+ hours before)
        appointment_time = datetime.fromisoformat(appointment['scheduled_time'])
        hours_until_appointment = (appointment_time - datetime.now()).total_seconds() / 3600
        
        if hours_until_appointment >= 24:
            refund_percentage = 100
        elif hours_until_appointment >= 2:
            refund_percentage = 50
        else:
            refund_percentage = 0
        
        refund_amount = (appointment['consultation_fee'] * refund_percentage) / 100
        
        return {
            'success': True,
            'message': 'Appointment cancelled successfully',
            'refund_percentage': refund_percentage,
            'refund_amount': refund_amount,
            'appointment': appointment
        }

    def get_consultation_history(self, user_id: str) -> List[Dict]:
        """Get consultation history for a user"""
        consultation_history = []
        
        for appointment in self.appointments.values():
            if (appointment['user_id'] == user_id and 
                appointment['status'] == 'completed'):
                
                # Find corresponding consultation
                consultation_id = f"cons_{appointment['appointment_id']}"
                consultation = self.consultations.get(consultation_id, {})
                
                history_item = self.generate_consultation_summary(appointment, consultation)
                consultation_history.append(history_item)
        
        # Sort by date (most recent first)
        consultation_history.sort(key=lambda x: x['consultation_date'], reverse=True)
        return consultation_history

# Global instance
telemedicine_platform = TelemedicinePlatform()

def get_available_doctors(specialty=None, consultation_type='video'):
    """Get available doctors for booking"""
    try:
        return {
            'success': True,
            'doctors': telemedicine_platform.get_available_doctors(specialty, consultation_type),
            'specialties': telemedicine_platform.specialties
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def book_appointment(user_id, doctor_id, slot_datetime, consultation_type, symptoms="", notes=""):
    """Book a new appointment"""
    try:
        result = telemedicine_platform.book_appointment(
            user_id, doctor_id, slot_datetime, consultation_type, symptoms, notes
        )
        return result
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_user_appointments(user_id, status=None):
    """Get user's appointments"""
    try:
        appointments = telemedicine_platform.get_user_appointments(user_id, status)
        return {'success': True, 'appointments': appointments}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def join_waiting_room(appointment_id, user_id):
    """Join virtual waiting room"""
    try:
        return telemedicine_platform.join_waiting_room(appointment_id, user_id)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def start_consultation(appointment_id, doctor_id):
    """Start video consultation"""
    try:
        return telemedicine_platform.start_consultation(appointment_id, doctor_id)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def end_consultation(consultation_id, doctor_id, diagnosis="", prescription="", follow_up_needed=False, follow_up_date=""):
    """End consultation and create summary"""
    try:
        return telemedicine_platform.end_consultation(
            consultation_id, doctor_id, diagnosis, prescription, follow_up_needed, follow_up_date
        )
    except Exception as e:
        return {'success': False, 'error': str(e)}

def reschedule_appointment(appointment_id, user_id, new_slot_datetime):
    """Reschedule an appointment"""
    try:
        return telemedicine_platform.reschedule_appointment(appointment_id, user_id, new_slot_datetime)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def cancel_appointment(appointment_id, user_id, cancellation_reason=""):
    """Cancel an appointment"""
    try:
        return telemedicine_platform.cancel_appointment(appointment_id, user_id, cancellation_reason)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_consultation_history(user_id):
    """Get consultation history"""
    try:
        history = telemedicine_platform.get_consultation_history(user_id)
        return {'success': True, 'consultations': history}
    except Exception as e:
        return {'success': False, 'error': str(e)}