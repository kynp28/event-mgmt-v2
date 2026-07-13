import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, MousePointerClick, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [booths, setBooths] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<number | null>(null);
  const [hoveredBooth, setHoveredBooth] = useState<any | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
        
        const boothRes = await api.get(`/layout/events/${id}/booths`);
        setBooths(boothRes.data.data || []);
        
        const zoneRes = await api.get(`/layout/events/${id}/zones`);
        setZones(zoneRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = async () => {
    if (!selectedBooth) return;
    if (!user) {
      navigate('/login');
      return;
    }
    
    const booth = booths.find(b => b.boothId === selectedBooth);
    if (!booth) return;

    if (booth.status === 'available' && !acceptedTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      if (booth.status === 'available') {
        await api.post('/bookings', { eventId: Number(id), boothId: selectedBooth });
        alert('Booking successful!');
        navigate('/vendor');
      } else if (booth.status === 'booked') {
        await api.post('/waitlist', { eventId: Number(id), boothId: selectedBooth });
        alert('Joined waitlist successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  const selectedBoothData = booths.find(b => b.boothId === selectedBooth);
  
  // Dynamic Map sizing
  const maxBoothY = booths.length > 0 ? Math.max(...booths.map(b => (b.posY || 0) + (b.height || 60))) : 400;
  const containerHeight = Math.max(400, maxBoothY + 40);

  // Booth Stats
  const totalBooths = booths.length;
  const availableBooths = booths.filter(b => b.status === 'available').length;
  const bookedBooths = booths.filter(b => b.status === 'booked').length;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }} className="animate-fade-in">
      {/* 1. Hero / Banner Section */}
      <div style={{ 
        width: '100%', 
        height: '380px', 
        backgroundColor: '#1e293b', 
        backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '-120px', position: 'relative', zIndex: 10 }}>
        
        {/* Layout: Main Details (Left) and Sticky Booking Card (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 2. Event Header Card */}
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <span className="badge badge-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  {event.eventStatus === 'open' ? 'เปิดรับจอง' : event.eventStatus === 'closed' ? 'ปิดรับจอง' : event.eventStatus}
                </span>
              </div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>{event.eventName}</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Calendar size={24} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>ระยะเวลาจัดงาน</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                      {new Date(event.startDate).toLocaleDateString('th-TH')} - {new Date(event.endDate).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={24} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>สถานที่จัดงาน</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      {event.location || 'รอระบุสถานที่'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>รายละเอียดงาน</h2>
                <div style={{ color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {event.description || 'ผู้จัดงานยังไม่ได้ระบุรายละเอียดเพิ่มเติม'}
                </div>
              </div>
            </div>

            {/* 3. Booth Map Floor Plan Section */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>ผังบูธ (Floor Plan)</h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>คลิกที่บูธเพื่อดูรายละเอียดและทำการจอง</p>
                </div>

                {/* Booth Statistics */}
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ textAlign: 'center', padding: '0 0.5rem', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ทั้งหมด</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalBooths}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 0.5rem', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ว่าง</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success)' }}>{availableBooths}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ถูกจองแล้ว</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--warning)' }}>{bookedBooths}</div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div style={{ 
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', 
                marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff', 
                borderRadius: '8px', border: '1px dashed #cbd5e1' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#bfdbfe', border: '1px solid #93c5fd' }}></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>บูธว่าง</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#fed7aa', border: '1px solid #fdba74' }}></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>ถูกจองแล้ว</span>
                </div>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)' }}></div>
                {zones.map(z => (
                  <div key={z.zoneId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: `${z.color}33`, border: `1px solid ${z.color}` }}></div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{z.zoneName}</span>
                  </div>
                ))}
              </div>
              
              {/* Map Container */}
              <div style={{ 
                position: 'relative', 
                height: `${containerHeight}px`, 
                backgroundColor: '#ffffff',
                backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', 
                backgroundSize: '20px 20px',
                borderRadius: '12px',
                border: '1px solid var(--border)', 
                overflowX: 'auto',
                overflowY: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  {booths.map(booth => (
                    <div 
                      key={booth.boothId} 
                      style={{ 
                        position: 'absolute',
                        left: `${booth.posX || 0}px`,
                        top: `${booth.posY || 0}px`,
                        width: `${booth.width || 80}px`, 
                        height: `${booth.height || 60}px`, 
                        backgroundColor: booth.status === 'booked' ? '#fed7aa' : (booth.zone?.color ? `${booth.zone.color}33` : '#bfdbfe'),
                        borderRadius: '6px',
                        color: booth.status === 'booked' ? '#9a3412' : (booth.zone?.color || '#1e3a8a'),
                        border: '2px solid',
                        borderColor: selectedBooth === booth.boothId ? 'var(--primary)' : (booth.status === 'booked' ? '#fdba74' : (booth.zone?.color || '#93c5fd')),
                        boxShadow: selectedBooth === booth.boothId ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                        userSelect: 'none',
                        opacity: booth.status === 'booked' ? 0.8 : 1,
                        cursor: booth.status === 'available' ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        overflow: 'hidden',
                        padding: '2px'
                      }}
                      onMouseEnter={() => setHoveredBooth(booth)}
                      onMouseLeave={() => setHoveredBooth(null)}
                      onClick={() => {
                        if (booth.status === 'available') {
                          setSelectedBooth(booth.boothId);
                          // Scroll to bottom safely
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }
                      }}
                    >
                      <span style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
                        {booth.boothNo}
                      </span>
                      {booth.price && (
                        <span style={{ fontSize: '0.65rem', opacity: 0.8, lineHeight: '1.2', marginTop: '2px', fontWeight: 600 }}>
                          ฿{booth.price}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Hover Tooltip */}
                  {hoveredBooth && (
                    <div style={{
                      position: 'absolute',
                      top: Math.max(0, (hoveredBooth.posY || 0) - 20),
                      left: (hoveredBooth.posX || 0) + (hoveredBooth.width || 80) + 15,
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      color: 'white',
                      padding: '1rem',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      zIndex: 9999,
                      pointerEvents: 'none',
                      minWidth: '200px'
                    }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'white' }}>บูธ {hoveredBooth.boothNo}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#cbd5e1' }}>สถานะ:</span>
                          <span style={{ fontWeight: 600, color: hoveredBooth.status === 'booked' ? '#fca5a5' : '#86efac' }}>
                            {hoveredBooth.status === 'booked' ? 'ถูกจองแล้ว' : 'ว่าง'}
                          </span>
                        </div>
                        {hoveredBooth.zone && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#cbd5e1' }}>โซน:</span>
                            <span style={{ fontWeight: 600 }}>{hoveredBooth.zone.zoneName}</span>
                          </div>
                        )}
                        {hoveredBooth.price && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#cbd5e1' }}>ราคา:</span>
                            <span style={{ fontWeight: 600, color: '#fde047' }}>฿{hoveredBooth.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 4. Action Booking Panel (Appears when booth selected) */}
            {selectedBoothData && (
              <div className="glass-card" style={{ padding: '2rem', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-card)', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>ยืนยันการทำรายการ</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>บูธที่เลือก: <strong style={{ color: 'var(--primary)' }}>{selectedBoothData.boothNo}</strong></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ราคาสุทธิ</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>฿{selectedBoothData.price || '0.00'}</div>
                  </div>
                </div>
                
                {selectedBoothData.status === 'available' && user && (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={acceptedTerms} 
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', marginTop: '2px' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: '#166534', lineHeight: '1.5' }}>
                        ข้าพเจ้าได้อ่านและยอมรับ{' '}
                        <span 
                          style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowTermsModal(true);
                          }}
                        >
                          กฎระเบียบและข้อตกลงการเช่าบูธ
                        </span> 
                        {' '}รวมถึงเงื่อนไขต่างๆ ของงานแฟร์นี้เรียบร้อยแล้ว
                      </span>
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setSelectedBooth(null)} 
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    ยกเลิก
                  </button>
                  {!user ? (
                    <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ padding: '0.75rem 2rem' }}>
                      เข้าสู่ระบบเพื่อจอง
                    </button>
                  ) : selectedBoothData.status === 'available' ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={handleBook} 
                      disabled={loading || !acceptedTerms} 
                      style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem', opacity: (!acceptedTerms || loading) ? 0.6 : 1 }}
                    >
                      {loading ? t('processing') : 'ยืนยันการจอง'}
                    </button>
                  ) : selectedBoothData.status === 'booked' ? (
                    <button 
                      className="btn btn-neutral" 
                      onClick={handleBook} 
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'ลงชื่อ Waitlist'}
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <button 
              onClick={() => setShowTermsModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a', paddingRight: '2rem' }}>กฎระเบียบและข้อตกลงการเช่าบูธ</h2>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem', color: '#334155', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <h3 style={{ fontWeight: 700, marginTop: '0', marginBottom: '0.5rem', color: '#1e293b' }}>1. การชำระเงิน</h3>
              <p style={{ marginBottom: '1.25rem' }}>ผู้เช่าต้องชำระเงินค่าเช่าบูธภายใน 24 ชั่วโมงหลังจากกดจอง หากเกินกำหนดเวลา ระบบจะทำการยกเลิกการจองโดยอัตโนมัติเพื่อให้สิทธิ์แก่ผู้อื่น</p>
              
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>2. สินค้าที่ไม่อนุญาตให้จำหน่าย</h3>
              <p style={{ marginBottom: '1.25rem' }}>ห้ามจำหน่ายสินค้าผิดกฎหมาย ยาเสพติด อาวุธ เครื่องดื่มแอลกอฮอล์ (หากไม่ได้รับอนุญาต) และสินค้าที่ละเมิดลิขสิทธิ์ทุกชนิด</p>
              
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>3. การรักษาความสะอาดและการใช้พื้นที่</h3>
              <p style={{ marginBottom: '1.25rem' }}>ผู้เช่าต้องรักษาความสะอาดภายในบริเวณบูธของตนเอง และทิ้งขยะในจุดที่จัดไว้ให้เท่านั้น ห้ามวางสิ่งของล้ำออกมานอกเขตบูธที่กำหนดไว้</p>
              
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>4. การยกเลิกและขอคืนเงิน</h3>
              <p style={{ marginBottom: '1.25rem' }}>ไม่สามารถขอคืนเงินได้ทุกกรณี ยกเว้นเกิดจากความผิดพลาดของผู้จัดงาน หรือมีการยกเลิกการจัดงานแฟร์ทั้งหมด</p>
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setShowTermsModal(false)}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                ปิด
              </button>
              <button 
                onClick={() => {
                  setShowTermsModal(false);
                  setAcceptedTerms(true);
                }}
                style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px var(--primary-glow)' }}
              >
                ฉันเข้าใจและยอมรับ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
