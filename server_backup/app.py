from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq
from gtts import gTTS
import tempfile
import base64
from dotenv import load_dotenv
import time  # For slight delay if needed
import json

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Groq client with API key
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Load health tips
with open('health_tips.json', 'r') as f:
    health_tips = json.load(f)

def analyze_voice(audio_data):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
        temp_audio.write(audio_data)
        temp_audio_path = temp_audio.name

    with open(temp_audio_path, "rb") as audio_file:
        transcription = groq_client.audio.transcriptions.create(
            model="whisper-large-v3-turbo",
            file=audio_file,
            response_format="text"
        )
    
    os.unlink(temp_audio_path)  # Clean up WAV file
    return transcription

def get_chat_response(text, language='en'):
    # Check for health tips first
    text_lower = text.lower()
    for symptom, tip in health_tips.items():
        if symptom in text_lower:
            return tip
    
    # Fallback to Groq
    response = groq_client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": f"You are a health bot. Provide short, clear answers in {language}."},
            {"role": "user", "content": text}
        ],
        temperature=0.7,
        max_tokens=200
    )
    return response.choices[0].message.content

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    input_type = data.get('input_type', 'text')
    user_input = data.get('input')
    language = data.get('language', 'en')  # Default to English

    if not user_input:
        return jsonify({'error': 'No input provided'}), 400

    if input_type == 'voice':
        audio_data = base64.b64decode(user_input)
        transcribed_text = analyze_voice(audio_data)
        response_text = get_chat_response(transcribed_text)

        # Generate audio response
        tts = gTTS(text=response_text, lang=language)
        temp_audio = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        try:
            tts.save(temp_audio.name)
            temp_audio.close()  # Explicitly close the file
            with open(temp_audio.name, "rb") as audio_file:
                audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
        finally:
            # Add slight delay and retry if needed to avoid PermissionError
            time.sleep(0.1)  # Small delay to release file lock
            try:
                os.unlink(temp_audio.name)
            except PermissionError:
                print(f"Warning: Could not delete {temp_audio.name} immediately.")

        return jsonify({
            'transcribed_text': transcribed_text,
            'response_text': response_text,
            'response_audio': audio_base64
        })
    else:
        response_text = get_chat_response(user_input)
        return jsonify({'response_text': response_text})

if __name__ == '__main__':
    app.run(debug=True, port=5000)