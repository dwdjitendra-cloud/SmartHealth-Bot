import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
import logging
import traceback
import os

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

        # Process other datasets
        for df in [desc_df, precaution_df, severity_df]:
            if "disease" in df.columns:
                df["disease"] = df["disease"].apply(standardize_disease_name)
            for col in df.columns:
                if df[col].dtype == 'object':
                    df[col] = df[col].apply(clean_symptom)

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

        # Clean and validate input symptoms
        input_symptoms = [clean_symptom(s) for s in data.get("symptoms", [])]
        valid_symptoms = [s for s in input_symptoms if s and s in SYMPTOM_LIST]
        
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
        if not DESC_DF.empty:
            # Try different column names that might exist
            disease_col = None
            for col in ["Disease", "disease"]:
                if col in DESC_DF.columns:
                    disease_col = col
                    break
            
            if disease_col:
                # Try exact match first, then partial match
                desc_matches = DESC_DF[DESC_DF[disease_col].str.strip().str.title() == disease_title]
                if desc_matches.empty:
                    # Try case-insensitive partial match
                    desc_matches = DESC_DF[DESC_DF[disease_col].str.lower().str.contains(disease_title.lower(), na=False)]
                
                if not desc_matches.empty:
                    desc_col = "Description" if "Description" in DESC_DF.columns else "description"
                    if desc_col in DESC_DF.columns:
                        description = desc_matches[desc_col].iloc[0]

        # Get precautions
        precautions = []
        if not PRECAUTION_DF.empty:
            # Try different column names that might exist
            disease_col = None
            for col in ["Disease", "disease"]:
                if col in PRECAUTION_DF.columns:
                    disease_col = col
                    break
                    
            if disease_col:
                # Try exact match first, then partial match
                prec_row = PRECAUTION_DF[
                    PRECAUTION_DF[disease_col].str.strip().str.title() == disease_title
                ]
                if prec_row.empty:
                    # Try case-insensitive partial match
                    prec_row = PRECAUTION_DF[
                        PRECAUTION_DF[disease_col].str.lower().str.contains(disease_title.lower(), na=False)
                    ]
                
                if not prec_row.empty:
                    precautions = [p for p in prec_row.iloc[0, 1:] 
                                 if isinstance(p, str) and p.strip()]

        # Calculate severity based on symptoms' weights
        severity_info = "Unknown"
        if not SEVERITY_DF.empty and valid_symptoms:
            # Get weights for matched symptoms
            symptom_weights = []
            for symptom in valid_symptoms:
                weight_matches = SEVERITY_DF[SEVERITY_DF["Symptom"].str.strip().str.lower() == symptom.lower()]
                if not weight_matches.empty:
                    weight = weight_matches["weight"].iloc[0] if "weight" in SEVERITY_DF.columns else 1
                    symptom_weights.append(weight)
            
            if symptom_weights:
                avg_weight = sum(symptom_weights) / len(symptom_weights)
                if avg_weight >= 5:
                    severity_info = "High"
                elif avg_weight >= 3:
                    severity_info = "Medium"
                elif avg_weight >= 1:
                    severity_info = "Low"

        return jsonify({
            "disease": disease_title,
            "description": description,
            "precautions": precautions,
            "severity": severity_info,
            "matched_symptoms": valid_symptoms,
            "confidence": float(MODEL.predict_proba([features]).max())
        })

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