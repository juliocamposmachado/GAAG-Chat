# Notificações Mobile - GAAG Chat

## Visão Geral

Sistema de notificações otimizado para dispositivos móveis, garantindo que todas as notificações apareçam mesmo quando o app está aberto.

## Diferenças Mobile vs Desktop

### Desktop (Windows/Mac/Linux)
- **Notificações visuais:** Apenas quando app está em segundo plano
- **Mensagens recebidas:** Som sempre, notificação visual apenas se janela não estiver em foco
- **Mensagens enviadas:** Apenas som, sem notificação visual
- **Razão:** Evitar spam de notificações quando usuário já está vendo a conversa

### Mobile (Android/iOS)
- **Notificações visuais:** **SEMPRE** aparecem, mesmo com app aberto
- **Mensagens recebidas:** Som + notificação visual sempre
- **Mensagens enviadas:** Som + notificação visual de confirmação
- **Razão:** Garantir visibilidade em telas pequenas e multitarefa mobile

## Detecção de Dispositivo Móvel

```typescript
static isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
```

**Dispositivos detectados:**
- Android (todos os navegadores)
- iPhone/iPad/iPod (Safari, Chrome)
- BlackBerry
- Windows Phone (IEMobile)
- Opera Mini

## Comportamento por Plataforma

### Android

#### Chrome/Edge
- ✅ Notificações funcionam em navegador e PWA
- ✅ Som funciona normalmente
- ✅ Notificações aparecem mesmo com app aberto
- ✅ Notificações vão para a central do sistema
- ✅ Clique na notificação abre/foca o app
- ✅ Suporte completo a Service Worker

#### Firefox
- ✅ Notificações funcionam perfeitamente
- ✅ Som funciona normalmente
- ✅ Comportamento idêntico ao Chrome

**Configurações do Sistema:**
- Configurações → Apps → GAAG Chat → Notificações
- Pode ser bloqueado por "Não Perturbe"
- Pode ser bloqueado por "Economia de Bateria"

---

### iOS

#### Safari (PWA Instalado)
- ✅ Notificações funcionam apenas em PWA instalado
- ⚠️ Som pode não funcionar em modo silencioso
- ⚠️ Requer interação do usuário antes de tocar som
- ✅ Notificações aparecem na central de notificações
- ✅ Clique na notificação abre o app

#### Safari (Navegador)
- ❌ Notificações não funcionam no navegador
- ❌ Apenas PWA instalado suporta notificações
- ✅ Som pode funcionar (com limitações)

**Limitações do iOS:**
- Notificações Web só funcionam em PWA instalado (iOS 16.4+)
- Som pode ser bloqueado por modo silencioso
- Requer permissão explícita do usuário
- Notificações não aparecem se app estiver em primeiro plano (limitação do iOS)

**Configurações do Sistema:**
- Ajustes → Notificações → GAAG Chat
- Pode ser bloqueado por "Não Perturbe"
- Pode ser bloqueado por "Foco"

---

## Implementação Técnica

### NotificationManager

```typescript
// Notificar nova mensagem (mobile-aware)
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
```

### Service Worker

```javascript
// Manipular cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Focar ou abrir a janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já existe uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Caso contrário, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
```

---

## Testes em Dispositivos Móveis

### Android

**Teste 1: Notificações com App Aberto**
1. Abra o GAAG Chat no Chrome Android
2. Conecte com outro usuário
3. Receba uma mensagem
4. ✅ Verificar: Som toca + Notificação aparece na tela
5. ✅ Verificar: Notificação também aparece na central

**Teste 2: Notificações com App em Background**
1. Minimize o GAAG Chat
2. Receba uma mensagem
3. ✅ Verificar: Notificação aparece na central
4. ✅ Verificar: Som toca (se não estiver em silencioso)
5. Toque na notificação
6. ✅ Verificar: App abre e foca na conversa

**Teste 3: Mensagem Enviada**
1. Abra o chat
2. Envie uma mensagem
3. ✅ Verificar: Som toca
4. ✅ Verificar: Notificação "Mensagem enviada" aparece

---

### iOS (PWA Instalado)

**Teste 1: Instalação do PWA**
1. Abra o GAAG Chat no Safari
2. Toque em Compartilhar (□↑)
3. "Adicionar à Tela de Início"
4. Abra o app instalado
5. Permita notificações quando solicitado

