# 🌱 AgriHealth Monitor (कृषि स्वास्थ्य)

<div align="center">

  ![AgriHealth Banner](https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop)

  <br />

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Gemini AI](https://img.shields.io/badge/Google%20Gemini%20AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

  <h3>Empowering Nepal's farmers with AI-driven diagnostics, smart planning, and voice assistance.</h3>

  [**View Demo**](https://agrihealth-monitor.vercel.app/) • [**Report Bug**](https://github.com/SABINXD/nmssitfest_codexagrivision/issues)

</div>

---

## 📱 App Previews

We believe in a **Mobile-First** approach for farmers. Here is how AgriHealth looks in action:

| **Landing & Onboarding** | **AI Diagnosis (Dr. Crop)** |
|:-------------------------:|:---------------------------:|
| <img src="image-copy.png" width="300" /> | <img src="image.png" width="300" /> |
| *Modern, accessible entry point.* | *Instant disease detection with 95% accuracy.* |

| **Smart Dashboard** | **Voice Assistant & Planner** |
|:-------------------:|:-----------------------------:|
| <img src="" width="300" /> | <img src="image.png" width="300" /> |
| *Live weather & Kalimati market rates.* | *Speak in Nepali & plan the season.* |

---

## 🏗️ System Workflow

How the data flows from the Farmer's phone to our AI Engine and Database.

```mermaid
graph TD
    User([👤 Farmer]) --> |Opens App| Landing[🌐 App Interface]
    
    subgraph "Frontend Layer"
        Landing --> |Log In| Auth[🔥 Firebase Auth]
        Auth --> |Authenticated| Dashboard[📱 Dashboard]
    end

    subgraph "AI Core (Google Gemini)"
        Dashboard --> |Upload Image| Vision[👁️ Gemini Vision]
        Dashboard --> |Voice Input| Chat[🧠 Gemini Flash]
        Chat --> |Text Response| TTS[🔊 Gemini TTS]
    end

    subgraph "Data Layer"
        Vision --> |Save Result| DB[(☁️ Firestore)]
        Chat --> |Save Plan| DB
    end
    
    DB --> |Sync Tasks| Dashboard