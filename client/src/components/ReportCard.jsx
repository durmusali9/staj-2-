import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportCard = ({ report }) => {
  const navigate = useNavigate();
  const aiScore = report.aiAnaliz?.puan || report.aiScore || 0;
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'taslak': return <span className="badge badge-taslak">Taslak</span>;
      case 'beklemede': return <span className="badge badge-beklemede">Beklemede</span>;
      case 'onaylandi': return <span className="badge badge-onaylandi">Onaylandı</span>;
      case 'duzeltme': return <span className="badge badge-duzeltme">Düzeltme İsteniyor</span>;
      default: return null;
    }
  };

  const aiScoreColor = aiScore >= 80 ? 'var(--success-color)' : aiScore >= 50 ? 'var(--warning-color)' : 'var(--error-color)';
  const contentPreview = report.icerik?.bugunNeYaptin || report.bugunNeYaptin || '';

  return (
    <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/rapor/${report._id || report.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>{report.baslik || 'İsimsiz Rapor'}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {new Date(report.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {report.userId?.isim && <span> · {report.userId.isim}</span>}
          </div>
        </div>
        {getStatusBadge(report.durum)}
      </div>
      
      {contentPreview && (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
          {contentPreview}
        </p>
      )}
      
      {aiScore > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>AI Puanı</span>
          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${aiScore}%`, background: aiScoreColor, transition: 'width 1s ease' }}></div>
          </div>
          <span style={{ color: aiScoreColor, fontWeight: 'bold', minWidth: '28px', textAlign: 'right' }}>{aiScore}</span>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
