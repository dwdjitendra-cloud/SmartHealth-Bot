import pandas as pd
import numpy as np
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
import logging
import traceback
import os
import pickle
import hashlib

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

DATASET_PATHS = {
    "main": os.path.join(os.path.dirname(__file__), "dataset.csv"),
    "desc": os.path.join(os.path.dirname(__file__), "symptom_Description.csv"),
    "precaution": os.path.join(os.path.dirname(__file__), "symptom_precaution.csv"),
    "severity": os.path.join(os.path.dirname(__file__), "Symptom-severity.csv")
}

# Model cache settings
MODEL_CACHE_DIR = os.path.join(os.path.dirname(__file__), "__cache__")
MODEL_CACHE_FILE = os.path.join(MODEL_CACHE_DIR, "trained_model.pkl")

def get_dataset_hash():
    """Generate hash of dataset files for cache validation"""
    hash_obj = hashlib.md5()
    for path in DATASET_PATHS.values():
        if os.path.exists(path):
            with open(path, 'rb') as f:
                hash_obj.update(f.read())
    return hash_obj.hexdigest()

def save_model_cache(model, symptom_list, label_encoder, desc_df, precaution_df, severity_df):
    """Save trained model and data to cache"""
    try:
        os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
        cache_data = {
            'model': model,
            'symptom_list': symptom_list,
            'label_encoder': label_encoder,
            'desc_df': desc_df,
            'precaution_df': precaution_df,
            'severity_df': severity_df,
            'dataset_hash': get_dataset_hash(),
            'version': '1.0'
        }
        with open(MODEL_CACHE_FILE, 'wb') as f:
            pickle.dump(cache_data, f)
        logger.info("✅ Model cached successfully")
    except Exception as e:
        logger.warning(f"⚠️ Failed to cache model: {e}")

def load_model_cache():
    """Load trained model from cache if valid"""
    try:
        if not os.path.exists(MODEL_CACHE_FILE):
            return None
            
        with open(MODEL_CACHE_FILE, 'rb') as f:
            cache_data = pickle.load(f)
            
        # Validate cache
        if cache_data.get('dataset_hash') != get_dataset_hash():
            logger.info("📂 Dataset changed, cache invalid")
            return None
            
        if cache_data.get('version') != '1.0':
            logger.info("🔄 Cache version mismatch")
            return None
            
        logger.info("✅ Using cached model")
        return cache_data
        
    except Exception as e:
        logger.warning(f"⚠️ Failed to load cached model: {e}")
        return None

def clean_symptom(s):
    """Standardize symptom formatting"""
    if pd.isna(s):
        return ""
    return str(s).strip().lower().replace(" ", "_")

def standardize_disease_name(name):
    """Standardize disease name formatting"""
    if pd.isna(name):
        return ""
    return str(name).strip().title()
    """Standardize symptom formatting"""
    if pd.isna(s):
        return ""
    return str(s).strip().lower().replace(" ", "_")

