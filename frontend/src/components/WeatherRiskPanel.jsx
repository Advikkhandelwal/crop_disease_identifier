import React, { useMemo, useState } from 'react';
import './FeaturePanels.css';

const fungalKeywords = ['blight', 'mold', 'mildew', 'rust', 'spot', 'rot'];

const WeatherRiskPanel = ({ disease, severity }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const analyzeRisk = useMemo(() => {
    if (!weather) return null;

    const humidity = Number(weather.current.relative_humidity_2m || 0);
    const rainProb = Number(weather.hourlyMaxRainProbability || 0);
    const isFungalDisease = fungalKeywords.some((word) =>
      (disease || '').toLowerCase().includes(word)
    );

    let score = 0;
    if (humidity >= 80) score += 2;
    if (rainProb >= 60) score += 2;
    if ((severity || '').toLowerCase() === 'high') score += 1;
    if (isFungalDisease) score += 1;

    const level = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
    const warnings = [];
    if (humidity >= 80) warnings.push('High humidity can accelerate disease spread.');
    if (rainProb >= 60) warnings.push('Rain risk is high. Avoid spraying right before rain.');
    if ((severity || '').toLowerCase() === 'high') warnings.push('Current severity is high, inspect nearby plants today.');
    if (isFungalDisease) warnings.push('Detected disease pattern looks moisture-sensitive.');
    if (warnings.length === 0) warnings.push('No immediate weather-driven risk spike detected.');

    return { level, warnings };
  }, [weather, disease, severity]);

  const fetchWeatherByCoordinates = async (latitude, longitude) => {
    setLoading(true);
    setError('');
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        '&hourly=relative_humidity_2m,precipitation_probability' +
        '&current=temperature_2m,relative_humidity_2m' +
        '&forecast_days=2&timezone=auto';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather service unavailable');
      const data = await response.json();

      const next12Hours = (data.hourly?.precipitation_probability || []).slice(0, 12);
      const hourlyMaxRainProbability = next12Hours.length > 0 ? Math.max(...next12Hours) : 0;
      setWeather({ ...data, hourlyMaxRainProbability });
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsingCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
      },
      () => setError('Location permission denied. Enter latitude/longitude manually.')
    );
  };

  const fetchManual = () => {
    if (!lat || !lon) return;
    fetchWeatherByCoordinates(lat, lon);
  };

  return (
    <div className="feature-card glass-panel">
      <div className="feature-header">
        <h3>Weather-aware Disease Warnings</h3>
      </div>

      <div className="weather-controls">
        <button className="action-btn" onClick={fetchUsingCurrentLocation} disabled={loading}>
          {loading ? 'Checking...' : 'Use Current Location'}
        </button>
        <div className="coord-row">
          <input
            className="field-input"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
          <input
            className="field-input"
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
          />
          <button className="mini-btn" onClick={fetchManual} disabled={loading}>
            Check
          </button>
        </div>
      </div>

      {error && <p className="feature-error">{error}</p>}

      {!weather ? (
        <p className="feature-empty">Fetch weather to estimate short-term disease flare risk.</p>
      ) : (
        <div className="weather-summary">
          <p>
            Current temperature: <strong>{weather.current?.temperature_2m ?? '-'}°C</strong>
          </p>
          <p>
            Current humidity: <strong>{weather.current?.relative_humidity_2m ?? '-'}%</strong>
          </p>
          <p>
            Max rain probability (next 12h): <strong>{weather.hourlyMaxRainProbability ?? 0}%</strong>
          </p>
          {analyzeRisk && (
            <>
              <p className={`risk-pill risk-${analyzeRisk.level}`}>Risk level: {analyzeRisk.level}</p>
              <ul className="risk-list">
                {analyzeRisk.warnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherRiskPanel;
