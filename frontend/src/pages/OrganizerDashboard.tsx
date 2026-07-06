import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Store, Ticket, CircleDollarSign, Plus, Map, TrendingUp, ChevronRight, Activity } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrganizerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['organizerStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/organizer');
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
              {t('organizer_dashboard', 'แดชบอร์ดผู้จัดงาน')}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              ยินดีต้อนรับกลับ, {user?.username || 'ผู้จัดงาน'} 👋 จัดการงานแฟร์และพื้นที่ขายของคุณได้ที่นี่
            </p>
          </div>
          <div className="dashboard-header-actions" style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/organizer/booths/manage" className="auth-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', textDecoration: 'none', fontWeight: 600, padding: '0.75rem 1.5rem', margin: 0, border: '1px solid var(--border)' }}>
              <Map size={18} /> {t('manage_booths', 'จัดการบูธ (วาดผัง)')}
            </Link>
            <Link to="/organizer/events/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', margin: 0, padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
              <Plus size={18} /> {t('create_new_event', 'สร้างงานแฟร์ใหม่')}
            </Link>
          </div>
        </div>
        
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <Link to="/organizer/events" className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', textDecoration: 'none', cursor: 'pointer' }}>
            <div style={{ backgroundColor: '#EFF6FF', padding: '1rem', borderRadius: '12px', color: '#3B82F6' }}>
              <Calendar size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('my_events', 'อีเวนต์ของฉัน')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalEvents}</p>
            </div>
          </Link>
          
          {/* Card 2 */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#F3E8FF', padding: '1rem', borderRadius: '12px', color: '#9333EA' }}>
              <Store size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('total_booths', 'บูธในระบบ')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalBooths}</p>
            </div>
          </div>

          {/* Card 3 */}
          <Link to="/organizer/bookings" className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', textDecoration: 'none', cursor: 'pointer' }}>
            <div style={{ backgroundColor: '#DCFCE7', padding: '1rem', borderRadius: '12px', color: '#16A34A' }}>
              <Ticket size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('bookings', 'รายการจองทั้งหมด')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalBookings}</p>
            </div>
          </Link>

          {/* Card 4 */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#FEF3C7', padding: '1rem', borderRadius: '12px', color: '#D97706' }}>
              <CircleDollarSign size={28} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('revenue', 'รายได้โดยประมาณ')}</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>฿{stats.totalRevenue?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary)" /> ความเคลื่อนไหวล่าสุด (Recent Activity)
              </h3>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                ดูทั้งหมด <ChevronRight size={16} />
              </span>
            </div>
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p>คุณสามารถดูรายการผู้ค้าที่โอนเงินเข้ามาล่าสุดได้ที่นี่</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>(ระบบนี้กำลังอยู่ในระหว่างการพัฒนา)</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'var(--primary)', color: 'white' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <TrendingUp size={32} color="#E0E7FF" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>เคล็ดลับเพิ่มยอดจอง!</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '2rem' }}>
              การวาดผังบูธให้เป็นระเบียบ และการใส่รูปภาพโปรโมทงานที่ชัดเจน ช่วยเพิ่มโอกาสในการตัดสินใจจองบูธของพ่อค้าแม่ค้าได้ถึง 40%
            </p>
            <Link to="/organizer/booths/manage" style={{ display: 'block', textAlign: 'center', backgroundColor: 'white', color: 'var(--primary)', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
              ไปจัดการผังตลาดกันเลย!
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
