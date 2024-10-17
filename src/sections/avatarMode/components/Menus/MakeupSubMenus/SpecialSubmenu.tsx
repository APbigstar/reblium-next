import React, { useState } from 'react';
import Image from 'next/image';

interface SpecialSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const SpecialSubmenu: React.FC<SpecialSubmenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const specialOptions = [
    { src: "/images/no_go.png", command: { assetname: 'NO_Special' } },
    { src: "/images/MakeUp/Special/Special_Cybernetic_icon.png", command: { assetname: 'Cyber_1' } },
    { src: "/images/MakeUp/Special/Special_CyberCheek_icon.png", command: { assetname: 'Cyberpunk_Cheek_Implant' } },
    { src: "/images/MakeUp/Special/Special_CyberBattery_icon.png", command: { assetname: 'Cyberpunk_Face_Battery' } },
    { src: "/images/MakeUp/Special/Special_CyberImplants_icon.png", command: { assetname: 'Cyberpunk_Face_Implants' } },
    { src: "/images/MakeUp/Special/Special_CyberHexagons_icon.png", command: { assetname: 'Cyberpunk_Hexagon_Implants' } },
    { src: "/images/MakeUp/Special/Special_CyberHorizontal_icon.png", command: { assetname: 'Cyberpunk_Horizontal_Implants' } },
    { src: "/images/MakeUp/Special/Special_CyberJaw_icon.png", command: { assetname: 'Cyberpunk_Jaw' } },
    { src: "/images/MakeUp/Special/Special_CyberMetal_icon.png", command: { assetname: 'Cyberpunk_Metal_Implants' } },
    { src: "/images/MakeUp/Special/Special_FantasyGoldArmor_icon.png", command: { assetname: 'Fantasy_Gold_Armor' } },
  ];

  const randomizeSpecial = () => {
    const randomIndex = Math.floor(Math.random() * specialOptions.length);
    setActiveOption(randomIndex);
    handleSendCommands(specialOptions[randomIndex].command);
  };

  return (
    <div className="content-container">
      <button onClick={randomizeSpecial} style={{ width: '70%' }}>Randomize Special</button>
      <div className="image-container">
        <div className="image-row">
          {specialOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Special option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialSubmenu;