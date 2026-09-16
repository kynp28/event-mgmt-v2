import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Lock, 
  Palette, 
  Bell, 
  Briefcase, 
  Check, 
  Moon, 
  Sun, 
  AlertCircle, 
  Save, 
  ExternalLink,
  Building,
  CheckCircle2,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'notifications' | 'role'>('profile');
  
  // Profile State
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [email, setEmail] = useState(user?.username ? `${user.username.toLowerCase().replace(/\s+/g, '')}@test.com` : 'user@test.com');
  const [phone, setPhone] = useState('081-234-5678');
  const [shopName, setShopName] = useState('ร้านค้าของฉัน (My Store)');
  const [bio, setBio] = useState('ผู้ประกอบการร้านค้าคุณภาพ พร้อมออกบูธทั่วประเทศ');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Appearance State
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Notification State
  const [notifyBooking, setNotifyBooking] = useState(true);
  const [notifyPayment, setNotifyPayment] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  // Organizer Bank Details State
  const [bankName, setBankName] = useState('ธนาคารกสิกรไทย (KBank)');
  const [accountNumber, setAccountNumber] = useState('123-4-56789-0');
  const [accountName, setAccountName] = useState('บจก. อีเวนต์คอร์ คอร์ปอเรชั่น');
  const [promptpayNo, setPromptpayNo] = useState('');

  // General Notification
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.data) {
          const u = res.data.data;
          setUsername(u.username || '');
          setEmail(u.email || '');
          if (u.avatarUrl) {
            setAvatarUrl(u.avatarUrl);
          }
          if (u.bankName) setBankName(u.bankName);
          if (u.bankAccountNo) setAccountNumber(u.bankAccountNo);
          if (u.bankAccountName) setAccountName(u.bankAccountName);
          if (u.promptpayNo) setPromptpayNo(u.promptpayNo);
        }
      } catch (err) {
        // Fallback to auth context
        if (user?.username) setUsername(user.username);
        if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      setProfileError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');

    try {
      const res = await api.patch('/auth/profile', {
        username,
        avatarUrl: avatarUrl || null,
        bankName,
        bankAccountNo: accountNumber,
        bankAccountName: accountName,
        promptpayNo
      });

      if (res.data?.data?.user) {
        updateUser({
          username: res.data.data.user.username,
          avatarUrl: res.data.data.user.avatarUrl
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save profile error:", err.response?.data);
      setProfileError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกโปรไฟล์');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch('/auth/profile', {
        currentPassword,
        newPassword
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3500);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง หรือเกิดข้อผิดพลาด');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleBadge = () => {
    if (user?.roles?.includes('admin')) {
      return <span className="badge badge-danger">ผู้ดูแลระบบ (Super Admin)</span>;
    }
    if (user?.roles?.includes('organizer')) {
      return <span className="badge badge-warning">ผู้จัดงาน (Event Organizer)</span>;
    }
    return <span className="badge badge-primary">ผู้ค้า / ผู้เช่าบูธ (Vendor)</span>;
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1100px', padding: '2rem 1.5rem 4rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
          {t('settings', 'การตั้งค่า (Settings)')}
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          จัดการข้อมูลโปรไฟล์ ความปลอดภัย การแสดงผล และสิทธิ์การใช้งานบัญชีของคุณ
        </p>
      </div>

      {saveSuccess && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} />
          <span>บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* Main Settings Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '2rem' }}>
        
        {/* Navigation Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
              textAlign: 'left', transition: 'var(--transition)',
              backgroundColor: activeTab === 'profile' ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === 'profile' ? 'white' : 'var(--text-main)',
              boxShadow: activeTab === 'profile' ? '0 4px 12px var(--primary-glow)' : 'none'
            }}
          >
            <User size={18} />
            <span>ข้อมูลโปรไฟล์</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
              textAlign: 'left', transition: 'var(--transition)',
              backgroundColor: activeTab === 'security' ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === 'security' ? 'white' : 'var(--text-main)',
              boxShadow: activeTab === 'security' ? '0 4px 12px var(--primary-glow)' : 'none'
            }}
          >
            <Lock size={18} />
            <span>ความปลอดภัย & รหัสผ่าน</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
              textAlign: 'left', transition: 'var(--transition)',
              backgroundColor: activeTab === 'appearance' ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === 'appearance' ? 'white' : 'var(--text-main)',
              boxShadow: activeTab === 'appearance' ? '0 4px 12px var(--primary-glow)' : 'none'
            }}
          >
            <Palette size={18} />
            <span>ธีม & ภาษา</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
              textAlign: 'left', transition: 'var(--transition)',
              backgroundColor: activeTab === 'notifications' ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === 'notifications' ? 'white' : 'var(--text-main)',
              boxShadow: activeTab === 'notifications' ? '0 4px 12px var(--primary-glow)' : 'none'
            }}
          >
            <Bell size={18} />
            <span>การแจ้งเตือน</span>
          </button>

          <button
            onClick={() => setActiveTab('role')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
              textAlign: 'left', transition: 'var(--transition)',
              backgroundColor: activeTab === 'role' ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === 'role' ? 'white' : 'var(--text-main)',
              boxShadow: activeTab === 'role' ? '0 4px 12px var(--primary-glow)' : 'none'
            }}
          >
            <Briefcase size={18} />
            <span>สิทธิ์ & ธุรกิจ ({user?.roles?.includes('organizer') ? 'ผู้จัดงาน' : user?.roles?.includes('admin') ? 'แอดมิน' : 'ร้านค้า'})</span>
          </button>
        </div>

        {/* Tab Content Cards */}
        <div>
          {/* 1. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>ข้อมูลส่วนตัว (Profile)</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>อัปเดตข้อมูลบัญชีและข้อมูลติดต่อของคุณ</p>
                </div>
                {getRoleBadge()}
              </div>

              {profileError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <AlertCircle size={16} />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                {/* User Avatar Upload & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--bg-card-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, overflow: 'hidden', border: '2px solid var(--border)' }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <label 
                      style={{ 
                        position: 'absolute', bottom: '-2px', right: '-2px', 
                        width: '28px', height: '28px', borderRadius: '50%', 
                        backgroundColor: 'var(--primary)', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        border: '2px solid var(--bg-card)'
                      }}
                      title="อัปโหลดรูปภาพใหม่"
                    >
                      <Camera size={14} />
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/png,image/jpeg,image/webp" 
                        onChange={handleAvatarUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Upload size={14} /> อัปโหลดรูปภาพ
                      </button>
                      {avatarUrl && (
                        <button 
                          type="button" 
                          onClick={handleRemoveAvatar} 
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Trash2 size={14} /> ลบรูปโปรไฟล์
                        </button>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
                      รองรับไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5MB (แสดงที่แถบเมนูด้านข้างและมุมบน)
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>ชื่อผู้ใช้งาน (Username)</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>อีเมล (Email)</label>
                    <input 
                      type="email" 
                      value={email} 
                      disabled
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', fontSize: '0.95rem', cursor: 'not-allowed' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>เบอร์โทรศัพท์ติดต่อ</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="เช่น 081-xxx-xxxx"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>ชื่อร้านค้า / องค์กร</label>
                    <input 
                      type="text" 
                      value={shopName} 
                      onChange={(e) => setShopName(e.target.value)} 
                      placeholder="เช่น บจก. อีเวนต์คอร์"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>คำอธิบายร้านค้า / เกี่ยวกับเรา (Bio)</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)', fontSize: '0.95rem', resize: 'vertical' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Save size={18} /> บันทึกข้อมูลโปรไฟล์
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>ความปลอดภัย & เปลี่ยนรหัสผ่าน</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>ตั้งรหัสผ่านที่รัดกุมอย่างน้อย 8 ตัวอักษรเพื่อความปลอดภัยของบัญชี</p>
              </div>

              {passwordSuccess && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <span>เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว</span>
                </div>
              )}

              {passwordError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>รหัสผ่านปัจจุบัน (Current Password)</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required
                    placeholder="••••••••"
                    style={{ width: '100%', maxWidth: '400px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)' }} 
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>รหัสผ่านใหม่ (New Password)</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required
                    placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                    style={{ width: '100%', maxWidth: '400px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)' }} 
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>ยืนยันรหัสผ่านใหม่ (Confirm New Password)</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    style={{ width: '100%', maxWidth: '400px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)' }} 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={18} /> อัปเดตรหัสผ่าน
                </button>
              </form>
            </div>
          )}

          {/* 3. APPEARANCE & LANGUAGE TAB */}
          {activeTab === 'appearance' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>การแสดงผล & ภาษา (Appearance & Language)</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>ปรับแต่งหน้าตาและภาษาของระบบตามความชอบของคุณ</p>
              </div>

              {/* Theme Mode Selector */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>โหมดสีของธีม (Theme Mode)</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {/* Light Mode Card */}
                  <div 
                    onClick={() => handleThemeChange('light')}
                    style={{
                      border: `2px solid ${currentTheme === 'light' ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sun size={24} color="#f59e0b" />
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Light Mode (สว่าง)</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>อ่านง่าย คมชัด สบายตา</span>
                    {currentTheme === 'light' && <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>กำลังใช้งาน</span>}
                  </div>

                  {/* Dark Mode Card */}
                  <div 
                    onClick={() => handleThemeChange('dark')}
                    style={{
                      border: `2px solid ${currentTheme === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Moon size={24} color="var(--primary)" />
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Dark Mode (มืด)</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>ถนอมสายตาในที่แสงน้อย</span>
                    {currentTheme === 'dark' && <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>กำลังใช้งาน</span>}
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>ภาษาของระบบ (Language)</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleLanguageChange('th')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: `2px solid ${i18n.language === 'th' ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: i18n.language === 'th' ? 'var(--primary-glow)' : 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>🇹🇭 ภาษาไทย (TH)</span>
                    {i18n.language === 'th' && <Check size={16} color="var(--primary)" />}
                  </button>

                  <button
                    onClick={() => handleLanguageChange('en')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: `2px solid ${i18n.language === 'en' ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: i18n.language === 'en' ? 'var(--primary-glow)' : 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>🇬🇧 English (EN)</span>
                    {i18n.language === 'en' && <Check size={16} color="var(--primary)" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>การแจ้งเตือน (Notifications)</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>เลือกรับข่าวสารและสถานะการจองผ่านอีเมล</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontWeight: 600 }}>การแจ้งเตือนสถานะการจอง (Booking Updates)</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>รับอีเมลทันทีเมื่อการจองของคุณได้รับการยืนยัน หรือมีการเปลี่ยนแปลง</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifyBooking} 
                    onChange={(e) => setNotifyBooking(e.target.checked)} 
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontWeight: 600 }}>การแจ้งเตือนชำระเงินและตรวจสอบสลิป (Payment & Slip)</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>แจ้งเตือนเมื่อผู้จัดงานตรวจสอบสลิปโอนเงินเสร็จสิ้น หรือมีคำร้องขอให้อัปโหลดใหม่</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifyPayment} 
                    onChange={(e) => setNotifyPayment(e.target.checked)} 
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontWeight: 600 }}>ข่าวสารอีเวนต์ใหม่และโปรโมชั่น (News & Offers)</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>รับข่าวสารเปิดจองพื้นที่บูธงานแฟร์ใหม่ๆ ที่น่าสนใจ</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifyMarketing} 
                    onChange={(e) => setNotifyMarketing(e.target.checked)} 
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. ROLE SPECIFIC TAB */}
          {activeTab === 'role' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                  การตั้งค่าสำหรับ {user?.roles?.includes('organizer') ? 'ผู้จัดงาน (Organizer)' : user?.roles?.includes('admin') ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้เช่าบูธ (Vendor)'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                  ฟีเจอร์และการจัดการเฉพาะสำหรับบทบาทของคุณในระบบ
                </p>
              </div>

              {/* Vendor Role Upgrade Box */}
              {user?.roles?.includes('vendor') && !user?.roles?.includes('organizer') && !user?.roles?.includes('admin') && (
                <div style={{ backgroundColor: 'var(--bg-card-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Building size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>ต้องการสร้างและจัดงานแฟร์ของคุณเอง?</h3>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>อัปเกรดบัญชีเป็นผู้จัดงาน (Organizer) เพื่อสร้างอีเวนต์ วาดผังบูธ และเปิดรับจอง</p>
                    </div>
                  </div>

                  <Link to="/vendor/upgrade" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    ยื่นคำร้องขอเป็นผู้จัดงาน <ExternalLink size={16} />
                  </Link>
                </div>
              )}

              {/* Organizer Bank Account Setup */}
              {user?.roles?.includes('organizer') && (
                <form onSubmit={handleSaveProfile}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                    ช่องทางรับชำระเงินค่าบูธเริ่มต้น (Default Bank Account)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    ข้อมูลนี้จะถูกนำไปแนะนำในขั้นตอนการโอนเงินของผู้เช่าบูธในงานของคุณ
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>ชื่อธนาคาร</label>
                    <select 
                      value={bankName} 
                      onChange={(e) => setBankName(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)', appearance: 'auto' }} 
                    >
                      <option value="ธนาคารกสิกรไทย (KBank)">ธนาคารกสิกรไทย (KBank)</option>
                      <option value="ธนาคารไทยพาณิชย์ (SCB)">ธนาคารไทยพาณิชย์ (SCB)</option>
                      <option value="ธนาคารกรุงเทพ (BBL)">ธนาคารกรุงเทพ (BBL)</option>
                      <option value="ธนาคารกรุงไทย (KTB)">ธนาคารกรุงไทย (KTB)</option>
                      <option value="ธนาคารกรุงศรีอยุธยา (BAY)">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                      <option value="ธนาคารทหารไทยธนชาต (TTB)">ธนาคารทหารไทยธนชาต (TTB)</option>
                      <option value="ธนาคารออมสิน (GSB)">ธนาคารออมสิน (GSB)</option>
                      <option value="ธนาคารอาคารสงเคราะห์ (GHB)">ธนาคารอาคารสงเคราะห์ (GHB)</option>
                      <option value="ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)">ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>เลขที่บัญชี</label>
                    <input 
                      type="text" 
                      value={accountNumber} 
                      onChange={(e) => setAccountNumber(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)' }} 
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>ชื่อบัญชี</label>
                    <input 
                      type="text" 
                      value={accountName} 
                      onChange={(e) => setAccountName(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)' }} 
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>เบอร์พร้อมเพย์ (PromptPay)</label>
                    <input 
                      type="text" 
                      value={promptpayNo} 
                      onChange={(e) => setPromptpayNo(e.target.value)} 
                      placeholder="เบอร์มือถือ หรือ เลขประจำตัวประชาชน"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)' }} 
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>ระบบจะใช้เบอร์นี้สร้าง QR Code ให้อัตโนมัติเมื่อ Vendor ชำระเงิน</p>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                    บันทึกข้อมูลธนาคาร
                  </button>
                </form>
              )}

              {/* Admin System Info */}
              {user?.roles?.includes('admin') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card-hover)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>EventCore Platform Version</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>v2.4.0 (Production Build)</div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card-hover)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>API Endpoint Status</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>🟢 Server Running on port 5000 (Healthy)</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
