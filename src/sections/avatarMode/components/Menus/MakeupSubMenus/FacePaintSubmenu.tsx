import React, { useState } from 'react';
import Image from 'next/image';

interface FacePaintSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const FacePaintSubmenu: React.FC<FacePaintSubmenuProps> = ({ handleSendCommands }) => {
  const [strength, setStrength] = useState(1);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const facePaintOptions = [
    { src: "/images/no_go.png", command: { assetname: 'NO_facePaint' } },
    { src: "/images/MakeUp/Preset/Preset_Clown_icon.png", command: { assetname: 'facePaint_Clown' } },
    { src: "/images/MakeUp/Preset/Preset_Honey_icon.png", command: { assetname: 'facePaint_Honey' } },
    { src: "/images/MakeUp/Preset/Preset_Mermaid_icon.png", command: { assetname: 'facePaint_Mermaid' } },
    { src: "/images/MakeUp/Preset/Preset_Deer_icon.png", command: { assetname: 'facePaint_Reindeer' } },
    { src: "/images/MakeUp/Preset/Preset_SugarSkull_Icon.png", command: { assetname: 'facePaint_SugarSkull' } },
    { src: "/images/MakeUp/Preset/Preset_Tiger_icon.png", command: { assetname: 'facePaint_Tiger' } },
    { src: "/images/MakeUp/Preset/Preset_Zebra_icon.png", command: { assetname: 'facePaint_Zebra' } },
    { src: "/images/MakeUp/Preset/Amphibian.png", command: { assetname: 'facePaint_Amphibian' } },
    { src: "/images/MakeUp/Preset/Avatar_movie.png", command: { assetname: 'facePaint_Avatar' } },
    { src: "/images/MakeUp/Preset/Dog_Face_Icon.png", command: { assetname: 'facePaint_Dog' } },
    { src: "/images/MakeUp/Preset/Dragon_Face_Icon.png", command: { assetname: 'facePaint_Dragon' } },
    { src: "/images/MakeUp/Preset/Goat_Face_Icon.png", command: { assetname: 'facePaint_Goat' } },
    { src: "/images/MakeUp/Preset/Monkey_Face_Icon.png", command: { assetname: 'facePaint_Monkey' } },
    { src: "/images/MakeUp/Preset/Ox_Face_Icon.png", command: { assetname: 'facePaint_Ox' } },
  ];

  const randomizeFacePaint = () => {
    const randomIndex = Math.floor(Math.random() * facePaintOptions.length);
    const randomStrength = Math.random() * 0.9 + 0.1; // 0.1 to 1
    
    setActiveOption(randomIndex);
    setStrength(randomStrength);
    
    handleSendCommands(facePaintOptions[randomIndex].command);
    handleSendCommands({ slidertype: `M_Switch_FacePaint*${randomStrength}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeFacePaint} style={{ width: '70%' }}>Randomize Face Paint</button>
      <div className="image-container">
        <div className="image-row">
          {facePaintOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Face Paint option ${index}`} width={50} height={50} />
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

export default FacePaintSubmenu;