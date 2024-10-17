"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface TattooSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const TattooSubmenu: React.FC<TattooSubmenuProps> = ({ handleSendCommands }) => {
  const [strength, setStrength] = useState(1);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const tattooOptions = [
    { src: "/images/no_go.png", command: { assetname: 'NO_facePaint' } },
    { src: "/images/MakeUp/Tattoo/Face_Tattoo_Icon.PNG", command: { assetname: 'Preset_FaceTattoos' } },
    { src: "/images/MakeUp/Tattoo/Face_Tattoo_Skull_Icon.PNG", command: { assetname: 'facetattoo_maori' } },
    { src: "/images/MakeUp/Tattoo/Face_Tattoo_04_Icon.PNG", command: { assetname: 'Face_Tattoo_4' } },
    { src: "/images/MakeUp/Tattoo/Face_Tattoo_05_Icon.PNG", command: { assetname: 'Face_Tattoo_5' } },
    { src: "/images/MakeUp/Tattoo/Face_Tattoo_06_Icon.PNG", command: { assetname: 'Face_Tattoo_6' } },
    { src: "/images/MakeUp/Tattoo/Face_Tattoo_07_Icon.PNG", command: { assetname: 'Face_Tattoo_7' } },
    { src: "/images/MakeUp/Tattoo/Face_Tattoo_08_Icon.PNG", command: { assetname: 'Face_Tattoo_8' } },
  ];

  const randomizeTattoo = () => {
    const randomIndex = Math.floor(Math.random() * tattooOptions.length);
    const randomStrength = Math.random() * 0.9 + 0.1; // 0.1 to 1
    
    setActiveOption(randomIndex);
    setStrength(randomStrength);
    
    handleSendCommands(tattooOptions[randomIndex].command);
    handleSendCommands({ slidertype: `M_Switch_FacePaint*${randomStrength}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeTattoo} style={{ width: '70%' }}>Randomize Tattoo</button>
      <div className="image-container">
        <div className="image-row">
          {tattooOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Tattoo option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      <div className="slider-container">
        <div className="slider-label-container">
          <span className="slider-label">Strength</span>
          <span className="slider-value">{strength.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={strength}
          className="slider"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setStrength(value);
            handleSendCommands({ slidertype: `M_Switch_FacePaint*${value}` });
          }}
        />
      </div>
    </div>
  );
};

export default TattooSubmenu;