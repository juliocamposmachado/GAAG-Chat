# Mensagens de Áudio - GAAG Chat

## Resumo

Implementado funcionalidade completa de mensagens de áudio no GAAG Chat, permitindo que usuários gravem e enviem mensagens de voz diretamente através do chat P2P. As mensagens de áudio são transmitidas via WebRTC DataChannel e armazenadas localmente.

## Funcionalidades

### 1. Gravação de Áudio

**Características:**
- Gravação usando MediaRecorder API
- Codec: webm/opus (melhor compressão)
- Duração máxima: 2 minutos (120 segundos)
- Duração mínima: 1 segundo
- Limite de tamanho: 5MB
- Cancelamento de gravação
- Indicador visual de gravação com timer

**Configurações de Áudio:**
- Echo cancellation: ativado
- Noise suppression: ativado
- Auto gain control: ativado

### 2. Reprodução de Áudio

**Características:**
- Player integrado nas mensagens
- Controles: Play/Pause
- Barra de progresso interativa (seek)
- Exibição de duração (atual/total)
- Design adaptado ao tema (me/peer)

### 3. Transmissão P2P

**Método:**
- Conversão de Blob para Base64
- Envio via WebRTC DataChannel
- Tipo de mensagem: 'audio-message'
- Inclui dados de áudio e duração

### 4. Armazenamento Local

**Dados salvos:**
- Áudio em formato Base64
- Duração em segundos
- Timestamp
- Sender (me/peer)
- Tipo: 'audio'

## Arquitetura

### Componentes Criados

#### 1. VoiceMessageRecorder
**Localização:** `src/components/chat/VoiceMessageRecorder.tsx`

**Responsabilidades:**
- Solicitar permissão de microfone
- Iniciar/parar gravação
- Exibir timer de gravação
- Validar duração e tamanho
- Enviar ou cancelar gravação

**Props:**
```typescript
interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}
```

**Estados:**
- `isRecording`: boolean - Se está gravando
- `duration`: number - Duração atual em segundos
- `isProcessing`: boolean - Se está processando áudio

**Fluxo:**
```
1. Usuário clica no botão de microfone
2. Solicita permissão getUserMedia({ audio: true })
3. Cria MediaRecorder com codec webm/opus
4. Inicia gravação e timer
5. Usuário clica em "Enviar" ou "Cancelar"
6. Para gravação e chama callback apropriado
```

---

#### 2. AudioMessagePlayer
**Localização:** `src/components/chat/AudioMessagePlayer.tsx`

**Responsabilidades:**
- Reproduzir áudio Base64
- Controlar play/pause
- Exibir progresso
- Permitir seek (pular para posição)
- Adaptar design ao sender

**Props:**
```typescript
interface AudioMessagePlayerProps {
  audioData: string; // Base64 encoded audio
  duration: number; // Duração em segundos
  sender: 'me' | 'peer';
}
```

**Estados:**
- `isPlaying`: boolean - Se está reproduzindo
- `currentTime`: number - Tempo atual em segundos
- `isLoading`: boolean - Se está carregando áudio

**Eventos:**
- `loadeddata`: Áudio carregado
- `ended`: Reprodução terminou
- `error`: Erro ao carregar/reproduzir

---

### Atualizações em Componentes Existentes

#### 3. ChatInterface
**Arquivo:** `src/components/chat/ChatInterface.tsx`

**Mudanças:**
- Adicionado prop `onSendAudioMessage`
- Integrado `VoiceMessageRecorder`
- Estado `isRecordingVoice` para controlar UI
- Botão de microfone ao lado do input

**Nova Prop:**
```typescript
onSendAudioMessage?: (audioBlob: Blob, duration: number) => void;
```

---

#### 4. MessageBubble
**Arquivo:** `src/components/chat/MessageBubble.tsx`

**Mudanças:**
- Detecta tipo de mensagem (text/audio)
- Renderiza `AudioMessagePlayer` para mensagens de áudio
- Ajusta padding e layout para áudio
- Mantém timestamp e status de entrega

**Lógica:**
```typescript
const isAudioMessage = message.type === 'audio' 
  && message.audioData 
  && message.audioDuration;

if (isAudioMessage) {
  // Renderiza AudioMessagePlayer
} else {
  // Renderiza texto normal
}
```

---

### Atualizações no Backend

#### 5. WebRTCManager
**Arquivo:** `src/lib/webrtc.ts`

**Novos Métodos:**

