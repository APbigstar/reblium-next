import React, { useState } from "react";
import Image from "next/image";
import { FaVenus, FaMars } from "react-icons/fa";
import { useSelectedMenuItemStore } from "@/store/selectedMenuItem"; // Import the store

interface WardrobeSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const WardrobeSubMenu: React.FC<WardrobeSubMenuProps> = ({
  handleSendCommands,
}) => {
  const [activeGender, setActiveGender] = useState<"male" | "female">("female");
  const [activeOption, setActiveOption] = useState<number | null>(null);
  const [selectedClothType, setSelectedClothType] = useState<string | null>(
    "full_body"
  );

  const wardrobeOptions = [
    {
      src: "/images/Outfits/Icon_Male_Outfit_06.PNG",
      command: { assetname: "CyberMale" },
      gender: "male",
    },
    {
      src: "/images/Outfits/Icon_Armor.PNG",
      command: { assetname: "M_Armor_01" },
      gender: "male",
    },
    {
      src: "/images/Outfits/SwimwearMale.PNG",
      command: { assetname: "SwimwearMale" },
      gender: "male",
    },
    {
      src: "/images/Outfits/Icon_Businessman01.png",
      command: { assetname: "Businessman01" },
      gender: "male",
    },
    {
      src: "/images/Outfits/Icon_Businessman02.png",
      command: { assetname: "Businessman02" },
      gender: "male",
    },
    {
      src: "/images/Outfits/F_MS_20SS_D004_Icon.PNG",
      command: { assetname: "F_MS_20SS_D004" },
      gender: "female",
    },
    {
      src: "/images/Outfits/Icon_Alice.PNG",
      command: { assetname: "CyberMale" },
      gender: "female",
    },
    // ... add all other wardrobe options
  ];

  const toggleGender = (gender: "male" | "female") => {
    setActiveGender(gender);
    setActiveOption(null);
  };

  const filteredOptions = wardrobeOptions.filter(
    (option) => option.gender === activeGender
  );

  const setWardrobe = useSelectedMenuItemStore((state) => state.setWardrobe); // Get the setWardrobe method

  return (
    <ul id="wardrobeSubMenu" className="sub-menu">
      <li>
        <div className="flex justify-between">
          <button
            className={`flex items-center justify-center gap-2 gender-button ${
              activeGender === "female" ? "selected" : ""
            }`}
            onClick={() => toggleGender("female")}
            style={{ width: "48%" }}
          >
            <FaVenus />
            <span>Female</span>
          </button>
          <button
            className={`flex items-center justify-center gap-2 gender-button ${
              activeGender === "male" ? "selected" : ""
            }`}
            onClick={() => toggleGender("male")}
            style={{ width: "48%" }}
          >
            <FaMars /> <span>Male</span>
          </button>
        </div>

        <button
          className="transparent-button selected"
          onClick={() => setSelectedClothType("full_body")}
        >
          Full body
        </button>
        {selectedClothType === "full_body" && (
          <div
            className="content-container wardrobe-container"
            style={{ display: "block" }}
          >
            <div className="fullbody-container">
              <div className="image-row">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`image-cell ${
                      activeOption === index ? "selected" : ""
                    }`}
                    onClick={() => {
                      handleSendCommands(option.command);
                      setActiveOption(index);
                      setWardrobe(option.command.assetname); // Set selected wardrobe in store
                    }}
                  >
                    <Image
                      src={option.src}
                      alt={`Wardrobe option ${index}`}
                      width={50}
                      height={50}
                    />
                    <p>3</p>
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

export default WardrobeSubMenu;
