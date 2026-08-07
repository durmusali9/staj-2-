import React from 'react';
import { HiExclamationCircle, HiLightningBolt, HiCheckCircle, HiTerminal } from 'react-icons/hi';

const AIFeedback = ({ feedback }) => {
  if (!feedback) return null;

  const scoreColor = feedback.puan >= 80 ? 'var(--success-color)' : feedback.puan >= 50 ? 'var(--warning-color)' : 'var(--error-color)';

  return (
    <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', borderTop: `4px solid ${scoreColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>AI Analiz Raporu</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rapor Puanı</span>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: scoreColor, border: `2px solid ${scoreColor}` }}>
            {feedback.puan}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {/* Özet */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <HiCheckCircle color="var(--success-color)" /> Özet
          </h4>
          <p style={{ fontSize: '0.9rem' }}>{feedback.ozet}</p>
        </div>

        {/* Eksikler */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning-color)' }}>
            <HiExclamationCircle /> Eksikler
          </h4>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {feedback.eksikler?.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>

        {/* Öneriler */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
            <HiLightningBolt /> Öneriler
          </h4>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {feedback.oneriler?.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>

        {/* Teknik Analiz */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
            <HiTerminal /> Teknik Analiz
          </h4>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {feedback.teknikAnaliz?.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIFeedback;
