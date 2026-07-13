import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Users, Mail, UserCheck, UserX } from 'lucide-react';

interface UserData {
  userId: number;
  username: string;
  email: string;
  status: string;
  createdAt: string;
  userRoles: {
    role: { roleName: string }
  }[];
  _count: {
    organizedEvents: number;
    bookings: number;
  };
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'organizer' | 'vendor'>('organizer');

  const { refetch, data: users, isLoading, error } = useQuery<UserData[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data;
    }
  });

  const handleStatusChange = async (userId: number, status: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{t('active', 'ใช้งานได้')}</span>;
      case 'suspended':
        return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{t('suspended', 'ถูกระงับ')}</span>;
      case 'pending':
      default:
        return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEF9C3', color: '#CA8A04', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>{t('pending', 'รอตรวจสอบ')}</span>;
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading', 'กำลังโหลด...')}</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>{t('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล')}</div>;

  // Filter users based on active tab
  const filteredUsers = users?.filter(user => 
    user.userRoles.some(r => r.role.roleName === activeTab)
  ) || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {t('manage_users', 'จัดการผู้ใช้งาน')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {t('manage_users_desc', 'ดูรายชื่อและสถานะของผู้จัดงานและผู้เช่าบูธทั้งหมดในระบบ')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('organizer')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'organizer'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
          }`}
        >
          {t('organizers', 'ผู้จัดงาน')}
        </button>
        <button
          onClick={() => setActiveTab('vendor')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'vendor'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
          }`}
        >
          {t('vendors', 'ผู้เช่าบูธ')}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--border)] bg-[color:var(--bg-card)] bg-opacity-50">
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('user', 'ผู้ใช้งาน')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('status', 'สถานะ')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('stats', 'สถิติ')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">{t('joined_date', 'วันที่สมัคร')}</th>
                <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)] text-right">{t('actions', 'จัดการ')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA', flexShrink: 0 }}>
                        <Users size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-sm text-[color:var(--text-muted)]">
                      {activeTab === 'organizer' ? (
                        <span>จัดไปแล้ว: {user._count.organizedEvents} งาน</span>
                      ) : (
                        <span>จองไปแล้ว: {user._count.bookings} บูธ</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {new Date(user.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleStatusChange(user.userId, 'active')}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', color: '#16A34A', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
                      title={t('activate', 'อนุญาต')}
                    >
                      <UserCheck size={18} />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(user.userId, 'suspended')}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', color: '#DC2626', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                      title={t('suspend', 'ระงับการใช้งาน')}
                    >
                      <UserX size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[color:var(--text-muted)]">
                    {t('no_users', 'ไม่มีข้อมูลผู้ใช้งาน')}
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
