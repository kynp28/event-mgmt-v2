import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Map, 
  BarChart2, 
  Users, 
  Settings, 
  LogOut,
  Calendar,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const vendorLinks = [
    { to: '/', icon: <Compass size={20} />, label: 'Discovery' },
    { to: '/vendor', icon: <Map size={20} />, label: 'My Bookings' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const organizerLinks = [
    { to: '/', icon: <Compass size={20} />, label: 'Back to Site' },
    { to: '/organizer', icon: <BarChart2 size={20} />, label: 'Analytics' },
    { to: '/organizer/events', icon: <Calendar size={20} />, label: 'Events' },
    { to: '/organizer/booths/manage', icon: <Map size={20} />, label: 'Floor Plans' },
    { to: '/organizer/bookings', icon: <Users size={20} />, label: 'Vendors' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/', icon: <Compass size={20} />, label: 'Back to Site' },
    { to: '/admin', icon: <BarChart2 size={20} />, label: 'Overview' },
    { to: '/admin/events', icon: <Calendar size={20} />, label: 'All Events' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/admin/organizer-requests', icon: <UserCheck size={20} />, label: 'Requests' },
    { to: '/admin/payments', icon: <CreditCard size={20} />, label: 'Payments' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  let links = vendorLinks;
  if (user?.roles?.includes('admin')) links = adminLinks;
  else if (user?.roles?.includes('organizer')) links = organizerLinks;

  return (
    <aside className="sidebar-container hidden md:flex">
      <div className="sidebar-user" style={{ borderBottom: 'none', padding: '2rem 1.5rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="sidebar-avatar" style={{ width: '48px', height: '48px', flexShrink: 0, overflow: 'hidden', padding: 0 }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" style={{ fontSize: '1rem' }}>{user?.username || 'User'}</div>
          <div className="sidebar-user-role">{user?.roles?.includes('admin') ? 'Super Admin' : user?.roles?.includes('organizer') ? 'Event Lead' : 'Vendor'}</div>
          <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600, marginTop: '0.2rem' }}>Premium Tier</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive && link.to !== '/' ? 'active' : ''}`}
            end={link.to === '/'}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link text-danger" style={{ width: '100%', background: 'none', border: 'none', borderLeft: '4px solid transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
