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
  const [activeTab, setActiveTab] = useState<'organizer' | 'vendor' | 'appeals'>('organizer');

  // Suspension Modal State
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState<number | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('');

  const { refetch, data: users, isLoading, error } = useQuery<UserData[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data;
    }
  });

  const { refetch: refetchAppeals, data: appeals, isLoading: appealsLoading } = useQuery({
    queryKey: ['adminAppeals'],
    queryFn: async () => {
      const res = await api.get('/admin/appeals');
      return res.data.data;
    },
    enabled: activeTab === 'appeals'
  });

  const handleStatusChange = async (userId: number, status: string, reason?: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status, suspendReason: reason });
      refetch();
      if (status === 'suspended') {
        setShowSuspendModal(false);
        setSuspendReasonInput('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleAppealStatus = async (appealId: number, status: 'approved' | 'rejected') => {
    if (!window.confirm(status === 'approved' ? 'ยืนยันการอนุมัติปลดแบน?' : 'ยืนยันการปฏิเสธคำร้อง?')) return;
    try {
      await api.patch(`/admin/appeals/${appealId}/status`, { status });
      refetchAppeals();
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจัดการคำร้อง');
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
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('organizer')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'organizer' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'organizer' ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.5rem', transition: 'all 0.2s'
          }}
        >
          {t('organizers', 'ผู้จัดงาน')}
        </button>
        <button
          onClick={() => setActiveTab('vendor')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'vendor' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'vendor' ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.5rem', transition: 'all 0.2s'
          }}
        >
          {t('vendors', 'ผู้เช่าบูธ')}
        </button>
        <button
          onClick={() => setActiveTab('appeals')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'appeals' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'appeals' ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.5rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          คำร้องขอปลดแบน
          {appeals?.some((a: any) => a.status === 'pending') && (
            <span style={{ backgroundColor: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '0 6px', fontSize: '0.8rem' }}>!</span>
          )}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'appeals' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[color:var(--border)] bg-[color:var(--bg-card)] bg-opacity-50">
                  <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">ผู้ใช้งาน</th>
                  <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">เหตุผลที่ถูกระงับ</th>
                  <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">คำร้องขอปลดแบน</th>
                  <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)]">สถานะ</th>
                  <th className="p-4 text-sm font-semibold text-[color:var(--text-muted)] text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {appeals?.map((appeal: any) => (
                  <tr key={appeal.appealId} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{appeal.user.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appeal.user.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#DC2626', fontSize: '0.875rem' }}>
                      {appeal.user.suspendReason || '-'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.875rem', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                      <div style={{ marginBottom: appeal.evidenceUrl ? '0.5rem' : 0 }}>{appeal.reason}</div>
                      {appeal.evidenceUrl && (
                        <a href={`http://localhost:5000${appeal.evidenceUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          ดูหลักฐาน
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {appeal.status === 'pending' ? <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEF9C3', color: '#CA8A04', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>รอตรวจสอบ</span> :
                       appeal.status === 'approved' ? <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>อนุมัติแล้ว</span> :
                       <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>ปฏิเสธ</span>}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {appeal.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAppealStatus(appeal.appealId, 'approved')}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', color: '#16A34A', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
                            title="อนุมัติปลดแบน"
                          >
                            <UserCheck size={18} />
                          </button>
                          <button 
                            onClick={() => handleAppealStatus(appeal.appealId, 'rejected')}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', color: '#DC2626', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                            title="ปฏิเสธคำร้อง"
                          >
                            <UserX size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {(!appeals || appeals.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[color:var(--text-muted)]">
                      ไม่มีคำร้องขอปลดแบน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
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
                      onClick={() => { setSuspendUserId(user.userId); setShowSuspendModal(true); }}
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
          )}
        </div>
      </div>

      {/* Suspend Reason Modal */}
      {showSuspendModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-main)' }}>ระบุเหตุผลการระงับบัญชี</h3>
            <textarea 
              value={suspendReasonInput}
              onChange={(e) => setSuspendReasonInput(e.target.value)}
              placeholder="กรุณาระบุเหตุผลให้ผู้ใช้งานทราบ..."
              rows={4}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', resize: 'vertical', marginBottom: '1.5rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowSuspendModal(false); setSuspendReasonInput(''); }}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => suspendUserId && handleStatusChange(suspendUserId, 'suspended', suspendReasonInput)}
                disabled={!suspendReasonInput.trim()}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#DC2626', color: 'white', cursor: suspendReasonInput.trim() ? 'pointer' : 'not-allowed', opacity: suspendReasonInput.trim() ? 1 : 0.5 }}
              >
                ยืนยันการระงับ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
