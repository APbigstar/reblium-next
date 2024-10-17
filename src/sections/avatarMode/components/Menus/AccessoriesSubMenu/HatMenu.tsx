import React, { useState } from 'react';
import Image from 'next/image';

interface HatMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const HatMenu: React.FC<HatMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const hatOptions = [
    { src: "/images/no_go.png", command: { assetname: 'No_Hat' } },
    { src: "/images/Hats/Beret_Red_Icon.png", command: { assetname: 'Beret_Red' } },
    { src: "/images/Hats/BucketHat_Icon.png", command: { assetname: 'BucketHat' } },
    { src: "/images/Hats/Fedora_Icon.png", command: { assetname: 'Fedora' } },
    { src: "/images/Hats/Fisherman_Beanie_Icon.png", command: { assetname: 'hat_fishermanBeanie' } },
    { src: "/images/Hats/Flat_Cap_Icon.png", command: { assetname: 'hat_flatCap' } },
    { src: "/images/Hats/Ushanka_Icon.png", command: { assetname: 'Ushanka' } },
    { src: "/images/Hats/Icon_Gutra.png", command: { assetname: 'Gutra' } },
  ];

  return (
    <div className="content-container">
      <div className="image-container">
        <div className="image-row">
          {hatOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Hat option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HatMenu;