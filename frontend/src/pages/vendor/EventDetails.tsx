import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Users, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [booths, setBooths] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<number | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
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

  if (!event) return <div className="container">Loading...</div>;

  const selectedBoothData = booths.find(b => b.boothId === selectedBooth);
  
  // Calculate dynamic height to fit all booths without vertical scrolling
  const maxBoothY = booths.length > 0 ? Math.max(...booths.map(b => (b.posY || 0) + (b.height || 60))) : 400;
  const containerHeight = Math.max(400, maxBoothY + 40);

  return (
    <div className="container animate-fade-in">
      <div className="glass-card mb-6">
        <h1>{event.eventName}</h1>
        <p className="text-muted mt-2">{t('location')}: {event.location || 'TBA'}</p>
        <div className="flex gap-4 mt-4">
          <span className="badge badge-primary">{event.eventStatus}</span>
          <span className="badge badge-neutral">
            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <h2 className="mb-4">{t('available_booths')}</h2>
      
      {/* Legend */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', 
        marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff', 
        borderRadius: '0.75rem', border: '1px solid var(--border)', 
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>สัญลักษณ์ (Legend):</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#bfdbfe', border: '1px solid #93c5fd' }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>บูธว่าง (Available)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#fed7aa', border: '1px solid #fdba74' }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ถูกจองแล้ว (Booked)</span>
        </div>
        {zones.map(z => (
          <div key={z.zoneId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: `${z.color}33`, border: `1px solid ${z.color}` }}></div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{z.zoneName}</span>
          </div>
        ))}
      </div>
      
      <div className="glass-card mb-6" style={{ 
        position: 'relative', 
        height: `${containerHeight}px`, 
        padding: 0,
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', 
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0',
        border: '1px solid var(--border)', 
        overflowX: 'auto',
        overflowY: 'hidden'
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
                backgroundColor: booth.zone?.color ? `${booth.zone.color}33` : (booth.status === 'booked' ? '#fed7aa' : '#bfdbfe'),
                borderRadius: '4px',
                color: booth.zone?.color || (booth.status === 'booked' ? '#9a3412' : '#1e3a8a'),
                border: '1px solid',
                borderColor: selectedBooth === booth.boothId ? 'var(--primary)' : (booth.zone?.color || (booth.status === 'booked' ? '#fdba74' : '#93c5fd')),
                boxShadow: selectedBooth === booth.boothId ? '0 0 0 3px rgba(139, 92, 246, 0.3)' : 'none',
                userSelect: 'none',
                opacity: booth.status === 'booked' ? 0.7 : 1,
                cursor: booth.status === 'available' ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                overflow: 'hidden',
                padding: '2px'
              }}
              onClick={() => {
                if (booth.status === 'available') {
                  setSelectedBooth(booth.boothId);
                }
              }}
            >
              <span style={{ 
                width: '100%', 
                textAlign: 'center', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                lineHeight: '1.2'
              }}>{booth.boothNo}</span>
              {booth.price && (
                <span style={{ 
                  fontSize: '0.65rem', 
                  opacity: 0.7,
                  lineHeight: '1.2',
                  marginTop: '2px'
                }}>฿{booth.price}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedBoothData && (
        <div className="glass-card mb-6">
          <h3 className="mb-4">Booth {selectedBoothData.boothNo} Selected</h3>
          
          {selectedBoothData.status === 'available' && user && (
            <div className="form-group mb-4" style={{ backgroundColor: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <label className="flex items-center gap-3 cursor-pointer" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  id="acceptEventTerms"
                  checked={acceptedTerms} 
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', userSelect: 'none' }}>
                  ฉันได้อ่านและยอมรับ{' '}
                  <span 
                    style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                  >
                    กฎระเบียบและข้อตกลงการเช่าบูธ
                  </span> 
                  {' '}ของงานแฟร์นี้แล้ว
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end">
            {!user ? (
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Sign In to Book
              </button>
            ) : selectedBoothData.status === 'available' ? (
              <button 
                className="btn btn-primary" 
                onClick={handleBook} 
                disabled={loading || !acceptedTerms} 
                style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
              >
                {loading ? t('processing') : t('confirm_booking')}
              </button>
            ) : selectedBoothData.status === 'booked' ? (
              <button 
                className="btn btn-neutral" 
                onClick={handleBook} 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Join Waitlist'}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button 
              onClick={() => setShowTermsModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>กฎระเบียบและข้อตกลงการเช่าบูธ</h2>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem', color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>1. การชำระเงิน</h3>
              <p>ผู้เช่าต้องชำระเงินค่าเช่าบูธภายใน 24 ชั่วโมงหลังจากกดจอง หากเกินกำหนดเวลา ระบบจะทำการยกเลิกการจองโดยอัตโนมัติเพื่อให้สิทธิ์แก่ผู้อื่น</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>2. สินค้าที่ไม่อนุญาตให้จำหน่าย</h3>
              <p>ห้ามจำหน่ายสินค้าผิดกฎหมาย ยาเสพติด อาวุธ เครื่องดื่มแอลกอฮอล์ (หากไม่ได้รับอนุญาต) และสินค้าที่ละเมิดลิขสิทธิ์ทุกชนิด</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>3. การรักษาความสะอาดและการใช้พื้นที่</h3>
              <p>ผู้เช่าต้องรักษาความสะอาดภายในบริเวณบูธของตนเอง และทิ้งขยะในจุดที่จัดไว้ให้เท่านั้น ห้ามวางสิ่งของล้ำออกมานอกเขตบูธที่กำหนดไว้</p>
              
              <h3 style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#1e293b' }}>4. การยกเลิกและขอคืนเงิน</h3>
              <p>ไม่สามารถขอคืนเงินได้ทุกกรณี ยกเว้นเกิดจากความผิดพลาดของผู้จัดงาน หรือมีการยกเลิกการจัดงานแฟร์ทั้งหมด</p>
            </div>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  setShowTermsModal(false);
                  setAcceptedTerms(true);
                }}
                style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
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
