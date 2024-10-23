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
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private retryTimeout: NodeJS.Timeout | null = null;
  private loadingCallback: ((isLoading: boolean) => void) | null = null;

  private constructor() {
    this.resetVideoLoadedPromise();
  }

  private resetVideoLoadedPromise() {
    this.videoLoadedPromise = new Promise((resolve) => {
      this.videoLoadedResolver = resolve;
    });
  }

  public setLoadingCallback(callback: (isLoading: boolean) => void): void {
    this.loadingCallback = callback;
  }

  private updateLoadingState(isLoading: boolean): void {
    if (this.loadingCallback) {
      this.loadingCallback(isLoading);
    }
  }

  private async waitForConnection(maxWaitTime: number = 15000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      if (this.isWebRTCConnected()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error("Connection timeout");
  }

  public static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) {
      WebRTCManager.instance = new WebRTCManager();
    }
    return WebRTCManager.instance;
  }

  public cleanup(): Promise<void> {
    return new Promise((resolve) => {
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }

      if (this.webRTCClient) {
        try {
          // Stop all media tracks
          if (this.videoElement && this.videoElement.srcObject) {
            const stream = this.videoElement.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            this.videoElement.srcObject = null;
          }

          // Close any existing connections
          const client = this.webRTCClient as any;
          if (client.peer) {
            client.peer.close();
          }
          if (client.socket) {
            client.socket.close();
          }

          // Reset all state
          this.webRTCClient = null;
          this.videoLoaded = false;
          this.videoElement = null;
          this.audioRef = null;
          this.options = null;
          this.lastResponse = null;
          this.selectedCommand = null;
          this.latestLoadAvatarCommand = null;
          this.connectionAttempts = 0;
          this.resetVideoLoadedPromise();
          this.onVideoReadyCallbacks = [];
        } catch (error) {
          console.error("Error during WebRTC cleanup:", error);
        }
      }

      setTimeout(resolve, 500);
    });
  }
  public onVideoReady(callback: () => void): void {
    if (this.videoLoaded) {
      callback();
    } else {
      this.onVideoReadyCallbacks.push(callback);
    }
  }

  private handleApplicationResponse(response: string): void {
    if (response.startsWith("AI message :")) {
      const messageContent = response.replace("AI message :", "").trim();
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
    this.setLoadingCallback(setIsLoading);
    this.updateLoadingState(true);

    try {
      // Cleanup existing connection
      await this.cleanup();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.assertElementsExist(sizeContainerRef, videoContainerRef, audioRef);

      this.options = this.createWebRTCOptions(
        sizeContainerRef,
        videoContainerRef,
        audioRef,
        setIsLoading
      );

      this.webRTCClient = new WebRTCClient(this.options);
      this.setupVideoDetection(videoContainerRef);
      await this.waitForConnection(),
      await this.videoLoadedPromise;

      this.updateLoadingState(false);
    } catch (error) {
      console.error("Failed to initialize WebRTC:", error);

      if (this.connectionAttempts < this.maxConnectionAttempts) {
        this.connectionAttempts++;
        this.retryTimeout = setTimeout(() => {
          this.initializeWebRTC(
            sizeContainerRef,
            videoContainerRef,
            audioRef,
            setIsLoading
          );
        }, 2000);
      } else {
        this.updateLoadingState(false);
        throw error;
      }
    }
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

    const observer = new MutationObserver(() =>
      this.checkForVideo(videoContainerRef)
    );
    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current, {
        childList: true,
        subtree: true,
      });
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
        this.onVideoReadyCallbacks.forEach((callback) => callback());
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
      (
        this.webRTCClient as unknown as { socket?: { ready: () => boolean } }
      ).socket?.ready()
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
    onVideoReady: (callback: () => void) =>
      webRTCManager.onVideoReady(callback),
    cleanup: () => webRTCManager.cleanup(),
  };
}
