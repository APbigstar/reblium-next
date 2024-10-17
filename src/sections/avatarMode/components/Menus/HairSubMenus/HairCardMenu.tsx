import React, { useState } from 'react';
import Image from 'next/image';

interface HairCardMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const HairCardMenu: React.FC<HairCardMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const hairCardOptions = [
    { src: "/images/Haircards/Icons_Hair_01.PNG", command: { assetname: 'Hair01_cinematic' } },
    { src: "/images/Haircards/Icons_Hair_02.PNG", command: { assetname: 'Hair02_cinematic' } },
    { src: "/images/Haircards/Icons_Hair_03.PNG", command: { assetname: 'Hair03_cinematic' } },
    { src: "/images/Haircards/Icons_LumiaEve_hair.PNG", command: { assetname: 'Hair04_LumiaEve_cinematic' } },
    { src: "/images/Haircards/Male_Stylized_Hair_Icon.PNG", command: { assetname: 'Mesh_hair_style1' } },
    { src: "/images/Haircards/Female_Stylized_Hair_Icon.PNG", command: { assetname: 'Mesh_hair_style2' } },
  ];

  const randomizeHaircard = () => {
    const randomIndex = Math.floor(Math.random() * hairCardOptions.length);
    setActiveOption(randomIndex);
    handleSendCommands(hairCardOptions[randomIndex].command);
  };

  return (
    <div className="content-container">
      <button onClick={randomizeHaircard} style={{ width: '70%' }}>Randomize Haircard</button>
      <div className="image-container">
        <div className="image-row">
          {hairCardOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Hair Card option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HairCardMenu;