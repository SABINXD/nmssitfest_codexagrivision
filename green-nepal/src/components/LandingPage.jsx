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

const LandingPage = ({ onLaunch, isDark, setIsDark }) => {
  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-emerald-50 via-teal-50 to-white text-gray-900'}`}>
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b transition-colors duration-300 ${isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/70 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-green-500 to-emerald-600 p-2 rounded-xl shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AgriHealth</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={onLaunch}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0 z-10">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 ${isDark ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-800'}`}>
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Empowering Nepal's Agriculture 🇳🇵
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Cultivating the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-400">Future</span> of Farming
          </h1>
          
          <p className={`text-xl mb-10 leading-relaxed max-w-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Experience the power of AI-driven crop diagnosis, localized farming calendars, and expert assistance. 
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLaunch}
              className="flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition transform hover:-translate-y-1"
            >
              Get Started Free <ChevronRight className="w-5 h-5 ml-2"/>
            </button>
            <button className={`flex items-center justify-center px-8 py-4 rounded-full font-bold text-lg border transition ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="md:w-1/2 relative">
          <div className={`absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${isDark ? 'hidden' : ''}`}></div>
          <div className={`absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${isDark ? 'hidden' : ''}`}></div>
          
          <div className="relative z-10 grid grid-cols-2 gap-4 transform rotate-6 hover:rotate-0 transition duration-700 ease-out">
            <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/50'} flex flex-col items-center justify-center h-48`}>
              <div className="bg-green-100 p-4 rounded-full mb-3 dark:bg-green-900/30">
                <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-bold">AI Diagnosis</span>
            </div>
            <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-xl border translate-y-8 ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/50'} flex flex-col items-center justify-center h-48`}>
              <div className="bg-indigo-100 p-4 rounded-full mb-3 dark:bg-indigo-900/30">
                <Sprout className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-bold">Smart Calendar</span>
            </div>
            <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/50'} flex flex-col items-center justify-center h-48`}>
              <div className="bg-blue-100 p-4 rounded-full mb-3 dark:bg-blue-900/30">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold">Expert Chat</span>
            </div>
            <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-xl border translate-y-8 ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/50'} flex flex-col items-center justify-center h-48`}>
              <div className="bg-orange-100 p-4 rounded-full mb-3 dark:bg-orange-900/30">
                <DollarSign className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="font-bold">Market Rates</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our platform combines cutting-edge technology with local agricultural knowledge to help you maximize your harvest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Precision Detection", desc: "Detect diseases with 95% accuracy using our advanced Gemini AI vision models.", color: "text-green-600", bg: "bg-green-100", border: "border-green-200" },
              { icon: Calendar, title: "Seasonal Planning", desc: "Get customized schedules for planting, fertilizing, and harvesting based on your location.", color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200" },
              { icon: Smartphone, title: "Mobile First", desc: "Designed for the field. Works perfectly on all mobile devices with an intuitive interface.", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
              { icon: Zap, title: "Real-time Insights", desc: "Stay updated with live weather forecasts and current market prices across Nepal.", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" },
            ].map((feature, idx) => (
              <div key={idx} className={`p-8 rounded-2xl transition duration-300 hover:scale-105 ${isDark ? 'bg-gray-800 border border-gray-700' : `bg-white border ${feature.border} shadow-sm hover:shadow-xl`}`}>
                <div className={`w-14 h-14 ${isDark ? 'bg-gray-700' : feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-r from-emerald-900 to-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-extrabold mb-2">10k+</div>
              <div className="text-green-200 font-medium">Active Farmers</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold mb-2">50+</div>
              <div className="text-green-200 font-medium">Districts Covered</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold mb-2">1M+</div>
              <div className="text-green-200 font-medium">Scans Performed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
              <Leaf className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="font-bold text-gray-700 dark:text-gray-300">AgriHealth Monitor</span>
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2024 Agri Nepal Initiative. Built for the Hackathon.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
