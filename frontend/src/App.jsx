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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing image...");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Store image preview URL
  const [playlistId, setPlaylistId] = useState(null);

  // Grab file and URL for preview after photo uploads
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(file); // Store selected image file
    setPreviewUrl(URL.createObjectURL(file)); // Generate preview URL
  };

  // Process the image, generate album
  const handleGenerateClick = async () => {
    // Update the user about the current state of the generation
    setIsLoading(true);
    try {
      const labels = await processImage();
      setLoadingText("Generating playlist...");
      const playlist_id = await generatePlaylist(labels);
      setPlaylistId(playlist_id);
    } catch (err) {
      // Prompt user for a reload on failure
      setLoadingText("An error occurred. Please reload the page and try again.")
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Hits the backend to grab labels for image
  const processImage = async () => {
    const formData = new FormData();
    formData.append('image', image);

    // Note: This will change to a render URL for deployment
    const response = await fetch('http://localhost:4000/analyze-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    // Get the labels from the response
    const data = await response.json();
    return data.labels.map(item => item.description);
  };

  // On webpage laod...
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

    // Animation for 'vizzybeats' on login page
    const initAnimation = () => {
      const vizzybeats = document.getElementById('vizzybeats');
      // Wave animation, letter-by-letter
      if (vizzybeats) {
        const letters = Array.from(vizzybeats.children);
        letters.forEach((letter, index) => {
          setTimeout(() => {
            letter.classList.add('animate');
          }, 1000 + index * 100);
        });

        // Content fades in after letters have appeared
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
      // No code.. show the login page w animations
      window.onload = initAnimation;
    }
  }, []);

  return (
    <div>
      {
        // User has logged in
        isAuthenticated ? (
          <div id="dashboard">
            <h1>Upload an Image to Generate an Album</h1>
            <p>Select an image to get started. Then, generate a Spotify playlist blending the image and your music taste.</p>

            {/* Has the playlist been generated? */}
            {playlistId ? (<iframe
              title="Spotify Embed: Recommendation Playlist "
              src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
              width="100%"
              height="85%"
              style={{ minHeight: '500px' }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />) : (
              // Content prompting user for photo upload
              <div className="dashboard-content">
                <div
                  className="image-preview"
                  style={{
                    backgroundColor: image ? 'black' : '#242526',
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
              </div>)}
          </div>

        ) : (
          // Login page
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