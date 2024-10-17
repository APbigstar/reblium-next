import React, { useState, useCallback, useEffect } from "react";
import PopupManager from "./PopupManager";
import {
  FaDoorOpen,
  FaSave,
  FaShare,
  FaTrash,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { PopupType } from "@/types/type";

interface ChatbotProps {
  selectedLanguage: string;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLanguageSelect: (lang: string) => void;
  selectedMode: string;
}

const languageOptions = [
  { lang: "English", code: "en-US", flagClass: "us" },
  { lang: "Dutch", code: "nl-NL", flagClass: "nl" },
  { lang: "French", code: "fr-FR", flagClass: "fr" },
  { lang: "Spanish", code: "es-ES", flagClass: "es" },
  { lang: "German", code: "de-DE", flagClass: "de" },
  { lang: "Japanese", code: "ja-JP", flagClass: "jp" },
  { lang: "Mandarin", code: "cmn-Hans-CN", flagClass: "cn" },
  { lang: "Cantonese", code: "yue-Hant-HK", flagClass: "hk" },
  { lang: "Arabic", code: "ar-XA", flagClass: "sa" },
];

const buttonLabels = [
  "Chat Setting",
  "ChatGPT Key",
  "Voice",
  "Language",
  "Upload Avatar",
  "Personality",
];

const ChatbotComponent: React.FC<ChatbotProps> = ({
  selectedMode,
  selectedLanguage,
  isMuted,
  onMuteToggle,
  onLanguageSelect,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>("");
  const [userInput, setUserInput] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Female1");
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    if (selectedMode === "preview") {
      setShowPopup(false);
    }
  }, [selectedMode]);

  const handleOpenPopup = useCallback((type: PopupType) => {
    setPopupType(type);
    setShowPopup(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setPopupType("");
  }, []);

  const handleConfirm = useCallback(
    (data: any) => {
      console.log("Confirmed data:", data);
      if (
        data.type === "language" &&
        typeof data.selectedLanguage === "string"
      ) {
        onLanguageSelect(data.selectedLanguage);
      } else if (
        data.type === "voice" &&
        typeof data.selectedVoice === "string"
      ) {
        setSelectedVoice(data.selectedVoice);
      }
      handleClosePopup();
    },
    [onLanguageSelect, handleClosePopup]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserInput(e.target.value);
    },
    []
  );

  const handleSendMessage = useCallback(() => {
    if (userInput.trim()) {
      console.log("Sending message:", userInput);
      setUserInput("");
    }
  }, [userInput]);

  const handleCallToggle = () => {
    setIsCallActive((prev) => !prev);
  };

  const renderConversationMode = () => (
    <>
      <div id="buttonsContainer" className="avatar-menu">
        {buttonLabels.map((label) => (
          <button
            key={label}
            className={`transparent-button-active ${
              selectedTab === label ? "active" : ""
            }`}
            onClick={() => {
              setSelectedTab(label);
              handleOpenPopup(
                label.toLowerCase().replace(" ", "-") as PopupType
              );
            }}
          >
            {label}
            {label === "Voice" && (
              <i id="voiceIcon" className="fas fa-venus"></i>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 bottomMenu" id="bottomMenu">
        <button
          className="flex items-center gap-2 menu-button"
          onClick={() => handleOpenPopup("exit")}
        >
          <FaDoorOpen /> <span>Exit</span>
        </button>
        <button
          className="flex items-center gap-2 menu-button"
          onClick={() => handleOpenPopup("share")}
        >
          <FaShare /> <span>Publish</span>
        </button>
        <button
          className="flex items-center gap-2 menu-button"
          onClick={() => handleOpenPopup("save-avatar")}
        >
          <FaSave className="save-ico" /> <span>Save Avatar</span>
        </button>
      </div>
    </>
  );

  const renderPreviewMode = () => {
    console.log(selectedLanguage);
    return (
      <>
        <div id="webcam-container">
          <div className="webcambutton-container">
            <div id="toggle-webcam">Turn on webcam</div>
          </div>
          <div className="webcamVideo-container">
            <video id="webcam"></video>
          </div>
        </div>
        <div
          id="languagesFlags"
          className="grid grid-cols-2 gap-2 rounded-lg absolute top-1/2 -translate-y-1/2 left-10 z-50 p-2.5"
        >
          {languageOptions.map((language) => (
            <div
              key={language.code}
              className={`language-option cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                selectedLanguage === language.lang ? "selected" : ""
              }`}
              onClick={() => onLanguageSelect(language.lang)}
            >
              <span
                className={`flag-icon flag-icon-${language.flagClass} text-2xl mb-1.5`}
              ></span>
              <span className="text-xs text-center text-white">{language.lang}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div id="chatbot" className="block" tabIndex={0}>
      <img
        id="chatbotLogo"
        src="/images/yourlogopng.png"
        className="absolute top-0 left-0 m-16 w-40 h-40"
        alt="Chatbot Logo"
      />

      {selectedMode === "conversation" && renderConversationMode()}
      {selectedMode === "preview" && renderPreviewMode()}

      <div id="chat-container" className="chat-container">
        <div
          id="chat-header"
          className="chat-header pr-4 flex justify-between items-center"
        >
          <div
            id="muteButton"
            className="muteButton cursor-pointer"
            onClick={onMuteToggle}
            title="Toggle Mute"
          >
            {isMuted ? (
              <FaVolumeMute color="#ef4444" />
            ) : (
              <FaVolumeUp color="#ef4444" />
            )}
          </div>
          <div
            id="close-chat"
            className="close-chat flex items-center justify-center gap-3"
          >
            <FaTrash className="cursor-pointer" id="clear-chat-history-icon" />
          </div>
        </div>
        <div
          id="chatbox"
          className="chat-content pr-4 h-[calc(100vh-50vh)] overflow-y-auto"
        >
          <div className="message-container">
            <p className="message-text mb-2">
              Hi there 👋 <br /> How can I help you today?
            </p>
          </div>
        </div>
        <div id="chat-input" className="chat-input">
          <div className="chat-input-container flex items-center">
            <div className="input-wrapper flex-grow mr-2">
              <input
                id="user-input"
                type="text"
                placeholder="Type a message..."
                className="user-input-field w-full"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>
            <div id="send-button" className="send-button cursor-pointer">
              <svg
                id="send_button"
                style={{ color: "white" }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                width="24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </div>
            {!isCallActive ? (
              <div
                id="call-button"
                className="call-button cursor-pointer"
                onClick={handleCallToggle}
              >
                <svg
                  fill="#FFFFFF"
                  height="25px"
                  width="25px"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  enableBackground="new 0 0 512 512"
                >
                  <g>
                    <g>
                      <path d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z" />
                      <path d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z" />
                    </g>
                  </g>
                </svg>
              </div>
            ) : (
              <div
                id="stopcall-button"
                className="stopcall-button cursor-pointer"
                onClick={handleCallToggle}
              >
                <img
                  src="/images/Microphone.gif"
                  alt="Microphone Animation"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {showPopup && selectedMode !== "preview" && (
        <PopupManager
          type={popupType}
          onClose={handleClosePopup}
          onConfirm={handleConfirm}
          selectedLanguage={selectedLanguage}
        />
      )}
    </div>
  );
};

export default ChatbotComponent;
