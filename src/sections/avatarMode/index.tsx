"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/navigation";

import { UserContext } from "@/provider/UserContext";
import Stripe from "@/provider/Stripe";
import { audioManager, useAudioStore } from "@/store/audioManager";
import { webRTCManager } from "@/lib/webrtcClient";

import Navbar from "@/components/Navbar";
import VideoComponent from "./components/VideoComponent";
import WatermarkComponent from "./components/WatermarkComponent";
import ChatbotComponent from "./components/ChatbotComponent";
import ArtistModeComponent from "./components/ArtistModeComponent";

const AvatarModeUIView = () => {
  const router = useRouter();

  const { userInfo, isAuthenticated, loading, subscription, logout } =
    useContext(UserContext);
  const { isMuted, setMuted } = useAudioStore();

  const [selectedMode, setSelectedMode] = useState<string>("design");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedVoice, setSelectedVoice] = useState("Female1");
  const [isWebRTCInitialized, setIsWebRTCInitialized] = useState(false);

  const sizeContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (selectedMode === "conversation" || selectedMode === "preview") {
      setMuted(false); // Ensure audio is unmuted by default
    }
  }, [selectedMode, setMuted]);

  useEffect(() => {
    const initWebRTC = async () => {
      if (
        sizeContainerRef.current &&
        videoContainerRef.current &&
        audioRef.current
      ) {
        audioManager.initializeAudio(audioRef.current);
        await webRTCManager.initializeWebRTC(
          sizeContainerRef,
          videoContainerRef,
          audioRef,
          (isLoading: boolean) => {}
        );
        setIsWebRTCInitialized(true);
      }
    };

    initWebRTC();
  }, []);

  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setMuted(newMutedState);
    audioManager.toggleMute(newMutedState);
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
  };

  const handleSelectedVoice = (voice: string) => {
    setSelectedVoice(voice);
  };

  const getTierText = () => {
    const DEV_ACCOUNT_ID = +(process.env.NEXT_PUBLIC_DEV_ACCOUNT_ID ?? 0);

    if (!isAuthenticated || loading) return "Loading...";
    if (userInfo?.id === DEV_ACCOUNT_ID) return "Dev";
    if (
      subscription?.plan_id ===
        Number(process.env.NEXT_PUBLIC_MONTHLY_PREMIUM_SUBSCRIPTION_ID) ||
      subscription?.plan_id ===
        Number(process.env.NEXT_PUBLIC_YEARLY_PREMIUM_SUBSCRIPTION_ID)
    )
      return "Premium";
    return "Free";
  };

  return (
    <>
      <Navbar />
      <div id="sizeContainer" className="relative" ref={sizeContainerRef}>
        <audio ref={audioRef} />
        {(getTierText() === "Free" || getTierText() === "Loading...") && (
          <WatermarkComponent />
        )}
        <VideoComponent
          handleSelectedMenu={setSelectedMode}
          selectedMode={selectedMode}
          videoContainerRef={videoContainerRef}
          audioRef={audioRef}
        />
        {(selectedMode === "conversation" || selectedMode === "preview") && (
          <ChatbotComponent
            selectedMode={selectedMode}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
            onLanguageSelect={handleLanguageSelect}
            selectedLanguage={selectedLanguage}
            onVoiceSelect={handleSelectedVoice}
            selectedVoice={selectedVoice}
          />
        )}
        {selectedMode === "design" && isWebRTCInitialized && (
          <ArtistModeComponent selectedMode={selectedMode} />
        )}
      </div>
    </>
  );
};

const AvatarModeView = () => {
  return (
    <Stripe>
      <AvatarModeUIView />
    </Stripe>
  );
};

export default AvatarModeView;
