import React, { useState } from 'react';
import Image from 'next/image';

interface EyeShadowSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const EyeShadowSubmenu: React.FC<EyeShadowSubmenuProps> = ({ handleSendCommands }) => {
  const [strength, setStrength] = useState(1);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const randomizeEyeShadow = () => {
    const randomIndex = Math.floor(Math.random() * eyeShadowOptions.length);
    const randomStrength = Math.random() * 0.9 + 0.1; // 0.1 to 1
    const randomColorIndex = Math.floor(Math.random() * eyeShadowColors.length);
    
    setActiveOption(randomIndex);
    setStrength(randomStrength);
    
    handleSendCommands(eyeShadowOptions[randomIndex].command);
    handleSendCommands({ slidertype: `M_Switch_EyeShadow*${randomStrength}` });
    handleSendCommands({ vectorname: `M_EyeshadowColor*${eyeShadowColors[randomColorIndex].color}` });
  };

  const eyeShadowOptions = [
    { src: "/images/no_go.png", command: { assetname: '00_EyesShadow' } },
    { src: "/images/MakeUp/Eyeshadow/Eye_Shadow_SmokeyCatEye.png", command: { assetname: 'Eye_Shadow_SmokeyCatEye' } },
    { src: "/images/MakeUp/Eyeshadow/Shadow_2.png", command: { assetname: 'Shadow_2' } },
    { src: "/images/MakeUp/Eyeshadow/EyeShadow_Panda_Icon.png", command: { assetname: 'EyeShadow_Panda_Icon' } },
    { src: "/images/MakeUp/Eyeshadow/Preset_RedBlue_icon.png", command: { assetname: 'Preset_RedBlue' } },
  ];

  const eyeShadowColors = [
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
      <button onClick={randomizeEyeShadow} style={{ width: '70%' }}>Randomize Eye Shadow</button>
      <div className="image-container">
        <div className="image-row">
          {eyeShadowOptions.map((option, index) => (
            <div key={index} className={`image-cell ${activeOption === index ? 'active' : ''}`} onClick={() => handleSendCommands(option.command)}>
              <Image src={option.src} alt={`Eye Shadow option ${index}`} width={50} height={50} />
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
            handleSendCommands({ slidertype: `M_Switch_EyeShadow*${e.target.value}` });
          }}
        />
      </div>
      <div className="color-panel">
        <div className="color-row">
          {eyeShadowColors.map((colorOption, index) => (
            <div
              key={index}
              className="color-cell"
              style={{ backgroundColor: colorOption.color }}
              onClick={() => handleSendCommands({ vectorname: `M_EyeshadowColor*${colorOption.color}` })}
              title={colorOption.name}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EyeShadowSubmenu;