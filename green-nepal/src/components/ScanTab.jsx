import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Activity, Sparkles, Loader, Save, CheckCircle, X } from 'lucide-react';
import { callGeminiAPI } from '../services/api.js';

const ScanTab = ({ isDark, onAddTask, onSaveHistory, setActiveTab }) => {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [countdownTime, setCountdownTime] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const countdownRef = useRef(null);

 
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow camera permissions or use the upload button.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCountdownTime(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startAutoCapture = () => {
    setCountdownTime(6);
    
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          capturePhotoAuto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhotoAuto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      setImage(imageDataUrl);
      stopCamera();
      analyzeImage(imageDataUrl);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      setImage(imageDataUrl);
      stopCamera();
      analyzeImage(imageDataUrl);
    }
  };

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
      console.error("Error details:", error.message);
      
      // Provide more specific error messages
      let errorMessage = 'Please check your connection or API key.';
      let errorMessageNe = 'कृपया आफ्नो इन्टरनेट जडान वा API कुञ्जी जाँच गर्नुहोस्।';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - check your internet connection.';
        errorMessageNe = 'नेटवर्क त्रुटि - आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Invalid API key. Please verify your Gemini API key.';
        errorMessageNe = 'अमान्य API कुञ्जी। कृपया आपको Gemini API कुञ्जी सत्यापन गर्नुहोस्।';
      } else if (error.message.includes('429')) {
        errorMessage = 'API quota exceeded. Please try again later.';
        errorMessageNe = 'API कोटा समाप्त भयो। कृपया पछि प्रयास गर्नुहोस्।';
      }
      
      setAnalysis({
        status: 'Error',
        confidence: 0,
        issues_en: ['Could not connect to AI service.', error.message],
        issues_ne: ['AI सेवामा जडान गर्न सकिएन।'],
        recommendations_en: [errorMessage],
        recommendations_ne: [errorMessageNe]
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
      
      {/* --- Left Column: Camera / Upload --- */}
      <div className={`rounded-xl shadow-lg p-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center"><Camera className="w-5 h-5 mr-2"/> Plant Diagnosis</h2>
        
        {showCamera ? (
          /* Camera View */
          <div className="relative rounded-lg overflow-hidden bg-black flex flex-col items-center justify-center min-h-[300px]">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            {/* Countdown Timer */}
            {countdownTime !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-4 animate-pulse">{countdownTime}</div>
                  <p className="text-white text-lg">Capturing in {countdownTime} seconds...</p>
                </div>
              </div>
            )}
            
            {/* Bottom Controls */}
            <div className="absolute bottom-4 flex gap-4 z-10">
              <button 
                onClick={stopCamera} 
                className="p-3 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-700 transition"
                title="Cancel"
              >
                <X className="w-6 h-6"/>
              </button>
              {countdownTime === null && (
                <>
                  <button 
                    onClick={startAutoCapture}
                    className="px-4 py-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition font-medium text-sm"
                    title="Auto Capture (6 sec)"
                  >
                    Auto (6s)
                  </button>
                  <button 
                    onClick={capturePhoto} 
                    className="p-4 bg-white rounded-full text-green-600 shadow-lg hover:scale-105 transition border-4 border-green-600"
                    title="Take Photo"
                  >
                    <Camera className="w-8 h-8 fill-current"/>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          
          <div className={`border-4 border-dashed rounded-lg p-12 text-center transition relative overflow-hidden flex flex-col gap-4 items-center justify-center min-h-[300px] ${
            isDark ? 'border-gray-600 hover:border-green-500' : 'border-gray-300 hover:border-green-500'
          }`}>
            
            {!image ? (
              <>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full"
                >
                  <Upload className={`w-12 h-12 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className="font-medium">Upload Image</p>
                  <p className="text-xs text-gray-500">JPG, PNG</p>
                </div>

                <div className="w-full border-t border-gray-300 dark:border-gray-600 my-2 relative">
                  <span className={`absolute left-1/2 -top-3 -translate-x-1/2 px-2 text-sm ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>OR</span>
                </div>

                <button 
                  onClick={startCamera}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition shadow-md"
                >
                  <Camera className="w-5 h-5"/>
                  Use Camera
                </button>
              </>
            ) : (
              <div className="relative w-full h-full">
                <img src={image} alt="Plant" className="max-h-64 mx-auto rounded-lg object-contain shadow-md" />
                <button 
                  onClick={() => { setImage(null); setAnalysis(null); }}
                  className="absolute top-2 right-2 bg-gray-900/50 hover:bg-gray-900 text-white p-1 rounded-full backdrop-blur-sm"
                >
                  <X className="w-4 h-4"/>
                </button>
              </div>
            )}
            
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm rounded-lg z-20">
                <Loader className="w-10 h-10 animate-spin text-green-500 mb-3"/>
                <p className="font-medium animate-pulse">Gemini AI is analyzing...</p>
              </div>
            )}
          </div>
        )}
        
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>

      {/* --- Right Column: Results --- */}
      <div className={`rounded-xl shadow-lg p-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-500"/> Analysis Results</h2>
        
        {!analysis ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Scan a plant to see the diagnosis here.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Status Card */}
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
