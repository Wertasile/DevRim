import { Compass, Handshake, MessageSquare, Settings, Users } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router';

const items = [
  { icon: <Compass size={20} />, label: 'Dashboard', to: '/dashboard', variant: 'is-menu' },
  { icon: <MessageSquare size={20} />, label: 'Messages', to: '/chats' },
  { icon: <Users size={20} />, label: 'Connections', to: '/connections' },
  { icon: <Handshake size={20} />, label: 'Communities', to: '/community' },
  { icon: <Settings size={20} />, label: 'Settings', to: '/settings' },
];

const Sidebar = () => {
  return (
    <aside className="flex gap-[20px] flex-col bg-[#EDEDE9] p-[5px] border-[3px] border-solid border-[#000000] h-fit top-[100px] sticky" aria-label="Primary navigation">

        {items.map((item, idx) => (
          <div className='px-[25px] py-[10px]'>
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
          </div>
        ))}

    </aside>
  );
};

export default Sidebar;