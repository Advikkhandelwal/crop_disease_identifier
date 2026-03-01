import React, { useMemo, useState } from 'react';
import './FeaturePanels.css';

const chemicalRules = {
  'Neem Oil': { maxDose: 5, unit: 'ml/L' },
  'Copper Oxychloride': { maxDose: 3, unit: 'g/L' },
  Sulfur: { maxDose: 2, unit: 'g/L' },
  Imidacloprid: { maxDose: 0.5, unit: 'ml/L' },
};

const incompatiblePairs = [
  ['Neem Oil', 'Sulfur'],
  ['Copper Oxychloride', 'Sulfur'],
  ['Imidacloprid', 'Neem Oil'],
];

const SafetyModePanel = () => {
  const [chemicalA, setChemicalA] = useState('Neem Oil');
  const [chemicalB, setChemicalB] = useState('Copper Oxychloride');
  const [doseA, setDoseA] = useState('');
  const [doseB, setDoseB] = useState('');

  const safetyChecks = useMemo(() => {
    const warnings = [];

    const aRule = chemicalRules[chemicalA];
    const bRule = chemicalRules[chemicalB];
    const aDose = Number(doseA || 0);
    const bDose = Number(doseB || 0);

    if (aDose > 0 && aRule && aDose > aRule.maxDose) {
      warnings.push(`${chemicalA} exceeds safe dose (${aRule.maxDose} ${aRule.unit}).`);
    }

    if (bDose > 0 && bRule && bDose > bRule.maxDose) {
      warnings.push(`${chemicalB} exceeds safe dose (${bRule.maxDose} ${bRule.unit}).`);
    }

    const pairKey = [chemicalA, chemicalB].sort().join('|');
    const blocked = incompatiblePairs.some((pair) => pair.sort().join('|') === pairKey);
    if (blocked) {
      warnings.push(`${chemicalA} and ${chemicalB} should not be mixed in one tank.`);
    }

    if (warnings.length === 0) {
      warnings.push('No immediate mix conflict detected. Always confirm product label before spraying.');
    }

    return warnings;
  }, [chemicalA, chemicalB, doseA, doseB]);

  return (
    <div className="feature-card glass-panel">
      <div className="feature-header">
        <h3>Safety Mode: Dosage & Mix Alerts</h3>
      </div>

      <div className="safety-grid">
        <div className="safety-input-group">
          <label>Chemical A</label>
          <select className="field-input" value={chemicalA} onChange={(e) => setChemicalA(e.target.value)}>
            {Object.keys(chemicalRules).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            className="field-input"
            value={doseA}
            onChange={(e) => setDoseA(e.target.value)}
            placeholder={`Dose (${chemicalRules[chemicalA].unit})`}
            type="number"
            min="0"
            step="0.1"
          />
        </div>

        <div className="safety-input-group">
          <label>Chemical B</label>
          <select className="field-input" value={chemicalB} onChange={(e) => setChemicalB(e.target.value)}>
            {Object.keys(chemicalRules).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            className="field-input"
            value={doseB}
            onChange={(e) => setDoseB(e.target.value)}
            placeholder={`Dose (${chemicalRules[chemicalB].unit})`}
            type="number"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <ul className="risk-list">
        {safetyChecks.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
};

export default SafetyModePanel;
