"use client";

import React, { useState } from 'react';
import { FaStar, FaUser, FaPalette, FaGamepad, FaRobot } from 'react-icons/fa';
import Assistants from './assistants';
import Avatars from './avatars';
import Games from './games';
import Skins from './skins';
import WhatsNew from './whatsnew';

const tabs = [
  { id: 'whatsnew', label: "What's new?", Icon: FaStar },
  { id: 'avatars', label: 'Avatars', Icon: FaUser },
  { id: 'skins', label: 'Skins', Icon: FaPalette },
  { id: 'games', label: 'Games', Icon: FaGamepad },
  { id: 'assistants', label: 'Assistants', Icon: FaRobot },
];

const StorePage = () => {
  const [activeTab, setActiveTab] = useState('avatars');

  const renderContent = () => {
    switch (activeTab) {
      case 'whatsnew':
        return <WhatsNew />;
      case 'avatars':
        return <Avatars />;
      case 'skins':
        return <Skins />;
      case 'games':
        return <Games />;
      case 'assistants':
        return <Assistants />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex justify-start space-x-16 mb-4 p-2">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
              activeTab === id
                ? 'bg-blue-standard text-white'
                : 'text-gray-300 hover:bg-gray-600 border-white border-2'
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="mr-2" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="flex-grow overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default StorePage;