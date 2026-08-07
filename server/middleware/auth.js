import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ mesaj: 'Lütfen giriş yapın, yetkiniz yok' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-sifre');
    
    if (!req.user) {
      return res.status(401).json({ mesaj: 'Böyle bir kullanıcı bulunamadı' });
    }

    next();
  } catch (error) {
    res.status(401).json({ mesaj: 'Token geçersiz veya süresi dolmuş' });
  }
};

export const roleCheck = (rol) => {
  return (req, res, next) => {
    if (req.user && req.user.rol === rol) {
      next();
    } else {
      res.status(403).json({ mesaj: `Bu işlem için yetkiniz yok. Gerekli rol: ${rol}` });
    }
  };
};
