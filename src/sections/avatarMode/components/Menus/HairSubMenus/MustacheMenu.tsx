import React, { useState } from 'react';
import Image from 'next/image';

interface MustacheMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const MustacheMenu: React.FC<MustacheMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);
  const [length, setLength] = useState(1);

  const mustacheOptions = [
    { src: "/images/no_go.png", command: { assetname: '00_NO_Mustache' } },
    { src: "/images/Mustache/Mustache_Zorro.png", command: { assetname: 'Zorro' } },
    // ... add all other mustache options
  ];

  const mustacheGradients = [
    { rootColor: '#3f332b', tipColor: '#171519' },
    { rootColor: '#6d4f3a', tipColor: '#47261f' },
    // ... add all other mustache gradients
  ];

  const randomizeMustache = () => {
    const randomIndex = Math.floor(Math.random() * mustacheOptions.length);
    const randomLength = Math.random() * 0.8 + 0.2; // 0.2 to 1
    const randomGradient = mustacheGradients[Math.floor(Math.random() * mustacheGradients.length)];

    setActiveOption(randomIndex);
    setLength(randomLength);

    handleSendCommands(mustacheOptions[randomIndex].command);
    handleSendCommands({ slidertype: `MustacheLength*${randomLength}` });
    handleSendCommands({ 
      vectorname: `MustacheRootColor*${randomGradient.rootColor}`, 
      vectorname2: `MustacheTipColor*${randomGradient.tipColor}`,
      scalarname: 'MustacheBlend*0.1',
      scalarname2: 'MustacheMelanin*0.1'
    });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeMustache} style={{ width: '70%' }}>Randomize Mustache</button>
      <div className="image-container">
        <div className="image-row">
          {mustacheOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Mustache option ${index}`} width={50} height={50} />
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
            handleSendCommands({ slidertype: `MustacheLength*${value}` });
          }}
        />
      </div>
      <div className="gradient-panel">
        <div className="gradient-row">
          {mustacheGradients.map((gradient, index) => (
            <div
              key={index}
              className="gradient-cell"
              style={{
                background: `linear-gradient(to bottom right, ${gradient.rootColor}, ${gradient.tipColor})`,
              }}
              onClick={() => {
                handleSendCommands({ 
                  vectorname: `MustacheRootColor*${gradient.rootColor}`, 
                  vectorname2: `MustacheTipColor*${gradient.tipColor}`,
                  scalarname: 'MustacheBlend*0.1',
                  scalarname2: 'MustacheMelanin*0.1'
                });
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MustacheMenu;