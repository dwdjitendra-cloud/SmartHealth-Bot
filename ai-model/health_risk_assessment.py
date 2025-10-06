"""
Advanced AI Health Risk Assessment System
Provides predictive analytics and personalized health recommendations
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Tuple, Optional

logger = logging.getLogger(__name__)

class HealthRiskAssessment:
    """Advanced AI-powered health risk assessment system"""
    
    def __init__(self):
        self.risk_factors = {
            'age': {'weight': 0.15, 'threshold_high': 65, 'threshold_medium': 45},
            'bmi': {'weight': 0.12, 'threshold_high': 30, 'threshold_medium': 25},
            'smoking': {'weight': 0.20, 'multiplier': 2.5},
            'alcohol': {'weight': 0.08, 'multiplier': 1.5},
            'exercise': {'weight': 0.10, 'inverse': True},
            'family_history': {'weight': 0.15, 'multiplier': 2.0},
            'chronic_conditions': {'weight': 0.20, 'multiplier': 3.0}
        }
        
        self.disease_risk_profiles = {
            'cardiovascular': {
                'high_risk_factors': ['smoking', 'high_blood_pressure', 'diabetes', 'high_cholesterol'],
                'symptoms': ['chest_pain', 'shortness_of_breath', 'irregular_heartbeat'],
                'age_factor': 1.5,
                'preventive_measures': [
                    'Regular cardiovascular exercise (30+ min daily)',
                    'Mediterranean diet with low sodium',
                    'Stress management and adequate sleep',
                    'Regular blood pressure monitoring',
                    'Quit smoking and limit alcohol consumption'
                ]
            },
            'diabetes': {
                'high_risk_factors': ['obesity', 'family_history_diabetes', 'sedentary_lifestyle'],
                'symptoms': ['excessive_thirst', 'frequent_urination', 'fatigue', 'blurred_vision'],
                'age_factor': 1.3,
                'preventive_measures': [
                    'Maintain healthy weight (BMI 18.5-24.9)',
                    'Low glycemic index diet',
                    'Regular blood sugar monitoring',
                    'Physical activity 150+ min per week',
                    'Annual diabetes screening'
                ]
            },
            'hypertension': {
                'high_risk_factors': ['high_sodium_diet', 'stress', 'obesity', 'family_history'],
                'symptoms': ['headaches', 'dizziness', 'chest_pain'],
                'age_factor': 1.4,
                'preventive_measures': [
                    'DASH diet (low sodium, high potassium)',
                    'Regular blood pressure monitoring',
                    'Weight management and exercise',
                    'Stress reduction techniques',
                    'Limit caffeine and alcohol intake'
                ]
            },
            'mental_health': {
                'high_risk_factors': ['chronic_stress', 'social_isolation', 'substance_abuse'],
                'symptoms': ['persistent_sadness', 'anxiety', 'sleep_disturbances', 'appetite_changes'],
                'age_factor': 1.0,
                'preventive_measures': [
                    'Regular mental health check-ins',
                    'Mindfulness and meditation practices',
                    'Social connection and support',
                    'Professional counseling when needed',
                    'Regular exercise and healthy lifestyle'
                ]
            }
        }
    
    def calculate_overall_risk_score(self, user_data: Dict) -> Tuple[float, str, Dict]:
        """Calculate comprehensive health risk score"""
        try:
            risk_score = 0.0
            risk_breakdown = {}
            
            # Age risk calculation
            age = user_data.get('age', 25)
            if age >= self.risk_factors['age']['threshold_high']:
                age_risk = 0.8
            elif age >= self.risk_factors['age']['threshold_medium']:
                age_risk = 0.4
            else:
                age_risk = 0.1
            
            risk_score += age_risk * self.risk_factors['age']['weight']
            risk_breakdown['age'] = {'score': age_risk, 'impact': 'Age-related health risks'}
            
            # BMI risk calculation
            bmi = user_data.get('bmi', 22)
            if bmi is None:
                bmi = 22  # Default healthy BMI
            if bmi >= self.risk_factors['bmi']['threshold_high']:
                bmi_risk = 0.9
            elif bmi >= self.risk_factors['bmi']['threshold_medium']:
                bmi_risk = 0.5
            else:
                bmi_risk = 0.2
            
            risk_score += bmi_risk * self.risk_factors['bmi']['weight']
            risk_breakdown['bmi'] = {'score': bmi_risk, 'impact': 'Weight-related health risks'}
            
            # Lifestyle factors
            smoking = user_data.get('smoking', False)
            if smoking:
                smoking_risk = 0.9
                risk_score += smoking_risk * self.risk_factors['smoking']['weight']
                risk_breakdown['smoking'] = {'score': smoking_risk, 'impact': 'Significantly increases disease risk'}
            
            # Exercise habits (inverse factor - more exercise = less risk)
            exercise_frequency = user_data.get('exercise_frequency', 3)  # times per week
            exercise_risk = max(0.1, 1.0 - (exercise_frequency / 7))
            risk_score += exercise_risk * self.risk_factors['exercise']['weight']
            risk_breakdown['exercise'] = {'score': exercise_risk, 'impact': 'Physical activity level impact'}
            
            # Family history
            family_history = user_data.get('family_history', [])
            family_risk = min(0.9, len(family_history) * 0.2)
            risk_score += family_risk * self.risk_factors['family_history']['weight']
            risk_breakdown['family_history'] = {'score': family_risk, 'impact': 'Genetic predisposition'}
            
            # Chronic conditions
            chronic_conditions = user_data.get('chronic_conditions', [])
            chronic_risk = min(0.9, len(chronic_conditions) * 0.3)
            risk_score += chronic_risk * self.risk_factors['chronic_conditions']['weight']
            risk_breakdown['chronic_conditions'] = {'score': chronic_risk, 'impact': 'Existing health conditions'}
            
            # Normalize risk score to 0-1 scale
            risk_score = min(1.0, risk_score)
            
            # Determine risk level
            if risk_score >= 0.7:
                risk_level = "High"
            elif risk_score >= 0.4:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            return risk_score, risk_level, risk_breakdown
            
        except Exception as e:
            logger.error(f"Error calculating risk score: {e}")
            return 0.5, "Medium", {}
    
    def assess_disease_specific_risks(self, user_data: Dict, symptoms: List[str]) -> Dict:
        """Assess risk for specific diseases based on user profile and symptoms"""
        disease_risks = {}
        
        for disease, profile in self.disease_risk_profiles.items():
            risk_score = 0.0
            risk_factors_present = []
            
            # Check for high-risk factors
            user_risk_factors = user_data.get('risk_factors', [])
            for factor in profile['high_risk_factors']:
                if factor in user_risk_factors:
                    risk_score += 0.2
                    risk_factors_present.append(factor)
            
            # Check for related symptoms
            symptom_matches = 0
            for symptom in profile['symptoms']:
                for user_symptom in symptoms:
                    if symptom.lower() in user_symptom.lower():
                        symptom_matches += 1
                        break
            
            if symptom_matches > 0:
                risk_score += min(0.6, symptom_matches * 0.2)
            
            # Apply age factor
            age = user_data.get('age', 25)
            if age > 50:
                risk_score *= profile['age_factor']
            
            # Normalize and categorize
            risk_score = min(1.0, risk_score)
            
            if risk_score >= 0.6:
                risk_category = "High"
            elif risk_score >= 0.3:
                risk_category = "Medium"
            else:
                risk_category = "Low"
            
            disease_risks[disease] = {
                'risk_score': risk_score,
                'risk_category': risk_category,
                'risk_factors_present': risk_factors_present,
                'preventive_measures': profile['preventive_measures'],
                'recommendation': self._generate_disease_recommendation(disease, risk_category, risk_score)
            }
        
        return disease_risks
    
    def _generate_disease_recommendation(self, disease: str, risk_category: str, risk_score: float) -> str:
        """Generate personalized recommendations based on disease risk"""
        if risk_category == "High":
            return f"High risk for {disease}. Immediate consultation with specialist recommended. Implement aggressive preventive measures."
        elif risk_category == "Medium":
            return f"Moderate risk for {disease}. Schedule preventive screening. Focus on lifestyle modifications."
        else:
            return f"Low risk for {disease}. Continue healthy lifestyle practices and routine screenings."
    
    def generate_personalized_plan(self, user_data: Dict, disease_risks: Dict) -> Dict:
        """Generate comprehensive personalized health plan"""
        plan = {
            'immediate_actions': [],
            'short_term_goals': [],
            'long_term_goals': [],
            'lifestyle_recommendations': [],
            'screening_schedule': [],
            'emergency_signs': []
        }
        
        # Analyze highest risk diseases
        high_risk_diseases = [disease for disease, data in disease_risks.items() 
                             if data['risk_category'] == 'High']
        
        if high_risk_diseases:
            plan['immediate_actions'].extend([
                'Schedule comprehensive health checkup within 2 weeks',
                'Consult with primary care physician about high-risk conditions',
                'Begin daily health monitoring (blood pressure, weight, symptoms)'
            ])
        
        # Lifestyle recommendations based on risk factors
        bmi = user_data.get('bmi', 22)
        if bmi is not None and bmi > 25:
            plan['lifestyle_recommendations'].extend([
                'Weight management plan: Target 1-2 lbs per week weight loss',
                'Nutritionist consultation for personalized diet plan',
                'Daily calorie tracking and portion control'
            ])
        
        if user_data.get('smoking', False):
            plan['immediate_actions'].append('Smoking cessation program enrollment')
            plan['short_term_goals'].append('Quit smoking within 3 months')
        
        exercise_freq = user_data.get('exercise_frequency', 3)
        if exercise_freq < 3:
            plan['lifestyle_recommendations'].extend([
                'Gradual increase to 150+ minutes moderate exercise per week',
                'Start with 20-minute daily walks',
                'Consider fitness tracker for activity monitoring'
            ])
        
        # Screening schedule based on age and risks
        age = user_data.get('age', 25)
        if age > 40:
            plan['screening_schedule'].extend([
                'Annual blood pressure and cholesterol screening',
                'Diabetes screening every 3 years',
                'Cancer screenings as age-appropriate'
            ])
        
        # Emergency signs to watch for
        for disease, data in disease_risks.items():
            if data['risk_category'] in ['High', 'Medium']:
                if disease == 'cardiovascular':
                    plan['emergency_signs'].extend([
                        'Chest pain or pressure lasting >5 minutes',
                        'Severe shortness of breath',
                        'Sudden weakness or numbness'
                    ])
                elif disease == 'diabetes':
                    plan['emergency_signs'].extend([
                        'Extreme thirst and frequent urination',
                        'Sudden vision changes',
                        'Unexplained rapid weight loss'
                    ])
        
        return plan
    
    def generate_health_insights(self, user_data: Dict, symptoms: List[str]) -> Dict:
        """Generate comprehensive health insights and recommendations"""
        try:
            # Calculate overall risk
            risk_score, risk_level, risk_breakdown = self.calculate_overall_risk_score(user_data)
            
            # Assess disease-specific risks
            disease_risks = self.assess_disease_specific_risks(user_data, symptoms)
            
            # Generate personalized plan
            personalized_plan = self.generate_personalized_plan(user_data, disease_risks)
            
            # Create comprehensive insights
            insights = {
                'overall_risk': {
                    'score': round(risk_score, 2),
                    'level': risk_level,
                    'breakdown': risk_breakdown
                },
                'disease_risks': disease_risks,
                'personalized_plan': personalized_plan,
                'health_score': round((1 - risk_score) * 100),
                'priority_areas': self._identify_priority_areas(risk_breakdown, disease_risks),
                'next_checkup_recommended': self._calculate_next_checkup_date(risk_level),
                'generated_at': datetime.now().isoformat()
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating health insights: {e}")
            return self._get_default_insights()
    
    def _identify_priority_areas(self, risk_breakdown: Dict, disease_risks: Dict) -> List[str]:
        """Identify top priority areas for health improvement"""
        priority_areas = []
        
        # Check risk breakdown for highest impact areas
        sorted_risks = sorted(risk_breakdown.items(), key=lambda x: x[1]['score'], reverse=True)
        for risk_factor, data in sorted_risks[:3]:
            if data['score'] > 0.5:
                priority_areas.append(risk_factor.replace('_', ' ').title())
        
        # Add high-risk diseases
        high_risk_diseases = [disease.replace('_', ' ').title() for disease, data in disease_risks.items() 
                             if data['risk_category'] == 'High']
        priority_areas.extend(high_risk_diseases)
        
        return priority_areas[:5]  # Top 5 priorities
    
    def _calculate_next_checkup_date(self, risk_level: str) -> str:
        """Calculate recommended next checkup date based on risk level"""
        if risk_level == "High":
            next_date = datetime.now() + timedelta(weeks=2)
        elif risk_level == "Medium":
            next_date = datetime.now() + timedelta(days=90)  # ~3 months
        else:
            next_date = datetime.now() + timedelta(days=180)  # ~6 months
        
        return next_date.strftime("%Y-%m-%d")
    
    def _get_default_insights(self) -> Dict:
        """Return default insights in case of error"""
        return {
            'overall_risk': {
                'score': 0.3,
                'level': 'Low',
                'breakdown': {}
            },
            'disease_risks': {},
            'personalized_plan': {
                'immediate_actions': ['Schedule routine health checkup'],
                'lifestyle_recommendations': ['Maintain healthy diet and regular exercise'],
                'screening_schedule': ['Annual health screening']
            },
            'health_score': 70,
            'priority_areas': ['General Wellness'],
            'next_checkup_recommended': (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d"),  # ~6 months
            'generated_at': datetime.now().isoformat()
        }

# Global instance
health_risk_assessor = HealthRiskAssessment()