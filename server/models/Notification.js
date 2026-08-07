import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mesaj: {
    type: String,
    required: true
  },
  tip: {
    type: String,
    enum: ['onay', 'duzeltme', 'yorum', 'ai_analiz'],
    default: 'ai_analiz'
  },
  okundu: {
    type: Boolean,
    default: false
  },
  raporId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
