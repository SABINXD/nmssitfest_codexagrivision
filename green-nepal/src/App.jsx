import React, { useState, Suspense } from 'react';
import LandingPage from './components/LandingPage.jsx';


const PlantHealthApp = React.lazy(() => import('./PlantHealthApp.jsx'));

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

  return (
    <Suspense fallback={<div className="p-8">Loading app…</div>}>
      <PlantHealthApp isDark={isDark} setIsDark={setIsDark} />
    </Suspense>
  );
};

export default App;