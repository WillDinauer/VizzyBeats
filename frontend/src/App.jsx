import React, { useEffect, useState } from 'react';
import './index.css';
import './App.css';
import spotifyIcon from './assets/white-spotify-icon.png';
import { authorizeClick, getToken } from './spotify';
import { useRef } from 'react';

const App = () => {
  const hasFetched = useRef(false);
  const [showElements, setShowElements] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchToken = async (code) => {
        if (hasFetched.current) {
            return;
        }
        hasFetched.current = true;

        // Do the token exchange with Spotify
        try {
            const tokenResponse = await getToken(code);
            if (tokenResponse.access_token) {
                setIsAuthenticated(true);
                localStorage.setItem('access_token', tokenResponse.access_token);
            } else {
                console.error('Error retrieving access token:', tokenResponse);
            }
        } catch (error) {
            console.error('Error fetching Spotify token:', error);
        }

        // Clear code from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("code");

        const updatedUrl = url.search ? url.href : url.href.replace('?', '');
        window.history.replaceState({}, document.title, updatedUrl);
    };

    const initAnimation = () => {
        const vizzybeats = document.getElementById('vizzybeats');
        if (vizzybeats) {
            const letters = Array.from(vizzybeats.children);
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.classList.add('animate');
                }, 1000 + index * 100);
            });
    
            setTimeout(() => {
                setShowElements(true);
            }, letters.length * 100 + 1600);
        }
    };


    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    // Check if there is a code in the URL
    if (code) {
        fetchToken(code);
    } else {
        window.onload = initAnimation;
    }
  }, []);

  return (
    <div>
      {isAuthenticated ? (
        <div id="dashboard">
          <h1>Welcome to VizzyBeats!</h1>
          <p>Your Spotify account is now connected.</p>
        </div>
      ) : (
        <>
          <div id="gradient-background" className={showElements ? 'show' : ''}></div>
          <div id="login-container" className={showElements ? 'show' : ''}>
            <div id="vizzybeats">
              {'vizzybeats'.split('').map((char, index) => (
                <span key={index}>{char}</span>
              ))}
            </div>

            <div id="description" className={showElements ? 'show' : ''}>
              Turn your photos into personalized Spotify playlists with the power of AI, matching your unique vibe and music taste.
            </div>

            <button onClick={authorizeClick} id="spotify-button" className={showElements ? 'show' : ''}>
              SIGN IN WITH SPOTIFY
              <img src={spotifyIcon} alt="Spotify Icon" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;