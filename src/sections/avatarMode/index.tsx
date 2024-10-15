"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import VideoComponent from "./components/VideoComponent";
import WatermarkComponent from "./components/WatermarkComponent";
import ChatbotComponent from "./components/ChatbotComponent";

export default function AvatarModeView() {
  const router = useRouter();

  const [selectedMode, setSelectedMode] = useState<string>("design");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isMuted, setMuted] = useState(false);

  const handleMuteToggle = () => {
    setMuted((prev) => !prev);
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return (
    <div id="sizeContainer" className="relative">
      <WatermarkComponent />
      <VideoComponent
        handleSelectedMenu={setSelectedMode}
        selectedMode={selectedMode}
      />
      {(selectedMode === "conversation" || selectedMode === "preview") && (
        <ChatbotComponent
          selectedLanguage={selectedLanguage}
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
          onLanguageSelect={handleLanguageSelect}
          selectedMode={selectedMode}
        />
      )}
    </div>
  );
}
