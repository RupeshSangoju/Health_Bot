import os
import logging
import numpy as np
import pandas as pd
import tensorflow as tf
import warnings
import xgboost as xgb
from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle
import joblib
import requests
from groq import Groq
from dotenv import load_dotenv
from keras.models import load_model
from keras.preprocessing.image import img_to_array, load_img
from functools import lru_cache

# Suppress TensorFlow warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')
warnings.filterwarnings('ignore', category=UserWarning, module='tensorflow')

# Initialize Flask app
app = Flask(__name__)
# Update with your actual Netlify URL
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://healthbot007.netlify.app"]}})

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('backend.log'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv('REACT_APP_GROQ_API_KEY')  # Fix: Use GROQ_API_KEY, not REACT_APP_GROQ_API_KEY
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY not found")
    raise ValueError("GROQ_API_KEY is required")
client = Groq(api_key=GROQ_API_KEY)

# Define directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Symptom list aligned with frontend
SYMPTOM_FILES = ['fever', 'headache', 'cough', 'diarrhea', 'vomiting', 'shortnessofbreath', 'painchest', 'fatigue', 'chills', 'soretotouch']

# Lazy load models and preprocessors
@lru_cache(maxsize=1)
def load_xgb_model():
    model_path = os.path.join(MODEL_DIR, 'xgb_model_streamlined.pkl')
    if not os.path.exists(model_path):
        logger.error(f"Missing file: {model_path}")
        raise FileNotFoundError(f"Missing file: {model_path}")
    with open(model_path, 'rb') as f:
        logger.info("Loading XGBoost model")
        return pickle.load(f)

@lru_cache(maxsize=1)
def load_label_encoder():
    le_path = os.path.join(MODEL_DIR, 'label_encoder.pkl')
    if not os.path.exists(le_path):
        logger.error(f"Missing file: {le_path}")
        raise FileNotFoundError(f"Missing file: {le_path}")
    with open(le_path, 'rb') as f:
        logger.info("Loading label encoder")
        return pickle.load(f)

@lru_cache(maxsize=1)
def load_top_features():
    features_path = os.path.join(MODEL_DIR, 'top_features.pkl')
    if not os.path.exists(features_path):
        logger.error(f"Missing file: {features_path}")
        raise FileNotFoundError(f"Missing file: {features_path}")
    with open(features_path, 'rb') as f:
        top_features = pickle.load(f)
        logger.info(f"Loading top features: {top_features}")
        return top_features.tolist() if isinstance(top_features, np.ndarray) else top_features

@lru_cache(maxsize=1)
def load_diabetes_model():
    diabetes_model_path = os.path.join(MODEL_DIR, 'diabetes_best_model.h5')
    if not os.path.exists(diabetes_model_path):
        logger.error(f"Missing file: {diabetes_model_path}")
        raise FileNotFoundError(f"Missing file: {diabetes_model_path}")
    logger.info("Loading diabetes model")
    model = load_model(diabetes_model_path, compile=False)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

@lru_cache(maxsize=1)
def load_diabetes_scaler():
    diabetes_scaler_path = os.path.join(MODEL_DIR, 'diabetes_scaler.pkl')
    if not os.path.exists(diabetes_scaler_path):
        logger.error(f"Missing file: {diabetes_scaler_path}")
        raise FileNotFoundError(f"Missing file: {diabetes_scaler_path}")
    logger.info("Loading diabetes scaler")
    return joblib.load(diabetes_scaler_path)

@lru_cache(maxsize=1)
def load_diabetes_label_encoder():
    diabetes_le_path = os.path.join(MODEL_DIR, 'diabetes_label_encoder.pkl')
    if not os.path.exists(diabetes_le_path):
        logger.error(f"Missing file: {diabetes_le_path}")
        raise FileNotFoundError(f"Missing file: {diabetes_le_path}")
    logger.info("Loading diabetes label encoder")
    return joblib.load(diabetes_le_path)

@lru_cache(maxsize=1)
def load_heart_disease_model():
    heart_model_path = os.path.join(MODEL_DIR, 'heart_disease_best_model.h5')
    if not os.path.exists(heart_model_path):
        logger.error(f"Missing file: {heart_model_path}")
        raise FileNotFoundError(f"Missing file: {heart_model_path}")
    logger.info("Loading heart disease model")
    model = load_model(heart_model_path, compile=False)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

@lru_cache(maxsize=1)
def load_heart_disease_scaler():
    heart_scaler_path = os.path.join(MODEL_DIR, 'heart_disease_scaler.pkl')
    if not os.path.exists(heart_scaler_path):
        logger.error(f"Missing file: {heart_scaler_path}")
        raise FileNotFoundError(f"Missing file: {heart_scaler_path}")
    logger.info("Loading heart disease scaler")
    return joblib.load(heart_scaler_path)

@lru_cache(maxsize=1)
def load_heart_disease_label_encoder():
    heart_le_path = os.path.join(MODEL_DIR, 'heart_disease_label_encoder.pkl')
    if not os.path.exists(heart_le_path):
        logger.error(f"Missing file: {heart_le_path}")
        raise FileNotFoundError(f"Missing file: {heart_le_path}")
    logger.info("Loading heart disease label encoder")
    return joblib.load(heart_le_path)

@lru_cache(maxsize=1)
def load_mental_health_model():
    mental_model_path = os.path.join(MODEL_DIR, 'mental_health_best_model.h5')
    if not os.path.exists(mental_model_path):
        logger.error(f"Missing file: {mental_model_path}")
        raise FileNotFoundError(f"Missing file: {mental_model_path}")
    logger.info("Loading mental health model")
    model = load_model(mental_model_path, compile=False)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

@lru_cache(maxsize=1)
def load_mental_health_scaler():
    mental_scaler_path = os.path.join(MODEL_DIR, 'mental_health_scaler.pkl')
    if not os.path.exists(mental_scaler_path):
        logger.error(f"Missing file: {mental_scaler_path}")
        raise FileNotFoundError(f"Missing file: {mental_scaler_path}")
    logger.info("Loading mental health scaler")
    return joblib.load(mental_scaler_path)

@lru_cache(maxsize=1)
def load_mental_health_label_encoders():
    mental_les_path = os.path.join(MODEL_DIR, 'mental_health_label_encoders.pkl')
    if not os.path.exists(mental_les_path):
        logger.error(f"Missing file: {mental_les_path}")
        raise FileNotFoundError(f"Missing file: {mental_les_path}")
    logger.info("Loading mental health label encoders")
    return joblib.load(mental_les_path)

@lru_cache(maxsize=1)
def load_skin_lesion_model():
    skin_model_path = os.path.join(MODEL_DIR, 'skin_lesion_inceptionv3_model.h5')
    if not os.path.exists(skin_model_path):
        logger.error(f"Missing file: {skin_model_path}")
        raise FileNotFoundError(f"Missing file: {skin_model_path}")
    logger.info("Loading skin lesion model")
    model = load_model(skin_model_path, compile=False)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

@lru_cache(maxsize=1)
def load_chest_xray_model():
    chest_model_path = os.path.join(MODEL_DIR, 'chest_xray_model.h5')
    if not os.path.exists(chest_model_path):
        logger.error(f"Missing file: {chest_model_path}")
        raise FileNotFoundError(f"Missing file: {chest_model_path}")
    logger.info("Loading chest x-ray model")
    model = load_model(chest_model_path, compile=False)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

# Health check endpoint for Render
@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check requested")
    return jsonify({"status": "healthy"}), 200

@app.route('/predict/disease', methods=['POST'])
def predict_disease():
    try:
        model = load_xgb_model()
        label_encoder = load_label_encoder()
        top_features = load_top_features()
    except Exception as e:
        logger.error(f"Failed to load disease prediction resources: {str(e)}")
        return jsonify({'error': 'Disease prediction resources not loaded'}), 503

    try:
        # Map frontend symptoms to model feature names
        symptom_mapping = {
            'fever': 'fever',
            'headache': 'headache',
            'cough': 'cough',
            'diarrhea': 'diarrhea',
            'vomiting': 'vomiting',
            'shortnessofbreath': 'shortness_of_breath',
            'painchest': 'pain_chest',
            'fatigue': 'asthenia',
            'chills': 'chill',
            'soretotouch': 'sore_to_touch'
        }
        input_data = np.zeros(len(top_features))
        for symptom in request.form:
            mapped_symptom = symptom_mapping.get(symptom, symptom)
            if mapped_symptom in top_features:
                idx = top_features.index(mapped_symptom)
                input_data[idx] = 1
            else:
                logger.warning(f"Received unexpected symptom: {symptom} (mapped to {mapped_symptom})")
        logger.debug(f"Input data: {input_data}")
        dmatrix = xgb.DMatrix([input_data], feature_names=top_features)
        prediction = model.predict(dmatrix)[0]
        top_indices = np.argsort(prediction)[-3:][::-1]
        diseases = label_encoder.inverse_transform(top_indices)
        confidences = prediction[top_indices]
        result = [
            {'disease': disease, 'confidence': float(confidence)}
            for disease, confidence in zip(diseases, confidences)
        ]
        logger.info(f"Disease prediction: {result}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Disease prediction failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/predict/diabetes', methods=['POST'])
def predict_diabetes():
    try:
        diabetes_model = load_diabetes_model()
        diabetes_scaler = load_diabetes_scaler()
        diabetes_le = load_diabetes_label_encoder()
    except Exception as e:
        logger.error(f"Failed to load diabetes resources: {str(e)}")
        return jsonify({'error': 'Diabetes resources not loaded'}), 503

    try:
        data = request.get_json()
        logger.debug(f"Received diabetes data: {data}")
        required_fields = ['age', 'bmi', 'skin_thickness', 'glucose', 'physical_activity']
        if not all(field in data for field in required_fields):
            logger.error(f"Missing required fields: {required_fields}")
            return jsonify({'error': 'Missing required fields'}), 400
        age = float(data.get('age', 0))
        bmi = float(data.get('bmi', 0))
        skin_thickness = float(data.get('skin_thickness', 0))
        family_history = 1 if float(data.get('glucose', 0)) > 120 else 0
        physical_activity = data.get('physical_activity', 'Moderate')

        try:
            physical_activity = diabetes_le.transform([physical_activity])[0]
        except ValueError as ve:
            logger.error(f"Invalid physical_activity value: {physical_activity}")
            return jsonify({'error': 'Invalid physical_activity value'}), 400

        input_data = pd.DataFrame({
            'Age': [age],
            'BMI': [bmi],
            'SkinThickness': [skin_thickness],
            'FamilyHistory': [family_history],
            'PhysicalActivity': [physical_activity]
        })
        input_data[['Age', 'BMI', 'SkinThickness']] = diabetes_scaler.transform(input_data[['Age', 'BMI', 'SkinThickness']])
        input_data_reshaped = input_data.values

        confidence = float(diabetes_model.predict(input_data_reshaped, verbose=0)[0][0])
        risk = 'High' if confidence > 0.5 else 'Low'
        logger.info(f"Diabetes prediction: {risk}, confidence: {confidence}")
        return jsonify({'risk': risk, 'confidence': confidence})
    except Exception as e:
        logger.error(f"Diabetes prediction failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/predict/heart_disease', methods=['POST'])
def predict_heart_disease():
    try:
        heart_disease_model = load_heart_disease_model()
        heart_disease_scaler = load_heart_disease_scaler()
        heart_disease_le = load_heart_disease_label_encoder()
    except Exception as e:
        logger.error(f"Failed to load heart disease resources: {str(e)}")
        return jsonify({'error': 'Heart disease resources not loaded'}), 503

    try:
        data = request.get_json()
        logger.debug(f"Received heart disease data: {data}")
        required_fields = ['age', 'blood_pressure', 'smoking', 'bmi', 'chest_pain']
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            logger.error(f"Missing required fields: {missing}")
            return jsonify({'error': f'Missing required fields: {missing}'}), 400
        
        try:
            age = float(data.get('age', 0))
            blood_pressure = float(data.get('blood_pressure', 120))
            smoking = float(data.get('smoking', 0))
            bmi = float(data.get('bmi', 27))
            chest_pain = data.get('chest_pain', 'Typical Angina')
        except ValueError as ve:
            logger.error(f"Invalid numeric input: {data}")
            return jsonify({'error': f'Invalid numeric input: {str(ve)}'}), 400

        family_history = 1 if blood_pressure > 140 else 0

        chest_pain_mapping = {
            'Typical Angina': 1.0,
            'Atypical Angina': 2.0,
            'Non-anginal Pain': 3.0,
            'Asymptomatic': 4.0
        }
        
        if chest_pain not in chest_pain_mapping:
            valid_values = list(chest_pain_mapping.keys())
            logger.error(f"Invalid chest_pain value: {chest_pain}. Valid values: {valid_values}")
            return jsonify({'error': f'Invalid chest_pain value: {chest_pain}. Valid values: {valid_values}'}), 400
        
        chest_pain_numeric = chest_pain_mapping[chest_pain]

        try:
            valid_chest_pains = heart_disease_le.classes_.tolist()
            if chest_pain_numeric not in valid_chest_pains:
                logger.error(f"Invalid encoded chest_pain value: {chest_pain_numeric}. Valid values: {valid_chest_pains}")
                return jsonify({'error': f'Invalid encoded chest_pain value: {chest_pain_numeric}. Valid values: {valid_chest_pains}'}), 400
            chest_pain_encoded = heart_disease_le.transform([chest_pain_numeric])[0]
        except ValueError as ve:
            logger.error(f"Chest pain encoding failed: {str(ve)}")
            return jsonify({'error': f'Chest pain encoding failed: {str(ve)}'}), 400

        input_data = pd.DataFrame({
            'Age': [age],
            'BloodPressure': [blood_pressure],
            'Smoking': [smoking],
            'FamilyHistory': [family_history],
            'BMI': [bmi],
            'ChestPain': [chest_pain_encoded]
        })
        logger.debug(f"Input data before scaling: {input_data}")
        input_data[['Age', 'BloodPressure', 'BMI']] = heart_disease_scaler.transform(input_data[['Age', 'BloodPressure', 'BMI']])
        input_data_reshaped = input_data.values
        logger.debug(f"Input data after scaling: {input_data_reshaped}")

        confidence = float(heart_disease_model.predict(input_data_reshaped, verbose=0)[0][0])
        risk = 'High' if confidence > 0.5 else 'Low'
        logger.info(f"Heart disease prediction: {risk}, confidence: {confidence}")
        return jsonify({'risk': risk, 'confidence': confidence})
    except Exception as e:
        logger.error(f"Heart disease prediction failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/predict/mental_health', methods=['POST'])
def predict_mental_health():
    try:
        mental_health_model = load_mental_health_model()
        mental_health_scaler = load_mental_health_scaler()
        mental_health_les = load_mental_health_label_encoders()
    except Exception as e:
        logger.error(f"Failed to load mental health resources: {str(e)}")
        return jsonify({'error': 'Mental health resources not loaded'}), 503

    try:
        data = request.get_json()
        logger.debug(f"Received mental health data: {data}")
        required_fields = ['age', 'sleep_quality', 'mood_frequency', 'social_activity', 'mental_health_history']
        if not all(field in data for field in required_fields):
            logger.error(f"Missing required fields: {required_fields}")
            return jsonify({'error': 'Missing required fields'}), 400
        age = float(data.get('age', 0))
        sleep_quality = data.get('sleep_quality', 'Fair')
        mood_frequency = data.get('mood_frequency', 'Rarely')
        social_activity = data.get('social_activity', 'Moderate')
        mental_health_history = float(data.get('mental_health_history', 0))

        try:
            sleep_quality = mental_health_les['sleep'].transform([sleep_quality])[0]
            mood_frequency = mental_health_les['mood'].transform([mood_frequency])[0]
            social_activity = mental_health_les['social'].transform([social_activity])[0]
        except (KeyError, ValueError) as e:
            logger.error(f"Invalid categorical value: {str(e)}")
            return jsonify({'error': 'Invalid categorical value'}), 400

        input_data = pd.DataFrame({
            'Age': [age],
            'SleepQuality': [sleep_quality],
            'MoodFrequency': [mood_frequency],
            'SocialActivity': [social_activity],
            'MentalHealthHistory': [mental_health_history]
        })
        input_data[['Age']] = mental_health_scaler.transform(input_data[['Age']])
        input_data_reshaped = input_data.values

        confidence = float(mental_health_model.predict(input_data_reshaped, verbose=0)[0][0])
        risk = 'High' if confidence > 0.5 else 'Low'
        logger.info(f"Mental health prediction: {risk}, confidence: {confidence}")
        return jsonify({'risk': risk, 'confidence': confidence})
    except Exception as e:
        logger.error(f"Mental health prediction failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/hospitals', methods=['POST'])
def find_hospitals():
    try:
        data = request.get_json()
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))

        response = requests.get(
            'https://overpass-api.de/api/interpreter',
            params={
                'data': f'[out:json][timeout:25];node["amenity"="hospital"](around:5000,{lat},{lon});out body;'
            },
            timeout=10
        )
        response.raise_for_status()
        hospitals = response.json().get('elements', [])

        hospital_list = []
        for h in hospitals:
            tags = h.get('tags', {})
            name = tags.get('name', 'Unknown')
            address = tags.get('addr:street', '') or tags.get('addr:full', '')
            phone = tags.get('phone', '') or tags.get('contact:phone', '')
            distance = ((lat - h['lat'])**2 + (lon - h['lon'])**2)**0.5 * 111

            if address and address != 'No address' and phone and phone != 'No phone':
                hospital_list.append({
                    'name': name,
                    'address': address,
                    'phone': phone,
                    'distance': round(distance, 2)
                })

        hospital_list = sorted(hospital_list, key=lambda x: x['distance'])[:5]

        if len(hospital_list) < 5:
            nominatim_url = 'https://nominatim.openstreetmap.org/search'
            params = {
                'q': 'hospital',
                'format': 'json',
                'limit': 10,
                'viewbox': f'{lon-0.05},{lat+0.05},{lon+0.05},{lat-0.05}',
                'bounded': 1
            }
            headers = {'User-Agent': 'HealthBot/1.0'}
            try:
                nom_response = requests.get(nominatim_url, params=params, headers=headers, timeout=10)
                nom_response.raise_for_status()
                nom_hospitals = nom_response.json()
                for h in nom_hospitals:
                    if len(hospital_list) >= 5:
                        break
                    name = h.get('display_name', '').split(',')[0]
                    address = h.get('display_name', '')
                    lat_h = float(h.get('lat'))
                    lon_h = float(h.get('lon'))
                    distance = ((lat - lat_h)**2 + (lon - lon_h)**2)**0.5 * 111
                    phone = h.get('phone', 'Not listed')
                    if phone == 'Not listed':
                        continue
                    if address and name not in [x['name'] for x in hospital_list]:
                        hospital_list.append({
                            'name': name,
                            'address': address,
                            'phone': phone,
                            'distance': round(distance, 2)
                        })
                hospital_list = sorted(hospital_list, key=lambda x: x['distance'])[:5]
            except Exception as e:
                logger.warning(f"Nominatim fallback failed: {e}")

        logger.info(f"Found {len(hospital_list)} valid hospitals")
        return jsonify({'hospitals': hospital_list})
    except Exception as e:
        logger.error(f"Hospital search failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/predict/chest_xray', methods=['POST'])
def predict_chest_disease():
    try:
        chest_xray_model = load_chest_xray_model()
    except Exception as e:
        logger.error(f"Failed to load chest X-ray model: {str(e)}")
        return jsonify({'error': 'Chest X-ray model not loaded'}), 503

    try:
        if 'file' not in request.files:
            logger.error("No file uploaded")
            return jsonify({'error': 'No file uploaded'}), 400
        file = request.files['file']
        img = load_img(file, target_size=(224, 224))
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        prediction = chest_xray_model.predict(img_array)[0][0]
        confidence = float(prediction)
        disease = 'Pneumonia' if confidence > 0.5 else 'Normal'
        logger.info(f"Chest X-ray prediction: {disease}, confidence: {confidence}")
        return jsonify({'disease': disease, 'confidence': confidence})
    except Exception as e:
        logger.error(f"Chest X-ray prediction failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/predict/cancer', methods=['POST'])
def predict_cancer():
    try:
        skin_lesion_model = load_skin_lesion_model()
    except Exception as e:
        logger.error(f"Failed to load skin lesion model: {str(e)}")
        return jsonify({'error': 'Skin lesion model not loaded'}), 503

    try:
        if 'file' not in request.files:
            logger.error("No file uploaded")
            return jsonify({'error': 'No file uploaded'}), 400
        file = request.files['file']
        img = load_img(file, target_size=(224, 224))
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        prediction = skin_lesion_model.predict(img_array)[0][0]
        confidence = float(prediction)
        disease = 'Melanoma' if confidence > 0.5 else 'Benign'
        logger.info(f"Skin lesion prediction: {disease}, confidence: {confidence}")
        return jsonify({'disease': disease, 'confidence': confidence})
    except Exception as e:
        logger.error(f"Skin lesion prediction failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate():
    try:
        logger.debug(f"Request headers: {dict(request.headers)}")
        content_type = request.headers.get('Content-Type', '')
        if 'application/json' not in content_type.lower():
            logger.error(f"Unsupported Content-Type: {content_type}")
            return jsonify({'error': f"Unsupported Content-Type: {content_type}. Expected 'application/json'"}), 415
        
        data = request.get_json(force=True)
        if not data:
            logger.error("No JSON data provided")
            return jsonify({'error': 'No JSON data provided'}), 400
        
        text = data.get('text')
        target_lang = data.get('target_lang', 'en')
        
        if not text:
            logger.error("Missing text field in request")
            return jsonify({'error': 'Missing text field'}), 400

        logger.debug(f"Translating text: {text[:50]}... to {target_lang}")
        translated_text = text  # Mock translation
        logger.info(f"Translation successful for text: {text[:50]}...")
        return jsonify({'translated_text': translated_text})
    except Exception as e:
        logger.error(f"Translation failed: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)