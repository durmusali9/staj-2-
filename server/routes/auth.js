import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Token oluşturma yardımcı fonksiyonu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Yeni kullanıcı kaydı
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { isim, email, sifre, rol } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ mesaj: 'Bu email adresi zaten kullanılıyor' });
    }

    const user = await User.create({
      isim,
      email,
      sifre,
      rol
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        isim: user.isim,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ mesaj: 'Geçersiz kullanıcı verisi' });
    }
  } catch (error) {
    res.status(500).json({ mesaj: 'Sunucu hatası: ' + error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Kullanıcı girişi
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, sifre } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(sifre))) {
      res.json({
        _id: user._id,
        isim: user.isim,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ mesaj: 'Geçersiz email veya şifre' });
    }
  } catch (error) {
    res.status(500).json({ mesaj: 'Sunucu hatası: ' + error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Geçerli kullanıcı bilgilerini getir
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-sifre');
    res.json(user);
  } catch (error) {
    res.status(500).json({ mesaj: 'Sunucu hatası: ' + error.message });
  }
});

export default router;
