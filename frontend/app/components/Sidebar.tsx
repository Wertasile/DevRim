import { Compass, Handshake, MessageSquare, Settings, Users, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router';

const items = [
  { icon: <Compass size={20} />, label: 'Dashboard', to: '/dashboard', variant: 'is-menu' },
  { icon: <MessageSquare size={20} />, label: 'Messages', to: '/chats' },
  { icon: <Users size={20} />, label: 'Connections', to: '/connections' },
  { icon: <Handshake size={20} />, label: 'Communities', to: '/community' },
  { icon: <Settings size={20} />, label: 'Settings', to: '/settings' },
];

const Sidebar = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  return (

      <aside 
        className={`flex gap-[20px] p-[25px] flex-col bg-[#EDEDE9] border-[3px] border-solid border-[#000000] transition-all min-w-fit duration-1000 h-fit top-[100px] sticky rounded-lg shadow-lg min-w-0`}
        aria-label="Primary navigation"
      >
              {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 bg-[#FEC72F] w-full border-2 border-[#000000] rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          aria-label={isMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {isMinimized ? <Menu size={20} /> : <X size={20}/>}
        </button>
        {items.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#FEC72F] text-black font-semibold shadow-md' 
                  : 'hover:bg-[#FEC72F]/30 text-black'
              }`
            }
            aria-label={item.label}
            onClick={() => {
              // Close sidebar on mobile after clicking
              if (window.innerWidth < 768) {
                setIsMinimized(true);
              }
            }}
          >
            {item.icon}
            {<div className={`text-small font-medium transition-all duration-300 ${isMinimized ? 'hidden' : 'block'}`}>{item.label}</div>}
          </NavLink>
        ))}
      </aside>
  );
};

export default Sidebar;