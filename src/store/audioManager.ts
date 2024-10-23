import { create } from "zustand";

interface AudioState {
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  initialize: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: false,
  setMuted: (muted) => set({ isMuted: muted }),
  initialize: () => set({ isMuted: false }), // Explicitly set unmuted state on initialization
}));

export class AudioManager {
  private static instance: AudioManager;
  private audioElement: HTMLAudioElement | null = null;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public initializeAudio(audioRef: HTMLAudioElement): void {
    this.audioElement = audioRef;
    this.audioElement.muted = false;

    // Set initial volume
    if (this.audioElement) {
      this.audioElement.volume = 1.0;
    }

    // Initialize the store state
    const { initialize } = useAudioStore.getState();
    initialize();

    // Add autoplay with user interaction handling
    const enableAudio = () => {
      if (this.audioElement) {
        this.audioElement.muted = false;
        this.audioElement.play().catch((error) => {
          console.log("Audio playback failed:", error);
        });
      }
      document.removeEventListener("click", enableAudio);
    };

    document.addEventListener("click", enableAudio);
  }

  public toggleMute(muted: boolean): void {
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }
}

export const audioManager = AudioManager.getInstance();
