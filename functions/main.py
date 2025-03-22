import json
import base64
import os
import tempfile
from groq import Groq
from gtts import gTTS

# Load health tips
with open('health_tips.json', 'r') as f:
    health_tips = json.load(f)

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

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
    
    os.unlink(temp_audio_path)
    return transcription

def get_chat_response(text, language='en'):
    text_lower = text.lower()
    for symptom, tip in health_tips.items():
        if symptom in text_lower:
            return tip
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

def handler(event, context):
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 204,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if event['httpMethod'] != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'}),
            'headers': {'Access-Control-Allow-Origin': '*'}
        }

    data = json.loads(event['body'])
    if not data or 'input' not in data:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'No input provided'}),
            'headers': {'Access-Control-Allow-Origin': '*'}
        }

    input_type = data.get('input_type', 'text')
    user_input = data['input']
    language = data.get('language', 'en')

    if input_type == 'voice':
        audio_data = base64.b64decode(user_input)
        transcribed_text = analyze_voice(audio_data)
        response_text = get_chat_response(transcribed_text, language)

        tts = gTTS(text=response_text, lang=language)
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_audio:
            tts.save(temp_audio.name)
            with open(temp_audio.name, "rb") as audio_file:
                audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
            os.unlink(temp_audio.name)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'transcribed_text': transcribed_text,
                'response_text': response_text,
                'response_audio': audio_base64
            }),
            'headers': {'Access-Control-Allow-Origin': '*'}
        }
    else:
        response_text = get_chat_response(user_input, language)
        return {
            'statusCode': 200,
            'body': json.dumps({'response_text': response_text}),
            'headers': {'Access-Control-Allow-Origin': '*'}
        }