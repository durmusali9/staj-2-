import express from 'express';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import { auth, roleCheck } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.use(roleCheck('danisman'));

// @route   GET /api/advisor/reports
// @desc    Danışmanın görebileceği raporları getir
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({
      durum: { $in: ['beklemede', 'onaylandi', 'duzeltme'] }
    })
      .sort({ tarih: -1 })
      .populate('userId', 'isim email');

    res.json(reports);
  } catch (error) {
    res.status(500).json({ mesaj: 'Raporlar getirilemedi: ' + error.message });
  }
});

// @route   POST /api/advisor/reports/:id/approve
// @desc    Raporu onayla
router.post('/reports/:id/approve', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
    }

    report.durum = 'onaylandi';
    await report.save();

    await Notification.create({
      userId: report.userId,
      mesaj: `Raporunuz ("${report.baslik}") onaylandı.`,
      tip: 'onay',
      raporId: report._id
    });

    res.json({ mesaj: 'Rapor onaylandı', report });
  } catch (error) {
    res.status(500).json({ mesaj: 'Rapor onaylanamadı: ' + error.message });
  }
});

// @route   POST /api/advisor/reports/:id/revise
// @desc    Düzeltme iste
router.post('/reports/:id/revise', async (req, res) => {
  try {
    const { mesaj } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
    }

    report.durum = 'duzeltme';
    await report.save();

    await Notification.create({
      userId: report.userId,
      mesaj: `Raporunuz ("${report.baslik}") için düzeltme istendi: ${mesaj || 'Lütfen raporunuzu gözden geçirin.'}`,
      tip: 'duzeltme',
      raporId: report._id
    });

    res.json({ mesaj: 'Düzeltme isteği gönderildi', report });
  } catch (error) {
    res.status(500).json({ mesaj: 'Düzeltme isteği gönderilemedi: ' + error.message });
  }
});

// @route   POST /api/advisor/reports/:id/comment
// @desc    Rapora yorum ekle
router.post('/reports/:id/comment', async (req, res) => {
  try {
    const { yorum } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
    }

    report.danismanYorumlari.push({
      danismanId: req.user._id,
      yorum
    });

    await report.save();

    await Notification.create({
      userId: report.userId,
      mesaj: `Raporunuza ("${report.baslik}") yeni bir yorum yapıldı.`,
      tip: 'yorum',
      raporId: report._id
    });

    res.json({ mesaj: 'Yorum eklendi', report });
  } catch (error) {
    res.status(500).json({ mesaj: 'Yorum eklenemedi: ' + error.message });
  }
});

export default router;
