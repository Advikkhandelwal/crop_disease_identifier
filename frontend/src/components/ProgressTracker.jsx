import React, { useEffect, useMemo, useState } from 'react';
import './FeaturePanels.css';

const STORAGE_KEY = 'cropscope_progress_history_v1';

const severityScore = {
  low: 1,
  medium: 2,
  high: 3,
};

const readHistory = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const ProgressTracker = ({ latestEntry }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  useEffect(() => {
    if (!latestEntry?.id) return;

    setHistory((prev) => {
      if (prev.some((entry) => entry.id === latestEntry.id)) return prev;
      const next = [latestEntry, ...prev].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [latestEntry]);

  const trend = useMemo(() => {
    if (!latestEntry?.disease) return null;
    const sameDisease = history.filter((item) => item.disease === latestEntry.disease);
    if (sameDisease.length < 2) return null;

    const [current, previous] = sameDisease;
    const currentScore = severityScore[(current.severity || '').toLowerCase()] || 0;
    const previousScore = severityScore[(previous.severity || '').toLowerCase()] || 0;

    if (currentScore < previousScore) return 'improving';
    if (currentScore > previousScore) return 'worsening';

    const confidenceChange = Number(current.confidence || 0) - Number(previous.confidence || 0);
    if (confidenceChange > 5) return 'possibly worsening';
    if (confidenceChange < -5) return 'possibly improving';
    return 'stable';
  }, [history, latestEntry]);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return (
    <div className="feature-card glass-panel">
      <div className="feature-header">
        <h3>Disease Progress Tracker</h3>
        <button className="mini-btn" onClick={clearHistory} disabled={history.length === 0}>
          Clear
        </button>
      </div>

      {trend && <p className={`trend-pill trend-${trend.replace(/\s+/g, '-')}`}>Trend: {trend}</p>}

      {history.length === 0 ? (
        <p className="feature-empty">Run diagnosis regularly to compare severity over days.</p>
      ) : (
        <div className="history-list">
          {history.slice(0, 6).map((entry) => (
            <article className="history-item" key={entry.id}>
              {entry.thumbnail && <img src={entry.thumbnail} alt="Leaf record" className="history-thumb" />}
              <div>
                <h4>{entry.disease || 'Unknown condition'}</h4>
                <p>{new Date(entry.capturedAt).toLocaleString()}</p>
                <p>
                  Severity: <strong>{entry.severity || 'Unknown'}</strong> | Confidence:{' '}
                  <strong>{Number(entry.confidence || 0).toFixed(1)}%</strong>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
