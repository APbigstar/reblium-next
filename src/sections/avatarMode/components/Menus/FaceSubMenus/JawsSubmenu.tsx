import React, { useState } from "react";
import Image from "next/image";

import { SubMenuProps } from "../MenuInterface";

export const JawsSubmenu: React.FC<SubMenuProps> = ({ handleSendCommands }) => {
  const [size, setSize] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const jawsOptions = [
    {
      src: "/images/Jaw/Afro_01_jaw_icon.PNG",
      command: { assetname: "Afro_01_Jaw" },
    },
    {
      src: "/images/Jaw/Afro_02_jaw_icon.PNG",
      command: { assetname: "Afro_02_Jaw" },
    },
    // ... add all other jaw options
  ];

  const randomizeJaw = () => {
    const randomIndex = Math.floor(Math.random() * jawsOptions.length);
    const randomSize = Math.random();
    const randomMoveX = Math.random();
    const randomMoveY = Math.random();

    setActiveOption(randomIndex);
    setSize(randomSize);
    setMoveX(randomMoveX);
    setMoveY(randomMoveY);

    handleSendCommands(jawsOptions[randomIndex].command);
    handleSendCommands({ slidertype: `JawSize*${randomSize}` });
    handleSendCommands({ slidertype: `JawMoveX*${randomMoveX}` });
    handleSendCommands({ slidertype: `JawMoveY*${randomMoveY}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeJaw} style={{ width: "70%" }}>
        Randomize Jaw
      </button>
      <div className="image-container">
        <div className="image-row">
          {jawsOptions.map((option, index) => (
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
                alt={`Jaw option ${index}`}
                width={50}
                height={50}
              />
            </div>
          ))}
        </div>
      </div>
      {[
        { label: "Size", value: size, command: "JawSize" },
        { label: "JawMoveX", value: moveX, command: "JawMoveX" },
        { label: "JawMoveY", value: moveY, command: "JawMoveY" },
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
              else if (slider.label === "JawMoveX") setMoveX(value);
              else if (slider.label === "JawMoveY") setMoveY(value);
              handleSendCommands({ slidertype: `${slider.command}*${value}` });
            }}
          />
        </div>
      ))}
    </div>
  );
};
