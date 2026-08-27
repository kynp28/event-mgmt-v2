import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, ArrowUpCircle, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EventCalendar } from '../../components/Calendar/EventCalendar';

const CountdownTimer = ({ deadline }: { deadline: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const distance = end - now;

      if (distance < 0) {
        setExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (expired) return <span style={{ color: 'var(--danger)', fontWeight: 600 }}>หมดเวลาชำระเงิน</span>;
  return <span style={{ color: 'var(--warning)', fontWeight: 600, fontFamily: 'monospace', fontSize: '1.1rem' }}>{timeLeft}</span>;
};

export const VendorDashboard = () => {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'bookings' | 'waitlists' | 'calendar'>('calendar');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data.data;
    }
  });

  const { data: myRequests } = useQuery({
    queryKey: ['myRequests'],
    queryFn: async () => {
      const res = await api.get('/organizer-requests/my');
      return res.data.data || [];
    },
    enabled: !!user && !user.roles.includes('organizer')
  });

  const { data: myWaitlists, refetch: refetchWaitlists } = useQuery({
    queryKey: ['myWaitlists'],
    queryFn: async () => {
      const res = await api.get('/waitlist/my');
      return res.data.data;
    }
  });

  const hasPendingRequest = myRequests?.some((r: any) => r.status === 'pending');
  const isOrganizer = user?.roles.includes('organizer');

  const confirmWaitlist = async (waitlistEntryId: number) => {
    if (!window.confirm('คุณต้องการยืนยันสิทธิ์ในการจองบูธนี้ใช่หรือไม่?')) return;
    try {
      await api.post('/bookings/confirm-waitlist', { waitlistEntryId });
      alert('ยืนยันสิทธิ์สำเร็จ! ระบบได้สร้างบิลชำระเงินให้คุณแล้ว');
      refetch();
      refetchWaitlists();
      setActiveTab('bookings');
    } catch (err: any) {
      alert(err.response?.data?.message || 'ยืนยันสิทธิ์ไม่สำเร็จ');
    }
  };

  const openUploadModal = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setSlipImage(null);
    setUploadModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitPayment = async () => {
    if (!selectedBookingId || !slipImage) return;
    
    setUploading(true);
    try {
      await api.post(`/payments`, { bookingId: selectedBookingId, slipImage });
      alert('อัปโหลดสลิปสำเร็จ!');
      setUploadModalOpen(false);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <div className="container mt-10 text-center">Loading...</div>;

  return (
    <div className="container animate-fade-in">
      {!isOrganizer && (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>ยกระดับธุรกิจของคุณ</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>อัปเกรดเป็นผู้จัดงานเพื่อสร้างและจัดการงานแฟร์ของคุณเอง</p>
          </div>
          {hasPendingRequest ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
              <Clock size={18} /> คำขอของคุณกำลังรออนุมัติ
            </div>
          ) : (
            <Link to="/vendor/upgrade" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpCircle size={18} /> อัปเกรดเป็นผู้จัดงาน
            </Link>
          )}
        </div>
      )}

      {/* Tabs System */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginTop: '2rem' }}>
        <button 
          onClick={() => setActiveTab('calendar')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'calendar' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'calendar' ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.75rem', marginBottom: '-0.75rem'
          }}
        >
          ปฏิทินงานของฉัน
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'bookings' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'bookings' ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.75rem', marginBottom: '-0.75rem'
          }}
        >
          {t('my_bookings', 'การจองของฉัน')}
        </button>
        <button 
          onClick={() => setActiveTab('waitlists')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'waitlists' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'waitlists' ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.75rem', marginBottom: '-0.75rem'
          }}
        >
          คิวสำรองของฉัน
          {myWaitlists?.some((w: any) => w.status === 'waiting' && w.offeredAt && !w.bookingId) && (
            <span style={{ marginLeft: '0.5rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '0 6px', fontSize: '0.8rem', verticalAlign: 'middle' }}>!</span>
          )}
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <EventCalendar 
            events={(bookings || []).filter((b: any) => b.status !== 'cancelled').map((b: any) => ({
              id: b.bookingId,
              title: `${b.event?.eventName || 'อีเวนต์'} (บูธ ${b.booth?.boothNo})`,
              start: new Date(b.event?.startDate || new Date()),
              end: new Date(b.event?.endDate || new Date()),
              status: b.payment?.status === 'verified' ? 'approved' : 'pending',
              resource: { subtitle: b.event?.location || 'สถานที่จัดงาน' }
            }))}
            onEventClick={(event) => {
              // Can optionally scroll to the booking or open a modal
            }}
          />
        </div>
      )}
      
      {activeTab === 'bookings' && (
        !bookings || bookings.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '4rem 1rem' }}>
            <p className="text-muted">{t('no_bookings_yet', 'ยังไม่มีการจองบูธ')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {bookings.map((b: any) => (
              <div key={b.bookingId} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{b.event?.eventName}</h3>
                  <span className={`badge ${
                    b.status === 'confirmed' ? 'badge-success' :
                    (b.status === 'pending' && b.payment?.status === 'rejected') ? 'badge-danger' :
                    b.status === 'pending' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {b.status === 'confirmed' ? t('confirmed', 'ยืนยันแล้ว') : 
                     (b.status === 'pending' && b.payment?.status === 'rejected') ? 'สลิปไม่ถูกต้อง (ส่งใหม่)' :
                     b.status === 'pending' ? t('pending', 'รอชำระเงิน') : 
                     b.status === 'cancelled' ? t('cancelled', 'ยกเลิกแล้ว') : b.status}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('booth', 'บูธ')}: {b.booth?.boothNo}</p>
                <p style={{ fontWeight: 700, fontSize: '1.125rem', marginTop: '0.5rem', color: 'var(--primary)' }}>฿{b.totalAmount}</p>
                
                {b.status === 'pending' && b.paymentDeadline && !b.payment && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="var(--warning)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>เหลือเวลา:</span>
                    <CountdownTimer deadline={b.paymentDeadline} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Link to={`/invoice/${b.bookingId}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none' }} className="hover-underline">
                    {t('view_invoice', 'ดูใบแจ้งหนี้')}
                  </Link>
                </div>

                {/* Pending without payment */}
                {b.status === 'pending' && !b.payment && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openUploadModal(b.bookingId)}>{t('upload_payment', 'อัปโหลดสลิปโอนเงิน')}</button>
                  </div>
                )}

                {/* Pending with payment submitted / rejected */}
                {b.status === 'pending' && b.payment && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    {b.payment.status === 'rejected' ? (
                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.875rem', borderRadius: '8px', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>❌ สลิปถูกปฏิเสธ</span>
                        </div>
                        {b.cancelReason && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.65rem', backgroundColor: 'var(--bg-card)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <strong>สาเหตุ:</strong> {b.cancelReason}
                          </div>
                        )}
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={() => openUploadModal(b.bookingId)}>
                          <Clock size={14} /> อัปโหลดสลิปใหม่
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                          {t('payment_submitted', 'ส่งสลิปแล้ว กำลังรอผู้จัดงานตรวจสอบ...')}
                        </div>
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
                          onClick={() => openUploadModal(b.bookingId)}
                        >
                          อัปโหลดสลิปใหม่ (แทนที่อันเดิม)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancelled Booking */}
                {b.status === 'cancelled' && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#b91c1c', textAlign: 'left' }}>
                      {b.cancelReason ? `🚫 เหตุผลที่ยกเลิก: ${b.cancelReason}` : '🚫 การจองนี้ถูกยกเลิกแล้ว'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'waitlists' && (
        !myWaitlists || myWaitlists.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '4rem 1rem' }}>
            <p className="text-muted">คุณยังไม่มีคิวสำรอง</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {myWaitlists.map((w: any) => (
              <div key={w.waitlistId} className="glass-card" style={{ border: w.offeredAt && w.status === 'waiting' ? '1px solid var(--accent)' : '' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{w.event?.eventName}</h3>
                  <span className={`badge ${w.status === 'waiting' && w.offeredAt ? 'badge-primary' : w.status === 'waiting' ? 'badge-warning' : w.status === 'allocated' ? 'badge-success' : 'badge-danger'}`}>
                    {w.status === 'waiting' && w.offeredAt ? 'ถึงคิวของคุณแล้ว!' : 
                     w.status === 'waiting' ? 'กำลังรอคิว' : 
                     w.status === 'allocated' ? 'ได้รับสิทธิ์แล้ว' : 'ยกเลิก/สละสิทธิ์'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <p style={{ color: 'var(--text-muted)' }}>บูธ: <strong>{w.booth?.boothNo}</strong></p>
                  <p style={{ color: 'var(--text-muted)' }}>คิวที่: <strong>{w.queuePosition}</strong></p>
                </div>

                {w.status === 'waiting' && w.offeredAt && w.offerDeadline && (
                  <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Clock size={16} color="var(--accent)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>กรุณายืนยันรับสิทธิ์ภายในเวลา:</span>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <CountdownTimer deadline={w.offerDeadline} />
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', backgroundColor: 'var(--accent)', border: 'none' }}
                      onClick={() => confirmWaitlist(w.waitlistId)}
                    >
                      <CheckCircle size={18} /> ยืนยันรับสิทธิ์และจองบูธ
                    </button>
                  </div>
                )}
                
                {w.status === 'waiting' && !w.offeredAt && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    หากถึงคิวของคุณ ระบบจะแจ้งเตือนให้ทราบ
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', margin: '1rem', position: 'relative' }}>
            <button 
              onClick={() => setUploadModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>อัปโหลดหลักฐานการโอนเงิน</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              {slipImage ? (
                <div style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={slipImage} alt="slip preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                  <button 
                    onClick={() => setSlipImage(null)}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-card-hover)', position: 'relative', transition: 'background-color 0.2s' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  <ImageIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>คลิกเพื่อเลือกไฟล์รูปภาพ</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>รองรับไฟล์ PNG, JPG ขนาดไม่เกิน 5MB</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setUploadModalOpen(false)}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={submitPayment}
                disabled={!slipImage || uploading}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: (!slipImage || uploading) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Upload size={18} /> {uploading ? 'กำลังอัปโหลด...' : 'ยืนยันการส่งสลิป'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
