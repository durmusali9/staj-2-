import express from 'express';
import Report from '../models/Report.js';
import { auth, roleCheck } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// @route   GET /api/stats/overview
// @desc    Genel istatistikleri getir
router.get('/overview', async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.rol === 'ogrenci') {
      matchQuery.userId = req.user._id;
    }

    const totalReports = await Report.countDocuments(matchQuery);
    const approvedReports = await Report.countDocuments({ ...matchQuery, durum: 'onaylandi' });
    const pendingReports = await Report.countDocuments({ ...matchQuery, durum: 'beklemede' });
    const revisionReports = await Report.countDocuments({ ...matchQuery, durum: 'duzeltme' });

    // Ortalama AI Puanı
    const reportsWithScore = await Report.find({ ...matchQuery, 'aiAnaliz.puan': { $exists: true } });
    let totalScore = 0;
    let avgAiScore = 0;
    
    if (reportsWithScore.length > 0) {
      totalScore = reportsWithScore.reduce((acc, curr) => acc + (curr.aiAnaliz.puan || 0), 0);
      avgAiScore = Math.round(totalScore / reportsWithScore.length);
    }

    res.json({
      totalReports,
      approvedReports,
      pendingReports,
      revisionReports,
      avgAiScore
    });
  } catch (error) {
    res.status(500).json({ mesaj: 'İstatistikler getirilemedi: ' + error.message });
  }
});

// @route   GET /api/stats/weekly
// @desc    Son 8 haftanın rapor sayılarını getir
router.get('/weekly', async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.rol === 'ogrenci') {
      matchQuery.userId = req.user._id;
    }

    // Basit bir gruplama örneği (gerçek uygulamada daha karmaşık tarih işlemleri gerekebilir)
    // Son 8 haftayı simüle etmek için MongoDB aggregation kullanılabilir
    
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    matchQuery.tarih = { $gte: eightWeeksAgo };

    const weeklyData = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { 
            yil: { $year: '$tarih' }, 
            hafta: { $week: '$tarih' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.yil': 1, '_id.hafta': 1 } }
    ]);

    const formattedData = weeklyData.map(d => ({
      hafta: `Hafta ${d._id.hafta} (${d._id.yil})`,
      sayi: d.count
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ mesaj: 'Haftalık veriler getirilemedi: ' + error.message });
  }
});

// @route   GET /api/stats/technologies
// @desc    Raporlarda en çok geçen teknolojileri getir
router.get('/technologies', async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.rol === 'ogrenci') {
      matchQuery.userId = req.user._id;
    }

    const reports = await Report.find(matchQuery).select('icerik');
    
    // Basit bir kelime arama (gerçekte NLP veya regex kullanılabilir)
    const techKeywords = ['react', 'node', 'express', 'mongodb', 'python', 'java', 'c#', 'javascript', 'html', 'css', 'sql', 'git', 'docker', 'api'];
    
    const techCounts = {};
    techKeywords.forEach(tech => techCounts[tech] = 0);

    reports.forEach(report => {
      const allText = `
        ${report.icerik?.bugunNeYaptin || ''} 
        ${report.icerik?.karsilasilanProblem || ''} 
        ${report.icerik?.nasilCozdun || ''} 
        ${report.icerik?.yarinPlani || ''}
      `.toLowerCase();

      techKeywords.forEach(tech => {
        // Kelime olarak geçip geçmediğini kontrol etmek için basit regex (sınırları belirli)
        const regex = new RegExp(`\\b${tech}\\b`, 'g');
        const matches = allText.match(regex);
        if (matches) {
          techCounts[tech] += matches.length;
        }
      });
    });

    const result = Object.entries(techCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // İlk 10

    res.json(result);
  } catch (error) {
    res.status(500).json({ mesaj: 'Teknoloji istatistikleri getirilemedi: ' + error.message });
  }
});

// @route   GET /api/stats/ai-distribution
// @desc    AI önerilerinin kategorilere göre dağılımını getir
router.get('/ai-distribution', async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.rol === 'ogrenci') {
      matchQuery.userId = req.user._id;
    }

    // Basit simülasyon. Gerçekte AI analizi sonuçlarından çıkarım yapılabilir.
    const reports = await Report.find(matchQuery).select('aiAnaliz');
    
    let eksikBilgiCount = 0;
    let yazimHatasiCount = 0;
    let teknikEksikCount = 0;
    let kodEksigiCount = 0;

    reports.forEach(report => {
      if (!report.aiAnaliz) return;
      
      const { eksikler = [], yazimHatalari = [], oneriler = [] } = report.aiAnaliz;
      
      yazimHatasiCount += yazimHatalari.length;
      eksikBilgiCount += eksikler.length;
      
      const onerilerText = oneriler.join(' ').toLowerCase();
      if (onerilerText.includes('teknik')) teknikEksikCount++;
      if (onerilerText.includes('kod') || onerilerText.includes('ekran görüntü')) kodEksigiCount++;
    });

    const data = [
      { name: 'Eksik Bilgi', count: eksikBilgiCount },
      { name: 'Yazım Hatası', count: yazimHatasiCount },
      { name: 'Teknik Detay Eksikliği', count: teknikEksikCount },
      { name: 'Kod/Görsel Eksikliği', count: kodEksigiCount }
    ].filter(d => d.count > 0);

    // Eğer hiç veri yoksa dummy veri dönülebilir veya boş
    res.json(data.length > 0 ? data : [
      { name: 'Eksik Bilgi', count: 1 },
      { name: 'Yazım Hatası', count: 1 }
    ]);
  } catch (error) {
    res.status(500).json({ mesaj: 'AI dağılımı getirilemedi: ' + error.message });
  }
});

export default router;
