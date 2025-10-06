import pandas as pd
import numpy as np
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
import logging
import traceback
import os
import re
from difflib import get_close_matches
from health_risk_assessment import health_risk_assessor
from vital_signs_monitor import vital_signs_monitor
from medication_manager import medication_manager
from telemedicine_platform import telemedicine_platform
from mental_health_ai import mental_health_ai

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
MODEL = None
SYMPTOM_LIST = []
LABEL_ENCODER = None
DESC_DF = None
PRECAUTION_DF = None
SEVERITY_DF = None
SYMPTOM_MAPPER = None

# Symptom mapping dictionary for natural language processing
SYMPTOM_SYNONYMS = {
    'fever': ['high temperature', 'temperature', 'hot', 'burning up', 'pyrexia'],
    'headache': ['head pain', 'migraine', 'head ache', 'cranial pain'],
    'cough': ['coughing', 'hack', 'throat clearing'],
    'fatigue': ['tired', 'exhausted', 'weakness', 'weak', 'lethargy', 'drowsy'],
    'nausea': ['sick', 'queasy', 'feel sick', 'stomach upset'],
    'vomiting': ['throwing up', 'puking', 'being sick', 'retching'],
    'diarrhea': ['loose stools', 'runny stomach', 'upset stomach'],
    'abdominal_pain': ['stomach pain', 'belly pain', 'tummy ache', 'stomach ache'],
    'chest_pain': ['chest ache', 'heart pain', 'chest discomfort'],
    'back_pain': ['backache', 'spine pain', 'lower back pain'],
    'joint_pain': ['arthritis', 'aching joints', 'stiff joints'],
    'muscle_pain': ['muscle ache', 'sore muscles', 'muscle soreness'],
    'shortness_of_breath': ['difficulty breathing', 'breathless', 'cant breathe'],
    'dizziness': ['dizzy', 'lightheaded', 'spinning sensation'],
    'skin_rash': ['rash', 'skin irritation', 'red skin', 'skin problem'],
    'sore_throat': ['throat pain', 'painful throat', 'throat ache'],
    'runny_nose': ['blocked nose', 'stuffy nose', 'nasal congestion'],
    'loss_of_appetite': ['no appetite', 'dont want to eat', 'not hungry'],
    'weight_loss': ['losing weight', 'getting thinner', 'weight dropping'],
    'anxiety': ['worried', 'anxious', 'nervous', 'panic', 'stress'],
    'depression': ['sad', 'low mood', 'depressed', 'down'],
    'insomnia': ['cant sleep', 'sleepless', 'trouble sleeping'],
    'constipation': ['blocked up', 'cant poop', 'hard stools'],
    'frequent_urination': ['peeing a lot', 'urinating often', 'bathroom often'],
    'blurred_vision': ['vision problems', 'cant see clearly', 'fuzzy vision'],
    'sweating': ['excessive sweating', 'perspiring', 'night sweats'],
    'chills': ['cold shivers', 'shivering', 'feeling cold'],
    'swollen_lymph_nodes': ['swollen glands', 'enlarged glands'],
}

DATASET_PATHS = {
    "main": os.path.join(os.path.dirname(__file__), "dataset.csv"),
    "desc": os.path.join(os.path.dirname(__file__), "symptom_Description.csv"),
    "precaution": os.path.join(os.path.dirname(__file__), "symptom_precaution.csv"),
    "severity": os.path.join(os.path.dirname(__file__), "Symptom-severity.csv")
}

def clean_symptom(s):
    """Standardize symptom formatting"""
    if pd.isna(s):
        return ""
    return str(s).strip().lower().replace(" ", "_")

<<<<<<< HEAD
def enhance_symptom_matching(input_symptoms, available_symptoms):
    """Enhanced symptom matching using synonyms and partial matching"""
    # Create synonym mapping
    symptom_synonyms = {
        "fever": ["fever", "high_temperature", "pyrexia"],
        "headache": ["headache", "head_pain", "cephalgia"],
        "cough": ["cough", "coughing"],
        "tired": ["fatigue", "weakness", "tiredness"],
        "fatigue": ["fatigue", "weakness", "tired", "tiredness"],
        "body_aches": ["muscle_aches", "joint_pain", "body_pain"],
        "body_pain": ["muscle_aches", "joint_pain", "body_aches"],
        "stomach_pain": ["abdominal_pain", "belly_pain"],
        "nausea": ["nausea", "vomiting"],
        "runny_nose": ["runny_nose", "nasal_congestion"],
        "sore_throat": ["throat_irritation", "throat_pain"],
        "dizziness": ["dizziness", "vertigo"],
        "shortness_of_breath": ["breathlessness", "difficulty_breathing"],
        "chest_pain": ["chest_pain", "chest_tightness"],
        "back_pain": ["back_pain", "lower_back_pain"],
        "joint_pain": ["joint_pain", "arthritis", "stiffness"],
        "skin_rash": ["skin_rash", "rash"],
        "itching": ["itching", "pruritus"],
        "sweating": ["excessive_sweating", "night_sweats"],
        "loss_of_appetite": ["loss_of_appetite", "poor_appetite"],
        "weight_loss": ["weight_loss", "unexplained_weight_loss"],
        "difficulty_sleeping": ["insomnia", "sleep_disturbance"],
        "anxiety": ["anxiety", "nervousness", "worry"]
    }
    
    matched_symptoms = []
    
    for symptom in input_symptoms:
        # Direct match
        if symptom in available_symptoms:
            matched_symptoms.append(symptom)
            continue
            
        # Check synonyms
        found_match = False
        for main_symptom, synonyms in symptom_synonyms.items():
            if symptom in synonyms:
                # Check if any of the synonyms exist in available symptoms
                for syn in synonyms:
                    if syn in available_symptoms:
                        matched_symptoms.append(syn)
                        found_match = True
                        break
                if found_match:
