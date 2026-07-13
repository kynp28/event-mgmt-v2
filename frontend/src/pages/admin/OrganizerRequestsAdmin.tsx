import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, X, Eye, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

export const OrganizerRequestsAdmin: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['organizerRequests'],
    queryFn: async () => {
      // Fetch all requests
      const res = await api.get('/organizer-requests');
      return res.data.data || [];
    }
  });

  const handleReview = async (requestId: number, status: 'approved' | 'rejected') => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ ${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'} คำขอนี้?`)) return;
    
    setProcessingId(requestId);
    try {
      await api.patch(`/organizer-requests/${requestId}/status`, { status });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning">รอตรวจสอบ</span>;
      case 'approved': return <span className="badge badge-success">อนุมัติแล้ว</span>;
      case 'rejected': return <span className="badge badge-error">ปฏิเสธ</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (isLoading) return <div className="container mt-10 text-center">Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <h1 className="mb-6" style={{ fontSize: '1.75rem' }}>จัดการคำขอเป็นผู้จัดงาน</h1>
      
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>วันที่ขอ</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ผู้ใช้</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>สลิปโอนเงิน</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>สถานะ</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    ไม่มีคำขอในระบบ
                  </td>
                </tr>
              ) : (
                requests?.map((req: any) => (
                  <tr key={req.requestId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      {new Date(req.requestedAt).toLocaleDateString('th-TH')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{req.user?.username || `User ID: ${req.userId}`}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{req.user?.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {req.invoicePath ? (
                        <button 
                          onClick={() => setSelectedImage(req.invoicePath)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                        >
                          <Eye size={16} /> ดูสลิป (฿{req.feeAmount})
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ไม่มีสลิป</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(req.status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleReview(req.requestId, 'approved')}
                            disabled={processingId === req.requestId}
                            style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', backgroundColor: 'var(--success)' }}
                          >
                            <Check size={16} /> อนุมัติ
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => handleReview(req.requestId, 'rejected')}
                            disabled={processingId === req.requestId}
                            style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          >
                            <X size={16} /> ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: '-3rem', right: '0', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}
            >
              <X size={32} />
            </button>
            <img src={selectedImage} alt="Slip Preview" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', backgroundColor: 'white', borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </div>
  );
};
export default OrganizerRequestsAdmin;
