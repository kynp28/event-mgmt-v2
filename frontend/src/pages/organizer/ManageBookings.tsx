import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, X, AlertTriangle, RefreshCw, Ban, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

export const ManageBookings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['organizerBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/organizer');
      return res.data.data;
    }
  });

  const [selectedSlip, setSelectedSlip] = React.useState<{ url: string, paymentId: number, bookingId: number } | null>(null);

  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [selectedReason, setSelectedReason] = useState('ยอดเงินไม่ตรงกับราคาบูธ');
  const [customReason, setCustomReason] = useState('');

  const PRESET_REASONS = [
    'ยอดเงินไม่ตรงกับราคาบูธ',
    'สลิปไม่ชัดเจน / ข้อมูลไม่ครบถ้วน',
    'สลิปซ้ำ / สลิปไม่ถูกต้อง',
    'โอนเงินผิดบัญชี',
    'อื่นๆ'
  ];

  const verifyPayment = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: number }) => {
      await api.patch(`/payments/${paymentId}/status`, { status: 'verified' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
      setSelectedSlip(null);
      setShowRejectPanel(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป');
    }
  });

  const rejectPayment = useMutation({
    mutationFn: async ({ 
      paymentId, 
      reason, 
      action 
    }: { 
      paymentId: number; 
      reason: string; 
      action: 'request_reupload' | 'cancel_booking';
    }) => {
      await api.patch(`/payments/${paymentId}/status`, { 
        status: 'rejected', 
        reason, 
        action 
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
      setSelectedSlip(null);
      setShowRejectPanel(false);
      setCustomReason('');
      alert(variables.action === 'request_reupload' ? 'แจ้งขอให้อัปโหลดสลิปใหม่เรียบร้อยแล้ว' : 'ปฏิเสธและยกเลิกการจองเรียบร้อยแล้ว');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธสลิป');
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number, status: string }) => {
      await api.patch(`/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
    }
  });

  if (isLoading) {
    return <div className="container mt-10 text-center text-muted">กำลังโหลดรายการจอง...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}><Clock size={14} className="inline mr-1"/> รอดำเนินการ</span>;
      case 'confirmed':
        return <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}><CheckCircle size={14} className="inline mr-1"/> ยืนยันแล้ว</span>;
      case 'cancelled':
        return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}><XCircle size={14} className="inline mr-1"/> ยกเลิก</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container mt-8 animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <h1 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 800 }}>รายการจองบูธทั้งหมด</h1>
      <p className="text-muted mb-8">จัดการรายการจองจากพ่อค้าแม่ค้า และตรวจสอบสถานะได้ที่นี่</p>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {bookings && bookings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-card-hover)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>วันที่จอง</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>ชื่องาน (อีเวนต์)</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>หมายเลขบูธ</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>ผู้จอง (Vendor)</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>สลิปชำระเงิน</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>สถานะ</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => (
                  <tr key={booking.bookingId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {new Date(booking.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {booking.event?.eventName}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {booking.booth?.boothNo}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{booking.vendor?.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.vendor?.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>฿{Number(booking.totalAmount).toLocaleString()}</div>
                      {booking.payment ? (
                        <button 
                          onClick={() => setSelectedSlip({ url: booking.payment.slipImage, paymentId: booking.payment.paymentId, bookingId: booking.bookingId })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                        >
                          <ImageIcon size={12} /> ดูสลิป
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ยังไม่ชำระเงิน</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(booking.status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {booking.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {booking.payment ? (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                              onClick={() => setSelectedSlip({ url: booking.payment.slipImage, paymentId: booking.payment.paymentId, bookingId: booking.bookingId })}
                            >
                              <ImageIcon size={14} style={{ marginRight: '0.25rem' }} /> ตรวจสอบสลิป
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>รอผู้เช่าอัปโหลดสลิป</span>
                          )}
                          <button 
                            className="btn btn-neutral" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}
                            onClick={() => {
                              if(window.confirm('ต้องการยกเลิกการจองนี้และคืนบูธให้ว่างใช่หรือไม่?')) {
                                updateStatus.mutate({ bookingId: booking.bookingId, status: 'cancelled' });
                              }
                            }}
                            disabled={updateStatus.isPending}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            ยังไม่มีรายการจองบูธในขณะนี้
          </div>
        )}
      </div>

      {/* Slip Image & Verification Modal */}
      {selectedSlip && (
        <div 
          onClick={() => { setSelectedSlip(null); setShowRejectPanel(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: '1rem' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'relative', 
              backgroundColor: 'var(--bg-card)', 
              padding: '2.5rem 2rem 2rem', 
              borderRadius: '16px', 
              width: '100%',
              maxWidth: showRejectPanel ? '580px' : '480px', 
              maxHeight: '92vh', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              transition: 'max-width 0.2s ease'
            }}
          >
            <button 
              onClick={() => { setSelectedSlip(null); setShowRejectPanel(false); }}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} color="var(--primary)" /> หลักฐานการโอนเงิน
            </h3>

            {/* Slip Image Display */}
            {!showRejectPanel ? (
              <>
                <div style={{ overflowY: 'auto', maxHeight: '55vh', width: '100%', display: 'flex', justifyContent: 'center', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)' }}>
                  <img src={selectedSlip.url} alt="Payment Slip" style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain' }} />
                </div>
                
                {/* Action Buttons: Approve vs Reject */}
                <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => verifyPayment.mutate({ paymentId: selectedSlip.paymentId })}
                    disabled={verifyPayment.isPending}
                    style={{ flex: 1, minWidth: '180px', padding: '0.75rem 1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle size={18} /> อนุมัติสลิปนี้ (ยืนยัน)
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowRejectPanel(true)}
                    style={{ 
                      flex: 1, minWidth: '160px', padding: '0.75rem 1.25rem', fontSize: '0.95rem', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <XCircle size={18} /> สลิปไม่ถูกต้อง / ปฏิเสธ
                  </button>
                </div>
              </>
            ) : (
              /* Rejection Configuration Panel */
              <div style={{ width: '100%', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    <strong>ระบุสาเหตุที่สลิปไม่ถูกต้อง</strong>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>ระบบจะส่งเหตุผลนี้ไปยังผู้เช่าบูธเพื่อแจ้งเตือน</div>
                  </div>
                </div>

                {/* Preset Reason Chips */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    เลือกเหตุผล:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {PRESET_REASONS.map((reason) => (
                      <label 
                        key={reason}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem',
                          borderRadius: '8px', border: `1px solid ${selectedReason === reason ? 'var(--primary)' : 'var(--border)'}`,
                          backgroundColor: selectedReason === reason ? 'var(--primary-glow)' : 'var(--bg-card-hover)',
                          cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: selectedReason === reason ? 600 : 400
                        }}
                      >
                        <input 
                          type="radio" 
                          name="rejectReason" 
                          checked={selectedReason === reason} 
                          onChange={() => setSelectedReason(reason)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Reason Textarea */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    รายละเอียดเพิ่มเติม (ถ้ามี):
                  </label>
                  <textarea 
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="เช่น โอนขาดไป 100 บาท กรุณาโอนเพิ่มแล้วแนบสลิปใหม่..."
                    rows={2}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>

                {/* Action Choice Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {/* Choice 1: Request Re-upload */}
                    <button 
                      type="button"
                      onClick={() => {
                        const finalReason = selectedReason === 'อื่นๆ' 
                          ? (customReason.trim() || 'สลิปไม่ถูกต้อง') 
                          : `${selectedReason}${customReason.trim() ? ` (${customReason.trim()})` : ''}`;
                        rejectPayment.mutate({
                          paymentId: selectedSlip.paymentId,
                          reason: finalReason,
                          action: 'request_reupload'
                        });
                      }}
                      disabled={rejectPayment.isPending}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #f59e0b',
                        backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.875rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                      }}
                    >
                      <RefreshCw size={16} /> ขอให้อัปโหลดใหม่
                    </button>

                    {/* Choice 2: Reject & Cancel Booking */}
                    <button 
                      type="button"
                      onClick={() => {
                        if (window.confirm('ต้องการปฏิเสธและยกเลิกการจองนี้ พร้อมคืนบูธให้ว่างใช่หรือไม่?')) {
                          const finalReason = selectedReason === 'อื่นๆ' 
                            ? (customReason.trim() || 'สลิปไม่ถูกต้อง') 
                            : `${selectedReason}${customReason.trim() ? ` (${customReason.trim()})` : ''}`;
                          rejectPayment.mutate({
                            paymentId: selectedSlip.paymentId,
                            reason: finalReason,
                            action: 'cancel_booking'
                          });
                        }
                      }}
                      disabled={rejectPayment.isPending}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ef4444',
                        backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '0.875rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                      }}
                    >
                      <Ban size={16} /> ปฏิเสธ & ยกเลิกจอง
                    </button>
                  </div>

                  {/* Back Button */}
                  <button 
                    type="button"
                    onClick={() => setShowRejectPanel(false)}
                    style={{
                      padding: '0.5rem', border: 'none', background: 'transparent',
                      color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
                    }}
                  >
                    <ArrowLeft size={14} /> ย้อนกลับไปดูสลิป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
