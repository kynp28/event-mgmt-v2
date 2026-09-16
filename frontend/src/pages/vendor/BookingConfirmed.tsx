import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import { useState } from 'react';
import api from '../../services/api';
import './BookingConfirmed.css';


export const BookingConfirmed = () => {
  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { event, selectedBooths, bookingRef = 'BK-8X2K9F', payMethod = 'promptpay', bookings } = location.state || {};

  useEffect(() => {
    if (!event || !selectedBooths) {
      navigate('/vendor');
    }
  }, [event, selectedBooths, navigate]);

  if (!event || !selectedBooths) return null;

  const finalTotal = selectedBooths?.reduce((sum: number, b: any) => sum + Number(b.price || 0), 0) || 0;
  
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async () => {
    console.log("handleUpload triggered", { slipFile, bookings });
    if (!slipFile) {
      alert("กรุณาเลือกไฟล์สลิปก่อนครับ");
      return;
    }
    if (!bookings || bookings.length === 0) {
      alert("ไม่พบข้อมูล Booking ID ครับ (อาจเกิดจากการรีเฟรชหน้าเว็บ) รบกวนกดทำรายการจองใหม่อีกครั้งครับ");
      return;
    }
    
    setUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.post('/bookings/slip', {
            bookingIds: bookings.map((b: any) => b.bookingId),
            slipImage: base64Data
          });
          setUploaded(true);
          alert('อัปโหลดสลิปสำเร็จ รอผู้จัดงานตรวจสอบ');
        } catch(e: any) {
          alert(e.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(slipFile);
    } catch(e) {
      alert('เกิดข้อผิดพลาด');
      setUploading(false);
    }
  };

  // Render different content based on payment method
  const renderPaymentInstructions = () => {
    if (payMethod === 'transfer') {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-main)' }}>กรุณาโอนเงินเข้าบัญชีผู้จัดงาน</h3>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{event?.organizer?.bankName || 'ธนาคารกสิกรไทย'}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '2px', marginBottom: '8px' }}>{event?.organizer?.bankAccountNo || '123-4-56789-0'}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ชื่อบัญชี: {event?.organizer?.bankAccountName || 'อีเวนต์คอร์'}</div>
          </div>
          
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
            {uploaded ? (
              <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                อัปโหลดสลิปเรียบร้อยแล้ว
              </div>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>เมื่อโอนเงินแล้ว กรุณาแนบสลิปเพื่อยืนยัน</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setSlipFile(e.target.files?.[0] || null)}
                  style={{ marginBottom: '12px', fontSize: '14px' }}
                />
                {slipFile && (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '8px' }}
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'กำลังอัปโหลด...' : 'ยืนยันการชำระเงิน'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      );
    } else if (payMethod === 'promptpay') {
      const promptpayId = event?.organizer?.promptpayNo || '0800000000'; // Fallback
      const payload = generatePayload(promptpayId, { amount: finalTotal });
      
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-main)' }}>สแกนเพื่อชำระเงิน</h3>
          <div className="qr-box">
            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
              <QRCodeSVG value={payload} size={160} />
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
            ฿{finalTotal.toLocaleString()}
          </div>
          <div style={{ marginTop: '4px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>
            {event?.organizer?.bankAccountName || event?.organizer?.username || 'บัญชีผู้จัดงาน'}
          </div>
          
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
            {uploaded ? (
              <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                อัปโหลดสลิปเรียบร้อยแล้ว
              </div>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>เมื่อโอนเงินแล้ว กรุณาแนบสลิปเพื่อยืนยัน</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setSlipFile(e.target.files?.[0] || null)}
                  style={{ marginBottom: '12px', fontSize: '14px' }}
                />
                {slipFile && (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '8px' }}
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'กำลังอัปโหลด...' : 'ยืนยันการชำระเงิน'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      );
    }
    
    // Default / Credit card (already paid)
    return (
      <>
        <div className="qr-box">
          <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
            <QRCodeSVG value={bookingRef} size={130} />
          </div>
        </div>
        <div className="booking-ref">{bookingRef}</div>
        <div className="next-note" style={{ marginTop: '16px' }}>แสดง QR Code นี้กับเจ้าหน้าที่ตอนเข้าติดตั้งบูธในวันงาน</div>
      </>
    );
  };

  const isPending = payMethod === 'transfer' || payMethod === 'promptpay';

  return (
    <div className="booking-confirmed-page">
      <nav className="navbar">
        <button className="theme-toggle" onClick={toggleTheme}>
          <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
        </button>
      </nav>

      <div className="wrap">
        <div className="success-icon" style={{ backgroundColor: isPending ? 'var(--warning-light)' : 'var(--success-light)', color: isPending ? 'var(--warning)' : 'var(--success)' }}>
          {isPending ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
          )}
        </div>
        
        <div className="headline">{isPending ? 'รอการชำระเงิน' : 'จองบูธสำเร็จแล้ว!'}</div>
        <div className="sub">{isPending ? 'กรุณาชำระเงินเพื่อยืนยันการจอง' : 'เราได้ส่งใบยืนยันไปที่อีเมลของคุณแล้ว'}</div>

        <div className="ticket" style={{ marginTop: '32px' }}>
          <div className="ticket-top">
            <div className="event">{event.eventName}</div>
            <div className="meta">
              {new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} – {new Date(event.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} · {event.location || 'ไม่ระบุ'}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              รหัสการจอง: {bookingRef}
            </div>
          </div>

          {renderPaymentInstructions()}

          <div className="perforation"></div>

          <div className="ticket-bottom">
            {selectedBooths.map((b: any) => (
              <div key={b.boothId} className="booth-row">
                <span className="tag">{b.boothNo}</span>
                <span className="price">฿{Number(b.price || 0).toLocaleString()}</span>
              </div>
            ))}
            <div className="total-line">
              <span>ยอดชำระทั้งหมด</span>
              <span>฿{finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => navigate('/vendor')}>รายการของฉัน</button>
          {!isPending && <button className="btn primary">เพิ่มลงปฏิทิน</button>}
        </div>
        
      </div>
    </div>
  );
};
