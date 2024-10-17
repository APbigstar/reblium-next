import React, { useState } from "react";
import Image from "next/image";

import { SubMenuProps } from "../MenuInterface";

export const NoseSubmenu: React.FC<SubMenuProps> = ({ handleSendCommands }) => {
  const [size, setSize] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [rotation, setRotation] = useState(0.5);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const noseOptions = [
    {
      src: "/images/Nose/Icon_Nose_Afro_01.png",
      command: { assetname: "Afro_01_Nose" },
    },
    {
      src: "/images/Nose/Icon_Nose_Afro_02.png",
      command: { assetname: "Afro_02_Nose" },
    },
    // ... add all other nose options
  ];

  const randomizeNose = () => {
    const randomIndex = Math.floor(Math.random() * noseOptions.length);
    const randomSize = Math.random();
    const randomMoveX = Math.random();
    const randomMoveY = Math.random();
    const randomRotation = Math.random();

    setActiveOption(randomIndex);
    setSize(randomSize);
    setMoveX(randomMoveX);
    setMoveY(randomMoveY);
    setRotation(randomRotation);

    handleSendCommands(noseOptions[randomIndex].command);
    handleSendCommands({ slidertype: `NoseSize*${randomSize}` });
    handleSendCommands({ slidertype: `NoseMoveX*${randomMoveX}` });
    handleSendCommands({ slidertype: `NoseMoveY*${randomMoveY}` });
    handleSendCommands({ slidertype: `NoseRotation*${randomRotation}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeNose} style={{ width: "70%" }}>
        Randomize Nose
      </button>
      <div className="image-container">
        <div className="image-row">
          {noseOptions.map((option, index) => (
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
                alt={`Nose option ${index}`}
                width={50}
                height={50}
              />
            </div>
          ))}
        </div>
      </div>
      {[
        { label: "Size", value: size, command: "NoseSize" },
        { label: "NoseMoveX", value: moveX, command: "NoseMoveX" },
        { label: "NoseMoveY", value: moveY, command: "NoseMoveY" },
        { label: "NoseRotation", value: rotation, command: "NoseRotation" },
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
              else if (slider.label === "NoseMoveX") setMoveX(value);
              else if (slider.label === "NoseMoveY") setMoveY(value);
              else setRotation(value);
              handleSendCommands({ slidertype: `${slider.command}*${value}` });
            }}
          />
        </div>
      ))}
    </div>
  );
};
