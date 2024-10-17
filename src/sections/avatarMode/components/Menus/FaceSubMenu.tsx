import React, { useState } from "react";
import Image from "next/image";

// Import subcomponents (we'll define these below)
import { CheeksSubmenu } from "./FaceSubMenus/CheeksSubmenu";
import { EarsSubmenu } from "./FaceSubMenus/EarsSubmenu";
import { EyesSubmenu } from "./FaceSubMenus/EyesSubmenu";
import { JawsSubmenu } from "./FaceSubMenus/JawsSubmenu";
import { MouthSubmenu } from "./FaceSubMenus/MouthSubmenu";
import { NoseSubmenu } from "./FaceSubMenus/NoseSubmenu";

interface SculptSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const FaceSubMenu: React.FC<SculptSubMenuProps> = ({ handleSendCommands }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>("eyes");

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  const submenus = [
    { name: "Eyes", component: EyesSubmenu },
    { name: "Ears", component: EarsSubmenu },
    { name: "Nose", component: NoseSubmenu },
    { name: "Mouth", component: MouthSubmenu },
    { name: "Cheeks", component: CheeksSubmenu },
    { name: "Jaws", component: JawsSubmenu },
  ];

  return (
    <ul id="sculptSubMenu" className="sub-menu">
      {submenus.map(({ name, component: SubmenuComponent }) => (
        <li key={name}>
          <button
            className={`transparent-button ${
              activeSubmenu === name.toLowerCase() ? "selected" : ""
            }`}
            onClick={() => toggleSubmenu(name.toLowerCase())}
          >
            {name}
          </button>
          {activeSubmenu === name.toLowerCase() && (
            <SubmenuComponent handleSendCommands={handleSendCommands} />
          )}
        </li>
      ))}
    </ul>
  );
};

export default FaceSubMenu;
