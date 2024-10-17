import React, { useState } from "react";
import Image from "next/image";

import { SubMenuProps } from "../MenuInterface";

export const CheeksSubmenu: React.FC<SubMenuProps> = ({
  handleSendCommands,
}) => {
  const [size, setSize] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const cheeksOptions = [
    {
      src: "/images/Cheeks/Icon_Afro_01_Cheeks.png",
      command: { assetname: "Afro_01_Cheeks" },
    },
    {
      src: "/images/Cheeks/Icon_Afro_02_Cheeks.png",
      command: { assetname: "Afro_02_Cheeks" },
    },
    // ... add all other cheeks options
  ];

  const randomizeCheeks = () => {
    const randomIndex = Math.floor(Math.random() * cheeksOptions.length);
    const randomSize = Math.random();
    const randomMoveX = Math.random();
    const randomMoveY = Math.random();

    setActiveOption(randomIndex);
    setSize(randomSize);
    setMoveX(randomMoveX);
    setMoveY(randomMoveY);

    handleSendCommands(cheeksOptions[randomIndex].command);
    handleSendCommands({ slidertype: `CheeksSize*${randomSize}` });
    handleSendCommands({ slidertype: `CheeksMoveX_Symetry*${randomMoveX}` });
    handleSendCommands({ slidertype: `CheeksMoveY_Symetry*${randomMoveY}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeCheeks} style={{ width: "70%" }}>
        Randomize Cheeks
      </button>
      <div className="image-container">
        <div className="image-row">
          {cheeksOptions.map((option, index) => (
            <div
              key={index}
              className={`image-cell ${activeOption === index ? "active" : ""}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveOption(index);
              }}
            >
              <Image
                src={option.src}
                alt={`Cheeks option ${index}`}
                width={50}
                height={50}
              />
            </div>
          ))}
        </div>
      </div>
      {[
        { label: "Size", value: size, command: "CheeksSize" },
        { label: "CheeksMoveX", value: moveX, command: "CheeksMoveX_Symetry" },
        { label: "CheeksMoveY", value: moveY, command: "CheeksMoveY_Symetry" },
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
              if (slider.label === "Size") setSize(value);
              else if (slider.label === "CheeksMoveX") setMoveX(value);
              else if (slider.label === "CheeksMoveY") setMoveY(value);
              handleSendCommands({ slidertype: `${slider.command}*${value}` });
            }}
          />
        </div>
      ))}
    </div>
  );
};
