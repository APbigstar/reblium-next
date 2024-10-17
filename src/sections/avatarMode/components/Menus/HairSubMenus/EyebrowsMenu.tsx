import React, { useState } from 'react';
import Image from 'next/image';

interface EyebrowsMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const EyebrowsMenu: React.FC<EyebrowsMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const eyebrowOptions = [
    { src: "/images/no_go.png", command: { assetname: 'No_Eyebrow' } },
    { src: "/images/Eyebrow/Icon_Eyebrow_Eyebrow_Male_7.png", command: { assetname: 'Eyebrows_7' } },
    // ... add all other eyebrow options
  ];

  const eyebrowColors = [
    { color: '#2a0d00', name: 'Dark Brown' },
    { color: '#622a00', name: 'Medium Brown' },
    // ... add all other eyebrow colors
  ];

  const randomizeEyebrows = () => {
    const randomIndex = Math.floor(Math.random() * eyebrowOptions.length);
    const randomColor = eyebrowColors[Math.floor(Math.random() * eyebrowColors.length)];

    setActiveOption(randomIndex);
    handleSendCommands(eyebrowOptions[randomIndex].command);
    handleSendCommands({ vectorname: `EyebrowsColor*${randomColor.color}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeEyebrows} style={{ width: '70%' }}>Randomize Eyebrows</button>
      <div className="image-container">
        <div className="image-row">
          {eyebrowOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Eyebrow option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      <div className="color-panel">
        <div className="color-row">
          {eyebrowColors.map((colorOption, index) => (
            <div
              key={index}
              className="color-cell"
              style={{ backgroundColor: colorOption.color }}
              onClick={() => handleSendCommands({ vectorname: `EyebrowsColor*${colorOption.color}` })}
              title={colorOption.name}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EyebrowsMenu;