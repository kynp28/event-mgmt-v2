import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, X, Image as ImageIcon, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export const CreateEvent: React.FC = () => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 4) {
      setError('คุณสามารถอัปโหลดรูปภาพได้สูงสุด 4 รูปเท่านั้น');
      return;
    }

    let hasError = false;
    const newImages: string[] = [];

    const readPromises = files.map(file => {
      return new Promise<void>((resolve) => {
        if (file.size > 5 * 1024 * 1024) {
          hasError = true;
          resolve();
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(() => {
      if (hasError) {
        setError('ไฟล์รูปภาพบางไฟล์มีขนาดเกิน 5MB');
      } else {
        setError('');
        setImages(prev => [...prev, ...newImages]);
        setCurrentSlide(0); // Reset to first slide when new images are added
      }
      // Reset file input
      if (e.target) e.target.value = '';
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (currentSlide >= newImages.length) {
        setCurrentSlide(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/events', {
        eventName,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        location,
        imageUrl: images.length > 0 ? JSON.stringify(images) : undefined,
      });
      navigate('/organizer/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: 'calc(100vh - 80px)', padding: '2rem 1.5rem' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '1200px', padding: 0 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>สร้างอีเวนต์ใหม่</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>กรอกข้อมูลและดูตัวอย่างการแสดงผลได้ทันที</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* LEFT COLUMN: FORM */}
          <div className="glass-card" style={{ alignSelf: 'start' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>ข้อมูลงานแฟร์</h2>
            {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>รูปภาพแบนเนอร์/โปสเตอร์ (สูงสุด 4 รูป)</label>
                
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < 4 && (
                  <div style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card-hover)', padding: '2rem 1rem', textAlign: 'center', transition: 'background-color 0.2s' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>คลิกเพื่ออัปโหลดรูปภาพ</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>PNG, JPG สูงสุด 5MB (อัปโหลดเพิ่มได้อีก {4 - images.length} รูป)</div>
                    </div>
                    <input type="file" multiple style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} accept="image/*" onChange={handleImageUpload} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('event_name')}</label>
                <input style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} value={eventName} onChange={e => setEventName(e.target.value)} required placeholder="เช่น งานกาชาดประจำปี 2026" />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>คำอธิบายงาน (Description)</label>
                <textarea style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', minHeight: '100px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="เขียนคำอธิบายรายละเอียดงาน เพื่อดึงดูดผู้เช่าบูธ..." />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('start_date')}</label>
                  <input type="datetime-local" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('end_date')}</label>
                  <input type="datetime-local" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('location')}</label>
                <input style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} value={location} onChange={e => setLocation(e.target.value)} placeholder="เช่น ไบเทค บางนา ฮอลล์ 1" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => navigate('/organizer/events')} style={{ flex: 1, padding: '0.875rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>{t('cancel')}</button>
                <button type="submit" disabled={loading} style={{ flex: 2, padding: '0.875rem', border: 'none', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? t('processing') : t('create_event')}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Live Preview (ตัวอย่าง)</h2>
            
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              
              {/* Event Images Slider Preview */}
              <div style={{ width: '100%', height: '240px', backgroundColor: 'var(--bg-card-hover)', position: 'relative', overflow: 'hidden' }}>
                {images.length === 0 ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <ImageIcon size={48} style={{ opacity: 0.3 }} />
                  </div>
                ) : (
                  <>
                    <img src={images[currentSlide]} alt={`preview ${currentSlide}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {images.length > 1 && (
                      <>
                        <button 
                          type="button"
                          onClick={() => setCurrentSlide(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                          style={{ position: 'absolute', top: '50%', left: '0.5rem', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                        >
                          <ChevronLeft size={20} color="var(--text-main)" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCurrentSlide(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                          style={{ position: 'absolute', top: '50%', right: '0.5rem', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                        >
                          <ChevronRight size={20} color="var(--text-main)" />
                        </button>
                        
                        <div style={{ position: 'absolute', bottom: '0.75rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          {images.map((_, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setCurrentSlide(idx)}
                              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentSlide === idx ? 'var(--primary)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} 
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                
                {/* Date Badge */}
                {startDate && (
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>
                      {new Date(startDate).toLocaleString('th-TH', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                      {new Date(startDate).getDate()}
                    </div>
                  </div>
                )}
              </div>

              {/* Event Info Details */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem', wordBreak: 'break-word' }}>
                  {eventName || 'ชื่ออีเวนต์ของคุณ'}
                </h3>
                
                {description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {description}
                  </p>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: description ? '0' : '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Calendar size={16} color="var(--primary)" />
                    <span>
                      {startDate ? new Date(startDate).toLocaleString('th-TH') : 'วันเริ่มต้น'} - {endDate ? new Date(endDate).toLocaleString('th-TH') : 'วันสิ้นสุด'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <MapPin size={16} color="var(--danger)" />
                    <span>{location || 'ระบุสถานที่จัดงาน'}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Users size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>จัดโดย</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>คุณ (ผู้จัดงาน)</div>
                    </div>
                  </div>
                  <button type="button" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem' }}>
                    จองบูธเลย
                  </button>
                </div>

              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>* มุมมองนี้คือตัวอย่างที่พ่อค้าแม่ค้าจะเห็นในแอปพลิเคชัน</p>
          </div>

        </div>
      </div>
    </div>
  );
};
