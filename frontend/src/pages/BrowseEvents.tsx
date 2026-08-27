import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Search } from 'lucide-react';
import api from '../services/api';

export const BrowseEvents: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [appliedSearch, setAppliedSearch] = useState({ query: '', location: '' });

  const { data: events, isLoading } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: async () => {
      const res = await api.get('/events/active');
      return res.data.data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch({ query: searchQuery, location: selectedLocation });
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800';
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      return imageUrl;
    } catch {
      return imageUrl;
    }
  };

  const filteredEvents = (events || [])
    .filter((event: any) => {
      const name = event.eventName || '';
      const loc = event.location || '';
      const matchQuery = name.toLowerCase().includes(appliedSearch.query.toLowerCase());
      const matchLocation = appliedSearch.location ? loc.toLowerCase().includes(appliedSearch.location.toLowerCase()) : true;
      return matchQuery && matchLocation;
    })
    .sort((a: any, b: any) => {
      const aEnded = Boolean(a.isEnded || (a.endDate && new Date(a.endDate) < new Date()) || a.eventStatus === 'ended');
      const bEnded = Boolean(b.isEnded || (b.endDate && new Date(b.endDate) < new Date()) || b.eventStatus === 'ended');
      if (aEnded === bEnded) {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return aEnded ? 1 : -1;
    });

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Search Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-dark) 100%)', 
        padding: '5rem 1.5rem', 
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '400px', height: '400px', background: 'var(--primary-glow)', filter: 'blur(120px)', borderRadius: '50%', opacity: 0.7 }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '350px', height: '350px', background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.6 }}></div>
        
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            ค้นหางานแฟร์ที่ใช่สำหรับคุณ
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
            รวบรวมงานอีเวนต์ ตลาดนัด และพื้นที่ขายของที่เหมาะกับธุรกิจของคุณ
          </p>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', padding: '0.75rem', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', flex: 2, minWidth: '200px' }}>
              <Search size={22} color="var(--primary)" style={{ marginRight: '0.75rem' }} />
              <input 
                type="text" 
                placeholder="ค้นหางานแฟร์, ตลาดนัด..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1.05rem', backgroundColor: 'transparent', color: 'var(--text-main)' }}
              />
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', flex: 1, minWidth: '150px' }}>
              <MapPin size={22} color="var(--primary)" style={{ marginRight: '0.75rem' }} />
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1.05rem', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-main)', appearance: 'none' }}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>ทุกจังหวัด</option>
                <option value="Bangkok" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>กรุงเทพฯ</option>
                <option value="Buriram" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>บุรีรัมย์</option>
                {/* Could add more provinces dynamically here later */}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem' }}>
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ padding: '4rem 1.5rem' }}>
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {appliedSearch.query || appliedSearch.location ? 'ผลการค้นหา' : 'งานทั้งหมดที่เปิดให้จอง'}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                พบ {filteredEvents.length} รายการ
                {appliedSearch.location && ` ในจังหวัด${appliedSearch.location}`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', animation: 'pulse 2s infinite' }}>กำลังโหลดข้อมูล...</span>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
              <Search size={64} color="var(--border)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>ไม่พบงานแฟร์ที่ตรงกับการค้นหา</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>ลองเปลี่ยนคำค้นหา หรือระบุสถานที่ใหม่ดูนะครับ</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLocation('');
                  setAppliedSearch({ query: '', location: '' });
                }}
                className="btn btn-primary"
              >
                ดูงานทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredEvents.map((event: any) => {
                const isEnded = Boolean(event.isEnded || (event.endDate && new Date(event.endDate) < new Date()) || event.eventStatus === 'ended');
                return (
                <div key={event.eventId} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: isEnded ? 0.85 : 1 }}>
                  <div style={{ height: '220px', backgroundColor: 'var(--bg-dark)', position: 'relative' }}>
                    <img 
                      src={getImageUrl(event.imageUrl)} 
                      alt={event.eventName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isEnded ? 'grayscale(30%)' : 'none' }}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'; }}
                    />
                    <div style={{ 
                      position: 'absolute', top: '1rem', right: '1rem', 
                      backgroundColor: isEnded ? 'rgba(100, 116, 139, 0.9)' : 'rgba(16, 185, 129, 0.9)', 
                      backdropFilter: 'blur(8px)', padding: '0.375rem 1rem', borderRadius: '9999px', 
                      fontSize: '0.75rem', fontWeight: 700, color: 'white', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
                    }}>
                      {isEnded ? 'สิ้นสุดแล้ว (Ended)' : 'กำลังเปิดจอง'}
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{event.eventName}</h3>
                    
                    {event.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: event.description ? '0' : '0.5rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <Calendar size={16} color="var(--primary)" />
                        {new Date(event.startDate).toLocaleDateString('th-TH')} - {new Date(event.endDate).toLocaleDateString('th-TH')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <MapPin size={16} color="var(--danger)" />
                        {event.location}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', backgroundColor: 'var(--bg-card-hover)', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ทั้งหมด</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{event.boothStats?.total ?? 0}</div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ว่าง</div>
                          <div style={{ fontWeight: 700, color: isEnded ? 'var(--text-muted)' : 'var(--primary)' }}>
                            {isEnded ? 0 : (event.boothStats?.available ?? 0)}
                          </div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>จองแล้ว</div>
                          <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{event.boothStats?.booked ?? 0}</div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/events/${event.eventId}`)}
                        className={`btn ${isEnded ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ width: '100%', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}
                      >
                        {isEnded ? 'ดูผังบูธ (สิ้นสุดแล้ว)' : 'ดูผังบูธ'}
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
