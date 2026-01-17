// Tipos para WebRTC e mensagens Like Look Solutions

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'peer';
  timestamp: number;
  delivered?: boolean;
  type?: 'text' | 'audio' | 'image' | 'video'; // Tipo de mensagem
  audioData?: string; // Base64 encoded audio para mensagens de áudio
  audioDuration?: number; // Duração do áudio em segundos
  mediaData?: string; // Base64 encoded media (imagem ou vídeo)
  mediaType?: string; // MIME type do media (image/jpeg, video/mp4, etc)
  mediaWidth?: number; // Largura original da imagem/vídeo
  mediaHeight?: number; // Altura original da imagem/vídeo
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
