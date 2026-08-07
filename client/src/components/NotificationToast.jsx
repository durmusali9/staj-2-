import { useEffect, useState } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX } from 'react-icons/hi';

const iconMap = {
  onay: <HiCheckCircle style={{ color: 'var(--success-color)', fontSize: '1.4rem' }} />,
  duzeltme: <HiExclamationCircle style={{ color: 'var(--error-color)', fontSize: '1.4rem' }} />,
  yorum: <HiInformationCircle style={{ color: '#3b82f6', fontSize: '1.4rem' }} />,
  ai_analiz: <HiInformationCircle style={{ color: '#a855f7', fontSize: '1.4rem' }} />,
};

function SingleToast({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(toast.id), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`toast-item ${exiting ? 'toast-exit' : 'animate-slide-in'}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '0.75rem',
        maxWidth: '380px',
        position: 'relative',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {iconMap[toast.tip] || iconMap.ai_analiz}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
          {toast.mesaj}
        </p>
      </div>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onClose(toast.id), 300);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          flexShrink: 0,
          marginTop: '-2px',
        }}
      >
        <HiX style={{ fontSize: '1.1rem' }} />
      </button>
    </div>
  );
}

export default function NotificationToast({ toasts = [], removeToast }) {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
      }}
    >
      {toasts.map((t) => (
        <SingleToast key={t.id} toast={t} onClose={removeToast} />
      ))}

      <style>{`
        .toast-exit {
          animation: slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
