import React, { useState } from 'react';
import Image from 'next/image';

interface PiercingsMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const PiercingsMenu: React.FC<PiercingsMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const piercingOptions = [
    { src: "/images/no_go.png", command: { assetname: 'No_Piercing' } },
    { src: "/images/Eyebrow_Piercing/Left/LeftEyePiercing_Piercing_01_icon.png", command: { assetname: 'eyebrow_left_01' } },
    { src: "/images/Eyebrow_Piercing/Left/LeftEyePiercing_Piercing_02_icon.png", command: { assetname: 'eyebrow_left_02' } },
    { src: "/images/Eyebrow_Piercing/Right/RightEyePiercing_Piercing_01_icon.png", command: { assetname: 'eyebrow_right_01' } },
    { src: "/images/Eyebrow_Piercing/Right/RightEyePiercing_Piercing_02_icon.png", command: { assetname: 'eyebrow_right_02' } },
    { src: "/images/Nose_Piercings/NosePiercing_Nose_01_icon.png", command: { assetname: 'Nose_1' } },
    { src: "/images/Nose_Piercings/NosePiercing_Piercing_01_icon.png", command: { assetname: 'nose_piercing_01' } },
    { src: "/images/Nose_Piercings/NosePiercing_Ring_01_icon.png", command: { assetname: 'nose_ring_01' } },
    { src: "/images/Nose_Piercings/NosePiercing_Ring_02_icon.png", command: { assetname: 'nose_ring_02' } },
    { src: "/images/Nose_Piercings/NosePiercing_Ring_03_icon.png", command: { assetname: 'nose_ring_03' } },
  ];

  return (
    <div className="content-container">
      <div className="image-container">
        <div className="image-row">
          {piercingOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Piercing option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PiercingsMenu;