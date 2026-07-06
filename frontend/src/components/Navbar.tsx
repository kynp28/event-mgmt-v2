import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Sparkles, Globe, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'th' : 'en');
  };

  const getRoleDisplayName = (role: string) => {
    if (!role) return '';
    const roleMap: Record<string, string> = {
      admin: t('role_admin', 'ผู้ดูแลระบบ'),
      organizer: t('role_organizer', 'ผู้จัดงาน'),
      vendor: t('role_vendor', 'ผู้ค้า')
    };
    return roleMap[role] || role;
  };

  return (
    <nav className="auth-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
      
      {/* Mobile Top Bar */}
      <div className="nav-mobile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
        <Link to="/" className="auth-nav-logo" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div className="auth-nav-icon" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div className="auth-nav-text" style={{ textAlign: 'left' }}>
            <h1 style={{ whiteSpace: 'nowrap', fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1.2 }}>EventCore</h1>
            <p style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Vendor Platform</p>
          </div>
        </Link>

        {/* Hamburger Icon */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem' }}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
        
      {/* Navigation Content */}
      <div className={`nav-content-wrapper ${isMenuOpen ? 'open' : ''}`} style={{ flex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="auth-nav-links" style={{ display: 'flex', gap: '2rem', whiteSpace: 'nowrap', flex: 1, justifyContent: 'center' }}>
          <Link to="/" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}>{t('home', 'หน้าหลัก')}</Link>
          <Link to="/#events-section" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>{t('active_events', 'งานแฟร์')}</Link>
          <Link to="/" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>ราคา/แพ็กเกจ</Link>
          <Link to="/" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>{t('about', 'เกี่ยวกับเรา')}</Link>
        </div>

        <div className="nav-actions-wrapper flex gap-4 items-center" style={{ whiteSpace: 'nowrap', flex: 1, justifyContent: 'flex-end' }}>
          {isAuthenticated ? (
            <>
              {user?.roles.includes('admin') && <Link to="/admin" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('admin_dashboard')}</Link>}
              {user?.roles.includes('organizer') && <Link to="/organizer" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('organizer_dashboard')}</Link>}
              {user?.roles.includes('vendor') && <Link to="/vendor" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('my_bookings')}</Link>}
              
              <div className="user-profile-wrapper flex items-center gap-4" style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                  <User size={16} color="var(--primary)"/> {getRoleDisplayName(user?.roles[0] || '')}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2" title="ออกจากระบบ" style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 auth-buttons-mobile">
              <Link to="/login" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
              <Link to="/register" className="auth-nav-btn" onClick={() => setIsMenuOpen(false)} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>สำหรับผู้จัดงาน</Link>
            </div>
          )}

          <div style={{ marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)', display: 'flex' }}>
            <button 
              onClick={toggleLanguage} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', 
                border: '1px solid var(--border)', padding: '0.5rem 0.75rem', borderRadius: '9999px',
                color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600
              }}
            >
              <Globe size={16} color="var(--primary)" />
              {i18n.language === 'en' ? 'EN' : 'TH'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
