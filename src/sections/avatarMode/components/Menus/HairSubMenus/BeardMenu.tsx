import React, { useState } from 'react';
import Image from 'next/image';

interface BeardMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const BeardMenu: React.FC<BeardMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);
  const [length, setLength] = useState(1);

  const beardOptions = [
    { src: "/images/no_go.png", command: { assetname: '00_NO_Beard' } },
    { src: "/images/Beard_Icons/Icon_Beard_Imperial_Beard.png", command: { assetname: 'Imperial' } },
    // ... add all other beard options
  ];

  const beardGradients = [
    { rootColor: '#3f332b', tipColor: '#171519' },
    { rootColor: '#6d4f3a', tipColor: '#47261f' },
    // ... add all other beard gradients
  ];

  const randomizeBeard = () => {
    const randomIndex = Math.floor(Math.random() * beardOptions.length);
    const randomLength = Math.random() * 0.8 + 0.2; // 0.2 to 1
    const randomGradient = beardGradients[Math.floor(Math.random() * beardGradients.length)];

    setActiveOption(randomIndex);
    setLength(randomLength);

    handleSendCommands(beardOptions[randomIndex].command);
    handleSendCommands({ slidertype: `BeardLength*${randomLength}` });
    handleSendCommands({ 
      vectorname: `BeardRootColor*${randomGradient.rootColor}`, 
      vectorname2: `BeardTipColor*${randomGradient.tipColor}`,
      scalarname: 'BeardBlend*0.1',
      scalarname2: 'BeardMelanin*0.1'
    });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeBeard} style={{ width: '70%' }}>Randomize Beard</button>
      <div className="image-container">
        <div className="image-row">
          {beardOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Beard option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      <div className="slider-container">
        <div className="slider-label-container">
          <span className="slider-label">Length</span>
          <span className="slider-value">{length.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.01}
          value={length}
          className="slider"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setLength(value);
            handleSendCommands({ slidertype: `BeardLength*${value}` });
          }}
        />
      </div>
      <div className="gradient-panel">
        <div className="gradient-row">
          {beardGradients.map((gradient, index) => (
            <div
              key={index}
              className="gradient-cell"
              style={{
                background: `linear-gradient(to bottom right, ${gradient.rootColor}, ${gradient.tipColor})`,
              }}
              onClick={() => {
                handleSendCommands({ 
                  vectorname: `BeardRootColor*${gradient.rootColor}`, 
                  vectorname2: `BeardTipColor*${gradient.tipColor}`,
                  scalarname: 'BeardBlend*0.1',
                  scalarname2: 'BeardMelanin*0.1'
                });
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BeardMenu;