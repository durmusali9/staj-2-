import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Route imports
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import advisorRoutes from './routes/advisor.js';
import notificationRoutes from './routes/notifications.js';
import statRoutes from './routes/stats.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

// ES module path fix
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Frontend port
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/admin', adminRoutes);

// Seed Route (Demo amaçlı kullanıcı oluşturma)
app.post('/api/seed', async(req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
        const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
        console.log(`Seed: Attempting to create/update admin user with email: ${adminEmail} and password: ${adminPassword ? '*****' : 'UNDEFINED'}`);

        if (!adminPassword) {
            return res.status(500).json({ mesaj: 'ADMIN_DEFAULT_PASSWORD .env dosyasında tanımlanmamış.' });
        }

        const existingStudent = await User.findOne({ email: 'ogrenci@test.com' });
        if (!existingStudent) {
            await User.create({
                isim: 'Ahmet Yılmaz',
                email: 'ogrenci@test.com',
                sifre: '123456',
                rol: 'ogrenci'
            });
        }

        const existingAdvisor = await User.findOne({ email: 'danisman@test.com' });
        if (!existingAdvisor) {
            await User.create({
                isim: 'Prof. Dr. Mehmet Kaya',
                email: 'danisman@test.com',
                sifre: '123456',
                rol: 'danisman'
            });
        }

        // Admin kullanıcısını her zaman .env dosyasındaki güncel bilgilerle yeniden oluştur.
        // Bu, şifre uyuşmazlığı sorunlarını kökten çözer.
        // Önce varsa mevcut admini sil.
        await User.deleteOne({ email: adminEmail });
        // Sonra .env'deki bilgilerle yeniden oluştur.
        await User.create({
            isim: 'Admin User',
            email: adminEmail,
            sifre: adminPassword, // pre-save hook'u şifreyi hash'leyecektir.
            rol: 'admin'
        });

        res.json({ mesaj: 'Demo kullanıcıları başarıyla oluşturuldu/güncellendi.' });
    } catch (error) {
        console.error('Seed hatası:', error);
        res.status(500).json({ mesaj: 'Sunucu hatası oluştu' });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});