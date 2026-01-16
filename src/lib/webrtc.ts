// Gerenciador de conexão WebRTC P2P

import type { ConnectionState } from '@/types';

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onMessageCallback: ((message: string) => void) | null = null;
  private onStateChangeCallback: ((state: ConnectionState) => void) | null = null;
  private onTypingCallback: ((isTyping: boolean) => void) | null = null;

  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor() {
    this.initializePeerConnection();
  }

  private initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.config);

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      if (state === 'connected') {
        this.notifyStateChange('connected');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.notifyStateChange('disconnected');
      } else if (state === 'checking' || state === 'new') {
        this.notifyStateChange('connecting');
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Canal de dados aberto');
      this.notifyStateChange('connected');
    };

    this.dataChannel.onclose = () => {
      console.log('Canal de dados fechado');
      this.notifyStateChange('disconnected');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          this.onMessageCallback?.(data.text);
        } else if (data.type === 'typing') {
          this.onTypingCallback?.(data.isTyping);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    };
  }

  async createOffer(): Promise<string> {
    if (!this.peerConnection) {
      throw new Error('Conexão peer não inicializada');
    }

    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Aguardar coleta de candidatos ICE
    await this.waitForIceCandidates();

    return JSON.stringify(this.peerConnection.localDescription);
  }

  async acceptOffer(offerJson: string): Promise<string> {
    if (!this.peerConnection) {
      throw new Error('Conexão peer não inicializada');
    }

    const offer = JSON.parse(offerJson);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    // Aguardar coleta de candidatos ICE
    await this.waitForIceCandidates();

    return JSON.stringify(this.peerConnection.localDescription);
  }

  async acceptAnswer(answerJson: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Conexão peer não inicializada');
    }

    const answer = JSON.parse(answerJson);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private waitForIceCandidates(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.peerConnection) {
        resolve();
        return;
      }

      if (this.peerConnection.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const checkState = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          this.peerConnection.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      this.peerConnection.addEventListener('icegatheringstatechange', checkState);

      // Timeout de segurança
      setTimeout(() => {
        this.peerConnection?.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 5000);
    });
  }

  sendMessage(text: string): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }

    try {
      this.dataChannel.send(JSON.stringify({ type: 'message', text }));
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  sendTypingIndicator(isTyping: boolean): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return;
    }

    try {
      this.dataChannel.send(JSON.stringify({ type: 'typing', isTyping }));
    } catch (error) {
      console.error('Erro ao enviar indicador de digitação:', error);
    }
  }

  onMessage(callback: (message: string) => void): void {
    this.onMessageCallback = callback;
  }

  onStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChangeCallback = callback;
  }

  onTyping(callback: (isTyping: boolean) => void): void {
    this.onTypingCallback = callback;
  }

  private notifyStateChange(state: ConnectionState): void {
    this.onStateChangeCallback?.(state);
  }

  getConnectionState(): ConnectionState {
    if (!this.peerConnection) return 'disconnected';

    const state = this.peerConnection.iceConnectionState;
    if (state === 'connected') return 'connected';
    if (state === 'checking' || state === 'new') return 'connecting';
    if (state === 'failed') return 'failed';
    return 'disconnected';
  }

  disconnect(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.notifyStateChange('disconnected');
  }

  isConnected(): boolean {
    return this.dataChannel?.readyState === 'open';
  }
}

// Instância singleton
let webrtcInstance: WebRTCManager | null = null;

export function getWebRTCManager(): WebRTCManager {
  if (!webrtcInstance) {
    webrtcInstance = new WebRTCManager();
  }
  return webrtcInstance;
}

export function resetWebRTCManager(): void {
  if (webrtcInstance) {
    webrtcInstance.disconnect();
    webrtcInstance = null;
  }
}
