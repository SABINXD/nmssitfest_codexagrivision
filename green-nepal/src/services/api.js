import.meta.env.VITE_GEMINI_API_KEY 
export const callGeminiAPI = async (payload, endpoint = "generateContent", retries = 3) => {
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  let model = "gemini-2.5-flash-preview-09-2025";
  let finalEndpoint = endpoint;
  
  
  if (endpoint === "tts") {
    model = "gemini-2.5-flash-preview-tts";
    finalEndpoint = "generateContent";
  }

  const url = `${baseUrl}/${model}:${finalEndpoint}?key=${GEMINI_API_KEY}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
};

export const fetchWeatherData = async () => {
  try {
    // Kathmandu Coordinates
    const lat = 27.7172;
    const lon = 85.3240;
    const apiKey = "a8723a7e2b7b40369e589f30dcda7ba8"; // Demo key
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6),
      uv: 6, // Mock UV
      loading: false
    };
  } catch (error) {
    console.error("Weather fetch failed", error);
    return { temp: 28, humidity: 65, wind: 12, uv: 7, loading: false };
  }
};