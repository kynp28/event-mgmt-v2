import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, Printer, ArrowLeft, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import api from '../services/api';

const isSafeDocumentUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    // Check for safe data URIs first
    if (value.startsWith('data:image/') || value.startsWith('data:application/pdf')) {
      return true;
    }
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const Invoice = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide unnecessary UI elements when printing
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        nav, .no-print { display: none !important; }
        body { background: white !important; color: black !important; padding: 0 !important; }
        .invoice-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
        .invoice-card { background: white !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        img { max-width: 100% !important; }
      }
    `;
    document.head.appendChild(style);

    const fetchBooking = async () => {
      try {
        const res = await api.get('/bookings/my');
        const b = res.data.data.find((x: any) => x.bookingId === Number(id));
        setBooking(b);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();

    return () => {
      document.head.removeChild(style);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        กำลังโหลดใบแจ้งหนี้...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <AlertCircle size={48} color="var(--danger)" />
        <h2 style={{ color: 'var(--text-main)', margin: 0 }}>ไม่พบข้อมูลการจองนี้</h2>
        <Link to="/vendor" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> กลับไปหน้ารายการจอง
        </Link>
      </div>
    );
  }

  const rawInvoiceUrl = booking.event?.invoiceUrl;
  const invoiceUrl = isSafeDocumentUrl(rawInvoiceUrl) ? rawInvoiceUrl : null;
  const isPdf = invoiceUrl && (invoiceUrl.startsWith('data:application/pdf') || invoiceUrl.endsWith('.pdf'));

  return (
    <div className="container invoice-container animate-fade-in" style={{ maxWidth: '900px', margin: '30px auto', padding: '0 1rem 4rem 1rem' }}>
      
      {/* Top Action Bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/vendor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> กลับไปหน้ารายการจอง
        </Link>

        {invoiceUrl && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a 
              href={invoiceUrl} 
              download={`invoice-booking-${booking.bookingId}${isPdf ? '.pdf' : '.png'}`}
              className="btn btn-secondary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <Download size={16} /> ดาวน์โหลดเอกสาร
            </a>
            <button 
              onClick={() => window.print()} 
              className="btn btn-primary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Printer size={16} /> พิมพ์ใบแจ้งหนี้
            </button>
          </div>
        )}
      </div>

      {/* Booking Summary Header Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              ใบแจ้งหนี้ / ใบเสร็จรับเงิน (INVOICE)
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0' }}>
              {booking.event?.eventName}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              ผู้จัดงาน: <strong style={{ color: 'var(--text-main)' }}>{booking.event?.organizer?.username || 'Organizer'}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              รหัสการจอง: <strong style={{ color: 'var(--text-main)' }}>INV-{booking.bookingId.toString().padStart(5, '0')}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              บูธ: <strong style={{ color: 'var(--primary)' }}>{booking.booth?.boothNo}</strong> | ยอดเงิน: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>฿{Number(booking.totalAmount).toLocaleString()}</strong>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : booking.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                {booking.status === 'confirmed' ? 'ชำระและยืนยันแล้ว' : booking.status === 'pending' ? 'รอตรวจสอบชำระเงิน' : 'ยกเลิก'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor's Uploaded Slip */}
        {booking.payment?.slipImage && (
          <div className="glass-card invoice-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-card)', marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', alignSelf: 'flex-start', color: 'var(--text-main)' }}>สลิปชำระเงินของคุณ</h3>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img src={booking.payment.slipImage} alt="Your Payment Slip" style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            </div>
            {booking.payment.status === 'pending' && (
              <p style={{ marginTop: '1rem', color: 'var(--warning)', fontWeight: 600 }}>กำลังรอผู้จัดงานตรวจสอบสลิป</p>
            )}
          </div>
        )}

    </div>
  );
};

