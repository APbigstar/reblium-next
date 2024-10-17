import React, { useState } from 'react';
import Image from 'next/image';

interface EarringsMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const EarringsMenu: React.FC<EarringsMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const earringsOptions = [
    { src: "/images/no_go.png", command: { assetname: 'No_Earrings' } },
    { src: "/images/Right_Earring/Earring_1_Icon.png", command: { assetname: 'Earring_1' } },
    { src: "/images/Right_Earring/Ring_Bottom_Icon.png", command: { assetname: 'Earring_RingBottom' } },
    { src: "/images/Right_Earring/Ring_Middle_Icon.png", command: { assetname: 'Earring_RingMiddle' } },
    { src: "/images/Right_Earring/Ring_Top_Icon.png", command: { assetname: 'Earring_RingTop' } },
    { src: "/images/Left_Earring/Diamond_Branches_L_Icon.png", command: { assetname: 'EarringLeft_DiamondBranches' } },
    { src: "/images/Left_Earring/Letter_L_Icon.png", command: { assetname: 'EarringLeft_Letters' } },
    { src: "/images/Left_Earring/Long_Beam_Diamonds_L_Icon.png", command: { assetname: 'earringLeft_longBeamDiamond' } },
    { src: "/images/Left_Earring/Pearl_Earrings_L_Icon.png", command: { assetname: 'earringLeft_pearl' } },
    { src: "/images/Left_Earring/Ring_Bottom_01_Icon.png", command: { assetname: 'earringLeft_ringBottom_01' } },
    { src: "/images/Left_Earring/Ring_Middle_01_Icon.png", command: { assetname: 'earringLeft_ringMiddle_01' } },
    { src: "/images/Left_Earring/Ring_Top_01_Icon.png", command: { assetname: 'earringLeft_ringTop_01' } },
    { src: "/images/Right_Earring/Diamond_Branches_R_Icon.png", command: { assetname: 'earringRight_diamondBranches' } },
    { src: "/images/Right_Earring/Letter_R_Icon.png", command: { assetname: 'earringRight_letters' } },
    { src: "/images/Right_Earring/Long_Beam_Diamonds_R_Icon.png", command: { assetname: 'earringRight_longBeamDiamond' } },
    { src: "/images/Right_Earring/Pearl_Earrings_R_Icon.png", command: { assetname: 'earringRight_pearl' } },
    { src: "/images/Right_Earring/Earring_Bottom_01_Icon.png", command: { assetname: 'earringRight_ringBottom_01' } },
    { src: "/images/Right_Earring/Earring_Middle_01_Icon.png", command: { assetname: 'earringRight_ringMiddle_01' } },
    { src: "/images/Right_Earring/Earring_Top_01_Icon.png", command: { assetname: 'earringRight_ringTop_01' } },
  ];

  return (
    <div className="content-container">
      <div className="image-container">
        <div className="image-row">
          {earringsOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Earring option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarringsMenu;