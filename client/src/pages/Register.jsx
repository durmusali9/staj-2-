import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    isim: '',
    email: '',
    sifre: '',
    sifreTekrar: '',
    rol: 'ogrenci'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.sifre !== formData.sifreTekrar) {
      return setError('Şifreler eşleşmiyor');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await register({
        isim: formData.isim,
        email: formData.email,
        sifre: formData.sifre,
        rol: formData.rol
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mesaj || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card glass-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Kayıt Ol</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sisteme katılmak için bilgilerinizi girin</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">İsim Soyisim</label>
            <input name="isim" type="text" className="form-input" value={formData.isim} onChange={handleChange} required placeholder="Adınız Soyadınız" />
          </div>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} required placeholder="ornek@ogrenci.edu.tr" />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Şifre</label>
              <input name="sifre" type="password" className="form-input" value={formData.sifre} onChange={handleChange} required placeholder="••••••••" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Şifre Tekrar</label>
              <input name="sifreTekrar" type="password" className="form-input" value={formData.sifreTekrar} onChange={handleChange} required placeholder="••••••••" />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Rolünüz</label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="radio" name="rol" value="ogrenci" checked={formData.rol === 'ogrenci'} onChange={handleChange} style={{ accentColor: '#8b5cf6' }} /> Öğrenci
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="radio" name="rol" value="danisman" checked={formData.rol === 'danisman'} onChange={handleChange} style={{ accentColor: '#8b5cf6' }} /> Danışman
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Zaten hesabınız var mı? <Link to="/" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
