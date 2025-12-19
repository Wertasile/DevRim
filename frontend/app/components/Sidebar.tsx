import { Compass, Handshake, MessageSquare, Settings, Users } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router';

const items = [
  { icon: <Compass size={18} />, label: 'Dashboard', to: '/dashboard', variant: 'is-menu' },
  { icon: <MessageSquare size={18} />, label: 'Messages', to: '/chats' },
  { icon: <Users size={18} />, label: 'Connections', to: '/connections' },
  { icon: <Handshake size={18} />, label: 'Communities', to: '/community' },
  { icon: <Settings size={18} />, label: 'Settings', to: '/settings' },
];

const Sidebar = () => {
  return (
    <aside className="flex gap-[10px] flex-col bg-[#0D1E26] p-[5px] h-fit rounded-[5px] top-[100px] sticky" aria-label="Primary navigation">

        {items.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) =>
              `blog-rail__item ${item.variant ?? ''} ${isActive ? 'is-active' : ''}`
            }
            aria-label={item.label}
          >
            {item.icon}
          </NavLink>
        ))}

    </aside>
  );
};

export default Sidebar;