=======
def map_natural_language_symptoms(text_symptoms):
    """Map natural language symptoms to structured symptom names"""
    if isinstance(text_symptoms, str):
        # Convert text to list by splitting on common delimiters
        symptom_texts = re.split(r'[,;.\n\r]+', text_symptoms.lower())
    else:
        symptom_texts = [str(s).lower() for s in text_symptoms]
    
    mapped_symptoms = set()
    
    for text in symptom_texts:
        text = text.strip()
        if not text:
            continue
            
        # Direct mapping check
        clean_text = clean_symptom(text)
        if clean_text in SYMPTOM_LIST:
            mapped_symptoms.add(clean_text)
            continue
            
        # Synonym mapping
        found_match = False
        for official_symptom, synonyms in SYMPTOM_SYNONYMS.items():
            if any(synonym in text for synonym in synonyms):
                if official_symptom in SYMPTOM_LIST:
                    mapped_symptoms.add(official_symptom)
                    found_match = True
>>>>>>> 2e6afe8 (Update README with live deployment URL and enhance UI features)
                    break
        
        if found_match:
            continue
            
<<<<<<< HEAD
        # Partial matching - find symptoms that contain the input or vice versa
        for available_symptom in available_symptoms:
            if (symptom in available_symptom or available_symptom in symptom) and len(symptom) > 2:
                matched_symptoms.append(available_symptom)
                break
    
    return list(set(matched_symptoms))  # Remove duplicates
=======
        # Fuzzy matching with official symptoms
        close_matches = get_close_matches(text.replace(' ', '_'), SYMPTOM_LIST, n=1, cutoff=0.7)
        if close_matches:
            mapped_symptoms.add(close_matches[0])
            continue
            
        # Partial matching for compound symptoms
        for symptom in SYMPTOM_LIST:
            symptom_words = symptom.replace('_', ' ').split()
            text_words = text.split()
            
            # Check if any symptom word is in the text
            if any(word in text for word in symptom_words if len(word) > 3):
                mapped_symptoms.add(symptom)
                break
    
    return list(mapped_symptoms)

def enhance_prediction_with_context(symptoms, prediction, confidence):
    """Enhance prediction with contextual information"""
    # Boost confidence for common symptom combinations
    symptom_combinations = {
        ('fever', 'cough', 'fatigue'): 'flu',
        ('headache', 'fever', 'neck_stiffness'): 'meningitis',
        ('chest_pain', 'shortness_of_breath'): 'heart_condition',
        ('abdominal_pain', 'nausea', 'vomiting'): 'gastroenteritis'
    }
    
    for combo, condition_hint in symptom_combinations.items():
        if all(s in symptoms for s in combo):
            confidence = min(confidence + 0.2, 1.0)
            break
    
    return confidence

def generate_home_remedies(symptoms, disease):
    """Generate contextual home remedies based on symptoms"""
    remedies = set()
    
    # Symptom-specific remedies
    remedy_map = {
        'fever': ['Rest and stay hydrated', 'Take paracetamol as directed', 'Use cool compresses'],
        'cough': ['Drink warm honey and lemon tea', 'Stay hydrated', 'Use a humidifier'],
        'headache': ['Rest in a dark room', 'Apply cold compress', 'Stay hydrated'],
        'fatigue': ['Get adequate sleep', 'Eat nutritious meals', 'Light exercise'],
        'nausea': ['Eat small frequent meals', 'Drink ginger tea', 'Avoid strong odors'],
        'abdominal_pain': ['Apply warm compress', 'Eat bland foods', 'Stay hydrated'],
        'sore_throat': ['Gargle with warm salt water', 'Drink warm liquids', 'Use throat lozenges'],
        'muscle_pain': ['Apply heat or ice', 'Gentle stretching', 'Rest the affected area'],
        'anxiety': ['Practice deep breathing', 'Meditation', 'Regular exercise'],
        'insomnia': ['Maintain sleep schedule', 'Avoid caffeine before bed', 'Relaxation techniques']
    }
    
    # Add remedies based on symptoms
    for symptom in symptoms:
        if symptom in remedy_map:
            remedies.update(remedy_map[symptom][:2])  # Limit to 2 per symptom
    
    # Add general remedies
    remedies.add('Consult a healthcare professional if symptoms persist')
    remedies.add('Monitor your symptoms')
    
    # Convert to list and limit total
    return list(remedies)[:6]
>>>>>>> 2e6afe8 (Update README with live deployment URL and enhance UI features)

def standardize_disease_name(name):
    """Standardize disease name formatting"""
    if pd.isna(name):
        return ""
    return str(name).strip().title()

def load_data():
    """Load and prepare datasets from CSV files."""
    try:
        logger.info("📂 Loading datasets...")
        
        # Verify files exist
        for name, path in DATASET_PATHS.items():
            if not os.path.exists(path):
                raise FileNotFoundError(f"Missing {name} dataset at: {path}")
        
        # Load datasets
        dataset = pd.read_csv(DATASET_PATHS["main"])
        desc_df = pd.read_csv(DATASET_PATHS["desc"])
        precaution_df = pd.read_csv(DATASET_PATHS["precaution"])
        severity_df = pd.read_csv(DATASET_PATHS["severity"])

        logger.info(f"✅ Main dataset shape: {dataset.shape}")
        logger.info(f"✅ Description dataset shape: {desc_df.shape}")
        logger.info(f"✅ Precaution dataset shape: {precaution_df.shape}")
        logger.info(f"✅ Severity dataset shape: {severity_df.shape}")

        # Process main dataset
        symptom_cols = [col for col in dataset.columns if col.lower().startswith("symptom")]
        dataset["symptoms"] = dataset[symptom_cols].apply(
            lambda row: [clean_symptom(s) for s in row.dropna() if clean_symptom(s) != ""],
            axis=1
        )
        dataset["Disease"] = dataset["Disease"].apply(standardize_disease_name)

