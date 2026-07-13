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
                      <div style={{ 
                        display: 'inline-block', 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 500, 
                        backgroundColor: 
                          event.eventStatus === 'open' ? 'rgba(34, 197, 94, 0.1)' : 
                          event.eventStatus === 'closed' ? 'rgba(239, 68, 68, 0.1)' : 
                          event.eventStatus === 'ended' ? 'rgba(100, 116, 139, 0.1)' :
                          event.eventStatus === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' :
                          'rgba(245, 158, 11, 0.1)', 
                        color: 
                          event.eventStatus === 'open' ? 'var(--success)' : 
                          event.eventStatus === 'closed' ? 'var(--danger)' : 
                          event.eventStatus === 'ended' ? 'var(--text-muted)' :
                          event.eventStatus === 'cancelled' ? 'var(--danger)' :
                          'var(--warning)' 
                      }}>
                        {event.eventStatus === 'open' ? 'เปิดรับจอง' : 
                         event.eventStatus === 'closed' ? 'ปิดรับจอง' : 
                         event.eventStatus === 'ended' ? 'สิ้นสุดแล้ว' :
                         event.eventStatus === 'cancelled' ? 'ยกเลิก' :
                         'ฉบับร่าง'}
                      </div>
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
