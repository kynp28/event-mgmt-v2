import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../auth.css'; // Import the newly created CSS

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="auth-page">
      {/* Custom Navbar for Auth Pages */}
      <nav className="auth-navbar">
        <Link to="/" className="auth-nav-logo">
          <div className="auth-nav-icon">
            <Sparkles size={24} />
          </div>
          <div className="auth-nav-text">
            <h1>ถนนคนเดินบุรีรัมย์</h1>
            <p>Walking Street Buriram</p>
          </div>
        </Link>
        <div className="auth-nav-links">
          <Link to="/login" className="auth-nav-link" style={{ color: isLogin ? 'var(--primary)' : 'var(--text-main)' }}>
            เข้าสู่ระบบ
          </Link>
          <Link to="/register" className="auth-nav-btn">
            สมัครสมาชิก
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="auth-main">
        {children}
      </main>
    </div>
  );
};
