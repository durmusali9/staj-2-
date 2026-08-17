import React, { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { HiBell, HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiCheck } from 'react-icons/hi';
import { NotificationContext } from '../context/NotificationContext';

// Zaman formatlama yardımcı fonksiyonu
const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay < 7) return `${diffDay} gün önce`;
  return date.toLocaleDateString('tr-TR');
};

// Bildirim tipi ikonları
const getNotificationIcon = (tip) => {
  switch (tip) {
    case 'onay':
      return <HiCheckCircle style={{ color: '#22c55e', fontSize: '1.4rem', flexShrink: 0 }} />;
    case 'duzeltme':
      return <HiExclamationCircle style={{ color: '#f97316', fontSize: '1.4rem', flexShrink: 0 }} />;
    case 'yorum':
      return <HiInformationCircle style={{ color: '#3b82f6', fontSize: '1.4rem', flexShrink: 0 }} />;
    case 'ai_analiz':
    default:
      return <HiInformationCircle style={{ color: '#a855f7', fontSize: '1.4rem', flexShrink: 0 }} />;
  }
};

// Bildirim tipi etiketleri
const getTipLabel = (tip) => {
  switch (tip) {
    case 'onay': return 'Onay';
    case 'duzeltme': return 'Düzeltme';
    case 'yorum': return 'Yorum';
    case 'ai_analiz': return 'AI Analiz';
    default: return 'Bildirim';
  }
};

const Layout = () => {
  const { user } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  // Dışarı tıklandığında dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowDropdown(prev => !prev);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.okundu) {
      await markAsRead(notification._id);
    }
    if (notification.raporId) {
      navigate(`/rapor/${notification.raporId}`);
      setShowDropdown(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          {/* Bildirim Zili */}
          <div ref={bellRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={handleBellClick}>
            <HiBell
              size={24}
              color={showDropdown ? '#8b5cf6' : 'var(--text-secondary)'}
              style={{ transition: 'color 0.2s ease' }}
            />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                color: 'white', borderRadius: '50%',
                width: 20, height: 20, fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface-color)',
                animation: 'pulse-badge 2s infinite',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Bildirim Dropdown Paneli */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '60px',
                right: '1.5rem',
                width: '400px',
                maxHeight: '500px',
                background: 'var(--surface-color)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md, 12px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                zIndex: 9998,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'dropdownFadeIn 0.2s ease-out',
              }}
            >
              {/* Dropdown Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
                  Bildirimler
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(139, 92, 246, 0.15)', color: '#a855f7',
                      padding: '2px 8px', borderRadius: '99px',
                    }}>
                      {unreadCount} yeni
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'transparent', border: 'none',
                      color: '#8b5cf6', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '4px 8px', borderRadius: '6px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <HiCheck size={14} /> Tümünü okundu işaretle
                  </button>
                )}
              </div>

              {/* Bildirim Listesi */}
              <div style={{
                flex: 1, overflowY: 'auto', maxHeight: '420px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
              }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '3rem 1.5rem', textAlign: 'center',
                    color: 'var(--text-muted, #666)',
                  }}>
                    <HiBell size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Henüz bildirim yok</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                        padding: '0.9rem 1.25rem',
                        cursor: n.raporId ? 'pointer' : 'default',
                        background: n.okundu ? 'transparent' : 'rgba(139, 92, 246, 0.04)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s ease',
                        borderLeft: n.okundu ? '3px solid transparent' : '3px solid #8b5cf6',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = n.okundu ? 'transparent' : 'rgba(139, 92, 246, 0.04)';
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {getNotificationIcon(n.tip)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 600,
                            color: n.tip === 'onay' ? '#22c55e' : n.tip === 'duzeltme' ? '#f97316' : n.tip === 'yorum' ? '#3b82f6' : '#a855f7',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>
                            {getTipLabel(n.tip)}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #666)', whiteSpace: 'nowrap' }}>
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p style={{
                          margin: 0, fontSize: '0.85rem', lineHeight: 1.5,
                          color: n.okundu ? 'var(--text-muted, #888)' : 'var(--text-primary, #fff)',
                          fontWeight: n.okundu ? 400 : 500,
                        }}>
                          {n.mesaj}
                        </p>
                      </div>
                      {!n.okundu && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: '#8b5cf6', flexShrink: 0, marginTop: '6px',
                        }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Kullanıcı Bilgisi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{user?.isim || 'Kullanıcı'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {{'ogrenci': 'Öğrenci', 'danisman': 'Danışman', 'admin': 'Admin'}[user?.rol] || 'Kullanıcı'}
              </div>
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

      {/* Bildirim paneli animasyonları */}
      <style>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Layout;