<<<<<<< HEAD
        # Process other datasets - do not modify column names, only clean data
        for df in [desc_df, precaution_df]:
            for col in df.columns:
                if df[col].dtype == 'object' and col not in ["Disease", "Description"]:
                    df[col] = df[col].apply(lambda x: str(x).strip() if pd.notna(x) else "")
        
        # For severity dataset, clean symptom names to match our format
        if "Symptom" in severity_df.columns:
            severity_df["Symptom"] = severity_df["Symptom"].apply(clean_symptom)
=======
        # Process other datasets
        for df in [desc_df, precaution_df]:
            if "Disease" in df.columns:
                df["Disease"] = df["Disease"].apply(standardize_disease_name)
            for col in df.columns:
                if df[col].dtype == 'object':
                    df[col] = df[col].apply(clean_symptom)
                    
        # Severity file has different structure (Symptom, weight) 
        # Don't standardize it as it doesn't have Disease column
>>>>>>> 2e6afe8 (Update README with live deployment URL and enhance UI features)

        logger.info("✅ Datasets loaded and cleaned successfully")
        return dataset, desc_df, precaution_df, severity_df

    except Exception as e:
        logger.error(f"❌ Failed to load datasets: {e}")
        logger.error(traceback.format_exc())
        raise

def train_model(dataset):
    """Train Random Forest model for higher accuracy."""
    try:
        logger.info("📊 Training model...")
        
        # Prepare features more efficiently
        all_symptoms = sorted({sym for sublist in dataset["symptoms"] for sym in sublist})
        logger.info(f"Found {len(all_symptoms)} unique symptoms")
        
        # Create feature matrix more efficiently using pd.concat
        features_dict = {}
        for sym in all_symptoms:
            features_dict[sym] = dataset["symptoms"].apply(lambda x: 1 if sym in x else 0)
        
        X = pd.DataFrame(features_dict)
        le = LabelEncoder()
        y = le.fit_transform(dataset["Disease"])

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=42
        )

        # Train model
        model = RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            min_samples_split=2,
            min_samples_leaf=1,
            bootstrap=True,
            random_state=42,
            verbose=1
        )
        model.fit(X_train, y_train)

        # Evaluate model
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        cv_scores = cross_val_score(model, X, y, cv=5)
        
        logger.info(f"✅ Training Accuracy: {train_score * 100:.2f}%")
        logger.info(f"✅ Test Accuracy: {test_score * 100:.2f}%")
        logger.info(f"✅ Cross-validation Accuracy: {cv_scores.mean() * 100:.2f}%")

        return model, all_symptoms, le

    except Exception as e:
        logger.error(f"❌ Error training model: {e}")
        logger.error(traceback.format_exc())
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "SmartHealthBot AI Model Service is running",
        "features": [
            "Disease Prediction",
            "Natural Language Processing",
            "Health Risk Assessment",
            "Personalized Recommendations"
        ]
    })

