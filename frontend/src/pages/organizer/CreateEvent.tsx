import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import api from '../../services/api';
import './CreateEvent.css'; // Shared CSS for both Create and Edit

export const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    eventName: '',
    category: 'เทคโนโลยี',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isPublished: true,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const CATEGORIES = ['เทคโนโลยี', 'อาหาร', 'ดนตรี', 'ธุรกิจ', 'ไลฟ์สไตล์'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/events', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizerStats'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/organizer`); // or manage events
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างงาน');
    }
  });

  const handleSubmit = (status: 'draft' | 'open') => {
    if (!form.eventName || !form.description || !form.startDate || !form.endDate || !form.location) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
    if (form.description.length < 50) {
      setError('กรุณากรอกรายละเอียดงานอย่างน้อย 50 ตัวอักษร');
      return;
    }

    const payload = {
      ...form,
      eventStatus: status,
      imageUrl: imagePreview ? JSON.stringify([imagePreview]) : null, // Handle the JSON array format required by existing frontend code
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="create-event-page">
      <nav className="top-nav">
        <div className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          กลับหน้าก่อนหน้า
        </div>
      </nav>

      <div className="page">
        <h1 className="page-title">สร้างงานใหม่</h1>
        <p className="page-sub">กรอกรายละเอียดงานอีเวนต์ของคุณให้ครบถ้วน</p>

        {error && <div style={{ color: 'var(--status-closed)', marginBottom: '16px', fontWeight: 600 }}>{error}</div>}

        <div className="card">
          <h3>ข้อมูลพื้นฐาน</h3>
          <div className="field">
            <label>ชื่องาน <span className="req">*</span></label>
            <input 
              className="input" 
              type="text" 
              placeholder="เช่น Bangkok Tech Summit 2026"
              value={form.eventName}
              onChange={e => setForm({...form, eventName: e.target.value})}
            />
          </div>
          
          <div className="field">
            <label>หมวดหมู่ <span className="req">*</span></label>
            <div className="cat-select">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat}
                  className={`cat-chip ${form.category === cat ? 'selected' : ''}`}
                  onClick={() => setForm({...form, category: cat})}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
          
          <div className={`field ${form.description && form.description.length < 50 ? 'has-error' : ''}`}>
            <label>รายละเอียดงาน <span className="req">*</span><span className="char-count">{form.description.length}/500</span></label>
            <textarea 
              className="textarea" 
              placeholder="อธิบายเกี่ยวกับงานนี้ กิจกรรมที่น่าสนใจ และสิ่งที่ผู้เข้าร่วมจะได้รับ"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              maxLength={2000}
            />
            <div className="error-text">กรุณากรอกรายละเอียดงานอย่างน้อย 50 ตัวอักษร</div>
          </div>
        </div>

        <div className="card">
          <h3>รูปภาพหน้าปก</h3>
          {imagePreview ? (
            <div className="upload-preview">
              <img src={imagePreview} alt="Preview" />
              <button className="remove-btn" onClick={() => setImagePreview(null)}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="upload-box" onClick={() => document.getElementById('fileInput')?.click()}>
              <ImageIcon size={32} />
              <div className="txt">คลิกเพื่ออัปโหลดรูปภาพ</div>
              <div className="sub">แนะนำขนาด 1200×630px · JPG, PNG ไม่เกิน 5MB</div>
              <input type="file" id="fileInput" hidden accept="image/*" onChange={handleImageChange} />
            </div>
          )}
        </div>

        <div className="card">
          <h3>วันที่และสถานที่</h3>
          <div className="field">
            <label>วันที่จัดงาน <span className="req">*</span></label>
            <div className="date-range">
              <input 
                className="input" 
                type="date" 
                value={form.startDate}
                onChange={e => setForm({...form, startDate: e.target.value})}
              />
              <span className="sep">→</span>
              <input 
                className="input" 
                type="date" 
                value={form.endDate}
                onChange={e => setForm({...form, endDate: e.target.value})}
              />
            </div>
          </div>
          <div className="field">
            <label>สถานที่ <span className="req">*</span></label>
            <input 
              className="input" 
              type="text" 
              placeholder="เช่น QSNCC, กรุงเทพฯ"
              value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
            />
          </div>
        </div>

        <div className="card">
          <div className="publish-row">
            <div className="txt">
              <div className="title">เผยแพร่งานทันที</div>
              <div className="desc">ถ้าปิดไว้ งานจะถูกบันทึกเป็นแบบร่าง (Draft) และยังไม่แสดงในหน้า Home</div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={form.isPublished}
                onChange={e => setForm({...form, isPublished: e.target.checked})}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="footer-bar">
        <button 
          className="btn secondary" 
          onClick={() => handleSubmit('draft')}
          disabled={createMutation.isPending}
        >
          บันทึกแบบร่าง
        </button>
        <button 
          className="btn primary" 
          onClick={() => handleSubmit(form.isPublished ? 'open' : 'draft')}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'กำลังบันทึก...' : 'สร้างงาน'}
        </button>
      </div>
    </div>
  );
};
