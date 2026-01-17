# Implementação de Chamadas de Voz - GAAG Chat

## Resumo

Implementado sistema completo de chamadas de voz P2P usando WebRTC. As chamadas são criptografadas ponta-a-ponta, não passam por servidor e incluem controles de microfone, notificações e interface intuitiva.

## Arquivos Modificados

### 1. WebRTC Manager (src/lib/webrtc.ts)

**Adicionado:**
- `localStream` e `remoteStream` para gerenciar streams de áudio
- `onCallStateCallback` e `onRemoteStreamCallback` para eventos
- Handler `ontrack` para receber áudio remoto
- Suporte a sinais de chamada no DataChannel (call-request, call-accept, call-reject, call-end)

**Métodos novos:**
- `startVoiceCall()`: Solicita microfone e adiciona tracks de áudio
- `acceptVoiceCall()`: Aceita chamada recebida
- `rejectVoiceCall()`: Rejeita chamada recebida
- `endVoiceCall()`: Encerra chamada ativa
- `toggleMute()`: Muta/desmuta microfone
- `isMuted()`: Verifica se está mutado
- `sendCallSignal()`: Envia sinais de chamada via DataChannel
- `onCallState()`: Callback para mudanças de estado
- `onRemoteStream()`: Callback para stream remoto
- `getLocalStream()` e `getRemoteStream()`: Getters para streams

---

### 2. useWebRTC Hook (src/hooks/use-webrtc.ts)

**Adicionado:**
- Estados: `callState` e `remoteStream`
- Callbacks: `handleCallState` e `handleRemoteStream`
- Métodos expostos: `startVoiceCall`, `acceptVoiceCall`, `rejectVoiceCall`, `endVoiceCall`, `toggleMute`

**Retorno atualizado:**
```typescript
return {
  // ... estados existentes
  callState,
  remoteStream,
  // ... métodos existentes
  startVoiceCall,
  acceptVoiceCall,
  rejectVoiceCall,
  endVoiceCall,
  toggleMute
};
```

---

### 3. Notification Manager (src/lib/notifications.ts)

**Adicionado:**
- `notifyIncomingCall()`: Notificação de chamada recebida
- `playCallRingtone()`: Som de toque de chamada (800Hz, 5 toques)

**Características do ringtone:**
- Frequência: 800 Hz
- Duração: 0.5s por toque
- Intervalo: 1s entre toques
- Máximo: 5 toques

---

### 4. IncomingCallDialog Component (src/components/voice/)

**Novo componente:**
- Dialog para chamadas recebidas
- Animação de pulsação no ícone de telefone
- Botões: Atender (verde) / Recusar (vermelho)
- Props: `open`, `contactName`, `onAccept`, `onReject`

**UI:**
```
┌─────────────────────────┐
│   Chamada de Voz        │
│                         │
│      [📞 pulsando]      │
│                         │
│   [Nome do Contato]     │
│   está chamando...      │
│                         │
│  [Recusar]  [Atender]   │
└─────────────────────────┘
```

---

### 5. ActiveCallInterface Component (src/components/voice/)

**Novo componente:**
- Interface durante chamada ativa
- Contador de duração (MM:SS)
- Controles: Mute / Encerrar
- Elemento `<audio>` para reproduzir stream remoto
- Props: `contactName`, `remoteStream`, `onEndCall`, `onToggleMute`

**UI:**
```
┌─────────────────────────┐
│      [📞 pulsando]      │
│                         │
│   [Nome do Contato]     │
│  Chamada em andamento   │
│       00:42             │
│                         │
│    [🎤]    [📞❌]       │
│   Mute    Encerrar      │
└─────────────────────────┘
```

---

### 6. Chat Page (src/pages/Chat.tsx)

**Adicionado:**
- Importação de componentes de voz
- Botão de chamada no header (visível quando conectado e sem chamada ativa)
- Handlers: `handleStartCall`, `handleAcceptCall`, `handleRejectCall`, `handleEndCall`
- useEffect para notificar chamadas recebidas
- Lógica para alternar entre chat e interface de chamada
- Encerramento automático de chamada ao desconectar

**Fluxo de UI:**
```
callState === 'idle'     → Mostra botão de chamada + chat
callState === 'calling'  → Mostra "Chamando..." + chat
callState === 'ringing'  → Mostra IncomingCallDialog
callState === 'active'   → Mostra ActiveCallInterface (oculta chat)
callState === 'ended'    → Volta para 'idle'
```

---

## Estados da Chamada

```typescript
type CallState = 'idle' | 'calling' | 'ringing' | 'active' | 'ended';
```

**Transições:**
```
idle → calling (usuário inicia chamada)
calling → active (peer aceita)
calling → ended (peer rejeita ou timeout)

idle → ringing (recebe chamada)
ringing → active (usuário aceita)
ringing → ended (usuário rejeita)

active → ended (qualquer lado encerra)
ended → idle (após 1s)
```

---

## Sinais de Chamada (DataChannel)

### Mensagens Trocadas

```typescript
// Iniciar chamada
{ type: 'call-request' }

// Aceitar chamada
{ type: 'call-accept' }

// Recusar chamada
{ type: 'call-reject' }

// Encerrar chamada
{ type: 'call-end' }
```

### Fluxo de Sinais

```
Caller                          Callee
  │                               │
  │──── call-request ────────────>│
  │                               │ (ringing)
  │<──── call-accept ─────────────│
  │                               │
  │ (active)                      │ (active)
  │                               │
  │<═══ Audio Stream (WebRTC) ═══>│
  │                               │
  │──── call-end ─────────────────>│
  │                               │
  │ (ended)                       │ (ended)
```

---

## Fluxo Técnico Completo

