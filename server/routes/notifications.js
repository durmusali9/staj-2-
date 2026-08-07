import express from 'express';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// @route   GET /api/notifications
// @desc    Tüm bildirimleri getir
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ mesaj: 'Bildirimler getirilemedi: ' + error.message });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Okunmamış bildirim sayısını getir
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user._id, 
      okundu: false 
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ mesaj: 'Okunmamış bildirim sayısı getirilemedi: ' + error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Bildirimi okundu olarak işaretle
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { okundu: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ mesaj: 'Bildirim bulunamadı' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ mesaj: 'Bildirim güncellenemedi: ' + error.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Tüm bildirimleri okundu olarak işaretle
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, okundu: false },
      { okundu: true }
    );

    res.json({ mesaj: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error) {
    res.status(500).json({ mesaj: 'Bildirimler güncellenemedi: ' + error.message });
  }
});

export default router;
