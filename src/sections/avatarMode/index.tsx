"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import VideoComponent from "./components/VideoComponent";
import WatermarkComponent from "./components/WatermarkComponent";
import ChatbotComponent from "./components/ChatbotComponent";
import ArtistModeComponent from "./components/ArtistModeComponent";
import { webRTCManager } from "@/lib/webrtcClient";
import Navbar from "@/components/Navbar";

export default function AvatarModeView() {
  const router = useRouter();

  const [selectedMode, setSelectedMode] = useState<string>("design");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isMuted, setMuted] = useState(false);
  const [isWebRTCInitialized, setIsWebRTCInitialized] = useState(false);

  const sizeContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  useEffect(() => {
    const initWebRTC = async () => {
      if (
        sizeContainerRef.current &&
        videoContainerRef.current &&
        audioRef.current
      ) {
        await webRTCManager.initializeWebRTC(
          sizeContainerRef,
          videoContainerRef,
          audioRef,
          (isLoading: boolean) => {
            // You can use this callback to update a loading state if needed
          }
        );
        setIsWebRTCInitialized(true);
      }
    };

    initWebRTC();
  }, []);

  return (
    <>
      <Navbar />
      <div id="sizeContainer" className="relative" ref={sizeContainerRef}>
        <WatermarkComponent />
        <VideoComponent
          handleSelectedMenu={setSelectedMode}
          selectedMode={selectedMode}
          videoContainerRef={videoContainerRef}
          audioRef={audioRef}
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
        {selectedMode === "design" && isWebRTCInitialized && (
          <ArtistModeComponent />
        )}
      </div>
    </>
  );
}
