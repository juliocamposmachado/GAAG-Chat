// Gerenciador de armazenamento local para mensagens e sessões

import type { Message, ChatSession, Contact, SavedContact } from '@/types';

const STORAGE_KEYS = {
  SESSIONS: 'gaag_chat_sessions',
  CONTACTS: 'gaag_contacts',
  SAVED_CONTACTS: 'gaag_saved_contacts',
  CURRENT_SESSION: 'gaag_current_session'
};

export class StorageManager {
  // Sessões de chat
  static saveChatSession(session: ChatSession): void {
    const sessions = this.getAllSessions();
    const existingIndex = sessions.findIndex(s => s.contactId === session.contactId);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  static getChatSession(contactId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.contactId === contactId) || null;
  }

  static getAllSessions(): ChatSession[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  }

  static deleteChatSession(contactId: string): void {
    const sessions = this.getAllSessions();
    const filtered = sessions.filter(s => s.contactId !== contactId);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  }

  static updateSessionName(contactId: string, newName: string): void {
    const session = this.getChatSession(contactId);
    if (session) {
      session.contactName = newName;
      this.saveChatSession(session);
    }
  }

  // Mensagens
  static addMessage(contactId: string, message: Message): void {
    const session = this.getChatSession(contactId);
    
    if (session) {
      session.messages.push(message);
      this.saveChatSession(session);
    }
  }

  static getMessages(contactId: string): Message[] {
    const session = this.getChatSession(contactId);
    return session?.messages || [];
  }

  // Contatos
  static saveContact(contact: Contact): void {
    const contacts = this.getAllContacts();
    const existingIndex = contacts.findIndex(c => c.id === contact.id);
    
    if (existingIndex >= 0) {
      contacts[existingIndex] = contact;
    } else {
      contacts.push(contact);
    }
    
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }

  static getContact(contactId: string): Contact | null {
    const contacts = this.getAllContacts();
    return contacts.find(c => c.id === contactId) || null;
  }

  static getAllContacts(): Contact[] {
    const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return data ? JSON.parse(data) : [];
  }

  static deleteContact(contactId: string): void {
    const contacts = this.getAllContacts();
    const filtered = contacts.filter(c => c.id !== contactId);
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(filtered));
    
    // Também deletar a sessão de chat
    this.deleteChatSession(contactId);
  }

  static updateContactStatus(contactId: string, isOnline: boolean): void {
    const contact = this.getContact(contactId);
    if (contact) {
      contact.isOnline = isOnline;
      this.saveContact(contact);
    }
  }

  // Contatos Salvos (com códigos de conexão)
  static saveSavedContact(contact: SavedContact): void {
    const contacts = this.getAllSavedContacts();
    const existingIndex = contacts.findIndex(c => c.id === contact.id);
    
    if (existingIndex >= 0) {
      contacts[existingIndex] = contact;
    } else {
      contacts.push(contact);
    }
    
    localStorage.setItem(STORAGE_KEYS.SAVED_CONTACTS, JSON.stringify(contacts));
  }

  static getSavedContact(contactId: string): SavedContact | null {
    const contacts = this.getAllSavedContacts();
    return contacts.find(c => c.id === contactId) || null;
  }

  static getAllSavedContacts(): SavedContact[] {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_CONTACTS);
    return data ? JSON.parse(data) : [];
  }

  static deleteSavedContact(contactId: string): void {
    const contacts = this.getAllSavedContacts();
    const filtered = contacts.filter(c => c.id !== contactId);
    localStorage.setItem(STORAGE_KEYS.SAVED_CONTACTS, JSON.stringify(filtered));
  }

  static updateSavedContactName(contactId: string, newName: string): void {
    const contact = this.getSavedContact(contactId);
    if (contact) {
      contact.name = newName;
      this.saveSavedContact(contact);
    }
    
    // Também atualizar o nome na sessão
    this.updateSessionName(contactId, newName);
  }

  static updateSavedContactLastConnected(contactId: string): void {
    const contact = this.getSavedContact(contactId);
    if (contact) {
      contact.lastConnected = Date.now();
      this.saveSavedContact(contact);
    }
  }

  // Sessão atual
  static setCurrentSession(contactId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, contactId);
  }

  static getCurrentSession(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  static clearCurrentSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  // Exportar/Importar dados
  static exportData(): string {
    const data = {
      sessions: this.getAllSessions(),
      contacts: this.getAllContacts(),
      savedContacts: this.getAllSavedContacts(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.sessions && Array.isArray(data.sessions)) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
      }
      
      if (data.contacts && Array.isArray(data.contacts)) {
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(data.contacts));
      }

      if (data.savedContacts && Array.isArray(data.savedContacts)) {
        localStorage.setItem(STORAGE_KEYS.SAVED_CONTACTS, JSON.stringify(data.savedContacts));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.SAVED_CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }
}
