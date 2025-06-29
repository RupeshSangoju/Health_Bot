// functions/chat.js
const { Groq } = require("groq-sdk");
const gTTS = require("gtts");
const fs = require("fs").promises;
const path = require("path");
const { pipeline } = require("@xenova/transformers"); // Correct import

const healthTips = require("../src/data/health_tips.json"); // Updated path
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const sentimentAnalyzer = pipeline('sentiment-analysis', 'distilbert-base-uncased-finetuned-sst-2-english');

async function analyzeVoice(audioData) {
  const tempAudioPath = path.join("/tmp", `audio-${Date.now()}.wav`);
  await fs.writeFile(tempAudioPath, audioData);

  const transcription = await groqClient.audio.transcriptions.create({
    model: "whisper-large-v3-turbo",
    file: fs.createReadStream(tempAudioPath),
    response_format: "text",
  });

  await fs.unlink(tempAudioPath);
  return transcription.text;
}

async function getChatResponse(text, language = "en") {
  const textLower = text.toLowerCase();
  for (const [symptom, tip] of Object.entries(healthTips)) {
    if (textLower.includes(symptom)) return tip;
  }

  const response = await groqClient.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: `You are a compassionate virtual therapist. Provide empathetic, supportive responses in ${language}.` },
      { role: "user", content: text },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0].message.content;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const data = JSON.parse(event.body);
  if (!data || !data.input) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "No input provided" }),
    };
  }

  const inputType = data.input_type || "text";
  const userInput = data.input;
  const language = data.language || "en";

  if (inputType === "voice") {
    const audioData = Buffer.from(userInput, "base64");
    const transcribedText = await analyzeVoice(audioData);
    const responseText = await getChatResponse(transcribedText, language);

    const tempAudioPath = path.join("/tmp", `response-${Date.now()}.mp3`);
    const tts = new gTTS(responseText, language);

    await new Promise((resolve, reject) => {
      tts.save(tempAudioPath, (err) => (err ? reject(err) : resolve()));
    });

    const audioBuffer = await fs.readFile(tempAudioPath);
    const audioBase64 = audioBuffer.toString("base64");
    await fs.unlink(tempAudioPath);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        transcribed_text: transcribedText,
        response_text: responseText,
        response_audio: audioBase64,
      }),
    };
  } else {
    const responseText = await getChatResponse(userInput, language);
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ response_text: responseText }),
    };
  }
};

// Sentiment analysis function
exports.sentiment = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const data = JSON.parse(event.body);
  if (!data || !data.text) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "No text provided" }),
    };
  }

  const result = await sentimentAnalyzer(data.text);
  const mood = result[0].label === 'POSITIVE' ? 3 : result[0].label === 'NEGATIVE' ? 1 : 2;

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ mood }),
  };
};