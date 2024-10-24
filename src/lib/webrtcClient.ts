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
  private connectionEstablished = false;
  private videoLoadedResolver: (() => void) | null = null;
  private connectionResolver: (() => void) | null = null;
  private videoLoadedPromise: Promise<void>;
  private connectionPromise: Promise<void>;
  private lastResponse: string | null = null;
  private latestLoadAvatarCommand: string | null = null;
  private options: WebRTCClientOptions | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private audioRef: HTMLAudioElement | null = null;
  private onVideoReadyCallbacks: (() => void)[] = [];
  private commandQueue: Command[] = [];
  public defaultAvatarPrompt = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private retryTimeout: NodeJS.Timeout | null = null;
  private loadingCallback: ((isLoading: boolean) => void) | null = null;
  private isProcessingAIMessage: boolean = false;

  private constructor() {
    this.resetPromises();
  }

  private resetPromises() {
    this.videoLoadedPromise = new Promise((resolve) => {
      this.videoLoadedResolver = resolve;
    });
    this.connectionPromise = new Promise((resolve) => {
      this.connectionResolver = resolve;
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
        this.connectionEstablished = true;
        this.connectionResolver?.();
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
          if (this.videoElement && this.videoElement.srcObject) {
            const stream = this.videoElement.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            this.videoElement.srcObject = null;
          }

          const client = this.webRTCClient as any;
          if (client.peer) {
            client.peer.close();
          }
          if (client.socket) {
            client.socket.close();
          }

          this.webRTCClient = null;
          this.videoLoaded = false;
          this.connectionEstablished = false;
          this.videoElement = null;
          this.audioRef = null;
          this.options = null;
          this.lastResponse = null;
          this.selectedCommand = null;
          this.latestLoadAvatarCommand = null;
          this.connectionAttempts = 0;
          this.commandQueue = [];
          this.resetPromises();
          this.onVideoReadyCallbacks = [];
        } catch (error) {
          console.error("Error during WebRTC cleanup:", error);
        }
      }

      setTimeout(resolve, 500);
    });
  }

  public onVideoReady(callback: () => void): void {
    if (this.videoLoaded && this.connectionEstablished) {
      callback();
    } else {
      this.onVideoReadyCallbacks.push(callback);
    }
  }

  private handleApplicationResponse(response: string): void {
    if (this.isProcessingAIMessage) {
      return;
    }

    if (response.startsWith("AI message :")) {
      const messageContent = response.replace("AI message :", "").trim();
      const messageStore = useMessageStore.getState();

      if (
        messageStore.isProcessingMessage &&
        messageContent !== messageStore.lastBotMessage &&
        Date.now() - messageStore.messageTimestamp < 5000
      ) {
        // Set flag to true to ignore subsequent messages
        this.isProcessingAIMessage = true;

        messageStore.setLastBotMessage(messageContent);
        messageStore.setIsProcessingMessage(false);

        // Reset the flag after a short delay to prepare for next user message
        setTimeout(() => {
          this.isProcessingAIMessage = false;
        }, 100);
      }
    }
    this.lastResponse = response;
    console.log("Received response:", response);
  }

  private async initConnection(): Promise<void> {
    try {
      await this.waitForConnection();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Additional delay for stability
      await this.processCommandQueue();
    } catch (error) {
      console.error("Error in initConnection:", error);
      throw error;
    }
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

      // Wait for both video and connection
      await Promise.all([this.videoLoadedPromise, this.initConnection()]);

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

  private async processCommandQueue() {
    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (command) {
        try {
          await this.sendCommand(command);
          // Add a small delay between commands
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error("Error processing command from queue:", error);
          // Put the command back in the queue
          this.commandQueue.unshift(command);
          break;
        }
      }
    }
  }

  private async sendCommand(command: Command): Promise<void> {
    if (!this.webRTCClient || !this.connectionEstablished) {
      throw new Error("WebRTC not ready");
    }

    try {
      if ("usermessege" in command) {
        this.isProcessingAIMessage = false;
      }
      if ("resetavatar" in command) {
        this.latestLoadAvatarCommand = command.resetavatar;
      }
      this.selectedCommand = Object.keys(command)[0];
      await this.webRTCClient.emitUIInteraction(command);
      console.log("Command sent successfully:", command);
    } catch (error) {
      console.error("Error sending command:", error);
      throw error;
    }
  }

  public async handleSendCommands(command: Command): Promise<boolean> {
    try {
      // Wait for both video and connection to be ready
      await Promise.all([this.videoLoadedPromise, this.connectionPromise]);

      // Add command to queue
      this.commandQueue.push(command);

      // Process queue
      await this.processCommandQueue();
      return true;
    } catch (error) {
      console.error("Error in handleSendCommands:", error);
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