@app.route('/risk-assessment', methods=['POST'])
def comprehensive_risk_assessment():
    """Advanced AI-powered health risk assessment"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "No data provided",
                "required_fields": ["user_profile", "symptoms"]
            }), 400
        
        user_profile = data.get('user_profile', {})
        symptoms = data.get('symptoms', [])
        
        # Validate required fields
        if not isinstance(symptoms, list):
            symptoms = [symptoms] if symptoms else []
        
        # Generate comprehensive health insights
        health_insights = health_risk_assessor.generate_health_insights(user_profile, symptoms)
        
        # Add AI-enhanced predictions if symptoms provided
        ai_predictions = None
        if symptoms:
            # Use existing symptom prediction
            symptom_text = ' '.join(symptoms) if isinstance(symptoms, list) else str(symptoms)
            prediction_result = predict(symptom_text)
            if prediction_result and prediction_result[0] != 400:
                ai_predictions = prediction_result[0].get_json()
        
        response = {
            "status": "success",
            "health_insights": health_insights,
            "ai_predictions": ai_predictions,
            "recommendations": {
                "immediate": health_insights.get('personalized_plan', {}).get('immediate_actions', []),
                "lifestyle": health_insights.get('personalized_plan', {}).get('lifestyle_recommendations', []),
                "screening": health_insights.get('personalized_plan', {}).get('screening_schedule', [])
            },
            "risk_summary": {
                "overall_score": health_insights.get('overall_risk', {}).get('score', 0),
                "health_score": health_insights.get('health_score', 0),
                "risk_level": health_insights.get('overall_risk', {}).get('level', 'Unknown'),
                "priority_areas": health_insights.get('priority_areas', [])
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Risk assessment error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Health risk assessment failed",
            "message": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def predict():
    """Predict disease and return details."""
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        if not data or "symptoms" not in data:
            return jsonify({
                "error": "No symptoms provided",
                "example": {"symptoms": ["fever", "headache"]}
            }), 400

<<<<<<< HEAD
        # Handle both string and array input formats
        symptoms_input = data.get("symptoms", [])
        if isinstance(symptoms_input, str):
            # Parse string into individual symptoms using regex
            import re
            input_symptoms = [clean_symptom(s.strip()) for s in re.split(r'[,;.\n]+', symptoms_input) if s.strip()]
        elif isinstance(symptoms_input, list):
            input_symptoms = [clean_symptom(s) for s in symptoms_input]
        else:
            return jsonify({
                "error": "Symptoms must be a string or array",
                "example": {"symptoms": ["fever", "headache"]}
            }), 400

        # Enhanced symptom matching
        valid_symptoms = enhance_symptom_matching(input_symptoms, SYMPTOM_LIST)
=======
        # Handle both array and string input
        input_symptoms = data.get("symptoms", [])
>>>>>>> 2e6afe8 (Update README with live deployment URL and enhance UI features)
        
        # Map natural language symptoms to structured symptoms
        if isinstance(input_symptoms, str):
            mapped_symptoms = map_natural_language_symptoms(input_symptoms)
        elif isinstance(input_symptoms, list):
            # Try to map each symptom
            mapped_symptoms = []
            for symptom in input_symptoms:
                mapped = map_natural_language_symptoms(str(symptom))
                mapped_symptoms.extend(mapped)
            mapped_symptoms = list(set(mapped_symptoms))  # Remove duplicates
        else:
            return jsonify({"error": "Symptoms must be string or array"}), 400
        
        if not mapped_symptoms:
            # Provide helpful suggestions
            sample_symptoms = SYMPTOM_LIST[:20]
            return jsonify({
                "error": "No valid symptoms could be mapped from your input",
                "suggestions": f"Try using symptoms like: {', '.join(sample_symptoms[:10])}",
                "received_input": input_symptoms,
                "tip": "Describe symptoms in simple terms like 'fever', 'headache', 'cough', etc."
            }), 400

        # Prepare features and predict
        features = [1 if sym in mapped_symptoms else 0 for sym in SYMPTOM_LIST]
        prediction = MODEL.predict([features])[0]
        probabilities = MODEL.predict_proba([features])[0]
        confidence = float(probabilities.max())
        
        # Enhance confidence with context
        confidence = enhance_prediction_with_context(mapped_symptoms, prediction, confidence)
        
        disease = LABEL_ENCODER.inverse_transform([prediction])[0]
        disease_title = standardize_disease_name(disease)

        # Get description
        description = "No description available"
<<<<<<< HEAD
        if not DESC_DF.empty and "Disease" in DESC_DF.columns:
=======
        if not DESC_DF.empty:
>>>>>>> 2e6afe8 (Update README with live deployment URL and enhance UI features)
            desc_matches = DESC_DF[DESC_DF["Disease"].str.strip().str.title() == disease_title]
            if not desc_matches.empty:
                description = desc_matches["Description"].iloc[0]

        # Get precautions
        precautions = []
        if not PRECAUTION_DF.empty and "Disease" in PRECAUTION_DF.columns:
            prec_row = PRECAUTION_DF[
                PRECAUTION_DF["Disease"].str.strip().str.title() == disease_title
            ]
            if not prec_row.empty:
                precautions = [p for p in prec_row.iloc[0, 1:] 
                             if isinstance(p, str) and p.strip()]

<<<<<<< HEAD
        # Get severity (this dataset has different structure - Symptom,weight)
        severity_info = "low"  # default
        if not SEVERITY_DF.empty and valid_symptoms:
            # Calculate severity based on symptom weights
            total_weight = 0
            for symptom in valid_symptoms:
                if "Symptom" in SEVERITY_DF.columns:
                    weight_matches = SEVERITY_DF[SEVERITY_DF["Symptom"].str.contains(symptom, case=False, na=False)]
                    if not weight_matches.empty:
                        total_weight += weight_matches["weight"].iloc[0]
            
            # Determine severity based on total weight
            if total_weight >= 15:
                severity_info = "critical"
            elif total_weight >= 10:
                severity_info = "high"
            elif total_weight >= 5:
                severity_info = "medium"
            else:
                severity_info = "low"

        # Get home remedies (use precautions as home remedies for now, but make it more specific)
        home_remedies = []
        if precautions:
            # Create home remedies based on precautions
            home_remedies = [
                "Rest and get adequate sleep",
                "Stay hydrated by drinking plenty of water",
                "Maintain good hygiene",
                "Follow a balanced diet"
            ]
            # Add specific remedies based on disease type
            if 'fever' in disease_title.lower():
                home_remedies.extend(["Apply cool compress", "Take lukewarm baths"])
            elif 'cold' in disease_title.lower() or 'cough' in disease_title.lower():
                home_remedies.extend(["Drink warm fluids", "Use honey for sore throat"])
            elif 'headache' in disease_title.lower():
                home_remedies.extend(["Apply cold or warm compress", "Practice relaxation techniques"])

        # Calculate confidence with minimum threshold
        confidence_score = float(MODEL.predict_proba([features]).max())
        # Ensure minimum confidence for valid predictions
        if confidence_score < 0.3:
            confidence_score = max(0.3, confidence_score)  # Set minimum confidence
=======
        # Calculate severity based on matched symptom weights
        severity_score = 0
        total_symptoms = len(mapped_symptoms)
        
        if not SEVERITY_DF.empty and total_symptoms > 0:
            for symptom in mapped_symptoms:
                symptom_clean = symptom.strip().lower().replace(' ', '_')
                weight_matches = SEVERITY_DF[SEVERITY_DF["Symptom"].str.strip().str.lower() == symptom_clean]
                if not weight_matches.empty:
                    severity_score += weight_matches["weight"].iloc[0]
            
            # Calculate average severity and map to categories
            avg_severity = severity_score / total_symptoms if total_symptoms > 0 else 0
            if avg_severity >= 5:
                severity_info = "critical"
            elif avg_severity >= 4:
                severity_info = "high"
            elif avg_severity >= 2:
                severity_info = "medium"
            else:
                severity_info = "low"
        else:
            severity_info = "medium"  # Default to medium instead of "Unknown"

        # Generate home remedies based on symptoms
        home_remedies = generate_home_remedies(mapped_symptoms, disease_title)
>>>>>>> 2e6afe8 (Update README with live deployment URL and enhance UI features)

        return jsonify({
            "disease": disease_title,
            "description": description,
            "precautions": precautions,
            "home_remedies": home_remedies,
            "severity": severity_info,
<<<<<<< HEAD
            "matched_symptoms": valid_symptoms,
            "confidence": confidence_score,
            "total_symptoms_matched": len(valid_symptoms),
            "available_symptoms_count": len(SYMPTOM_LIST)
=======
            "matched_symptoms": mapped_symptoms,
            "confidence": confidence,
            "total_symptoms_analyzed": len(mapped_symptoms),
            "prediction_quality": "high" if confidence > 0.7 else "medium" if confidence > 0.4 else "low"
>>>>>>> 2e6afe8 (Update README with live deployment URL and enhance UI features)
        })

    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Prediction failed",
            "details": str(e),
            "suggestion": "Please try with simpler symptom descriptions"
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for the AI service"""
    try:
        status = {
            "status": "healthy",
            "service": "SmartHealthBot AI Model",
            "timestamp": pd.Timestamp.now().isoformat(),
            "model_loaded": MODEL is not None,
            "symptoms_available": len(SYMPTOM_LIST) if SYMPTOM_LIST else 0,
            "diseases_available": len(LABEL_ENCODER.classes_) if LABEL_ENCODER else 0
        }
        return jsonify(status)
    except Exception as e:
        logger.error(f"❌ Health check error: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route("/symptoms", methods=["GET"])
def get_symptoms():
    """Get list of all possible symptoms"""
    try:
        return jsonify({
            "symptoms": sorted(SYMPTOM_LIST),
            "count": len(SYMPTOM_LIST)
        })
    except Exception as e:
        logger.error(f"❌ Error getting symptoms: {e}")
        return jsonify({"error": str(e)}), 500

# Vital Signs Monitoring Endpoints
@app.route("/api/vital-signs/simulate", methods=["POST"])
def simulate_vital_signs():
    """Simulate wearable device data for a user"""
    try:
        data = request.get_json()
        user_profile = data.get('user_profile', {})
        duration_hours = data.get('duration_hours', 24)
        
        logger.info(f"🔄 Simulating vital signs for {duration_hours} hours")
        
        # Generate simulated data
        vital_signs_data = vital_signs_monitor.simulate_wearable_data(
            user_profile, duration_hours
        )
        
        # Convert to serializable format
        serialized_data = []
        for vs in vital_signs_data:
            serialized_data.append({
                'timestamp': vs.timestamp.isoformat(),
                'heart_rate': vs.heart_rate,
                'blood_pressure_systolic': vs.blood_pressure_systolic,
                'blood_pressure_diastolic': vs.blood_pressure_diastolic,
                'temperature': vs.temperature,
                'oxygen_saturation': vs.oxygen_saturation,
                'steps': vs.steps,
                'calories_burned': vs.calories_burned,
                'sleep_hours': vs.sleep_hours,
                'stress_level': vs.stress_level
            })
        
        # Analyze the generated data
        analysis = vital_signs_monitor.analyze_vital_trends(vital_signs_data)
        
        logger.info(f"✅ Generated {len(vital_signs_data)} vital signs readings")
        
        return jsonify({
            "vital_signs_data": serialized_data,
            "analysis": analysis,
            "duration_hours": duration_hours,
            "data_points": len(vital_signs_data)
        })
        
    except Exception as e:
        logger.error(f"❌ Error simulating vital signs: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to simulate vital signs",
            "details": str(e)
        }), 500

