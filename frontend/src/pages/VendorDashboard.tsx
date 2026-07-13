import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, ArrowUpCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const VendorDashboard = () => {
  const { t } = useTranslation();
  
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

  const hasPendingRequest = myRequests?.some((r: any) => r.status === 'pending');
  const isOrganizer = user?.roles.includes('organizer');

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
        <div className="glass-card mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border)', padding: '1.5rem' }}>
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

      <h1 style={{ marginBottom: '1.5rem' }}>{t('my_bookings', 'การจองของฉัน')}</h1>
      
      {!bookings || bookings.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '4rem 1rem' }}>
          <p className="text-muted">{t('no_bookings_yet', 'ยังไม่มีการจองบูธ')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {bookings.map((b: any) => (
            <div key={b.bookingId} className="glass-card">
              <h3>{b.event?.eventName}</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('booth', 'บูธ')}: {b.booth?.boothNo}</p>
              <p style={{ fontWeight: 700, fontSize: '1.125rem', marginTop: '0.5rem', color: 'var(--primary)' }}>฿{b.totalAmount}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                  {b.status === 'confirmed' ? t('confirmed', 'ยืนยันแล้ว') : 
                   b.status === 'pending' ? t('pending', 'รอตรวจสอบ') : 
                   b.status === 'cancelled' ? t('cancelled', 'ยกเลิกแล้ว') : b.status}
                </span>
                <Link to={`/invoice/${b.bookingId}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none' }} className="hover-underline">
                  {t('view_invoice', 'ดูใบแจ้งหนี้')}
                </Link>
              </div>

              {b.status === 'pending' && !b.payment && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openUploadModal(b.bookingId)}>{t('upload_payment', 'อัปโหลดสลิปโอนเงิน')}</button>
                </div>
              )}
              {b.status === 'pending' && b.payment && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>
                  {t('payment_submitted', 'ส่งสลิปแล้ว กำลังรอผู้จัดงานตรวจสอบ...')}
                </div>
              )}
            </div>
          ))}
        </div>
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
