import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, Sun, Moon, Camera, Sprout, MessageSquare, 
  DollarSign, ChevronRight, ShieldCheck, Calendar, 
  Smartphone, Zap, Globe, Wind, CloudRain 
} from 'lucide-react';

// --- Assets (Retrieved Images) ---
const IMAGES = {
  farmer: "https://gemini.google.com/share/bf5231585710",
  crop: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR7ahvb8aEN76vOIivqeFpa9_gBV5rZm2erw&s",
  tech: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8dU4M4NmKgHTaM_QDoGmDAIQC3r__CZ5w2Q&s",
  landscape: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9B3KUKXXay_iM6io2Xow7tZQrbIfhvhCNiw&s"
};

// --- Utility Hooks & Components ---

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

// Enhanced Tilt Card with Image Support
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
      {/* Background Image Layer */}
      {bgImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        </>
      )}
      
      {/* Content Layer */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// --- Main Landing Page ---

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
            <button className={`group flex items-center justify-center px-8 py-4 rounded-full font-bold text-lg border transition-all duration-300 hover:scale-105 ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'}`}>
              <Wind className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Learn More
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
        {/* Parallax Image Background */}
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

export default LandingPage;