import React, { useState } from 'react';
import axios from 'axios';
import './styles/theme.css';
import './App.css';
import CameraUpload from './components/CameraUpload';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import ProgressTracker from './components/ProgressTracker';
import TreatmentScheduler from './components/TreatmentScheduler';
import WeatherRiskPanel from './components/WeatherRiskPanel';
import SafetyModePanel from './components/SafetyModePanel';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5001/analyze';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [latestProgressEntry, setLatestProgressEntry] = useState(null);

  const createThumbnail = (file) =>
    new Promise((resolve) => {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, size, size);
        URL.revokeObjectURL(imageUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(null);
      };
      image.src = imageUrl;
    });

  const handleImageCapture = (file, url) => {
    setImageFile(file);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
  };

  const analyzeDisease = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);

      const thumbnail = await createThumbnail(imageFile);
      setLatestProgressEntry({
        id: crypto.randomUUID(),
        capturedAt: new Date().toISOString(),
        disease: response.data?.disease || 'Unknown',
        severity: response.data?.severity || 'Unknown',
        confidence: Number(response.data?.confidence || 0),
        thumbnail,
      });
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(
        `Could not connect to the analysis server (${API_ENDPOINT}). If this is your first request, the backend may still be waking up.`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="container">
      <header className="app-header">
        <p className="eyebrow">Offline Smart Farming Assistant</p>
        <h1>CropScope</h1>
        <p className="subtitle">Detect crop diseases quickly from a leaf image and get treatment guidance in seconds.</p>
      </header>

      <div className="quick-facts glass-panel">
        <div className="fact">
          <span className="fact-value">AI</span>
          <span className="fact-label">disease detection</span>
        </div>
        <div className="fact">
          <span className="fact-value">Fast</span>
          <span className="fact-label">single tap analysis</span>
        </div>
        <div className="fact">
          <span className="fact-value">Actionable</span>
          <span className="fact-label">next-step treatment tips</span>
        </div>
      </div>

      <div className={`app-content ${result ? 'has-result' : ''}`}>
        <section className="interaction-section glass-panel">
          <div className="section-topline">
            <h2>Leaf Scanner</h2>
            <p>Capture a clear image of the affected leaf for better results.</p>
          </div>

          <CameraUpload onImageCapture={handleImageCapture} selectedImage={previewUrl} loading={loading} />

          {previewUrl && !loading && !result && (
            <button className="analyze-btn" onClick={analyzeDisease}>
              Analyze Leaf
            </button>
          )}

          {error && <div className="error-message">{error}</div>}
        </section>

        {result && (
          <section className="result-section">
            <ResultCard result={result} onReset={resetAll} />
          </section>
        )}
      </div>

      {loading && <Loader />}

      <section className="feature-panels">
        <ProgressTracker latestEntry={latestProgressEntry} />
        <TreatmentScheduler treatment={result?.treatment} />
        <WeatherRiskPanel disease={result?.disease} severity={result?.severity} />
        <SafetyModePanel />
      </section>

      <footer>
        <p>Built for practical, field-ready crop diagnosis.</p>
      </footer>
    </div>
  );
}

export default App;
