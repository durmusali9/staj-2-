import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { advisorAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { HiDocumentText, HiCheckCircle, HiExclamationCircle, HiEye } from 'react-icons/hi';

const AdvisorPanel = () => {
  const [activeTab, setActiveTab] = useState('bekleyen');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await advisorAPI.getReports();
        setReports(res.data);
      } catch (err) {
        console.error('Raporlar yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => 
    (activeTab === 'bekleyen' && r.durum === 'beklemede') ||
    (activeTab === 'onaylanan' && r.durum === 'onaylandi') ||
    (activeTab === 'duzeltme' && r.durum === 'duzeltme')
  );

  const counts = {
    bekleyen: reports.filter(r => r.durum === 'beklemede').length,
    onaylanan: reports.filter(r => r.durum === 'onaylandi').length,
    duzeltme: reports.filter(r => r.durum === 'duzeltme').length,
  };

  const durumLabel = { beklemede: 'Beklemede', onaylandi: 'Onaylandı', duzeltme: 'Düzeltme' };

  const tabStyle = (tab, color) => ({
    flex: 1,
    background: activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
    border: 'none',
    padding: '1rem',
    color: activeTab === tab ? color : 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    borderBottom: activeTab === tab ? `2px solid ${color}` : '2px solid transparent',
    transition: 'var(--transition-normal)'
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Danışman Paneli</h1>
        <p>Öğrencilerinizin staj raporlarını inceleyin ve değerlendirin.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Bekleyen Raporlar" value={counts.bekleyen} icon={HiExclamationCircle} />
        <StatCard title="Onaylanan Raporlar" value={counts.onaylanan} icon={HiCheckCircle} />
        <StatCard title="Düzeltme İstenen" value={counts.duzeltme} icon={HiDocumentText} />
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button style={tabStyle('bekleyen', '#8b5cf6')} onClick={() => setActiveTab('bekleyen')}>
            Bekleyen ({counts.bekleyen})
          </button>
          <button style={tabStyle('onaylanan', 'var(--success-color)')} onClick={() => setActiveTab('onaylanan')}>
            Onaylanan ({counts.onaylanan})
          </button>
          <button style={tabStyle('duzeltme', 'var(--error-color)')} onClick={() => setActiveTab('duzeltme')}>
            Düzeltme ({counts.duzeltme})
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Raporlar yükleniyor...
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Öğrenci</th>
                  <th>Başlık</th>
                  <th>Tarih</th>
                  <th>AI Puanı</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => {
                  const aiScore = report.aiAnaliz?.puan || 0;
                  return (
                    <tr key={report._id}>
                      <td style={{ fontWeight: 500 }}>{report.userId?.isim || 'Bilinmiyor'}</td>
                      <td>{report.baslik}</td>
                      <td>{new Date(report.tarih).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <span style={{ 
                          color: aiScore >= 80 ? 'var(--success-color)' : aiScore >= 50 ? 'var(--warning-color)' : 'var(--error-color)',
                          fontWeight: 'bold'
                        }}>
                          {aiScore}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${report.durum}`}>{durumLabel[report.durum] || report.durum}</span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate(`/rapor/${report._id}`)}>
                          <HiEye /> İncele
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Bu kategoride rapor bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorPanel;
