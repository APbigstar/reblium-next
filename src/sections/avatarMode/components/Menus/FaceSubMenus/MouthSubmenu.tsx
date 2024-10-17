import React, { useState } from "react";
import Image from "next/image";

import { SubMenuProps } from "../MenuInterface";

export const MouthSubmenu: React.FC<SubMenuProps> = ({
  handleSendCommands,
}) => {
  const [size, setSize] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const mouthOptions = [
    {
      src: "/images/Mouth/Icon_Afro_01_Mouth.png",
      command: { assetname: "Afro_01_Mouth" },
    },
    {
      src: "/images/Mouth/Icon_Afro_02_Mouth.png",
      command: { assetname: "Afro_02_Mouth" },
    },
    // ... add all other mouth options
  ];

  const randomizeMouth = () => {
    const randomIndex = Math.floor(Math.random() * mouthOptions.length);
    const randomSize = Math.random();
    const randomMoveX = Math.random();
    const randomMoveY = Math.random();

    setActiveOption(randomIndex);
    setSize(randomSize);
    setMoveX(randomMoveX);
    setMoveY(randomMoveY);

    handleSendCommands(mouthOptions[randomIndex].command);
    handleSendCommands({ slidertype: `MouthSize*${randomSize}` });
    handleSendCommands({ slidertype: `MouthMoveX*${randomMoveX}` });
    handleSendCommands({ slidertype: `MouthMoveY*${randomMoveY}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeMouth} style={{ width: "70%" }}>
        Randomize Mouth
      </button>
      <div className="image-container">
        <div className="image-row">
          {mouthOptions.map((option, index) => (
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
                alt={`Mouth option ${index}`}
                width={50}
                height={50}
              />
            </div>
          ))}
        </div>
      </div>
      {[
        { label: "Size", value: size, command: "MouthSize" },
        { label: "MouthMoveX", value: moveX, command: "MouthMoveX" },
        { label: "MouthMoveY", value: moveY, command: "MouthMoveY" },
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
              else if (slider.label === "MouthMoveX") setMoveX(value);
              else if (slider.label === "MouthMoveY") setMoveY(value);
              handleSendCommands({ slidertype: `${slider.command}*${value}` });
            }}
          />
        </div>
      ))}
    </div>
  );
};