@app.route("/api/vital-signs/analyze", methods=["POST"])
def analyze_vital_signs():
    """Analyze vital signs data and provide insights"""
    try:
        data = request.get_json()
        vital_signs_data = data.get('vital_signs_data', [])
        
        if not vital_signs_data:
            return jsonify({
                "error": "No vital signs data provided"
            }), 400
        
        logger.info(f"🔍 Analyzing {len(vital_signs_data)} vital signs readings")
        
        # Convert from dict format to VitalSigns objects
        from vital_signs_monitor import VitalSigns
        from datetime import datetime
        
        vs_objects = []
        for vs_dict in vital_signs_data:
            vs_obj = VitalSigns(
                timestamp=datetime.fromisoformat(vs_dict['timestamp'].replace('Z', '+00:00')),
                heart_rate=vs_dict['heart_rate'],
                blood_pressure_systolic=vs_dict['blood_pressure_systolic'],
                blood_pressure_diastolic=vs_dict['blood_pressure_diastolic'],
                temperature=vs_dict['temperature'],
                oxygen_saturation=vs_dict['oxygen_saturation'],
                steps=vs_dict['steps'],
                calories_burned=vs_dict['calories_burned'],
                sleep_hours=vs_dict['sleep_hours'],
                stress_level=vs_dict.get('stress_level', 3)
            )
            vs_objects.append(vs_obj)
        
        # Perform analysis
        analysis = vital_signs_monitor.analyze_vital_trends(vs_objects)
        
        logger.info(f"✅ Analysis completed")
        
        return jsonify({
            "analysis": analysis
        })
        
    except Exception as e:
        logger.error(f"❌ Error analyzing vital signs: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to analyze vital signs",
            "details": str(e)
        }), 500

@app.route("/api/vital-signs/alerts", methods=["POST"])
def generate_vital_signs_alerts():
    """Generate health alerts based on recent vital signs"""
    try:
        data = request.get_json()
        recent_vitals = data.get('recent_vitals', [])
        
        if not recent_vitals:
            return jsonify({
                "alerts": [],
                "alert_count": 0
            })
        
        logger.info(f"🚨 Generating alerts for {len(recent_vitals)} recent readings")
        
        # Convert to VitalSigns objects
        from vital_signs_monitor import VitalSigns
        from datetime import datetime
        
        vs_objects = []
        for vs_dict in recent_vitals:
            vs_obj = VitalSigns(
                timestamp=datetime.fromisoformat(vs_dict['timestamp'].replace('Z', '+00:00')),
                heart_rate=vs_dict['heart_rate'],
                blood_pressure_systolic=vs_dict['blood_pressure_systolic'],
                blood_pressure_diastolic=vs_dict['blood_pressure_diastolic'],
                temperature=vs_dict['temperature'],
                oxygen_saturation=vs_dict['oxygen_saturation'],
                steps=vs_dict['steps'],
                calories_burned=vs_dict['calories_burned'],
                sleep_hours=vs_dict['sleep_hours'],
                stress_level=vs_dict.get('stress_level', 3)
            )
            vs_objects.append(vs_obj)
        
        # Generate alerts
        alerts = vital_signs_monitor._generate_alerts(vs_objects)
        
        logger.info(f"✅ Generated {len(alerts)} alerts")
        
        return jsonify({
            "alerts": alerts,
            "alert_count": len(alerts)
        })
        
    except Exception as e:
        logger.error(f"❌ Error generating alerts: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to generate alerts",
            "details": str(e)
        }), 500

