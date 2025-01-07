import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { generateRandomString, sha256, base64encode } from './spotify'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  const generateChallenge = async (codeVerifier) => {
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    return codeChallenge;
  }

  const authorize = () => {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = generateChallenge(codeVerifier);

    const clientId = '18f14aa15de04555bb6265565305ef67';
    const redirectUri = 'http://localhost:3000';

    const scope = 'user-read-private user-read-email';
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={authorize}>
          Spotify Auth Test
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
