import React, { useEffect, useState } from 'react';
import './index.css';
import './App.css';

const App = () => {
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    const vizzybeats = document.getElementById('vizzybeats');
    const letters = Array.from(vizzybeats.children);

    letters.forEach((letter, index) => {
      setTimeout(() => {
        letter.style.opacity = 1;
        letter.style.animationDelay = `${0.5 + index * 0.1}s`;
      }, 1000 + index * 100);
    });

    setTimeout(() => {
      setShowButton(true);
    }, letters.length * 100 + 1600); // Ensure button appears only after the text animation completes
  }, []);

  return (
    <div id="login-container">
      <div id="vizzybeats">
        {'vizzybeats'.split('').map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>
      <button id="spotify-button" className={showButton ? 'show' : ''}>
        SIGN IN WITH SPOTIFY
      </button>
    </div>
  );
};

export default App;
