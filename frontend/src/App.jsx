import React, { useEffect, useState } from 'react';
import './index.css';
import './App.css';
import spotifyIcon from './assets/white-spotify-icon.png';
import { authorizeClick, generatePlaylist, getToken } from './spotify';
import { useRef } from 'react';

const App = () => {
  const hasFetched = useRef(false);
  const [showElements, setShowElements] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Store image preview URL
  const [playlistId, setPlaylistId] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(file); // Store selected image file
    setPreviewUrl(URL.createObjectURL(file)); // Generate preview URL
  };

  const handleGenerateClick = async () => {
    try {
      const labels = await processImage();
      console.log(`labels: ${labels}`)
      const playlist_id = await generatePlaylist(labels);
      console.log(playlist_id);
      setPlaylistId(playlist_id);
    } catch (err) {
      console.log(err);
    }
  }

  const processImage = async () => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await fetch('http://localhost:4000/analyze-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    return data.labels.map(item => item.description);
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
      {
        isAuthenticated ? (
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
                {previewUrl ? <img src={previewUrl} alt="Uploaded" /> : <p>No image selected</p>}
              </div>

              <div className="controls">
                <label className="upload-btn">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
                <button
                  className="generate-btn"
                  style={{
                    backgroundColor: image ? '#ff4d4d' : 'gray',
                  }}
                  disabled={!image}
                  onClick={handleGenerateClick}
                >
                  Generate album
                </button>
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
        )
      }
    </div >
  );
};

export default App;