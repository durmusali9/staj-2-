import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async(req, res) => {
    const { email, sifre } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(sifre))) {
            const token = generateToken(user._id);
            user.sifre = undefined;
            res.json({ token, user });
        } else {
            res.status(401).json({ mesaj: 'Hatalı email veya şifre' });
        }
    } catch (error) {
        res.status(500).json({ mesaj: 'Sunucu hatası: ' + error.message });
    }
});

// @route   POST /api/auth/admin-login
// @desc    Authenticate ADMIN user & get token
// @access  Public
router.post('/admin-login', async(req, res) => {
    const { email, sifre } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(sifre))) {
            return res.status(401).json({ mesaj: 'Hatalı email veya şifre' });
        }

        if (user.rol !== 'admin') {
            return res.status(403).json({ mesaj: 'Bu alana sadece admin yetkisine sahip kullanıcılar giriş yapabilir.' });
        }

        const token = generateToken(user._id);
        user.sifre = undefined;
        res.json({ token, user });

    } catch (error) {
        res.status(500).json({ mesaj: 'Sunucu hatası: ' + error.message });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async(req, res) => {
    const { isim, email, sifre, rol } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ mesaj: 'Bu email adresi zaten kullanılıyor' });
        }
        const user = await User.create({ isim, email, sifre, rol });
        const token = generateToken(user._id);
        user.sifre = undefined;
        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ mesaj: 'Kullanıcı oluşturulamadı: ' + error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user data
// @access  Private
router.get('/me', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-sifre');
        res.json(user);
    } catch (error) {
        res.status(500).json({ mesaj: 'Sunucu hatası: ' + error.message });
    }
});

export default router;