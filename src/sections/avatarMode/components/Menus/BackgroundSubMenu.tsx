import React, { useState } from 'react';
import Image from 'next/image';

interface BackgroundSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const BackgroundSubMenu: React.FC<BackgroundSubMenuProps> = ({ handleSendCommands }) => {
  const [activeOption, setActiveOption] = useState<number | null>(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const backgroundOptions = [
    { src: "/images/no_go.png", command: { assetname: 'NoBackground2D' } },
    { src: "/images/Background/21 4928x3712.png", command: { assetname: 'Back1' } },
    { src: "/images/Background/25 2464x1856.png", command: { assetname: 'Back2' } },
    { src: "/images/Background/3 4928x3712.png", command: { assetname: 'Back3' } },
    { src: "/images/Background/5 2464x1856.png", command: { assetname: 'Back4' } },
    { src: "/images/Background/art_deco1.jpeg", command: { assetname: 'Back5' } },
    { src: "/images/Background/art_deco3.jpeg", command: { assetname: 'Back6' } },
    { src: "/images/Background/coastal4.jpeg", command: { assetname: 'Back7' } },
    { src: "/images/Background/industrial2.jpeg", command: { assetname: 'Back8' } },
    { src: "/images/Background/professional_office1.jpeg", command: { assetname: 'Back9' } },
    { src: "/images/Background/professional_office7.jpeg", command: { assetname: 'Back10' } },
  ];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <ul id="backgroundSubMenu" className="sub-menu">
      <li>
        <button className={`transparent-button ${isExpanded ? "selected" : ""}`} onClick={toggleExpand}>
          Background
        </button>
        {isExpanded && (
          <div className="content-container">
            <div className="image-container">
              <div className="image-row">
                {backgroundOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={`image-cell ${activeOption === index ? 'active' : ''}`}
                    onClick={() => {
                      handleSendCommands(option.command);
                      setActiveOption(index);
                    }}
                  >
                    <Image 
                      src={option.src} 
                      alt={`Background option ${index}`} 
                      width={50} 
                      height={50} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </li>
    </ul>
  );
};

export default BackgroundSubMenu;