### 1. Iniciar Chamada (Caller)

```typescript
// Usuário clica no botão de telefone
await startVoiceCall();

// WebRTCManager:
1. const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
2. this.localStream = stream;
3. stream.getTracks().forEach(track => {
     peerConnection.addTrack(track, stream);
   });
4. dataChannel.send(JSON.stringify({ type: 'call-request' }));
5. onCallStateCallback('calling');

// UI:
- Toast: "Chamando..."
- Estado: calling
```

### 2. Receber Chamada (Callee)

```typescript
// DataChannel recebe mensagem
dataChannel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'call-request') {
    onCallStateCallback('ringing');
  }
};

// UI:
- IncomingCallDialog aparece
- Som de toque é reproduzido (5x)
- Notificação visual
- Estado: ringing
```

### 3. Aceitar Chamada

```typescript
// Usuário clica em "Atender"
acceptVoiceCall();

// WebRTCManager:
1. dataChannel.send(JSON.stringify({ type: 'call-accept' }));
2. onCallStateCallback('active');

// Caller recebe sinal:
dataChannel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'call-accept') {
    onCallStateCallback('active');
  }
};

// UI (ambos):
- ActiveCallInterface aparece
- Chat é ocultado
- Contador de duração inicia
- Estado: active
```

### 4. Stream de Áudio

```typescript
// Quando peer adiciona track:
peerConnection.ontrack = (event) => {
  if (event.streams && event.streams[0]) {
    this.remoteStream = event.streams[0];
    onRemoteStreamCallback(event.streams[0]);
  }
};

// ActiveCallInterface:
useEffect(() => {
  if (audioRef.current && remoteStream) {
    audioRef.current.srcObject = remoteStream;
    audioRef.current.play();
  }
}, [remoteStream]);

// Áudio é reproduzido automaticamente
```

### 5. Mutar Microfone

```typescript
// Usuário clica no botão de mute
const isMuted = toggleMute();

// WebRTCManager:
toggleMute() {
  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    return !audioTrack.enabled; // true se mutado
  }
  return false;
}

// UI:
- Ícone muda: Mic → MicOff
- Cor muda: azul → vermelho
- Peer não ouve mais seu áudio
```

### 6. Encerrar Chamada

```typescript
// Qualquer lado clica em "Encerrar"
endVoiceCall();

// WebRTCManager:
1. dataChannel.send(JSON.stringify({ type: 'call-end' }));
2. localStream.getTracks().forEach(track => track.stop());
3. peerConnection.getSenders().forEach(sender => {
     if (sender.track) peerConnection.removeTrack(sender);
   });
4. localStream = null;
5. onCallStateCallback('ended');

// Peer recebe sinal:
dataChannel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'call-end') {
    onCallStateCallback('ended');
  }
};

// UI (ambos):
- ActiveCallInterface desaparece
- Chat reaparece
- Toast: "Chamada Encerrada"
- Estado: ended → idle
```

---

## Permissões Necessárias

### Microfone

```typescript
// Solicitado automaticamente ao iniciar chamada
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// Se negado:
catch (error) {
  // DOMException: Permission denied
  toast({
    title: 'Erro ao Iniciar Chamada',
    description: 'Não foi possível acessar o microfone.',
    variant: 'destructive'
  });
}
```

**Como permitir:**
- Chrome: chrome://settings/content/microphone
- Firefox: about:preferences#privacy
- Safari: Preferências → Sites → Microfone

### Notificações

```typescript
// Solicitado ao conectar
await NotificationManager.requestPermission();

// Usado para:
- Chamadas recebidas (requireInteraction: true)
- Mensagens
- Reconexões
```

---

## Testes Recomendados

### Teste 1: Chamada Básica
1. Usuário A e B conectam
2. A clica em "Chamar"
3. B recebe notificação com som
4. B clica em "Atender"
5. ✅ Verificar: Ambos ouvem um ao outro
6. A clica em "Encerrar"
7. ✅ Verificar: Chamada encerra para ambos

### Teste 2: Rejeitar Chamada
1. A chama B
2. B clica em "Recusar"
3. ✅ Verificar: A recebe notificação de rejeição
4. ✅ Verificar: Estado volta para idle

### Teste 3: Mute/Unmute
1. A e B em chamada ativa
2. A clica em "Mute"
3. ✅ Verificar: B não ouve A
4. A clica em "Unmute"
5. ✅ Verificar: B volta a ouvir A

### Teste 4: Desconectar Durante Chamada
1. A e B em chamada ativa
2. A desconecta do chat
3. ✅ Verificar: Chamada encerra automaticamente
4. ✅ Verificar: Microfone é liberado

### Teste 5: Permissão Negada
1. Negar permissão de microfone
2. Tentar iniciar chamada
3. ✅ Verificar: Toast de erro aparece
4. ✅ Verificar: Estado permanece idle

---

## Melhorias Futuras

### Curto Prazo
- [ ] Indicador de qualidade de áudio
- [ ] Cancelamento de eco
- [ ] Supressão de ruído

### Médio Prazo
- [ ] Chamada de vídeo
- [ ] Compartilhamento de tela
- [ ] Histórico de chamadas

### Longo Prazo
- [ ] Chamadas em grupo
- [ ] Gravação de chamadas
- [ ] Transcrição automática

---

## Documentação

- **[VOICE_CALL_GUIDE.md](./VOICE_CALL_GUIDE.md)**: Guia completo para usuários
- **[README.md](./README.md)**: Documentação principal atualizada
- **[NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md)**: Sistema de notificações

---

**Status:** ✅ Implementado e funcional  
**Versão:** 1.0  
**Data:** 2026-01-16  
**Lint:** ✅ Passou sem erros
