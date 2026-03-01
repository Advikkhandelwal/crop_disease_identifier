import React from 'react';
import './ResultCard.css';

const ResultCard = ({ result, onReset }) => {
  if (!result) return null;

  const {
    disease,
    severity,
    confidence,
    treatment,
    affectedCrops,
    prevention,
    nextSteps,
  } = result;

  const normalizedConfidence = Number.isFinite(Number(confidence))
    ? Math.max(0, Math.min(100, Number(confidence)))
    : 0;

  const getSeverityClass = (value) => {
    switch (value?.toLowerCase()) {
      case 'high':
        return 'sev-high';
      case 'medium':
        return 'sev-medium';
      case 'low':
        return 'sev-low';
      default:
        return 'sev-unknown';
    }
  };

  const steps = Array.isArray(nextSteps) && nextSteps.length > 0
    ? nextSteps
    : [
        'Isolate affected plants early to avoid spread.',
        'Apply recommended treatment based on severity.',
        'Monitor nearby leaves for similar symptoms.',
      ];

  return (
    <div className="result-card glass-panel">
      <div className="result-header">
        <div className="title-group">
          <span className="label">Diagnosis</span>
          <h2 className="disease-name">{disease || 'Unknown Condition'}</h2>
        </div>
        <div className={`severity-badge ${getSeverityClass(severity)}`}>
          {(severity || 'Unknown')} severity
        </div>
      </div>

      <div className="confidence-section">
        <div className="section-header">
          <label>Confidence</label>
          <span className="percentage">{normalizedConfidence.toFixed(1)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${normalizedConfidence}%` }}></div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-section">
          <h4>Affected crops</h4>
          <p>{affectedCrops || 'Various vegetable and fruit crops'}</p>
        </div>

        <div className="info-section">
          <h4>Prevention</h4>
          <p>{prevention || 'Maintain proper irrigation and improve airflow between plants.'}</p>
        </div>
      </div>

      <div className="treatment-card">
        <h4>Recommended treatment</h4>
        <p className="treatment-text">{treatment || 'No treatment recommendation was returned.'}</p>
      </div>

      <div className="next-steps">
        <h4>Suggested next steps</h4>
        <ul className="steps-list">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </div>

      <button className="reset-btn" onClick={onReset}>
        Diagnose Another Leaf
      </button>
    </div>
  );
};

export default ResultCard;
