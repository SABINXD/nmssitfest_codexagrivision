import React from 'react';
import { 
  Leaf, 
  Sun, 
  Moon, 
  Camera, 
  Sprout, 
  MessageSquare, 
  DollarSign, 
  ChevronRight, 
  ShieldCheck, 
  Calendar, 
  Smartphone, 
  Zap, 
  Globe 
} from 'lucide-react';
import { useState, useRef } from 'react';
import { callGeminiAPI } from '../services/api';
import { AlertCircle, CheckCircle, Save, Loader, Sparkles, Activity, Upload } from 'lucide-react';
const ScanTab = ({ isDark, onAddTask, onSaveHistory, setActiveTab }) => {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        analyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageDataUrl) => {
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const base64Data = imageDataUrl.split(',')[1];
      const mimeType = imageDataUrl.split(';')[0].split(':')[1];

      const prompt = `
        Analyze this image of a plant/crop for a local farmer in Nepal. 
        Identify the plant and diagnose any diseases, pests, or nutrient deficiencies.
        Return ONLY a JSON object with this structure:
        {
          "status": "Healthy" | "Warning" | "Critical",
          "confidence": number (0-100),
          "issues_en": ["list of detected issues in English"],
          "issues_ne": ["list of detected issues in Nepali (Devanagari)"],
          "recommendations_en": ["list of actionable steps for the farmer in English"],
          "recommendations_ne": ["list of actionable steps for the farmer in Nepali (Devanagari)"]
        }
        If it's not a plant, return status "Unknown" and explain in issues.
      `;

      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: base64Data } }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const result = await callGeminiAPI(payload);
      let resultText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (resultText) {
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '');
        const parsedAnalysis = JSON.parse(resultText);
        setAnalysis({ ...parsedAnalysis, image: imageDataUrl, timestamp: new Date().toLocaleString() });
      } else {
        throw new Error("No analysis result");
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis({
        status: 'Error',
        confidence: 0,
        issues_en: ['Could not connect to AI service.'],
        issues_ne: ['AI सेवामा जडान गर्न सकिएन।'],
        recommendations_en: ['Please check your connection or API key.'],
        recommendations_ne: ['कृपया आफ्नो इन्टरनेट जडान वा API कुञ्जी जाँच गर्नुहोस्।']
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500';
    const s = status.toLowerCase();
    if (s.includes('healthy')) return 'bg-green-500';
    if (s.includes('warning')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className={`rounded-xl shadow-lg p-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center"><Camera className="w-5 h-5 mr-2"/> Plant Diagnosis</h2>
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-4 border-dashed rounded-lg p-12 text-center cursor-pointer transition relative overflow-hidden group ${
            isDark ? 'border-gray-600 hover:border-green-500' : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {!image ? (
            <div className="transform transition group-hover:scale-105">
              <Upload className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className="font-medium">Click to upload plant image</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>JPG, PNG up to 10MB</p>
            </div>
          ) : (
            <img src={image} alt="Plant" className="max-h-64 mx-auto rounded-lg object-contain shadow-md" />
          )}
          
          {analyzing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm rounded-lg">
              <Loader className="w-10 h-10 animate-spin text-green-500 mb-3"/>
              <p className="font-medium animate-pulse">Gemini AI is analyzing...</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>

      <div className={`rounded-xl shadow-lg p-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-500"/> Analysis Results</h2>
        
        {!analysis ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Upload an image to get a diagnosis</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-100'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(analysis.status)}`}>
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm opacity-75">Status</p>
                  <p className={`text-xl font-bold ${analysis.status?.toLowerCase().includes('healthy') ? 'text-green-500' : 'text-yellow-500'}`}>{analysis.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Confidence</p>
                <p className="text-xl font-bold">{analysis.confidence}%</p>
              </div>
            </div>

            {/* Issues */}
            {(analysis.issues_en?.length > 0 || analysis.issues_ne?.length > 0) && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                <p className="font-semibold mb-2 text-yellow-600 flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> Issues (समस्याहरू)</p>
                <ul className="list-disc list-inside space-y-1 opacity-90 text-sm">
                  {analysis.issues_en?.map((issue, idx) => <li key={`en-${idx}`}>{issue}</li>)}
                  {analysis.issues_ne?.length > 0 && <div className={`my-2 border-t border-dashed ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}></div>}
                  {analysis.issues_ne?.map((issue, idx) => (
                    <li key={`ne-${idx}`} className="text-lg font-medium leading-relaxed text-yellow-800 dark:text-yellow-300 mt-1">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {(analysis.recommendations_en?.length > 0 || analysis.recommendations_ne?.length > 0) && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <p className="font-semibold mb-2 text-blue-600 flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Recommendations (सुझावहरू)</p>
                
                <ul className="space-y-2">
                  {analysis.recommendations_en?.map((rec, idx) => (
                    <li key={`en-${idx}`} className="flex justify-between items-start text-sm group">
                      <span className="flex-1">• {rec}</span>
                      <button 
                        onClick={() => { onAddTask(rec, 'high'); setActiveTab('tasks'); }}
                        className="text-blue-500 hover:text-blue-700 ml-2 text-xs font-bold shrink-0 transition-opacity"
                      >
                        + TASK
                      </button>
                    </li>
                  ))}
                </ul>
                
                {analysis.recommendations_ne?.length > 0 && <div className={`my-3 border-t border-dashed ${isDark ? 'border-blue-700' : 'border-blue-200'}`}></div>}
                
                <ul className="space-y-3">
                  {analysis.recommendations_ne?.map((rec, idx) => (
                    <li key={`ne-${idx}`} className="flex justify-between items-start text-lg font-medium leading-relaxed text-blue-900 dark:text-blue-200 group">
                      <span className="flex-1">• {rec}</span>
                      <button 
                         onClick={() => { onAddTask(rec, 'high'); setActiveTab('tasks'); }}
                        className="text-blue-500 hover:text-blue-700 ml-2 text-xs font-bold shrink-0 transition-opacity"
                      >
                        + TASK
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button 
              onClick={() => onSaveHistory(analysis)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center transition hover:shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" /> Save Result
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ScanTab;