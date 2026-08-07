import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { HiBell } from 'react-icons/hi';
import { NotificationContext } from '../context/NotificationContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <HiBell size={24} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--error-color)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{user?.isim || 'Kullanıcı'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.rol === 'ogrenci' ? 'Öğrenci' : 'Danışman'}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {user?.isim?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <main className="animate-fade-in" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
