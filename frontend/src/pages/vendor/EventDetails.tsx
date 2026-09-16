import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './EventDetails.css'; // We will create this

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [booths, setBooths] = useState<any[]>([]);
  const [selectedBooths, setSelectedBooths] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
        
        const boothRes = await api.get(`/layout/events/${id}/booths`);
        setBooths(boothRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleBooth = (boothId: number, status: string) => {
    if (status === 'booked' || status === 'pending') return;
    setSelectedBooths(prev => {
      const next = new Set(prev);
      if (next.has(boothId)) next.delete(boothId);
      else next.add(boothId);
      return next;
    });
  };

  const handleBook = async () => {
    if (selectedBooths.size === 0) return;
    if (!user) {
      navigate('/login');
      return;
    }
    
    const selectedList = Array.from(selectedBooths).map(id => booths.find(b => b.boothId === id)).filter(Boolean);
    navigate('/checkout', { state: { event, selectedBooths: selectedList } });
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const getImageUrl = (imageUrl: string | null | undefined, eventId: number = 0) => {
    const placeholders = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80'
    ];
    if (!imageUrl || !imageUrl.includes('/') && !imageUrl.startsWith('http')) return placeholders[eventId % placeholders.length];
    
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      return imageUrl;
    } catch {
      return imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
    }
  };

  if (loading || !event) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        กำลังโหลดข้อมูลอีเวนต์...
      </div>
    );
  }

  // Calculate totals
  const selectedList = Array.from(selectedBooths).map(id => booths.find(b => b.boothId === id)).filter(Boolean);
  const totalAmount = selectedList.reduce((sum, b) => sum + Number(b.price || 0), 0);
  
  // Starting Price
  const prices = booths.map(b => Number(b.price || 0));
  const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
  
  // Category mapping
  const categoryMap: Record<string, { label: string, token: string }> = {
    'tech': { label: 'เทคโนโลยี', token: 'tech' },
    'food': { label: 'อาหาร', token: 'food' },
    'music': { label: 'ดนตรี', token: 'music' },
    'business': { label: 'ธุรกิจ', token: 'business' },
  };
  const cat = event.category || 'default';
  const cInfo = categoryMap[cat.toLowerCase()] || { label: cat, token: 'default' };

  // Calculate dynamic dimensions for floorplan
  const maxBoothX = booths.length > 0 ? Math.max(...booths.map(b => (b.posX || 0) + (b.width || 80))) : 800;
  const maxBoothY = booths.length > 0 ? Math.max(...booths.map(b => (b.posY || 0) + (b.height || 60))) : 400;
  const containerWidth = Math.max(maxBoothX + 40, 800);
  const containerHeight = Math.max(maxBoothY + 40, 400);

  return (
    <div className="event-details-page">
      <nav className="navbar">
        <div className="back-btn" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          กลับหน้ารวม
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
        </button>
      </nav>

      <div className="event-hero">
        <img src={getImageUrl(event.imageUrl, event.eventId)} alt={event.eventName} />
        <div className="event-hero-content">
          {event.category && <span className="cat-pill" style={{ background: `var(--cat-${cInfo.token}-bg)`, color: `var(--cat-${cInfo.token})` }}>{cInfo.label}</span>}
          <h1>{event.eventName}</h1>
        </div>
      </div>

      <div className="layout">
        <div>
          <div className="info-row">
            <div className="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <div><div className="label">วันที่</div><div className="value">{new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} – {new Date(event.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
            </div>
            <div className="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <div><div className="label">สถานที่</div><div className="value">{event.location || 'ไม่ระบุสถานที่'}</div></div>
            </div>
            <div className="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <div><div className="label">ผู้จัดงาน</div><div className="value">{event.organizer?.username || 'ผู้จัดงานทั่วไป'}</div></div>
            </div>
            <div className="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/></svg>
              <div><div className="label">ราคาเริ่มต้น</div><div className="value">{startingPrice === 0 ? 'ฟรี' : `฿${startingPrice.toLocaleString()}`}</div></div>
            </div>
          </div>

          <div className="section-title">เกี่ยวกับงานนี้</div>
          <p className="desc">{event.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>

          <div className="floorplan-card">
            <div className="section-title" style={{ marginBottom: '16px' }}>เลือกบูธที่ต้องการจอง</div>
            <div className="floorplan-legend">
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--booth-available-fill)', borderColor: 'var(--booth-available-border)' }}></span>ว่าง</div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--booth-pending-fill)', borderColor: 'var(--booth-pending-border)' }}></span>กำลังถูกจอง</div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--booth-booked-fill)', borderColor: 'var(--booth-booked-border)' }}></span>จองแล้ว</div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}></span>ที่คุณเลือก</div>
            </div>
            
            <div className="stage">ทางเข้างาน / STAGE</div>
            
            <div style={{ position: 'relative', width: '100%', overflowX: 'auto', paddingBottom: '20px' }}>
              <div style={{ position: 'relative', width: `${containerWidth}px`, height: `${containerHeight}px`, margin: '0 auto', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                {booths.map(b => {
                  const isSelected = selectedBooths.has(b.boothId);
                  let cls = b.status === 'booked' ? 'booked' : (b.lockState !== 'none' ? 'pending' : 'available');
                  if (isSelected) cls = 'selected';
                  
                  return (
                    <div 
                      key={b.boothId}
                      className={`booth-item ${cls}`}
                      style={{
                        position: 'absolute',
                        left: b.posX,
                        top: b.posY,
                        width: b.width || 80,
                        height: b.height || 60,
                      }}
                      onClick={() => toggleBooth(b.boothId, cls)}
                    >
                      {b.boothNo}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <div className="summary">
          <h3>สรุปการจอง</h3>
          <div className="sub">เลือกได้มากกว่า 1 บูธ</div>
          <div className="selected-list">
            {selectedBooths.size === 0 ? (
              <div className="empty-state">ยังไม่ได้เลือกบูธ</div>
            ) : (
              selectedList.map(b => (
                <div key={b.boothId} className="selected-chip">
                  บูธ {b.boothNo}<span>฿{Number(b.price || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
          <div className="total-row">
            <span className="label">ยอดรวม</span>
            <span className="amount">฿{totalAmount.toLocaleString()}</span>
          </div>
          <button 
            className="book-btn" 
            disabled={selectedBooths.size === 0 || bookingLoading}
            onClick={handleBook}
          >
            {bookingLoading ? 'กำลังดำเนินการ...' : selectedBooths.size === 0 ? 'เลือกบูธเพื่อจอง' : `จอง ${selectedBooths.size} บูธ`}
          </button>
        </div>
      </div>

      <div className="mobile-bar">
        <div>
          <div className="count">{selectedBooths.size === 0 ? 'ยังไม่ได้เลือกบูธ' : `เลือกแล้ว ${selectedBooths.size} บูธ`}</div>
          <div className="amount">฿{totalAmount.toLocaleString()}</div>
        </div>
        <button 
          className="book-btn" 
          disabled={selectedBooths.size === 0 || bookingLoading}
          onClick={handleBook}
        >
          {bookingLoading ? 'รอสักครู่...' : 'จองเลย'}
        </button>
      </div>
    </div>
  );
};
