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

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:5174", 
    "http://localhost:3000",
    "http://localhost:5001",
    "https://smart-health-bot.vercel.app"
])

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

def clean_symptom(s):
    """Standardize symptom formatting"""
    if pd.isna(s):
        return ""
    return str(s).strip().lower().replace(" ", "_")

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
                    break
        
        if found_match:
            continue
            
        # Partial matching - find symptoms that contain the input or vice versa
        for available_symptom in available_symptoms:
            if (symptom in available_symptom or available_symptom in symptom) and len(symptom) > 2:
                matched_symptoms.append(available_symptom)
                break
    
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

        # Process main dataset
        symptom_cols = [col for col in dataset.columns if col.lower().startswith("symptom")]
        dataset["symptoms"] = dataset[symptom_cols].apply(
            lambda row: [clean_symptom(s) for s in row.dropna() if clean_symptom(s) != ""],
            axis=1
        )
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
        
        if not valid_symptoms:
            return jsonify({
                "error": "No valid symptoms provided",
                "available_symptoms_sample": SYMPTOM_LIST[:10],
                "received_symptoms": input_symptoms
            }), 400

        # Prepare features and predict
        features = [1 if sym in valid_symptoms else 0 for sym in SYMPTOM_LIST]
        prediction = MODEL.predict([features])[0]
        disease = LABEL_ENCODER.inverse_transform([prediction])[0]
        disease_title = standardize_disease_name(disease)

        # Get description
        description = "No description available"
        if not DESC_DF.empty and "Disease" in DESC_DF.columns:
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

        return jsonify({
            "disease": disease_title,
            "description": description,
            "precautions": precautions,
            "home_remedies": home_remedies,
            "severity": severity_info,
            "matched_symptoms": valid_symptoms,
            "confidence": confidence_score,
            "total_symptoms_matched": len(valid_symptoms),
            "available_symptoms_count": len(SYMPTOM_LIST)
        })

    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
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

if __name__ == "__main__":
    try:
        logger.info("🚀 Starting SmartHealthBot AI Model Service...")
        
        # Load data and train model
        dataset, DESC_DF, PRECAUTION_DF, SEVERITY_DF = load_data()
        MODEL, SYMPTOM_LIST, LABEL_ENCODER = train_model(dataset)
        
        logger.info(f"🔍 Total symptoms: {len(SYMPTOM_LIST)}")
        logger.info(f"🏥 Total diseases: {len(LABEL_ENCODER.classes_)}")
        
        # Start Flask app
        app.run(host="0.0.0.0", port=5001, debug=True)
        
    except Exception as e:
        logger.error(f"❌ Fatal error during startup: {e}")
        logger.error(traceback.format_exc())