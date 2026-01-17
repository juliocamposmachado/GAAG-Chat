import { useState, useEffect, useCallback } from 'react';
import { getWebRTCManager, resetWebRTCManager } from '@/lib/webrtc';
import { StorageManager } from '@/lib/storage';
import type { Message, ConnectionState } from '@/types';

export function useWebRTC(contactId?: string) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerTyping, setPeerTyping] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'ringing' | 'active' | 'ended'>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const webrtc = getWebRTCManager();

  // Carregar mensagens do localStorage
  useEffect(() => {
    if (contactId) {
      const savedMessages = StorageManager.getMessages(contactId);
      setMessages(savedMessages);
    }
  }, [contactId]);

  // Configurar callbacks do WebRTC
  useEffect(() => {
    const handleStateChange = (state: ConnectionState) => {
      console.log('WebRTC State Changed:', state);
      setConnectionState(state);
      
      if (contactId) {
        StorageManager.updateContactStatus(contactId, state === 'connected');
      }
    };

    const handleMessage = (text: string) => {
      console.log('Message received:', text);
      if (!contactId) return;

      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        sender: 'peer',
        timestamp: Date.now(),
        delivered: true
      };

      setMessages((prev) => [...prev, newMessage]);
      StorageManager.addMessage(contactId, newMessage);
    };

    const handleTyping = (isTyping: boolean) => {
      setPeerTyping(isTyping);
    };

    const handleAudioMessage = (audioData: string, duration: number) => {
      if (!contactId) return;

      const newMessage: Message = {
        id: Date.now().toString(),
        text: '[Mensagem de áudio]',
        sender: 'peer',
        timestamp: Date.now(),
        delivered: true,
        type: 'audio',
        audioData,
        audioDuration: duration
      };

      setMessages((prev) => [...prev, newMessage]);
      StorageManager.addMessage(contactId, newMessage);
    };

    const handleCallState = (state: 'idle' | 'calling' | 'ringing' | 'active' | 'ended') => {
      console.log('Call State Changed:', state);
      setCallState(state);
    };

    const handleRemoteStream = (stream: MediaStream) => {
      console.log('Remote Stream Received');
      setRemoteStream(stream);
    };

    webrtc.onStateChange(handleStateChange);
    webrtc.onMessage(handleMessage);
    webrtc.onAudioMessage(handleAudioMessage);
    webrtc.onTyping(handleTyping);
    webrtc.onCallState(handleCallState);
    webrtc.onRemoteStream(handleRemoteStream);

    // Atualizar estado inicial
    const currentState = webrtc.getConnectionState();
    console.log('Initial WebRTC State:', currentState);
    setConnectionState(currentState);

    return () => {
      // Cleanup não desconecta, apenas remove callbacks
    };
  }, [contactId]);

  const sendMessage = useCallback((text: string) => {
    if (!contactId) return;

    const success = webrtc.sendMessage(text);
    
    if (success) {
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        sender: 'me',
        timestamp: Date.now(),
        delivered: true
      };

      setMessages((prev) => [...prev, newMessage]);
      StorageManager.addMessage(contactId, newMessage);
    }
  }, [contactId]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    webrtc.sendTypingIndicator(isTyping);
  }, []);

  const sendAudioMessage = useCallback(async (audioBlob: Blob, duration: number) => {
    if (!contactId) return;

    const success = await webrtc.sendAudioMessage(audioBlob, duration);
    
    if (success) {
      // Converter blob para base64 para salvar localmente
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        
        const newMessage: Message = {
          id: `${Date.now()}-${Math.random()}`,
          text: '[Mensagem de áudio]',
          sender: 'me',
          timestamp: Date.now(),
          delivered: true,
          type: 'audio',
          audioData: base64Audio,
          audioDuration: duration
        };

        setMessages((prev) => [...prev, newMessage]);
        StorageManager.addMessage(contactId, newMessage);
      };
      reader.readAsDataURL(audioBlob);
    }
  }, [contactId]);

  const createOffer = useCallback(async () => {
    try {
      const offer = await webrtc.createOffer();
      return offer;
    } catch (error) {
      console.error('Erro ao criar oferta:', error);
      throw error;
    }
  }, []);

  const acceptOffer = useCallback(async (offerJson: string) => {
    try {
      const answer = await webrtc.acceptOffer(offerJson);
      return answer;
    } catch (error) {
      console.error('Erro ao aceitar oferta:', error);
      throw error;
    }
  }, []);

  const acceptAnswer = useCallback(async (answerJson: string) => {
    try {
      await webrtc.acceptAnswer(answerJson);
    } catch (error) {
      console.error('Erro ao aceitar resposta:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    webrtc.disconnect();
    setConnectionState('disconnected');
  }, []);

  const reset = useCallback(() => {
    resetWebRTCManager();
    setConnectionState('disconnected');
    setMessages([]);
    setPeerTyping(false);
    setCallState('idle');
    setRemoteStream(null);
  }, []);

  const startVoiceCall = useCallback(async () => {
    try {
      await webrtc.startVoiceCall();
    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      throw error;
    }
  }, []);

  const acceptVoiceCall = useCallback(() => {
    webrtc.acceptVoiceCall();
  }, []);

  const rejectVoiceCall = useCallback(() => {
    webrtc.rejectVoiceCall();
    setCallState('idle');
  }, []);

  const endVoiceCall = useCallback(() => {
    webrtc.endVoiceCall();
    setCallState('idle');
    setRemoteStream(null);
  }, []);

  const toggleMute = useCallback(() => {
    return webrtc.toggleMute();
  }, []);

  return {
    connectionState,
    messages,
    peerTyping,
    callState,
    remoteStream,
    sendMessage,
    sendAudioMessage,
    sendTypingIndicator,
    createOffer,
    acceptOffer,
    acceptAnswer,
    disconnect,
    reset,
    startVoiceCall,
    acceptVoiceCall,
    rejectVoiceCall,
    endVoiceCall,
    toggleMute,
    isConnected: connectionState === 'connected'
  };
}
