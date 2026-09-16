import React from 'react';

type EmptyStateType = 'no-events' | 'no-bookings' | 'no-results' | 'no-notifications';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, title, description, actionText, onAction }) => {
  const renderIllustration = () => {
    switch (type) {
      case 'no-events':
        return (
          <svg viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="var(--accent-soft)"/>
            <rect x="30" y="42" width="60" height="46" rx="6" stroke="var(--accent)" strokeWidth="3" fill="var(--bg-elevated)"/>
            <path d="M30 56h60" stroke="var(--accent)" strokeWidth="3"/>
            <path d="M44 42v-8M76 42v-8" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="60" cy="72" r="10" fill="var(--accent)"/>
            <path d="M60 67v10M55 72h10" stroke="var(--bg-elevated)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        );
      case 'no-bookings':
        return (
          <svg viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="var(--accent-soft)"/>
            <rect x="35" y="35" width="50" height="60" rx="6" stroke="var(--accent)" strokeWidth="3" fill="var(--bg-elevated)"/>
            <path d="M45 50h30M45 62h30M45 74h18" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="82" cy="82" r="16" fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth="3"/>
            <path d="M76 82h12M82 76v12" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
      case 'no-results':
        return (
          <svg viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="var(--accent-soft)"/>
            <circle cx="54" cy="54" r="22" stroke="var(--accent)" strokeWidth="3" fill="var(--bg-elevated)"/>
            <path d="M70 70l14 14" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M46 54h16" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
      case 'no-notifications':
        return (
          <svg viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="var(--accent-soft)"/>
            <path d="M60 36c-11 0-18 8-18 20v10l-6 10h48l-6-10V56c0-12-7-20-18-20Z" stroke="var(--accent)" strokeWidth="3" fill="var(--bg-elevated)" strokeLinejoin="round"/>
            <path d="M52 86a8 8 0 0 0 16 0" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  const getDefaultText = () => {
    switch (type) {
      case 'no-events': return { t: 'ยังไม่มีงานที่สร้างไว้', d: 'เริ่มสร้างอีเวนต์แรกของคุณ เพื่อเปิดให้ Vendor เข้ามาจองบูธได้', a: '+ สร้างงานใหม่' };
      case 'no-bookings': return { t: 'ยังไม่มีบูธที่จอง', d: 'เลือกงานอีเวนต์ที่สนใจแล้วจองบูธเพื่อเริ่มขายสินค้าของคุณ', a: 'เลือกดูงานอีเวนต์' };
      case 'no-results': return { t: 'ไม่พบผลลัพธ์ที่ค้นหา', d: 'ลองปรับคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะครับ', a: 'ล้างตัวกรอง' };
      case 'no-notifications': return { t: 'ไม่มีการแจ้งเตือนใหม่', d: 'เมื่อมีความเคลื่อนไหวเกี่ยวกับการจองของคุณ จะแสดงที่นี่', a: 'กลับหน้าแรก' };
    }
  };

  const defaultText = getDefaultText();

  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <div style={{ width: '120px', height: '120px', margin: '0 auto 14px' }}>
        {renderIllustration()}
      </div>
      <h3 style={{ fontSize: '15.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
        {title || defaultText.t}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto 18px', lineHeight: 1.6 }}>
        {description || defaultText.d}
      </p>
      {onAction && (
        <button 
          onClick={onAction}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            padding: '11px 22px', borderRadius: 'var(--radius-md)',
            fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          {actionText || defaultText.a}
        </button>
      )}
    </div>
  );
};
