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

  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

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
          <h1>Upload an Image to Generate an Album</h1>
          <p>Select an image to get started. Then, generate a Spotify playlist blending the image and your music taste.</p>

          <div className="dashboard-content">
            <div
              className="image-preview"
              style={{
                backgroundColor: image ? 'black' : 'gray',
              }}
            >
              {image ? <img src={image} alt="Uploaded" /> : <p>No image selected</p>}
            </div>
            <div className="controls">
              <label className="upload-btn">
                Upload Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
              <button
                className="generate-btn"
                style={{
                  backgroundColor: image ? '#ff4d4d' : 'gray'
                }}
                disabled={!image}
              >Generate album</button>
            </div>
          </div>
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