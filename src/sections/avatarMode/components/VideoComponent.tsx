"use client";

import React from "react";

interface VideoComponentProps {
  handleSelectedMenu: (mode: string) => void;
  selectedMode: string;
}

const VideoComponent: React.FC<VideoComponentProps> = ({
  handleSelectedMenu,
  selectedMode,
}) => {
  return (
    <div id="videoContainer">
      <audio id="audioRef"></audio>

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
