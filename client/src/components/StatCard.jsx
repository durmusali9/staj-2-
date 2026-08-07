import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid transparent', borderImage: 'var(--primary-gradient) 1', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</div>
        {trend && (
          <div style={{ fontSize: '0.75rem', color: trend > 0 ? 'var(--success-color)' : 'var(--error-color)', marginTop: '0.25rem' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% geçen haftaya göre
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
