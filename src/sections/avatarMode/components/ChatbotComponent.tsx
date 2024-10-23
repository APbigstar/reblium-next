"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  FaDoorOpen,
  FaSave,
  FaShare,
  FaTrash,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { PopupType } from "@/types/type";
import { useWebRTCManager } from "@/lib/webrtcClient";
import { useMessageStore } from "@/store/messageStore";
import { useAudioStore } from "@/store/audioManager";

import PopupManager from "./PopupManager";

import { languageOptions } from "../Constant";

interface ChatbotProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  selectedMode: string;
  onLanguageSelect: (lang: string) => void;
  selectedLanguage: string;
  onVoiceSelect: (lang: string) => void;
  selectedVoice: string;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}


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
  isMuted,
  onMuteToggle,
  selectedLanguage,
  onLanguageSelect,
  selectedVoice,
  onVoiceSelect
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>("");
  const [userInput, setUserInput] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hi there 👋\nHow can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const chatboxRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  const { setMuted } = useAudioStore();

  const {
    loadAndSendAvatarData,
    handleSendCommands,
    handleResetButtonClick,
    isWebRTCConnected,
  } = useWebRTCManager();

  const {
    lastBotMessage,
    setLastBotMessage,
    isProcessingMessage,
    setIsProcessingMessage,
    setMessageTimestamp,
  } = useMessageStore();

  const renderMuteButton = () => (
    <div
      id="muteButton"
      className="muteButton cursor-pointer"
      onClick={onMuteToggle}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <FaVolumeMute color="#ef4444" className="text-red-500" />
      ) : (
        <FaVolumeUp color="#ef4444" className="text-red-500" />
      )}
    </div>
  );

  useEffect(() => {
    if (selectedMode === "conversation" || selectedMode === "preview") {
      setMuted(false);
    }
  }, [selectedMode, setMuted]);

  useEffect(() => {
    if (lastBotMessage && !isProcessingMessage) {
      setMessages((prev) => [
        ...prev,
        {
          text: lastBotMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      setLastBotMessage(null);

      if (chatboxRef.current) {
        chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
      }
    }
  }, [lastBotMessage, isProcessingMessage, setLastBotMessage]);

  // Reset processing state timeout
  useEffect(() => {
    if (isProcessingMessage) {
      const timeout = setTimeout(() => {
        setIsProcessingMessage(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isProcessingMessage, setIsProcessingMessage]);

  // Initialize speech recognition
  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = selectedLanguage;

      recognition.current.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        handleUserMessage(speechText);
      };

      recognition.current.onend = () => {
        setIsCallActive(false);
      };

      recognition.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsCallActive(false);
      };
    }
  }, [selectedLanguage]);

  const handleUserMessage = useCallback(
    (message: string) => {
      console.log("Sending user message:", message);

      setMessages((prev) => [
        ...prev,
        {
          text: message,
          isUser: true,
          timestamp: new Date(),
        },
      ]);

      setIsProcessingMessage(true);
      setMessageTimestamp(Date.now());

      handleSendCommands({ usermessege: message });

      if (chatboxRef.current) {
        chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
      }
    },
    [handleSendCommands, setIsProcessingMessage, setMessageTimestamp]
  );

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
      if (
        data.type === "language" &&
        typeof data.selectedLanguage === "string"
      ) {
        onLanguageSelect(data.selectedLanguage);
      } else if (
        data.type === "voice" &&
        typeof data.selectedVoice === "string"
      ) {
        onVoiceSelect(data.selectedVoice);
      }
      handleClosePopup();
    },
    [onLanguageSelect]
  );

  const handleSendMessage = useCallback(() => {
    if (userInput.trim()) {
      handleUserMessage(userInput.trim());
      setUserInput("");
    }
  }, [userInput, handleUserMessage]);

  const handleCallToggle = useCallback(() => {
    if (!recognition.current) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome."
      );
      return;
    }

    if (isCallActive) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
    setIsCallActive((prev) => !prev);
  }, [isCallActive]);

  const handleClearChat = useCallback(() => {
    setMessages([
      {
        text: "Hi there 👋\nHow can I help you today?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (selectedMode === "preview") {
      setShowPopup(false);
    }
  }, [selectedMode]);

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

  const renderPreviewMode = () => (
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
              selectedLanguage === language.code ? "selected" : ""
            }`}
            onClick={() => onLanguageSelect(language.code)}
          >
            <span
              className={`flag-icon flag-icon-${language.flagClass} text-2xl mb-1.5`}
            ></span>
            <span className="text-xs text-center text-white">
              {language.lang}
            </span>
          </div>
        ))}
      </div>
    </>
  );

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
          {renderMuteButton()}

          <div
            id="close-chat"
            className="close-chat flex items-center justify-center gap-3"
          >
            <FaTrash
              className="cursor-pointer"
              id="clear-chat-history-icon"
              onClick={handleClearChat}
            />
          </div>
        </div>

        <div
          ref={chatboxRef}
          id="chatbox"
          className="chat-content pr-4 h-[calc(100vh-50vh)] overflow-y-auto"
        >
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.timestamp.getTime()}`}
              className={`message-container ${
                message.isUser ? "text-right" : ""
              } mb-2`}
            >
              <p
                className={`message-text inline-block p-2 rounded-lg ${
                  message.isUser
                    ? "bg-[#00cdff] text-white"
                    : "bg-[rgba(0,0,0,0.2)] text-white"
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
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
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>
            <div
              id="send-button"
              className="send-button cursor-pointer"
              onClick={handleSendMessage}
            >
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
                    <path d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z" />
                    <path d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z" />
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
          onLanguageSelect={onLanguageSelect}
          selectedLanguage={selectedLanguage}
          onVoiceSelect={onVoiceSelect}
          selectedVoice={selectedVoice}
          recognition={recognition}
        />
      )}
    </div>
  );
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default ChatbotComponent;
