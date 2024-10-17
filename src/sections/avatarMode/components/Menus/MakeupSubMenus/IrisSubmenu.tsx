import React, { useState } from 'react';
import Image from 'next/image';

interface IrisSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const IrisSubmenu: React.FC<IrisSubmenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);
  const [brightness, setBrightness] = useState(1);

  const irisOptions = [
    { src: "/images/Iris/Eye_D_Brown3_icon.PNG", command: { assetname: 'Iris_brown3' } },
    { src: "/images/Iris/Eye_D_Brown2_icon.PNG", command: { assetname: 'Iris_brown2' } },
    { src: "/images/Iris/Iris_brown_icon.PNG", command: { assetname: 'iris_Brown' } },
    { src: "/images/Iris/Eye_D_Bluerazy_icon.PNG", command: { assetname: 'Iris_bluerazy' } },
    { src: "/images/Iris/Eye_D_Green_icon.PNG", command: { assetname: 'Iris_Green' } },
    { src: "/images/Iris/Eye_D_Green2_icon.PNG", command: { assetname: 'Iris_green2' } },
    { src: "/images/Iris/Iris_bluegreen_icon.PNG", command: { assetname: 'Iris_greenY' } },
    { src: "/images/Iris/Eye_D_Blue_Icon.PNG", command: { assetname: 'Iris_blue2' } },
    { src: "/images/Iris/Eye_D_Blue_Icon.PNG", command: { assetname: 'Iris_blue' } },
    { src: "/images/Iris/Eye_D_Blue2_icon.PNG", command: { assetname: 'Iris_blue2_1' } },
    { src: "/images/Iris/Eye_D_Blue3_Icon.PNG", command: { assetname: 'Iris_blue2_2' } },
  ];

  const randomizeIris = () => {
    const randomIndex = Math.floor(Math.random() * irisOptions.length);
    const randomBrightness = Math.random() * 0.8 + 0.2; // 0.2 to 1
    
    setActiveOption(randomIndex);
    setBrightness(randomBrightness);
    
    handleSendCommands(irisOptions[randomIndex].command);
    handleSendCommands({ slidertype: `IrisBrightness*${randomBrightness}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeIris} style={{ width: '70%' }}>Randomize Iris</button>
      <div className="image-container">
        <div className="image-row">
          {irisOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Iris option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      <div className="slider-container">
        <div className="slider-label-container">
          <span className="slider-label">Iris brightness</span>
          <span className="slider-value">{brightness.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.1}
          value={brightness}
          className="slider"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setBrightness(value);
            handleSendCommands({ slidertype: `IrisBrightness*${value}` });
          }}
        />
      </div>
    </div>
  );
};

export default IrisSubmenu;