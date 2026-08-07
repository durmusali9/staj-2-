import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reportAPI, statsAPI } from '../services/api';
import StatCard from '../components/StatCard';
import ReportCard from '../components/ReportCard';
import Calendar from '../components/Calendar';
import { HiDocumentText, HiCheckCircle, HiClock, HiChartBar, HiPlus } from 'react-icons/hi';

const Dashboard = () => {
  const { user, isOgrenci } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, approvedReports: 0, pendingReports: 0, avgAiScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, statsRes] = await Promise.all([
          reportAPI.getAll().catch(err => { console.error("Raporlar yüklenemedi:", err); return { data: [] }; }),
          statsAPI.getOverview().catch(err => { console.error("Genel istatistikler yüklenemedi:", err); return { data: { totalReports: 0, approvedReports: 0, pendingReports: 0, avgAiScore: 0 } }; })
        ]);
        setReports(reportsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Dashboard veri yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Son AI önerilerini raporlardan çıkar
  const latestAiSuggestions = reports
    .filter(r => r.aiAnaliz?.oneriler?.length > 0)
    .slice(0, 3)
    .flatMap(r => r.aiAnaliz.oneriler.slice(0, 1).map(o => ({ rapor: r.baslik, oneri: o })));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Hoş geldin, <span className="gradient-text">{user?.isim?.split(' ')[0]}</span>! 👋</h1>
          <p>İşte staj raporlarının genel durumu.</p>
        </div>
        {isOgrenci && (
          <button className="btn btn-primary" onClick={() => navigate('/rapor-yaz')}>
            <HiPlus size={20} /> Yeni Rapor Yaz
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Toplam Rapor" value={stats.totalReports} icon={HiDocumentText} />
        <StatCard title="Onaylanan Raporlar" value={stats.approvedReports} icon={HiCheckCircle} />
        <StatCard title="Bekleyen Raporlar" value={stats.pendingReports} icon={HiClock} />
        <StatCard title="Ort. AI Puanı" value={stats.avgAiScore} icon={HiChartBar} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Son Raporlar</h2>
          </div>
          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Raporlar yükleniyor...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Henüz rapor yok</p>
              {isOgrenci && (
                <button className="btn btn-primary" onClick={() => navigate('/rapor-yaz')}>
                  <HiPlus size={18} /> İlk Raporunu Yaz
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.slice(0, 5).map(report => <ReportCard key={report._id} report={report} />)}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Calendar reports={reports} />
          
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#8b5cf6' }}>✨</span> Son AI Önerileri
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {latestAiSuggestions.length > 0 ? latestAiSuggestions.map((item, i) => (
                <div key={i} style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #3b82f6' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{item.rapor}</div>
                  {item.oneri}
                </div>
              )) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Henüz AI önerisi yok. Rapor yazdığınızda burada görünecek.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
