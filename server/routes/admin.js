import express from 'express';
import User from '../models/User.js';
import Report from '../models/Report.js';
import { auth, roleCheck } from '../middleware/auth.js';
import crypto from 'crypto'; // Rastgele şifre oluşturmak için

const router = express.Router();

// Tüm admin route'ları için auth ve rol kontrolü
router.use(auth);
router.use(roleCheck('admin'));

// @route   GET /api/admin/users
// @desc    Tüm kullanıcıları listele
// @access  Admin
router.get('/users', async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const users = await User.find().select('-sifre').sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalUsers = await User.countDocuments();

        res.json({
            users,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers
        });
    } catch (error) {
        res.status(500).json({ mesaj: 'Kullanıcılar getirilemedi: ' + error.message });
    }
});

// @route   GET /api/admin/stats
// @desc    Genel sistem istatistiklerini getir
// @access  Admin
router.get('/stats', async(req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ durum: 'beklemede' });
        const approvedReports = await Report.countDocuments({ durum: 'onaylandi' });
        const totalStudents = await User.countDocuments({ rol: 'ogrenci' });
        const totalAdvisors = await User.countDocuments({ rol: 'danisman' });

        res.json({
            totalReports,
            pendingReports,
            approvedReports,
            totalStudents,
            totalAdvisors,
        });
    } catch (error) {
        res.status(500).json({ mesaj: 'İstatistikler getirilemedi: ' + error.message });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Bir kullanıcıyı sil
// @access  Admin
router.delete('/users/:id', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ mesaj: 'Kullanıcı bulunamadı' });
        }

        // Admin kendini silemez
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ mesaj: 'Admin kendi hesabını silemez.' });
        }

        // Kullanıcıya ait raporları da sil
        await Report.deleteMany({ userId: user._id });

        await user.deleteOne();

        res.json({ mesaj: 'Kullanıcı ve raporları başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Kullanıcı silinemedi: ' + error.message });
    }
});

// @route   POST /api/admin/users/:id/reset-password
// @desc    Kullanıcının şifresini sıfırla
// @access  Admin
router.post('/users/:id/reset-password', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ mesaj: 'Kullanıcı bulunamadı' });
        }

        // Güvenli, rastgele bir şifre oluştur
        const newPassword = crypto.randomBytes(8).toString('hex');

        user.sifre = newPassword;
        await user.save(); // 'pre-save' hook şifreyi hash'leyecektir

        // Not: Gerçek bir uygulamada bu şifre kullanıcıya e-posta ile gönderilmelidir.
        // Bu projede e-posta servisi olmadığı için, yeni şifreyi yanıt olarak dönüyoruz.
        res.json({
            mesaj: `${user.isim} adlı kullanıcının şifresi başarıyla sıfırlandı.`,
            yeniSifre: newPassword // Sadece geliştirme ortamında gösterilmeli
        });
    } catch (error) {
        res.status(500).json({ mesaj: 'Şifre sıfırlanamadı: ' + error.message });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Kullanıcı bilgilerini güncelle (rol, isim vb.)
// @access  Admin
router.put('/users/:id', async(req, res) => {
    try {
        const { isim, email, rol } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ mesaj: 'Kullanıcı bulunamadı' });
        }

        // Admin kendi rolünü değiştiremez
        if (user._id.toString() === req.user._id.toString() && rol !== 'admin') {
            return res.status(400).json({ mesaj: 'Admin kendi rolünü değiştiremez.' });
        }

        user.isim = isim || user.isim;
        user.email = email || user.email;
        user.rol = rol || user.rol;

        const updatedUser = await user.save();
        updatedUser.sifre = undefined; // Şifreyi yanıtta gönderme

        res.json(updatedUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ mesaj: 'Bu email adresi zaten kullanılıyor.' });
        }
        res.status(500).json({ mesaj: 'Kullanıcı güncellenemedi: ' + error.message });
    }
});

export default router;