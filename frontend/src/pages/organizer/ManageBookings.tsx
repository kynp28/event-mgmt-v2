import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ManageBookings.css'; // Make sure this is imported

export const ManageBookings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('pending'); // pending, verified, rejected, all
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['organizerBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/organizer');
      return res.data.data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number, status: 'verified' | 'rejected', reason?: string }) => {
      await api.patch(`/bookings/${id}/verify-payment`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
      closeModal();
    }
  });

  const filteredBookings = bookings.filter((b: any) => {
    if (activeTab === 'all') return true;
    return b.payment?.status === activeTab;
  });

  const counts = {
    pending: bookings.filter((b: any) => b.payment?.status === 'pending').length,
    verified: bookings.filter((b: any) => b.payment?.status === 'verified').length,
    rejected: bookings.filter((b: any) => b.payment?.status === 'rejected').length,
    all: bookings.length
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80';
    if (url.startsWith('[')) {
      try { return JSON.parse(url)[0]; } catch(e) { return url; }
    }
    return url;
  };

  const openModal = (booking: any, showReason = false) => {
    setSelectedSlip(booking);
    setShowReasonBox(showReason);
    setRejectReason('');
    setIsZoomed(false);
  };

  const closeModal = () => {
    setSelectedSlip(null);
    setShowReasonBox(false);
    setRejectReason('');
    setIsZoomed(false);
  };

  const handleApprove = (id: number) => {
    if (window.confirm('คุณต้องการอนุมัติการจองนี้ใช่หรือไม่?')) {
      verifyMutation.mutate({ id, status: 'verified' });
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลที่ปฏิเสธ');
      return;
    }
    verifyMutation.mutate({ id: selectedSlip.bookingId, status: 'rejected', reason: rejectReason });
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูลการจอง...</div>;

  return (
    <div className="manage-bookings-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">จัดการการจอง</h1>
          <p className="page-sub">ตรวจสอบสลิปโอนเงินและอนุมัติการจองของ Vendor</p>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          รอตรวจสอบ <span className="count">{counts.pending}</span>
        </div>
        <div className={`tab ${activeTab === 'verified' ? 'active' : ''}`} onClick={() => setActiveTab('verified')}>
          อนุมัติแล้ว <span className="count">{counts.verified}</span>
        </div>
        <div className={`tab ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>
          ปฏิเสธ <span className="count">{counts.rejected}</span>
        </div>
        <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          ทั้งหมด <span className="count">{counts.all}</span>
        </div>
      </div>

      <div className="list">
        {filteredBookings.length > 0 ? filteredBookings.map((b: any) => (
          <div className="booking-row" key={b.bookingId}>
            <img 
              className="slip-thumb" 
              src={getImageUrl(b.payment?.slipImage)} 
              alt="Slip" 
              onClick={() => openModal(b)} 
            />
            <div className="row-info">
              <div className="row-top">
                <span className="vendor-name">{b.vendor?.username || 'Unknown Vendor'}</span>
              </div>
              <div className="row-meta">
                {b.event?.eventName} · บูธ <b>{b.bookingBooths?.map((bb:any) => bb.booth?.boothNo).join(', ') || b.booth?.boothNo}</b> · {new Date(b.createdAt).toLocaleString()}
              </div>
              {b.payment?.status === 'rejected' && b.cancelReason && (
                <div className="reject-reason-tag">เหตุผล: {b.cancelReason}</div>
              )}
            </div>
            <div className="amount">฿{Number(b.totalAmount).toLocaleString()}</div>
            
            <span className={`status-pill ${b.payment?.status === 'verified' ? 'approved' : b.payment?.status === 'rejected' ? 'rejected' : 'pending'}`}>
              {b.payment?.status === 'verified' ? 'อนุมัติแล้ว' : b.payment?.status === 'rejected' ? 'ปฏิเสธ' : 'รอตรวจสอบ'}
            </span>
            
            {b.payment?.status === 'pending' && (
              <div className="row-actions">
                <button className="btn-sm approve" onClick={() => handleApprove(b.bookingId)}>อนุมัติ</button>
                <button className="btn-sm reject" onClick={() => openModal(b, true)}>ปฏิเสธ</button>
              </div>
            )}
          </div>
        )) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่มีข้อมูลการจองในสถานะนี้</div>
        )}
      </div>

      {/* Modal */}
      {selectedSlip && (
        <div className="overlay open" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <h3>ตรวจสอบสลิปโอนเงิน</h3>
              <button className="close-btn" onClick={closeModal}><X size={16} /></button>
            </div>
            
            <div className="modal-body">
              <div className="slip-viewer">
                <img 
                  src={getImageUrl(selectedSlip.payment?.slipImage)} 
                  alt="Slip Preview" 
                  className={isZoomed ? 'zoomed' : ''}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                <div className="zoom-hint">คลิกที่รูปเพื่อซูม</div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="label">Vendor</div>
                  <div className="value">{selectedSlip.vendor?.username || 'Unknown'}</div>
                </div>
                <div className="detail-item">
                  <div className="label">ยอดโอน</div>
                  <div className="value">฿{Number(selectedSlip.totalAmount).toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="label">งาน</div>
                  <div className="value">{selectedSlip.event?.eventName}</div>
                </div>
                <div className="detail-item">
                  <div className="label">บูธ</div>
                  <div className="value">{selectedSlip.bookingBooths?.map((bb:any) => bb.booth?.boothNo).join(', ') || selectedSlip.booth?.boothNo}</div>
                </div>
              </div>
              
              {showReasonBox && (
                <div className="reason-box show">
                  <label>เหตุผลที่ปฏิเสธ (Vendor จะเห็นข้อความนี้)</label>
                  <textarea 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="เช่น ยอดโอนไม่ตรงกับราคาที่ต้องชำระ กรุณาตรวจสอบและโอนใหม่"
                  />
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              {showReasonBox ? (
                <>
                  <button className="btn-reject" onClick={() => setShowReasonBox(false)}>ยกเลิก</button>
                  <button className="btn-confirm-reject" onClick={handleReject} disabled={verifyMutation.isPending}>
                    {verifyMutation.isPending ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
                  </button>
                </>
              ) : selectedSlip.payment?.status === 'pending' ? (
                <>
                  <button className="btn-reject" onClick={() => setShowReasonBox(true)}>ปฏิเสธ</button>
                  <button className="btn-approve" onClick={() => handleApprove(selectedSlip.bookingId)} disabled={verifyMutation.isPending}>
                    {verifyMutation.isPending ? 'กำลังดำเนินการ...' : 'อนุมัติการจอง'}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