@app.route("/api/vital-signs/trends", methods=["POST"])
def analyze_vital_signs_trends():
    """Analyze trends in vital signs over time"""
    try:
        data = request.get_json()
        vital_signs_data = data.get('vital_signs_data', [])
        period = data.get('period', '7d')
        
        if not vital_signs_data:
            return jsonify({
                "error": "No vital signs data provided"
            }), 400
        
        logger.info(f"📈 Analyzing trends for {len(vital_signs_data)} readings over {period}")
        
        # Convert to VitalSigns objects
        from vital_signs_monitor import VitalSigns
        from datetime import datetime
        
        vs_objects = []
        for vs_dict in vital_signs_data:
            vs_obj = VitalSigns(
                timestamp=datetime.fromisoformat(vs_dict['timestamp'].replace('Z', '+00:00')),
                heart_rate=vs_dict['heart_rate'],
                blood_pressure_systolic=vs_dict['blood_pressure_systolic'],
                blood_pressure_diastolic=vs_dict['blood_pressure_diastolic'],
                temperature=vs_dict['temperature'],
                oxygen_saturation=vs_dict['oxygen_saturation'],
                steps=vs_dict['steps'],
                calories_burned=vs_dict['calories_burned'],
                sleep_hours=vs_dict['sleep_hours'],
                stress_level=vs_dict.get('stress_level', 3)
            )
            vs_objects.append(vs_obj)
        
        # Analyze trends
        analysis = vital_signs_monitor.analyze_vital_trends(vs_objects)
        trends = analysis.get('trends', {})
        
        logger.info(f"✅ Trend analysis completed")
        
        return jsonify({
            "trends": trends,
            "period": period,
            "data_points": len(vital_signs_data)
        })
        
    except Exception as e:
        logger.error(f"❌ Error analyzing trends: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to analyze trends",
            "details": str(e)
        }), 500

# Medication Management Endpoints
@app.route("/api/medications/add", methods=["POST"])
def add_medication():
    """Add a new medication with validation and scheduling"""
    try:
        data = request.get_json()
        medication_data = data.get('medication_data', {})
        
        logger.info(f"💊 Adding medication: {medication_data.get('name')}")
        
        # Add medication using medication manager
        result = medication_manager.add_medication(medication_data)
        
        if result.get('success'):
            logger.info(f"✅ Medication added successfully")
            return jsonify(result)
        else:
            logger.error(f"❌ Failed to add medication: {result.get('error')}")
            return jsonify(result), 400
        
    except Exception as e:
        logger.error(f"❌ Error adding medication: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to add medication",
            "details": str(e)
        }), 500

@app.route("/api/medications/interactions", methods=["POST"])
def check_drug_interactions():
    """Check for drug interactions among medications"""
    try:
        data = request.get_json()
        medications = data.get('medications', [])
        
        logger.info(f"🔍 Checking interactions for {len(medications)} medications")
        
        # Check interactions
        interactions = medication_manager.check_drug_interactions(medications)
        
        logger.info(f"✅ Found {interactions.get('total_interactions', 0)} interactions")
        
        return jsonify(interactions)
        
    except Exception as e:
        logger.error(f"❌ Error checking interactions: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to check interactions",
            "details": str(e),
            "total_interactions": 0,
            "severe": [],
            "major": [],
            "moderate": [],
            "minor": []
        }), 500

@app.route("/api/medications/reminders", methods=["POST"])
def generate_medication_reminders():
    """Generate medication reminders for specified period"""
    try:
        data = request.get_json()
        medications = data.get('medications', [])
        days = data.get('days', 7)
        
        logger.info(f"⏰ Generating reminders for {len(medications)} medications over {days} days")
        
        # Generate reminders
        reminders = medication_manager.generate_medication_reminders(medications, days)
        
        # Convert to serializable format
        serialized_reminders = []
        for reminder in reminders:
            serialized_reminders.append({
                'medication_id': reminder.medication_id,
                'medication_name': reminder.medication_name,
                'dosage': reminder.dosage,
                'scheduled_time': reminder.scheduled_time.isoformat(),
                'taken': reminder.taken,
                'taken_time': reminder.taken_time.isoformat() if reminder.taken_time else None,
                'missed': reminder.missed,
                'notes': reminder.notes
            })
        
        logger.info(f"✅ Generated {len(reminders)} reminders")
        
        return jsonify({
            "reminders": serialized_reminders,
            "total_count": len(reminders),
            "days": days
        })
        
    except Exception as e:
        logger.error(f"❌ Error generating reminders: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to generate reminders",
            "details": str(e),
            "reminders": []
        }), 500

@app.route("/api/medications/adherence", methods=["POST"])
def calculate_medication_adherence():
    """Calculate medication adherence statistics"""
    try:
        data = request.get_json()
        medication_id = data.get('medication_id')
        medication_history = data.get('medication_history', [])
        
        logger.info(f"📊 Calculating adherence for medication {medication_id}")
        
        # Calculate adherence
        adherence_report = medication_manager.calculate_adherence(medication_id, medication_history)
        
        # Convert to serializable format
        serialized_report = {
            'medication_id': adherence_report.medication_id,
            'medication_name': adherence_report.medication_name,
            'prescribed_doses': adherence_report.prescribed_doses,
            'taken_doses': adherence_report.taken_doses,
            'missed_doses': adherence_report.missed_doses,
            'adherence_percentage': adherence_report.adherence_percentage,
            'last_taken': adherence_report.last_taken.isoformat() if adherence_report.last_taken else None,
            'next_due': adherence_report.next_due.isoformat() if adherence_report.next_due else None
        }
        
        logger.info(f"✅ Adherence calculated: {adherence_report.adherence_percentage}%")
        
        return jsonify(serialized_report)
        
    except Exception as e:
        logger.error(f"❌ Error calculating adherence: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to calculate adherence",
            "details": str(e)
        }), 500

