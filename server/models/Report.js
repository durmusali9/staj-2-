import mongoose from 'mongoose';

const dosyaSchema = new mongoose.Schema({
    dosyaAdi: String,
    dosyaYolu: String,
    dosyaTipi: String,
}, { _id: false });

const yorumSchema = new mongoose.Schema({
    danismanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    yorum: {
        type: String,
        required: true
    },
    tarih: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const aiAnalizSchema = new mongoose.Schema({
    ozet: String,
    eksikler: [String],
    oneriler: [String],
    puan: Number,
    yazimHatalari: [String],
    // HATA BURADAYDI: Bu alanın bir string dizisi olması gerekiyor.
    teknikAnaliz: [String]
}, { _id: false });

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    baslik: {
        type: String,
        required: [true, 'Rapor başlığı zorunludur.'],
        trim: true
    },
    icerik: {
        bugunNeYaptin: { type: String, default: '' },
        karsilasilanProblem: { type: String, default: '' },
        nasilCozdun: { type: String, default: '' },
        yarinPlani: { type: String, default: '' }
    },
    durum: {
        type: String,
        enum: ['taslak', 'beklemede', 'onaylandi', 'duzeltme'],
        default: 'taslak'
    },
    tarih: {
        type: Date,
        default: Date.now
    },
    aiAnaliz: aiAnalizSchema,
    dosyalar: [dosyaSchema],
    danismanYorumlari: [yorumSchema]
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

const Report = mongoose.model('Report', reportSchema);

export default Report;