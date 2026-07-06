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
      return res.data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{t('open', 'เปิดรับจอง')}</span>;
      case 'closed':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{t('closed', 'ปิดรับจอง')}</span>;
      case 'draft':
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{t('draft', 'ฉบับร่าง')}</span>;
    }
  };

  if (isLoading) return <div className="p-8 text-center">{t('loading', 'กำลังโหลด...')}</div>;
  if (error) return <div className="p-8 text-center text-red-500">{t('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล')}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-main)] mb-1">
            {t('manage_all_events', 'จัดการอีเวนต์ทั้งหมด')}
          </h1>
          <p className="text-[color:var(--text-muted)] text-sm">
            {t('manage_all_events_desc', 'ดูและจัดการข้อมูลงานแฟร์และอีเวนต์ทั้งหมดในระบบ')}
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
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
                <tr key={event.eventId} className="border-b border-[color:var(--border)] hover:bg-[color:var(--bg-card)] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-[color:var(--text-main)]">{event.eventName}</div>
                        <div className="text-xs text-[color:var(--text-muted)]">{event.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-[color:var(--text-main)]">{event.organizer.username}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{event.organizer.email}</div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(event.eventStatus)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-sm text-[color:var(--text-muted)]">
                      <div className="flex items-center gap-1"><Box size={14} /> บูธ: {event._count.booths}</div>
                      <div className="flex items-center gap-1"><DollarSign size={14} /> จอง: {event._count.bookings}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[color:var(--text-main)]">
                    {new Date(event.startDate).toLocaleDateString('th-TH')} - {new Date(event.endDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      to={`/events/${event.eventId}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
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
