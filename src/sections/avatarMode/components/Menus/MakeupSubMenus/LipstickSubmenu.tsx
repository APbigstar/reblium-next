import { useState } from "react";
import Image from "next/image";

interface MakeupSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

interface LipstickOption {
  src: string;
  alt: string;
  command: Record<string, string>;
}

const LipstickSubmenu: React.FC<MakeupSubMenuProps> = ({
  handleSendCommands,
}) => {
  const [strength, setStrength] = useState(1);
  const [glossy, setGlossy] = useState(0.7);
  const [metallic, setMetallic] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);

  const randomizeLipstick = () => {
    const randomIndex = Math.floor(Math.random() * lipstickOptions.length);
    handleSendCommands(lipstickOptions[randomIndex].command);
    setActiveCell(randomIndex);

    // Randomize sliders
    const newStrength = Math.random() * 0.9 + 0.1; // 0.1 to 1
    const newGlossy = Math.random();
    const newMetallic = Math.random();

    setStrength(newStrength);
    setGlossy(newGlossy);
    setMetallic(newMetallic);

    handleSendCommands({ slidertype: `M_Switch_Lipstick*${newStrength}` });
    handleSendCommands({ slidertype: `LipstickRoghness*${newGlossy}` });
    handleSendCommands({ slidertype: `LipstickMetal*${newMetallic}` });

    // Randomize color
    const randomColor =
      lipstickColors[Math.floor(Math.random() * lipstickColors.length)];
    handleSendCommands({ vectorname: `M_LipstickColor*${randomColor.color}` });
  };

  const lipstickOptions: LipstickOption[] = [
    {
      src: "/images/no_go.png",
      alt: "No lipstick",
      command: { assetname: "00_Lipstick" },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_01_Icon.png",
      alt: "Lipstick 01",
      command: { assetname: "Lipstick_01", slidertype: "M_Switch_Lipstick*1" },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_02_Icon.png",
      alt: "Lipstick 02",
      command: { assetname: "lipstick_02", slidertype: "M_Switch_Lipstick*1" },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_Big_Icon.png",
      alt: "Big Lipstick",
      command: { assetname: "lipstick_Big", slidertype: "M_Switch_Lipstick*1" },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_BigBlur_Icon.png",
      alt: "Big Blur Lipstick",
      command: {
        assetname: "lipstick_BigBlur",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_Gradient_Icon.png",
      alt: "Gradient Lipstick",
      command: {
        assetname: "lipstick_Gradient",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_HalfGradient_Icon.png",
      alt: "Half Gradient Lipstick",
      command: {
        assetname: "lipstick_HalfGradient",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_Outline_Icon.png",
      alt: "Outline Lipstick",
      command: {
        assetname: "lipstick_Outline",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/Lipstick_Stylised_01_Icon.png",
      alt: "Stylised Lipstick 01",
      command: {
        assetname: "Lipstick_Stylised_01",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/Lipstick_Stylised_02_Icon.png",
      alt: "Stylised Lipstick 02",
      command: {
        assetname: "Lipstick_Stylised_02",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_Symmetrical_Icon.png",
      alt: "Symmetrical Lipstick",
      command: {
        assetname: "lipstick_Symmetrical",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_UpperLip_Icon.png",
      alt: "Upper Lip Lipstick",
      command: {
        assetname: "lipstick_UpperLip",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_03_Icon.png",
      alt: "Lipstick 03",
      command: { assetname: "lipstick_03", slidertype: "M_Switch_Lipstick*1" },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_04_Icon.png",
      alt: "Lipstick 04",
      command: { assetname: "lipstick_04", slidertype: "M_Switch_Lipstick*1" },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_Butterfly_Icon.png",
      alt: "Butterfly Lipstick",
      command: {
        assetname: "lipstick_Butterfly",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_Drip_Icon.png",
      alt: "Drip Lipstick",
      command: {
        assetname: "lipstick_Drip",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
    {
      src: "/images/MakeUp/Lipstick/lipstick_Smudged_Icon.png",
      alt: "Smudged Lipstick",
      command: {
        assetname: "lipstick_Smudged",
        slidertype: "M_Switch_Lipstick*1",
      },
    },
  ];

  const lipstickColors = [
    { color: "#f91515", name: "Peach" },
    { color: "#d00909", name: "Sunset" },
    { color: "#961010", name: "Red blossom" },
    { color: "#ab0000", name: "Coral Red" },
    { color: "#690000", name: "Purple Orchid" },
    { color: "#bb746b", name: "Spiced Cinnamon" },
    { color: "#974e47", name: "Berry Burst" },
    { color: "#c26d59", name: "Peachy Keen" },
    { color: "#b26458", name: "Fuchsia Fun" },
    { color: "#da8c7f", name: "Brick Red" },
    { color: "#fb6ba3", name: "Lavender Blush" },
    { color: "#32527b", name: "Rich Crimson" },
    { color: "#ac2aa8", name: "Coral Pink" },
    { color: "#2c7083", name: "Vibrant Magenta" },
    { color: "#929a28", name: "Crimson Red" },
  ];

  return (
    <div className="content-container">
      <button onClick={randomizeLipstick} style={{ width: "70%" }}>
        Randomize Lipstick
      </button>
      <div className="image-container">
        <div className="image-row">
          {lipstickOptions.map((option, index) => (
            <div
              key={index}
              className={`image-cell ${activeCell === index ? "active" : ""}`}
              onClick={() => {
                handleSendCommands(option.command);
                setActiveCell(index);
              }}
            >
              <Image src={option.src} alt={option.alt} width={50} height={50} />
            </div>
          ))}
        </div>
      </div>
      <div className="slider-container">
        <div className="slider-label-container">
          <span className="slider-label">Strength</span>
          <span className="slider-value">{strength.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={strength}
          className="slider"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setStrength(value);
            handleSendCommands({ slidertype: `M_Switch_Lipstick*${value}` });
          }}
        />
      </div>
      <div className="slider-container">
        <div className="slider-label-container">
          <span className="slider-label">Glossy</span>
          <span className="slider-value">{glossy.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={glossy}
          className="slider"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setGlossy(value);
            handleSendCommands({ slidertype: `LipstickRoghness*${value}` });
          }}
        />
      </div>
      <div className="slider-container">
        <div className="slider-label-container">
          <span className="slider-label">Metallic</span>
          <span className="slider-value">{metallic.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={metallic}
          className="slider"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setMetallic(value);
            handleSendCommands({ slidertype: `LipstickMetal*${value}` });
          }}
        />
      </div>
      <div className="color-panel">
        <div className="color-row">
          {lipstickColors.map((colorOption, index) => (
            <div
              key={index}
              className="color-cell"
              style={{ backgroundColor: colorOption.color }}
              onClick={() =>
                handleSendCommands({
                  vectorname: `M_LipstickColor*${colorOption.color}`,
                })
              }
              title={colorOption.name}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LipstickSubmenu;