**Teste 2: Notificações**
1. Conecte com outro usuário
2. Minimize o app
3. Receba uma mensagem
4. ✅ Verificar: Notificação aparece na central
5. ⚠️ Som pode não tocar (modo silencioso)
6. Toque na notificação
7. ✅ Verificar: App abre

**Teste 3: Limitações**
1. Com app aberto em primeiro plano
2. Receba uma mensagem
3. ⚠️ Notificação pode não aparecer (limitação do iOS)
4. ✅ Som deve tocar

---

## Troubleshooting Mobile

### Android: Notificações não aparecem

**Verificar:**
1. Permissão concedida no navegador?
2. Permissão concedida nas configurações do sistema?
3. "Não Perturbe" desativado?
4. "Economia de Bateria" não está bloqueando?

**Solução:**
```
Configurações → Apps → Chrome/Firefox → Notificações → Permitir
Configurações → Notificações → Não Perturbe → Desativar
```

---

### Android: Som não toca

**Verificar:**
1. Volume do dispositivo
2. Modo silencioso desativado
3. Volume de notificações ativo

**Solução:**
```
Configurações → Sons → Volume de Notificações → Aumentar
Desativar modo silencioso/vibração
```

---

### iOS: Notificações não funcionam

**Verificar:**
1. App instalado como PWA?
2. Permissão concedida?
3. iOS 16.4 ou superior?

**Solução:**
```
1. Instalar como PWA (Safari → Compartilhar → Adicionar à Tela de Início)
2. Ajustes → Notificações → GAAG Chat → Permitir
3. Atualizar iOS se necessário
```

---

### iOS: Som não toca

**Verificar:**
1. Modo silencioso desativado?
2. Volume ativo?
3. "Não Perturbe" desativado?

**Solução:**
```
Desativar botão lateral de silencioso
Ajustes → Sons → Volume → Aumentar
Ajustes → Foco → Desativar
```

---

## Boas Práticas Mobile

### Notificações
✅ **Fazer:**
- Sempre mostrar notificações em mobile
- Usar notificações de confirmação para ações importantes
- Incluir prévia da mensagem
- Usar ícone do app

❌ **Evitar:**
- Notificações muito frequentes
- Mensagens muito longas
- Notificações sem contexto

### Som
✅ **Fazer:**
- Som curto e agradável
- Volume moderado (30%)
- Respeitar modo silencioso

❌ **Evitar:**
- Sons muito altos
- Sons muito longos
- Múltiplos sons simultâneos

### Permissões
✅ **Fazer:**
- Solicitar no momento certo
- Explicar benefícios
- Permitir recusar

❌ **Evitar:**
- Solicitar imediatamente
- Forçar permissão
- Não explicar propósito

---

## Estatísticas de Suporte

### Android
- **Chrome:** 100% suporte (versão 42+)
- **Firefox:** 100% suporte (versão 44+)
- **Edge:** 100% suporte (versão 79+)
- **Opera:** 100% suporte (versão 29+)
- **Samsung Internet:** 100% suporte (versão 4+)

### iOS
- **Safari PWA:** Suporte completo (iOS 16.4+)
- **Safari Browser:** Sem suporte a notificações
- **Chrome iOS:** Sem suporte (usa WebKit do Safari)
- **Firefox iOS:** Sem suporte (usa WebKit do Safari)

### Penetração de Mercado
- **Android com suporte:** ~95% dos dispositivos
- **iOS com suporte:** ~80% dos dispositivos (iOS 16.4+)
- **Total:** ~90% dos dispositivos móveis

---

## Recursos Adicionais

### Documentação
- [Notifications API - MDN](https://developer.mozilla.org/pt-BR/docs/Web/API/Notifications_API)
- [Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API - MDN](https://developer.mozilla.org/pt-BR/docs/Web/API/Service_Worker_API)

### Ferramentas de Teste
- [Can I Use - Notifications](https://caniuse.com/notifications)
- [Web.dev - Notifications](https://web.dev/notifications/)
- [PWA Builder](https://www.pwabuilder.com/)

### Guias Relacionados
- [PWA_GUIDE.md](./PWA_GUIDE.md) - Instalação e PWA
- [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md) - Sistema completo
- [NOTIFICATION_FLOW.md](./NOTIFICATION_FLOW.md) - Fluxo de notificações
