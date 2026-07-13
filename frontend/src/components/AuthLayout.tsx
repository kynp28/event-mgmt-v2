import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../auth.css'; // Import the newly created CSS

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'th' : 'en');
  };

  return (
    <div className="auth-page">
      {/* Custom Navbar for Auth Pages */}
      <nav className="auth-navbar">
        <Link to="/" className="auth-nav-logo">
          <div className="auth-nav-icon">
            <Sparkles size={24} />
          </div>
          <div className="auth-nav-text">
            <h1>{t('walking_street_th')}</h1>
            <p>{t('walking_street_en')}</p>
          </div>
        </Link>
        <div className="auth-nav-links">
          <Link to="/login" className="auth-nav-link" style={{ color: isLogin ? 'var(--primary)' : 'var(--text-main)' }}>
            {t('login', 'เข้าสู่ระบบ')}
          </Link>
          <Link to="/register" className="auth-nav-btn">
            {t('create_account', 'สมัครสมาชิก')}
          </Link>
          <button 
            onClick={toggleLanguage} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', 
              border: '1px solid var(--border)', padding: '0.5rem 0.75rem', borderRadius: '9999px',
              color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              marginLeft: '0.5rem'
            }}
          >
            <Globe size={16} color="var(--primary)" />
            {i18n.language === 'en' ? 'EN' : 'TH'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="auth-main">
        {children}
      </main>
    </div>
  );
};
