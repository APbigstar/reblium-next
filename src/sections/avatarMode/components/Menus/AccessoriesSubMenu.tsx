import React, { useState } from 'react';
import HatMenu from './AccessoriesSubMenu/HatMenu';
import GlassesMenu from './AccessoriesSubMenu/GlassesMenu';
import EarringsMenu from './AccessoriesSubMenu/EarringsMenu';
import PiercingsMenu from './AccessoriesSubMenu/PiercingsMenu';

interface AccessoriesSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const AccessoriesSubMenu: React.FC<AccessoriesSubMenuProps> = ({ handleSendCommands }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>('hat');

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  const submenus = [
    { name: 'Hat', component: HatMenu },
    { name: 'Glasses', component: GlassesMenu },
    { name: 'Earrings', component: EarringsMenu },
    { name: 'Piercings', component: PiercingsMenu },
  ];

  return (
    <ul id="accessoriesSubMenu" className="sub-menu">
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

export default AccessoriesSubMenu;