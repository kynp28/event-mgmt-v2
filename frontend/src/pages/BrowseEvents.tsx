import { useState } from 'react';
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

  const filteredEvents = (events || []).filter((event: any) => {
    const name = event.eventName || '';
    const loc = event.location || '';
    const matchQuery = name.toLowerCase().includes(appliedSearch.query.toLowerCase());
    const matchLocation = appliedSearch.location ? loc.toLowerCase().includes(appliedSearch.location.toLowerCase()) : true;
    return matchQuery && matchLocation;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Search Header */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '3rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem', color: 'var(--text-main)' }}>
            ค้นหางานแฟร์ที่ใช่สำหรับคุณ
          </h1>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', flex: 2, minWidth: '200px' }}>
              <Search size={20} color="var(--text-muted)" style={{ marginRight: '0.75rem' }} />
              <input 
                type="text" 
                placeholder="ค้นหางานแฟร์, ตลาดนัด..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
              />
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', flex: 1, minWidth: '150px' }}>
              <MapPin size={20} color="var(--text-muted)" style={{ marginRight: '0.75rem' }} />
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-main)' }}
              >
                <option value="">ทุกจังหวัด</option>
                <option value="Bangkok">กรุงเทพฯ</option>
                <option value="Buriram">บุรีรัมย์</option>
                {/* Could add more provinces dynamically here later */}
              </select>
            </div>
            <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
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
            <div style={{ padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <Search size={64} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
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
              {filteredEvents.map((event: any) => (
                <div key={event.eventId} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '200px', backgroundColor: '#F1F5F9', position: 'relative' }}>
                    <img 
                      src={getImageUrl(event.imageUrl)} 
                      alt={event.eventName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'; }}
                    />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--bg-card)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      กำลังเปิดจอง
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>{event.eventName}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <Calendar size={16} />
                      {new Date(event.startDate).toLocaleDateString('th-TH')} - {new Date(event.endDate).toLocaleDateString('th-TH')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      <MapPin size={16} />
                      {event.location}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>บูธว่างทั้งหมด</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{event._count?.booths ?? 0} บูธ</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/events/${event.eventId}`)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.25rem', borderRadius: '8px' }}
                      >
                        ดูผังบูธ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
