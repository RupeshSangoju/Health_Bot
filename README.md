# HealthBot - AI-Powered Healthcare Assistant 🩺

HealthBot is a **React-based** web application designed to provide personalized health insights using **machine learning** and **natural language processing**. Powered by **Firebase Firestore**, **Netlify Functions** with **Grok**, and a **Flask backend** on **Render**, it offers disease predictions, health advice via a chatbot, and mood tracking. Built as a portfolio project to showcase skills in **React**, **Python**, and **ML** for healthtech roles.

## ✨ Features

- **Disease Prediction**: XGBoost predicts diseases from symptoms like fever and cough.
- **Diabetes & Heart Risk**: Keras models assess risks based on BMI, glucose, and blood pressure.
- **Mental Health Screening**: Keras evaluates stress/depression from sleep and mood data.
- **Medical Imaging**: CNNs detect pneumonia (chest X-rays) and melanoma (skin lesions).
- **Hospital Finder**: Locates nearby hospitals using OpenStreetMap APIs.
- **AI Chatbot**: Grok-powered chatbot provides empathetic health advice with voice support.
- **Journal & Mood Tracking**: Stores mood and journal entries in Firebase Firestore.
- **Multilingual Support**: Supports multiple languages via `react-i18next`.
- **Dark Mode**: Toggles light/dark themes, saved in `localStorage`.
- **Voice Commands**: Activates features like diagnostics via voice input.
- **Responsive Design**: Mobile-friendly UI with Framer Motion animations.

## 🛠️ Tech Stack

- **Frontend**: React, Axios, Framer Motion, react-i18next
- **Backend**: Flask (Render), Netlify Functions (Grok, gTTS, @xenova/transformers)
- **Database**: Firebase Firestore
- **ML Models**: XGBoost, Keras, InceptionV3, CNNs
- **APIs**: Grok (chatbot), OpenStreetMap (hospital finder)
- **Deployment**: Netlify (frontend), Render (backend), Firebase Hosting (alternative)

## 🚀 Live Demo

- **Frontend**: [ https://healthbot007.netlify.app/]
- **Backend**: [ https://health-bot-kg6i.onrender.com]

## 🛠️ Setup Instructions

1. **Clone the Repository**:
   git clone https://github.com/RupeshSangoju/Health_Bot.git
   cd Health_Bot

2. **Install Dependencies**
   npm install

3. **Set Environment Variables**
   Create .env in the root
    REACT_APP_FIREBASE_API_KEY

    REACT_APP_FIREBASE_AUTH_DOMAIN
    
    REACT_APP_FIREBASE_PROJECT_ID

    REACT_APP_FIREBASE_STORAGE_BUCKET

    REACT_APP_FIREBASE_MESSAGING_SENDER_ID

    REACT_APP_FIREBASE_APP_ID

    REACT_APP_GROQ_API_KEY

4. **Run Locally**
    npm start
    Access at http://localhost:3000

# HealthBot Backend

This is the Flask backend for **HealthBot**, an AI-powered health assistant. It uses machine learning models (XGBoost, Keras) to predict diseases, diabetes, heart disease, mental health risks, and analyze chest X-rays and skin lesions. Deployed on Render with lazy loading to handle large `.h5` and `.pkl` files efficiently.

## Features
- **Disease Prediction**: XGBoost model predicts diseases from symptoms.
- **Health Risk Assessments**: Keras models for diabetes, heart disease, and mental health.
- **Image Analysis**: CNNs for chest X-ray (pneumonia) and skin lesion (melanoma) detection.
- **Hospital Finder**: Integrates OpenStreetMap APIs to locate nearby hospitals.
- **AI Chatbot**: Grok-powered translation endpoint (mock implementation).
- **Security**: Firebase authentication and CORS for Netlify frontend.

## Setup
1. **Clone the repository**

   git clone https://github.com/RupeshSangoju/health-bot-backend

   cd health-bot-backend

2. **Install dependencies**

    pip install -r requirements.txt


3. **Set environment variables in .env**

    GROQ_API_KEY=your_groq_api_key

4. **Run locally**

    python server.py

    Access at http://localhost:5001/health

## Deployment

**Render**

Deployed with render.yaml using gunicorn -w 2 --timeout 120 --bind 0.0.0.0:$PORT server:app


**Git LFS**

Large model files (.h5, .pkl, .tflite) are tracked with Git LFS.


**Environment Variables**

Set GROQ_API_KEY and PYTHON_VERSION=3.10.12 in Render Dashboard.


**Health Check**

/health endpoint ensures uptime


## Optimization

**Lazy Loading** 

Lazy Loading


**Model Compression**

.h5 models quantized to .tflite, .pkl files compressed with joblib.

#  Contributing

Contributions are welcome! Fork the repo, create a branch, and submit a pull request.


# License

MIT License © 2025 Rupesh Sangoju


