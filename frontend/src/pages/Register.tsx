import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import api from '../services/api';
import { AuthLayout } from '../components/AuthLayout';

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { email, password, username, role });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'สมัครสมาชิกล้มเหลว');
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
          <Link to="/login" className="auth-toggle-btn inactive">
            เข้าสู่ระบบ
          </Link>
          <div className="auth-toggle-btn active">
            สมัครสมาชิก
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="auth-form-group">
            <label className="auth-label">ชื่อ-นามสกุล</label>
            <input 
              type="text" 
              className="auth-input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
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
            <p className="auth-hint">อย่างน้อย 6 ตัวอักษร</p>
          </div>
          <div className="auth-form-group">
            <label className="auth-label">ประเภทบัญชี</label>
            <select 
              className="auth-input"
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="vendor">ผู้เช่าบูธ (Vendor)</option>
              <option value="organizer">ผู้จัดงาน (Organizer)</option>
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
              ฉันได้อ่านและยอมรับ{' '}
              <span 
                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
              >
                ข้อตกลงและเงื่อนไขการใช้บริการ
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !termsAccepted}
            className={`auth-submit-btn ${!termsAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>ข้อตกลงและเงื่อนไขการใช้บริการ</h2>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem', color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>1. บทนำ</h3>
              <p>ยินดีต้อนรับสู่แพลตฟอร์มของเรา การที่คุณใช้บริการนี้ถือว่าคุณได้อ่าน เข้าใจ และยอมรับข้อตกลงและเงื่อนไขที่ระบุไว้ด้านล่างทั้งหมด</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>2. สำหรับผู้ใช้งานและผู้เช่าบูธ (Vendor)</h3>
              <p>ผู้ใช้งานตกลงที่จะไม่นำสินค้าที่ผิดกฎหมาย ละเมิดลิขสิทธิ์ หรือเป็นอันตรายต่อสังคมมาจำหน่ายบนพื้นที่ที่ทำการเช่าผ่านแพลตฟอร์ม หากมีการฝ่าฝืน ผู้จัดงานหรือผู้ดูแลระบบมีสิทธิ์ยกเลิกการเช่าโดยไม่ต้องคืนเงิน</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>3. สำหรับผู้จัดงาน (Organizer)</h3>
              <p>ผู้จัดงานตกลงที่จะดูแลความเรียบร้อยของงานให้เป็นไปตามกฎหมาย แพลตฟอร์มเป็นเพียงสื่อกลางในการเชื่อมต่อระหว่างผู้จัดงานและผู้เช่าบูธ แพลตฟอร์มจะไม่รับผิดชอบต่อความสูญเสีย ความเสียหาย หรือข้อพิพาทใดๆ ที่เกิดขึ้นระหว่างผู้จัดงานและผู้เช่าบูธ</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>4. นโยบายความเป็นส่วนตัว (Privacy Policy)</h3>
              <p>เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณอย่างปลอดภัย และจะไม่นำไปเผยแพร่หรือขายให้กับบุคคลที่สามโดยไม่ได้รับอนุญาต ยกเว้นตามที่กฎหมายกำหนด</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>5. การเปลี่ยนแปลงข้อตกลง</h3>
              <p>เราขอสงวนสิทธิ์ในการแก้ไขปรับปรุงข้อตกลงและเงื่อนไขนี้ได้ตลอดเวลา โดยจะมีการแจ้งให้ผู้ใช้งานทราบผ่านทางแพลตฟอร์ม</p>
            </div>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  setShowTerms(false);
                  setTermsAccepted(true);
                }}
                style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                ฉันเข้าใจและยอมรับ
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
