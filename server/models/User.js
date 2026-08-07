import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  isim: {
    type: String,
    required: [true, 'Lütfen bir isim girin']
  },
  email: {
    type: String,
    required: [true, 'Lütfen bir email adresi girin'],
    unique: true,
    lowercase: true
  },
  sifre: {
    type: String,
    required: [true, 'Lütfen bir şifre girin']
  },
  rol: {
    type: String,
    enum: ['ogrenci', 'danisman'],
    default: 'ogrenci'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Şifreyi kaydetmeden önce hashleme işlemi
userSchema.pre('save', async function (next) {
  if (!this.isModified('sifre')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.sifre = await bcrypt.hash(this.sifre, salt);
  next();
});

// Girilen şifre ile veritabanındaki hashlenmiş şifreyi karşılaştırma
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.sifre);
};

const User = mongoose.model('User', userSchema);

export default User;
