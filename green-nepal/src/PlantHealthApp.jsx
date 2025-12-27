import React from 'react';

export default function PlantHealthApp({ isDark, setIsDark }) {
  return (
    <div className={isDark ? 'min-h-screen bg-gray-900 text-white' : 'min-h-screen bg-white text-black'}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Plant Health App — Placeholder</h1>
        <p className="mb-4">This is a placeholder for the main app. Implement the real app here.</p>
        <button
          className="px-4 py-2 rounded bg-green-600 text-white"
          onClick={() => setIsDark(!isDark)}
        >
          Toggle theme
        </button>
      </div>
    </div>
  );
}
