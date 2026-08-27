import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, 
  MapPin, 
  Settings, 
  User,
  BarChart2
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();

  const getLinks = () => {
    const baseLinks = [
      { to: '/', icon: <CalendarDays size={20} />, label: 'Events' },
      { to: '/events', icon: <MapPin size={20} />, label: 'Booking' },
    ];

    if (user?.roles?.includes('admin')) {
      baseLinks.push({ to: '/admin', icon: <BarChart2 size={20} />, label: 'Admin' });
    } else if (user?.roles?.includes('organizer')) {
      baseLinks.push({ to: '/organizer', icon: <BarChart2 size={20} />, label: 'Manage' });
    } else if (user?.roles?.includes('vendor')) {
      baseLinks.push({ to: '/vendor', icon: <User size={20} />, label: 'Account' });
    } else {
      baseLinks.push({ to: '/login', icon: <User size={20} />, label: 'Account' });
    }

    return baseLinks;
  };

  return (
    <nav className="bottom-nav flex md:hidden">
      {getLinks().map((link) => (
        <NavLink 
          key={link.to} 
          to={link.to}
          className={({ isActive }) => `bottom-nav-item ${isActive && link.to !== '/' ? 'active' : ''}`}
          end={link.to === '/'}
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
