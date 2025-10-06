"""
Smart Medication Management System
AI-powered medication tracking with drug interactions, reminders, and safety monitoring
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, time
import json
import logging
from typing import Dict, List, Tuple, Optional, Any
import re
from dataclasses import dataclass, asdict
from enum import Enum
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class InteractionSeverity(Enum):
    MINOR = "minor"
    MODERATE = "moderate"
    MAJOR = "major"
    SEVERE = "severe"

class MedicationStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DISCONTINUED = "discontinued"
    COMPLETED = "completed"

@dataclass
class Medication:
    id: str
    name: str
    generic_name: str
    dosage: str
    frequency: str  # e.g., "twice_daily", "once_daily", "as_needed"
    times: List[str]  # e.g., ["08:00", "20:00"]
    start_date: datetime
    end_date: Optional[datetime]
    instructions: str
    prescribing_doctor: str
    refills_remaining: int
    quantity: int
    status: MedicationStatus
    side_effects: List[str]
    condition_treated: str

@dataclass
class DrugInteraction:
    drug1: str
    drug2: str
    severity: InteractionSeverity
    description: str
    mechanism: str
    recommendation: str

@dataclass
class MedicationReminder:
    medication_id: str
    medication_name: str
    dosage: str
    scheduled_time: datetime
    taken: bool
    taken_time: Optional[datetime]
    missed: bool
    notes: str

@dataclass
class AdherenceReport:
    medication_id: str
    medication_name: str
    prescribed_doses: int
    taken_doses: int
    missed_doses: int
    adherence_percentage: float
    last_taken: Optional[datetime]
    next_due: Optional[datetime]

class SmartMedicationManager:
    """Comprehensive medication management with AI-powered insights"""
    
    def __init__(self):
        # Load comprehensive drug interaction database
        self.drug_interactions = self._load_drug_interactions_db()
        self.medication_database = self._load_medication_database()
        self.side_effects_db = self._load_side_effects_database()
        
        # Common medication schedules
        self.frequency_schedules = {
            'once_daily': ['08:00'],
            'twice_daily': ['08:00', '20:00'],
            'three_times_daily': ['08:00', '14:00', '20:00'],
            'four_times_daily': ['08:00', '12:00', '16:00', '20:00'],
            'every_6_hours': ['06:00', '12:00', '18:00', '00:00'],
            'every_8_hours': ['08:00', '16:00', '00:00'],
            'every_12_hours': ['08:00', '20:00'],
            'bedtime': ['22:00'],
            'morning': ['08:00'],
            'with_meals': ['08:00', '13:00', '19:00'],
            'as_needed': []  # PRN medications
        }
    
    def _load_drug_interactions_db(self) -> List[DrugInteraction]:
        """Load comprehensive drug interaction database"""
        # Comprehensive drug interaction data
        interactions_data = [
            # Blood thinners
            {
                'drug1': 'warfarin', 'drug2': 'aspirin',
                'severity': InteractionSeverity.MAJOR,
                'description': 'Increased bleeding risk',
                'mechanism': 'Additive anticoagulant effects',
                'recommendation': 'Monitor INR closely, consider alternative pain management'
            },
            {
                'drug1': 'warfarin', 'drug2': 'ibuprofen',
                'severity': InteractionSeverity.MAJOR,
                'description': 'Significantly increased bleeding risk',
                'mechanism': 'Anticoagulant + antiplatelet effects',
                'recommendation': 'Avoid combination, use acetaminophen instead'
            },
            # Cardiovascular
            {
                'drug1': 'lisinopril', 'drug2': 'potassium',
                'severity': InteractionSeverity.MODERATE,
                'description': 'Risk of hyperkalemia',
                'mechanism': 'ACE inhibitor reduces potassium excretion',
                'recommendation': 'Monitor potassium levels regularly'
            },
            {
                'drug1': 'metoprolol', 'drug2': 'verapamil',
                'severity': InteractionSeverity.MAJOR,
                'description': 'Risk of severe bradycardia and heart block',
                'mechanism': 'Additive cardiac depressant effects',
                'recommendation': 'Use with extreme caution, monitor heart rate'
            },
            # Diabetes medications
            {
                'drug1': 'metformin', 'drug2': 'alcohol',
                'severity': InteractionSeverity.MODERATE,
                'description': 'Increased risk of lactic acidosis',
                'mechanism': 'Both can cause lactic acidosis',
                'recommendation': 'Limit alcohol consumption, monitor for symptoms'
            },
            {
                'drug1': 'insulin', 'drug2': 'propranolol',
                'severity': InteractionSeverity.MODERATE,
                'description': 'May mask hypoglycemia symptoms',
                'mechanism': 'Beta-blocker masks tachycardia from hypoglycemia',
                'recommendation': 'Monitor blood glucose more frequently'
            },
            # Antibiotics
            {
                'drug1': 'amoxicillin', 'drug2': 'warfarin',
                'severity': InteractionSeverity.MODERATE,
                'description': 'May increase bleeding risk',
                'mechanism': 'Antibiotic may enhance warfarin effect',
                'recommendation': 'Monitor INR more frequently during treatment'
            },
            # Mental health medications
            {
                'drug1': 'sertraline', 'drug2': 'tramadol',
                'severity': InteractionSeverity.MAJOR,
                'description': 'Risk of serotonin syndrome',
                'mechanism': 'Both increase serotonin levels',
                'recommendation': 'Avoid combination, use alternative pain medication'
            },
            {
                'drug1': 'fluoxetine', 'drug2': 'warfarin',
                'severity': InteractionSeverity.MODERATE,
                'description': 'Increased bleeding risk',
                'mechanism': 'SSRI affects platelet function',
                'recommendation': 'Monitor for bleeding, consider alternative antidepressant'
            },
            # Pain medications
            {
                'drug1': 'acetaminophen', 'drug2': 'alcohol',
                'severity': InteractionSeverity.MODERATE,
                'description': 'Increased liver toxicity risk',
                'mechanism': 'Both metabolized by liver',
                'recommendation': 'Limit alcohol consumption, monitor liver function'
            },
            # Supplements
            {
                'drug1': 'calcium', 'drug2': 'levothyroxine',
                'severity': InteractionSeverity.MODERATE,
                'description': 'Reduced thyroid hormone absorption',
                'mechanism': 'Calcium binds to levothyroxine',
                'recommendation': 'Separate administration by 4 hours'
            }
        ]
        
        return [DrugInteraction(**interaction) for interaction in interactions_data]
    
    def _load_medication_database(self) -> Dict[str, Dict]:
        """Load comprehensive medication database with generic names, categories, etc."""
        return {
            # Cardiovascular
            'lisinopril': {
                'generic_name': 'lisinopril',
                'brand_names': ['Prinivil', 'Zestril'],
                'category': 'ACE Inhibitor',
                'common_dosages': ['5mg', '10mg', '20mg', '40mg'],
                'max_daily_dose': '80mg',
                'common_side_effects': ['dry cough', 'dizziness', 'hyperkalemia', 'angioedema']
            },
            'metoprolol': {
                'generic_name': 'metoprolol',
                'brand_names': ['Lopressor', 'Toprol XL'],
                'category': 'Beta Blocker',
                'common_dosages': ['25mg', '50mg', '100mg', '200mg'],
                'max_daily_dose': '400mg',
                'common_side_effects': ['fatigue', 'bradycardia', 'cold extremities', 'depression']
            },
            'amlodipine': {
                'generic_name': 'amlodipine',
                'brand_names': ['Norvasc'],
                'category': 'Calcium Channel Blocker',
                'common_dosages': ['2.5mg', '5mg', '10mg'],
                'max_daily_dose': '10mg',
                'common_side_effects': ['ankle swelling', 'flushing', 'dizziness', 'fatigue']
            },
            # Diabetes
            'metformin': {
                'generic_name': 'metformin',
                'brand_names': ['Glucophage', 'Fortamet'],
                'category': 'Biguanide',
                'common_dosages': ['500mg', '850mg', '1000mg'],
                'max_daily_dose': '2550mg',
                'common_side_effects': ['nausea', 'diarrhea', 'metallic taste', 'vitamin B12 deficiency']
            },
            'insulin': {
                'generic_name': 'insulin',
                'brand_names': ['Humalog', 'Novolog', 'Lantus'],
                'category': 'Hormone',
                'common_dosages': ['variable units'],
                'max_daily_dose': 'variable',
                'common_side_effects': ['hypoglycemia', 'weight gain', 'injection site reactions']
            },
            # Antibiotics
            'amoxicillin': {
                'generic_name': 'amoxicillin',
                'brand_names': ['Amoxil'],
                'category': 'Penicillin Antibiotic',
                'common_dosages': ['250mg', '500mg', '875mg'],
                'max_daily_dose': '4000mg',
                'common_side_effects': ['nausea', 'diarrhea', 'rash', 'allergic reactions']
            },
            # Pain medications
            'ibuprofen': {
                'generic_name': 'ibuprofen',
                'brand_names': ['Advil', 'Motrin'],
                'category': 'NSAID',
                'common_dosages': ['200mg', '400mg', '600mg', '800mg'],
                'max_daily_dose': '3200mg',
                'common_side_effects': ['stomach upset', 'kidney problems', 'increased bleeding risk']
            },
            'acetaminophen': {
                'generic_name': 'acetaminophen',
                'brand_names': ['Tylenol'],
                'category': 'Analgesic/Antipyretic',
                'common_dosages': ['325mg', '500mg', '650mg'],
                'max_daily_dose': '4000mg',
                'common_side_effects': ['liver toxicity (overdose)', 'rare allergic reactions']
            },
            # Mental health
            'sertraline': {
                'generic_name': 'sertraline',
                'brand_names': ['Zoloft'],
                'category': 'SSRI',
                'common_dosages': ['25mg', '50mg', '100mg', '200mg'],
                'max_daily_dose': '200mg',
                'common_side_effects': ['nausea', 'insomnia', 'sexual dysfunction', 'weight changes']
            }
        }
    
    def _load_side_effects_database(self) -> Dict[str, List[str]]:
        """Load database of medication side effects"""
        return {
            'lisinopril': ['dry cough', 'dizziness', 'hyperkalemia', 'angioedema', 'fatigue'],
            'metoprolol': ['fatigue', 'bradycardia', 'cold extremities', 'depression', 'shortness of breath'],
            'metformin': ['nausea', 'diarrhea', 'metallic taste', 'vitamin B12 deficiency', 'lactic acidosis'],
            'ibuprofen': ['stomach upset', 'kidney problems', 'increased bleeding risk', 'high blood pressure'],
            'acetaminophen': ['liver toxicity', 'rare allergic reactions'],
            'sertraline': ['nausea', 'insomnia', 'sexual dysfunction', 'weight changes', 'serotonin syndrome']
        }
    
    def add_medication(self, medication_data: Dict) -> Dict:
        """Add a new medication to the user's regimen"""
        try:
            # Generate unique ID
            medication_id = f"med_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Parse and validate medication data
            medication = Medication(
                id=medication_id,
                name=medication_data['name'].lower(),
                generic_name=medication_data.get('generic_name', medication_data['name'].lower()),
                dosage=medication_data['dosage'],
                frequency=medication_data['frequency'],
                times=self._generate_schedule_times(medication_data['frequency'], medication_data.get('custom_times')),
                start_date=datetime.fromisoformat(medication_data['start_date']),
                end_date=datetime.fromisoformat(medication_data['end_date']) if medication_data.get('end_date') else None,
                instructions=medication_data.get('instructions', ''),
                prescribing_doctor=medication_data.get('prescribing_doctor', ''),
                refills_remaining=medication_data.get('refills_remaining', 0),
                quantity=medication_data.get('quantity', 30),
                status=MedicationStatus(medication_data.get('status', 'active')),
                side_effects=medication_data.get('side_effects', []),
                condition_treated=medication_data.get('condition_treated', '')
            )
            
            # Validate dosage
            dosage_validation = self._validate_dosage(medication)
            
            # Get medication information
            med_info = self.medication_database.get(medication.generic_name, {})
            
            return {
                'success': True,
                'medication': asdict(medication),
                'medication_info': med_info,
                'dosage_validation': dosage_validation,
                'next_doses': self._get_next_doses(medication, days=7)
            }
            
        except Exception as e:
            logger.error(f"Error adding medication: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_schedule_times(self, frequency: str, custom_times: Optional[List[str]] = None) -> List[str]:
        """Generate medication schedule times based on frequency"""
        if custom_times:
            return custom_times
        
        return self.frequency_schedules.get(frequency, ['08:00'])
    
    def _validate_dosage(self, medication: Medication) -> Dict:
        """Validate medication dosage against safe limits"""
        med_info = self.medication_database.get(medication.generic_name)
        
        if not med_info:
            return {
                'status': 'unknown',
                'message': 'Medication not in database for validation',
                'warnings': []
            }
        
        warnings = []
        
        # Extract numeric dosage
        dosage_match = re.search(r'(\d+(?:\.\d+)?)', medication.dosage)
        if not dosage_match:
            return {
                'status': 'invalid',
                'message': 'Could not parse dosage format',
                'warnings': ['Dosage format unclear']
            }
        
        dosage_amount = float(dosage_match.group(1))
        
        # Calculate daily dose (multiply by frequency)
        daily_multiplier = {
            'once_daily': 1,
            'twice_daily': 2,
            'three_times_daily': 3,
            'four_times_daily': 4,
            'every_6_hours': 4,
            'every_8_hours': 3,
            'every_12_hours': 2
        }
        
        multiplier = daily_multiplier.get(medication.frequency, 1)
        daily_dose = dosage_amount * multiplier
        
        # Check against maximum daily dose
        max_dose_str = med_info.get('max_daily_dose', '0mg')
        max_dose_match = re.search(r'(\d+(?:\.\d+)?)', max_dose_str)
        
        if max_dose_match:
            max_dose = float(max_dose_match.group(1))
            if daily_dose > max_dose:
                warnings.append(f'Daily dose ({daily_dose}mg) exceeds maximum recommended ({max_dose}mg)')
        
        # Age-specific warnings (would need user age)
        if medication.generic_name in ['ibuprofen', 'aspirin']:
            warnings.append('Monitor for GI bleeding, especially in elderly patients')
        
        status = 'warning' if warnings else 'safe'
        
        return {
            'status': status,
            'daily_dose': f'{daily_dose}mg',
            'max_daily_dose': med_info.get('max_daily_dose'),
            'warnings': warnings
        }
    
    def check_drug_interactions(self, medications: List[Dict]) -> Dict:
        """Check for drug interactions among user's medications"""
        try:
            interactions_found = []
            medication_names = [med['generic_name'].lower() for med in medications]
            
            # Check each pair of medications
            for i, med1 in enumerate(medication_names):
                for j, med2 in enumerate(medication_names[i+1:], i+1):
                    # Check both directions of interaction
                    interaction = self._find_interaction(med1, med2)
                    if interaction:
                        interactions_found.append({
                            'medication1': medications[i]['name'],
                            'medication2': medications[j]['name'],
                            'interaction': asdict(interaction)
                        })
            
            # Categorize by severity
            severe_interactions = [i for i in interactions_found if i['interaction']['severity'] == 'severe']
            major_interactions = [i for i in interactions_found if i['interaction']['severity'] == 'major']
            moderate_interactions = [i for i in interactions_found if i['interaction']['severity'] == 'moderate']
            minor_interactions = [i for i in interactions_found if i['interaction']['severity'] == 'minor']
            
            return {
                'total_interactions': len(interactions_found),
                'severe': severe_interactions,
                'major': major_interactions,
                'moderate': moderate_interactions,
                'minor': minor_interactions,
                'risk_level': self._assess_overall_risk(interactions_found),
                'recommendations': self._generate_interaction_recommendations(interactions_found)
            }
            
        except Exception as e:
            logger.error(f"Error checking drug interactions: {e}")
            return {
                'error': str(e),
                'total_interactions': 0,
                'severe': [],
                'major': [],
                'moderate': [],
                'minor': []
            }
    
    def _find_interaction(self, drug1: str, drug2: str) -> Optional[DrugInteraction]:
        """Find interaction between two drugs"""
        for interaction in self.drug_interactions:
            if ((interaction.drug1.lower() == drug1 and interaction.drug2.lower() == drug2) or
                (interaction.drug1.lower() == drug2 and interaction.drug2.lower() == drug1)):
                return interaction
        return None
    
    def _assess_overall_risk(self, interactions: List[Dict]) -> str:
        """Assess overall interaction risk level"""
        if any(i['interaction']['severity'] == 'severe' for i in interactions):
            return 'high'
        elif any(i['interaction']['severity'] == 'major' for i in interactions):
            return 'moderate-high'
        elif any(i['interaction']['severity'] == 'moderate' for i in interactions):
            return 'moderate'
        elif interactions:
            return 'low'
        else:
            return 'minimal'
    
    def _generate_interaction_recommendations(self, interactions: List[Dict]) -> List[str]:
        """Generate recommendations based on drug interactions"""
        recommendations = []
        
        if any(i['interaction']['severity'] in ['severe', 'major'] for i in interactions):
            recommendations.append("🚨 URGENT: Consult your doctor immediately about potential drug interactions")
            recommendations.append("📞 Contact your pharmacist for alternative medication options")
        
        if any(i['interaction']['severity'] == 'moderate' for i in interactions):
            recommendations.append("⚠️ Monitor for side effects and report any concerns to your healthcare provider")
            recommendations.append("📅 Schedule more frequent follow-up appointments")
        
        # Specific recommendations
        for interaction in interactions:
            recommendations.append(f"💊 {interaction['interaction']['recommendation']}")
        
        if not interactions:
            recommendations.append("✅ No significant drug interactions detected")
        
        return recommendations
    
    def generate_medication_reminders(self, medications: List[Dict], days: int = 7) -> List[MedicationReminder]:
        """Generate medication reminders for the specified number of days"""
        try:
            reminders = []
            current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            for med in medications:
                if med.get('status') != 'active':
                    continue
                
                # Generate reminders for each day
                for day in range(days):
                    reminder_date = current_date + timedelta(days=day)
                    
                    # Generate reminders for each scheduled time
                    for time_str in med.get('times', []):
                        hour, minute = map(int, time_str.split(':'))
                        reminder_time = reminder_date.replace(hour=hour, minute=minute)
                        
                        # Only create future reminders
                        if reminder_time > datetime.now():
                            reminder = MedicationReminder(
                                medication_id=med['id'],
                                medication_name=med['name'],
                                dosage=med['dosage'],
                                scheduled_time=reminder_time,
                                taken=False,
                                taken_time=None,
                                missed=False,
                                notes=''
                            )
                            reminders.append(reminder)
            
            # Sort by scheduled time
            reminders.sort(key=lambda x: x.scheduled_time)
            
            return reminders
            
        except Exception as e:
            logger.error(f"Error generating reminders: {e}")
            return []
    
    def _get_next_doses(self, medication: Medication, days: int = 7) -> List[Dict]:
        """Get next scheduled doses for a medication"""
        next_doses = []
        current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for day in range(days):
            dose_date = current_date + timedelta(days=day)
            
            for time_str in medication.times:
                hour, minute = map(int, time_str.split(':'))
                dose_time = dose_date.replace(hour=hour, minute=minute)
                
                if dose_time > datetime.now():
                    next_doses.append({
                        'date': dose_time.date().isoformat(),
                        'time': time_str,
                        'datetime': dose_time.isoformat(),
                        'dosage': medication.dosage
                    })
        
        return next_doses
    
    def calculate_adherence(self, medication_id: str, medication_history: List[Dict]) -> AdherenceReport:
        """Calculate medication adherence statistics"""
        try:
            # Filter history for this medication
            med_history = [h for h in medication_history if h.get('medication_id') == medication_id]
            
            if not med_history:
                return AdherenceReport(
                    medication_id=medication_id,
                    medication_name='Unknown',
                    prescribed_doses=0,
                    taken_doses=0,
                    missed_doses=0,
                    adherence_percentage=0.0,
                    last_taken=None,
                    next_due=None
                )
            
            # Calculate statistics
            prescribed_doses = len(med_history)
            taken_doses = len([h for h in med_history if h.get('taken', False)])
            missed_doses = len([h for h in med_history if h.get('missed', False)])
            
            adherence_percentage = (taken_doses / prescribed_doses * 100) if prescribed_doses > 0 else 0
            
            # Find last taken and next due
            taken_history = [h for h in med_history if h.get('taken')]
            last_taken = None
            if taken_history:
                last_taken_str = max(taken_history, key=lambda x: x.get('taken_time', ''))['taken_time']
                last_taken = datetime.fromisoformat(last_taken_str) if last_taken_str else None
            
            # Find next due (first future scheduled dose)
            future_doses = [h for h in med_history if not h.get('taken') and not h.get('missed')]
            next_due = None
            if future_doses:
                next_due_str = min(future_doses, key=lambda x: x.get('scheduled_time', ''))['scheduled_time']
                next_due = datetime.fromisoformat(next_due_str) if next_due_str else None
            
            return AdherenceReport(
                medication_id=medication_id,
                medication_name=med_history[0].get('medication_name', 'Unknown'),
                prescribed_doses=prescribed_doses,
                taken_doses=taken_doses,
                missed_doses=missed_doses,
                adherence_percentage=round(adherence_percentage, 1),
                last_taken=last_taken,
                next_due=next_due
            )
            
        except Exception as e:
            logger.error(f"Error calculating adherence: {e}")
            return AdherenceReport(
                medication_id=medication_id,
                medication_name='Error',
                prescribed_doses=0,
                taken_doses=0,
                missed_doses=0,
                adherence_percentage=0.0,
                last_taken=None,
                next_due=None
            )
    
    def check_refill_alerts(self, medications: List[Dict]) -> List[Dict]:
        """Check which medications need refills"""
        refill_alerts = []
        
        for med in medications:
            if med.get('status') != 'active':
                continue
            
            quantity = med.get('quantity', 0)
            refills_remaining = med.get('refills_remaining', 0)
            
            # Calculate daily consumption
            daily_doses = len(med.get('times', []))
            days_remaining = quantity / daily_doses if daily_doses > 0 else 0
            
            alert_level = None
            message = ""
            
            if days_remaining <= 3:
                alert_level = "critical"
                message = f"Only {int(days_remaining)} days remaining"
            elif days_remaining <= 7:
                alert_level = "warning"
                message = f"Only {int(days_remaining)} days remaining"
            elif days_remaining <= 14:
                alert_level = "info"
                message = f"{int(days_remaining)} days remaining"
            
            if alert_level:
                refill_alerts.append({
                    'medication_id': med['id'],
                    'medication_name': med['name'],
                    'alert_level': alert_level,
                    'message': message,
                    'days_remaining': int(days_remaining),
                    'refills_remaining': refills_remaining,
                    'prescribing_doctor': med.get('prescribing_doctor', 'Unknown'),
                    'action_needed': refills_remaining > 0
                })
        
        return refill_alerts
    
    def analyze_side_effects(self, medications: List[Dict], reported_symptoms: List[str]) -> Dict:
        """Analyze potential medication side effects"""
        try:
            potential_causes = []
            
            for med in medications:
                med_name = med.get('generic_name', med.get('name', '')).lower()
                known_side_effects = self.side_effects_db.get(med_name, [])
                
                # Check if any reported symptoms match known side effects
                matching_effects = []
                for symptom in reported_symptoms:
                    for side_effect in known_side_effects:
                        if symptom.lower() in side_effect.lower() or side_effect.lower() in symptom.lower():
                            matching_effects.append(side_effect)
                
                if matching_effects:
                    potential_causes.append({
                        'medication': med['name'],
                        'generic_name': med_name,
                        'matching_side_effects': matching_effects,
                        'all_side_effects': known_side_effects,
                        'start_date': med.get('start_date'),
                        'dosage': med.get('dosage')
                    })
            
            # Generate recommendations
            recommendations = []
            if potential_causes:
                recommendations.append("📞 Contact your healthcare provider about these symptoms")
                recommendations.append("📝 Keep a symptom diary noting timing and severity")
                recommendations.append("🚫 Do not stop medications without medical supervision")
                
                if len(potential_causes) > 1:
                    recommendations.append("💊 Multiple medications may be contributing to symptoms")
            else:
                recommendations.append("✅ Reported symptoms are not commonly associated with current medications")
                recommendations.append("🔍 Consider other causes or consult healthcare provider")
            
            return {
                'potential_medication_causes': potential_causes,
                'recommendations': recommendations,
                'severity_assessment': 'high' if len(potential_causes) > 2 else 'moderate' if potential_causes else 'low'
            }
            
        except Exception as e:
            logger.error(f"Error analyzing side effects: {e}")
            return {
                'error': str(e),
                'potential_medication_causes': [],
                'recommendations': []
            }

# Global instance
medication_manager = SmartMedicationManager()