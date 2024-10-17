import React, { useState } from "react";

interface SkinSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

interface SliderConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  command: string;
}

const SkinSubMenu: React.FC<SkinSubMenuProps> = ({ handleSendCommands }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>("skin");
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({
    Wrinkles: 0,
    Tan: 1,
    Hue: 1,
    NoseRoughness: 1,
    Saturation: 1,
    Rosacea: 0,
    Birthmark: 0,
    Mole: 0,
    Acne: 0,
    Vitiligo: 0,
    Pimpels: 0,
    Freckles: 0,
  });

  const sliders: SliderConfig[] = [
    {
      label: "Wrinkles",
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0,
      command: "Age",
    },
    {
      label: "Tan",
      min: 0.5,
      max: 1.5,
      step: 0.1,
      defaultValue: 1,
      command: "SkinTan",
    },
    {
      label: "Hue",
      min: 1,
      max: 2,
      step: 0.1,
      defaultValue: 1,
      command: "Hue",
    },
    {
      label: "NoseRoughness",
      min: 0,
      max: 3,
      step: 0.1,
      defaultValue: 1,
      command: "NoseRoughness",
    },
    {
      label: "Saturation",
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 1,
      command: "SkinSaturation",
    },
    {
      label: "Rosacea",
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0,
      command: "M_Switch_Rosacea",
    },
    {
      label: "Birthmark",
      min: 0,
      max: 0.6,
      step: 0.1,
      defaultValue: 0,
      command: "M_Switch_Birthmark",
    },
    {
      label: "Mole",
      min: 0,
      max: 0.7,
      step: 0.1,
      defaultValue: 0,
      command: "M_Switch_Mole",
    },
    {
      label: "Acne",
      min: 0,
      max: 0.5,
      step: 0.1,
      defaultValue: 0,
      command: "M_Switch_Acne",
    },
    {
      label: "Vitiligo",
      min: 0,
      max: 0.5,
      step: 0.1,
      defaultValue: 0,
      command: "M_Switch_Vitiligo",
    },
    {
      label: "Pimpels",
      min: 0,
      max: 0.5,
      step: 0.1,
      defaultValue: 0,
      command: "M_Switch_Pimples",
    },
    {
      label: "Freckles",
      min: 0,
      max: 0.7,
      step: 0.1,
      defaultValue: 0,
      command: "M_Switch_Freckles",
    },
  ];

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  const handleSliderChange = (
    label: string,
    value: number,
    command: string
  ) => {
    setSliderValues((prevValues) => ({
      ...prevValues,
      [label]: value,
    }));

    const commandType = command.startsWith("M_Switch_")
      ? "slidertype"
      : "scalarname";
    handleSendCommands({ [commandType]: `${command}*${value}` });
  };

  const randomizeSliders = () => {
    const newValues: Record<string, number> = {};
    sliders.forEach((slider) => {
      const randomValue =
        Math.random() * (slider.max - slider.min) + slider.min;
      const roundedValue = Math.round(randomValue / slider.step) * slider.step;
      newValues[slider.label] = Number(roundedValue.toFixed(1));
      handleSendCommands({
        [slider.command.startsWith("M_Switch_")
          ? "slidertype"
          : "scalarname"]: `${slider.command}*${roundedValue}`,
      });
    });
    setSliderValues(newValues);
    toggleSubmenu("random");
  };

  return (
    <ul id="skinSubMenu" className="sub-menu">
      <li>
        <button
          className={`transparent-button `}
          onClick={() => toggleSubmenu("skin")}
        >
          Skin
        </button>
        <div className="content-container">
          {sliders.map((slider) => (
            <div key={slider.label} className="slider-container">
              <div className="slider-label-container">
                <span className="slider-label-button">{slider.label}</span>
                <span className="slider-value">
                  {sliderValues[slider.label]}
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={sliderValues[slider.label]}
                className="slider"
                onChange={(e) =>
                  handleSliderChange(
                    slider.label,
                    parseFloat(e.target.value),
                    slider.command
                  )
                }
              />
            </div>
          ))}
        </div>
        <button
          className={`randomize-button ${
            activeSubmenu === "random" ? "selected" : ""
          }`}
          style={{ marginTop: "20px", marginBottom: "50px" }}
          onClick={randomizeSliders}
        >
          Randomize Sliders
        </button>
      </li>
    </ul>
  );
};

export default SkinSubMenu;
