import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Checkout.css';

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, selectedBooths } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('promptpay');
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ลบตัวอักษรที่ไม่ใช่ตัวเลขออกทั้งหมด
    setPhone(e.target.value.replace(/\D/g, ''));
  };

  useEffect(() => {
    if (!event || !selectedBooths || selectedBooths.length === 0) {
      navigate('/');
      return;
    }
    
    // Hold booths when entering
    api.post('/bookings/hold', { eventId: event.eventId, boothIds: selectedBooths.map((b: any) => b.boothId) }).catch(console.error);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Release and go back if timeout
          handleRelease();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      // We don't automatically release on unmount because they might refresh or navigate forward.
      // In a real app we'd use a robust state/socket, but for mockup we will just hold.
    };
  }, [event, selectedBooths]);

  const handleRelease = async () => {
    if (!event || !selectedBooths) return;
    try {
      await api.post('/bookings/release', { eventId: event.eventId, boothIds: selectedBooths.map((b: any) => b.boothId) });
    } catch(e) {}
    navigate(`/events/${event.eventId}`);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await api.post('/bookings/multiple', { 
        eventId: event.eventId, 
        boothIds: selectedBooths.map((b: any) => b.boothId) 
      });
      const bookingRef = `BK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      navigate('/booking-confirmed', { 
        state: { event, selectedBooths, bookingRef, payMethod, bookings: res.data.data } 
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!event || !selectedBooths) return null;

  const totalAmount = selectedBooths.reduce((sum: number, b: any) => sum + Number(b.price || 0), 0);
  const fee = 99; // Mock fee
  const finalTotal = totalAmount + fee;

  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="checkout-page">
      <nav className="navbar">
        <div className="back-btn" onClick={handleRelease}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          กลับไปแก้ไขบูธ
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
        </button>
      </nav>

      <div className="hold-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        บูธที่คุณเลือกถูกกันไว้ชั่วคราว เหลือเวลา <b>{m}:{s}</b> ในการยืนยันการจอง
      </div>

      <div className="page-title">ยืนยันการจอง</div>

      <div className="layout">
        <div>
          <div className="card">
            <h3>ข้อมูลผู้จอง</h3>
            <div className="field-row">
              <div className="field">
                <label>ชื่อ-นามสกุล</label>
                <input className="input" type="text" placeholder="เช่น สมชาย ใจดี" />
              </div>
              <div className="field has-error">
                <label>อีเมล</label>
                <input className="input error" type="email" defaultValue="somchai@mail" placeholder="you@email.com" />
                <div className="error-text">รูปแบบอีเมลไม่ถูกต้อง</div>
              </div>
            </div>
              <div className="field">
                <label>เบอร์โทรศัพท์</label>
                <input 
                  className="input" 
                  type="text" 
                  placeholder="08X-XXX-XXXX" 
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                />
              </div>
            <div className="field">
              <label>ชื่อบริษัท / แบรนด์ (ถ้ามี)</label>
              <input className="input" type="text" placeholder="สำหรับพิมพ์บนป้ายหน้าบูธ" disabled />
            </div>
          </div>

          <div className="card">
            <h3>ช่องทางชำระเงิน</h3>
            <div className="pay-options">
              <div className={`pay-option ${payMethod === 'promptpay' ? 'selected' : ''}`} onClick={() => setPayMethod('promptpay')}>
                <div className="pay-radio"></div>
                <div><div className="name">PromptPay</div><div className="desc">สแกน QR ผ่านแอปธนาคาร</div></div>
              </div>
              <div className={`pay-option ${payMethod === 'transfer' ? 'selected' : ''}`} onClick={() => setPayMethod('transfer')}>
                <div className="pay-radio"></div>
                <div><div className="name">โอนเงินผ่านธนาคาร</div><div className="desc">รอตรวจสอบสลิปภายใน 1 ชม.</div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="summary">
          <h3>{event.eventName}</h3>
          <div className="event-name">
            {new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} – {new Date(event.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} · {event.location || 'ไม่ระบุ'}
          </div>

          {selectedBooths.map((b: any) => (
            <div key={b.boothId} className="line-item">
              <span>บูธ {b.boothNo}</span><b>฿{Number(b.price || 0).toLocaleString()}</b>
            </div>
          ))}
          <div className="divider"></div>
          <div className="line-item"><span>ค่าธรรมเนียมบริการ</span><b>฿{fee}</b></div>

          <div className="divider"></div>
          <div className="total-row">
            <span className="label">ยอดชำระทั้งหมด</span>
            <span className="amount">฿{finalTotal.toLocaleString()}</span>
          </div>
          <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันและชำระเงิน'}
          </button>
          <div className="secure-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            การชำระเงินปลอดภัยด้วยการเข้ารหัส
          </div>
        </div>
      </div>
    </div>
  );
};
