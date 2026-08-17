import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Admin'e özel login endpoint'ini çağırıyoruz.
      // Bu endpoint, sadece rolü 'admin' olanların girişine izin verir.
      const res = await authAPI.adminLogin({ email, sifre });
      
      // Token'ı manuel olarak saklayıp sayfayı yönlendiriyoruz.
      // AuthProvider, sayfa yenilendiğinde bu token'ı okuyup kullanıcıyı doğrulayacaktır.
      localStorage.setItem('token', res.data.token);
      
      // `navigate` yerine `window.location.href` kullanarak tam sayfa yenilemesi sağlıyoruz.
      // Bu, AuthContext'in en güncel durumu almasını garantiler.
      window.location.href = '/admin/panel';
    } catch (err) {
      const errorMessage = err.response?.data?.mesaj || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card glass-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Girişi</h1>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input 
              type="password" 
              className="form-input" 
              value={sifre} 
              onChange={e => setSifre(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;