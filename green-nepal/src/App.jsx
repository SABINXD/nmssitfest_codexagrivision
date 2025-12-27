import React, { useState } from 'react';
import { Activity, Sun, Moon, TrendingUp, Camera, Calendar, MessageSquare, Sprout, Sparkles } from 'lucide-react';
import LandingPage from './components/LandingPage.jsx';
import ScanTab from './components/scantab.jsx';
import DashboardTab from './components/dashboardtab.jsx';
import PlannerTab from './components/plannertab.jsx';
import TasksTab from './components/TasksTab.jsx';
import AssistantTab from './components/AssistantTab.jsx';

const App = () => {
  const [view, setView] = useState('landing');
  const [isDark, setIsDark] = useState(false);

  if (view === 'landing') {
    return (
      <LandingPage 
        onLaunch={() => setView('app')} 
        isDark={isDark} 
        setIsDark={setIsDark} 
      />
    );
  }

  return <PlantHealthApp isDark={isDark} setIsDark={setIsDark} />;
};

const PlantHealthApp = ({ isDark, setIsDark }) => {
  const [activeTab, setActiveTab] = useState('scan');
  const [history, setHistory] = useState([]);
  
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Water Tomato Field A', completed: false, priority: 'high' },
    { id: 2, text: 'Buy Urea/DAP Fertilizer', completed: true, priority: 'medium' },
  ]);

  const addTask = (text, priority = 'medium') => {
    setTasks([...tasks, { id: Date.now(), text, completed: false, priority }]);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addToHistory = (scanResult) => {
    setHistory([scanResult, ...history]);
    alert('Scan saved to history!');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* HEADER */}
      <header className={`shadow-md transition-colors duration-300 sticky top-0 z-40 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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

          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-full transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className={`flex flex-wrap gap-2 p-1 rounded-xl overflow-x-auto ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          {[
            { id: 'scan', icon: Camera, label: 'Scan' },
            { id: 'dashboard', icon: TrendingUp, label: 'Stats' },
            { id: 'planner', icon: Sprout, label: 'Plan' },
            { id: 'tasks', icon: Calendar, label: 'Tasks' },
            { id: 'assistant', icon: MessageSquare, label: 'Chat' },
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

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {activeTab === 'scan' && (
          <ScanTab 
            isDark={isDark} 
            onAddTask={addTask} 
            onSaveHistory={addToHistory} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab isDark={isDark} />
        )}

        {activeTab === 'planner' && (
          <PlannerTab 
            isDark={isDark} 
            onAddTask={addTask} 
            setActiveTab={setActiveTab} 
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
          <AssistantTab isDark={isDark} />
        )}
      </div>
    </div>
  );
};

export default App;