**sendAudioMessage()**
```typescript
async sendAudioMessage(audioBlob: Blob, duration: number): Promise<boolean> {
  // 1. Converter Blob para Base64
  const base64Audio = await this.blobToBase64(audioBlob);
  
  // 2. Enviar via DataChannel
  this.dataChannel.send(JSON.stringify({ 
    type: 'audio-message', 
    audioData: base64Audio,
    duration: duration
  }));
  
  return true;
}
```

**blobToBase64()**
```typescript
private blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

**onAudioMessage()**
```typescript
onAudioMessage(callback: (audioData: string, duration: number) => void): void {
  this.onAudioMessageCallback = callback;
}
```

**Handler de Mensagens:**
```typescript
dataChannel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'audio-message') {
    this.onAudioMessageCallback?.(data.audioData, data.duration);
  }
  // ... outros tipos
};
```

---

#### 6. useWebRTC Hook
**Arquivo:** `src/hooks/use-webrtc.ts`

**Novo Método:**

**sendAudioMessage()**
```typescript
const sendAudioMessage = useCallback(async (audioBlob: Blob, duration: number) => {
  if (!contactId) return;

  const success = await webrtc.sendAudioMessage(audioBlob, duration);
  
  if (success) {
    // Converter para Base64 e salvar localmente
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
```

**Handler de Mensagens Recebidas:**
```typescript
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
```

---

### Tipos Atualizados

#### 7. Message Interface
**Arquivo:** `src/types/types.ts`

**Novos Campos:**
```typescript
export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'peer';
  timestamp: number;
  delivered?: boolean;
  type?: 'text' | 'audio'; // Novo: tipo de mensagem
  audioData?: string; // Novo: Base64 encoded audio
  audioDuration?: number; // Novo: duração em segundos
}
```

---

## Fluxo Completo

### Cenário: Usuário A envia mensagem de áudio para Usuário B

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE MENSAGEM DE ÁUDIO P2P                 │
└─────────────────────────────────────────────────────────────┘

Usuário A (Sender)                    Usuário B (Receiver)
       │                                      │
       │ 1. Clica no botão de microfone       │
       │ 2. getUserMedia({ audio: true })     │
       │ 3. MediaRecorder.start()             │
       │                                      │
       │ [🎤 Gravando... 0:05]                │
       │                                      │
       │ 4. Clica "Enviar"                    │
       │ 5. MediaRecorder.stop()              │
       │ 6. Blob criado                       │
       │ 7. Validação (tamanho < 5MB)         │
       │ 8. Blob → Base64                     │
       │                                      │
       │────── audio-message (DataChannel) ───>
       │       { audioData, duration }        │
       │                                      │
       │ 9. Salva localmente                  │ 10. Recebe mensagem
       │ 10. Exibe AudioMessagePlayer         │ 11. Salva localmente
       │                                      │ 12. Exibe AudioMessagePlayer
       │                                      │
       │                                      │ 13. Clica Play
       │                                      │ 14. Audio.play()
       │                                      │ [🔊 Reproduzindo...]
       │                                      │
       ▼                                      ▼
   Mensagem enviada                     Mensagem recebida
```

---

## Validações e Limites

### Gravação

| Validação | Limite | Ação |
|-----------|--------|------|
| Duração mínima | 1 segundo | Botão "Enviar" desabilitado |
| Duração máxima | 120 segundos (2 min) | Para automaticamente |
| Tamanho do arquivo | 5 MB | Rejeita e exibe toast |
| Permissão de microfone | Obrigatória | Exibe erro se negada |

### Reprodução

| Validação | Comportamento |
|-----------|---------------|
| Áudio inválido | Exibe erro no console |
| Autoplay bloqueado | Requer interação do usuário |
| Formato não suportado | Fallback para formato padrão |

---

## Tratamento de Erros

### Erros de Gravação

**1. Permissão Negada**
```typescript
catch (error) {
  toast({
    title: 'Erro ao Gravar Áudio',
    description: 'Não foi possível acessar o microfone. Verifique as permissões.',
    variant: 'destructive'
  });
}
```

**2. Áudio Muito Grande**
```typescript
if (audioBlob.size > 5 * 1024 * 1024) {
  toast({
    title: 'Áudio muito grande',
    description: 'O áudio não pode exceder 5MB. Tente gravar uma mensagem mais curta.',
    variant: 'destructive'
  });
}
```

### Erros de Reprodução

**1. Erro ao Carregar**
```typescript
audio.addEventListener('error', () => {
  console.error('Erro ao carregar áudio');
  setIsLoading(false);
  setIsPlaying(false);
});
```

**2. Erro ao Reproduzir**
```typescript
try {
  await audioRef.current.play();
} catch (error) {
  console.error('Erro ao reproduzir áudio:', error);
  setIsLoading(false);
  setIsPlaying(false);
}
```

---

## Testes

### Teste 1: Gravar e Enviar Áudio
1. Conectar com um contato
2. Clicar no botão de microfone
3. Permitir acesso ao microfone
4. ✅ Verificar: Timer começa a contar
5. ✅ Verificar: Indicador vermelho piscando
6. Falar por 5 segundos
7. Clicar em "Enviar"
8. ✅ Verificar: Mensagem de áudio aparece no chat
9. ✅ Verificar: Player de áudio exibido

### Teste 2: Receber e Reproduzir Áudio
1. Usuário A envia mensagem de áudio
2. ✅ Verificar: Usuário B recebe mensagem
3. ✅ Verificar: Player de áudio exibido
4. Usuário B clica em Play
5. ✅ Verificar: Áudio reproduz corretamente
6. ✅ Verificar: Barra de progresso atualiza
7. ✅ Verificar: Tempo atual atualiza

### Teste 3: Cancelar Gravação
1. Clicar no botão de microfone
2. Gravar por 3 segundos
3. Clicar em "Cancelar" (X)
4. ✅ Verificar: Gravação para
5. ✅ Verificar: Nenhuma mensagem enviada
6. ✅ Verificar: UI volta ao normal

### Teste 4: Duração Máxima
1. Clicar no botão de microfone
2. Gravar por mais de 2 minutos
3. ✅ Verificar: Gravação para automaticamente em 2:00
4. ✅ Verificar: Áudio é enviado automaticamente

### Teste 5: Áudio Muito Grande
1. Gravar áudio longo (próximo a 5MB)
2. Tentar enviar
3. ✅ Verificar: Toast de erro exibido
4. ✅ Verificar: Mensagem não enviada

### Teste 6: Seek (Pular para Posição)
1. Receber mensagem de áudio
2. Clicar em Play
3. Clicar na barra de progresso (meio do áudio)
4. ✅ Verificar: Reprodução pula para posição clicada
5. ✅ Verificar: Tempo atual atualiza

### Teste 7: Múltiplas Mensagens de Áudio
1. Enviar 3 mensagens de áudio seguidas
2. ✅ Verificar: Todas aparecem no chat
3. Reproduzir cada uma
4. ✅ Verificar: Apenas uma reproduz por vez
5. ✅ Verificar: Não há conflito entre players

### Teste 8: Armazenamento Local
1. Enviar mensagem de áudio
2. Recarregar página
3. ✅ Verificar: Mensagem de áudio ainda está no histórico
4. Reproduzir áudio
5. ✅ Verificar: Áudio reproduz corretamente

---

## Melhorias Futuras

### Curto Prazo
- [ ] Visualização de forma de onda durante gravação
- [ ] Velocidade de reprodução (1x, 1.5x, 2x)
- [ ] Indicador de "ouvido" (listened status)

### Médio Prazo
- [ ] Compressão adicional de áudio
- [ ] Transcrição automática (Speech-to-Text)
- [ ] Filtros de áudio (redução de ruído)

### Longo Prazo
- [ ] Mensagens de áudio em grupo
- [ ] Encaminhamento de áudio
- [ ] Responder áudio com áudio

---

## Arquivos Criados/Modificados

### Criados
1. `src/components/chat/VoiceMessageRecorder.tsx` - Componente de gravação
2. `src/components/chat/AudioMessagePlayer.tsx` - Componente de reprodução
3. `VOICE_MESSAGE_GUIDE.md` - Esta documentação

### Modificados
1. `src/types/types.ts` - Adicionado campos de áudio ao Message
2. `src/lib/webrtc.ts` - Adicionado suporte a mensagens de áudio
3. `src/hooks/use-webrtc.ts` - Adicionado sendAudioMessage e handler
4. `src/components/chat/ChatInterface.tsx` - Integrado VoiceMessageRecorder
5. `src/components/chat/MessageBubble.tsx` - Suporte a exibição de áudio
6. `src/pages/Chat.tsx` - Passado sendAudioMessage para ChatInterface

---

**Status:** ✅ Implementado e funcional  
**Versão:** 1.0  
**Data:** 2026-01-16  
**Lint:** ✅ Passou sem erros
