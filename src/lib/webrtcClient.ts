import { WebRTCClient, WebRTCClientProps } from "@arcware/webrtc-plugin";
import { RefObject } from "react";
import { useMessageStore } from "@/store/messageStore";

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
  private onVideoReadyCallbacks: (() => void)[] = [];
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

  public onVideoReady(callback: () => void): void {
    if (this.videoLoaded) {
      callback();
    } else {
      this.onVideoReadyCallbacks.push(callback);
    }
  }

  private handleApplicationResponse(response: string): void {
    if (response.startsWith('AI message :')) {
      const messageContent = response.replace('AI message :', '').trim();
      const messageStore = useMessageStore.getState();
      
      if (
        messageStore.isProcessingMessage && 
        messageContent !== messageStore.lastBotMessage &&
        Date.now() - messageStore.messageTimestamp < 5000
      ) {
        messageStore.setLastBotMessage(messageContent);
        messageStore.setIsProcessingMessage(false);
      }
    }
    this.lastResponse = response;
    console.log("Received response:", response);
  }

  public async initializeWebRTC(
    sizeContainerRef: RefObject<HTMLElement>,
    videoContainerRef: RefObject<HTMLElement>,
    audioRef: RefObject<HTMLAudioElement>,
    setIsLoading: (isLoading: boolean) => void
  ): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("WebRTC can only be initialized in a browser environment");
    }

    this.assertElementsExist(sizeContainerRef, videoContainerRef, audioRef);
    
    this.options = this.createWebRTCOptions(
      sizeContainerRef,
      videoContainerRef,
      audioRef,
      setIsLoading
    );
    this.audioRef = audioRef.current;
    this.webRTCClient = new WebRTCClient(this.options);
    this.setupVideoDetection(videoContainerRef);

    // Wait for video to be ready before resolving initialization
    await this.videoLoadedPromise;
  }

  private assertElementsExist(
    sizeContainerRef: RefObject<HTMLElement>,
    videoContainerRef: RefObject<HTMLElement>,
    audioRef: RefObject<HTMLAudioElement>
  ): void {
    if (!sizeContainerRef.current || !videoContainerRef.current || !audioRef.current) {
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
      shareId: process.env.NEXT_PUBLIC_ARCWARE_SHARE_ID,
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

  private setupVideoDetection(videoContainerRef: RefObject<HTMLElement>): void {
    if (typeof window === "undefined") return;

    const observer = new MutationObserver(() => this.checkForVideo(videoContainerRef));
    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current, { childList: true, subtree: true });
    }
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
        this.handleSendCommands({ cameraswitch: "head" });
        
        // Execute all callbacks waiting for video ready
        this.onVideoReadyCallbacks.forEach(callback => callback());
        this.onVideoReadyCallbacks = []; // Clear the callbacks
      }
    };

    this.videoElement.addEventListener("canplay", handleVideoReady);

    if (this.videoElement.readyState >= 3) {
      handleVideoReady();
    }
  }

  public async loadAndSendAvatarData(jsonFilePath: string): Promise<void> {
    await this.videoLoadedPromise;

    try {
      const response = await fetch(jsonFilePath);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData: PersonaData = await response.json();

      await this.handleSendCommands({ resetavatar: JSON.stringify(jsonData) });

      const personaInfo = jsonData["Personas"];
      if (personaInfo && typeof window !== "undefined") {
        const personaInput = document.getElementById("personaInput") as HTMLInputElement | null;
        if (personaInput) {
          personaInput.value = personaInfo;
        }
      }

      this.defaultAvatarPrompt = true;
    } catch (error) {
      console.error("Error loading JSON:", error);
    }
  }

  public async handleSendCommands(command: Command): Promise<boolean> {
    // Ensure video is loaded before sending any commands
    await this.videoLoadedPromise;
    
    this.selectedCommand = Object.keys(command)[0];
    
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
      (this.webRTCClient as unknown as { socket?: { ready: () => boolean } })
        .socket?.ready()
    );
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
    }
  }
}

export const webRTCManager = WebRTCManager.getInstance();

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
    onVideoReady: (callback: () => void) => webRTCManager.onVideoReady(callback),
  };
}