@app.route("/api/medications/refill-alerts", methods=["POST"])
def check_refill_alerts():
    """Check for medication refill alerts"""
    try:
        data = request.get_json()
        medications = data.get('medications', [])
        
        logger.info(f"🔔 Checking refill alerts for {len(medications)} medications")
        
        # Check refill alerts
        refill_alerts = medication_manager.check_refill_alerts(medications)
        
        logger.info(f"✅ Found {len(refill_alerts)} refill alerts")
        
        return jsonify({
            "refill_alerts": refill_alerts,
            "total_alerts": len(refill_alerts)
        })
        
    except Exception as e:
        logger.error(f"❌ Error checking refill alerts: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to check refill alerts",
            "details": str(e),
            "refill_alerts": []
        }), 500

@app.route("/api/medications/side-effects", methods=["POST"])
def analyze_medication_side_effects():
    """Analyze potential medication side effects"""
    try:
        data = request.get_json()
        medications = data.get('medications', [])
        reported_symptoms = data.get('reported_symptoms', [])
        
        logger.info(f"🔬 Analyzing side effects for {len(medications)} medications and {len(reported_symptoms)} symptoms")
        
        # Analyze side effects
        analysis = medication_manager.analyze_side_effects(medications, reported_symptoms)
        
        logger.info(f"✅ Side effect analysis completed")
        
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"❌ Error analyzing side effects: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to analyze side effects",
            "details": str(e),
            "potential_medication_causes": [],
            "recommendations": []
        }), 500

# ===================== TELEMEDICINE PLATFORM ENDPOINTS =====================

@app.route("/api/telemedicine/doctors", methods=["GET"])
def get_doctors():
    """Get available doctors for consultation"""
    try:
        specialty = request.args.get('specialty')
        consultation_type = request.args.get('consultation_type', 'video')
        
        result = telemedicine_platform.get_available_doctors(specialty, consultation_type)
        
        if result['success']:
            return jsonify({
                "success": True,
                "doctors": result['doctors'],
                "specialties": result['specialties']
            })
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error getting available doctors: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get available doctors",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/book", methods=["POST"])
def book_telemedicine_appointment():
    """Book a telemedicine appointment"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        doctor_id = data.get('doctor_id')
        slot_datetime = data.get('slot_datetime')
        consultation_type = data.get('consultation_type', 'video')
        symptoms = data.get('symptoms', '')
        notes = data.get('notes', '')
        
        if not all([user_id, doctor_id, slot_datetime]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, doctor_id, slot_datetime"
            }), 400
        
        result = telemedicine_platform.book_appointment(
            user_id, doctor_id, slot_datetime, consultation_type, symptoms, notes
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error booking appointment: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to book appointment",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/appointments/<user_id>", methods=["GET"])
def get_appointments(user_id):
    """Get user's appointments"""
    try:
        status = request.args.get('status')
        
        appointments = telemedicine_platform.get_user_appointments(user_id, status)
        
        return jsonify({
            "success": True,
            "appointments": appointments
        })
            
    except Exception as e:
        logger.error(f"❌ Error getting appointments: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get appointments",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/waiting-room", methods=["POST"])
def join_telemedicine_waiting_room():
    """Join virtual waiting room"""
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        user_id = data.get('user_id')
        
        if not all([appointment_id, user_id]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: appointment_id, user_id"
            }), 400
        
        result = telemedicine_platform.join_waiting_room(appointment_id, user_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error joining waiting room: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to join waiting room",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/start-consultation", methods=["POST"])
def start_telemedicine_consultation():
    """Start video consultation"""
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        doctor_id = data.get('doctor_id')
        
        if not all([appointment_id, doctor_id]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: appointment_id, doctor_id"
            }), 400
        
        result = telemedicine_platform.start_consultation(appointment_id, doctor_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error starting consultation: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to start consultation",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/end-consultation", methods=["POST"])
def end_telemedicine_consultation():
    """End consultation and create summary"""
    try:
        data = request.get_json()
        consultation_id = data.get('consultation_id')
        doctor_id = data.get('doctor_id')
        diagnosis = data.get('diagnosis', '')
        prescription = data.get('prescription', '')
        follow_up_needed = data.get('follow_up_needed', False)
        follow_up_date = data.get('follow_up_date', '')
        
        if not all([consultation_id, doctor_id]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: consultation_id, doctor_id"
            }), 400
        
        result = telemedicine_platform.end_consultation(
            consultation_id, doctor_id, diagnosis, prescription, follow_up_needed, follow_up_date
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error ending consultation: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to end consultation",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/reschedule", methods=["POST"])
def reschedule_telemedicine_appointment():
    """Reschedule an appointment"""
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        user_id = data.get('user_id')
        new_slot_datetime = data.get('new_slot_datetime')
        
        if not all([appointment_id, user_id, new_slot_datetime]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: appointment_id, user_id, new_slot_datetime"
            }), 400
        
        result = telemedicine_platform.reschedule_appointment(appointment_id, user_id, new_slot_datetime)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error rescheduling appointment: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to reschedule appointment",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/cancel", methods=["POST"])
def cancel_telemedicine_appointment():
    """Cancel an appointment"""
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        user_id = data.get('user_id')
        cancellation_reason = data.get('cancellation_reason', '')
        
        if not all([appointment_id, user_id]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: appointment_id, user_id"
            }), 400
        
        result = telemedicine_platform.cancel_appointment(appointment_id, user_id, cancellation_reason)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error cancelling appointment: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to cancel appointment",
            "details": str(e)
        }), 500

@app.route("/api/telemedicine/consultation-history/<user_id>", methods=["GET"])
def get_telemedicine_consultation_history(user_id):
    """Get consultation history for a user"""
    try:
        history = telemedicine_platform.get_consultation_history(user_id)
        
        return jsonify({
            "success": True,
            "consultations": history
        })
            
    except Exception as e:
        logger.error(f"❌ Error getting consultation history: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get consultation history",
            "details": str(e)
        }), 500

