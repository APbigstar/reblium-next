"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface EyelinerSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const EyelinerSubmenu: React.FC<EyelinerSubmenuProps> = ({ handleSendCommands }) => {
  const [strength, setStrength] = useState(1);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const randomizeEyeliner = () => {
    const randomIndex = Math.floor(Math.random() * eyelinerOptions.length);
    const randomStrength = Math.random() * 0.9 + 0.1; // 0.1 to 1
    const randomColorIndex = Math.floor(Math.random() * eyelinerColors.length);
    
    setActiveOption(randomIndex);
    setStrength(randomStrength);
    
    handleSendCommands(eyelinerOptions[randomIndex].command);
    handleSendCommands({ slidertype: `M_Switch_Eyesline*${randomStrength}` });
    handleSendCommands({ vectorname: `M_EyeslineColor*${eyelinerColors[randomColorIndex].color}` });
  };

  const eyelinerOptions = [
    { src: "/images/no_go.png", command: { assetname: '00_EyesLine' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Simple_icon.png", command: { assetname: 'Simple' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Droopy_icon.png", command: { assetname: 'Eyeliner_Droopy' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Flick_icon.png", command: { assetname: 'Eyeliner_Flick' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_SimpleLong_icon.png", command: { assetname: 'Eyeliner_SimpleLong' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Double_icon.png", command: { assetname: 'Eyeliner_Double' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Fox_icon.png", command: { assetname: 'Eyeliner_Fox' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_DoubleFlick_icon.png", command: { assetname: 'Eyeliner_DoubleFlick' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Dramatic_icon.png", command: { assetname: 'Eyeliner_Dramatic' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_GraphicLiner_02_icon.png", command: { assetname: 'Eyeliner_GraphicLiner_02' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Arabic_icon.png", command: { assetname: 'Eyeliner_Arabic' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Triangle_icon.png", command: { assetname: 'Eyeliner_Triangle' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Clown_icon.png", command: { assetname: 'Eyeliner_Clown' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_Low_icon.png", command: { assetname: 'Eyeliner_Low' } },
    { src: "/images/MakeUp/Eyeliner/Eyeliner_GraphicLiner_04_icon.png", command: { assetname: 'Eyeliner_GraphicLiner_04' } },
  ];

  const eyelinerColors = [
    { color: '#000000', name: 'Black' },
    { color: '#8B4513', name: 'Saddle Brown' },
    { color: '#708090', name: 'Slate Gray' },
    { color: '#6A5ACD', name: 'Slate Blue' },
    { color: '#228B22', name: 'Forest Green' },
    { color: '#0000FF', name: 'Blue' },
    { color: '#FFDAB9', name: 'Peach Puff' },
    { color: '#E6E6FA', name: 'Lavender' },
    { color: '#AD6F69', name: 'Copper' },
    { color: '#996515', name: 'Golden Brown' },
    { color: '#C0C0C0', name: 'Silver' },
    { color: '#800020', name: 'Burgundy' },
    { color: '#483C32', name: 'Taupe' },
    { color: '#00FFFF', name: 'Cyan' },
    { color: '#663399', name: 'Rebecca Purple' },
  ];

  return (
    <div className="content-container">
      <button onClick={randomizeEyeliner} style={{ width: '70%' }}>Randomize Eyeliner</button>
      <div className="image-container">
        <div className="image-row">
          {eyelinerOptions.map((option, index) => (
            <div key={index} className={`image-cell ${activeOption === index ? 'active' : ''}`} onClick={() => handleSendCommands(option.command)}>
              <Image src={option.src} alt={`Eyeliner option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      <div className="slider-container">
        <div className="slider-label-container">
          <span className="slider-label">Strength</span>
          <span className="slider-value">{strength}</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={strength}
          className="slider"
          onChange={(e) => {
            setStrength(parseFloat(e.target.value));
            handleSendCommands({ slidertype: `M_Switch_Eyesline*${e.target.value}` });
          }}
        />
      </div>
      <div className="color-panel">
        <div className="color-row">
          {eyelinerColors.map((colorOption, index) => (
            <div
              key={index}
              className="color-cell"
              style={{ backgroundColor: colorOption.color }}
              onClick={() => handleSendCommands({ vectorname: `M_EyeslineColor*${colorOption.color}` })}
              title={colorOption.name}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EyelinerSubmenu;