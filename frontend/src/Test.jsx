import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { authorizeClick, codeClick, playlistClick } from './spotify'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null); // Store image file
  const [previewUrl, setPreviewUrl] = useState(null); // Store image preview URL

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(file); // Store selected image file
    setPreviewUrl(URL.createObjectURL(file)); // Generate preview URL
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please upload an image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:4000/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setLabels(data.labels);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <button onClick={authorizeClick}>Spotify Auth Test</button>
        <button onClick={codeClick}>Parse Spotify Code Test</button>
        <button onClick={playlistClick}>Create example playlist</button>
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>
      <h1>Image Labeling Test</h1>
      
      <input type="file" accept="image/*" onChange={handleImageChange} />
      
      {previewUrl && (
        <div>
          <h3>Image Preview:</h3>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px' }} />
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Processing...' : 'Analyze Image'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {labels.map((label, index) => (
          <li key={index}>
            {label.description} ({(label.score * 100).toFixed(2)}%)
          </li>
        ))}
      </ul>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App