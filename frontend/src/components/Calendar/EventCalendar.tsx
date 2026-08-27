import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { Event as CalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './EventCalendar.css';

const locales = {
  'th': th,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export interface AppCalendarEvent extends CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  status?: 'approved' | 'pending' | 'rejected' | 'default';
  resource?: any;
}

interface EventCalendarProps {
  events: AppCalendarEvent[];
  onEventClick?: (event: AppCalendarEvent) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({ events, onEventClick }) => {
  const [view, setView] = React.useState<'month' | 'week' | 'day'>('month');
  const [date, setDate] = React.useState(new Date());

  // Custom Toolbar matching Eventio style exactly
  const CustomToolbar = (toolbar: any) => {
    return (
      <div className="eventio-toolbar">
        <div className="eventio-toolbar-left">
          <span className="eventio-toolbar-label">{toolbar.label}</span>
        </div>
        <div className="eventio-toolbar-right">
          <div className="view-pill-container">
            <button className={`view-pill-btn ${toolbar.view === 'day' ? 'active' : ''}`} onClick={() => toolbar.onView('day')}>วัน</button>
            <button className={`view-pill-btn ${toolbar.view === 'week' ? 'active' : ''}`} onClick={() => toolbar.onView('week')}>สัปดาห์</button>
            <button className={`view-pill-btn ${toolbar.view === 'month' ? 'active' : ''}`} onClick={() => toolbar.onView('month')}>เดือน</button>
          </div>
        </div>
      </div>
    );
  };

  // Custom Event component to render subtitle/location if needed
  const CustomEvent = ({ event }: any) => {
    return (
      <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
        <strong style={{ fontSize: '0.9rem', lineHeight: '1.2', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{event.title}</strong>
        {event.resource?.subtitle && (
          <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 400, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{event.resource.subtitle}</span>
        )}
      </div>
    );
  };

  // Custom event styles matching Eventio style
  const eventStyleGetter = (event: AppCalendarEvent) => {
    let backgroundColor = '#EFF6FF'; // faint blue
    let color = '#1E3A8A'; // dark blue
    let borderLeft = '4px solid #3B82F6';
    
    // Simulate the different colors based on status or random for the mockup look
    if (event.status === 'pending') {
      backgroundColor = '#FFF7ED'; // orange-50
      color = '#9A3412'; // orange-800
      borderLeft = '4px solid #F97316'; // orange-500
    } else if (event.status === 'rejected') {
      backgroundColor = '#FEF2F2'; // red-50
      color = '#991B1B'; // red-800
      borderLeft = '4px solid #EF4444'; // red-500
    } else if (event.status === 'approved') {
      // Sometimes solid blue, sometimes purple
      if (Math.random() > 0.5) {
        backgroundColor = '#F5F3FF'; // purple-50
        color = '#5B21B6'; // purple-800
        borderLeft = '4px solid #8B5CF6'; // purple-500
      } else {
        backgroundColor = '#3B82F6'; // solid blue
        color = '#FFFFFF';
        borderLeft = 'none'; // No border for solid
      }
    }

    return {
      style: {
        backgroundColor,
        color,
        border: 'none',
        borderLeft,
        borderRadius: '6px', // Rounded corners like mockup
        boxShadow: 'none',
        padding: '0', // padding is handled inside CustomEvent
        margin: '3px 6px', // Gap between events and cell borders
      }
    };
  };

  return (
    <div className="custom-calendar-wrapper eventio-theme" style={{ height: '750px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        view={view}
        onView={(newView: any) => setView(newView)}
        style={{ height: '100%', fontFamily: 'inherit' }}
        culture="th"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onEventClick}
        views={['month', 'week', 'day']}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent
        }}
        messages={{
          today: 'วันนี้',
          previous: 'ก่อนหน้า',
          next: 'ถัดไป',
          month: 'เดือน',
          week: 'สัปดาห์',
          day: 'วัน',
          agenda: 'กำหนดการ',
          date: 'วันที่',
          time: 'เวลา',
          event: 'อีเวนต์',
          noEventsInRange: 'ไม่มีอีเวนต์ในช่วงเวลานี้',
          showMore: (count) => `+ ดูเพิ่มอีก ${count} งาน`
        }}
      />
    </div>
  );
};
