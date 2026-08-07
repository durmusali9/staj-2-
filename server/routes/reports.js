import express from 'express';
import multer from 'multer';
import path from 'path';
import Report from '../models/Report.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { analyzeReport } from '../services/geminiService.js';

const router = express.Router();

// Multer konfigürasyonu
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        // PDF, Word, Görsel ve kod dosyalarına izin ver
        const filetypes = /jpeg|jpg|png|pdf|doc|docx|js|py|java|c|cpp|cs|html|css/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Desteklenmeyen dosya formatı'));
        }
    }
});

// Tüm route'lar için auth middleware'i
router.use(auth);

// @route   POST /api/reports
// @desc    Yeni rapor oluştur
router.post('/', async(req, res) => {
    try {
        // Gelen isteğin ve kullanıcının geçerliliğini kontrol et
        if (!req.user || !req.user._id) {
            console.error("POST /api/reports Yetkilendirme Hatası: req.user bulunamadı.");
            return res.status(401).json({ mesaj: 'Yetkilendirme hatası: Oturum açmış kullanıcı bulunamadı.' });
        }
        if (!req.body || !req.body.icerik) {
            console.error("POST /api/reports İstek Hatası: req.body.icerik bulunamadı.", req.body);
            return res.status(400).json({ mesaj: 'Geçersiz istek: Rapor içeriği (icerik) alanı eksik.' });
        }

        const reportData = req.body;

        const report = new Report({
            ...reportData,
            userId: req.user._id
        });

        // Önceki raporları getir
        const previousReports = await Report.find({ userId: req.user._id })
            .sort({ tarih: -1 })
            .limit(3);

        // AI analizi
        const aiResults = await analyzeReport(report, previousReports);
        report.aiAnaliz = aiResults;

        await report.save();

        // Kullanıcıya bildirim oluştur
        await Notification.create({
            userId: req.user._id,
            mesaj: 'Raporunuz başarıyla oluşturuldu ve AI tarafından analiz edildi.',
            tip: 'ai_analiz',
            raporId: report._id
        });

        res.status(201).json(report);
    } catch (error) {
        console.error("POST /api/reports - Beklenmedik Hata:", error);
        res.status(500).json({ mesaj: 'Sunucu hatası: Rapor oluşturulamadı. Lütfen sunucu loglarını kontrol edin.' });
    }
});

// @route   GET /api/reports
// @desc    Tüm raporları getir
router.get('/', async(req, res) => {
    try {
        const { durum, page = 1, limit = 10 } = req.query;
        let query = {};

        if (req.user.rol === 'ogrenci') {
            query.userId = req.user._id;
        }

        if (durum) {
            query.durum = durum;
        }

        const reports = await Report.find(query)
            .sort({ tarih: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('userId', 'isim email');

        res.json(reports);
    } catch (error) {
        res.status(500).json({ mesaj: 'Raporlar getirilemedi: ' + error.message });
    }
});

// @route   GET /api/reports/:id
// @desc    Tekil rapor getir
router.get('/:id', async(req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('userId', 'isim email')
            .populate('danismanYorumlari.danismanId', 'isim');

        if (!report) {
            return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
        }

        // Yetki kontrolü (öğrenci sadece kendi raporunu görebilir)
        if (req.user.rol === 'ogrenci' && report.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ mesaj: 'Bu raporu görüntüleme yetkiniz yok' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ mesaj: 'Rapor getirilemedi: ' + error.message });
    }
});

// @route   PUT /api/reports/:id
// @desc    Raporu güncelle
router.put('/:id', async(req, res) => {
    try {
        if (!req.body || !req.body.icerik) {
            console.error(`PUT /api/reports/${req.params.id} İstek Hatası: req.body.icerik bulunamadı.`, req.body);
            return res.status(400).json({ mesaj: 'Geçersiz istek: Rapor içeriği (icerik) alanı eksik.' });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
        }

        if (report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ mesaj: 'Bu raporu güncelleme yetkiniz yok' });
        }

        Object.assign(report, req.body);

        // AI analizini tekrar çalıştır
        const previousReports = await Report.find({
                userId: req.user._id,
                _id: { $ne: report._id }
            })
            .sort({ tarih: -1 })
            .limit(3);

        const aiResults = await analyzeReport(report, previousReports);
        report.aiAnaliz = aiResults;

        await report.save();
        res.json(report);
    } catch (error) {
        console.error(`PUT /api/reports/${req.params.id} - Beklenmedik Hata:`, error);
        res.status(500).json({ mesaj: 'Sunucu hatası: Rapor güncellenemedi. Lütfen sunucu loglarını kontrol edin.' });
    }
});

// @route   POST /api/reports/:id/submit
// @desc    Raporu danışmana gönder
router.post('/:id/submit', async(req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
        }

        if (report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ mesaj: 'Bu raporu gönderme yetkiniz yok' });
        }

        report.durum = 'beklemede';
        await report.save();

        // Tüm danışmanlara bildirim gönder (veya öğrencinin kendi danışmanına, basitlik için tümüne)
        const danismanlar = await User.find({ rol: 'danisman' });

        const bildirimler = danismanlar.map(d => ({
            userId: d._id,
            mesaj: `${req.user.isim} isimli öğrenci yeni bir rapor gönderdi: ${report.baslik}`,
            tip: 'ai_analiz', // Danışman için genel tip kullanılabilir
            raporId: report._id
        }));

        await Notification.insertMany(bildirimler);

        res.json({ mesaj: 'Rapor başarıyla danışmana gönderildi', report });
    } catch (error) {
        res.status(500).json({ mesaj: 'Rapor gönderilemedi: ' + error.message });
    }
});

// @route   POST /api/reports/:id/upload
// @desc    Rapora dosya yükle
router.post('/:id/upload', upload.array('dosyalar', 5), async(req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
        }

        if (report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ mesaj: 'Bu rapora dosya yükleme yetkiniz yok' });
        }

        const yeniDosyalar = req.files.map(file => ({
            dosyaAdi: file.originalname,
            dosyaYolu: file.path,
            dosyaTipi: file.mimetype
        }));

        report.dosyalar.push(...yeniDosyalar);
        await report.save();

        res.json({ mesaj: 'Dosyalar başarıyla yüklendi', dosyalar: report.dosyalar });
    } catch (error) {
        res.status(500).json({ mesaj: 'Dosya yükleme hatası: ' + error.message });
    }
});

// @route   POST /api/reports/:id/reanalyze
// @desc    Mevcut raporu yeniden analiz et
router.post('/:id/reanalyze', async(req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ mesaj: 'Rapor bulunamadı' });
        }

        const previousReports = await Report.find({
                userId: report.userId,
                _id: { $ne: report._id }
            })
            .sort({ tarih: -1 })
            .limit(3);

        const aiResults = await analyzeReport(report, previousReports);
        report.aiAnaliz = aiResults;
        await report.save();

        res.json({ mesaj: 'Yeniden analiz tamamlandı', aiAnaliz: report.aiAnaliz });
    } catch (error) {
        res.status(500).json({ mesaj: 'Analiz hatası: ' + error.message });
    }
});

export default router;