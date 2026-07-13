import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import api from '../services/api';
import { AuthLayout } from '../components/AuthLayout';
import { useTranslation } from 'react-i18next';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('vendor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { email, password, username, role });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || t('register_failed'));
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
          <Link to="/login" className="auth-toggle-btn inactive">
            {t('login')}
          </Link>
          <div className="auth-toggle-btn active">
            {t('create_account')}
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="auth-form-group">
            <label className="auth-label">{t('fullname')}</label>
            <input 
              type="text" 
              className="auth-input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
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
            <p className="auth-hint">{t('password_hint')}</p>
          </div>
          <div className="auth-form-group">
            <label className="auth-label">{t('account_type')}</label>
            <select 
              className="auth-input"
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="vendor">{t('role_vendor')}</option>
              <option value="visitor">{t('role_visitor')}</option>
            </select>
          </div>
          <div className="auth-form-group" style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="checkbox" 
              id="acceptTerms" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 0 }} 
            />
            <label htmlFor="acceptTerms" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', margin: 0 }}>
              {t('read_and_accept')}
              <span 
                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
              >
                {t('terms_of_use')}
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !termsAccepted}
            className={`auth-submit-btn ${!termsAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? t('registering') : t('create_account')}
          </button>
        </form>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button 
              onClick={() => setShowTerms(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>{t('terms_of_use')}</h2>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem', color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{t('terms_title_1')}</h3>
              <p>{t('terms_desc_1')}</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{t('terms_title_2')}</h3>
              <p>{t('terms_desc_2')}</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{t('terms_title_3')}</h3>
              <p>{t('terms_desc_3')}</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{t('terms_title_4')}</h3>
              <p>{t('terms_desc_4')}</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>{t('terms_title_5')}</h3>
              <p>{t('terms_desc_5')}</p>
            </div>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  setShowTerms(false);
                  setTermsAccepted(true);
                }}
                style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('i_understand_accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
