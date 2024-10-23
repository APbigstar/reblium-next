"use client";

import React, { RefObject, useEffect } from "react";

interface VideoComponentProps {
  handleSelectedMenu: (mode: string) => void;
  selectedMode: string;
  videoContainerRef: RefObject<HTMLDivElement>;
  audioRef: RefObject<HTMLAudioElement>;
}

const VideoComponent: React.FC<VideoComponentProps> = ({
  handleSelectedMenu,
  selectedMode,
  videoContainerRef,
  audioRef,
}) => {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const videos =
            videoContainerRef.current?.getElementsByTagName("video");
          if (videos && videos.length > 1) {
            // Keep only the most recently added video
            Array.from(videos)
              .slice(0, -1)
              .forEach((video) => {
                video.pause();
                video.srcObject = null;
                video.remove();
              });
          }
        }
      });
    });

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [videoContainerRef]);

  const handleModeSelect = (mode: string) => {
    // Clean up any existing duplicate videos before mode change
    const videos = videoContainerRef.current?.getElementsByTagName("video");
    if (videos && videos.length > 1) {
      Array.from(videos)
        .slice(0, -1)
        .forEach((video) => {
          video.pause();
          video.srcObject = null;
          video.remove();
        });
    }
    handleSelectedMenu(mode);
  };

  return (
    <div id="videoContainer" ref={videoContainerRef}>
      <audio id="audioRef" ref={audioRef}></audio>

      <div className="fixed-container">
        <div
          id="previewButton"
          className={`button ${
            selectedMode === "preview" ? "active" : "inactive"
          }`}
          onClick={() => handleModeSelect("preview")}
        >
          Preview
        </div>
        <div
          id="conversationButton"
          className={`button ${
            selectedMode === "conversation" ? "active" : "inactive"
          }`}
          onClick={() => handleModeSelect("conversation")}
        >
          Conversation
        </div>
        <div
          id="designButton"
          className={`button ${
            selectedMode === "design" ? "active" : "inactive"
          }`}
          onClick={() => handleModeSelect("design")}
        >
          Design
        </div>
      </div>
    </div>
  );
};

export default VideoComponent;
