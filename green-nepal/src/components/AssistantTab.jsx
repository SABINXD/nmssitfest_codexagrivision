import React, { useState } from 'react';
import { Bot, Send, Sparkles, Volume2 } from 'lucide-react';
import { callGeminiAPI } from '../services/api.js';

const AssistantTab = ({ isDark }) => {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Namaste! I am your Agri-Assistant. I can speak Nepali too! Ask me anything about your crops.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const prompt = `
        You are Agri-Bot, an expert agricultural AI assistant helping farmers in Nepal.
        The user is asking: "${userText}"
        Provide a helpful, concise, and expert answer suitable for a farmer.
        If the user writes in Nepali, reply in Nepali (Devanagari script).
      `;

      const result = await callGeminiAPI({ contents: [{ parts: [{ text: prompt }] }] });
      const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

      setChatMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "Connection error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const speakText = async (text) => {
    if (isPlaying) return;
    setIsPlaying(true);

    try {
      const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
        }
      };

      const result = await callGeminiAPI(payload, "tts");
      const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (audioData) {
        const binaryString = window.atob(audioData);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        
        const wavHeader = new Uint8Array(44);
        const view = new DataView(wavHeader.buffer);
        view.setUint32(0, 0x52494646, false); // RIFF
        view.setUint32(4, 36 + len, true);
        view.setUint32(8, 0x57415645, false); // WAVE
        view.setUint32(12, 0x666d7420, false); // fmt 
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, 24000, true); // Sample Rate
        view.setUint32(28, 48000, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        view.setUint32(36, 0x64617461, false); // data
        view.setUint32(40, len, true);

        const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
    }
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-4 border-b flex items-center gap-3 shadow-sm">
        <div className="bg-green-100 p-2 rounded-full">
          <Bot className="w-6 h-6 text-green-600"/>
        </div>
        <div>
          <h2 className="font-bold flex items-center">Agri-Assistant <Sparkles className="w-3 h-3 ml-2 text-yellow-500"/></h2>
          <p className="text-xs opacity-60">Online • Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50">
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl px-4 relative group ${
              msg.sender === 'user' 
                ? 'bg-green-600 text-white rounded-br-none' 
                : isDark ? 'bg-gray-700 text-gray-100 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {msg.text}
              {msg.sender === 'bot' && (
                <button 
                  onClick={() => speakText(msg.text)}
                  disabled={isPlaying}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-green-500' : ''}`} />
                </button>
              )}
            </div>
          </div>
        ))}
        {isChatLoading && <div className="p-4 text-gray-400 text-sm animate-pulse">Agri-Bot is typing...</div>}
      </div>

      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            disabled={isChatLoading}
            className={`flex-1 p-3 rounded-full border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          <button 
            onClick={sendMessage}
            disabled={isChatLoading}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg"
          >
            <Send className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};
export default AssistantTab;    

