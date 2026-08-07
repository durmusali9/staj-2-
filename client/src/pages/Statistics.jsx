import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Statistics = () => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [techStats, setTechStats] = useState([]);
  const [aiDistribution, setAiDistribution] = useState([]);
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [weeklyRes, techRes, aiRes, overviewRes] = await Promise.all([
          statsAPI.getWeekly().catch(() => ({ data: [] })),
          statsAPI.getTechnologies().catch(() => ({ data: [] })),
          statsAPI.getAiDistribution().catch(() => ({ data: [] })),
          statsAPI.getOverview().catch(() => ({ data: {} }))
        ]);
        setWeeklyStats(weeklyRes.data);
        setTechStats(techRes.data);
        setAiDistribution(aiRes.data);
        setOverview(overviewRes.data);
      } catch (err) {
        console.error('İstatistik yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const weeklyLabels = weeklyStats.length > 0 
    ? weeklyStats.map(w => w.hafta || w.label || `Hafta ${w._id}`) 
    : ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'];
  const weeklyValues = weeklyStats.length > 0 
    ? weeklyStats.map(w => w.sayi || w.count || 0)
    : [0, 0, 0, 0];

  const weeklyData = {
    labels: weeklyLabels,
    datasets: [{
      label: 'Rapor Sayısı',
      data: weeklyValues,
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const techLabels = techStats.length > 0 ? techStats.map(t => t.name) : ['Veri Yok'];
  const techValues = techStats.length > 0 ? techStats.map(t => t.count) : [1];

  const techData = {
    labels: techLabels,
    datasets: [{
      label: 'Kullanım',
      data: techValues,
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(100, 116, 139, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const aiLabels = aiDistribution.length > 0 ? aiDistribution.map(a => a.name) : ['Eksik Bilgi', 'Yazım Hatası'];
  const aiValues = aiDistribution.length > 0 ? aiDistribution.map(a => a.count) : [0, 0];

  const aiData = {
    labels: aiLabels,
    datasets: [{
      data: aiValues,
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const onayOrani = overview.totalReports > 0 
    ? Math.round((overview.approvedReports / overview.totalReports) * 100) 
    : 0;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e2e8f0', font: { family: 'Inter' } } }
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#e2e8f0', padding: 20, font: { family: 'Inter' } } }
    },
    cutout: '70%'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>İstatistikler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>İstatistikler</h1>
        <p>Staj dönemi boyunca tutulan istatistiksel veriler.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>📊 Haftalık Rapor Sayısı</h3>
          <Bar data={weeklyData} options={chartOptions} />
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>💻 En Çok Kullanılan Teknolojiler</h3>
          <div style={{ width: '65%', margin: '0 auto' }}>
            <Doughnut data={techData} options={doughnutOptions} />
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>🤖 AI Öneri Dağılımı</h3>
          <div style={{ width: '65%', margin: '0 auto' }}>
            <Doughnut data={aiData} options={doughnutOptions} />
          </div>
        </div>
        
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>✅ Genel Onay Oranı</h3>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <Doughnut 
              data={{
                labels: ['Onaylandı', 'Diğer'],
                datasets: [{ data: [onayOrani, 100 - onayOrani], backgroundColor: ['#10b981', 'rgba(255,255,255,0.05)'], borderWidth: 0 }]
              }} 
              options={{ ...doughnutOptions, plugins: { legend: { display: false } } }} 
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>%{onayOrani}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Onay Oranı</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {overview.approvedReports || 0} / {overview.totalReports || 0} rapor onaylandı
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
