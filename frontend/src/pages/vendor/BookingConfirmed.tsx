import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './BookingConfirmed.css';

export const BookingConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, selectedBooths, bookingRef = 'BK-8X2K9F' } = location.state || {};

  useEffect(() => {
    if (!event || !selectedBooths) {
      navigate('/vendor');
    }
  }, [event, selectedBooths, navigate]);

  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!event || !selectedBooths) return null;

  const totalAmount = selectedBooths.reduce((sum: number, b: any) => sum + Number(b.price || 0), 0);
  const fee = 99;
  const finalTotal = totalAmount + fee;

  return (
    <div className="booking-confirmed-page">
      <nav className="navbar">
        <button className="theme-toggle" onClick={toggleTheme}>
          <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
        </button>
      </nav>

      <div className="wrap">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div className="headline">จองบูธสำเร็จแล้ว!</div>
        <div className="sub">เราได้ส่งใบยืนยันไปที่อีเมลของคุณแล้ว</div>

        <div className="ticket">
          <div className="ticket-top">
            <div className="event">{event.eventName}</div>
            <div className="meta">
              {new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} – {new Date(event.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} · {event.location || 'ไม่ระบุ'}
            </div>
          </div>

          <div className="qr-box">
            <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
              <QRCodeSVG value={bookingRef} size={130} />
            </div>
          </div>
          <div className="booking-ref">{bookingRef}</div>

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
          <button className="btn primary">เพิ่มลงปฏิทิน</button>
        </div>

        <div className="next-note">แสดง QR Code นี้กับเจ้าหน้าที่ตอนเข้าติดตั้งบูธในวันงาน<br/>ดูรายละเอียดเพิ่มเติมได้ที่ "การจองของฉัน"</div>
      </div>
    </div>
  );
};
