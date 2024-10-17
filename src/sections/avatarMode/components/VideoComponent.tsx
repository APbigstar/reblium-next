"use client";

import React, { RefObject } from "react";

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
  return (
    <div id="videoContainer" ref={videoContainerRef}>
      <audio id="audioRef" ref={audioRef}></audio>

      <div className="fixed-container">
        <div
          id="previewButton"
          className={`button ${selectedMode === 'preview' ? 'active' : 'inactive'}`}
          onClick={() => handleSelectedMenu('preview')}
        >
          Preview
        </div>
        <div
          id="conversationButton"
          className={`button ${selectedMode === 'conversation' ? 'active' : 'inactive'}`}
          onClick={() => handleSelectedMenu('conversation')}
        >
          Conversation
        </div>
        <div
          id="designButton"
          className={`button ${selectedMode === 'design' ? 'active' : 'inactive'}`}
          onClick={() => handleSelectedMenu('design')}
        >
          Design
        </div>
      </div>
    </div>
  );
};

export default VideoComponent;