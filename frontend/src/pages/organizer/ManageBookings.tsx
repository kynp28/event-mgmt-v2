import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, X } from 'lucide-react';
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

  const [selectedSlip, setSelectedSlip] = React.useState<string | null>(null);

  const updateStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number, status: string }) => {
      await api.patch(`/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
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
                          onClick={() => setSelectedSlip(booking.payment.slipImage)}
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
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            onClick={() => {
                              if(window.confirm('ต้องการยืนยันการจองนี้ใช่หรือไม่?')) {
                                updateStatus.mutate({ bookingId: booking.bookingId, status: 'confirmed' });
                              }
                            }}
                            disabled={updateStatus.isPending || !booking.payment}
                            title={!booking.payment ? "ต้องรอผู้เช่าอัปโหลดสลิปก่อน" : ""}
                          >
                            ยืนยัน
                          </button>
                          <button 
                            className="btn btn-neutral" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
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

      {/* Slip Image Modal */}
      {selectedSlip && (
        <div 
          onClick={() => setSelectedSlip(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', backgroundColor: 'var(--bg-card)', padding: '3rem 2rem 2rem 2rem', borderRadius: '12px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <button 
              onClick={() => setSelectedSlip(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700 }}>หลักฐานการโอนเงิน</h3>
            <img src={selectedSlip} alt="Payment Slip" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </div>
  );
};
