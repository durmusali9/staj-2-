import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HiHome, HiDocumentText, HiPencil, HiUserGroup, HiChartBar, HiDocumentDownload, HiMenu, HiX, HiLogout } from 'react-icons/hi';

const Sidebar = () => {
  const { isOgrenci, isDanisman, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    textDecoration: 'none',
    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
    borderLeft: isActive ? '4px solid #8b5cf6' : '4px solid transparent',
    transition: 'var(--transition-normal)',
    fontWeight: isActive ? 600 : 500,
  });

  const sidebarStyle = {
    width: '260px',
    background: 'var(--surface-color)',
    borderRight: 'var(--border-color)',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    zIndex: 1000,
    transform: isOpen ? 'translateX(0)' : 'translateX(0)', // Handle mobile in css
  };

  return (
    <>
      {/* Mobile toggle - basic implementation */}
      <div className="mobile-toggle" style={{ display: 'none', position: 'fixed', top: '1rem', left: '1rem', zIndex: 1001, cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </div>
      
      <div style={{...sidebarStyle, transform: window.innerWidth <= 768 && !isOpen ? 'translateX(-100%)' : 'translateX(0)'}}>
        <div style={{ padding: '2rem 1.5rem', marginBottom: '1rem' }}>
          <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.5rem' }}>Staj Rapor</h2>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/dashboard" style={navLinkStyle}>
            <HiHome size={20} /> Dashboard
          </NavLink>
          
          {isOgrenci && (
            <>
              <NavLink to="/rapor-yaz" style={navLinkStyle}>
                <HiPencil size={20} /> Rapor Yaz
              </NavLink>
              <NavLink to="/pdf-export" style={navLinkStyle}>
                <HiDocumentDownload size={20} /> PDF Oluştur
              </NavLink>
            </>
          )}
          
          {isDanisman && (
            <NavLink to="/danisman" style={navLinkStyle}>
              <HiUserGroup size={20} /> Danışman Paneli
            </NavLink>
          )}
          
          <NavLink to="/istatistikler" style={navLinkStyle}>
            <HiChartBar size={20} /> İstatistikler
          </NavLink>
        </nav>
        
        <div style={{ padding: '1.5rem' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            <HiLogout size={20} /> Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
