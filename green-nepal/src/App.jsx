import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Sun, Moon, Camera, TrendingUp, Calendar, 
  MessageSquare, Heart, Sprout, Sparkles, Upload, 
  AlertCircle, CheckCircle, Save, Loader, Droplets, 
  Wind, DollarSign, ArrowUpRight, ArrowDownRight, 
  Bot, Send, Volume2, Leaf, ChevronRight, ShieldCheck, 
  Smartphone, Zap, Globe, Plus, Trash2, LogOut, 
  User as UserIcon, Lock, Mic, MicOff, CloudRain, Users, Play
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, query, 
  onSnapshot, deleteDoc, doc, updateDoc 
} from 'firebase/firestore';

// --- CONFIGURATION ---
const GEMINI_API_KEY = "AIzaSyCG0MxlPkLaQHsYkt6gok6OGKYILMzbi_g";

const firebaseConfig = {
  apiKey: "AIzaSyBt7K_FMcN-vEZ-GWh36FaWcaEr-4cYN0Q",
  authDomain: "agri-vision-app-75d60.firebaseapp.com",
  projectId: "agri-vision-app-75d60",
  storageBucket: "agri-vision-app-75d60.firebasestorage.app",
  messagingSenderId: "92636573514",
  appId: "1:92636573514:web:d6974274d90dd6a138dbb3"
};

const appId = "agri-health-hackathon-v1"; 

// --- INITIALIZE FIREBASE ---
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization failed:", e);
}

// --- API SERVICES ---
const callGeminiAPI = async (payload, endpoint = "generateContent", retries = 3) => {
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

      if (!response.ok) {
        if (response.status === 429) throw new Error("API Quota Exceeded (429).");
        if (response.status === 403) throw new Error("Invalid API Key (403).");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i))); 
    }
  }
};

const fetchWeatherData = async () => {
  try {
    const lat = 27.7172; 
    const lon = 85.3240;
    const apiKey = "a8723a7e2b7b40369e589f30dcda7ba8"; 
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6),
      uv: 6, 
      loading: false
    };
  } catch (error) {
    console.error("Weather fetch failed", error);
    return { temp: 28, humidity: 65, wind: 12, uv: 7, loading: false };
  }
};

// --- LANDING PAGE ASSETS & UTILS ---
const IMAGES = {
  farmer: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop",
  crop: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=800&auto=format&fit=crop",
  tech: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
  landscape: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop"
};

const useOnScreen = (options) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [ref, options]);
  return [ref, visible];
};

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useOnScreen({ threshold: 0.5 });

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}+</span>;
};

