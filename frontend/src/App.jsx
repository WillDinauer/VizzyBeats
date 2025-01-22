import React, { useEffect, useState } from 'react';
import './index.css';
import './App.css';
import spotifyIcon from './assets/white-spotify-icon.png';

const App = () => {
  const [showElements, setShowElements] = useState(false);

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
      setShowElements(true);
    }, letters.length * 100 + 1600);
  }, []);

  return (
    <div id="login-container">
      <div id="vizzybeats">
        {'vizzybeats'.split('').map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>

      <div id="description" className={showElements ? 'show' : ''}>
        Turn your photos into personalized Spotify playlists with the power of AI, matching your unique vibe and music taste
      </div>

      <button id="spotify-button" className={showElements ? 'show' : ''}>
        SIGN IN WITH SPOTIFY
        <img src={spotifyIcon} alt="Spotify Icon" />
      </button>
    </div>
  );
};

export default App;