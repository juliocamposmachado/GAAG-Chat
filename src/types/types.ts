// Tipos para WebRTC e mensagens GAAG

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'peer';
  timestamp: number;
  delivered?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: number;
  isOnline: boolean;
}

export interface SavedContact {
  id: string;
  name: string;
  offerCode?: string;
  answerCode?: string;
  myRole: 'initiator' | 'receiver'; // Quem iniciou a conexão
  createdAt: number;
  lastConnected?: number;
}

export interface ConnectionOffer {
  sdp: string;
  type: 'offer' | 'answer';
}

export interface ChatSession {
  contactId: string;
  contactName: string;
  messages: Message[];
  createdAt: number;
}

export type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'failed';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}
