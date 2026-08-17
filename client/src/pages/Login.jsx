import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, sifre);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mesaj || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card glass-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Staj Rapor</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Yönetim Sistemine Hoş Geldiniz</p>
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
              placeholder="ornek@ogrenci.edu.tr"
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

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Hesabınız yok mu? <Link to="/register" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>Kayıt Ol</Link> 
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Öğrenci: <strong>ogrenci@test.com</strong> / <strong>123456</strong><br/>
            Danışman: <strong>danisman@test.com</strong> / <strong>123456</strong><br/>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
