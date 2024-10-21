import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PopupType } from "@/types/type";

import { useWebRTCManager } from "@/lib/webrtcClient";

interface PopupData {
  type: PopupType;
  apiKey: string;
  selectedLanguage: string;
  selectedVoice: string;
  welcomeMessage: string;
  persona: string;
  uploadedFile: File | null;
  shareLink: string;
  avatarName: string;
}

interface PopupManagerProps {
  type: PopupType;
  onClose: () => void;
  onConfirm?: (data: PopupData) => void;
  selectedLanguage?: string;
}

const PopupManager: React.FC<PopupManagerProps> = ({
  type,
  onClose,
  onConfirm = () => {},
  selectedLanguage = 'en-us',
}) => {
  const router = useRouter();
  
  const {
    loadAndSendAvatarData,
    handleSendCommands,
    handleResetButtonClick,
    isWebRTCConnected,
    getLastResponse,
    getSelectedCommand,
  } = useWebRTCManager();


  const [formData, setFormData] = useState<PopupData>({
    type,
    apiKey: "",
    selectedLanguage: selectedLanguage, // Initialize with the prop
    selectedVoice: "Female1",
    welcomeMessage: "",
    persona: "",
    uploadedFile: null,
    shareLink: "",
    avatarName: "",
  });

  const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "";

  const encryptData = useCallback(
    (avatarId: number, userId: number): string => {
      const data = `${avatarId}|${userId}`;
      let result = "";
      for (let i = 0; i < data.length; i++) {
        const charCode =
          data.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
        result += String.fromCharCode(charCode);
      }
      return btoa(result)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    },
    [ENCRYPTION_KEY]
  );

  useEffect(() => {
    const encrypted = encryptData(1, 1);
    setFormData((prev) => ({
      ...prev,
      shareLink: `${FRONTEND_URL}/sharedAvatar?data=${encrypted}`,
      avatarName: `Avatar_${new Date().getTime()}`, // Default avatar name
    }));
  }, [FRONTEND_URL, encryptData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(formData.shareLink)
      .then(() => {
        console.log("Link copied to clipboard");
        onConfirm({ ...formData, type: "share" });
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Calling Save Avatar Function");
    onConfirm({ ...formData, type: "save-avatar" });

    const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

    const response = await fetch(
      "/api/avatars",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatarName: formData.avatarName
        }),
      }
    );

    const {insertedId, success} = await response.json();
    if (success) {
      handleSendCommands({ saveavatar: insertedId });
    }
  };

  const handleLanguageSelect = (lang: string) => {
    setFormData((prev) => ({ ...prev, selectedLanguage: lang }));
  };

  const handleVoiceSelect = (voice: string) => {
    setFormData((prev) => ({ ...prev, selectedVoice: voice }));
  };

  const handleConfirm = (type: PopupType) => {
    onConfirm({ ...formData, type: type });
  };

  const renderChatSetting = () => (
    <div id="personaPopup" className="personaPopup assitant-popup">
      <form className="personaForm">
        <span id="personaClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3 className="font-bold text-3xl mb-4">Chat Setting</h3>
        <p className="mb-4">
          When creating the avatar, you need to save avatar first before saving
          the welcome message and prompt.
        </p>
        <div className="welcome-section flex flex-col items-start w-full mb-3">
          <label htmlFor="welcomeMessage">Enter your welcome message</label>
          <input
            id="welcomeMessage"
            placeholder="Type your welcome message here"
            value={formData.welcomeMessage}
            onChange={handleInputChange}
          />
        </div>
        <div className="prompt-section flex flex-col items-start w-full">
          <label htmlFor="persona">Enter your prompt</label>
          <textarea
            id="persona"
            placeholder="Type your persona here"
            rows={15}
            cols={80}
            value={formData.persona}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <button type="button" id="personaConfirmButton" onClick={() => handleConfirm('chat-setting')}>
          Save
        </button>
      </form>
    </div>
  );

  const renderChatGPTKey = () => (
    <div id="apiPopup" className="apiPopup assitant-popup">
      <form id="apiKeyForm">
        <span id="apiClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Enter Your ChatGPT Key</h3>
        <br />
        <p>API key save only for this session</p>
        <input
          type="text"
          placeholder="Paste your API key here"
          id="apiKey"
          value={formData.apiKey}
          onChange={handleInputChange}
        />
        <button type="button" id="apiKeyConfirmButton" onClick={() => handleConfirm('chatgpt-key')}>
          Confirm
        </button>
      </form>
    </div>
  );

  const renderVoice = () => (
    <div id="voicePopup" className="voicePopup assitant-popup">
      <form id="voiceForm">
        <span id="voiceClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Choose a Voice</h3>
        <ul id="voiceList">
          {[
            { name: "Samantha", value: "Female1" },
            { name: "Richard", value: "Male1" },
            { name: "Emily", value: "Female2" },
            { name: "John", value: "Male2" },
          ].map((voice) => (
            <div
              key={voice.value}
              className={`voice-option ${
                formData.selectedVoice === voice.value ? "selected" : "bg-gray-800"
              }`}
              onClick={() => handleVoiceSelect(voice.value)}
            >
              {voice.name}
            </div>
          ))}
        </ul>
        <button type="button" onClick={() => handleConfirm('voice')}>
          Confirm
        </button>
      </form>
    </div>
  );

  const renderLanguage = () => (
    <div id="languagePopup" className="languagePopup assitant-popup">
      <form id="languageForm">
        <span id="languageClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Select a Language</h3>
        <ul id="languageList">
          {[
            { lang: "English", code: "en-US" },
            { lang: "Dutch", code: "nl-NL" },
            { lang: "French", code: "fr-FR" },
            { lang: "Spanish", code: "es-ES" },
            { lang: "German", code: "de-DE" },
            { lang: "Japanese", code: "ja-JP" },
            { lang: "Mandarin", code: "cmn-Hans-CN" },
            { lang: "Cantonese", code: "yue-Hant-HK" },
            { lang: "Arabic", code: "ar-XA" },
          ].map((language) => (
            <div
              key={language.code}
              className={`language-option ${
                formData.selectedLanguage === language.lang ? "selected" : "bg-gray-800"
              }`}
              onClick={() => handleLanguageSelect(language.lang)}
            >
              {language.lang}
            </div>
          ))}
        </ul>
        <button type="button" onClick={() => handleConfirm('language')}>
          Confirm
        </button>
      </form>
    </div>
  );

  const renderUploadAvatar = () => (
    <div id="dhsPopup" className="dhs-popup assitant-popup">
      <form id="dhsForm">
        <span id="dhsClose" className="dhs-close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Upload Your DHS File</h3>
        <div
          className="dhs-dropzone"
          id="dhsDropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            setFormData((prev) => ({ ...prev, uploadedFile: file }));
          }}
        >
          Drag and drop your DHS file here
        </div>
        <p
          id="uploadStatus"
          style={{
            display: formData.uploadedFile ? "block" : "none",
            color: "lightgreen",
          }}
        >
          File uploaded successfully!
        </p>
        <button type="button" id="dhsConfirmButton" onClick={() => handleConfirm('upload-avatar')}>
          Upload
        </button>
      </form>
    </div>
  );

  const renderShare = () => (
    <div id="sharePopup" className="sharePopup assitant-popup">
      <form id="shareForm">
        <span id="shareClose" className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>Publish</h3>
        <br />
        <p>
          Publishing your avatar to make it public and share with your friends
        </p>
        <input
          type="text"
          placeholder="Copy this link to share"
          id="shareLink"
          value={formData.shareLink}
          onChange={handleInputChange}
          readOnly
        />
        <button type="button" id="shareConfirmButton" onClick={handleCopyLink}>
          Copy Link
        </button>
      </form>
    </div>
  );

  const renderExit = () => (
    <div id="exitConfirmation" className="modal-exit">
      <div className="modal-content-exit">
        <h3>Are you sure you want to exit?</h3>
        <div className="modal-buttons-exit">
          <button
            id="save-exit"
            className="save-exit"
            onClick={() => router.push("/profile")}
          >
            Yes
          </button>
          <button className="exit" onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </div>
  );

  const renderSaveAvatar = () => (
    <div id="popup" className="popup">
      <form id="avatarForm" onSubmit={handleSaveAvatar}>
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <h3>New Persona</h3>
        <img
          className="avatar-icon"
          src="/images/Default_Avatar_Icon.png"
          alt="Default Avatar"
        />
        <input
          type="text"
          placeholder="Avatar name"
          id="avatarName"
          value={formData.avatarName}
          onChange={handleInputChange}
        />
        <button type="submit" id="confirmButton">
          Confirm
        </button>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case "chat-setting":
        return renderChatSetting();
      case "chatgpt-key":
        return renderChatGPTKey();
      case "voice":
        return renderVoice();
      case "language":
        return renderLanguage();
      case "upload-avatar":
        return renderUploadAvatar();
      case "share":
        return renderShare();
      case "exit":
        return renderExit();
      case "save-avatar":
        return renderSaveAvatar();
      default:
        return null;
    }
  };

  return renderContent();
};

export default PopupManager;
