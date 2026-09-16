import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Store, Calendar as CalendarIcon, 
  CircleDollarSign, Plus, ArrowRight 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './OrganizerDashboard.css';

export const OrganizerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7days');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['organizerStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/organizer');
      return res.data.data;
    }
  });

  if (isLoading || !stats) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูลแดชบอร์ด...</div>;
  }

  const { totalRevenue, totalBooths, bookedBooths, activeEvents, pendingBookings, upcomingEvents, recentBookings, dailySales } = stats;

  const maxSales = Math.max(...dailySales.map((d: any) => d.value));

  const formatCurrency = (val: number) => `฿${val.toLocaleString()}`;

  return (
    <div className="org-dashboard">
      <div className="page-head">
        <div>
          <h1 className="page-title">ภาพรวมงานของคุณ</h1>
          <p className="page-sub">สรุปยอดขายและการจองล่าสุด</p>
        </div>
        <Link to="/organizer/events/create" className="new-event-btn">
          <Plus size={16} /> สร้างงานใหม่
        </Link>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">รายได้รวม (เดือนนี้)</span>
            <div className="kpi-icon" style={{ background: 'var(--accent-soft)' }}>
              <CircleDollarSign size={16} color="var(--accent)" />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(totalRevenue)}</div>
          <div className="kpi-delta up">
            <TrendingUp size={14} /> 12.4% จากเดือนก่อน
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">บูธที่จองแล้ว</span>
            <div className="kpi-icon" style={{ background: 'var(--status-open-bg)' }}>
              <Store size={16} color="var(--status-open)" />
            </div>
          </div>
          <div className="kpi-value">{bookedBooths} / {totalBooths}</div>
          <div className="kpi-delta up">
            <TrendingUp size={14} /> {totalBooths > 0 ? Math.round((bookedBooths/totalBooths)*100) : 0}% เต็มความจุ
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">งานที่กำลังเปิดจอง</span>
            <div className="kpi-icon" style={{ background: 'var(--accent-soft)' }}>
              <CalendarIcon size={16} color="var(--accent)" />
            </div>
          </div>
          <div className="kpi-value">{activeEvents}</div>
          <div className="kpi-delta" style={{ color: 'var(--text-muted)' }}>
            ใกล้ครบกำหนด 2 งาน
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">รอชำระเงิน</span>
            <div className="kpi-icon" style={{ background: 'var(--status-almost-full-bg)' }}>
              <CircleDollarSign size={16} color="var(--status-almost-full)" />
            </div>
          </div>
          <div className="kpi-value">{pendingBookings} รายการ</div>
          <div className="kpi-delta down">
            <TrendingDown size={14} /> รอมานาน 3 วัน+
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="card">
          <div className="card-head">
            <h3>ยอดขายรายวัน</h3>
            <div className="range-tabs">
              <span className={timeRange === '7days' ? 'active' : ''} onClick={() => setTimeRange('7days')}>7 วัน</span>
              <span className={timeRange === '30days' ? 'active' : ''} onClick={() => setTimeRange('30days')}>30 วัน</span>
              <span className={timeRange === 'year' ? 'active' : ''} onClick={() => setTimeRange('year')}>ปีนี้</span>
            </div>
          </div>
          <div style={{ height: '220px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600 }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {dailySales.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value === maxSales ? 'var(--accent)' : 'var(--accent-soft)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>งานที่กำลังจะถึง</h3>
          </div>
          <div className="upcoming-events-list">
            {upcomingEvents.length > 0 ? upcomingEvents.map((evt: any) => (
              <div className="event-row" key={evt.eventId}>
                <img src={evt.imageUrl} alt={evt.eventName} />
                <div className="info">
                  <div className="name">{evt.eventName}</div>
                  <div className="date">{new Date(evt.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="occ">{evt.occupancy}%</div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>ไม่มีงานที่กำลังจะถึง</div>
            )}
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-head">
          <h3>การจองล่าสุด</h3>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>งาน</th>
                <th>บูธ</th>
                <th>สถานะ</th>
                <th style={{ textAlign: 'right' }}>ยอดเงิน</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length > 0 ? recentBookings.map((b: any) => (
                <tr key={b.bookingId}>
                  <td>
                    <div className="vendor-cell">
                      <div className="avatar">{b.vendorName.charAt(0)}</div>
                      {b.vendorName}
                    </div>
                  </td>
                  <td>{b.eventName}</td>
                  <td>{b.booths || '-'}</td>
                  <td>
                    {b.status === 'verified' ? (
                      <span className="pill paid">ชำระแล้ว</span>
                    ) : (
                      <span className="pill pending">รอชำระเงิน</span>
                    )}
                  </td>
                  <td className="amount">{formatCurrency(b.amount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีการจองล่าสุด</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
