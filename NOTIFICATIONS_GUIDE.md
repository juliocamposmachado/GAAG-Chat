# Sistema de Notificações - GAAG Chat

## Visão Geral

Sistema completo de notificações com som para o GAAG Chat, que alerta o usuário sobre reconexões, novas mensagens e conexões estabelecidas.

## Funcionalidades Implementadas

### 1. Notificações com Som

**Tipos de Notificações:**

#### Reconexão
- **Quando:** Ao clicar em "Conectar" em um contato salvo
- **Título:** "Reconectado!"
- **Mensagem:** "Você está conectado com [Nome do Contato]"
- **Som:** Dois bipes (800Hz + 1000Hz)

#### Nova Mensagem
- **Quando:** Ao receber mensagem (sempre toca som)
- **Título:** "Nova mensagem de [Nome do Contato]"
- **Mensagem:** Prévia da mensagem (até 50 caracteres)
- **Som:** Dois bipes
- **Notificação Visual:** Apenas se janela não estiver em foco
- **Comportamento:** Som sempre toca, notificação visual apenas em background

#### Mensagem Enviada
- **Quando:** Ao enviar uma mensagem
- **Som:** Dois bipes
- **Notificação Visual:** Não (apenas som)
- **Comportamento:** Feedback sonoro de confirmação de envio

#### Conexão Estabelecida
- **Quando:** Conexão WebRTC é estabelecida com sucesso
- **Título:** "Conexão Estabelecida!"
- **Mensagem:** "Agora você está conectado com [Nome do Contato]"
- **Som:** Dois bipes

### 2. Geração de Som

**Tecnologia:** Web Audio API

**Características do Som:**
- Frequência: 800Hz (primeiro bipe) + 1000Hz (segundo bipe)
- Duração: 0.3 segundos cada
- Intervalo: 150ms entre bipes
- Volume: 0.3 (30%)
- Tipo de onda: Sine (senoidal)
- Envelope: Fade in/out suave

**Código do Som:**
```typescript
// Primeiro bipe: 800Hz
oscillator.frequency.value = 800;
gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);

// Segundo bipe: 1000Hz (após 150ms)
oscillator2.frequency.value = 1000;
```

### 3. Permissões de Notificação

**Solicitação de Permissão:**
- Automática ao reconectar com contato
- Manual via botão no header
- Dialog explicativo com benefícios

**Estados de Permissão:**
- `default`: Não solicitado ainda
- `granted`: Permissão concedida
- `denied`: Permissão negada

**Verificação:**
```typescript
NotificationManager.checkPermission() // boolean
NotificationManager.requestPermission() // Promise<boolean>
```

### 4. Componente de Permissão

**NotificationPermissionPrompt**

**Localização:** Header da página inicial

**Funcionalidades:**
- Botão com ícone de sino (Bell/BellOff)
- Dialog explicativo
- Lista de benefícios
- Botão de teste de notificação
- Estado visual (ativo/inativo)

**Aparência:**
- Ativo: 🔔 "Notificações Ativas"
- Inativo: 🔕 "Ativar Notificações"

## Arquitetura

### NotificationManager (src/lib/notifications.ts)

**Métodos Públicos:**

```typescript
class NotificationManager {
  // Solicitar permissão
  static async requestPermission(): Promise<boolean>
  
  // Verificar permissão
  static checkPermission(): boolean
  
  // Enviar notificação genérica
  static async notify(title: string, options?: NotificationOptions): Promise<void>
  
  // Tocar som
  static playNotificationSound(): void
  
  // Tocar som de mensagem (sem notificação visual)
  static playMessageSound(): void
  
  // Notificações específicas
  static notifyReconnection(contactName: string): void
  static notifyNewMessage(contactName: string, message: string): void
  static notifyConnectionEstablished(contactName: string): void
  
  // Inicializar sistema
  static async initialize(): Promise<void>
}
```

### Integração com Páginas

#### Home.tsx
```typescript
// Inicializar ao carregar
useEffect(() => {
  NotificationManager.initialize();
}, []);

// Notificar ao reconectar
const handleSelectSavedContact = async (contact: SavedContact) => {
  await NotificationManager.requestPermission();
  NotificationManager.notifyReconnection(contact.name);
  // ...
};
```

#### Chat.tsx
```typescript
// Solicitar permissão ao entrar
useEffect(() => {
  NotificationManager.requestPermission();
}, []);

// Notificar conexão estabelecida
useEffect(() => {
  if (connectionState === 'connected') {
    NotificationManager.notifyConnectionEstablished(contactName);
  }
}, [connectionState]);

// Notificar novas mensagens
useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage?.sender === 'peer') {
    // Mensagem recebida - sempre tocar som
    NotificationManager.playMessageSound();
    
    // Notificação visual apenas se janela não estiver em foco
    if (!document.hasFocus()) {
      NotificationManager.notifyNewMessage(contactName, lastMessage.text);
    }
  } else if (lastMessage?.sender === 'me') {
    // Mensagem enviada - tocar som
    NotificationManager.playMessageSound();
  }
}, [messages]);
```

