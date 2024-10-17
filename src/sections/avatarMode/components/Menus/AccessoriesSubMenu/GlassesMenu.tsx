import React, { useState } from 'react';
import Image from 'next/image';

interface GlassesMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const GlassesMenu: React.FC<GlassesMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const glassesOptions = [
    { src: "/images/no_go.png", command: { assetname: 'No_Glasses' } },
    { src: "/images/Glasses/Glasses_01.png", command: { assetname: 'Glasses_01' } },
    { src: "/images/Glasses/Glasses_02.png", command: { assetname: 'Glasses_02' } },
    { src: "/images/Glasses/Glasses_03.png", command: { assetname: 'Glasses_03' } },
    { src: "/images/Glasses/Glasses_04.png", command: { assetname: 'Glasses_04' } },
    { src: "/images/Glasses/Glasses_05.png", command: { assetname: 'Glasses_05' } },
    { src: "/images/Glasses/Glasses_06.png", command: { assetname: 'Glasses_06' } },
  ];

  return (
    <div className="content-container">
      <div className="image-container">
        <div className="image-row">
          {glassesOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Glasses option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlassesMenu;