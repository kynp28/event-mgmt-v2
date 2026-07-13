import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const OrganizerRequestForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const FEE_AMOUNT = 5000;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(t('file_size_error', 'ขนาดไฟล์ต้องไม่เกิน 5MB'));
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!slipImage) {
      setError(t('slip_required', 'กรุณาอัปโหลดสลิปหลักฐานการโอนเงิน'));
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      await api.post('/organizer-requests', { 
        feeAmount: FEE_AMOUNT,
        invoicePath: slipImage 
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('upload_failed', 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="container animate-fade-in" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
            {t('request_submitted_title', 'ส่งคำขออัปเกรดสำเร็จ!')}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            {t('request_submitted_desc', 'เราได้รับคำขอและสลิปการโอนเงินของคุณแล้ว ทีมงานจะทำการตรวจสอบและอัปเดตสถานะบัญชีของคุณภายใน 24-48 ชั่วโมง คุณสามารถติดตามสถานะได้ที่หน้า Dashboard')}
          </p>
          <button 
            onClick={() => navigate('/vendor')}
            className="btn btn-primary"
          >
            {t('back_to_dashboard', 'กลับสู่หน้าหลัก')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '700px', marginTop: '2rem' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 500 }}
      >
        <ArrowLeft size={20} /> {t('back', 'ย้อนกลับ')}
      </button>

      <div className="glass-card">
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          {t('upgrade_to_organizer', 'อัปเกรดเป็นผู้จัดงาน')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {t('upgrade_desc', 'เพื่อสิทธิประโยชน์ในการสร้างและจัดการงานแฟร์ของคุณเอง กรุณาชำระค่าธรรมเนียมแรกเข้า')}
        </p>

        <div style={{ backgroundColor: 'var(--bg-card-hover)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('registration_fee', 'ค่าธรรมเนียมแรกเข้า')}</span>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>฿{FEE_AMOUNT.toLocaleString()}</span>
          </h3>
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('transfer_to', 'โอนเงินเข้าบัญชี:')}</p>
            <p style={{ fontWeight: 600 }}>ธนาคารกสิกรไทย (KBANK)</p>
            <p style={{ fontSize: '1.2rem', letterSpacing: '1px', margin: '0.5rem 0', fontFamily: 'monospace' }}>123-4-56789-0</p>
            <p style={{ fontSize: '0.9rem' }}>บจก. อีเวนท์คอร์ (EventCore Co., Ltd.)</p>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{t('upload_slip', 'แนบหลักฐานการโอนเงิน')}</h3>
          
          {slipImage ? (
            <div style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
              <img src={slipImage} alt="slip preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
              <button 
                onClick={() => setSlipImage(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-card-hover)', position: 'relative', transition: 'all 0.2s' }}>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/jpg" 
                onChange={handleImageUpload}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <ImageIcon size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {t('click_to_upload', 'คลิกเพื่อเลือกไฟล์สลิป')}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {t('supported_files', 'รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB')}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!slipImage || uploading}
          className={`btn btn-primary w-full ${(!slipImage || uploading) ? 'opacity-50' : ''}`}
          style={{ padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {uploading ? t('processing', 'กำลังดำเนินการ...') : (
            <>
              <Upload size={20} /> {t('submit_request', 'ยืนยันการส่งคำขอ')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
