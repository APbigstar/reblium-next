import { WebRTCClient, WebRTCClientProps } from "@arcware/webrtc-plugin";
import { RefObject } from "react";

import { backgroundAssets } from "@/sections/avatarMode/Constant";

type WebRTCClientOptions = Omit<WebRTCClientProps, "sizeContainer"> & {
  sizeContainer: HTMLElement;
  container: HTMLElement;
  audioRef: HTMLAudioElement;
};

type Command = Record<string, string>;

interface PersonaData {
  Personas?: string;
  [key: string]: string | undefined;
}

class WebRTCManager {
  private static instance: WebRTCManager;
  private webRTCClient: WebRTCClient | null = null;
  private selectedCommand: string | null = null;
  private videoLoaded = false;
  private videoLoadedResolver: (() => void) | null = null;
  private videoLoadedPromise: Promise<void>;
  private lastResponse: string | null = null;
  private latestLoadAvatarCommand: string | null = null;
  private options: WebRTCClientOptions | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private audioRef: HTMLAudioElement | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  public defaultAvatarPrompt = false;

  private constructor() {
    this.videoLoadedPromise = new Promise((resolve) => {
      this.videoLoadedResolver = resolve;
    });
  }

  public static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) {
      WebRTCManager.instance = new WebRTCManager();
    }
    return WebRTCManager.instance;
  }

  public initializeWebRTC(
    sizeContainerRef: RefObject<HTMLElement>,
    videoContainerRef: RefObject<HTMLElement>,
    audioRef: RefObject<HTMLAudioElement>,
    setIsLoading: (isLoading: boolean) => void
  ): void {
    if (typeof window === "undefined") {
      throw new Error(
        "WebRTC can only be initialized in a browser environment"
      );
    }

    this.assertElementsExist(sizeContainerRef, videoContainerRef, audioRef);

    this.options = this.createWebRTCOptions(
      sizeContainerRef,
      videoContainerRef,
      audioRef,
      setIsLoading
    );
    this.webRTCClient = new WebRTCClient(this.options);
    this.audioRef = audioRef.current;
    this.setupVideoDetection(videoContainerRef);
  }

  private assertElementsExist(
    sizeContainerRef: RefObject<HTMLElement>,
    videoContainerRef: RefObject<HTMLElement>,
    audioRef: RefObject<HTMLAudioElement>
  ): void {
    if (
      !sizeContainerRef.current ||
      !videoContainerRef.current ||
      !audioRef.current
    ) {
      throw new Error("Required elements are not available");
    }
  }

  private createWebRTCOptions(
    sizeContainerRef: RefObject<HTMLElement>,
    videoContainerRef: RefObject<HTMLElement>,
    audioRef: RefObject<HTMLAudioElement>,
    setIsLoading: (isLoading: boolean) => void
  ): WebRTCClientOptions {
    return {
      address: "wss://signalling-client.ragnarok.arcware.cloud/",
      shareId: "share-79f09605-3edc-4fa8-b5b9-49a7a3a5f25b",
      packageId: "",
      settings: {},
      playOverlay: false,
      loader: setIsLoading,
      applicationResponse: this.handleApplicationResponse.bind(this),
      sizeContainer: sizeContainerRef.current!,
      container: videoContainerRef.current!,
      audioRef: audioRef.current!,
    };
  }

  private handleApplicationResponse(response: string): void {
    this.lastResponse = response;
    console.log("Received response:", response);
  }

  private setupVideoDetection(videoContainerRef: RefObject<HTMLElement>): void {
    if (typeof window === "undefined") return;

    const observer = new MutationObserver(() =>
      this.checkForVideo(videoContainerRef)
    );
    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // Initial check
    this.checkForVideo(videoContainerRef);
  }

  private checkForVideo(videoContainerRef: RefObject<HTMLElement>): void {
    const videoElement = videoContainerRef.current?.querySelector("video");
    if (videoElement && !this.videoElement) {
      this.videoElement = videoElement;
      this.attachVideoListeners();
    }
  }

  private attachVideoListeners(): void {
    if (!this.videoElement) return;

    const handleVideoReady = (): void => {
      if (!this.videoLoaded) {
        this.videoLoaded = true;
        this.videoLoadedResolver?.();
        console.log("Video is ready to play");
        this.handleSendCommands({ autocamera: "Yes" });
        const randomBackgroundIndex = Math.floor(
          Math.random() * backgroundAssets.length
        );
        const selectedBackground = backgroundAssets[randomBackgroundIndex];
        this.handleSendCommands({ assetname: selectedBackground });
      }
    };

    this.videoElement.addEventListener("canplay", handleVideoReady);

    if (this.videoElement.readyState >= 3) {
      handleVideoReady();
    }
  }

  public async loadAndSendAvatarData(jsonFilePath: string): Promise<void> {
    await this.videoLoadedPromise;
    this.initAudioRefProps();

    try {
      const response = await fetch(jsonFilePath);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData: PersonaData = await response.json();

      await this.handleSendCommands({ resetavatar: JSON.stringify(jsonData) });

      const personaInfo = jsonData["Personas"];

      if (personaInfo && typeof window !== "undefined") {
        const personaInput = document.getElementById(
          "personaInput"
        ) as HTMLInputElement | null;
        if (personaInput) {
          personaInput.value = personaInfo;
        }
      }

      this.defaultAvatarPrompt = true;
    } catch (error) {
      console.error("Error loading JSON:", error);
    }
  }

  private initAudioRefProps(): void {
    if (this.audioRef) {
      this.audioRef.muted = true;
    }
  }

  public async handleSendCommands(command: Command): Promise<boolean> {
    if (!this.isWebRTCConnected()) {
      const reconnected = await this.reconnect();
      if (!reconnected) return false;
    }

    this.selectedCommand = Object.keys(command)[0];
    console.log("Selected command:", this.selectedCommand);

    try {
      this.webRTCClient?.emitUIInteraction(command);
      if ("resetavatar" in command) {
        this.latestLoadAvatarCommand = command.resetavatar;
      }
      console.log("Command sent successfully:", command);
      return true;
    } catch (error) {
      console.error("Error sending command:", error);
      return false;
    }
  }

  public isWebRTCConnected(): boolean {
    return !!(
      this.webRTCClient &&
      (
        this.webRTCClient as unknown as { socket?: { ready: () => boolean } }
      ).socket?.ready()
    );
  }

  private async reconnect(): Promise<boolean> {
    if (!this.options) {
      console.error("WebRTC options not initialized. Cannot reconnect.");
      return false;
    }

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      return false;
    }

    this.reconnectAttempts++;

    try {
      console.log(
        `Attempting to reconnect (Attempt ${this.reconnectAttempts})...`
      );
      this.webRTCClient = new WebRTCClient(this.options);

      await this.waitForConnection();

      console.log("Reconnection successful");
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error("Reconnection failed:", error);
      return false;
    }
  }

  private async waitForConnection(timeout = 10000): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, timeout);

      const checkConnection = setInterval(() => {
        if (this.isWebRTCConnected()) {
          clearInterval(checkConnection);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 500);
    });
  }

  public getLastResponse(): string | null {
    return this.lastResponse;
  }

  public getSelectedCommand(): string | null {
    return this.selectedCommand;
  }

  public handleResetButtonClick(): void {
    if (this.latestLoadAvatarCommand) {
      this.handleSendCommands({ resetavatar: this.latestLoadAvatarCommand });
      console.log(
        "Reset button clicked with the latest loadavatar command:",
        this.latestLoadAvatarCommand
      );
    } else {
      console.log("No loadavatar command available to reset.");
    }
  }
}

export const webRTCManager = WebRTCManager.getInstance();

// Custom hook for easier use in React components
export function useWebRTCManager() {
  return {
    loadAndSendAvatarData: (jsonFilePath: string) =>
      webRTCManager.loadAndSendAvatarData(jsonFilePath),
    handleSendCommands: (command: Command) =>
      webRTCManager.handleSendCommands(command),
    handleResetButtonClick: () => webRTCManager.handleResetButtonClick(),
    isWebRTCConnected: () => webRTCManager.isWebRTCConnected(),
    getLastResponse: () => webRTCManager.getLastResponse(),
    getSelectedCommand: () => webRTCManager.getSelectedCommand(),
    // Add other methods you want to expose to components
  };
}
