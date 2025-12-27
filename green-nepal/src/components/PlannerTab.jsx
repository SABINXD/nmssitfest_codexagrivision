import React, { useState } from 'react';
import { Sparkles, Plus, Loader } from 'lucide-react';
import { callGeminiAPI } from '../services/api.js';

const PlannerTab = ({ isDark, onAddTask, setActiveTab }) => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorMsgNe, setErrorMsgNe] = useState(null);

  const examplePlan = [
    { stage: 'Preparation', date: 'Week 1-2', advice_en: 'Clear field, prepare soil with compost', advice_ne: 'तयारी: फिल्ड सफा गर्नुहोस् र कम्पोस्ट राख्नुहोस्' },
    { stage: 'Sowing', date: 'Week 3', advice_en: 'Sow seeds at recommended spacing', advice_ne: 'बिउ रोप्नुहोस् र सिफारिस गरिएको दूरीमा राख्नुहोस्' },
    { stage: 'Care', date: 'Week 4-12', advice_en: 'Water regularly and monitor for pests', advice_ne: 'नियमित पानी दिईरहनुहोस् र कीडा जाँच गर्नुहोस्' },
    { stage: 'Harvest', date: 'Week 13-14', advice_en: 'Harvest when crops mature', advice_ne: 'फसल पाकेपछि छानी सङ्कलन गर्नुहोस्' },
  ];

  const generatePlan = async () => {
    if (!selectedCrop) return;
    setLoading(true);
    setPlan(null);
    setErrorMsg(null);
    setErrorMsgNe(null);

    try {
      const prompt = `
        Create a farming calendar for '${selectedCrop}' in Nepal starting from today (${new Date().toLocaleDateString()}).
        Generate 4 key stages (Preparation, Sowing, Care, Harvest).
        Return ONLY JSON:
        [
          {
            "stage": "Stage Name",
            "date": "Approx Date Range",
            "advice_en": "English advice",
            "advice_ne": "Nepali advice (Devanagari)"
          }
        ]
      `;

      const result = await callGeminiAPI({ contents: [{ parts: [{ text: prompt }] }] });
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
        setPlan(JSON.parse(cleanText));
      } else {
        throw new Error('No response from API');
      }
    } catch (error) {
      console.error('Planner generatePlan error:', error);

      // Determine a helpful message
      let msg = 'Please check your connection or API key.';
      let msgNe = 'कृपया आफ्नो इन्टरनेट जडान वा API कुञ्जी जाँच गर्नुहोस्।';
      const em = String(error?.message || '').toLowerCase();
      if (em.includes('failed to fetch')) {
        msg = 'Network error - check your internet connection.';
        msgNe = 'नेटवर्क त्रुटि - आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।';
      } else if (em.includes('401') || em.includes('403')) {
        msg = 'Invalid API key or permission error. Verify your API key and project.';
        msgNe = 'अमान्य API कुञ्जी वा अनुमति त्रुटि। कृपया आफ्नो API कुञ्जी र प्रोजेक्ट जाँच गर्नुहोस्।';
      } else if (em.includes('429') || em.includes('quota')) {
        msg = 'API quota exceeded. Enable billing or wait until quota resets.';
        msgNe = 'API कोटा समाप्त भयो। बिलिङ सक्षम गर्नुहोस् वा कोटा रिसेट हुने सम्म पर्खनुहोस्।';
      }

      setErrorMsg(msg);
      setErrorMsgNe(msgNe);

      // Offer an example plan so the user can continue testing
      // Do not automatically set it, instead show a button in the UI

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <Sparkles className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400"/> 
        Smart Crop Planner (खेती पात्रो)
      </h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select 
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
        >
          <option value="">Select Crop / बाली छान्नुहोस्</option>
          <option value="Rice (Dhan)">Rice (धान)</option>
          <option value="Maize (Makai)">Maize (मकै)</option>
          <option value="Wheat (Gahu)">Wheat (गहुँ)</option>
          <option value="Mustard (Tori)">Mustard (तोरी)</option>
          <option value="Potato (Aalu)">Potato (आलु)</option>
        </select>
        <div className="flex gap-2">
          <button 
            onClick={generatePlan}
            disabled={loading || !selectedCrop}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin"/> : 'Generate Plan'}
          </button>

          <button
            onClick={() => setPlan(examplePlan)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition"
            title="Use an example plan locally"
          >
            Example
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'}`}>
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{errorMsg}</p>
          <p className="text-sm opacity-80 mt-1">{errorMsgNe}</p>
        </div>
      )}

      {plan && (
        <div className="relative border-l-4 border-indigo-200 ml-4 space-y-8">
          {plan.map((stage, idx) => (
            <div key={idx} className="relative pl-8 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="absolute -left-3.5 top-0 w-6 h-6 bg-indigo-600 rounded-full border-4 border-white dark:border-gray-800"></div>
              
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-300">{stage.stage}</h3>
                  <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-700">{stage.date}</span>
                </div>
                <p className="text-sm opacity-80 mb-2">{stage.advice_en}</p>
                <p className="text-lg font-medium leading-relaxed text-indigo-900 dark:text-indigo-100 mb-3">{stage.advice_ne}</p>
                
                <button 
                  onClick={() => { onAddTask(`${selectedCrop}: ${stage.stage}`, 'medium'); setActiveTab('tasks'); }}
                  className="text-xs flex items-center font-bold text-gray-500 hover:text-indigo-600 transition"
                >
                  <Plus className="w-3 h-3 mr-1"/> ADD TO TASKS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default PlannerTab;