import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Draggable from 'react-draggable';
import { useRef } from 'react';
import { Trash2, Save, X, Edit, Plus } from 'lucide-react';
import api from '../../services/api';

const DraggableBooth = ({ booth, onStop, onClick }: { booth: any, onStop: (e: any, data: any, id: number) => void, onClick: (booth: any) => void }) => {
  const nodeRef = useRef(null);
  const isDragging = useRef(false);

  return (
    <Draggable
      nodeRef={nodeRef}
      key={booth.boothId}
      defaultPosition={{ x: booth.posX || 0, y: booth.posY || 0 }}
      grid={[20, 20]}
      onStart={() => { isDragging.current = false; }}
      onDrag={() => { isDragging.current = true; }}
      onStop={(e, data) => {
        onStop(e, data, booth.boothId);
        setTimeout(() => { isDragging.current = false; }, 100);
      }}
      bounds="parent"
    >
      <div 
        ref={nodeRef}
        onClick={(e) => {
          if (!isDragging.current) {
            onClick(booth);
          }
        }}
        className="cursor-move flex flex-col items-center justify-center text-xs font-semibold transition-colors hover:brightness-95"
        style={{ 
          position: 'absolute', 
          width: `${booth.width || 80}px`, 
          height: `${booth.height || 60}px`, 
          backgroundColor: booth.zone?.color ? `${booth.zone.color}33` : (booth.status === 'booked' ? '#fed7aa' : '#bfdbfe'),
          borderRadius: '2px',
          color: booth.zone?.color || (booth.status === 'booked' ? '#9a3412' : '#1e3a8a'),
          border: '1px solid',
          borderColor: booth.zone?.color || (booth.status === 'booked' ? '#fdba74' : '#93c5fd'),
          boxShadow: 'none'
        }}
      >
        <span className="truncate w-full px-1 text-center leading-tight">{booth.boothNo}</span>
        {booth.price && <span className="text-[10px] opacity-70 leading-tight">฿{booth.price}</span>}
      </div>
    </Draggable>
  );
};

