import React, { useEffect, useState } from 'react';
import { Sun, Droplets, Wind, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchWeatherData } from '../services/api.js';

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
export default DashboardTab;    

