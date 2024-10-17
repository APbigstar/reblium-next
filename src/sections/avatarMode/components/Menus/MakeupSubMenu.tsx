"use client";

import React, { useState } from 'react';
import LipstickSubmenu from './MakeupSubMenus/LipstickSubmenu';
import EyeShadowSubmenu from './MakeupSubMenus/EyeShadowSubmenu';
import EyelinerSubmenu from './MakeupSubMenus/EyelinerSubmenu';
import FacePaintSubmenu from './MakeupSubMenus/FacePaintSubmenu';
import TattooSubmenu from './MakeupSubMenus/TattooSubmenu';
import FoundationSubmenu from './MakeupSubMenus/FoundationSubmenu';
import IrisLensSubmenu from './MakeupSubMenus/IrisLensSubmenu';
import IrisSubmenu from './MakeupSubMenus/IrisSubmenu';
import SpecialSubmenu from './MakeupSubMenus/SpecialSubmenu';

interface MakeupSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const MakeupSubMenu: React.FC<MakeupSubMenuProps> = ({ handleSendCommands }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>("lipstick");

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  const submenus = [
    { name: 'Lipstick', component: LipstickSubmenu },
    { name: 'Eye shadow', component: EyeShadowSubmenu },
    { name: 'Eyeliner', component: EyelinerSubmenu },
    { name: 'Face Paint', component: FacePaintSubmenu },
    { name: 'Tattoo', component: TattooSubmenu },
    { name: 'Foundation', component: FoundationSubmenu },
    { name: 'Iris Lens', component: IrisLensSubmenu },
    { name: 'Iris', component: IrisSubmenu },
    { name: 'Special', component: SpecialSubmenu },
  ];

  return (
    <ul id="makeupSubMenu" className="sub-menu">
      {submenus.map(({ name, component: SubmenuComponent }) => (
        <li key={name}>
          <button
            className={`transparent-button ${activeSubmenu === name.toLowerCase() ? 'selected' : ''}`}
            onClick={() => toggleSubmenu(name.toLowerCase())}
          >
            {name}
          </button>
          {activeSubmenu === name.toLowerCase() && <SubmenuComponent handleSendCommands={handleSendCommands} />}
        </li>
      ))}
    </ul>
  );
};

export default MakeupSubMenu;