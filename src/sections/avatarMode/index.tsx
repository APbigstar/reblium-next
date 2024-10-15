"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import VideoComponent from "./components/VideoComponent";
import WatermarkComponent from "./components/WatermarkComponent";

export default function AvatarModeView() {
  const router = useRouter();

  const [selectedMode, setSelectedMode] = useState<string>('design');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return (
    <div id="sizeContainer" className="relative">
      <WatermarkComponent />
      <VideoComponent handleSelectedMenu={setSelectedMode} selectedMode={selectedMode} />
      
    </div>
  );
};
