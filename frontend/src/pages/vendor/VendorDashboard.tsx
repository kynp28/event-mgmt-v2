import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './VendorDashboard.css';

export const VendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data.data;
    }
  });

  const getFilteredBookings = () => {
    if (!bookings) return [];
    const now = new Date();
    return bookings.filter((b: any) => {
      const endDate = new Date(b.event?.endDate || now);
      const isPast = endDate < now;
      if (activeTab === 'all') return true;
      if (activeTab === 'cancelled') return b.status === 'cancelled';
      if (activeTab === 'upcoming') return b.status !== 'cancelled' && !isPast;
      if (activeTab === 'past') return b.status !== 'cancelled' && isPast;
      return true;
    });
  };

  const filteredBookings = getFilteredBookings();

  const getStatusInfo = (booking: any) => {
    if (booking.status === 'cancelled') return { label: 'ยกเลิกแล้ว', className: 'cancelled' };
    
    const endDate = new Date(booking.event?.endDate || new Date());
    if (endDate < new Date()) return { label: 'ผ่านไปแล้ว', className: 'past' };
    
    if (booking.status === 'pending') return { label: 'รอชำระเงิน', className: 'pending' };
    return { label: 'กำลังจะถึง', className: 'upcoming' };
  };

  const getImageUrl = (imageUrl: string | null | undefined, eventId: number = 0) => {
    const placeholders = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80'
    ];
    if (!imageUrl || (!imageUrl.includes('/') && !imageUrl.startsWith('http') && !imageUrl.startsWith('['))) {
      return placeholders[eventId % placeholders.length];
    }
    
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      return imageUrl;
    } catch {
      return imageUrl.startsWith('http') || imageUrl.startsWith('data:') ? imageUrl : `http://localhost:5000${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
    }
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูลการจอง...</div>;

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1 className="page-title">การจองของฉัน</h1>
        <div className="page-sub">รายการบูธที่คุณจองไว้ทั้งหมด</div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>ทั้งหมด</div>
        <div className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>กำลังจะถึง</div>
        <div className={`tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>ผ่านไปแล้ว</div>
        <div className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>ยกเลิก</div>
      </div>

      <div className="list">
        {filteredBookings.length === 0 ? (
          <EmptyState type="no-bookings" />
        ) : (
          filteredBookings.map((b: any) => {
            const status = getStatusInfo(b);
            const imgUrl = getImageUrl(b.event?.imageUrl, b.eventId || b.bookingId);
            
            return (
              <Link to={`/invoice/${b.bookingId}`} key={b.bookingId} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="booking-card">
                  <div className="bc-img"><img src={imgUrl} alt={b.event?.eventName} /></div>
                  <div className="bc-body">
                    <div className="bc-top">
                      <div className="bc-title">{b.event?.eventName || 'ไม่ระบุชื่องาน'}</div>
                      <span className={`status-pill ${status.className}`}>{status.label}</span>
                    </div>
                    <div className="bc-meta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      {new Date(b.event?.startDate || new Date()).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} · {b.event?.location || 'ไม่ระบุ'}
                    </div>
                    <div className="bc-bottom">
                      <div className="booth-tags">
                        <span className="booth-tag">{b.booth?.boothNo || 'N/A'}</span>
                      </div>
                      <div className="bc-ref">Ref: {b.bookingId}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
