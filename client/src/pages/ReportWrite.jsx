import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';
import { reportAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import AIFeedback from '../components/AIFeedback';
import { HiLightningBolt, HiSave, HiPaperAirplane } from 'react-icons/hi';

const ReportWrite = () => {
  const { id } = useParams(); // Düzenleme modu için
  const [formData, setFormData] = useState({
    baslik: '',
    bugunNeYaptin: '',
    karsilasilanProblem: '',
    nasilCozdun: '',
    yarinPlani: ''
  });
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [reportId, setReportId] = useState(id || null);
  
  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  // Düzenleme modunda mevcut raporu yükle
  useEffect(() => {
    if (id) {
      const loadReport = async () => {
        try {
          const res = await reportAPI.getOne(id);
          const report = res.data;
          setFormData({
            baslik: report.baslik || '',
            bugunNeYaptin: report.icerik?.bugunNeYaptin || '',
            karsilasilanProblem: report.icerik?.karsilasilanProblem || '',
            nasilCozdun: report.icerik?.nasilCozdun || '',
            yarinPlani: report.icerik?.yarinPlani || ''
          });
          if (report.aiAnaliz?.puan) {
            setAiFeedback(report.aiAnaliz);
          }
        } catch (err) {
          showToast('Rapor yüklenemedi', 'duzeltme');
        }
      };
      loadReport();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildReportPayload = () => ({
    baslik: formData.baslik,
    icerik: {
      bugunNeYaptin: formData.bugunNeYaptin,
      karsilasilanProblem: formData.karsilasilanProblem,
      nasilCozdun: formData.nasilCozdun,
      yarinPlani: formData.yarinPlani
    }
  });

  const validateForm = (isDraft = false) => {
    if (!formData.baslik.trim()) {
      showToast('Rapor Başlığı boş bırakılamaz.', 'duzeltme');
      return false;
    }
    // AI analizi veya gönderim için "Bugün ne yaptın?" alanı zorunlu
    if (!isDraft && !formData.bugunNeYaptin.trim()) {
      showToast('Bugün ne yaptığınızı açıklamalısınız.', 'duzeltme');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateForm(true)) { // Taslak kaydederken sadece başlık zorunlu
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...buildReportPayload(), durum: 'taslak' };
      
      if (reportId) {
        await reportAPI.update(reportId, payload);
      } else {
        const res = await reportAPI.create(payload);
        setReportId(res.data._id);
      }
      showToast('Taslak olarak kaydedildi', 'onay');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.mesaj || 'Kaydetme hatası', 'duzeltme');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!validateForm()) { // AI analizi için başlık ve bugün ne yaptın zorunlu
      return;
    }

    setIsAnalyzing(true);
    try {
      const payload = buildReportPayload();
      let res;
      
      if (reportId) {
        res = await reportAPI.update(reportId, payload);
      } else {
        res = await reportAPI.create(payload);
        setReportId(res.data._id);
      }

      setAiFeedback(res.data.aiAnaliz);
      showToast('AI analizi tamamlandı!', 'ai_analiz');
    } catch (err) {
      showToast(err.response?.data?.mesaj || 'AI analiz hatası', 'duzeltme');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadFiles = async (currentReportId) => {
    if (files.length === 0) return;
    
    const formDataUpload = new FormData();
    files.forEach(file => {
      formDataUpload.append('dosyalar', file);
    });
    
    try {
      await reportAPI.uploadFiles(currentReportId, formDataUpload);
    } catch (err) {
      console.error('Dosya yükleme hatası:', err);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) { // Göndermeden önce de formun geçerli olduğundan emin olalım
      return;
    }

    try {
      const targetId = reportId;
      if (!targetId) {
        showToast('Önce raporu kaydedin', 'duzeltme');
        return;
      }

      // Dosyaları yükle
      if (files.length > 0) {
        await handleUploadFiles(targetId);
      }

      // Danışmana gönder
      await reportAPI.submit(targetId);
      showToast('Rapor başarıyla danışmana gönderildi!', 'onay');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.mesaj || 'Gönderim hatası', 'duzeltme');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>{id ? 'Raporu Düzenle' : 'Yeni Rapor Yaz'}</h1>
        <p>Günlük staj çalışmalarını detaylı bir şekilde raporla.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <form onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Rapor Başlığı *</label>
            <input name="baslik" className="form-input" value={formData.baslik} onChange={handleChange} placeholder="Örn: Frontend Auth Mimarisi Kurulumu" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Bugün ne yaptın? *</label>
            <textarea name="bugunNeYaptin" className="form-textarea" value={formData.bugunNeYaptin} onChange={handleChange} placeholder="Bugün yapılan çalışmaları detaylıca açıklayın. Hangi teknolojileri kullandınız, hangi fonksiyonları yazdınız..." style={{ minHeight: '150px' }} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Karşılaştığın problem</label>
            <textarea name="karsilasilanProblem" className="form-textarea" style={{ minHeight: '100px' }} value={formData.karsilasilanProblem} onChange={handleChange} placeholder="Geliştirme sırasında karşılaşılan zorluklar, hatalar..." />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nasıl çözdün?</label>
            <textarea name="nasilCozdun" className="form-textarea" style={{ minHeight: '100px' }} value={formData.nasilCozdun} onChange={handleChange} placeholder="Problemi çözerken izlenen yöntemler, başvurulan kaynaklar..." />
          </div>
          
          <div className="form-group">
            <label className="form-label">Yarın ne yapacaksın?</label>
            <textarea name="yarinPlani" className="form-textarea" style={{ minHeight: '80px' }} value={formData.yarinPlani} onChange={handleChange} placeholder="Yarın için planlanan çalışmalar..." />
          </div>

          <div className="form-group">
            <label className="form-label">Ekler (Kod, Ekran Görüntüsü, PDF vs.)</label>
            <FileUpload files={files} setFiles={setFiles} />
          </div>

          {!aiFeedback && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={isSaving}>
                <HiSave size={18} /> {isSaving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </button>
              <button className="btn btn-primary" onClick={handleAnalyze} disabled={isAnalyzing} style={{ flex: 1 }}>
                <HiLightningBolt size={18} /> {isAnalyzing ? 'AI Raporunuzu Analiz Ediyor...' : 'Kaydet ve AI Analiz Et'}
              </button>
            </div>
          )}
        </form>

        {isAnalyzing && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="animate-pulse" style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-gradient)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiLightningBolt size={28} color="white" />
            </div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>AI raporunuzu analiz ediyor...</p>
            <p style={{ fontSize: '0.85rem' }}>Yazım hataları, teknik içerik, eksikler kontrol ediliyor</p>
          </div>
        )}

        {aiFeedback && !isAnalyzing && (
          <div style={{ marginTop: '2rem' }}>
            <AIFeedback feedback={aiFeedback} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setAiFeedback(null)}>
                Raporu Düzenle
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} style={{ flex: 1 }}>
                <HiPaperAirplane size={18} /> Danışmana Gönder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportWrite;
