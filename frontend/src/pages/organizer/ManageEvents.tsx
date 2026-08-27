import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Edit, Trash2, Map, Plus } from 'lucide-react';
import api from '../../services/api';

export const ManageEvents: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: myEvents, isLoading } = useQuery({
    queryKey: ['myEvents'],
    queryFn: async () => {
      const res = await api.get('/events/organizer/my-events');
      return res.data.data;
    }
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: number) => {
      await api.delete(`/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      alert('ลบอีเวนต์สำเร็จ');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'ไม่สามารถลบอีเวนต์ได้');
    }
  });

  const handleDelete = (eventId: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบอีเวนต์นี้? การดำเนินการนี้ไม่สามารถเรียกคืนได้')) {
      deleteEvent.mutate(eventId);
    }
  };

  const updateStatus = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      await api.patch(`/events/${eventId}`, { eventStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้');
    }
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: 'calc(100vh - 80px)', padding: '2rem 1.5rem' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '1000px', padding: 0 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>จัดการอีเวนต์</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>ดูและแก้ไขงานแฟร์ทั้งหมดที่คุณสร้างขึ้น</p>
          </div>
          <Link to="/organizer/events/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Plus size={18} /> สร้างงานใหม่
          </Link>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</div>
          ) : !myEvents || myEvents.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ backgroundColor: 'var(--bg-dark)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid var(--border)' }}>
                <Calendar size={32} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>คุณยังไม่มีอีเวนต์ใดๆ</p>
              <Link to="/organizer/events/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>เริ่มต้นสร้างงานแรกของคุณ</Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>ชื่ออีเวนต์</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>วันที่จัดงาน</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>สถานที่</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event: any) => (
                  <tr key={event.eventId} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{event.eventName}</div>
                      {(() => {
                        const isEnded = event.endDate && new Date(event.endDate) < new Date();
                        const displayStatus = (isEnded || event.eventStatus === 'ended') ? 'ended' : event.eventStatus;
                        
                        return (
                          <select
                            value={displayStatus}
                            onChange={(e) => updateStatus.mutate({ eventId: event.eventId, status: e.target.value })}
                            disabled={updateStatus.isPending || isEnded}
                            style={{ 
                              display: 'inline-block',
                              padding: '0.25rem 1.75rem 0.25rem 0.75rem', 
                              borderRadius: '9999px', 
                              fontSize: '0.75rem', 
                              fontWeight: 600, 
                              backgroundColor: 
                                displayStatus === 'open' ? 'rgba(16, 185, 129, 0.15)' : 
                                displayStatus === 'closed' ? 'rgba(239, 68, 68, 0.15)' : 
                                displayStatus === 'ended' ? 'rgba(148, 163, 184, 0.15)' :
                                displayStatus === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' :
                                'rgba(245, 158, 11, 0.15)', 
                              color: 
                                displayStatus === 'open' ? 'var(--success)' : 
                                displayStatus === 'closed' ? 'var(--danger)' : 
                                displayStatus === 'ended' ? 'var(--text-muted)' :
                                displayStatus === 'cancelled' ? 'var(--danger)' :
                                'var(--warning)',
                              border: '1px solid currentColor',
                              outline: 'none',
                              appearance: 'none',
                              cursor: isEnded ? 'not-allowed' : 'pointer',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.375rem center'
                        }}
                      >
                        <option value="draft" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>ฉบับร่าง</option>
                        <option value="open" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>เปิดรับจอง</option>
                        <option value="closed" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>ปิดรับจอง</option>
                        <option value="ended" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>สิ้นสุดแล้ว</option>
                        <option value="cancelled" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>ยกเลิก</option>
                      </select>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={14} />
                        {new Date(event.startDate).toLocaleDateString('th-TH')}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <MapPin size={14} />
                        {event.location}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => navigate(`/organizer/booths/manage?eventId=${event.eventId}`)} 
                          style={{ padding: '0.5rem', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer' }}
                          title="จัดการผังบูธ"
                        >
                          <Map size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/organizer/events/edit/${event.eventId}`)} 
                          style={{ padding: '0.5rem', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
                          title="แก้ไข"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(event.eventId)} 
                          style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer' }}
                          title="ลบ"
                          disabled={deleteEvent.isPending}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};
