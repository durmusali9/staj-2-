import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { reportAPI, advisorAPI } from '../services/api';
import AIFeedback from '../components/AIFeedback';
import { HiArrowLeft, HiDownload, HiCheck, HiX, HiPencil, HiChat } from 'react-icons/hi';

const ReportView = () => {
  const { id } = useParams();
  const { isDanisman, isOgrenci } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await reportAPI.getOne(id);
        setReport(res.data);
      } catch (err) {
        showToast('Rapor yüklenemedi', 'duzeltme');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await advisorAPI.approve(id);
      showToast('Rapor başarıyla onaylandı!', 'onay');
      navigate('/danisman');
    } catch (err) {
      showToast('Onaylama hatası', 'duzeltme');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevise = async () => {
    if (!comment.trim()) {
      showToast('Lütfen düzeltme için bir yorum yazın', 'duzeltme');
      return;
    }
    setActionLoading(true);
    try {
      await advisorAPI.revise(id, comment);
      showToast('Düzeltme talebi gönderildi', 'yorum');
      navigate('/danisman');
    } catch (err) {
      showToast('Düzeltme gönderme hatası', 'duzeltme');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setActionLoading(true);
    try {
      await advisorAPI.comment(id, comment);
      showToast('Yorum eklendi', 'yorum');
      setComment('');
      // Reload report to see new comment
      const res = await reportAPI.getOne(id);
      setReport(res.data);
    } catch (err) {
      showToast('Yorum ekleme hatası', 'duzeltme');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="animate-pulse" style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--primary-gradient)', margin: '0 auto 1rem' }}></div>
        <p>Rapor yükleniyor...</p>
      </div>
    );
  }

  if (!report) return <div>Rapor bulunamadı.</div>;

  const durum = report.durum;
  const durumLabel = { taslak: 'Taslak', beklemede: 'Beklemede', onaylandi: 'Onaylandı', duzeltme: 'Düzeltme İsteniyor' };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn" style={{ background: 'transparent', padding: 0, marginBottom: '1.5rem', color: 'var(--text-secondary)' }} onClick={() => navigate(-1)}>
        <HiArrowLeft /> Geri Dön
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Sol: Rapor İçeriği */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{report.baslik}</h1>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {new Date(report.tarih).toLocaleString('tr-TR')}
                  {report.userId?.isim && ` • ${report.userId.isim}`}
                </div>
              </div>
              <span className={`badge badge-${durum}`}>{durumLabel[durum] || durum}</span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bugün Ne Yaptın?</h4>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{report.icerik?.bugunNeYaptin || '—'}</p>
            </div>

            {report.icerik?.karsilasilanProblem && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Karşılaşılan Problem</h4>
                <p style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--error-color)', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap' }}>
                  {report.icerik.karsilasilanProblem}
                </p>
              </div>
            )}

            {report.icerik?.nasilCozdun && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Çözüm</h4>
                <p style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid var(--success-color)', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap' }}>
                  {report.icerik.nasilCozdun}
                </p>
              </div>
            )}

            {report.icerik?.yarinPlani && (
              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Yarın Ne Yapacaksın?</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{report.icerik.yarinPlani}</p>
              </div>
            )}
          </div>

          {/* Dosyalar */}
          {report.dosyalar?.length > 0 && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}>Ekler ({report.dosyalar.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {report.dosyalar.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.9rem' }}>{f.dosyaAdi}</span>
                    <a href={`/api/${f.dosyaYolu}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                      <HiDownload /> İndir
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danışman Yorumları */}
          {report.danismanYorumlari?.length > 0 && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}>Danışman Yorumları</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {report.danismanYorumlari.map((y, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.05)', borderLeft: '3px solid #8b5cf6', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{y.danismanId?.isim || 'Danışman'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{y.tarih && new Date(y.tarih).toLocaleString('tr-TR')}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{y.yorum}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Düzeltme modu — öğrenci için */}
          {isOgrenci && durum === 'duzeltme' && (
            <div className="glass-card" style={{ borderTop: '4px solid var(--warning-color)' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Düzeltme İsteniyor</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Danışmanınız bu rapor için düzeltme talep etti. Lütfen raporu düzenleyin.</p>
              <button className="btn btn-primary" onClick={() => navigate(`/rapor-yaz/${id}`)}>
                <HiPencil size={18} /> Raporu Düzenle
              </button>
            </div>
          )}
        </div>

        {/* Sağ: AI + Danışman Paneli */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Danışman işlemleri */}
          {isDanisman && durum === 'beklemede' && (
            <div className="glass-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <h3 style={{ marginBottom: '1rem' }}>Danışman Değerlendirmesi</h3>
              <textarea 
                className="form-textarea" 
                placeholder="Yorum veya düzeltme açıklaması yazın..." 
                value={comment} 
                onChange={e => setComment(e.target.value)}
                style={{ marginBottom: '1rem', minHeight: '100px' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <button className="btn" style={{ background: 'var(--success-color)', color: 'white' }} onClick={handleApprove} disabled={actionLoading}>
                  <HiCheck size={18} /> Raporu Onayla
                </button>
                <button className="btn btn-danger" onClick={handleRevise} disabled={actionLoading}>
                  <HiX size={18} /> Düzeltme İste
                </button>
                <button className="btn btn-secondary" onClick={handleComment} disabled={actionLoading}>
                  <HiChat size={18} /> Sadece Yorum Ekle
                </button>
              </div>
            </div>
          )}

          {/* AI Feedback */}
          {report.aiAnaliz && (
            <AIFeedback feedback={report.aiAnaliz} />
          )}

          {/* Onay durumu */}
          {durum === 'onaylandi' && (
            <div className="glass-card" style={{ textAlign: 'center', borderTop: '4px solid var(--success-color)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <h3 style={{ color: 'var(--success-color)' }}>Onaylandı</h3>
              <p style={{ fontSize: '0.9rem' }}>Bu rapor danışman tarafından onaylanmıştır.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
