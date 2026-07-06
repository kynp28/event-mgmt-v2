import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Search, Users, Map, ChevronRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [appliedSearch, setAppliedSearch] = useState({ query: '', location: '' });

  // Example stats for vendors
  const benefits = [
    { icon: Map, title: 'ทำเลทอง', desc: 'เลือกทำเลที่คุณต้องการได้จากผังบูธออนไลน์แบบเรียลไทม์' },
    { icon: Users, title: 'เข้าถึงลูกค้ามหาศาล', desc: 'งานแฟร์ที่ได้รับความนิยม พร้อมระบบโปรโมทแบบครบวงจร' },
    { icon: ShieldCheck, title: 'จัดการง่ายและปลอดภัย', desc: 'ระบบชำระเงินออนไลน์และจัดการสิทธิ์การจองแบบโปร่งใส' }
  ];

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
    document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
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
    <div style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* Hero Section */}
      <div style={{ padding: '6rem 1.5rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', padding: '0' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            ค้นพบงานแฟร์และ<span style={{ color: 'var(--primary)' }}>จองพื้นที่ขาย</span>ที่ดีที่สุด
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            แพลตฟอร์มที่ช่วยให้พ่อค้าแม่ค้าค้นหางานแสดงสินค้า เลือกจองบูธที่ถูกใจ และจัดการยอดขายได้อย่างมืออาชีพ
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 600, fontSize: '1.125rem', boxShadow: '0 4px 6px -1px var(--primary-glow)' }}>
              ลงทะเบียนผู้ค้า ฟรี
            </Link>
            <Link to="/login" style={{ backgroundColor: '#F8FAFC', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 600, fontSize: '1.125rem' }}>
              สำหรับผู้จัดงาน
            </Link>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', flex: 2, minWidth: '200px' }}>
              <Search size={20} color="var(--text-muted)" style={{ marginRight: '0.75rem' }} />
              <input 
                type="text" 
                placeholder="ค้นหางานแฟร์..." 
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
              </select>
            </div>
            <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      {/* Why Choose Us / Benefits for Vendors */}
      <div style={{ padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '1000px', padding: '0' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>ทำไมพ่อค้าแม่ค้าถึงเลือกเรา?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>หมดปัญหาเรื่องการต่อคิวจองบูธ หรือโดนโกงค่าเช่า</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#EFF6FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                  <b.icon size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{b.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Events */}
      <div id="events-section" style={{ padding: '5rem 1.5rem', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '0' }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                {appliedSearch.query || appliedSearch.location ? 'ผลการค้นหา' : 'งานถนนคนเดินที่กำลังเปิดให้จอง'}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {appliedSearch.query || appliedSearch.location 
                  ? `ค้นหา: "${appliedSearch.query}" ${appliedSearch.location ? `ในจังหวัด ${appliedSearch.location}` : ''} (พบ ${filteredEvents.length} รายการ)`
                  : 'เลือกลงทุนในงานที่มีผู้คนพลุกพล่าน'
                }
              </p>
            </div>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              ดูงานทั้งหมด <ChevronRight size={20} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', animation: 'pulse 2s infinite' }}>กำลังโหลดข้อมูล...</span>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>ไม่พบงานแฟร์ที่ค้นหา</h3>
              <p style={{ color: 'var(--text-muted)' }}>ลองเปลี่ยนคำค้นหา หรือเลือกสถานที่อื่นๆ ดูนะครับ</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLocation('');
                  setAppliedSearch({ query: '', location: '' });
                }}
                style={{ marginTop: '1.5rem', padding: '0.5rem 1.25rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
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
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{event.eventName}</h3>
                    
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
                        ดูรายละเอียดผังบูธ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clean Footer */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '4rem 1.5rem 2rem' }}>
        <div className="container" style={{ padding: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div style={{ gridColumn: 'span 2' }}>
              <h3 style={{ color: '#F8FAFC', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>EventCore</h3>
              <p style={{ maxWidth: '300px', marginBottom: '1.5rem' }}>แพลตฟอร์มจัดการงานแสดงสินค้าและตลาดนัดออนไลน์ ที่ทันสมัยที่สุดในประเทศไทย</p>
            </div>
            <div>
              <h4 style={{ color: '#F8FAFC', fontWeight: 600, marginBottom: '1.25rem' }}>สำหรับพ่อค้าแม่ค้า</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><Link to="/events" style={{ color: '#94A3B8' }}>ค้นหางานแฟร์</Link></li>
                <li><Link to="/register" style={{ color: '#94A3B8' }}>วิธีจองบูธ</Link></li>
                <li><Link to="/" style={{ color: '#94A3B8' }}>ราคาและค่าธรรมเนียม</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#F8FAFC', fontWeight: 600, marginBottom: '1.25rem' }}>ช่วยเหลือ</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><Link to="/" style={{ color: '#94A3B8' }}>ติดต่อสอบถาม</Link></li>
                <li><Link to="/" style={{ color: '#94A3B8' }}>ข้อกำหนดการใช้งาน</Link></li>
                <li><Link to="/" style={{ color: '#94A3B8' }}>นโยบายความเป็นส่วนตัว</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid #1E293B', textAlign: 'center', fontSize: '0.875rem' }}>
            © 2026 EventCore. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
