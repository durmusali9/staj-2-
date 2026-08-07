import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { reportAPI } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { HiDocumentDownload, HiDocumentText } from 'react-icons/hi';

const PDFExport = () => {
  const { user } = useContext(AuthContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await reportAPI.getAll();
        setReports(res.data);
      } catch (err) {
        console.error('Raporlar yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const approvedReports = reports.filter(r => r.durum === 'onaylandi');
  const allReports = reports;

  const generatePDF = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const doc = new jsPDF();
      
      // === KAPAK SAYFASI ===
      doc.setFontSize(28);
      doc.setTextColor(99, 102, 241);
      doc.text("STAJ RAPORU", 105, 60, null, null, "center");
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Staj Defteri", 105, 75, null, null, "center");
      
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.5);
      doc.line(40, 85, 170, 85);
      
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text(`Ad Soyad: ${user?.isim || 'Belirtilmemis'}`, 105, 110, null, null, "center");
      doc.text(`E-posta: ${user?.email || 'Belirtilmemis'}`, 105, 122, null, null, "center");
      doc.text(`Toplam Rapor: ${allReports.length}`, 105, 134, null, null, "center");
      doc.text(`Onaylanan: ${approvedReports.length}`, 105, 146, null, null, "center");
      
      const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text(`Olusturma Tarihi: ${today}`, 105, 180, null, null, "center");
      
      // === GUNLUK RAPORLAR ===
      doc.addPage();
      doc.setFontSize(20);
      doc.setTextColor(50, 50, 50);
      doc.text("Gunluk Raporlar", 20, 20);
      
      if (allReports.length > 0) {
        const tableData = allReports.map((r, i) => [
          String(i + 1),
          new Date(r.tarih).toLocaleDateString('tr-TR'),
          (r.baslik || '').substring(0, 30),
          (r.icerik?.bugunNeYaptin || '').substring(0, 50) + '...',
          r.durum === 'onaylandi' ? 'Onaylandi' : r.durum === 'beklemede' ? 'Beklemede' : r.durum === 'duzeltme' ? 'Duzeltme' : 'Taslak'
        ]);
        
        doc.autoTable({
          startY: 30,
          head: [['#', 'Tarih', 'Baslik', 'Ozet', 'Durum']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241], fontSize: 10 },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 28 },
            2: { cellWidth: 40 },
            3: { cellWidth: 70 },
            4: { cellWidth: 25 }
          }
        });
      } else {
        doc.setFontSize(12);
        doc.text("Henuz rapor bulunmamaktadir.", 20, 40);
      }
      
      // === DETAYLI RAPORLAR ===
      allReports.forEach((r, i) => {
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(99, 102, 241);
        doc.text(`Rapor ${i + 1}: ${(r.baslik || '').substring(0, 50)}`, 20, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Tarih: ${new Date(r.tarih).toLocaleDateString('tr-TR')}`, 20, 28);
        
        let yPos = 40;
        
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text("Bugun Ne Yaptin:", 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        const lines1 = doc.splitTextToSize(r.icerik?.bugunNeYaptin || 'Belirtilmemis', 170);
        doc.text(lines1, 20, yPos);
        yPos += lines1.length * 5 + 10;
        
        if (r.icerik?.karsilasilanProblem) {
          doc.setFontSize(12);
          doc.text("Karsilasilan Problem:", 20, yPos);
          yPos += 8;
          doc.setFontSize(10);
          const lines2 = doc.splitTextToSize(r.icerik.karsilasilanProblem, 170);
          doc.text(lines2, 20, yPos);
          yPos += lines2.length * 5 + 10;
        }
        
        if (r.icerik?.nasilCozdun) {
          doc.setFontSize(12);
          doc.text("Nasil Cozdun:", 20, yPos);
          yPos += 8;
          doc.setFontSize(10);
          const lines3 = doc.splitTextToSize(r.icerik.nasilCozdun, 170);
          doc.text(lines3, 20, yPos);
          yPos += lines3.length * 5 + 10;
        }
        
        // AI Ozeti
        if (r.aiAnaliz?.ozet) {
          yPos += 5;
          doc.setFontSize(12);
          doc.setTextColor(99, 102, 241);
          doc.text(`AI Ozeti (Puan: ${r.aiAnaliz.puan || '-'}/100):`, 20, yPos);
          yPos += 8;
          doc.setFontSize(10);
          doc.setTextColor(50, 50, 50);
          const linesAi = doc.splitTextToSize(r.aiAnaliz.ozet, 170);
          doc.text(linesAi, 20, yPos);
        }
        
        // Danisman Yorumlari
        if (r.danismanYorumlari?.length > 0) {
          yPos += 15;
          doc.setFontSize(12);
          doc.setTextColor(139, 92, 246);
          doc.text("Danisman Yorumlari:", 20, yPos);
          r.danismanYorumlari.forEach(y => {
            yPos += 8;
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            const yLines = doc.splitTextToSize(`- ${y.yorum}`, 170);
            doc.text(yLines, 20, yPos);
            yPos += yLines.length * 5;
          });
        }
      });
      
      doc.save(`Staj_Raporu_${user?.isim?.replace(/\s/g, '_') || 'ogrenci'}.pdf`);
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem' }}>PDF Oluştur</h1>
        <p>Tüm staj sürecinizi tek bir PDF belgesi olarak dışa aktarın.</p>
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', color: '#8b5cf6' }}>
          <HiDocumentText size={50} />
        </div>
        
        <h2 style={{ marginBottom: '1rem' }}>Resmi Staj Raporu Çıktısı</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          Bu işlem, kapak sayfası, öğrenci bilgileri, tüm günlük raporlarınız, AI özetleri ve danışman değerlendirmelerini içeren bir PDF belgesi oluşturacaktır.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '400px', margin: '0 auto 2rem auto', textAlign: 'left', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--success-color)' }}>✓</span> Kapak Sayfası</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--success-color)' }}>✓</span> Öğrenci Bilgileri</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--success-color)' }}>✓</span> Günlük Raporlar ({allReports.length})</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--success-color)' }}>✓</span> AI Özetleri</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--success-color)' }}>✓</span> Danışman Yorumları</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--success-color)' }}>✓</span> Onaylananlar ({approvedReports.length})</div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Raporlar yükleniyor...</p>
        ) : allReports.length === 0 ? (
          <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--warning-color)', marginBottom: '1rem' }}>
            Henüz rapor yok. PDF oluşturmak için önce rapor yazmalısınız.
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} 
            onClick={generatePDF}
            disabled={isGenerating}
          >
            <HiDocumentDownload size={24} /> {isGenerating ? 'PDF Oluşturuluyor...' : `PDF İndir (${allReports.length} Rapor)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default PDFExport;
