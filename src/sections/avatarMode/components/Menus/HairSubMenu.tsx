import React, { useState } from 'react';
import HairMenu from './HairSubMenus/HairMenu';
import EyebrowsMenu from './HairSubMenus/EyebrowsMenu';
import EyelashesMenu from './HairSubMenus/EyelashesMenu';
import MustacheMenu from './HairSubMenus/MustacheMenu';
import BeardMenu from './HairSubMenus/BeardMenu';
import HairCardMenu from './HairSubMenus/HairCardMenu';

interface HairSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const HairSubMenu: React.FC<HairSubMenuProps> = ({ handleSendCommands }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>('hair');

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  const submenus = [
    { name: 'Hair', component: HairMenu },
    { name: 'Eyebrows', component: EyebrowsMenu },
    { name: 'Eyelashes', component: EyelashesMenu },
    { name: 'Mustache', component: MustacheMenu },
    { name: 'Beard', component: BeardMenu },
    { name: 'Card', component: HairCardMenu },
  ];

  return (
    <ul id="hairSubMenu" className="sub-menu">
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

export default HairSubMenu;