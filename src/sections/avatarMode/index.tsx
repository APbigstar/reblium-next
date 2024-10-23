"use client";

import { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { UserContext } from "@/provider/UserContext";
import Stripe from "@/provider/Stripe";
import { audioManager, useAudioStore } from "@/store/audioManager";
import { webRTCManager } from "@/lib/webrtcClient";

import Navbar from "@/components/Navbar";
import VideoComponent from "./components/VideoComponent";
import WatermarkComponent from "./components/WatermarkComponent";
import ChatbotComponent from "./components/ChatbotComponent";
import ArtistModeComponent from "./components/ArtistModeComponent";

const LoadingOverlay = () => (
  <div className="loader-overlay">
    <div className="loader">
      <Image
        className="w-full h-full mb-8"
        src="/images/reblium_logo.png"
        alt="logo"
        width={100}
        height={100}
      />
      <p className="text-white">Lining up...</p>
    </div>
  </div>
);

const AvatarModeUIView = () => {
  const router = useRouter();

  const { userInfo, isAuthenticated, loading, subscription, logout } =
    useContext(UserContext);
  const { isMuted, setMuted } = useAudioStore();

  const [selectedMode, setSelectedMode] = useState<string>("design");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedVoice, setSelectedVoice] = useState("Samantha");
  const [isWebRTCInitialized, setIsWebRTCInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sizeContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const initializeWebRTC = async () => {
      try {
        setError(null);
        setIsLoading(true);

        audioManager.initializeAudio(audioRef.current!);
        await webRTCManager.initializeWebRTC(
          sizeContainerRef,
          videoContainerRef,
          audioRef,
          setIsLoading
        );

        setIsWebRTCInitialized(true);
      } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        setError("Failed to connect to avatar service. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeWebRTC();

    return () => {
      webRTCManager.cleanup();
    };
  }, [router]);

  useEffect(() => {
    if (selectedMode === "conversation" || selectedMode === "preview") {
      setMuted(false);
    }
  }, [selectedMode, setMuted]);

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

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    router.refresh();
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
      {isLoading && <LoadingOverlay />}

      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-red-900 p-6 rounded-lg max-w-md text-center">
            <div className="text-white mb-4">{error}</div>
            <button
              onClick={handleRetry}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

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
