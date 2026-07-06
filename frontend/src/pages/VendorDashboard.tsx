import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

export const VendorDashboard = () => {
  const { t } = useTranslation();
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data.data;
    }
  });

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
      <h1 className="mb-6">{t('my_bookings')}</h1>
      
      {!bookings || bookings.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '4rem 1rem' }}>
          <p className="text-muted">{t('no_bookings_yet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b: any) => (
            <div key={b.bookingId} className="glass-card">
              <h3>{b.event?.eventName}</h3>
              <p className="text-muted mt-2">{t('booth')}: {b.booth?.boothNo}</p>
              <p className="font-bold text-lg mt-2 text-primary">฿{b.totalAmount}</p>
              
              <div className="flex justify-between items-center mt-4">
                <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                  {b.status}
                </span>
                <Link to={`/invoice/${b.bookingId}`} className="text-primary text-sm hover:underline">
                  View Invoice
                </Link>
              </div>

              {b.status === 'pending' && !b.payment && (
                <div className="mt-4 pt-4 border-t border-[color:var(--border)]">
                  <button className="btn btn-primary w-full" onClick={() => openUploadModal(b.bookingId)}>{t('upload_payment', 'อัปโหลดสลิปโอนเงิน')}</button>
                </div>
              )}
              {b.status === 'pending' && b.payment && (
                <div className="mt-4 pt-4 border-t border-[color:var(--border)] text-center text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  ส่งสลิปแล้ว กำลังรอผู้จัดงานตรวจสอบ...
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
