import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rnd } from 'react-rnd';
import { Trash2, Save, X, Edit, Plus, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { EmptyState } from '../../components/EmptyState';

const GRID_SIZE = 20;
const PX_PER_METER = 40;

const PRESET_COLORS = [
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#10b981', // Green
  '#f59e0b', // Amber
  '#f43f5e'  // Rose
];

const AABBOverlap = (a: any, b: any) => {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
};

export const ManageBooths: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') ? Number(searchParams.get('eventId')) : '';
  const [selectedEventId, setSelectedEventId] = useState<number | ''>(initialEventId);
  const [newZone, setNewZone] = useState({ zoneName: '', color: PRESET_COLORS[0] });
  const [editingBoothId, setEditingBoothId] = useState<number | null>(null);
  const [hoveredBooth, setHoveredBooth] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Hybrid Sync State
  const [draftBooths, setDraftBooths] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isTableEditing, setIsTableEditing] = useState(false);
  
  const draftKey = `draftBooths_event_${selectedEventId}`;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const { data: myEvents } = useQuery({
    queryKey: ['myEvents'],
    queryFn: async () => {
      const res = await api.get('/events/organizer/my-events');
      return res.data.data;
    }
  });

  const { data: zones, isLoading: isLoadingZones } = useQuery({
    queryKey: ['eventZones', selectedEventId],
    queryFn: async () => {
      const res = await api.get(`/layout/events/${selectedEventId}/zones`);
      return res.data.data;
    },
    enabled: !!selectedEventId
  });

  const { data: booths, isLoading: isLoadingBooths } = useQuery({
    queryKey: ['eventBooths', selectedEventId],
    queryFn: async () => {
      const res = await api.get(`/layout/events/${selectedEventId}/booths`);
      return res.data.data;
    },
    enabled: !!selectedEventId
  });

  // Load from API or Draft
  useEffect(() => {
    if (booths && selectedEventId) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        if (window.confirm('พบแบบร่างที่ยังไม่ได้บันทึก ต้องการกู้คืนไหม?')) {
          setDraftBooths(JSON.parse(savedDraft));
          setHasUnsavedChanges(true);
          return;
        } else {
          localStorage.removeItem(draftKey);
        }
      }
      
      const mappedBooths = booths.map((b: any) => ({
        ...b,
        x: b.posX || 0,
        y: b.posY || 0,
        w: b.width || 80,
        h: b.height || 80,
        hasCollision: false,
        tempData: null
      }));
      setDraftBooths(mappedBooths);
      setHasUnsavedChanges(false);
    } else {
      setDraftBooths([]);
      setHasUnsavedChanges(false);
      setEditingBoothId(null);
    }
  }, [booths, selectedEventId]);

  // Persist draft on change
  useEffect(() => {
    if (hasUnsavedChanges && draftBooths.length > 0 && selectedEventId) {
      localStorage.setItem(draftKey, JSON.stringify(draftBooths));
    } else if (!hasUnsavedChanges) {
      localStorage.removeItem(draftKey);
    }
  }, [draftBooths, hasUnsavedChanges, selectedEventId]);

  // Warn on leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // --- Auto-numbering Helper ---
  const generateNextBoothNo = () => {
    let highestNum = 0;
    let prefix = 'A';
    draftBooths.forEach(b => {
      const match = b.boothNo.match(/^([a-zA-Z]+)-?(\d+)$/);
      if (match) {
        prefix = match[1];
        const num = parseInt(match[2], 10);
        if (num > highestNum) highestNum = num;
      }
    });
    return `${prefix}${String(highestNum + 1).padStart(2, '0')}`;
  };

  // --- Palette Drag Drop ---
  const handleAddBooth = (widthPx: number, heightPx: number) => {
    const newId = Date.now(); // Temp ID for new booths
    const boothNo = generateNextBoothNo();
    setDraftBooths(prev => [...prev, {
      boothId: newId,
      eventId: selectedEventId,
      boothNo,
      price: 500,
      status: 'available',
      x: 50,
      y: 50,
      w: widthPx,
      h: heightPx,
      hasCollision: false,
      isNew: true
    }]);
    setHasUnsavedChanges(true);
    setEditingBoothId(newId);
  };

  // --- Collision & RND Handlers ---
  const updateBoothState = (id: number, updates: any) => {
    setDraftBooths(prev => prev.map(b => b.boothId === id ? { ...b, ...updates } : b));
    setHasUnsavedChanges(true);
  };

  const handleDragStart = (id: number) => {
    setDraftBooths(prev => prev.map(b => b.boothId === id ? { ...b, tempData: { x: b.x, y: b.y, w: b.w, h: b.h } } : b));
  };

  const handleDragOrResize = (id: number, newX: number, newY: number, newW: number, newH: number) => {
    if (isTableEditing) return; 
    const current = draftBooths.find(b => b.boothId === id);
    if (!current) return;

    const me = { x: newX, y: newY, w: newW, h: newH };
    const hasCol = draftBooths.some(b => b.boothId !== id && AABBOverlap(me, { x: b.x, y: b.y, w: b.w, h: b.h }));

    updateBoothState(id, { x: newX, y: newY, w: newW, h: newH, hasCollision: hasCol });
  };

  const handleDragOrResizeStop = (id: number) => {
    setDraftBooths(prev => prev.map(b => {
      if (b.boothId === id) {
        if (b.hasCollision && b.tempData) {
          showToast('ตำแหน่งนี้ชนกับบูธอื่น (ถูกดึงกลับ)');
          return { ...b, x: b.tempData.x, y: b.tempData.y, w: b.tempData.w, h: b.tempData.h, hasCollision: false, tempData: null };
        }
        return { ...b, hasCollision: false, tempData: null };
      }
      return b;
    }));
    setHasUnsavedChanges(true);
  };

  // --- Save / API ---
  const saveFloorplan = useMutation({
    mutationFn: async () => {
      const originalIds = booths?.map((b:any) => b.boothId) || [];
      const currentIds = draftBooths.map(b => b.boothId);
      
      const toDelete = originalIds.filter((id:any) => !currentIds.includes(id));
      const toCreate = draftBooths.filter(b => b.isNew);
      const toUpdate = draftBooths.filter(b => !b.isNew);

      for (const id of toDelete) await api.delete(`/layout/booths/${id}`);
      for (const b of toCreate) {
        await api.post('/layout/booths', {
          eventId: selectedEventId,
          boothNo: b.boothNo,
          price: Number(b.price || 0),
          zoneId: b.zoneId ? Number(b.zoneId) : undefined,
          status: 'available',
          posX: b.x,
          posY: b.y,
          width: b.w,
          height: b.h
        });
      }
      for (const b of toUpdate) {
        await api.patch(`/layout/booths/${b.boothId}`, {
          boothNo: b.boothNo,
          price: Number(b.price || 0),
          zoneId: b.zoneId ? Number(b.zoneId) : null,
          posX: b.x,
          posY: b.y,
          width: b.w,
          height: b.h
        });
      }
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      localStorage.removeItem(draftKey);
      queryClient.invalidateQueries({ queryKey: ['eventBooths', selectedEventId] });
      alert('บันทึกแผนผังเรียบร้อยแล้ว');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  });

  const createZone = useMutation({
    mutationFn: async () => {
      await api.post('/layout/zones', { eventId: selectedEventId, zoneName: newZone.zoneName, color: newZone.color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventZones', selectedEventId] });
      setNewZone({ zoneName: '', color: PRESET_COLORS[0] });
    }
  });

  const handleDiscard = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการแก้ไขทั้งหมดและเริ่มใหม่?')) {
      localStorage.removeItem(draftKey);
      window.location.reload();
    }
  };

  const editingBooth = draftBooths.find(b => b.boothId === editingBoothId);

  
  const selectedEvent = myEvents?.find((e: any) => e.eventId === selectedEventId);
  const eventName = selectedEvent ? selectedEvent.eventName : 'เลือกอีเวนต์เพื่อเริ่ม';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 2rem)', width: '100%', backgroundColor: 'var(--bg-main)', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 9999, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <AlertCircle size={18} color="var(--primary)" />
          {toastMsg}
        </div>
      )}

      {/* Top Navbar */}
      <div style={{ height: '64px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
          สร้างแผนผังบูธ — {eventName}
        </h1>
        
        {/* Toggle Canvas / Table */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-card-hover)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border)' }}>
          <button style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', border: '2px solid var(--text-main)', borderRadius: '2px' }}></span> Canvas
          </button>
          <button style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderTop: '2px solid var(--text-muted)', borderBottom: '2px solid var(--text-muted)' }}></span> Table
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={selectedEventId} 
            onChange={e => setSelectedEventId(Number(e.target.value))}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 500 }}
          >
            <option value="">-- เลือกอีเวนต์ --</option>
            {myEvents?.map((ev: any) => (
              <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>
            ))}
          </select>

          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            พรีวิว
          </button>
          <button 
            className="btn btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.875rem', opacity: hasUnsavedChanges ? 1 : 0.7 }}
            onClick={() => saveFloorplan.mutate()}
            disabled={!hasUnsavedChanges || saveFloorplan.isPending}
          >
            {saveFloorplan.isPending ? 'กำลังบันทึก...' : 'บันทึกแผนผัง'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Palette */}
        <div style={{ width: '260px', backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
          <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', marginTop: 0 }}>เพิ่มบูธ</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => handleAddBooth(2 * PX_PER_METER, 2 * PX_PER_METER)}
                style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '24px', height: '24px', border: '2px solid var(--primary)', borderRadius: '4px', backgroundColor: 'var(--primary-glow)' }}></div>
                บูธมาตรฐาน 2x2m
              </button>
              
              <button 
                onClick={() => handleAddBooth(4 * PX_PER_METER, 2 * PX_PER_METER)}
                style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '32px', height: '24px', border: '2px solid var(--primary)', borderRadius: '4px', backgroundColor: 'var(--primary-glow)' }}></div>
                บูธใหญ่ 4x2m
              </button>

              <button 
                onClick={() => handleAddBooth(2 * PX_PER_METER, 2 * PX_PER_METER)}
                style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '24px', height: '24px', border: '2px dashed var(--primary)', borderRadius: '4px', backgroundColor: 'transparent' }}></div>
                บูธมุม (Corner)
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '24px' }}>
              ลากวางลงบน Canvas แล้วปรับขนาดได้ด้วยจุดมุมขวาล่าง ระบบ snap เข้ากริดอัตโนมัติ (ทุก 0.5m)
            </p>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', marginTop: '32px' }}>โซน (Zones)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {zones?.map((z: any) => (
                <div key={z.zoneId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: z.color || PRESET_COLORS[0] }}></div>
                  {z.zoneName}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'auto', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
          {selectedEventId ? (
            <div style={{ padding: '40px', minWidth: '1200px', minHeight: '800px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div 
                onClick={() => setEditingBoothId(null)}
                style={{ 
                  width: '800px', height: '600px', 
                  backgroundColor: '#ffffff',
                  backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                  position: 'relative',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
              >
                {draftBooths.map(b => {
                  const isEdit = editingBoothId === b.boothId;
                  const zoneColor = zones?.find((z: any) => z.zoneId === b.zoneId)?.color;
                  
                  return (
                    <Rnd
                      key={b.boothId}
                      size={{ width: b.w, height: b.h }}
                      position={{ x: b.x, y: b.y }}
                      dragGrid={[GRID_SIZE, GRID_SIZE]}
                      resizeGrid={[GRID_SIZE, GRID_SIZE]}
                      onDragStart={() => handleDragStart(b.boothId)}
                      onDrag={(e, d) => handleDragOrResize(b.boothId, d.x, d.y, b.w, b.h)}
                      onDragStop={() => handleDragOrResizeStop(b.boothId)}
                      onResizeStart={() => handleDragStart(b.boothId)}
                      onResize={(e, direction, ref, delta, position) => {
                        handleDragOrResize(b.boothId, position.x, position.y, parseInt(ref.style.width), parseInt(ref.style.height));
                      }}
                      onResizeStop={() => handleDragOrResizeStop(b.boothId)}
                      bounds="parent"
                      style={{ zIndex: isEdit ? 100 : 1 }}
                    >
                      <div 
                        onClick={(e) => { e.stopPropagation(); setEditingBoothId(b.boothId); }}
                        style={{ 
                          width: '100%', height: '100%', 
                          backgroundColor: zoneColor ? `${zoneColor}20` : 'rgba(139, 92, 246, 0.1)',
                          border: `2px solid ${isEdit ? 'var(--primary)' : (zoneColor || '#8b5cf6')}`,
                          borderRadius: '6px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          color: isEdit ? 'var(--primary)' : (zoneColor || '#8b5cf6'),
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, pointerEvents: 'none' }}>{b.boothNo}</span>
                        {isEdit && (
                          <>
                            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>
                          </>
                        )}
                      </div>
                    </Rnd>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              กรุณาเลือกอีเวนต์เพื่อเริ่มสร้างแผนผัง
            </div>
          )}
          
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
            หลักเกณฑ์เพื่อสแนปเข้าพิกัดในแผงด้านขวา - ลากขอบเพื่อ resize
          </div>
        </div>

        {/* Right Sidebar: Properties & Table */}
        <div style={{ width: '380px', backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
          
          {/* Properties Area */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', marginTop: 0 }}>
              คุณสมบัติบูธที่เลือก {editingBooth ? `- ${editingBooth.boothNo}` : ''}
            </h3>

            {editingBooth ? (
              <div 
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                onFocus={() => setIsTableEditing(true)} 
                onBlur={() => setIsTableEditing(false)}
              >
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>X (m)</label>
                  <input type="number" step="0.5" value={editingBooth.x / PX_PER_METER} onChange={e => updateBoothState(editingBooth.boothId, { x: Number(e.target.value) * PX_PER_METER })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Y (m)</label>
                  <input type="number" step="0.5" value={editingBooth.y / PX_PER_METER} onChange={e => updateBoothState(editingBooth.boothId, { y: Number(e.target.value) * PX_PER_METER })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>กว้าง (m)</label>
                  <input type="number" step="0.5" value={editingBooth.w / PX_PER_METER} onChange={e => updateBoothState(editingBooth.boothId, { w: Number(e.target.value) * PX_PER_METER })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>ยาว (m)</label>
                  <input type="number" step="0.5" value={editingBooth.h / PX_PER_METER} onChange={e => updateBoothState(editingBooth.boothId, { h: Number(e.target.value) * PX_PER_METER })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>รหัสบูธ</label>
                  <input type="text" value={editingBooth.boothNo} onChange={e => updateBoothState(editingBooth.boothId, { boothNo: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>ราคา (฿)</label>
                  <input type="number" value={editingBooth.price} onChange={e => updateBoothState(editingBooth.boothId, { price: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button onClick={() => setDraftBooths(prev => prev.filter(b => b.boothId !== editingBooth.boothId))} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', color: 'var(--status-closed)', border: '1px solid var(--status-closed)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, marginTop: '8px' }}>
                    ลบบูธนี้
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                คลิกเลือกบูธบน Canvas
              </div>
            )}
          </div>

          {/* Table Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-card-hover)', position: 'sticky', top: 0, zIndex: 5 }}>
                <tr>
                  <th style={{ padding: '12px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>รหัส</th>
                  <th style={{ padding: '12px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>X</th>
                  <th style={{ padding: '12px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Y</th>
                  <th style={{ padding: '12px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>W</th>
                  <th style={{ padding: '12px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>H</th>
                </tr>
              </thead>
              <tbody>
                {draftBooths.map(b => (
                  <tr 
                    key={b.boothId} 
                    onClick={() => setEditingBoothId(b.boothId)}
                    style={{ 
                      borderBottom: '1px solid var(--border)', 
                      backgroundColor: editingBoothId === b.boothId ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, color: editingBoothId === b.boothId ? 'var(--primary)' : 'var(--text-main)' }}>
                      {b.boothNo}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={b.x / PX_PER_METER} 
                        onChange={e => updateBoothState(b.boothId, { x: Number(e.target.value) * PX_PER_METER })} 
                        style={{ width: '40px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} 
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={b.y / PX_PER_METER} 
                        onChange={e => updateBoothState(b.boothId, { y: Number(e.target.value) * PX_PER_METER })} 
                        style={{ width: '40px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} 
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={b.w / PX_PER_METER} 
                        onChange={e => updateBoothState(b.boothId, { w: Number(e.target.value) * PX_PER_METER })} 
                        style={{ width: '40px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} 
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={b.h / PX_PER_METER} 
                        onChange={e => updateBoothState(b.boothId, { h: Number(e.target.value) * PX_PER_METER })} 
                        style={{ width: '40px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.875rem' }} 
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};
