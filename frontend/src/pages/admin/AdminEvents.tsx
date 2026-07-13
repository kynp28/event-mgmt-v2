import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Box, DollarSign } from 'lucide-react';

interface EventData {
  eventId: number;
  eventName: string;
  eventStatus: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: {
    username: string;
    email: string;
  };
  _count: {
    booths: number;
    bookings: number;
  };
}

export default function AdminEvents() {
  const { t } = useTranslation();

  const { data: events, isLoading, error } = useQuery<EventData[]>({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const res = await api.get('/admin/events');
      return res.data.data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{t('open', 'เปิดรับจอง')}</span>;
      case 'closed':
        return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{t('closed', 'ปิดรับจอง')}</span>;
      case 'draft':
      default:
        return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{t('draft', 'ฉบับร่าง')}</span>;
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading', 'กำลังโหลด...')}</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>{t('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล')}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {t('manage_all_events', 'จัดการอีเวนต์ทั้งหมด')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {t('manage_all_events_desc', 'ดูและจัดการข้อมูลงานแฟร์และอีเวนต์ทั้งหมดในระบบ')}
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--border)] bg-[color:var(--bg-card)] bg-opacity-50">
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('event_name', 'ชื่องาน')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('organizer', 'ผู้จัดงาน')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('status', 'สถานะ')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('stats', 'สถิติ')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('date', 'วันที่จัดงาน')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)] text-right">{t('actions', 'จัดการ')}</th>
              </tr>
            </thead>
            <tbody>
              {events?.map((event) => (
                <tr key={event.eventId} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{event.eventName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{event.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{event.organizer.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.organizer.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(event.eventStatus)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Box size={14} /> บูธ: {event._count.booths}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><DollarSign size={14} /> จอง: {event._count.bookings}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {new Date(event.startDate).toLocaleDateString('th-TH')} - {new Date(event.endDate).toLocaleDateString('th-TH')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link 
                      to={`/events/${event.eventId}`}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyItems: 'center', padding: '0.5rem', borderRadius: '8px', color: '#2563EB', backgroundColor: 'transparent', textDecoration: 'none' }}
                      title={t('view_details', 'ดูรายละเอียด')}
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {events?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[color:var(--text-muted)]">
                    {t('no_data', 'ไม่มีข้อมูลอีเวนต์')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
