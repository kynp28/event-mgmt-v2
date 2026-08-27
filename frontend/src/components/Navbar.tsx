import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Sparkles, Globe, Menu, X, Moon, Sun } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
    <nav className="auth-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
      
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
          <Link 
            to="/" 
            className="nav-item" 
            onClick={(e) => {
              setIsMenuOpen(false);
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', '/');
              }
            }} 
            style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}
          >
            {t('home')}
          </Link>
          <a 
            href="/#events-section" 
            className="nav-item" 
            onClick={(e) => {
              setIsMenuOpen(false);
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', '/#events-section');
              }
            }} 
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}
          >
            {t('active_events')}
          </a>
        </div>

        <div className="nav-actions-wrapper flex gap-4 items-center" style={{ whiteSpace: 'nowrap', flex: 1, justifyContent: 'flex-end' }}>
          {isAuthenticated ? (
            <>
              {user?.roles.includes('admin') && <Link to="/admin" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('admin_dashboard')}</Link>}
              {user?.roles.includes('organizer') && <Link to="/organizer" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('organizer_dashboard')}</Link>}
              {user?.roles.includes('vendor') && <Link to="/vendor" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('my_bookings')}</Link>}
              
              <div className="user-profile-wrapper flex items-center gap-3" style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-main)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden' }}>
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                    {user?.username || getRoleDisplayName(user?.roles[0] || '')}
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary flex items-center" title="ออกจากระบบ" style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0.25rem' }}>
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 auth-buttons-mobile">
              <Link to="/login" className="nav-item" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>{t('login')}</Link>
              <Link to="/register" className="auth-nav-btn" onClick={() => setIsMenuOpen(false)} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>{t('get_started')}</Link>
            </div>
          )}

          <div style={{ marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={toggleTheme} 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card-hover)', 
                border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '50%',
                color: 'var(--text-main)', cursor: 'pointer', width: '36px', height: '36px'
              }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="var(--warning)" />}
            </button>
            <button 
              onClick={toggleLanguage} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card-hover)', 
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
