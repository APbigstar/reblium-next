import React, { useState } from 'react';
import Image from 'next/image';

interface IrisLensSubmenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const IrisLensSubmenu: React.FC<IrisLensSubmenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const irisLensOptions = [
    { src: "/images/no_go.png", command: { assetname: '00_Lens' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Anime_icon.png", command: { assetname: 'Iris_Ocean' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Cyborg_icon.png", command: { assetname: 'Iris_Cyborg' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Ghost_icon.png", command: { assetname: 'Iris_Ghost' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Heart_icon.png", command: { assetname: 'Iris_Heart' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Pentagram_icon.png", command: { assetname: 'Iris_Pentagram' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Smiley_icon.png", command: { assetname: 'Iris_Smiley' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Snake_icon.png", command: { assetname: 'Iris_Snake' } },
    { src: "/images/MakeUp/EyesEffect/Iris_Snake_icon.png", command: { assetname: 'Iris_Brown' } },
  ];

  const randomizeIrisLens = () => {
    const randomIndex = Math.floor(Math.random() * irisLensOptions.length);
    setActiveOption(randomIndex);
    handleSendCommands(irisLensOptions[randomIndex].command);
  };

  return (
    <div className="content-container">
      <button onClick={randomizeIrisLens} style={{ width: '70%' }}>Randomize Iris Lens</button>
      <div className="image-container">
        <div className="image-row">
          {irisLensOptions.map((option, index) => (
            <div 
              key={index} 
              className={`image-cell ${activeOption === index ? 'active' : ''}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image src={option.src} alt={`Iris Lens option ${index}`} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IrisLensSubmenu;