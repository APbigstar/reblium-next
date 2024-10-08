"use client";

import React from 'react';
import Link from 'next/link';
import { FaCompass, FaUsers, FaUser, FaDiscord, FaTag, FaSignOutAlt } from 'react-icons/fa';
import { useAuthAndUser } from '@/hooks/useAuthAndUser';

const Sidebar: React.FC = () => {
  const { logout } = useAuthAndUser();

  return (
    <div className="overlay-menu">
      <div id="newButton" className="menu">
        <Link href='/dashboard/discover' className='flex items-center gap-2'>
          {/* <FaCompass /> Discover */}
          <FaCompass />
        </Link>
        <Link href='/dashboard/template' className='flex items-center gap-2'>
          {/* <FaUsers /> Templates */}
          <FaUsers />
        </Link>
        <Link href='/dashboard/avatar' className='flex items-center gap-2'>
          <FaUser /> 
          {/* <FaUser /> My Avatars */}
        </Link>
        <Link href="https://discord.gg/AA9tDP8Djg" className='flex items-center gap-2' target="_blank" rel="noopener noreferrer">
          {/* <FaDiscord /> Discord */}
          <FaDiscord />
        </Link>
        <Link href='/dashboard/pricing' className='flex items-center gap-2'>
          {/* <FaTag /> Pricing */}
          <FaTag />
        </Link>
        <Link href='' className='flex items-center gap-2' onClick={logout}>
          {/* <FaSignOutAlt /> Logout */}
          <FaSignOutAlt />
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;