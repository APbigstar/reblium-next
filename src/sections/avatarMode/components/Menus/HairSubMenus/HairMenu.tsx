import React, { useState } from 'react';
import Image from 'next/image';

interface HairMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const HairMenu: React.FC<HairMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);
  const [length, setLength] = useState(1);
  const [blend, setBlend] = useState(0.2);
  const [melanin, setMelanin] = useState(0.1);

  const hairOptions = [
    { src: "/images/Hair/Icon_Hair_08_v2.PNG", command: { assetname: 'hair_08_v2' } },
    { src: "/images/Hair/Icon_Hair_Hair_Male_03.PNG", command: { assetname: 'Hair_Male_03' } },
    // ... add all other hair options
  ];

  const hairGradients = [
    { rootColor: '#3f332b', tipColor: '#171519' },
    { rootColor: '#6d4f3a', tipColor: '#47261f' },
    // ... add all other hair gradients
  ];

  const randomizeHair = () => {
    const randomIndex = Math.floor(Math.random() * hairOptions.length);
    const randomLength = Math.random() * 0.8 + 0.2; // 0.2 to 1
    const randomBlend = Math.random() * 0.3; // 0 to 0.3
    const randomMelanin = Math.random(); // 0 to 1
    const randomGradient = hairGradients[Math.floor(Math.random() * hairGradients.length)];

    setActiveOption(randomIndex);
    setLength(randomLength);
    setBlend(randomBlend);
    setMelanin(randomMelanin);

    handleSendCommands(hairOptions[randomIndex].command);
    handleSendCommands({ slidertype: `HairLength*${randomLength}` });
    handleSendCommands({ scalarname: `HairBlend*${randomBlend}` });
    handleSendCommands({ scalarname: `HairMelanin*${randomMelanin}` });
    handleSendCommands({ vectorname: `HairRootColor*${randomGradient.rootColor}`, vectorname2: `HairTipColor*${randomGradient.tipColor}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeHair} style={{ width: '70%' }}>Randomize Hair</button>
      <div className="image-container">
        <div className="image-row">
          {hairOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Hair option ${index}`} width={50} height={50} />
              <p>2</p>
            </div>
          ))}
        </div>
      </div>
      {[
        { label: 'Length', value: length, min: 0.2, max: 1, command: 'HairLength' },
        { label: 'Blend', value: blend, min: 0, max: 0.3, command: 'HairBlend' },
        { label: 'Melanin', value: melanin, min: 0, max: 1, command: 'HairMelanin' },
      ].map((slider) => (
        <div key={slider.label} className="slider-container">
          <div className="slider-label-container">
            <span className="slider-label">{slider.label}</span>
            <span className="slider-value">{slider.value.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            step={0.01}
            value={slider.value}
            className="slider"
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (slider.label === 'Length') setLength(value);
              else if (slider.label === 'Blend') setBlend(value);
              else setMelanin(value);
              handleSendCommands({ [slider.label === 'Length' ? 'slidertype' : 'scalarname']: `${slider.command}*${value}` });
            }}
          />
        </div>
      ))}
      <div className="gradient-panel">
        <div className="gradient-row">
          {hairGradients.map((gradient, index) => (
            <div
              key={index}
              className="gradient-cell"
              style={{
                background: `linear-gradient(to bottom right, ${gradient.rootColor}, ${gradient.tipColor})`,
              }}
              onClick={() => {
                handleSendCommands({ 
                  vectorname: `HairRootColor*${gradient.rootColor}`, 
                  vectorname2: `HairTipColor*${gradient.tipColor}`,
                  scalarname: 'HairBlend*0.1',
                  scalarname2: 'HairMelanin*0.1'
                });
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HairMenu;