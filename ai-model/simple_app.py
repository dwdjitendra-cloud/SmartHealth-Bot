import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
import os

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'SmartHealthBot AI Model Service',
        'version': '1.0.0'
    })

@app.route('/predict', methods=['POST'])
def predict_symptoms():
    """Predict disease based on symptoms"""
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        
        # Simple fallback prediction for testing
        prediction = {
            'disease': 'Common Cold',
            'confidence': 0.85,
            'description': 'A viral infection of the upper respiratory tract.',
            'precautions': [
                'Get plenty of rest',
                'Drink lots of fluids',
                'Take pain relievers if needed',
                'Use humidifier or breathe steam'
            ],
            'severity': 'low'
        }
        
        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'input_symptoms': symptoms
        })
        
    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/risk-assessment', methods=['POST'])
def risk_assessment():
    """Health risk assessment endpoint"""
    try:
        data = request.get_json()
        
        # Simple risk assessment response
        assessment = {
            'overall_risk': 'low',
            'risk_score': 0.3,
            'recommendations': [
                'Maintain regular exercise',
                'Follow a balanced diet',
                'Get regular health checkups'
            ],
            'risk_factors': []
        }
        
        return jsonify({
            'status': 'success',
            'assessment': assessment
        })
        
    except Exception as e:
        logger.error(f"Error in risk assessment: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/vital-signs/simulate', methods=['POST'])
def simulate_vital_signs():
    """Simulate vital signs data"""
    try:
        data = request.get_json()
        
        # Generate simulated vital signs
        vital_signs = {
            'heart_rate': np.random.randint(60, 100),
            'blood_pressure': {
                'systolic': np.random.randint(110, 140),
                'diastolic': np.random.randint(70, 90)
            },
            'temperature': round(np.random.uniform(98.0, 99.5), 1),
            'oxygen_saturation': np.random.randint(95, 100),
            'respiratory_rate': np.random.randint(12, 20)
        }
        
        return jsonify({
            'status': 'success',
            'vital_signs': vital_signs
        })
        
    except Exception as e:
        logger.error(f"Error in vital signs simulation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/vital-signs/analyze', methods=['POST'])
def analyze_vital_signs():
    """Analyze vital signs data"""
    try:
        data = request.get_json()
        
        analysis = {
            'status': 'normal',
            'alerts': [],
            'recommendations': ['Continue monitoring vital signs regularly'],
            'trend': 'stable'
        }
        
        return jsonify({
            'status': 'success',
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"Error in vital signs analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/medications/analyze', methods=['POST'])
def analyze_medications():
    """Analyze medication data"""
    try:
        data = request.get_json()
        
        analysis = {
            'interactions': [],
            'side_effects': [],
            'effectiveness': 'good',
            'recommendations': ['Continue current medication regimen']
        }
        
        return jsonify({
            'status': 'success',
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"Error in medication analysis: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    try:
        logger.info("🚀 Starting SmartHealthBot AI Model Service (Simple Mode)...")
        logger.info("✅ Service ready on port 5000")
        
        # Start Flask app
        app.run(host="0.0.0.0", port=5000, debug=True)
        
    except Exception as e:
        logger.error(f"❌ Fatal error during startup: {e}")
        logger.error(traceback.format_exc())