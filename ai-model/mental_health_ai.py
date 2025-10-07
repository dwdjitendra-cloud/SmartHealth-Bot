import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import random
from typing import Dict, List, Any, Optional
import uuid

class MentalHealthAI:
    def __init__(self):
        """Initialize the Mental Health AI Assistant"""
        self.mood_history = {}
        self.stress_assessments = {}
        self.mindfulness_sessions = {}
        self.crisis_interventions = {}
        self.therapy_recommendations = {}
        
        # Mental health resources and exercises
        self.initialize_resources()
        self.initialize_assessment_tools()

    def initialize_resources(self):
        """Initialize mental health resources and exercises"""
        self.mindfulness_exercises = {
            'breathing': [
                {
                    'name': '4-7-8 Breathing',
                    'duration': 5,
                    'instructions': 'Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 times.',
                    'benefits': ['Reduces anxiety', 'Improves sleep', 'Lowers stress'],
                    'difficulty': 'beginner'
                },
                {
                    'name': 'Box Breathing',
                    'duration': 10,
                    'instructions': 'Inhale for 4, hold for 4, exhale for 4, hold for 4. Continue for 10 minutes.',
                    'benefits': ['Enhances focus', 'Reduces stress', 'Improves emotional regulation'],
                    'difficulty': 'intermediate'
                },
                {
                    'name': 'Belly Breathing',
                    'duration': 15,
                    'instructions': 'Place hand on chest, other on belly. Breathe slowly through nose, expanding belly.',
                    'benefits': ['Activates relaxation response', 'Reduces cortisol', 'Improves mood'],
                    'difficulty': 'beginner'
                }
            ],
            'meditation': [
                {
                    'name': 'Body Scan Meditation',
                    'duration': 20,
                    'instructions': 'Lie down comfortably. Focus attention on each part of your body from toes to head.',
                    'benefits': ['Reduces muscle tension', 'Increases body awareness', 'Promotes relaxation'],
                    'difficulty': 'intermediate'
                },
                {
                    'name': 'Loving-Kindness Meditation',
                    'duration': 15,
                    'instructions': 'Send loving thoughts to yourself, loved ones, neutral people, and difficult people.',
                    'benefits': ['Increases compassion', 'Reduces negative emotions', 'Improves relationships'],
                    'difficulty': 'intermediate'
                },
                {
                    'name': 'Mindful Observation',
                    'duration': 10,
                    'instructions': 'Choose an object. Observe it carefully for 10 minutes without judgment.',
                    'benefits': ['Improves focus', 'Reduces rumination', 'Increases present-moment awareness'],
                    'difficulty': 'beginner'
                }
            ],
            'grounding': [
                {
                    'name': '5-4-3-2-1 Technique',
                    'duration': 5,
                    'instructions': 'Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
                    'benefits': ['Reduces anxiety', 'Stops panic attacks', 'Increases present awareness'],
                    'difficulty': 'beginner'
                },
                {
                    'name': 'Progressive Muscle Relaxation',
                    'duration': 20,
                    'instructions': 'Tense and relax each muscle group, starting from toes and moving up.',
                    'benefits': ['Reduces physical tension', 'Improves sleep', 'Decreases anxiety'],
                    'difficulty': 'intermediate'
                }
            ]
        }

        self.crisis_resources = {
            'hotlines': [
                {
                    'name': 'National Suicide Prevention Lifeline',
                    'number': '988',
                    'available': '24/7',
                    'description': 'Free and confidential emotional support'
                },
                {
                    'name': 'Crisis Text Line',
                    'number': 'Text HOME to 741741',
                    'available': '24/7',
                    'description': 'Free crisis support via text message'
                },
                {
                    'name': 'National Alliance on Mental Illness',
                    'number': '1-800-950-NAMI',
                    'available': 'Mon-Fri 10am-10pm ET',
                    'description': 'Mental health information and support'
                }
            ],
            'emergency_contacts': [
                '911 for immediate emergency',
                'Go to nearest emergency room',
                'Call local crisis intervention team'
            ]
        }

        self.therapy_types = {
            'cbt': {
                'name': 'Cognitive Behavioral Therapy',
                'description': 'Focuses on changing negative thought patterns and behaviors',
                'best_for': ['Depression', 'Anxiety', 'PTSD', 'OCD'],
                'techniques': ['Thought challenging', 'Behavioral activation', 'Exposure therapy']
            },
            'dbt': {
                'name': 'Dialectical Behavior Therapy',
                'description': 'Teaches skills for managing emotions and relationships',
                'best_for': ['Borderline personality disorder', 'Self-harm', 'Emotional regulation'],
                'techniques': ['Mindfulness', 'Distress tolerance', 'Emotion regulation', 'Interpersonal effectiveness']
            },
            'act': {
                'name': 'Acceptance and Commitment Therapy',
                'description': 'Focuses on accepting thoughts and feelings while committing to values',
                'best_for': ['Chronic pain', 'Anxiety', 'Depression', 'Substance abuse'],
                'techniques': ['Mindfulness', 'Values clarification', 'Commitment strategies']
            },
            'emdr': {
                'name': 'Eye Movement Desensitization and Reprocessing',
                'description': 'Processes traumatic memories through bilateral stimulation',
                'best_for': ['PTSD', 'Trauma', 'Phobias'],
                'techniques': ['Bilateral stimulation', 'Memory processing', 'Resource installation']
            }
        }

    def initialize_assessment_tools(self):
        """Initialize mental health assessment questionnaires"""
        self.phq9_questions = [
            "Little interest or pleasure in doing things",
            "Feeling down, depressed, or hopeless",
            "Trouble falling or staying asleep, or sleeping too much",
            "Feeling tired or having little energy",
            "Poor appetite or overeating",
            "Feeling bad about yourself or that you are a failure",
            "Trouble concentrating on things",
            "Moving or speaking slowly, or being fidgety/restless",
            "Thoughts that you would be better off dead or hurting yourself"
        ]

        self.gad7_questions = [
            "Feeling nervous, anxious, or on edge",
            "Not being able to stop or control worrying",
            "Worrying too much about different things",
            "Trouble relaxing",
            "Being so restless that it's hard to sit still",
            "Becoming easily annoyed or irritable",
            "Feeling afraid as if something awful might happen"
        ]

        self.stress_indicators = [
            "Physical symptoms (headaches, muscle tension, fatigue)",
            "Sleep disturbances",
            "Changes in appetite",
            "Difficulty concentrating",
            "Irritability or mood swings",
            "Feeling overwhelmed",
            "Social withdrawal",
            "Increased substance use"
        ]

    def track_mood(self, user_id: str, mood_rating: int, mood_notes: str = "", 
                   energy_level: int = 5, sleep_quality: int = 5, 
                   stress_level: int = 5, anxiety_level: int = 5) -> Dict:
        """Track daily mood and emotional state"""
        try:
            mood_entry_id = str(uuid.uuid4())
            timestamp = datetime.now()
            
            if user_id not in self.mood_history:
                self.mood_history[user_id] = []
            
            mood_entry = {
                'entry_id': mood_entry_id,
                'user_id': user_id,
                'timestamp': timestamp.isoformat(),
                'mood_rating': max(1, min(10, mood_rating)),  # Clamp between 1-10
                'energy_level': max(1, min(10, energy_level)),
                'sleep_quality': max(1, min(10, sleep_quality)),
                'stress_level': max(1, min(10, stress_level)),
                'anxiety_level': max(1, min(10, anxiety_level)),
                'notes': mood_notes,
                'triggers': self.identify_mood_triggers(mood_notes),
                'recommendations': self.generate_mood_recommendations(mood_rating, stress_level, anxiety_level)
            }
            
            self.mood_history[user_id].append(mood_entry)
            
            # Analyze mood trends
            trends = self.analyze_mood_trends(user_id)
            
            return {
                'success': True,
                'mood_entry': mood_entry,
                'trends': trends,
                'recommendations': mood_entry['recommendations']
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def identify_mood_triggers(self, notes: str) -> List[str]:
        """Identify potential mood triggers from notes using keyword analysis"""
        trigger_keywords = {
            'work_stress': ['work', 'job', 'boss', 'deadline', 'meeting', 'project'],
            'relationship': ['relationship', 'partner', 'family', 'friend', 'argument', 'conflict'],
            'health': ['sick', 'pain', 'tired', 'health', 'medical', 'doctor'],
            'financial': ['money', 'financial', 'bills', 'debt', 'expensive'],
            'social': ['social', 'lonely', 'isolated', 'crowd', 'people'],
            'academic': ['school', 'exam', 'study', 'grade', 'homework', 'test'],
            'weather': ['weather', 'rain', 'cold', 'hot', 'seasonal'],
            'sleep': ['sleep', 'tired', 'insomnia', 'nightmare', 'dream']
        }
        
        notes_lower = notes.lower()
        triggers = []
        
        for trigger_type, keywords in trigger_keywords.items():
            if any(keyword in notes_lower for keyword in keywords):
                triggers.append(trigger_type)
        
        return triggers

    def generate_mood_recommendations(self, mood_rating: int, stress_level: int, anxiety_level: int) -> List[str]:
        """Generate personalized recommendations based on mood state"""
        recommendations = []
        
        if mood_rating <= 3:  # Low mood
            recommendations.extend([
                "Consider gentle physical activity like a short walk",
                "Practice gratitude by listing 3 things you're thankful for",
                "Reach out to a trusted friend or family member",
                "Try a mood-boosting activity you usually enjoy"
            ])
        
        if stress_level >= 7:  # High stress
            recommendations.extend([
                "Try the 4-7-8 breathing technique for immediate relief",
                "Take regular breaks throughout your day",
                "Practice progressive muscle relaxation",
                "Consider delegating tasks if possible"
            ])
        
        if anxiety_level >= 7:  # High anxiety
            recommendations.extend([
                "Use the 5-4-3-2-1 grounding technique",
                "Practice mindful breathing for 5 minutes",
                "Challenge anxious thoughts with evidence",
                "Avoid caffeine and try herbal tea instead"
            ])
        
        if mood_rating >= 8:  # Good mood
            recommendations.extend([
                "Great job maintaining positive mood!",
                "Consider what contributed to feeling good today",
                "Share your positive energy with others",
                "Plan activities that support continued well-being"
            ])
        
        return recommendations[:3]  # Return top 3 recommendations

    def analyze_mood_trends(self, user_id: str, days: int = 30) -> Dict:
        """Analyze mood trends over specified period"""
        if user_id not in self.mood_history:
            return {'trends': 'No mood data available'}
        
        recent_entries = []
        cutoff_date = datetime.now() - timedelta(days=days)
        
        for entry in self.mood_history[user_id]:
            entry_date = datetime.fromisoformat(entry['timestamp'])
            if entry_date >= cutoff_date:
                recent_entries.append(entry)
        
        if not recent_entries:
            return {'trends': 'No recent mood data available'}
        
        # Calculate averages
        avg_mood = np.mean([entry['mood_rating'] for entry in recent_entries])
        avg_stress = np.mean([entry['stress_level'] for entry in recent_entries])
        avg_anxiety = np.mean([entry['anxiety_level'] for entry in recent_entries])
        avg_energy = np.mean([entry['energy_level'] for entry in recent_entries])
        avg_sleep = np.mean([entry['sleep_quality'] for entry in recent_entries])
        
        # Identify patterns
        mood_trend = self.calculate_trend([entry['mood_rating'] for entry in recent_entries])
        common_triggers = self.get_common_triggers(recent_entries)
        
        return {
            'period_days': days,
            'total_entries': len(recent_entries),
            'averages': {
                'mood': round(avg_mood, 1),
                'stress': round(avg_stress, 1),
                'anxiety': round(avg_anxiety, 1),
                'energy': round(avg_energy, 1),
                'sleep': round(avg_sleep, 1)
            },
            'mood_trend': mood_trend,
            'common_triggers': common_triggers,
            'insights': self.generate_trend_insights(avg_mood, avg_stress, avg_anxiety, mood_trend)
        }

    def calculate_trend(self, values: List[float]) -> str:
        """Calculate if values are trending up, down, or stable"""
        if len(values) < 3:
            return 'insufficient_data'
        
        # Simple linear regression slope
        x = np.arange(len(values))
        z = np.polyfit(x, values, 1)
        slope = z[0]
        
        if slope > 0.1:
            return 'improving'
        elif slope < -0.1:
            return 'declining'
        else:
            return 'stable'

    def get_common_triggers(self, entries: List[Dict]) -> List[str]:
        """Identify most common mood triggers"""
        trigger_counts = {}
        
        for entry in entries:
            for trigger in entry.get('triggers', []):
                trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
        
        # Return top 3 triggers
        sorted_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)
        return [trigger for trigger, count in sorted_triggers[:3]]

    def generate_trend_insights(self, avg_mood: float, avg_stress: float, avg_anxiety: float, trend: str) -> List[str]:
        """Generate insights based on mood trends"""
        insights = []
        
        if trend == 'improving':
            insights.append("Your mood has been improving recently - keep up the good work!")
        elif trend == 'declining':
            insights.append("Your mood has been declining. Consider reaching out for additional support.")
        else:
            insights.append("Your mood has been relatively stable.")
        
        if avg_stress > 7:
            insights.append("Your stress levels have been consistently high. Focus on stress management techniques.")
        
        if avg_anxiety > 7:
            insights.append("Anxiety levels have been elevated. Consider anxiety-reducing activities.")
        
        if avg_mood < 4:
            insights.append("Low mood patterns detected. Professional support may be beneficial.")
        
        return insights

    def conduct_phq9_assessment(self, user_id: str, responses: List[int]) -> Dict:
        """Conduct PHQ-9 depression screening"""
        try:
            if len(responses) != 9:
                return {'success': False, 'error': 'PHQ-9 requires 9 responses'}
            
            # Validate responses (0-3 scale)
            if not all(0 <= r <= 3 for r in responses):
                return {'success': False, 'error': 'Responses must be between 0-3'}
            
            total_score = sum(responses)
            assessment_id = str(uuid.uuid4())
            timestamp = datetime.now()
            
            # Interpret score
            if total_score <= 4:
                severity = 'minimal'
                recommendation = 'No treatment needed. Continue healthy lifestyle practices.'
            elif total_score <= 9:
                severity = 'mild'
                recommendation = 'Watchful waiting; repeat PHQ-9 at follow-up. Consider therapy.'
            elif total_score <= 14:
                severity = 'moderate'
                recommendation = 'Treatment plan should be considered. Therapy recommended.'
            elif total_score <= 19:
                severity = 'moderately_severe'
                recommendation = 'Active treatment with therapy and/or medication strongly recommended.'
            else:
                severity = 'severe'
                recommendation = 'Immediate treatment with therapy and medication recommended.'
            
            # Check for suicidal ideation (question 9)
            suicidal_risk = responses[8] > 0
            
            assessment = {
                'assessment_id': assessment_id,
                'user_id': user_id,
                'timestamp': timestamp.isoformat(),
                'type': 'PHQ-9',
                'responses': responses,
                'total_score': total_score,
                'severity': severity,
                'recommendation': recommendation,
                'suicidal_risk': suicidal_risk,
                'follow_up_needed': total_score >= 10 or suicidal_risk
            }
            
            if user_id not in self.stress_assessments:
                self.stress_assessments[user_id] = []
            self.stress_assessments[user_id].append(assessment)
            
            # Generate immediate actions if needed
            immediate_actions = []
            if suicidal_risk:
                immediate_actions = self.get_crisis_resources()
            elif severity in ['moderately_severe', 'severe']:
                immediate_actions = self.get_professional_help_resources()
            
            return {
                'success': True,
                'assessment': assessment,
                'immediate_actions': immediate_actions
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def conduct_gad7_assessment(self, user_id: str, responses: List[int]) -> Dict:
        """Conduct GAD-7 anxiety screening"""
        try:
            if len(responses) != 7:
                return {'success': False, 'error': 'GAD-7 requires 7 responses'}
            
            if not all(0 <= r <= 3 for r in responses):
                return {'success': False, 'error': 'Responses must be between 0-3'}
            
            total_score = sum(responses)
            assessment_id = str(uuid.uuid4())
            timestamp = datetime.now()
            
            # Interpret score
            if total_score <= 4:
                severity = 'minimal'
                recommendation = 'No treatment needed. Continue anxiety management practices.'
            elif total_score <= 9:
                severity = 'mild'
                recommendation = 'Mild anxiety. Consider self-help strategies and monitoring.'
            elif total_score <= 14:
                severity = 'moderate'
                recommendation = 'Moderate anxiety. Consider therapy and anxiety management techniques.'
            else:
                severity = 'severe'
                recommendation = 'Severe anxiety. Professional treatment strongly recommended.'
            
            assessment = {
                'assessment_id': assessment_id,
                'user_id': user_id,
                'timestamp': timestamp.isoformat(),
                'type': 'GAD-7',
                'responses': responses,
                'total_score': total_score,
                'severity': severity,
                'recommendation': recommendation,
                'follow_up_needed': total_score >= 10
            }
            
            if user_id not in self.stress_assessments:
                self.stress_assessments[user_id] = []
            self.stress_assessments[user_id].append(assessment)
            
            return {
                'success': True,
                'assessment': assessment,
                'recommended_exercises': self.get_anxiety_exercises(severity)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_anxiety_exercises(self, severity: str) -> List[Dict]:
        """Get appropriate exercises based on anxiety severity"""
        exercises = []
        
        if severity in ['minimal', 'mild']:
            exercises.extend(self.mindfulness_exercises['breathing'][:2])
            exercises.extend(self.mindfulness_exercises['grounding'][:1])
        elif severity == 'moderate':
            exercises.extend(self.mindfulness_exercises['breathing'])
            exercises.extend(self.mindfulness_exercises['grounding'])
        else:  # severe
            exercises.extend(self.mindfulness_exercises['breathing'])
            exercises.extend(self.mindfulness_exercises['grounding'])
            exercises.extend(self.mindfulness_exercises['meditation'][:1])
        
        return exercises

    def get_crisis_resources(self) -> List[Dict]:
        """Get crisis intervention resources"""
        return {
            'immediate_help': self.crisis_resources['emergency_contacts'],
            'hotlines': self.crisis_resources['hotlines'],
            'message': 'If you are having thoughts of self-harm, please reach out for immediate help.'
        }

    def get_professional_help_resources(self) -> List[Dict]:
        """Get professional mental health resources"""
        return {
            'therapy_types': list(self.therapy_types.values()),
            'message': 'Consider reaching out to a mental health professional for additional support.',
            'resources': [
                'Psychology Today therapist finder',
                'Your healthcare provider for referrals',
                'Employee assistance programs',
                'Community mental health centers'
            ]
        }

    def recommend_mindfulness_exercise(self, user_id: str, current_mood: int, 
                                     stress_level: int, available_time: int = 10) -> Dict:
        """Recommend personalized mindfulness exercise"""
        try:
            # Get user's history for personalization
            user_sessions = self.mindfulness_sessions.get(user_id, [])
            recent_exercises = [s['exercise_name'] for s in user_sessions[-5:]]  # Last 5 exercises
            
            suitable_exercises = []
            
            # Filter exercises based on available time
            for category, exercises in self.mindfulness_exercises.items():
                for exercise in exercises:
                    if exercise['duration'] <= available_time:
                        suitable_exercises.append({**exercise, 'category': category})
            
            if not suitable_exercises:
                return {'success': False, 'error': 'No exercises available for the given time constraint'}
            
            # Prioritize based on current state
            if stress_level >= 7:
                # Prioritize breathing and grounding exercises for high stress
                stress_exercises = [ex for ex in suitable_exercises if ex['category'] in ['breathing', 'grounding']]
                if stress_exercises:
                    suitable_exercises = stress_exercises
            
            if current_mood <= 4:
                # Prioritize mood-boosting exercises for low mood
                mood_exercises = [ex for ex in suitable_exercises if 'mood' in ' '.join(ex['benefits']).lower()]
                if mood_exercises:
                    suitable_exercises = mood_exercises
            
            # Avoid recently used exercises for variety
            fresh_exercises = [ex for ex in suitable_exercises if ex['name'] not in recent_exercises]
            if fresh_exercises:
                suitable_exercises = fresh_exercises
            
            # Select exercise
            recommended_exercise = random.choice(suitable_exercises)
            
            return {
                'success': True,
                'exercise': recommended_exercise,
                'personalization_note': self.get_personalization_note(current_mood, stress_level)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_personalization_note(self, mood: int, stress: int) -> str:
        """Generate personalized note for exercise recommendation"""
        if stress >= 7:
            return "This exercise is especially helpful for managing stress and finding calm."
        elif mood <= 4:
            return "This practice can help lift your mood and bring more positivity to your day."
        elif mood >= 8:
            return "Great to see you're feeling good! This exercise will help maintain your positive state."
        else:
            return "This exercise is perfect for your current state and will support your well-being."

    def log_mindfulness_session(self, user_id: str, exercise_name: str, 
                               duration_completed: int, rating: int, notes: str = "") -> Dict:
        """Log completed mindfulness session"""
        try:
            session_id = str(uuid.uuid4())
            timestamp = datetime.now()
            
            session = {
                'session_id': session_id,
                'user_id': user_id,
                'timestamp': timestamp.isoformat(),
                'exercise_name': exercise_name,
                'duration_completed': duration_completed,
                'rating': max(1, min(5, rating)),  # 1-5 scale
                'notes': notes,
                'completed': True
            }
            
            if user_id not in self.mindfulness_sessions:
                self.mindfulness_sessions[user_id] = []
            
            self.mindfulness_sessions[user_id].append(session)
            
            # Generate session insights
            insights = self.generate_session_insights(user_id)
            
            return {
                'success': True,
                'session': session,
                'insights': insights
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def generate_session_insights(self, user_id: str) -> Dict:
        """Generate insights from mindfulness session history"""
        if user_id not in self.mindfulness_sessions:
            return {'message': 'Start building your mindfulness practice!'}
        
        sessions = self.mindfulness_sessions[user_id]
        if not sessions:
            return {'message': 'Start building your mindfulness practice!'}
        
        total_sessions = len(sessions)
        total_minutes = sum(s['duration_completed'] for s in sessions)
        avg_rating = np.mean([s['rating'] for s in sessions])
        
        # Recent streak
        recent_sessions = [s for s in sessions if 
                          datetime.fromisoformat(s['timestamp']) >= datetime.now() - timedelta(days=7)]
        
        insights = {
            'total_sessions': total_sessions,
            'total_minutes': total_minutes,
            'average_rating': round(avg_rating, 1),
            'recent_sessions_this_week': len(recent_sessions),
            'progress_message': self.get_progress_message(total_sessions, avg_rating)
        }
        
        return insights

    def get_progress_message(self, total_sessions: int, avg_rating: float) -> str:
        """Generate encouraging progress message"""
        if total_sessions == 1:
            return "Great start on your mindfulness journey! Consistency is key."
        elif total_sessions < 5:
            return "You're building a great foundation. Keep practicing regularly!"
        elif total_sessions < 20:
            return "Excellent progress! You're developing a strong mindfulness practice."
        else:
            return "Impressive dedication! You're a mindfulness expert in the making."

    def get_mental_health_summary(self, user_id: str, days: int = 30) -> Dict:
        """Generate comprehensive mental health summary"""
        try:
            summary = {
                'user_id': user_id,
                'period_days': days,
                'generated_at': datetime.now().isoformat()
            }
            
            # Mood trends
            mood_trends = self.analyze_mood_trends(user_id, days)
            summary['mood_trends'] = mood_trends
            
            # Assessment history
            assessments = self.stress_assessments.get(user_id, [])
            recent_assessments = [a for a in assessments if 
                                datetime.fromisoformat(a['timestamp']) >= datetime.now() - timedelta(days=days)]
            summary['recent_assessments'] = len(recent_assessments)
            
            # Mindfulness practice
            sessions = self.mindfulness_sessions.get(user_id, [])
            recent_sessions = [s for s in sessions if 
                             datetime.fromisoformat(s['timestamp']) >= datetime.now() - timedelta(days=days)]
            
            summary['mindfulness_practice'] = {
                'sessions_completed': len(recent_sessions),
                'total_minutes': sum(s['duration_completed'] for s in recent_sessions),
                'average_rating': round(np.mean([s['rating'] for s in recent_sessions]), 1) if recent_sessions else 0
            }
            
            # Overall wellness score
            summary['wellness_score'] = self.calculate_wellness_score(user_id, days)
            
            # Recommendations
            summary['recommendations'] = self.generate_wellness_recommendations(user_id, summary)
            
            return {'success': True, 'summary': summary}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def calculate_wellness_score(self, user_id: str, days: int) -> Dict:
        """Calculate overall mental wellness score"""
        score_components = {}
        
        # Mood component (40% of score)
        mood_trends = self.analyze_mood_trends(user_id, days)
        if 'averages' in mood_trends:
            mood_score = (mood_trends['averages']['mood'] / 10) * 40
            score_components['mood'] = mood_score
        else:
            score_components['mood'] = 20  # Neutral if no data
        
        # Mindfulness practice component (30% of score)
        sessions = self.mindfulness_sessions.get(user_id, [])
        recent_sessions = [s for s in sessions if 
                         datetime.fromisoformat(s['timestamp']) >= datetime.now() - timedelta(days=days)]
        
        if recent_sessions:
            practice_frequency = len(recent_sessions) / days * 7  # Sessions per week
            practice_score = min(30, practice_frequency * 10)  # Max 30 points
        else:
            practice_score = 0
        score_components['mindfulness'] = practice_score
        
        # Assessment results component (30% of score)
        assessments = self.stress_assessments.get(user_id, [])
        recent_assessments = [a for a in assessments if 
                            datetime.fromisoformat(a['timestamp']) >= datetime.now() - timedelta(days=days)]
        
        if recent_assessments:
            latest_assessment = max(recent_assessments, key=lambda x: x['timestamp'])
            if latest_assessment['type'] == 'PHQ-9':
                assessment_score = max(0, 30 - (latest_assessment['total_score'] / 27 * 30))
            else:  # GAD-7
                assessment_score = max(0, 30 - (latest_assessment['total_score'] / 21 * 30))
        else:
            assessment_score = 20  # Neutral if no data
        score_components['assessment'] = assessment_score
        
        total_score = sum(score_components.values())
        
        return {
            'total_score': round(total_score, 1),
            'components': score_components,
            'rating': self.get_score_rating(total_score)
        }

    def get_score_rating(self, score: float) -> str:
        """Convert wellness score to rating"""
        if score >= 80:
            return 'excellent'
        elif score >= 60:
            return 'good'
        elif score >= 40:
            return 'fair'
        else:
            return 'needs_attention'

    def generate_wellness_recommendations(self, user_id: str, summary: Dict) -> List[str]:
        """Generate personalized wellness recommendations"""
        recommendations = []
        
        wellness_score = summary['wellness_score']['total_score']
        mindfulness_sessions = summary['mindfulness_practice']['sessions_completed']
        
        if wellness_score < 40:
            recommendations.append("Consider scheduling a consultation with a mental health professional")
            recommendations.append("Focus on basic self-care: regular sleep, nutrition, and gentle exercise")
        
        if mindfulness_sessions < 7:  # Less than weekly practice
            recommendations.append("Try to establish a daily mindfulness practice, even if just 5 minutes")
        
        if 'mood_trends' in summary and 'averages' in summary['mood_trends']:
            avg_stress = summary['mood_trends']['averages'].get('stress', 5)
            if avg_stress > 7:
                recommendations.append("Implement stress-reduction techniques like breathing exercises or meditation")
        
        if summary['recent_assessments'] == 0:
            recommendations.append("Consider taking a mental health assessment to track your progress")
        
        # Always include positive reinforcement
        if wellness_score >= 60:
            recommendations.append("Great work maintaining your mental health! Keep up the good practices.")
        
        return recommendations[:4]  # Return top 4 recommendations

# Global instance
mental_health_ai = MentalHealthAI()

# Exported functions for Flask integration
def track_mood(user_id, mood_rating, mood_notes="", energy_level=5, sleep_quality=5, stress_level=5, anxiety_level=5):
    """Track daily mood and emotional state"""
    try:
        return mental_health_ai.track_mood(user_id, mood_rating, mood_notes, energy_level, sleep_quality, stress_level, anxiety_level)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def conduct_phq9_assessment(user_id, responses):
    """Conduct PHQ-9 depression screening"""
    try:
        return mental_health_ai.conduct_phq9_assessment(user_id, responses)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def conduct_gad7_assessment(user_id, responses):
    """Conduct GAD-7 anxiety screening"""
    try:
        return mental_health_ai.conduct_gad7_assessment(user_id, responses)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def recommend_mindfulness_exercise(user_id, current_mood, stress_level, available_time=10):
    """Recommend personalized mindfulness exercise"""
    try:
        return mental_health_ai.recommend_mindfulness_exercise(user_id, current_mood, stress_level, available_time)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def log_mindfulness_session(user_id, exercise_name, duration_completed, rating, notes=""):
    """Log completed mindfulness session"""
    try:
        return mental_health_ai.log_mindfulness_session(user_id, exercise_name, duration_completed, rating, notes)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_mental_health_summary(user_id, days=30):
    """Generate comprehensive mental health summary"""
    try:
        return mental_health_ai.get_mental_health_summary(user_id, days)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_crisis_resources():
    """Get crisis intervention resources"""
    try:
        return mental_health_ai.get_crisis_resources()
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_professional_help_resources():
    """Get professional mental health resources"""
    try:
        return mental_health_ai.get_professional_help_resources()
    except Exception as e:
        return {'success': False, 'error': str(e)}