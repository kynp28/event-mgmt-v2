import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบล้มเหลว');
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
            <Sparkles size={28} />
          </div>
          <h2>ยินดีต้อนรับ</h2>
          <p>เข้าสู่ระบบถนนคนเดินบุรีรัมย์</p>
        </div>

        {/* Custom Pill Toggle */}
        <div className="auth-toggle">
          <div className="auth-toggle-btn active">
            เข้าสู่ระบบ
          </div>
          <Link to="/register" className="auth-toggle-btn inactive">
            สมัครสมาชิก
          </Link>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label className="auth-label">อีเมล</label>
            <input 
              type="email" 
              className="auth-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">รหัสผ่าน</label>
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
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            การเข้าสู่ระบบถือว่ายอมรับ <span>เงื่อนไขการใช้บริการ</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