# ===================== MENTAL HEALTH AI ENDPOINTS =====================

@app.route("/api/mental-health/mood/track", methods=["POST"])
def track_mood_endpoint():
    """Track daily mood and emotional state"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        mood_rating = data.get('mood_rating')
        mood_notes = data.get('mood_notes', '')
        energy_level = data.get('energy_level', 5)
        sleep_quality = data.get('sleep_quality', 5)
        stress_level = data.get('stress_level', 5)
        anxiety_level = data.get('anxiety_level', 5)
        
        if not all([user_id, mood_rating is not None]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, mood_rating"
            }), 400
        
        result = mental_health_ai.track_mood(
            user_id, mood_rating, mood_notes, energy_level, 
            sleep_quality, stress_level, anxiety_level
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error tracking mood: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to track mood",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/assessment/phq9", methods=["POST"])
def conduct_phq9_assessment_endpoint():
    """Conduct PHQ-9 depression screening"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        responses = data.get('responses')
        
        if not all([user_id, responses]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, responses"
            }), 400
        
        result = mental_health_ai.conduct_phq9_assessment(user_id, responses)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error conducting PHQ-9 assessment: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to conduct PHQ-9 assessment",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/assessment/gad7", methods=["POST"])
def conduct_gad7_assessment_endpoint():
    """Conduct GAD-7 anxiety screening"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        responses = data.get('responses')
        
        if not all([user_id, responses]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, responses"
            }), 400
        
        result = mental_health_ai.conduct_gad7_assessment(user_id, responses)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error conducting GAD-7 assessment: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to conduct GAD-7 assessment",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/mindfulness/recommend", methods=["POST"])
def recommend_mindfulness_exercise_endpoint():
    """Recommend personalized mindfulness exercise"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        current_mood = data.get('current_mood')
        stress_level = data.get('stress_level')
        available_time = data.get('available_time', 10)
        
        if not all([user_id, current_mood is not None, stress_level is not None]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, current_mood, stress_level"
            }), 400
        
        result = mental_health_ai.recommend_mindfulness_exercise(
            user_id, current_mood, stress_level, available_time
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error recommending mindfulness exercise: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to recommend mindfulness exercise",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/mindfulness/log", methods=["POST"])
def log_mindfulness_session_endpoint():
    """Log completed mindfulness session"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        exercise_name = data.get('exercise_name')
        duration_completed = data.get('duration_completed')
        rating = data.get('rating')
        notes = data.get('notes', '')
        
        if not all([user_id, exercise_name, duration_completed is not None, rating is not None]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, exercise_name, duration_completed, rating"
            }), 400
        
        result = mental_health_ai.log_mindfulness_session(
            user_id, exercise_name, duration_completed, rating, notes
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error logging mindfulness session: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to log mindfulness session",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/summary/<user_id>", methods=["GET"])
def get_mental_health_summary_endpoint(user_id):
    """Generate comprehensive mental health summary"""
    try:
        days = request.args.get('days', 30, type=int)
        
        result = mental_health_ai.get_mental_health_summary(user_id, days)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error getting mental health summary: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get mental health summary",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/mood/trends/<user_id>", methods=["GET"])
def get_mood_trends_endpoint(user_id):
    """Get mood trends analysis"""
    try:
        days = request.args.get('days', 30, type=int)
        
        trends = mental_health_ai.analyze_mood_trends(user_id, days)
        
        return jsonify({
            "success": True,
            "trends": trends
        })
            
    except Exception as e:
        logger.error(f"❌ Error getting mood trends: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get mood trends",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/crisis-resources", methods=["GET"])
def get_crisis_resources_endpoint():
    """Get crisis intervention resources"""
    try:
        resources = mental_health_ai.get_crisis_resources()
        
        return jsonify({
            "success": True,
            "resources": resources
        })
            
    except Exception as e:
        logger.error(f"❌ Error getting crisis resources: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get crisis resources",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/professional-help", methods=["GET"])
def get_professional_help_resources_endpoint():
    """Get professional mental health resources"""
    try:
        resources = mental_health_ai.get_professional_help_resources()
        
        return jsonify({
            "success": True,
            "resources": resources
        })
            
    except Exception as e:
        logger.error(f"❌ Error getting professional help resources: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get professional help resources",
            "details": str(e)
        }), 500

@app.route("/api/mental-health/assessment-questions", methods=["GET"])
def get_assessment_questions_endpoint():
    """Get mental health assessment questions"""
    try:
        assessment_type = request.args.get('type', 'phq9')
        
        if assessment_type == 'phq9':
            questions = mental_health_ai.phq9_questions
        elif assessment_type == 'gad7':
            questions = mental_health_ai.gad7_questions
        else:
            return jsonify({
                "success": False,
                "error": "Invalid assessment type. Use 'phq9' or 'gad7'"
            }), 400
        
        return jsonify({
            "success": True,
            "type": assessment_type,
            "questions": questions,
            "scale": "0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day"
        })
            
    except Exception as e:
        logger.error(f"❌ Error getting assessment questions: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Failed to get assessment questions",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    try:
        logger.info("🚀 Starting SmartHealthBot AI Model Service...")
        
        # Load data and train model
        dataset, DESC_DF, PRECAUTION_DF, SEVERITY_DF = load_data()
        MODEL, SYMPTOM_LIST, LABEL_ENCODER = train_model(dataset)
        
        logger.info(f"🔍 Total symptoms: {len(SYMPTOM_LIST)}")
        logger.info(f"🏥 Total diseases: {len(LABEL_ENCODER.classes_)}")
        
        # Start Flask app
        app.run(host="0.0.0.0", port=5000, debug=True)
        
    except Exception as e:
        logger.error(f"❌ Fatal error during startup: {e}")
        logger.error(traceback.format_exc())