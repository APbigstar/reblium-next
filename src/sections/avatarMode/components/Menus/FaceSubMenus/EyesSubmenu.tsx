import React, { useState } from 'react';
import Image from 'next/image';

import { SubMenuProps } from '../MenuInterface';

export const EyesSubmenu: React.FC<SubMenuProps> = ({ handleSendCommands }) => {
  const [size, setSize] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [rotation, setRotation] = useState(0.5);
  const [activeOption, setActiveOption] = useState<number | null>(null);

  const eyesOptions = [
    {
      src: "/images/Eyes/Icon_Eye_Afro_01.png",
      command: { assetname: "Afro_01_Eyes" },
    },
    {
      src: "/images/Eyes/Icon_Eye_Afro_02.png",
      command: { assetname: "Afro_02_Eyes" },
    },
    // ... add all other eye options
  ];

  const randomizeEyes = () => {
    const randomIndex = Math.floor(Math.random() * eyesOptions.length);
    const randomSize = Math.random();
    const randomMoveX = Math.random() * 0.6;
    const randomMoveY = Math.random() * 0.6;
    const randomRotation = Math.random();

    setActiveOption(randomIndex);
    setSize(randomSize);
    setMoveX(randomMoveX);
    setMoveY(randomMoveY);
    setRotation(randomRotation);

    handleSendCommands(eyesOptions[randomIndex].command);
    handleSendCommands({ slidertype: `EyesSize*${randomSize}` });
    handleSendCommands({ slidertype: `EyesMoveX*${randomMoveX}` });
    handleSendCommands({ slidertype: `EyesMoveY*${randomMoveY}` });
    handleSendCommands({ slidertype: `EyesRotation*${randomRotation}` });
  };

  return (
    <div className="content-container">
      <button onClick={randomizeEyes} style={{ width: "70%" }}>
        Randomize Eyes
      </button>
      <div className="image-container">
        <div className="image-row">
          {eyesOptions.map((option, index) => (
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
                alt={`Eye option ${index}`}
                width={50}
                height={50}
              />
            </div>
          ))}
        </div>
      </div>
      {[
        { label: "Size", value: size, max: 1, command: "EyesSize" },
        { label: "EyesMoveX", value: moveX, max: 0.6, command: "EyesMoveX" },
        { label: "EyesMoveY", value: moveY, max: 0.6, command: "EyesMoveY" },
        {
          label: "EyesRotation",
          value: rotation,
          max: 1,
          command: "EyesRotation",
        },
      ].map((slider) => (
        <div key={slider.label} className="slider-container">
          <div className="slider-label-container">
            <span className="slider-label">{slider.label}</span>
            <span className="slider-value">{slider.value.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={slider.max}
            step={0.1}
            value={slider.value}
            className="slider custom-slider"
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (slider.label === "Size") setSize(value);
              else if (slider.label === "EyesMoveX") setMoveX(value);
              else if (slider.label === "EyesMoveY") setMoveY(value);
              else setRotation(value);
              handleSendCommands({ slidertype: `${slider.command}*${value}` });
            }}
          />
        </div>
      ))}
    </div>
  );
};
