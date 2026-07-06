import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const VerifyPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/pending');
      setPayments(res.data.data || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (paymentId: number, status: 'verified' | 'rejected') => {
    try {
      await api.patch(`/payments/${paymentId}/status`, { status });
      alert(`Payment marked as ${status}`);
      setPayments(prev => prev.filter(p => p.paymentId !== paymentId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update payment');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1000px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="mb-0 text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{t('verify_payments', 'รายการสลิปที่รอตรวจสอบ')}</h1>
        <button onClick={fetchPayments} className="btn" style={{ border: '1px solid var(--border)' }}>
          รีเฟรชข้อมูล
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">กำลังโหลดข้อมูล...</div>
      ) : payments.length === 0 ? (
        <div className="glass-card text-center py-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>ไม่มีสลิปที่รอตรวจสอบ</h3>
          <p style={{ color: 'var(--text-muted)' }}>รายการทั้งหมดถูกตรวจสอบเรียบร้อยแล้ว</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payments.map(p => (
            <div key={p.paymentId} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>งาน: {p.booking?.event?.eventName || '-'}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>บูธ: {p.booking?.booth?.boothNo || '-'} | ผู้เช่า: {p.booking?.vendor?.username || '-'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={14} /> รอดำเนินการ
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <a href={p.slipImage} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={p.slipImage} alt="slip" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px', marginBottom: '0.5rem' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <br/>
                  ดูรูปสลิปเต็ม
                </a>
              </div>
              
              <div className="flex gap-4 mt-auto">
                <button className="btn btn-danger" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleVerify(p.paymentId, 'rejected')}>
                  <XCircle size={18} /> ไม่อนุมัติ
                </button>
                <button className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleVerify(p.paymentId, 'verified')}>
                  <CheckCircle size={18} /> อนุมัติ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
