import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Store, CircleDollarSign, ShieldCheck, Activity, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/admin');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="container mt-10 text-center animate-pulse" style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูลแดชบอร์ด...</div>;
  if (!stats) return <div className="container mt-10 text-center" style={{ color: 'var(--text-muted)' }}>ไม่พบข้อมูลสถิติ</div>;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-dark)', minHeight: 'calc(100vh - 80px)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Header Section */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              {t('admin_dashboard', 'แอดมินแดชบอร์ด')}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              ยินดีต้อนรับ, {user?.username || 'ผู้ดูแลระบบ'} 🛡️ ดูภาพรวมของระบบและจัดการข้อมูลได้ที่นี่
            </p>
          </div>
          <div className="dashboard-header-actions" style={{ display: 'flex', gap: '1rem' }}>
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <Link to="/admin/events" className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', textDecoration: 'none', cursor: 'pointer' }}>
            <div style={{ backgroundColor: '#EFF6FF', padding: '1rem', borderRadius: '12px', color: '#3B82F6' }}>
              <Calendar size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('total_events', 'อีเวนต์ทั้งหมด')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalEvents}</p>
            </div>
          </Link>
          
          {/* Card 2 */}
          <Link to="/admin/users?tab=organizers" className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', textDecoration: 'none', cursor: 'pointer' }}>
            <div style={{ backgroundColor: '#F3E8FF', padding: '1rem', borderRadius: '12px', color: '#9333EA' }}>
              <Users size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('organizers', 'ผู้จัดงาน')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalOrganizers}</p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/admin/users?tab=vendors" className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', textDecoration: 'none', cursor: 'pointer' }}>
            <div style={{ backgroundColor: '#ECFEFF', padding: '1rem', borderRadius: '12px', color: '#06B6D4' }}>
              <Store size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('vendors', 'ผู้เช่าบูธ (Vendors)')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalVendors}</p>
            </div>
          </Link>

          {/* Card 4 */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#DCFCE7', padding: '1rem', borderRadius: '12px', color: '#16A34A' }}>
              <CircleDollarSign size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('revenue', 'รายได้รวมของระบบ')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>฿{stats.totalRevenue?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Health Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary)" /> รายการความเคลื่อนไหวล่าสุด (System Activity)
              </h3>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                ดูทั้งหมด <ChevronRight size={16} />
              </span>
            </div>
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p>ระบบตรวจสอบความเคลื่อนไหวและสถิติการใช้งานจะแสดงผลที่นี่</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>(อยู่ระหว่างการพัฒนา)</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', backgroundColor: '#1E293B', color: 'white' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <ShieldCheck size={32} color="#38BDF8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>สถานะระบบ (System Health)</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, opacity: 0.8, marginBottom: '1.5rem' }}>
              ระบบทำงานปกติ ไม่มีรายงานความขัดข้อง เซิร์ฟเวอร์ฐานข้อมูลทำงานเต็มประสิทธิภาพ
            </p>
            
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>คำร้องขอเป็นผู้จัดงาน (รออนุมัติ)</span>
                <span style={{ fontWeight: 600, color: '#FDE047' }}><AlertTriangle size={14} className="inline mr-1" /> 0 รายการ</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
