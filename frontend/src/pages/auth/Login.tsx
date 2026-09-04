import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim() || appealReason.length < 10) {
      alert('กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร');
      return;
    }
    
    setAppealLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('reason', appealReason);
      if (evidenceFile) {
        formData.append('evidence', evidenceFile);
      }

      await api.post('/auth/appeal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAppealSuccess(true);
      setTimeout(() => {
        setShowAppealModal(false);
        setAppealSuccess(false);
        setAppealReason('');
        setEvidenceFile(null);
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถส่งคำร้องได้');
    } finally {
      setAppealLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsSuspended(false);
    setSuspendReason('');
    
    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data.data.user;
      login(user);
      // Redirect ตาม Role ของ User
      const roles: string[] = user.roles || [];
      if (roles.includes('admin')) navigate('/admin');
      else if (roles.includes('organizer')) navigate('/organizer');
      else if (roles.includes('vendor')) navigate('/vendor');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('login_failed'));
      if (err.response?.data?.details?.isSuspended) {
        setIsSuspended(true);
        setSuspendReason(err.response?.data?.details?.suspendReason || 'ไม่มีการระบุเหตุผล');
      }
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

        {error && (
          <div className="auth-error" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>{error}</div>
            {isSuspended && (
              <button 
                type="button"
                onClick={() => setShowAppealModal(true)}
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', border: '1px solid currentColor', 
                  padding: '0.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                ยื่นคำร้องขอปลดแบน
              </button>
            )}
          </div>
        )}

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

      {showAppealModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>ส่งคำร้องขอปลดแบน</h3>
              <button onClick={() => setShowAppealModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            {appealSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--success)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h4 style={{ fontSize: '1.125rem', margin: '0 0 0.5rem 0' }}>ส่งคำร้องสำเร็จ</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>กรุณารอแอดมินตรวจสอบและพิจารณา</p>
              </div>
            ) : (
              <form onSubmit={handleAppealSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>อีเมลของบัญชีที่ถูกระงับ</label>
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-muted)' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>เหตุผลที่ถูกระงับ</label>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', borderRadius: '8px', fontSize: '0.875rem' }}>
                    {suspendReason}
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>เหตุผลที่ขอปลดแบน</label>
                  <textarea 
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="อธิบายเหตุผลและรายละเอียดเพิ่มเติมเพื่อประกอบการพิจารณา..."
                    required
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>แนบหลักฐาน (ถ้ามี)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEvidenceFile(e.target.files[0]);
                      }
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--text-main)' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>รองรับไฟล์รูปภาพขนาดไม่เกิน 5MB</p>
                </div>
                <button 
                  type="submit" 
                  disabled={appealLoading}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, border: 'none', cursor: appealLoading ? 'not-allowed' : 'pointer', opacity: appealLoading ? 0.7 : 1 }}
                >
                  {appealLoading ? 'กำลังส่งคำร้อง...' : 'ส่งคำร้อง'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
