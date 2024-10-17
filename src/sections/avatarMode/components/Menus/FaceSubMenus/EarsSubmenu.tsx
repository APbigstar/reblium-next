import React, { useState } from 'react';
import Image from 'next/image';

import { SubMenuProps } from '../MenuInterface';

export const EarsSubmenu: React.FC<SubMenuProps> = ({ handleSendCommands }) => {
  const [size, setSize] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const earsOptions = [
    { src: "/images/Ears/Icon_Ear_Afro_01.png", command: { assetname: 'Afro_01_Ears' } },
    { src: "/images/Ears/Icon_Ear_Afro_02.png", command: { assetname: 'Afro_02_Ears' } },
    { src: "/images/Ears/Icon_Ear_Arabic_01.png", command: { assetname: 'Arabic_01_Ears' } },
    { src: "/images/Ears/Icon_Ear_Arabic_02.png", command: { assetname: 'Arabic_02_Ears' } },
    { src: "/images/Ears/Icon_Ear_Asian_01.png", command: { assetname: 'Asian_01_Ears' } },
    // ... add all other ear options
  ];

  const randomizeEars = () => {
    const randomIndex = Math.floor(Math.random() * earsOptions.length);
    const randomSize = Math.random();
    const randomMoveX = Math.random();
    const randomMoveY = Math.random();
    const randomRotation = Math.random();

    setActiveOption(randomIndex);
    setSize(randomSize);
    setMoveX(randomMoveX);
    setMoveY(randomMoveY);
    setRotation(randomRotation);

    handleSendCommands(earsOptions[randomIndex].command);
    handleSendCommands({ slidertype: `EarsSize*${randomSize}` });
    handleSendCommands({ slidertype: `EarsMoveX*${randomMoveX}` });
    handleSendCommands({ slidertype: `EarsMoveY*${randomMoveY}` });
    handleSendCommands({ slidertype: `EarsRotation*${randomRotation}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeEars} style={{ width: '70%' }}>Randomize Ears</button>
      <div className="image-container">
        <div className="image-row">
          {earsOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Ear option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      {[
        { label: 'Size', value: size, command: 'EarsSize' },
        { label: 'EarsMoveX', value: moveX, command: 'EarsMoveX' },
        { label: 'EarsMoveY', value: moveY, command: 'EarsMoveY' },
        { label: 'EarsRotation', value: rotation, command: 'EarsRotation' }
      ].map((slider) => (
        <div key={slider.label} className="slider-container">
          <div className="slider-label-container">
            <span className="slider-label">{slider.label}</span>
            <span className="slider-value">{slider.value.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={slider.value}
            className="slider custom-slider"
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (slider.label === 'Size') setSize(value);
              else if (slider.label === 'EarsMoveX') setMoveX(value);
              else if (slider.label === 'EarsMoveY') setMoveY(value);
              else setRotation(value);
              handleSendCommands({ slidertype: `${slider.command}*${value}` });
            }}
          />
        </div>
      ))}
    </div>
  );
};
