import { useState, useEffect, useCallback } from 'react';
import { getWebRTCManager, resetWebRTCManager } from '@/lib/webrtc';
import { StorageManager } from '@/lib/storage';
import type { Message, ConnectionState } from '@/types';

export function useWebRTC(contactId?: string) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerTyping, setPeerTyping] = useState(false);

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
    webrtc.onStateChange((state) => {
      setConnectionState(state);
      
      if (contactId) {
        StorageManager.updateContactStatus(contactId, state === 'connected');
      }
    });

    webrtc.onMessage((text) => {
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
    });

    webrtc.onTyping((isTyping) => {
      setPeerTyping(isTyping);
    });

    // Atualizar estado inicial
    setConnectionState(webrtc.getConnectionState());

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
  }, []);

  return {
    connectionState,
    messages,
    peerTyping,
    sendMessage,
    sendTypingIndicator,
    createOffer,
    acceptOffer,
    acceptAnswer,
    disconnect,
    reset,
    isConnected: connectionState === 'connected'
  };
}
