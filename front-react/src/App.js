import React, { useState, useEffect } from 'react';
import Edificio from './edificio';
import Lottie from 'react-lottie-player';
import './App.css';
import splashAnimation from './assets/splashAnimation.json'; // Replace with your Lottie animation JSON file

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {/* Splash screen */}
      {loading && (
        <div className="splash-screen">
          <Lottie
            loop
            animationData={splashAnimation}
            play
            style={{ width: 150, height: 150 }}
            />
        </div>
      )}

      {/* Main content */}
      <header className="App-header">
        <Edificio />
      </header>
    </div>
  );
}

export default App;
