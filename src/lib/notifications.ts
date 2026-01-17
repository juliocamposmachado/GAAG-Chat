// Gerenciador de notificações para GAAG Chat

export class NotificationManager {
  private static hasPermission = false;

  // Detectar se é dispositivo móvel
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Solicitar permissão para notificações
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Notificações] Não suportadas neste navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  // Verificar se tem permissão
  static checkPermission(): boolean {
    if (!('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  // Enviar notificação com som
  static async notify(title: string, options?: NotificationOptions): Promise<void> {
    // Verificar permissão
    if (!this.checkPermission()) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('[Notificações] Permissão negada');
        return;
      }
    }

    // Criar notificação
    try {
      const notification = new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        requireInteraction: false,
        ...options
      });

      // Tocar som
      this.playNotificationSound();

      // Auto-fechar após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Focar na janela quando clicar
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('[Notificações] Erro ao criar notificação:', error);
    }
  }

  // Tocar som de notificação
  static playNotificationSound(): void {
    try {
      // Criar contexto de áudio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Criar oscilador para gerar som
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar som (frequência e volume)
      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';
      
      // Envelope de volume (fade in/out)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

      // Tocar som
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Segundo bipe
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);

        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.3);
      }, 150);

    } catch (error) {
      console.error('[Notificações] Erro ao tocar som:', error);
    }
  }

  // Notificar reconexão
  static notifyReconnection(contactName: string): void {
    this.notify('Reconectado!', {
      body: `Você está conectado com ${contactName}`,
      tag: 'reconnection',
      icon: '/favicon.png'
    });
  }

  // Notificar nova mensagem
  static notifyNewMessage(contactName: string, message: string): void {
    // Em mobile, sempre notificar
    // Em desktop, apenas se janela não estiver em foco
    const shouldNotify = this.isMobile() || !document.hasFocus();
    
    if (!shouldNotify) {
      return;
    }

    this.notify(`Nova mensagem de ${contactName}`, {
      body: message.length > 50 ? message.substring(0, 50) + '...' : message,
      tag: 'new-message',
      icon: '/favicon.png'
    });
  }

  // Tocar som de mensagem (sem notificação visual)
  static playMessageSound(): void {
    this.playNotificationSound();
  }

  // Notificar mensagem enviada (apenas mobile)
  static notifyMessageSent(): void {
    // Apenas em mobile, mostrar notificação de confirmação
    if (this.isMobile()) {
      this.notify('Mensagem enviada', {
        body: 'Sua mensagem foi enviada com sucesso',
        tag: 'message-sent',
        icon: '/favicon.png'
      });
    }
  }

  // Notificar conexão estabelecida
  static notifyConnectionEstablished(contactName: string): void {
    this.notify('Conexão Estabelecida!', {
      body: `Agora você está conectado com ${contactName}`,
      tag: 'connection',
      icon: '/favicon.png'
    });
  }

  // Solicitar permissão ao iniciar o app
  static async initialize(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      // Não solicitar automaticamente, apenas verificar suporte
      console.log('[Notificações] Disponíveis - solicite permissão quando necessário');
    }
  }
}