def enhance_symptom_matching(input_symptoms, available_symptoms):
    """Enhanced symptom matching using synonyms and partial matching"""
    # Create comprehensive synonym mapping
    symptom_synonyms = {
        "fever": ["fever", "high_temperature", "pyrexia", "temperature", "hot", "burning", "high_fever"],
        "headache": ["headache", "head_pain", "cephalgia", "migraine", "head_ache", "severe_headache"],
        "cough": ["cough", "coughing", "dry_cough", "wet_cough", "persistent_cough"],
        "tired": ["fatigue", "weakness", "tiredness", "tired", "exhausted"],
        "fatigue": ["fatigue", "weakness", "tired", "tiredness", "exhausted", "weary"],
        "body_aches": ["muscle_aches", "joint_pain", "body_pain", "myalgia", "arthralgia", "muscle_pain"],
        "body_pain": ["muscle_aches", "joint_pain", "body_aches", "muscle_pain"],
        "stomach_pain": ["abdominal_pain", "belly_pain", "stomach_ache", "gastric_pain"],
        "nausea": ["nausea", "vomiting", "sick", "queasy", "nauseated"],
        "vomiting": ["vomiting", "throwing_up", "nausea", "sick"],
        "diarrhea": ["diarrhea", "loose_stools", "watery_stools", "stomach_upset"],
        "runny_nose": ["runny_nose", "nasal_congestion", "stuffy_nose", "blocked_nose"],
        "sore_throat": ["throat_irritation", "throat_pain", "sore_throat"],
        "dizziness": ["dizziness", "vertigo", "lightheaded", "dizzy"],
        "shortness_of_breath": ["breathlessness", "difficulty_breathing", "shortness_of_breath"],
        "chest_pain": ["chest_pain", "chest_tightness", "chest_discomfort"],
        "back_pain": ["back_pain", "lower_back_pain", "upper_back_pain"],
        "joint_pain": ["joint_pain", "arthritis", "stiffness", "joint_stiffness"],
        "skin_rash": ["skin_rash", "rash", "red_spots", "skin_irritation"],
        "itching": ["itching", "pruritus", "itchy", "scratching"],
        "sweating": ["excessive_sweating", "night_sweats", "profuse_sweating"],
        "loss_of_appetite": ["loss_of_appetite", "poor_appetite", "no_appetite"],
        "weight_loss": ["weight_loss", "unexplained_weight_loss", "losing_weight"],
        "difficulty_sleeping": ["insomnia", "sleep_disturbance", "sleeplessness"],
        "anxiety": ["anxiety", "nervousness", "worry", "anxious"],
        "difficulty_breathing": ["shortness_of_breath", "breathlessness", "dyspnea"],
        "chills": ["chills", "cold", "shivering"],
        "muscle_weakness": ["weakness", "fatigue", "muscle_weakness"],
        "blurred_vision": ["vision_problems", "blurred_vision", "poor_vision"]
    }
    
    matched_symptoms = []
    
    for symptom in input_symptoms:
        symptom = symptom.lower().strip().replace(" ", "_")
        if not symptom:
            continue
            
        found_match = False
        
        # Direct match first
        if symptom in available_symptoms:
            matched_symptoms.append(symptom)
            found_match = True
            continue
            
        # Check synonyms
        for main_symptom, synonyms in symptom_synonyms.items():
            if symptom in synonyms:
                # Check if any of the synonyms exist in available symptoms
                for syn in synonyms:
                    if syn in available_symptoms:
                        matched_symptoms.append(syn)
                        found_match = True
                        break
                if found_match:
                    break
        
        if found_match:
            continue
            
        # Enhanced partial matching with better scoring
        best_match = None
        best_score = 0
        
        for available_symptom in available_symptoms:
            # Check if input contains available symptom or vice versa
            if symptom in available_symptom and len(symptom) > 2:
                score = len(symptom) / len(available_symptom)
                if score > best_score and score > 0.3:
                    best_score = score
                    best_match = available_symptom
            elif available_symptom in symptom and len(available_symptom) > 2:
                score = len(available_symptom) / len(symptom)
                if score > best_score and score > 0.3:
                    best_score = score
                    best_match = available_symptom
                    
        if best_match:
            matched_symptoms.append(best_match)
    
    return list(set(matched_symptoms))  # Remove duplicates

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

        # Process main dataset more efficiently
        symptom_cols = [col for col in dataset.columns if col.lower().startswith("symptom")]
        logger.info(f"Found {len(symptom_cols)} symptom columns")
        
        # More efficient symptom processing
        def process_symptoms_row(row):
            symptoms = []
            for col in symptom_cols:
                if pd.notna(row[col]):
                    cleaned = clean_symptom(row[col])
                    if cleaned:
                        symptoms.append(cleaned)
            return symptoms
        
        logger.info("🔄 Processing symptoms...")
        dataset["symptoms"] = dataset.apply(process_symptoms_row, axis=1)
        dataset["Disease"] = dataset["Disease"].apply(standardize_disease_name)

        # Process other datasets - do not modify column names, only clean data
        for df in [desc_df, precaution_df]:
            for col in df.columns:
                if df[col].dtype == 'object' and col not in ["Disease", "Description"]:
                    df[col] = df[col].apply(lambda x: str(x).strip() if pd.notna(x) else "")
        
        # For severity dataset, clean symptom names to match our format
        if "Symptom" in severity_df.columns:
            severity_df["Symptom"] = severity_df["Symptom"].apply(clean_symptom)

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
        
        # More efficient feature matrix creation
        logger.info("🔄 Creating feature matrix...")
        features_data = []
        for _, row in dataset.iterrows():
            features_row = [1 if sym in row["symptoms"] else 0 for sym in all_symptoms]
            features_data.append(features_row)
        
        X = pd.DataFrame(features_data, columns=all_symptoms)
        le = LabelEncoder()
        y = le.fit_transform(dataset["Disease"])

        logger.info(f"✅ Feature matrix shape: {X.shape}")
        logger.info(f"✅ Unique diseases: {len(le.classes_)}")

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=42
        )

        # Train model with optimized parameters
        logger.info("🤖 Training Random Forest...")
        model = RandomForestClassifier(
            n_estimators=100,  # Reduced for faster training
            max_depth=20,      # Limited depth for faster training
            min_samples_split=5,
            min_samples_leaf=2,
            bootstrap=True,
            random_state=42,
            n_jobs=-1,  # Use all CPU cores
            verbose=0   # Reduce verbosity
        )
        model.fit(X_train, y_train)

        # Evaluate model
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        
        logger.info(f"✅ Training Accuracy: {train_score * 100:.2f}%")
        logger.info(f"✅ Test Accuracy: {test_score * 100:.2f}%")

        return model, all_symptoms, le

    except Exception as e:
        logger.error(f"❌ Error training model: {e}")
        logger.error(traceback.format_exc())
        raise

    except Exception as e:
        logger.error(f"❌ Error training model: {e}")
        logger.error(traceback.format_exc())
        raise