export const ManageBooths: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newBooth, setNewBooth] = useState({ boothNo: '', price: '', zoneId: '' });
  const [newZone, setNewZone] = useState({ zoneName: '', color: '#3b82f6' });
  const [editingBooth, setEditingBooth] = useState<any>(null);

  const { data: myEvents } = useQuery({
    queryKey: ['myEvents'],
    queryFn: async () => {
      const res = await api.get('/events/organizer/my-events');
      return res.data.data;
    }
  });

  const { data: booths, isLoading: isLoadingBooths } = useQuery({
    queryKey: ['eventBooths', selectedEventId],
    queryFn: async () => {
      const res = await api.get(`/layout/events/${selectedEventId}/booths`);
      return res.data.data;
    },
    enabled: !!selectedEventId
  });

  const { data: zones, isLoading: isLoadingZones } = useQuery({
    queryKey: ['eventZones', selectedEventId],
    queryFn: async () => {
      const res = await api.get(`/layout/events/${selectedEventId}/zones`);
      return res.data.data;
    },
    enabled: !!selectedEventId
  });

  const updateBoothPosition = useMutation({
    mutationFn: async ({ id, x, y }: { id: number, x: number, y: number }) => {
      await api.patch(`/layout/booths/${id}`, { posX: x, posY: y });
    },
    onSuccess: () => {
      // Invalidate or optimistic update
      queryClient.invalidateQueries({ queryKey: ['eventBooths', selectedEventId] });
    }
  });

  const handleDragStop = (e: any, data: any, boothId: number) => {
    updateBoothPosition.mutate({ id: boothId, x: data.x, y: data.y });
  };

  const updateBooth = useMutation({
    mutationFn: async () => {
      await api.patch(`/layout/booths/${editingBooth.boothId}`, {
        boothNo: editingBooth.boothNo,
        price: Number(editingBooth.price),
        zoneId: editingBooth.zoneId ? Number(editingBooth.zoneId) : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventBooths', selectedEventId] });
      setEditingBooth(null);
    }
  });

  const deleteBooth = useMutation({
    mutationFn: async () => {
      await api.delete(`/layout/booths/${editingBooth.boothId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventBooths', selectedEventId] });
      setEditingBooth(null);
    }
  });

  const createBooth = useMutation({
    mutationFn: async (boothData: { boothNo: string; price: string; zoneId: string }) => {
      await api.post('/layout/booths', {
        eventId: selectedEventId,
        boothNo: boothData.boothNo,
        price: Number(boothData.price),
        zoneId: boothData.zoneId ? Number(boothData.zoneId) : undefined,
        status: 'available',
        posX: 50,
        posY: 50
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventBooths', selectedEventId] });
      setShowAddModal(false);
      setNewBooth({ boothNo: '', price: '', zoneId: '' });
    }
  });

  const createZone = useMutation({
    mutationFn: async () => {
      await api.post('/layout/zones', {
        eventId: selectedEventId,
        zoneName: newZone.zoneName,
        color: newZone.color
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventZones', selectedEventId] });
      setNewZone({ zoneName: '', color: '#3b82f6' });
    }
  });

  const deleteZone = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/layout/zones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventZones', selectedEventId] });
    }
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', width: '100%', backgroundColor: 'var(--bg-dark)', overflow: 'hidden' }}>
      
      {/* Left Sidebar: Tools & Zones */}
      <div style={{ width: '288px', backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>จัดการผังบูธ</h2>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>เลือกอีเวนต์</label>
            <select 
              style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.375rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              value={selectedEventId} 
              onChange={e => {
                setSelectedEventId(Number(e.target.value));
                setEditingBooth(null);
              }}
            >
              <option value="">-- เลือกอีเวนต์ --</option>
              {myEvents?.map((ev: any) => (
                <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedEventId ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Tools Section */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>เครื่องมือ</h3>
              <button 
                style={{ width: '100%', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)', cursor: 'pointer' }}
                onClick={() => {
                  const boothData = { boothNo: `B-${(booths?.length || 0) + 1}`, price: '500', zoneId: '' };
                  setNewBooth(boothData);
                  createBooth.mutate(boothData);
                }}
                disabled={createBooth.isPending}
              >
                <Plus size={16} /> เพิ่มบูธใหม่
              </button>
            </div>

            {/* Zones Section */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>โซน (Zones)</h3>
              
              {/* Add Zone */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input type="color" style={{ width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', border: 0, padding: 0 }} value={newZone.color} onChange={e => setNewZone({...newZone, color: e.target.value})} title="เลือกสี" />
                <input type="text" style={{ width: '100%', fontSize: '0.875rem', padding: '0.375rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} placeholder="ชื่อโซน..." value={newZone.zoneName} onChange={e => setNewZone({...newZone, zoneName: e.target.value})} onKeyDown={e => { if (e.key === 'Enter' && newZone.zoneName) createZone.mutate(); }} />
                <button style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '0.375rem', borderRadius: '4px', border: 0, cursor: 'pointer' }} onClick={() => createZone.mutate()} disabled={createZone.isPending || !newZone.zoneName}>
                  <Plus size={16} />
                </button>
              </div>

              {/* Zone List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {isLoadingZones ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading zones...</div>
                ) : zones?.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ยังไม่มีโซน</div>
                ) : (
                  zones?.map((z: any) => (
                    <div key={z.zoneId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid var(--border)', backgroundColor: z.color }}></div>
                        <span style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{z.zoneName}</span>
                      </div>
                      <button 
                        style={{ color: 'var(--text-muted)', border: 0, background: 'none', cursor: 'pointer' }}
                        onClick={() => {
                          if(window.confirm('ยืนยันลบโซนนี้?')) deleteZone.mutate(z.zoneId);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Grid Settings */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>การตั้งค่า</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" id="snapToGrid" checked readOnly style={{ accentColor: 'var(--primary)' }} />
                <label htmlFor="snapToGrid">Snap to grid (20px)</label>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            กรุณาเลือกอีเวนต์เพื่อเริ่มจัดผัง
          </div>
        )}
      </div>

      {/* Center: Main Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Canvas Toolbar / Legend */}
        {selectedEventId && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid var(--border)', padding: '0.375rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Legend:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#bfdbfe', border: '1px solid #93c5fd' }}></div><span style={{ color: 'var(--text-muted)' }}>บูธว่าง</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#fed7aa', border: '1px solid #fdba74' }}></div><span style={{ color: 'var(--text-muted)' }}>ถูกจอง</span></div>
              {zones?.slice(0, 3).map((z: any) => (
                <div key={z.zoneId} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '2px', border: `1px solid ${z.color}`, backgroundColor: `${z.color}33` }}></div><span style={{ color: 'var(--text-muted)' }}>{z.zoneName}</span></div>
              ))}
              {zones && zones.length > 3 && <span style={{ color: 'var(--text-muted)' }}>+{zones.length - 3}</span>}
            </div>
          </div>
        )}

        <div 
          style={{ 
            flex: 1, width: '100%', height: '100%', overflow: 'auto', backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', 
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingBooth(null);
            }
          }}
        >
          {selectedEventId ? (
            isLoadingBooths ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>Loading map...</div>
            ) : (
              <div style={{ position: 'relative', width: '2000px', height: '2000px', transformOrigin: 'top left' }}>
                {booths?.map((booth: any) => (
                  <DraggableBooth key={booth.boothId} booth={booth} onStop={handleDragStop} onClick={(b) => setEditingBooth({...b})} />
                ))}
              </div>
            )
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '1rem', opacity: 0.5 }}><Edit size={64} /></div>
              <p>Select an event to load the canvas</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Properties */}
      <div style={{ width: '320px', backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>คุณสมบัติ (Properties)</h3>
          {editingBooth && (
            <button onClick={() => setEditingBooth(null)} style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16}/></button>
          )}
        </div>

        {editingBooth ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Selected Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem',
                backgroundColor: zones?.find((z:any)=>z.zoneId === editingBooth.zoneId)?.color ? `${zones.find((z:any)=>z.zoneId === editingBooth.zoneId).color}33` : '#bfdbfe',
                borderColor: zones?.find((z:any)=>z.zoneId === editingBooth.zoneId)?.color || '#93c5fd',
                borderWidth: '1px',
                borderStyle: 'solid',
                color: zones?.find((z:any)=>z.zoneId === editingBooth.zoneId)?.color || '#1e3a8a'
              }}>
                {editingBooth.boothNo.substring(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>บูธที่เลือก</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{editingBooth.boothNo}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>หมายเลขบูธ</label>
                <input type="text" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.875rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} value={editingBooth.boothNo} onChange={e => setEditingBooth({...editingBooth, boothNo: e.target.value})} />
              </div>
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>ราคา (บาท)</label>
                <input type="number" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.875rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} value={editingBooth.price} onChange={e => setEditingBooth({...editingBooth, price: e.target.value})} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>โซน (Zone)</label>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.875rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} value={editingBooth.zoneId || ''} onChange={e => setEditingBooth({...editingBooth, zoneId: e.target.value})}>
                  <option value="">-- ไม่ระบุโซน --</option>
                  {zones?.map((z: any) => (
                    <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>สถานะ</label>
                <div style={{ fontSize: '0.875rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: editingBooth.status === 'booked' ? '#f97316' : '#22c55e' }}></div>
                  {editingBooth.status === 'booked' ? 'จองแล้ว' : 'ว่าง'}
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <button 
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #fecaca', borderRadius: '4px', backgroundColor: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem' }}
                onClick={() => {
                  if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบบูธนี้?')) deleteBooth.mutate();
                }}
                disabled={deleteBooth.isPending}
              >
                ลบบูธ
              </button>
              <button 
                style={{ flex: 2, padding: '0.5rem', border: 0, borderRadius: '4px', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => updateBooth.mutate()}
                disabled={updateBooth.isPending}
              >
                <Save size={16} /> บันทึก
              </button>
            </div>

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--border)' }}>
              <Edit size={24} />
            </div>
            <p style={{ fontSize: '0.875rem' }}>คลิกที่บูธบนแผนที่เพื่อดูคุณสมบัติและแก้ไขข้อมูล</p>
          </div>
        )}
      </div>

    </div>
  );
};