const TiltCard = ({ children, className, bgImage }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div
      className={`relative overflow-hidden transition-all duration-200 ease-out transform ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
      }}
    >
      {bgImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </>
      )}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const FeatureCard = ({ feature, isDark, index }) => {
  return (
    <div 
      className={`group relative p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2
      ${isDark 
        ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700' 
        : 'bg-white hover:shadow-2xl hover:shadow-green-100 border border-gray-100 shadow-sm'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.from} ${feature.to} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-6
        ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <feature.icon className={`w-8 h-8 ${feature.color}`} />
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
        {feature.title}
      </h3>
      <p className={`leading-relaxed ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
        {feature.desc}
      </p>
    </div>
  );
};

// --- LANDING PAGE COMPONENT ---
const LandingPage = ({ onLaunch, isDark, setIsDark }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) * 20, 
        y: (e.clientY / window.innerHeight) * 20 
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const styles = `
    @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } 100% { transform: translateY(0px) rotate(0deg); } }
    @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
    @keyframes typewriter { from { width: 0; } to { width: 100%; } }
    @keyframes blink { 50% { border-color: transparent; } }
    
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 15s ease infinite; }
    .animate-blob { animation: blob 7s infinite; }
    .typing-cursor { overflow: hidden; white-space: nowrap; border-right: 4px solid #10B981; animation: typewriter 3s steps(40) 1s 1 normal both, blink 0.75s step-end infinite; }
  `;

  return (
    <div className={`min-h-screen transition-colors duration-700 overflow-x-hidden ${isDark ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'}`}>
      <style>{styles}</style>
      
      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className={`absolute opacity-10 ${isDark ? 'text-green-800' : 'text-green-300'} animate-float`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.5}s`,
              transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`
            }}
          >
            {i % 2 === 0 ? <Leaf size={40 + Math.random() * 40} /> : <Sprout size={40 + Math.random() * 40} />}
          </div>
        ))}
        <div 
          className={`absolute top-0 left-0 w-full h-full opacity-30 filter blur-[100px] animate-gradient-x
          ${isDark 
            ? 'bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900' 
            : 'bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100'}`} 
        />
      </div>

      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? (isDark ? 'bg-gray-900/90 border-b border-gray-800 backdrop-blur-md py-3' : 'bg-white/80 border-b border-green-100 backdrop-blur-md py-3') : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="bg-gradient-to-tr from-green-500 to-emerald-600 p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white to-gray-400' : 'from-gray-900 to-green-800'}`}>
              AgriHealth
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('tutorial')}
              className={`hidden md:block font-medium transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-green-600'}`}
            >
              Tutorial
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className={`hidden md:block font-medium transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-green-600'}`}
            >
              About Us
            </button>
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 ring-2 ring-gray-700' : 'bg-white text-orange-400 hover:bg-orange-50 shadow-md ring-1 ring-orange-100'}`}
            >
              {isDark ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={onLaunch}
              className="relative overflow-hidden group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-7 py-2.5 rounded-full font-semibold shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center">
                Launch App <Zap className="w-4 h-4 ml-2 group-hover:text-yellow-300 transition-colors" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-36 pb-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center z-10">
        <div className="md:w-1/2 mb-16 md:mb-0">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 transform hover:scale-105 transition-transform cursor-default ${isDark ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-white shadow-md text-green-700 border border-green-100'}`}>
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Empowering Nepal's Agriculture 🇳🇵
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Cultivating the <br/>
            <span className="inline-block typing-cursor text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 pb-2">
              Future
            </span> <br/>
            of Farming
          </h1>
          
          <p className={`text-xl mb-10 leading-relaxed max-w-lg transition-opacity duration-500 delay-500 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-driven crop diagnosis and expert assistance, now with real-time visual monitoring for every season.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLaunch}
              className="group flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              Get Started Free 
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Hero Visual - Interactive PHOTO Tilt Cards */}
        <div className="md:w-1/2 relative perspective-1000">
          <div className={`absolute top-10 right-10 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob ${isDark ? 'mix-blend-overlay opacity-20' : ''}`}></div>
          <div className={`absolute bottom-10 left-10 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-2000 ${isDark ? 'mix-blend-overlay opacity-20' : ''}`}></div>
          
          <div className="relative z-10 grid grid-cols-2 gap-5 transform rotate-3 hover:rotate-0 transition duration-700 ease-out p-4">
            
            <TiltCard bgImage={IMAGES.crop} className={`rounded-3xl shadow-2xl backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-white/60'} h-48 group`}>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg text-white drop-shadow-md">AI Diagnosis</span>
            </TiltCard>
            
            <TiltCard bgImage={IMAGES.landscape} className={`rounded-3xl shadow-2xl backdrop-blur-xl border translate-y-12 ${isDark ? 'border-gray-700' : 'border-white/60'} h-48 group`}>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg text-white drop-shadow-md">Smart Calendar</span>
            </TiltCard>
            
            <TiltCard bgImage={IMAGES.farmer} className={`rounded-3xl shadow-2xl backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-white/60'} h-48 group`}>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg text-white drop-shadow-md">Expert Chat</span>
            </TiltCard>
            
            <TiltCard bgImage={IMAGES.tech} className={`rounded-3xl shadow-2xl backdrop-blur-xl border translate-y-12 ${isDark ? 'border-gray-700' : 'border-white/60'} h-48 group`}>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg text-white drop-shadow-md">Market Rates</span>
            </TiltCard>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className={`py-24 relative ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-500">Everything you need to grow</h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Combining cutting-edge technology with the wisdom of the fields.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Precision Detection", desc: "Detect diseases with 95% accuracy using our advanced Gemini AI vision models.", color: "text-green-600", from: "from-green-500", to: "to-emerald-500" },
              { icon: Calendar, title: "Seasonal Planning", desc: "Get customized schedules for planting, fertilizing, and harvesting based on your location.", color: "text-indigo-600", from: "from-indigo-500", to: "to-purple-500" },
              { icon: Smartphone, title: "Mobile First", desc: "Designed for the field. Works perfectly on all mobile devices with an intuitive interface.", color: "text-blue-600", from: "from-blue-500", to: "to-cyan-500" },
              { icon: Zap, title: "Real-time Insights", desc: "Stay updated with live weather forecasts and current market prices across Nepal.", color: "text-orange-600", from: "from-orange-500", to: "to-red-500" },
            ].map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} isDark={isDark} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats - Parallax Background */}
      <section className="relative py-32 text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: `url(${IMAGES.landscape})` }}
        ></div>
        <div className="absolute inset-0 bg-green-900/80 backdrop-blur-sm"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-green-400/30">
            {[
              { val: 10000, label: "Active Farmers", icon: Globe },
              { val: 50, label: "Districts Covered", icon: CloudRain },
              { val: 1000000, label: "Scans Performed", icon: Camera }
            ].map((stat, i) => (
              <div key={i} className="pt-8 md:pt-0 hover:transform hover:scale-105 transition-transform duration-300">
                <stat.icon className="w-10 h-10 mx-auto mb-4 text-green-300 opacity-90" />
                <div className="text-5xl font-extrabold mb-2 text-white drop-shadow-lg">
                   <CountUp end={stat.val} />
                </div>
                <div className="text-green-100 font-medium text-lg tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ABOUT US SECTION (New) --- */}
      <section id="about" className={`py-24 ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-green-100 rounded-full dark:bg-green-900/30">
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Who We Are</h2>
          <p className={`text-lg md:text-xl leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We are a team of student developers participating in the <strong>NMSS IT Fest Hackathon</strong>. 
            Our goal is to revolutionize traditional farming in Nepal by leveraging the power of Artificial Intelligence. 
            We believe that by providing farmers with instant disease diagnosis and smart planning tools, we can ensure better harvests and sustainable livelihoods.
          </p>
          <div className="flex justify-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 shadow-sm'}`}>🚀 Innovation</span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 shadow-sm'}`}>🌱 Sustainability</span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 shadow-sm'}`}>🤝 Community</span>
          </div>
        </div>
      </section>

      {/* --- VIDEO TUTORIAL SECTION (New) --- */}
      <section id="tutorial" className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-blue-100 rounded-full dark:bg-blue-900/30">
            <Play className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className={`text-lg mb-12 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Watch our step-by-step guide on how to use AgriHealth Monitor to check your crop health and plan your season.
          </p>
          
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100 dark:border-gray-800 bg-black">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/0xR2fdzwYzc?rel=0&modestbranding=1" 
              title="AgriHealth App Tutorial" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className={`p-4 rounded-xl inline-block ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-blue-800'}`}>
              <p className="text-sm font-medium">🎥 Video Guide: A step by step guide for smart crop monitoring web app designed for farmers. 👨‍🌾</p>
            </div>
            
            <a 
              href="https://www.youtube.com/watch?v=0xR2fdzwYzc" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-sm font-bold flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${
                isDark 
                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <Play className="w-4 h-4 fill-current" /> 
              Watch directly on YouTube (if playback fails)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t relative z-10 ${isDark ? 'bg-gray-950 border-gray-900' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 p-2 rounded-lg">
              <Leaf className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <span className="font-bold text-xl text-gray-700 dark:text-gray-300">AgriHealth Monitor</span>
          </div>
          <div className={`text-sm flex flex-col md:flex-row items-center gap-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span>© 2024 Agri Nepal Initiative.</span>
            <span className="hidden md:inline">•</span>
            <span>Built with ❤️ for the Hackathon</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- AUTH TAB ---
const AuthTab = ({ user, isDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase not configured.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className={`rounded-xl shadow-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <UserIcon className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-gray-500 mb-6">{user.email}</p>
        <button 
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center mx-auto"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto rounded-xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">{isSignUp ? 'Create Account' : 'Farmer Login'}</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin mx-auto"/> : (isSignUp ? 'Sign Up' : 'Login')}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-green-600 font-bold ml-1 hover:underline"
        >
          {isSignUp ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

// --- SCAN TAB ---
const ScanTab = ({ isDark, onAddTask, onSaveHistory, setActiveTab, user, setApiError }) => {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  const saveToHistory = async (result) => {
    if (!user) return alert("Please login to save history!");
    if (!db) return alert("Database not initialized");
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'history'), {
        ...result,
        timestamp: new Date().toISOString()
      });
      alert('Scan saved to cloud history!');
    } catch (e) {
      console.error("Error saving history: ", e);
      alert("Failed to save history.");
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
    setApiError(null);

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
        setAnalysis({
          ...parsedAnalysis,
          image: imageDataUrl,
          timestamp: new Date().toLocaleString()
        });
      } else {
        throw new Error("No analysis result");
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      let errorMessage = 'Could not connect to AI service.';
      if (error.message.includes('429')) errorMessage = 'API Quota Exceeded (429). Please try again in a few minutes.';
      else if (error.message.includes('403')) errorMessage = 'Invalid API Key (403). Please check your configuration.';
      setApiError(errorMessage);
      setAnalysis({
        status: 'Error',
        confidence: 0,
        image: imageDataUrl,
        timestamp: new Date().toLocaleString(),
        issues_en: [errorMessage],
        issues_ne: ['AI सेवामा जडान गर्न सकिएन।'],
        recommendations_en: ['Check connection/key.'],
        recommendations_ne: ['इन्टरनेट/API कुञ्जी जाँच गर्नुहोस्।']
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
              onClick={() => saveToHistory(analysis)}
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

const DashboardTab = ({ isDark }) => {
  const [weatherData, setWeatherData] = useState({ temp: 0, humidity: 0, wind: 0, uv: 0, loading: true });
  
  const plants = [
    { id: 1, name: 'Tomato Field A', health: 92, status: 'healthy', lastCheck: '2 hours ago' },
    { id: 2, name: 'Wheat Field B', health: 78, status: 'warning', lastCheck: '5 hours ago' },
    { id: 3, name: 'Corn Field C', health: 65, status: 'critical', lastCheck: '1 day ago' },
  ];

  const marketData = [
    { crop: 'Tomato (Local)', price: 65, unit: 'kg', trend: 'up', change: '+5.2%' },
    { crop: 'Rice (Mansuli)', price: 95, unit: 'kg', trend: 'stable', change: '0.0%' },
    { crop: 'Potato (Red)', price: 55, unit: 'kg', trend: 'down', change: '-2.1%' },
    { crop: 'Onion (Dry)', price: 85, unit: 'kg', trend: 'up', change: '+8.5%' },
  ];

  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchWeatherData();
      setWeatherData(data);
    };
    loadWeather();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'healthy') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Temperature', value: `${weatherData.temp}°C`, icon: Sun, color: 'text-orange-500' },
          { label: 'Humidity', value: `${weatherData.humidity}%`, icon: Droplets, color: 'text-blue-500' },
          { label: 'Wind Speed', value: `${weatherData.wind} km/h`, icon: Wind, color: 'text-gray-500' },
          { label: 'UV Index', value: weatherData.uv, icon: Sun, color: 'text-yellow-500' },
        ].map((item, idx) => (
          <div key={idx} className={`rounded-xl shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-70">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Field Health Overview</h2>
          {plants.map((plant) => (
            <div key={plant.id} className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(plant.status)}`}></div>
                <div>
                  <p className="font-semibold">{plant.name}</p>
                  <p className="text-sm opacity-60">Last checked: {plant.lastCheck}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${plant.health >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>{plant.health}%</p>
                <p className="text-xs opacity-50">Health Score</p>
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center"><DollarSign className="w-5 h-5 mr-2 text-green-500"/> Market Prices (Nepal)</h2>
            <span className="text-xs opacity-50">Live Updates</span>
          </div>
          <div className="space-y-4">
            {marketData.map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div>
                  <p className="font-medium">{item.crop}</p>
                  <p className="text-xs opacity-60">per {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Rs. {item.price}</p>
                  <p className={`text-xs flex items-center justify-end ${item.trend === 'up' ? 'text-green-500' : item.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {item.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1"/> : item.trend === 'down' ? <ArrowDownRight className="w-3 h-3 mr-1"/> : null}
                    {item.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlannerTab = ({ isDark, onAddTask, setActiveTab, setApiError }) => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const generatePlan = async () => {
    if (!selectedCrop) return;
    setLoading(true);
    setPlan(null);
    setApiError(null);

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
      }
    } catch (error) {
      console.error(error);
      setApiError(error.message);
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

      <div className="flex flex-col md:flex-row gap-4 mb-8">
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
        <button 
          onClick={generatePlan}
          disabled={loading || !selectedCrop}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin"/> : 'Generate Plan'}
        </button>
      </div>

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

const TasksTab = ({ isDark, tasks, onAddTask, onToggle, onDelete }) => {
  const [newTaskInput, setNewTaskInput] = useState('');

  const handleAdd = () => {
    if (newTaskInput.trim()) {
      onAddTask(newTaskInput);
      setNewTaskInput('');
    }
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-xl font-bold mb-6 flex items-center"><Calendar className="w-6 h-6 mr-2 text-blue-500"/> Farm Tasks</h2>
      
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder="Add a new task..."
          className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition shadow-md hover:shadow-lg">
          <Plus className="w-5 h-5"/>
        </button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-center opacity-50 py-8">No tasks scheduled. Relax!</p>}
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'} ${task.completed ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onToggle(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400'}`}
              >
                {task.completed && <CheckCircle className="w-4 h-4" />}
              </button>
              <span className={task.completed ? 'line-through' : ''}>{task.text}</span>
              {task.priority === 'high' && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">High</span>}
            </div>
            <button onClick={() => onDelete(task.id)} className="text-red-400 hover:text-red-600 p-2">
              <Trash2 className="w-4 h-4"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AssistantTab = ({ isDark, setApiError }) => {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Namaste! I am your Agri-Assistant. You can speak to me in Nepali or English!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support voice input. Try Google Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ne-NP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatInput('');
    setIsChatLoading(true);
    setApiError(null);

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
      setApiError(error.message);
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
          <p className="text-xs opacity-60">Online • Voice Enabled</p>
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
        <div className="flex gap-2 items-center">
          <button 
            onClick={startListening}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-lg' 
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Speak (Nepali/English)"
          >
            {isListening ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
          </button>

          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isListening ? "Listening..." : "Type or speak..."}
            disabled={isChatLoading || isListening}
            className={`flex-1 p-3 rounded-full border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          <button 
            onClick={() => sendMessage()}
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

// --- MAIN APP CONTROLLER ---
const App = () => {
  const [view, setView] = useState('landing'); // 'landing' or 'app'
  const [isDark, setIsDark] = useState(false); // Global Theme State
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  if (view === 'landing') {
    return (
      <LandingPage 
        onLaunch={() => setView('app')} 
        isDark={isDark} 
        setIsDark={setIsDark} 
      />
    );
  }

  // Pass user state to the dashboard
  return (
    <PlantHealthApp 
      isDark={isDark} 
      setIsDark={setIsDark} 
      user={user} 
      auth={auth}
      db={db}
    />
  );
};

// --- DASHBOARD LAYOUT & LOGIC ---
const PlantHealthApp = ({ isDark, setIsDark, user, auth, db }) => {
  const [activeTab, setActiveTab] = useState('scan');
  const [history, setHistory] = useState([]);
  const [apiError, setApiError] = useState(null);
  
  // Tasks sync with Firestore if logged in
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Water Tomato Field A', completed: false, priority: 'high' },
    { id: 2, text: 'Buy Urea/DAP Fertilizer', completed: true, priority: 'medium' },
  ]);

  useEffect(() => {
    if (user && db) {
      // Real-time listener for tasks from Firestore
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedTasks.length > 0) setTasks(fetchedTasks);
      }, (error) => {
        console.error("Error fetching tasks:", error);
      });
      return () => unsubscribe();
    }
  }, [user, db]);

  // Helper Functions with Firestore sync
  const addTask = async (text, priority = 'medium') => {
    const newTask = { text, completed: false, priority, timestamp: new Date().toISOString() };
    if (user && db) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'), newTask);
      } catch (error) {
        console.error("Error adding task to DB:", error);
        // Fallback to local state if offline or error
        setTasks(prev => [...prev, { id: Date.now(), ...newTask }]);
      }
    } else {
      setTasks(prev => [...prev, { id: Date.now(), ...newTask }]);
    }
  };

  const toggleTask = async (id) => {
    if (user && db) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        try {
           const taskRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', id);
           await updateDoc(taskRef, { completed: !task.completed });
        } catch (error) {
          console.error("Error toggling task:", error);
           // Optimistic update for UI responsiveness
           setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }
      }
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const deleteTask = async (id) => {
    if (user && db) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', id));
      } catch (error) {
        console.error("Error deleting task:", error);
        setTasks(tasks.filter(t => t.id !== id));
      }
    } else {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const addToHistory = (scanResult) => {
    setHistory([scanResult, ...history]);
    // Note: Cloud saving is handled inside ScanTab directly if user is logged in
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* --- HEADER --- */}
      <header className={`shadow-md transition-colors duration-300 sticky top-0 z-40 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo Area */}
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center">
                AgriHealth <span className="hidden md:inline ml-1">Monitor</span> 
                <Sparkles className="w-4 h-4 ml-2 text-yellow-500"/>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile / Auth Status */}
            {user ? (
              <div className="hidden md:flex items-center text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <UserIcon className="w-4 h-4 mr-1"/> {user.email ? user.email.split('@')[0] : 'User'}
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('auth')}
                className="hidden md:flex items-center text-sm font-bold text-green-600 hover:text-green-700"
              >
                <Lock className="w-4 h-4 mr-1"/> Login
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-full transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* --- NAVIGATION BAR --- */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className={`flex flex-wrap gap-2 p-1 rounded-xl overflow-x-auto ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          {[
            { id: 'scan', icon: Camera, label: 'Scan' },
            { id: 'dashboard', icon: TrendingUp, label: 'Stats' },
            { id: 'planner', icon: Sprout, label: 'Plan' },
            { id: 'tasks', icon: Calendar, label: 'Tasks' },
            { id: 'assistant', icon: MessageSquare, label: 'Chat' },
            { id: 'donate', icon: Heart, label: 'Donate' },
            { id: 'auth', icon: UserIcon, label: user ? 'Profile' : 'Login' }, // Added Auth Tab
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] py-3 px-3 rounded-lg font-medium transition duration-200 flex flex-col md:flex-row items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-md transform scale-105'
                  : isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs md:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- API ERROR BANNER --- */}
      {apiError && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="w-full p-3 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md mb-4 flex items-center justify-between">
            <div>
              <strong>API Error:</strong> {apiError}
              <div className="text-sm opacity-80 mt-1">AI सेवामा जडान गर्न सकिएन। (Could not connect to AI Service)</div>
            </div>
            <button onClick={() => setApiError(null)} className="ml-4 text-sm text-red-600 hover:underline">Dismiss</button>
          </div>
        </div>
      )}

      {/* --- DYNAMIC CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        
        {activeTab === 'scan' && (
          <ScanTab 
            isDark={isDark} 
            onAddTask={addTask} 
            onSaveHistory={addToHistory} 
            setActiveTab={setActiveTab}
            user={user}
            setApiError={setApiError}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab isDark={isDark} setApiError={setApiError} />
        )}

        {activeTab === 'planner' && (
          <PlannerTab 
            isDark={isDark} 
            onAddTask={addTask} 
            setActiveTab={setActiveTab} 
            setApiError={setApiError}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab 
            isDark={isDark} 
            tasks={tasks} 
            onAddTask={addTask} 
            onToggle={toggleTask} 
            onDelete={deleteTask} 
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantTab isDark={isDark} setApiError={setApiError} />
        )}

        {activeTab === 'donate' && (
          <DonateTab isDark={isDark} />
        )}

        {activeTab === 'auth' && (
          <AuthTab user={user} auth={auth} isDark={isDark} />
        )}

      </div>
    </div>
  );
};

export default App;