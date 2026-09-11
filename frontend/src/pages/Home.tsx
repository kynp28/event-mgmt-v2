import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');

  // Categories based on designer's prototype
  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'tech', label: 'เทคโนโลยี' },
    { id: 'food', label: 'อาหาร' },
    { id: 'music', label: 'ดนตรี' },
    { id: 'business', label: 'ธุรกิจ' }
  ];

  // Fetch events from backend
  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const res = await api.get('/events/active');
      return res.data.data;
    }
  });

  const getImageUrl = (imageUrl: string, eventId: number = 0) => {
    const placeholders = [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800'
    ];
    const fallback = placeholders[eventId % placeholders.length];
    
    if (!imageUrl || !imageUrl.includes('/') && !imageUrl.startsWith('http')) return fallback;
    
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      return imageUrl;
    } catch {
      if (imageUrl.startsWith('http')) return imageUrl;
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
      const formattedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${baseUrl}${formattedUrl}`;
    }
  };

  // Filter events based on search and category
  const filteredEvents = (events || []).filter((event: any) => {
    // Exclude ended fairs from homepage showcase unless they specifically search for it
    const isEnded = Boolean(event.isEnded || (event.endDate && new Date(event.endDate) < new Date()) || event.eventStatus === 'ended');
    if (isEnded) return false;
    
    const name = event.eventName || '';
    const loc = event.location || '';
    const org = event.organizer?.username || '';
    const cat = event.category || 'default';
    
    const matchQuery = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Category match
    const mapCatIdToLabel = (catId: string) => {
      const found = categories.find(c => c.id === catId);
      return found ? found.label : 'ทั้งหมด';
    };
    
    const eventCatLabel = mapCatIdToLabel(cat);
    const matchCategory = activeCategory === 'ทั้งหมด' || eventCatLabel === activeCategory || cat === activeCategory;
    
    return matchQuery && matchCategory;
  });

  const getStatusMap = (status: string, availableStats: number, totalStats: number) => {
    if (status === 'closed') {
      return { label: "ปิดจอง", color: "var(--status-closed)", bg: "var(--status-closed-bg)" };
    }
    
    // Check if almost full (less than 15% left or <= 5 booths)
    const ratio = totalStats > 0 ? availableStats / totalStats : 0;
    if (status === 'open' && (availableStats <= 5 || ratio < 0.15) && totalStats > 0) {
      return { label: "ใกล้เต็ม", color: "var(--status-almost-full)", bg: "var(--status-almost-full-bg)" };
    }
    
    return { label: "เปิดจอง", color: "var(--status-open)", bg: "var(--status-open-bg)" };
  };

  const getCategoryTheme = (cat: string) => {
    // Mapping db category string to token names
    const c = (cat || 'default').toLowerCase();
    const validCats = ['music', 'food', 'tech', 'business'];
    const theme = validCats.includes(c) ? c : 'default';
    return {
      color: `var(--cat-${theme})`,
      bg: `var(--cat-${theme}-bg)`
    };
  };

  const mapCatIdToLabel = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.label : (catId || 'ทั่วไป');
  };

  return (
    <>
      <section className="hero">
        <h1>งานกำลังจะเริ่มแล้ว <span className="stat">{events?.filter((e: any) => e.eventStatus === 'open').length || 0} อีเวนต์</span> เปิดจองอยู่ตอนนี้</h1>
        <p>เลือกดูงานอีเวนต์และจองบูธที่คุณสนใจได้จากที่เดียว</p>

        <div className="search-row">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input 
              type="text" 
              placeholder="ค้นหาชื่องาน สถานที่ หรือผู้จัด"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-btn-mobile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
            ตัวกรอง
          </button>
        </div>

        <div className="chips">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className={`chip ${activeCategory === cat.label || activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id === 'all' ? 'ทั้งหมด' : cat.id)}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </section>

      <div className="grid-wrap">
        {isLoading ? (
          <div className="grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="event-card" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-muted)', animation: 'pulse 2s infinite' }}>กำลังโหลดข้อมูล...</span>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-default)', marginTop: '24px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }}>
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>ไม่พบงานอีเวนต์</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ใหม่ดูนะครับ</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('ทั้งหมด');
              }}
              style={{ marginTop: '24px', padding: '10px 20px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            >
              ดูงานทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid">
            {filteredEvents.map((event: any) => {
              const totalStats = event.boothStats?.total || 0;
              const availableStats = event.boothStats?.available || 0;
              const bookedStats = event.boothStats?.booked || 0;
              
              const s = getStatusMap(event.eventStatus, availableStats, totalStats);
              const cTheme = getCategoryTheme(event.category);
              const isFree = event.startingPrice === 0 || event.startingPrice === '0.00';
              const availRatio = totalStats > 0 ? (bookedStats / totalStats) : 0;
              
              const organizerName = event.organizer?.username || 'Event Organizer';

              return (
                <Link to={`/events/${event.eventId}`} key={event.eventId} className="event-card">
                  <div className="card-img-wrap">
                    <img 
                      src={getImageUrl(event.imageUrl, event.eventId)} 
                      alt={event.eventName} 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'; }}
                    />
                    <div className="card-badges">
                      <span className="cat-badge" style={{ background: cTheme.bg, color: cTheme.color }}>
                        {mapCatIdToLabel(event.category)}
                      </span>
                      <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                        <span className="status-dot" style={{ background: s.color }}></span>
                        {s.label}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-title">{event.eventName}</div>
                    <div className="card-meta">
                      <div className="meta-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} – {new Date(event.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="meta-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {event.location || 'ไม่ระบุสถานที่'}
                      </div>
                    </div>
                    <div className="avail-bar">
                      <div className={`avail-fill ${availRatio > 0.85 ? 'low' : ''}`} style={{ width: `${availRatio * 100}%` }}></div>
                    </div>
                    <div className="card-footer">
                      <div className="organizer">
                        <span className="organizer-dot">{organizerName.charAt(0).toUpperCase()}</span>
                        {organizerName}
                      </div>
                      <span className={`price ${isFree ? 'free' : ''}`}>
                        {isFree ? 'ฟรี' : `เริ่ม ฿${Number(event.startingPrice).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
