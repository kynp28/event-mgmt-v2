import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AuthPage.css';

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>(
    location.pathname === '/register' ? 'register' : 'login'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('vendor');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Suspension states
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  // Password strength
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
    setError('');
    setIsSuspended(false);
  }, [location.pathname]);

  const checkStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[0-9]/.test(val) && /[a-zA-Z]/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val) && val.length >= 10) score++;
    setStrength(score);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (mode === 'register') {
      checkStrength(e.target.value);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    
    setLoading(true);
    setError('');
    setIsSuspended(false);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.data.user);
      
      const userRoles = response.data.data.user.roles || [];
      if (userRoles.includes('admin')) {
        navigate('/admin');
      } else if (userRoles.includes('organizer')) {
        navigate('/organizer');
      } else {
        navigate('/vendor');
      }
    } catch (err: any) {
      if (err.response?.data?.data?.isSuspended) {
        setIsSuspended(true);
        setSuspendReason(err.response.data.data.suspendReason || 'บัญชีของคุณถูกระงับการใช้งาน');
      } else {
        setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (!termsAccepted) {
      setError('กรุณายอมรับข้อตกลงการใช้งาน');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        username,
        role
      });
      
      // Auto login after register
      login(response.data.data.user);
      
      if (role === 'organizer') navigate('/organizer');
      else navigate('/vendor');
      
    } catch (err: any) {
      const msg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      if (msg.includes('already exists') || msg.includes('ถูกใช้งานแล้ว')) {
        setError('อีเมลนี้ถูกใช้งานแล้ว ลองเข้าสู่ระบบแทนไหม?');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="auth-wrap">
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        <Sun className="sun" size={16} />
        <Moon className="moon" size={16} />
      </button>

      <div className="auth-card">
        <div className="brand">
          <div className="mark"></div>
          <span className="name">Fairground</span>
        </div>

        <div className="mode-tabs">
          <div 
            className={`mode-tab ${mode === 'login' ? 'active' : ''}`} 
            onClick={() => navigate('/login')}
          >
            เข้าสู่ระบบ
          </div>
          <div 
            className={`mode-tab ${mode === 'register' ? 'active' : ''}`} 
            onClick={() => navigate('/register')}
          >
            สมัครสมาชิก
          </div>
        </div>

        {isSuspended && (
          <div className="suspension-alert" style={{ background: 'var(--status-closed-bg)', color: 'var(--status-closed)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
            {suspendReason}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="headline">ยินดีต้อนรับกลับมา</div>
            <div className="sub">เข้าสู่ระบบเพื่อจัดการการจองของคุณ</div>

            <div className={`field ${error ? 'has-error' : ''}`}>
              <label>อีเมล</label>
              <input 
                className="input" 
                type="email" 
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div className={`field ${error ? 'has-error' : ''}`}>
              <label>รหัสผ่าน</label>
              <div className="input-wrap">
                <input 
                  className="input" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {error && <div className="error-text">{error}</div>}
            </div>

            <div className="row-between">
              <div className="checkbox-row">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">จดจำฉันไว้</label>
              </div>
              <a href="#" className="forgot-link">ลืมรหัสผ่าน?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

            <div className="switch-mode">
              ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="headline">สร้างบัญชีใหม่</div>
            <div className="sub">เริ่มต้นจองบูธหรือจัดงานของคุณวันนี้</div>

            <div className="role-select">
              <div 
                className={`role-chip ${role === 'vendor' ? 'selected' : ''}`} 
                onClick={() => setRole('vendor')}
              >
                Vendor (มาจองบูธ)
              </div>
              <div 
                className={`role-chip ${role === 'organizer' ? 'selected' : ''}`} 
                onClick={() => setRole('organizer')}
              >
                Organizer (จัดงาน)
              </div>
            </div>

            <div className="field">
              <label>ชื่อ-นามสกุล</label>
              <input 
                className="input" 
                type="text" 
                placeholder="เช่น สมชาย ใจดี"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            
            <div className={`field ${error && error.includes('อีเมล') ? 'has-error' : ''}`}>
              <label>อีเมล</label>
              <input 
                className="input" 
                type="email" 
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              {error && error.includes('อีเมล') && (
                <div className="error-text">
                  อีเมลนี้ถูกใช้งานแล้ว <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>ลองเข้าสู่ระบบแทนไหม?</Link>
                </div>
              )}
            </div>
            
            <div className={`field ${error && !error.includes('อีเมล') ? 'has-error' : ''}`}>
              <label>รหัสผ่าน</label>
              <div className="input-wrap">
                <input 
                  className="input" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {error && !error.includes('อีเมล') && <div className="error-text">{error}</div>}
              
              <div className="pw-strength">
                <div className={`seg ${strength >= 1 ? (strength === 1 ? 'weak' : strength === 2 ? 'mid' : 'strong') : ''}`}></div>
                <div className={`seg ${strength >= 2 ? (strength === 2 ? 'mid' : 'strong') : ''}`}></div>
                <div className={`seg ${strength >= 3 ? 'strong' : ''}`}></div>
              </div>
              <div className="pw-hint">ใช้ตัวอักษร ตัวเลข และอักขระพิเศษร่วมกันเพื่อความปลอดภัย</div>
            </div>

            <div className="terms-row">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms">ฉันยอมรับ <a href="#">ข้อตกลงการใช้งาน</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a></label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !termsAccepted}>
              {loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
            </button>

            <div className="switch-mode">
              มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
