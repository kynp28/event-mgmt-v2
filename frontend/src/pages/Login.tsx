import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { useTranslation } from 'react-i18next';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.data.token;
      login(token);
      // Redirect ตาม Role ของ User
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles: string[] = payload.roles || [];
      if (roles.includes('admin')) navigate('/admin');
      else if (roles.includes('organizer')) navigate('/organizer');
      else if (roles.includes('vendor')) navigate('/vendor');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card animate-fade-in">
        
        {/* Header section */}
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          </div>
          <h2>{t('welcome')}</h2>
          <p>{t('walking_street_th')} {t('walking_street_en')}</p>
        </div>

        {/* Custom Pill Toggle */}
        <div className="auth-toggle">
          <div className="auth-toggle-btn active">
            {t('login')}
          </div>
          <Link to="/register" className="auth-toggle-btn inactive">
            {t('create_account')}
          </Link>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label className="auth-label">{t('email')}</label>
            <input 
              type="email" 
              className="auth-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">{t('password')}</label>
            <input 
              type="password" 
              className="auth-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            className={`auth-submit-btn ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? t('logging_in') : t('login')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('login_terms_prefix')} <span>{t('terms_of_use')}</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