## Comportamento das Notificações

### Auto-fechamento
- Notificações fecham automaticamente após 5 segundos
- Usuário pode fechar manualmente

### Clique na Notificação
- Foca na janela do app
- Fecha a notificação

### Foco da Janela
- Mensagens **sempre** tocam som (enviadas e recebidas)
- Notificações visuais apenas quando janela não está em foco
- Reconexões e conexões sempre notificam (visual + som)

### Ícone
- Usa `/favicon.png` como ícone
- Badge também usa o mesmo ícone

## Compatibilidade

### Navegadores Suportados
- ✅ Chrome/Edge (Desktop + Android)
- ✅ Firefox (Desktop + Android)
- ✅ Safari (Desktop + iOS com limitações)
- ✅ Opera (Desktop + Android)

### Limitações por Plataforma

**iOS/Safari:**
- Notificações funcionam apenas em PWA instalado
- Som pode não funcionar em modo silencioso
- Requer interação do usuário antes de tocar som

**Android:**
- Notificações funcionam em navegador e PWA
- Som funciona normalmente
- Pode ser bloqueado por configurações do sistema

**Desktop:**
- Notificações funcionam em todos os navegadores modernos
- Som funciona sem restrições
- Pode ser bloqueado por configurações do SO

## Testes

### Testar Notificações

1. **Via Interface:**
   - Clique em "Ativar Notificações" no header
   - Clique em "Permitir Notificações"
   - Clique em "Testar Notificação"

2. **Via Console:**
```javascript
// Solicitar permissão
await NotificationManager.requestPermission();

// Testar notificação
NotificationManager.notify('Teste', { body: 'Mensagem de teste' });

// Testar som
NotificationManager.playNotificationSound();
```

3. **Cenários Reais:**
   - Salve um contato
   - Feche o app
   - Reabra e clique em "Conectar"
   - Verifique notificação + som

### Verificar Permissões

**Chrome DevTools:**
1. F12 → Application → Storage → Permissions
2. Verificar status de "notifications"

**Configurações do Navegador:**
- Chrome: chrome://settings/content/notifications
- Firefox: about:preferences#privacy
- Safari: Preferências → Sites → Notificações

## Troubleshooting

### Notificações não aparecem

**Verificar:**
1. Permissão concedida?
   ```javascript
   console.log(Notification.permission); // deve ser 'granted'
   ```

2. Navegador suporta?
   ```javascript
   console.log('Notification' in window); // deve ser true
   ```

3. Configurações do sistema?
   - Windows: Configurações → Sistema → Notificações
   - macOS: Preferências → Notificações
   - Android: Configurações → Apps → Notificações

### Som não toca

**Verificar:**
1. Volume do dispositivo
2. Modo silencioso desativado
3. Autoplay permitido no navegador
4. Console por erros de AudioContext

**Solução:**
```javascript
// Testar AudioContext
const ctx = new AudioContext();
console.log(ctx.state); // deve ser 'running'
```

### Notificações duplicadas

**Causa:** Service Worker pode duplicar notificações

**Solução:** Usar `tag` único
```typescript
NotificationManager.notify('Título', {
  tag: 'unique-id', // Substitui notificação anterior com mesmo tag
  body: 'Mensagem'
});
```

## Boas Práticas

### Quando Notificar
✅ **Sim:**
- Reconexões importantes (visual + som)
- Novas mensagens recebidas (sempre som, visual apenas em background)
- Mensagens enviadas (apenas som, feedback de confirmação)
- Eventos críticos (conexão estabelecida)

❌ **Não:**
- Ações triviais do usuário
- Eventos muito frequentes sem valor
- Quando causaria spam de notificações

### Conteúdo da Notificação
✅ **Bom:**
- Título claro e conciso
- Mensagem informativa
- Ação óbvia ao clicar

❌ **Ruim:**
- Títulos genéricos
- Mensagens longas
- Sem contexto

### Permissões
✅ **Bom:**
- Solicitar no momento certo
- Explicar benefícios
- Permitir recusar

❌ **Ruim:**
- Solicitar imediatamente ao abrir
- Forçar permissão
- Não explicar propósito

## Melhorias Futuras

### Possíveis Adições

1. **Notificações Personalizadas:**
   - Escolher som
   - Ajustar volume
   - Desativar tipos específicos

2. **Notificações Ricas:**
   - Botões de ação
   - Imagens
   - Progresso

3. **Agendamento:**
   - Não perturbar (horários)
   - Prioridades
   - Agrupamento

4. **Estatísticas:**
   - Quantas notificações enviadas
   - Taxa de cliques
   - Preferências do usuário

## Recursos Adicionais

### Documentação
- [MDN - Notifications API](https://developer.mozilla.org/pt-BR/docs/Web/API/Notifications_API)
- [MDN - Web Audio API](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Audio_API)
- [Can I Use - Notifications](https://caniuse.com/notifications)

### Exemplos
- [Notification API Examples](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API)
- [Web Audio Examples](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Simple_synth)
