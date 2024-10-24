"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import Image from "next/image";
import {
  FaLockOpen,
  FaLightbulb,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt,
  FaDoorOpen,
  FaUndo,
  FaSave,
  FaLock,
} from "react-icons/fa";

import { useWebRTCManager } from "@/lib/webrtcClient";
import { useSelectedMenuItemStore } from "@/store/selectedMenuItem";
import { UserContext } from "@/provider/UserContext";
import { PopupType } from "@/types/type";

import PopupManager from "./PopupManager";
import RandomSubMenu from "./Menus/RandomSubMenu";
import SkinSubMenu from "./Menus/SkinSubMenu";
import MakeupSubMenu from "./Menus/MakeupSubMenu";
import FaceSubMenu from "./Menus/FaceSubMenu";
import HairSubMenu from "./Menus/HairSubMenu";
import AccessoriesSubMenu from "./Menus/AccessoriesSubMenu";
import BackgroundSubMenu from "./Menus/BackgroundSubMenu";
import WardrobeSubMenu from "./Menus/WardrobeSubMenu";

import { assetNames, backgroundAssets } from "../Constant";

interface ArtistModeProps {
  selectedMode: string;
  onShowToast?: (type: string, message: string) => void;
}

const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${e.message} (${e.name})`
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
};

const ArtistModeComponent: React.FC<ArtistModeProps> = ({
  selectedMode,
  onShowToast,
}) => {
  const { credits, refetchUserData } = useContext(UserContext);

  const [activeMenu, setActiveMenu] = useState("generator");
  const [isAutoCamera, setIsAutoCamera] = useState(true);
  const [lightValue, setLightValue] = useState(0);
  const [isCollapse, setIsCollapse] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>("");
  const [isAvatarInitialized, setIsAvatarInitialized] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const {
    handleSendCommands,
    handleResetButtonClick,
    isWebRTCConnected,
    onVideoReady,
  } = useWebRTCManager();

  // Access the selected items from the store
  const selectedItems = useSelectedMenuItemStore((state) => state.items);
  const setHair = useSelectedMenuItemStore((state) => state.setHair);
  const setWardrobe = useSelectedMenuItemStore((state) => state.setWardrobe);

  const handleOpenPopup = useCallback((type: PopupType) => {
    setPopupType(type);
    setShowPopup(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setPopupType("");
  }, []);

  const menuItems = [
    { key: "generator", component: RandomSubMenu },
    { key: "skin", component: SkinSubMenu },
    { key: "makeup", component: MakeupSubMenu },
    { key: "face", component: FaceSubMenu },
    { key: "hair", component: HairSubMenu },
    { key: "accessories", component: AccessoriesSubMenu },
    { key: "background", component: BackgroundSubMenu },
    { key: "wardrobe", component: WardrobeSubMenu },
  ];

  const handleShowingCurrentAvatar = useCallback(async () => {
    try {
      const avatarId = localStorage.getItem("avatar_id");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`/api/avatars/getAvatar?id=${avatarId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data, success } = await response.json();

      if (success && data.avatar) {
        await handleSendCommands({ cameraswitch: "head" });
        await new Promise((resolve) => setTimeout(resolve, 500));
        await handleSendCommands({ resetavatar: JSON.stringify(data.avatar) });
        console.log("Avatar data sent successfully");
      }
    } catch (error) {
      console.error("Error showing current avatar:", error);
    }
  }, [handleSendCommands]);

  const handleRandomizeClick = useCallback(async () => {
    if (!isWebRTCConnected()) {
      console.log("WebRTC not connected, waiting...");
      return;
    }

    try {
      // Small delay before sending randomize commands
      await new Promise((resolve) => setTimeout(resolve, 500));

      const gender = {
        Male: true,
        Female: true,
      };
      const ethnicities = {
        "East Asian": false,
        "Latino/ Hispanic": false,
        "South Asian/ Indian": false,
        "Middle Eastern": false,
        "European/ Caucasian": false,
        "Indigenous/ Native American": false,
        "African/ Caribbean": false,
      };
      const groomingOptions = {
        Hairshort: true,
        Tattoo: true,
        Hairmedium: true,
        Beard: true,
        Hairlong: true,
        Mustache: true,
        Haircolor: true,
        Eyescolor: true,
        Scene: false,
        Look: false,
      };
      const randomAge = Math.floor(Math.random() * 100) + 1;

      const randomGender = Object.keys(gender).reduce((acc, key) => {
        acc[key] = Math.random() < 0.5;
        return acc;
      }, {});

      const randomEthnicities = Object.keys(ethnicities).reduce((acc, key) => {
        acc[key] = Math.random() < 0.5;
        return acc;
      }, {});

      const randomGroomingOptions = Object.keys(groomingOptions).reduce(
        (acc, key) => {
          acc[key] = Math.random() < 0.5;
          return acc;
        },
        {}
      );

      const checkboxValues = [
        ...Object.entries(randomGender),
        ...Object.entries(randomEthnicities),
        ...Object.entries(randomGroomingOptions),
      ].map(([name, checked]) => `${name}*${checked ? 1 : 0}`);

      const ageRange = `Agemin*${randomAge}, Agemax*${randomAge}`;
      const result = [...checkboxValues, ageRange].join(", ");

      await handleSendCommands({ cameraswitch: "head" });

      await handleSendCommands({ randomize: result });
      // Small delay between commands
      await new Promise((resolve) => setTimeout(resolve, 300));
      await handleSendCommands({ assetname: "Studio_makeUp" });

      const randomBackgroundIndex = Math.floor(
        Math.random() * backgroundAssets.length
      );
      const selectedBackground = backgroundAssets[randomBackgroundIndex];
      // Small delay before setting background
      await new Promise((resolve) => setTimeout(resolve, 300));
      await handleSendCommands({ assetname: selectedBackground });
    } catch (error) {
      console.error("Error during randomize:", error);
    }
  }, [isWebRTCConnected, handleSendCommands]);

  useEffect(() => {
    let initTimeout: NodeJS.Timeout;

    const initializeAvatar = async () => {
      if (!isAvatarInitialized && isWebRTCConnected()) {
        const createdMode = localStorage.getItem("create_mode");
        onVideoReady(async () => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (createdMode === "set") {
              await handleRandomizeClick();
            } else {
              await handleShowingCurrentAvatar();
            }
            setIsAvatarInitialized(true);
          } catch (error) {
            console.error("Error initializing avatar:", error);
            initTimeout = setTimeout(() => {
              setIsAvatarInitialized(false);
            }, 3000);
          }
        });
      }
    };

    initializeAvatar();

    return () => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, [
    isAvatarInitialized,
    isWebRTCConnected,
    handleRandomizeClick,
    handleShowingCurrentAvatar,
    onVideoReady,
  ]);

  const toggleMenu = (menu: string) => {
    setActiveMenu(menu);
  };

  const toggleAutoCamera = useCallback(async () => {
    setIsAutoCamera((prevState) => !prevState);
    await handleSendCommands({ autocamera: isAutoCamera ? "No" : "Yes" });
    console.log("Auto camera toggled:", !isAutoCamera ? "Unlocked" : "Locked");
  }, [isAutoCamera]);

  const toggleAssetName = async () => {
    let currentAssetIndex = 0;
    currentAssetIndex = (currentAssetIndex + 1) % assetNames.length;
    const newAssetName = assetNames[currentAssetIndex];
    await handleSendCommands({ assetname: newAssetName });
  };

  const handleSaveAvatar = async () => {
    const createMode = localStorage.getItem("create_mode");
    const avatarId = localStorage.getItem("avatar_id");

    if (createMode === "set") {
      handleOpenPopup("save-avatar");
    } else {
      await handleSendCommands({ saveavatar: avatarId });
    }
  };

  const handleCreateAvatar = async (avatarName: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch("/api/avatars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        avatarName: avatarName,
      }),
    });

    const { insertedId, success } = await response.json();

    if (success) {
      await handleSendCommands({ saveavatar: insertedId });
      handleClosePopup();
    }
  };

  const handleAvatarSaveButtonClick = async () => {
    const curCreditAmount = +credits;

    const creditThresholds = {
      both: 5,
      hair: 2,
      wardrobe: 3,
    };

    if (selectedItems.hair || selectedItems.wardrobe) {
      const hasHair = selectedItems.hair;
      const hasWardrobe = selectedItems.wardrobe;

      const thresholdKey =
        hasHair && hasWardrobe ? "both" : hasHair ? "hair" : "wardrobe";

      if (curCreditAmount > creditThresholds[thresholdKey]) {
        handleOpenPopup("pay-credit");
      } else {
        console.log("showing buy credit modal");
        handleOpenPopup("buy-credit");
      }
    } else {
      handleSaveAvatar();
    }
  };

  const handlePayCreditAndSaveAvatar = async (creditAmount: number) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const response = await fetch("/api/credit", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: -creditAmount,
        premium: "",
      }),
    });

    const res = await response.json();

    if (res.success) {
      setShowPopup(false);
      setPopupType("");
      handleClearAndSaveAvatar();
    } else {
      console.error("Failed to update credit amount:", res.error);
    }
  };

  const handleClearAndSaveAvatar = () => {
    refetchUserData();
    handleSaveAvatar();
    setHair("");
    setWardrobe("");
  };

  return (
    <div className="artist_mode" id="artist_mode" tabIndex={0}>
      <div id="buttonsContainer" className="avatar-menu">
        {[
          "Generator",
          "Face",
          "Skin",
          "Makeup",
          "Hair",
          "Wardrobe",
          "Accessories",
          "Background",
        ].map((item) => (
          <button
            key={item}
            className={`transparent-button-active ${
              activeMenu === item.toLowerCase() ? "selected" : ""
            }`}
            onClick={() => toggleMenu(item.toLowerCase())}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="bottomleftmenu">
        <div
          className="flex items-center gap-8 custom-submenu"
          id="customSubmenu"
        >
          {isAutoCamera ? (
            <FaLockOpen
              id="lockIcon"
              onClick={toggleAutoCamera}
              title="Lock Camera"
              style={{ color: "white" }}
            />
          ) : (
            <FaLock
              id="lockIcon"
              onClick={toggleAutoCamera}
              title="Unlock Camera"
              style={{ color: "yellow" }}
            />
          )}
          <FaLightbulb onClick={toggleAssetName} title="Change Light" />
          {isFullscreen ? (
            <FaCompressArrowsAlt
              id="fullScreenIcon"
              onClick={toggleFullscreen}
              title="Exit Full Screen"
            />
          ) : (
            <FaExpandArrowsAlt
              id="fullScreenIcon"
              onClick={toggleFullscreen}
              title="Enter Full Screen"
            />
          )}
        </div>
      </div>

      <div className="lightSlider">
        <FaLightbulb style={{ marginRight: "10px" }} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={lightValue}
          className="slider"
          id="lightSliderInput"
          onChange={async (e) => {
            const value = parseFloat(e.target.value);
            setLightValue(value);
            await handleSendCommands({ slidertype: `LightDirection*${value}` });
          }}
        />
      </div>

      <div className="bottomMenu" id="bottomMenu">
        <div style={{ marginBottom: "10px", marginRight: "10px" }}>
          <button
            className="menu-button flex items-center justify-center gap-2"
            id="randomizeButton"
            style={{ width: "100%" }}
            onClick={handleRandomizeClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.75"
              height="22.75"
              viewBox="0 0 34 31"
              fill="none"
            >
              <path
                d="M4.19238 8.71875C4.19238 6.04371 6.54116 3.875 9.43832 3.875H24.1269C27.0241 3.875 29.3729 6.04371 29.3729 8.71875V22.2812C29.3729 24.9563 27.0241 27.125 24.1269 27.125H9.43832C6.54116 27.125 4.19238 24.9563 4.19238 22.2812V8.71875ZM8.09256 9.78437C7.68688 9.90708 7.68688 10.4367 8.09256 10.5607C9.02704 10.8435 9.76007 11.5204 10.0678 12.3832C10.2007 12.7578 10.7743 12.7578 10.9086 12.3832C11.2163 11.5204 11.948 10.8435 12.8825 10.5607C13.2881 10.438 13.2881 9.90837 12.8825 9.78437C11.948 9.50021 11.2149 8.82337 10.9072 7.96054C10.7743 7.58596 10.2007 7.58596 10.0664 7.96054C9.76007 8.82337 9.02704 9.50021 8.09256 9.78437ZM20.9528 9.14888C20.7947 8.70454 20.1149 8.70454 19.9568 9.14888L19.2167 11.2259C18.853 12.2489 17.9829 13.051 16.875 13.3881L14.6255 14.0714C14.1443 14.2174 14.1443 14.8451 14.6255 14.9911L16.875 15.6744C17.9829 16.0102 18.8516 16.8136 19.2154 17.8366L19.9554 19.9136C20.1135 20.358 20.7933 20.358 20.9514 19.9136L21.6914 17.8366C22.0552 16.8136 22.9253 16.0115 24.0318 15.6744L26.2813 14.9911C26.7625 14.8451 26.7625 14.2174 26.2813 14.0714L24.0318 13.3881C22.9239 13.0523 22.0552 12.2489 21.6914 11.2272L20.9528 9.14888ZM13.0839 17.8676C12.9258 17.4233 12.2459 17.4233 12.0879 17.8676L11.9969 18.1221C11.6332 19.1451 10.7631 19.9472 9.65655 20.2843L9.38097 20.3683C8.89974 20.5142 8.89974 21.142 9.38097 21.288L9.65655 21.3719C10.7645 21.7077 11.6332 22.5112 11.9969 23.5329L12.0879 23.7873C12.2459 24.2317 12.9258 24.2317 13.0839 23.7873L13.1748 23.5329C13.5385 22.5099 14.4087 21.7077 15.5166 21.3719L15.7922 21.288C16.2734 21.142 16.2734 20.5142 15.7922 20.3683L15.5166 20.2843C14.4087 19.9485 13.5399 19.1451 13.1748 18.1221L13.0839 17.8676Z"
                fill="white"
              />
            </svg>
            <span>1 Generate</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 menu-button"
            onClick={() => handleOpenPopup("exit")}
          >
            <FaDoorOpen /> <span>Exit</span>
          </button>
          <button
            className="flex items-center gap-2 menu-button"
            id="reset"
            onClick={handleResetButtonClick}
          >
            <FaUndo className="reset-ico" /> <span>Reset</span>
          </button>
          <button
            className="flex items-center gap-2 menu-button"
            onClick={handleAvatarSaveButtonClick}
          >
            <FaSave /> <span>Save Avatar</span>
          </button>
        </div>
      </div>

      <div id="sideMenu" className={isCollapse ? "collapsed" : "w-[390px]"}>
        <div id="menuBar">
          <div
            id="triangle"
            className="triangle"
            onClick={() => setIsCollapse((prev) => !prev)}
          ></div>
          <div id="menuContent">
            {menuItems
              .filter((menuItem) => menuItem.key === activeMenu)
              .map(({ key, component: Component }) => (
                <Component
                  key={activeMenu}
                  handleSendCommands={handleSendCommands}
                />
              ))}
          </div>
        </div>
      </div>

      {showPopup && selectedMode !== "preview" && (
        <PopupManager
          type={popupType}
          onClose={handleClosePopup}
          onPayCredits={handlePayCreditAndSaveAvatar}
          onCreateAvatar={handleCreateAvatar}
          onSaveAvatar={handleAvatarSaveButtonClick}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};

export default ArtistModeComponent;
