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

  const { data: users, isLoading, error } = useQuery<UserData[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{t('active', 'ใช้งานได้')}</span>;
      case 'suspended':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{t('suspended', 'ถูกระงับ')}</span>;
      case 'pending':
      default:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{t('pending', 'รอตรวจสอบ')}</span>;
    }
  };

  if (isLoading) return <div className="p-8 text-center">{t('loading', 'กำลังโหลด...')}</div>;
  if (error) return <div className="p-8 text-center text-red-500">{t('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล')}</div>;

  // Filter users based on active tab
  const filteredUsers = users?.filter(user => 
    user.userRoles.some(r => r.role.roleName === activeTab)
  ) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-main)] mb-1">
            {t('manage_users', 'จัดการผู้ใช้งาน')}
          </h1>
          <p className="text-[color:var(--text-muted)] text-sm">
            {t('manage_users_desc', 'ดูรายชื่อและสถานะของผู้จัดงานและผู้เช่าบูธทั้งหมดในระบบ')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[color:var(--border)] mb-6">
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
                <tr key={user.userId} className="border-b border-[color:var(--border)] hover:bg-[color:var(--bg-card)] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-[color:var(--text-main)]">{user.username}</div>
                        <div className="text-xs text-[color:var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
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
                  <td className="p-4 text-sm text-[color:var(--text-main)]">
                    {new Date(user.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      className="inline-flex items-center justify-center p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors mr-2"
                      title={t('activate', 'อนุญาต')}
                    >
                      <UserCheck size={18} />
                    </button>
                    <button 
                      className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
