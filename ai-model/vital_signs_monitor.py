"""
Real-time Vital Signs Monitoring System
Simulates integration with wearable devices and provides health monitoring
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Tuple, Optional
import random
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class VitalSigns:
    timestamp: datetime
    heart_rate: int
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    temperature: float
    oxygen_saturation: int
    steps: int
    calories_burned: int
    sleep_hours: float
    stress_level: int  # 1-10 scale

class VitalSignsMonitor:
    """Real-time vital signs monitoring with AI health insights"""
    
    def __init__(self):
        self.normal_ranges = {
            'heart_rate': {'min': 60, 'max': 100, 'optimal': (70, 85)},
            'blood_pressure_systolic': {'min': 90, 'max': 140, 'optimal': (110, 120)},
            'blood_pressure_diastolic': {'min': 60, 'max': 90, 'optimal': (70, 80)},
            'temperature': {'min': 36.1, 'max': 37.2, 'optimal': (36.5, 37.0)},
            'oxygen_saturation': {'min': 95, 'max': 100, 'optimal': (98, 100)},
            'stress_level': {'min': 1, 'max': 10, 'optimal': (1, 4)}
        }
        
        self.alert_thresholds = {
            'heart_rate': {'critical_low': 50, 'critical_high': 120},
            'blood_pressure_systolic': {'critical_low': 80, 'critical_high': 180},
            'blood_pressure_diastolic': {'critical_low': 50, 'critical_high': 110},
            'temperature': {'critical_low': 35.0, 'critical_high': 38.5},
            'oxygen_saturation': {'critical_low': 90, 'critical_high': 100},
            'stress_level': {'critical_low': 1, 'critical_high': 8}
        }
    
    def simulate_wearable_data(self, user_profile: Dict, duration_hours: int = 24) -> List[VitalSigns]:
        """Simulate realistic wearable device data for a user"""
        try:
            vital_signs_data = []
            base_time = datetime.now() - timedelta(hours=duration_hours)
            
            # Generate baseline values based on user profile
            age = user_profile.get('age', 30)
            bmi = user_profile.get('bmi', 22)
            smoking = user_profile.get('smoking', False)
            exercise_freq = user_profile.get('exercise_frequency', 3)
            chronic_conditions = user_profile.get('chronic_conditions', [])
            
            # Adjust baseline based on health factors
            hr_baseline = 75
            bp_sys_baseline = 120
            bp_dia_baseline = 80
            temp_baseline = 36.7
            o2_baseline = 98
            stress_baseline = 3
            
            # Age adjustments
            if age > 65:
                hr_baseline += 5
                bp_sys_baseline += 10
                bp_dia_baseline += 5
            elif age < 25:
                hr_baseline -= 5
                
            # BMI adjustments
            if bmi > 30:
                hr_baseline += 10
                bp_sys_baseline += 15
                bp_dia_baseline += 8
                stress_baseline += 2
            elif bmi < 18.5:
                hr_baseline -= 5
                bp_sys_baseline -= 5
                
            # Smoking adjustments
            if smoking:
                hr_baseline += 8
                bp_sys_baseline += 12
                o2_baseline -= 2
                stress_baseline += 1
                
            # Chronic conditions adjustments
            if 'hypertension' in chronic_conditions:
                bp_sys_baseline += 20
                bp_dia_baseline += 10
            if 'diabetes' in chronic_conditions:
                hr_baseline += 5
                stress_baseline += 1
            
            # Generate hourly data points
            for hour in range(duration_hours):
                current_time = base_time + timedelta(hours=hour)
                hour_of_day = current_time.hour
                
                # Circadian rhythm adjustments
                circadian_hr_adj = self._get_circadian_adjustment(hour_of_day, 'heart_rate')
                circadian_bp_adj = self._get_circadian_adjustment(hour_of_day, 'blood_pressure')
                circadian_temp_adj = self._get_circadian_adjustment(hour_of_day, 'temperature')
                
                # Add some realistic variation
                hr_variation = random.randint(-8, 12)
                bp_sys_variation = random.randint(-10, 15)
                bp_dia_variation = random.randint(-5, 8)
                temp_variation = random.uniform(-0.3, 0.4)
                o2_variation = random.randint(-2, 1)
                stress_variation = random.randint(-1, 2)
                
                # Activity-based adjustments (simulate exercise periods)
                activity_multiplier = 1.0
                if exercise_freq > 4 and hour_of_day in [7, 8, 18, 19]:  # Morning/evening exercise
                    if random.random() < 0.3:  # 30% chance of exercise session
                        activity_multiplier = 1.4
                        stress_variation -= 1  # Exercise reduces stress
                
                vital_signs = VitalSigns(
                    timestamp=current_time,
                    heart_rate=max(45, min(150, int((hr_baseline + circadian_hr_adj + hr_variation) * activity_multiplier))),
                    blood_pressure_systolic=max(80, min(200, int(bp_sys_baseline + circadian_bp_adj + bp_sys_variation))),
                    blood_pressure_diastolic=max(50, min(120, int(bp_dia_baseline + circadian_bp_adj//2 + bp_dia_variation))),
                    temperature=max(35.0, min(39.0, temp_baseline + circadian_temp_adj + temp_variation)),
                    oxygen_saturation=max(85, min(100, o2_baseline + o2_variation)),
                    steps=self._simulate_steps(hour_of_day, exercise_freq),
                    calories_burned=self._simulate_calories(hour_of_day, bmi),
                    sleep_hours=self._simulate_sleep_hours(hour_of_day),
                    stress_level=max(1, min(10, stress_baseline + stress_variation))
                )
                
                vital_signs_data.append(vital_signs)
            
            return vital_signs_data
            
        except Exception as e:
            logger.error(f"Error simulating wearable data: {e}")
            return []
    
    def _get_circadian_adjustment(self, hour: int, vital_type: str) -> float:
        """Get circadian rhythm-based adjustments for vitals"""
        if vital_type == 'heart_rate':
            # HR typically lower at night, higher during day
            if 22 <= hour or hour <= 6:
                return -8  # Night time
            elif 6 < hour <= 10:
                return 5   # Morning rise
            elif 14 <= hour <= 18:
                return 3   # Afternoon peak
            else:
                return 0
                
        elif vital_type == 'blood_pressure':
            # BP follows similar pattern to HR
            if 22 <= hour or hour <= 6:
                return -5
            elif 6 < hour <= 10:
                return 8
            elif 14 <= hour <= 18:
                return 5
            else:
                return 0
                
        elif vital_type == 'temperature':
            # Body temp lowest around 4-6 AM, highest around 6-8 PM
            if 4 <= hour <= 6:
                return -0.4
            elif 18 <= hour <= 20:
                return 0.3
            else:
                return 0
        
        return 0
    
    def _simulate_steps(self, hour: int, exercise_freq: int) -> int:
        """Simulate realistic step count per hour"""
        base_steps = 200 + (exercise_freq * 50)  # Base steps per hour
        
        if 22 <= hour or hour <= 6:  # Sleep hours
            return random.randint(0, 50)
        elif 7 <= hour <= 9:  # Morning activity
            return random.randint(base_steps, base_steps * 2)
        elif 17 <= hour <= 19:  # Evening activity
            return random.randint(base_steps, base_steps * 3)
        else:
            return random.randint(base_steps // 2, base_steps)
    
    def _simulate_calories(self, hour: int, bmi: float) -> int:
        """Simulate calories burned per hour"""
        base_calories = 80 + max(0, (bmi - 22) * 2)  # BMR component
        
        if 22 <= hour or hour <= 6:  # Sleep
            return int(base_calories * 0.7)
        elif 7 <= hour <= 9 or 17 <= hour <= 19:  # Active hours
            return int(base_calories * 1.5) + random.randint(0, 100)
        else:
            return int(base_calories) + random.randint(0, 50)
    
    def _simulate_sleep_hours(self, hour: int) -> float:
        """Simulate sleep tracking"""
        if 22 <= hour or hour <= 6:
            return 1.0  # 1 hour of sleep
        else:
            return 0.0
    
    def analyze_vital_trends(self, vital_signs_data: List[VitalSigns]) -> Dict:
        """Analyze trends and patterns in vital signs data"""
        try:
            if not vital_signs_data:
                return {}
            
            # Convert to DataFrame for analysis
            data = []
            for vs in vital_signs_data:
                data.append({
                    'timestamp': vs.timestamp,
                    'heart_rate': vs.heart_rate,
                    'bp_systolic': vs.blood_pressure_systolic,
                    'bp_diastolic': vs.blood_pressure_diastolic,
                    'temperature': vs.temperature,
                    'oxygen_saturation': vs.oxygen_saturation,
                    'steps': vs.steps,
                    'calories': vs.calories_burned,
                    'stress_level': vs.stress_level
                })
            
            df = pd.DataFrame(data)
            
            # Calculate trends and insights
            analysis = {
                'summary_stats': self._calculate_summary_stats(df),
                'trends': self._identify_trends(df),
                'alerts': self._generate_alerts(vital_signs_data[-10:]),  # Check last 10 readings
                'recommendations': self._generate_recommendations(df),
                'activity_insights': self._analyze_activity_patterns(df),
                'circadian_analysis': self._analyze_circadian_patterns(df)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing vital trends: {e}")
            return {}
    
    def _calculate_summary_stats(self, df: pd.DataFrame) -> Dict:
        """Calculate summary statistics for all vitals"""
        stats = {}
        
        vital_columns = ['heart_rate', 'bp_systolic', 'bp_diastolic', 'temperature', 'oxygen_saturation', 'stress_level']
        
        for col in vital_columns:
            if col in df.columns:
                stats[col] = {
                    'avg': round(df[col].mean(), 1),
                    'min': df[col].min(),
                    'max': df[col].max(),
                    'std': round(df[col].std(), 1),
                    'status': self._get_vital_status(df[col].mean(), col)
                }
        
        # Activity stats
        stats['daily_steps'] = int(df['steps'].sum())
        stats['daily_calories'] = int(df['calories'].sum())
        stats['sleep_hours'] = df[df['timestamp'].dt.hour.isin([22, 23, 0, 1, 2, 3, 4, 5, 6])]['steps'].count()
        
        return stats
    
    def _get_vital_status(self, value: float, vital_type: str) -> str:
        """Determine if vital sign is in normal, warning, or critical range"""
        if vital_type not in self.normal_ranges:
            return 'unknown'
        
        ranges = self.normal_ranges[vital_type]
        optimal_min, optimal_max = ranges['optimal']
        
        if optimal_min <= value <= optimal_max:
            return 'optimal'
        elif ranges['min'] <= value <= ranges['max']:
            return 'normal'
        else:
            return 'warning'
    
    def _identify_trends(self, df: pd.DataFrame) -> Dict:
        """Identify trends in vital signs over time"""
        trends = {}
        
        vital_columns = ['heart_rate', 'bp_systolic', 'bp_diastolic', 'temperature']
        
        for col in vital_columns:
            if col in df.columns and len(df) > 1:
                # Calculate trend using linear regression slope
                x = np.arange(len(df))
                y = df[col].values
                slope = np.polyfit(x, y, 1)[0]
                
                trend_direction = 'stable'
                if slope > 0.5:
                    trend_direction = 'increasing'
                elif slope < -0.5:
                    trend_direction = 'decreasing'
                
                trends[col] = {
                    'direction': trend_direction,
                    'slope': round(slope, 3),
                    'change_rate': f"{abs(slope):.1f} units per hour"
                }
        
        return trends
    
    def _generate_alerts(self, recent_vitals: List[VitalSigns]) -> List[Dict]:
        """Generate health alerts based on recent vital signs"""
        alerts = []
        
        if not recent_vitals:
            return alerts
        
        latest = recent_vitals[-1]
        
        # Check each vital against critical thresholds
        vitals_to_check = [
            ('heart_rate', latest.heart_rate, 'Heart Rate'),
            ('blood_pressure_systolic', latest.blood_pressure_systolic, 'Systolic BP'),
            ('blood_pressure_diastolic', latest.blood_pressure_diastolic, 'Diastolic BP'),
            ('temperature', latest.temperature, 'Body Temperature'),
            ('oxygen_saturation', latest.oxygen_saturation, 'Oxygen Saturation'),
            ('stress_level', latest.stress_level, 'Stress Level')
        ]
        
        for vital_key, value, display_name in vitals_to_check:
            if vital_key in self.alert_thresholds:
                thresholds = self.alert_thresholds[vital_key]
                
                if value <= thresholds['critical_low']:
                    alerts.append({
                        'type': 'critical',
                        'vital': display_name,
                        'value': value,
                        'message': f'{display_name} critically low: {value}',
                        'action': 'Seek immediate medical attention'
                    })
                elif value >= thresholds['critical_high']:
                    alerts.append({
                        'type': 'critical',
                        'vital': display_name,
                        'value': value,
                        'message': f'{display_name} critically high: {value}',
                        'action': 'Seek immediate medical attention'
                    })
        
        # Check for patterns in recent readings
        if len(recent_vitals) >= 3:
            hr_values = [vs.heart_rate for vs in recent_vitals[-3:]]
            if all(hr > 110 for hr in hr_values):
                alerts.append({
                    'type': 'warning',
                    'vital': 'Heart Rate Pattern',
                    'message': 'Sustained elevated heart rate detected',
                    'action': 'Consider rest and hydration, monitor closely'
                })
        
        return alerts
    
    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generate personalized health recommendations based on vital signs"""
        recommendations = []
        
        avg_hr = df['heart_rate'].mean()
        avg_stress = df['stress_level'].mean()
        daily_steps = df['steps'].sum()
        
        # Heart rate recommendations
        if avg_hr > 90:
            recommendations.append("Consider stress reduction techniques - your average heart rate is elevated")
        elif avg_hr < 65:
            recommendations.append("Your resting heart rate is excellent - sign of good cardiovascular fitness")
        
        # Activity recommendations
        if daily_steps < 8000:
            recommendations.append("Try to increase daily activity - aim for 10,000 steps per day")
        elif daily_steps > 15000:
            recommendations.append("Great activity level! You're exceeding recommended daily steps")
        
        # Stress recommendations
        if avg_stress > 6:
            recommendations.append("High stress levels detected - consider meditation or relaxation techniques")
        elif avg_stress < 3:
            recommendations.append("Your stress levels are well-managed - keep up the good work")
        
        # Blood pressure recommendations
        avg_sys_bp = df['bp_systolic'].mean()
        if avg_sys_bp > 130:
            recommendations.append("Blood pressure trending high - monitor sodium intake and stay hydrated")
        
        return recommendations
    
    def _analyze_activity_patterns(self, df: pd.DataFrame) -> Dict:
        """Analyze daily activity patterns"""
        df['hour'] = df['timestamp'].dt.hour
        
        hourly_steps = df.groupby('hour')['steps'].mean()
        peak_activity_hour = hourly_steps.idxmax()
        lowest_activity_hour = hourly_steps.idxmin()
        
        return {
            'peak_activity_hour': int(peak_activity_hour),
            'lowest_activity_hour': int(lowest_activity_hour),
            'activity_pattern': 'morning_person' if peak_activity_hour < 12 else 'evening_person',
            'activity_consistency': 'high' if hourly_steps.std() < 100 else 'variable'
        }
    
    def _analyze_circadian_patterns(self, df: pd.DataFrame) -> Dict:
        """Analyze circadian rhythm patterns"""
        df['hour'] = df['timestamp'].dt.hour
        
        # Analyze heart rate circadian pattern
        hourly_hr = df.groupby('hour')['heart_rate'].mean()
        hr_peak_hour = hourly_hr.idxmax()
        hr_low_hour = hourly_hr.idxmin()
        
        # Analyze temperature circadian pattern
        hourly_temp = df.groupby('hour')['temperature'].mean()
        temp_peak_hour = hourly_temp.idxmax()
        temp_low_hour = hourly_temp.idxmin()
        
        # Determine circadian health
        circadian_health = 'good'
        if not (2 <= hr_low_hour <= 6):  # HR should be lowest early morning
            circadian_health = 'disrupted'
        if not (16 <= temp_peak_hour <= 20):  # Body temp peak should be evening
            circadian_health = 'disrupted'
        
        return {
            'heart_rate_peak_hour': int(hr_peak_hour),
            'heart_rate_low_hour': int(hr_low_hour),
            'temperature_peak_hour': int(temp_peak_hour),
            'temperature_low_hour': int(temp_low_hour),
            'circadian_health': circadian_health,
            'recommendation': 'Maintain regular sleep schedule' if circadian_health == 'good' else 'Consider sleep hygiene improvements'
        }

# Global instance
vital_signs_monitor = VitalSignsMonitor()