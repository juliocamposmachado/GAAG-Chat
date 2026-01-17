// Gerenciador de conexão WebRTC GAAG

import type { ConnectionState } from '@/types';

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onMessageCallback: ((message: string) => void) | null = null;
  private onAudioMessageCallback: ((audioData: string, duration: number) => void) | null = null;
  private onStateChangeCallback: ((state: ConnectionState) => void) | null = null;
  private onTypingCallback: ((isTyping: boolean) => void) | null = null;
  private onCallStateCallback: ((state: 'idle' | 'calling' | 'ringing' | 'active' | 'ended') => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;

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
    console.log('[WebRTC] Inicializando peer connection');
    this.peerConnection = new RTCPeerConnection(this.config);

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('[WebRTC] ICE Connection State:', state);
      
      if (state === 'connected') {
        this.notifyStateChange('connected');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.notifyStateChange('disconnected');
      } else if (state === 'checking' || state === 'new') {
        this.notifyStateChange('connecting');
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[WebRTC] Connection State:', state);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] ICE Candidate:', event.candidate.candidate);
      } else {
        console.log('[WebRTC] ICE Gathering completo');
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      console.log('[WebRTC] Data channel recebido');
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Track recebido:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamCallback?.(this.remoteStream);
      }
    };
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    console.log('[WebRTC] Configurando data channel, estado:', this.dataChannel.readyState);

    this.dataChannel.onopen = () => {
      console.log('[WebRTC] Canal de dados aberto');
      this.notifyStateChange('connected');
    };

    this.dataChannel.onclose = () => {
      console.log('[WebRTC] Canal de dados fechado');
      this.notifyStateChange('disconnected');
    };

    this.dataChannel.onerror = (error) => {
      console.error('[WebRTC] Erro no canal de dados:', error);
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebRTC] Mensagem recebida:', data.type);
        if (data.type === 'message') {
          this.onMessageCallback?.(data.text);
        } else if (data.type === 'audio-message') {
          this.onAudioMessageCallback?.(data.audioData, data.duration);
        } else if (data.type === 'typing') {
          this.onTypingCallback?.(data.isTyping);
        } else if (data.type === 'call-request') {
          this.onCallStateCallback?.('ringing');
        } else if (data.type === 'call-accept') {
          this.onCallStateCallback?.('active');
        } else if (data.type === 'call-reject') {
          this.onCallStateCallback?.('ended');
        } else if (data.type === 'call-end') {
          this.onCallStateCallback?.('ended');
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    };
  }

  async createOffer(): Promise<string> {
    console.log('[WebRTC] Criando oferta');
    if (!this.peerConnection) {
      throw new Error('Conexão peer não inicializada');
    }

    this.dataChannel = this.peerConnection.createDataChannel('chat');
    console.log('[WebRTC] Data channel criado');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    console.log('[WebRTC] Oferta criada:', offer);
    await this.peerConnection.setLocalDescription(offer);

    // Aguardar coleta de candidatos ICE
    await this.waitForIceCandidates();

    console.log('[WebRTC] Oferta completa com ICE candidates');
    return JSON.stringify(this.peerConnection.localDescription);
  }

  async acceptOffer(offerJson: string): Promise<string> {
    console.log('[WebRTC] Aceitando oferta');
    if (!this.peerConnection) {
      throw new Error('Conexão peer não inicializada');
    }

    const offer = JSON.parse(offerJson);
    console.log('[WebRTC] Oferta recebida:', offer);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    console.log('[WebRTC] Resposta criada:', answer);
    await this.peerConnection.setLocalDescription(answer);

    // Aguardar coleta de candidatos ICE
    await this.waitForIceCandidates();

    console.log('[WebRTC] Resposta completa com ICE candidates');
    return JSON.stringify(this.peerConnection.localDescription);
  }

  async acceptAnswer(answerJson: string): Promise<void> {
    console.log('[WebRTC] Aceitando resposta');
    if (!this.peerConnection) {
      throw new Error('Conexão peer não inicializada');
    }

    const answer = JSON.parse(answerJson);
    console.log('[WebRTC] Resposta recebida:', answer);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log('[WebRTC] Remote description definida, aguardando conexão');
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
      console.warn('[WebRTC] Tentativa de enviar mensagem com canal não aberto:', this.dataChannel?.readyState);
      return false;
    }

    try {
      console.log('[WebRTC] Enviando mensagem:', text);
      this.dataChannel.send(JSON.stringify({ type: 'message', text }));
      return true;
    } catch (error) {
      console.error('[WebRTC] Erro ao enviar mensagem:', error);
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

  // Enviar mensagem de áudio
  async sendAudioMessage(audioBlob: Blob, duration: number): Promise<boolean> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('[WebRTC] DataChannel não está aberto para enviar áudio');
      return false;
    }

    try {
      console.log('[WebRTC] Enviando mensagem de áudio, tamanho:', audioBlob.size, 'bytes');
      
      // Converter Blob para base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Enviar mensagem de áudio
      this.dataChannel.send(JSON.stringify({ 
        type: 'audio-message', 
        audioData: base64Audio,
        duration: duration
      }));
      
      return true;
    } catch (error) {
      console.error('[WebRTC] Erro ao enviar mensagem de áudio:', error);
      return false;
    }
  }

  // Converter Blob para base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Falha ao converter blob para base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  onMessage(callback: (message: string) => void): void {
    this.onMessageCallback = callback;
  }

  onAudioMessage(callback: (audioData: string, duration: number) => void): void {
    this.onAudioMessageCallback = callback;
  }

  onStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChangeCallback = callback;
  }

  onTyping(callback: (isTyping: boolean) => void): void {
    this.onTypingCallback = callback;
  }

  private notifyStateChange(state: ConnectionState): void {
    console.log('[WebRTC] Notificando mudança de estado:', state);
    this.onStateChangeCallback?.(state);
  }

  getConnectionState(): ConnectionState {
    if (!this.peerConnection) return 'disconnected';

    const iceState = this.peerConnection.iceConnectionState;
    const channelState = this.dataChannel?.readyState;
    
    console.log('[WebRTC] Estado atual - ICE:', iceState, 'Canal:', channelState);
    
    // Priorizar estado do canal de dados se existir
    if (channelState === 'open') return 'connected';
    if (iceState === 'connected') return 'connected';
    if (iceState === 'checking' || iceState === 'new') return 'connecting';
    if (iceState === 'failed') return 'failed';
    return 'disconnected';
  }

  // Métodos de chamada de voz
  async startVoiceCall(): Promise<void> {
    console.log('[WebRTC] Iniciando chamada de voz');
    try {
      // Solicitar acesso ao microfone
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[WebRTC] Microfone acessado');

      // Adicionar tracks de áudio à conexão
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
          console.log('[WebRTC] Track de áudio adicionado');
        }
      });

      // Enviar sinal de chamada
      this.sendCallSignal('call-request');
      this.onCallStateCallback?.('calling');
    } catch (error) {
      console.error('[WebRTC] Erro ao iniciar chamada:', error);
      throw error;
    }
  }

  acceptVoiceCall(): void {
    console.log('[WebRTC] Aceitando chamada de voz');
    this.sendCallSignal('call-accept');
    this.onCallStateCallback?.('active');
  }

  rejectVoiceCall(): void {
    console.log('[WebRTC] Rejeitando chamada de voz');
    this.sendCallSignal('call-reject');
    this.endVoiceCall();
  }

  endVoiceCall(): void {
    console.log('[WebRTC] Encerrando chamada de voz');
    
    // Enviar sinal de encerramento
    this.sendCallSignal('call-end');
    
    // Parar todos os tracks locais
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('[WebRTC] Track local parado');
      });
      this.localStream = null;
    }

    // Remover tracks da conexão
    if (this.peerConnection) {
      this.peerConnection.getSenders().forEach(sender => {
        if (sender.track) {
          this.peerConnection?.removeTrack(sender);
        }
      });
    }

    this.onCallStateCallback?.('ended');
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('[WebRTC] Microfone:', audioTrack.enabled ? 'ativado' : 'mutado');
      return !audioTrack.enabled; // Retorna true se mutado
    }
    return false;
  }

  isMuted(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    return audioTrack ? !audioTrack.enabled : false;
  }

  private sendCallSignal(type: string): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('[WebRTC] Canal não disponível para enviar sinal de chamada');
      return;
    }

    try {
      this.dataChannel.send(JSON.stringify({ type }));
      console.log('[WebRTC] Sinal de chamada enviado:', type);
    } catch (error) {
      console.error('[WebRTC] Erro ao enviar sinal de chamada:', error);
    }
  }

  onCallState(callback: (state: 'idle' | 'calling' | 'ringing' | 'active' | 'ended') => void): void {
    this.onCallStateCallback = callback;
  }

  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  disconnect(): void {
    console.log('[WebRTC] Desconectando');
    
    // Encerrar chamada se ativa
    if (this.localStream) {
      this.endVoiceCall();
    }
    
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
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
