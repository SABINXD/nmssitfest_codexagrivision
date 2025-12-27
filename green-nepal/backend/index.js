require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ storage: multer.memoryStorage() }); // Store images in RAM temporarily



app.get('/', (req, res) => {
  res.send('AgriHealth API is running! 🚀');
});


app.post('/api/chat', async (req, res) => {
  try {
    const { message, isPlanner } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, text });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ success: false, error: "AI Service Error" });
  }
});


app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No image uploaded" });
    }


    const imageBase64 = req.file.buffer.toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    const prompt = `
      Analyze this image of a plant/crop for a local farmer in Nepal. 
      Identify the plant and diagnose any diseases, pests, or nutrient deficiencies.
      Return ONLY a JSON object with this structure (no markdown):
      {
        "status": "Healthy" | "Warning" | "Critical",
        "confidence": number (0-100),
        "issues_en": ["list of detected issues in English"],
        "issues_ne": ["list of detected issues in Nepali (Devanagari)"],
        "recommendations_en": ["list of actionable steps for the farmer in English"],
        "recommendations_ne": ["list of actionable steps for the farmer in Nepali (Devanagari)"]
      }
      If it's not a plant, return status "Unknown".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const response = await result.response;
    let text = response.text();
    

    text = text.replace(/```json/g, '').replace(/```/g, '');
    
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    res.status(500).json({ success: false, error: "AI Vision Error" });
  }
});

app.post('/api/tts', async (req, res) => {
  try {

    const { text } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
      }
    };

    const response = await axios.post(url, payload);
    res.json(response.data);

  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ success: false, error: "TTS Service Error" });
  }
});


app.get('/api/weather', async (req, res) => {
  try {
    const lat = 27.7172; 
    const lon = 85.3240;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    const response = await axios.get(weatherUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Weather API Error:", error);
    res.status(500).json({ error: "Weather Service Unavailable" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});