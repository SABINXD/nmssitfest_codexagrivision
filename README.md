🌱 AgriHealth Monitor (कृषि स्वास्थ्य)

Empowering Nepal's farmers with AI-driven diagnostics, smart planning, and voice assistance.

📖 Overview

AgriHealth Monitor is a comprehensive digital companion designed specifically for rural farmers in Nepal. It bridges the gap between traditional farming and modern technology by providing instant access to agricultural expertise through Artificial Intelligence.

We aim to solve the lack of immediate expert consultation for crop diseases and the difficulty in accessing localized farming schedules.

✨ Key Features

1. 📸 AI Plant Diagnosis (Doctor)

Instant Scan: Upload a photo of a leaf or crop.

Gemini Vision: Detects diseases, pests, or nutrient deficiencies with high accuracy.

Dual Language: Provides diagnosis and actionable remedies in English and Nepali (Devanagari).

2. 🌱 Smart Crop Planner (Kheti-Paati)

Generative Planning: Select a crop (Rice, Maize, Wheat, etc.) and get a customized 4-stage farming calendar based on the current date in Nepal.

Actionable Steps: One-click integration to add planning steps directly to the Task Manager.

3. 🤖 Voice-Enabled Agri-Assistant

Speak in Nepali: Uses Web Speech API to listen to farmers' questions in Nepali or English.

Expert Advice: Powered by Google Gemini to answer queries about weather, soil, and fertilizers.

Text-to-Speech: The bot "speaks" the answer back, making the app accessible to illiterate farmers.

4. ✅ Cloud-Synced Task Manager

Firebase Integration: Tasks and plans are saved to the cloud.

Cross-Device: Access your farming to-do list from any device.

5. 📊 Live Dashboard

Weather: Real-time temperature, humidity, and wind data (OpenWeatherMap).

Market Prices: Live tracking of crop prices (Kalimati Market data).

🛠️ Tech Stack

Frontend: React.js (Vite)

Styling: Tailwind CSS (Glassmorphism & Responsive Design)

AI Models:

gemini-2.5-flash-preview: For Text & Vision analysis.

gemini-2.5-flash-preview-tts: For Text-to-Speech generation.

Backend / Database: Firebase Authentication & Firestore.

Icons: Lucide React.

🚀 Installation & Setup

Follow these steps to run the project locally.

Prerequisites

Node.js (v18+)

npm

Steps

Clone the Repository

git clone [https://github.com/SABINXD/nmssitfest_codexagrivision.git](https://github.com/SABINXD/nmssitfest_codexagrivision.git)
cd nmssitfest_codexagrivision


Install Dependencies

npm install


Configure API Keys

Open src/App.jsx.

Find the const apiKey = "" line.

Insert your Google Gemini API Key.

(Optional) Add your Firebase config object in the firebaseConfig section.

Run the App

npm run dev


Open in Browser
Visit http://localhost:5173 to see the app in action.

📱 Mobile Support

This application is built with a Mobile-First approach.
To test on your phone:

Connect your phone and laptop to the same Wi-Fi.

Run npm run dev -- --host.

Enter the Network IP address shown in the terminal into your phone's browser.

🔮 Future Roadmap

Offline Mode (PWA): Caching data so farmers can use core features without internet.

Community Forum: Connecting farmers with each other.

Government API Integration: Real-time connection to the Ministry of Agriculture's database.

🤝 Contributing

This project was built for the NMSS IT Fest Hackathon.
Team Members:

[Your Name] - Full Stack Developer

Made with ❤️ in Nepal. 🇳🇵