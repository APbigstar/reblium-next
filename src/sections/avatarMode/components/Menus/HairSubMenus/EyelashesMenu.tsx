import React, { useState } from 'react';
import Image from 'next/image';

interface EyelashesMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const EyelashesMenu: React.FC<EyelashesMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const eyelashOptions = [
    { src: "/images/Eyelashes/eyelash_short_icon.png", command: { assetname: 'Lashes_Short' } },
    { src: "/images/Eyelashes/Icon_Eyelash_Eyelash_Male2.png", command: { assetname: 'DefaultEyelashes' } },
    { src: "/images/Eyelashes/Icon_Eyelash_Girly_lashes.png", command: { assetname: 'Girly' } },
    { src: "/images/Eyelashes/Icon_Eyelash_Alice.png", command: { assetname: 'Alice_Eyelashes' } },
    { src: "/images/Eyelashes/Icon_Eyelash_Clumped.png", command: { assetname: 'Eyelashes_Clumped_Lashes' } },
    { src: "/images/Eyelashes/Icon_Eyelash_AB_Lashes_01.png", command: { assetname: 'AB_Lashes_01' } },
  ];

  const eyelashColors = [
    { color: '#2a0d00', name: 'Dark Brown' },
    { color: '#622a00', name: 'Medium Brown' },
    // ... add all other eyelash colors
  ];

  const randomizeEyelashes = () => {
    const randomIndex = Math.floor(Math.random() * eyelashOptions.length);
    const randomColor = eyelashColors[Math.floor(Math.random() * eyelashColors.length)];

    setActiveOption(randomIndex);
    handleSendCommands(eyelashOptions[randomIndex].command);
    handleSendCommands({ vectorname: `EyelsahesColor*${randomColor.color}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeEyelashes} style={{ width: '70%' }}>Randomize Eyelashes</button>
      <div className="image-container">
        <div className="image-row">
          {eyelashOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Eyelash option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      <div className="color-panel">
        <div className="color-row">
          {eyelashColors.map((colorOption, index) => (
            <div
              key={index}
              className="color-cell"
              style={{ backgroundColor: colorOption.color }}
              onClick={() => handleSendCommands({ vectorname: `EyelsahesColor*${colorOption.color}` })}
              title={colorOption.name}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EyelashesMenu;