@app.route("/predict", methods=["POST"])
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

        # Handle both string and array input formats
        symptoms_input = data.get("symptoms", [])
        if isinstance(symptoms_input, str):
            # Parse string into individual symptoms using regex
            input_symptoms = [clean_symptom(s.strip()) for s in re.split(r'[,;.\n]+', symptoms_input) if s.strip()]
        elif isinstance(symptoms_input, list):
            input_symptoms = [clean_symptom(s) for s in symptoms_input]
        else:
            return jsonify({
                "error": "Symptoms must be a string or array",
                "example": {"symptoms": ["fever", "headache"]}
            }), 400

        return predict_symptoms(input_symptoms)

    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
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

@app.route("/diseases", methods=["GET"])
def get_diseases():
    """Get list of all diseases the model can predict"""
    try:
        diseases = LABEL_ENCODER.classes_.tolist() if LABEL_ENCODER else []
        return jsonify({
            "diseases": diseases,
            "count": len(diseases)
        })
    except Exception as e:
        logger.error(f"❌ Error getting diseases: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/analyze_text", methods=["POST"])
def analyze_text():
    """Analyze natural language symptom description"""
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        # Extract symptoms from text using keyword matching
        extracted_symptoms = []
        text_lower = text.lower()
        
        # Check each available symptom against the text
        for symptom in SYMPTOM_LIST:
            symptom_words = symptom.replace("_", " ").split()
            if any(word in text_lower for word in symptom_words if len(word) > 3):
                extracted_symptoms.append(symptom)
                
        if not extracted_symptoms:
            return jsonify({
                "error": "No symptoms could be extracted from the text",
                "suggestion": "Try using more specific symptom descriptions"
            }), 400
            
        # Use the regular prediction endpoint
        return predict_symptoms(extracted_symptoms)
        
    except Exception as e:
        logger.error(f"❌ Text analysis error: {e}")
        return jsonify({"error": str(e)}), 500

def predict_symptoms(symptom_list):
    """Helper function to predict based on symptom list"""
    # This is the core prediction logic extracted for reuse
    valid_symptoms = enhance_symptom_matching(symptom_list, SYMPTOM_LIST)
    
    if not valid_symptoms:
        return jsonify({
            "error": "No valid symptoms found",
            "suggestion": "Try symptoms like: fever, headache, cough, fatigue, nausea"
        }), 400
        
    # Prepare features and predict
    features = [1 if sym in valid_symptoms else 0 for sym in SYMPTOM_LIST]
    prediction = MODEL.predict([features])[0]
    confidence_scores = MODEL.predict_proba([features])[0]
    
    disease = LABEL_ENCODER.inverse_transform([prediction])[0]
    disease_title = standardize_disease_name(disease)
    
    # Enhanced confidence calculation
    max_confidence = float(confidence_scores.max())
    symptom_match_ratio = len(valid_symptoms) / len(symptom_list) if symptom_list else 0
    enhanced_confidence = max_confidence * (0.7 + 0.3 * symptom_match_ratio)
    
    if enhanced_confidence < 0.25:
        enhanced_confidence = 0.25
    elif enhanced_confidence > 0.95:
        enhanced_confidence = 0.95
        
    # Get additional information
    description = get_disease_description(disease_title)
    precautions = get_disease_precautions(disease_title)
    home_remedies = get_home_remedies(disease_title)
    severity = calculate_severity(valid_symptoms)
    
    return jsonify({
        "disease": disease_title,
        "description": description,
        "precautions": precautions,
        "home_remedies": home_remedies,
        "severity": severity,
        "matched_symptoms": valid_symptoms,
        "confidence": enhanced_confidence,
        "total_symptoms_matched": len(valid_symptoms),
        "available_symptoms_count": len(SYMPTOM_LIST)
    })

def get_disease_description(disease_title):
    """Get disease description with fallback"""
    if not DESC_DF.empty and "Disease" in DESC_DF.columns:
        desc_matches = DESC_DF[DESC_DF["Disease"].str.strip().str.title() == disease_title]
        if not desc_matches.empty and "Description" in DESC_DF.columns:
            return str(desc_matches["Description"].iloc[0])
    return f"Based on the symptoms provided, this condition ({disease_title}) may require medical attention. Please consult a healthcare professional for proper diagnosis and treatment."

def get_disease_precautions(disease_title):
    """Get disease precautions with fallback"""
    precautions = ["Consult a healthcare professional", "Monitor your symptoms", "Rest adequately"]
    if not PRECAUTION_DF.empty and "Disease" in PRECAUTION_DF.columns:
        prec_row = PRECAUTION_DF[PRECAUTION_DF["Disease"].str.strip().str.title() == disease_title]
        if not prec_row.empty:
            custom_precautions = []
            for col in prec_row.columns[1:]:
                if pd.notna(prec_row[col].iloc[0]):
                    precaution = str(prec_row[col].iloc[0]).strip()
                    if precaution and precaution.lower() not in ["nan", "none", ""]:
                        custom_precautions.append(precaution)
            if custom_precautions:
                precautions = custom_precautions
    return precautions

def get_home_remedies(disease_title):
    """Get home remedies based on disease type"""
    base_remedies = ["Rest and get adequate sleep", "Stay hydrated", "Maintain good hygiene", "Follow a balanced diet"]
    
    # Add specific remedies based on disease characteristics
    disease_lower = disease_title.lower()
    if any(term in disease_lower for term in ['fever', 'flu', 'viral']):
        base_remedies.extend(["Apply cool compress", "Take lukewarm baths", "Drink warm fluids"])
    elif any(term in disease_lower for term in ['cold', 'cough', 'respiratory']):
        base_remedies.extend(["Drink warm fluids", "Use honey for sore throat", "Steam inhalation"])
    elif any(term in disease_lower for term in ['headache', 'migraine']):
        base_remedies.extend(["Apply cold/warm compress", "Practice relaxation", "Avoid bright lights"])
    elif any(term in disease_lower for term in ['stomach', 'gastric', 'digestive']):
        base_remedies.extend(["Eat bland foods", "Avoid spicy foods", "Small frequent meals"])
        
    return base_remedies[:6]  # Limit to 6 remedies

def calculate_severity(valid_symptoms):
    """Calculate severity based on symptoms and weights"""
    if not SEVERITY_DF.empty and valid_symptoms:
        total_weight = 0
        for symptom in valid_symptoms:
            if "Symptom" in SEVERITY_DF.columns:
                weight_matches = SEVERITY_DF[SEVERITY_DF["Symptom"].str.contains(symptom, case=False, na=False)]
                if not weight_matches.empty and "weight" in SEVERITY_DF.columns:
                    total_weight += weight_matches["weight"].iloc[0]
        
        if total_weight >= 15:
            return "critical"
        elif total_weight >= 10:
            return "high"
        elif total_weight >= 5:
            return "medium"
    return "low"

if __name__ == "__main__":
    try:
        logger.info("🚀 Starting SmartHealthBot AI Model Service...")
        
        # Try to load from cache first
        cache_data = load_model_cache()
        
        if cache_data:
            MODEL = cache_data['model']
            SYMPTOM_LIST = cache_data['symptom_list']
            LABEL_ENCODER = cache_data['label_encoder']
            DESC_DF = cache_data['desc_df']
            PRECAUTION_DF = cache_data['precaution_df']
            SEVERITY_DF = cache_data['severity_df']
            logger.info("📦 Loaded model from cache")
        else:
            logger.info("🔄 Training new model...")
            # Load data and train model
            dataset, DESC_DF, PRECAUTION_DF, SEVERITY_DF = load_data()
            MODEL, SYMPTOM_LIST, LABEL_ENCODER = train_model(dataset)
            
            # Save to cache for future use
            save_model_cache(MODEL, SYMPTOM_LIST, LABEL_ENCODER, DESC_DF, PRECAUTION_DF, SEVERITY_DF)
        
        logger.info(f"🔍 Total symptoms: {len(SYMPTOM_LIST)}")
        logger.info(f"🏥 Total diseases: {len(LABEL_ENCODER.classes_)}")
        
        # Start Flask app
        app.run(host="0.0.0.0", port=5001, debug=True)
        
    except Exception as e:
        logger.error(f"❌ Fatal error during startup: {e}")
        logger.error(traceback.format_exc())