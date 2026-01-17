# Envio de Imagens e Vídeos - GAAG Chat

## Resumo

Implementada funcionalidade completa de envio e recebimento de imagens e vídeos no GAAG Chat P2P. Os usuários podem selecionar arquivos de mídia, visualizar antes de enviar, e compartilhar através do WebRTC DataChannel. As mídias são exibidas com preview interativo, suporte a fullscreen para imagens, e controles nativos para vídeos.

## Funcionalidades

### 1. Upload de Mídia

**Imagens Suportadas:**
- JPEG/JPG
- PNG
- GIF
- WebP

**Vídeos Suportados:**
- MP4
- WebM
- QuickTime (MOV)

**Limites:**
- Imagens: 10MB máximo
- Vídeos: 50MB máximo

### 2. Preview Antes de Enviar

- Visualização completa do arquivo
- Informações de nome e tamanho
- Opção de cancelar ou confirmar envio
- Loading indicator durante processamento

### 3. Exibição de Mídia

**Imagens:**
- Preview otimizado (max 300x300px)
- Click para fullscreen
- Botão de download
- Hover overlay com ações

**Vídeos:**
- Player nativo com controles
- Preview otimizado
- Botão de download
- Preload de metadata

### 4. Transmissão P2P

- Conversão para Base64
- Envio via WebRTC DataChannel
- Preservação de dimensões originais
- Armazenamento local automático

## Arquitetura

### Componentes Criados

#### 1. MediaMessageUploader
**Localização:** `src/components/chat/MediaMessageUploader.tsx`

**Responsabilidades:**
- Dois botões: Imagem e Vídeo
- File inputs ocultos
- Validação de formato e tamanho
- Dialog de preview
- Conversão e envio

**Props:**
```typescript
interface MediaMessageUploaderProps {
  onSend: (file: File, mediaType: 'image' | 'video') => void;
}
```

**Estados:**
- `selectedFile`: File | null - Arquivo selecionado
- `previewUrl`: string | null - URL de preview (blob)
- `mediaType`: 'image' | 'video' | null - Tipo de mídia
- `isProcessing`: boolean - Se está processando
- `showPreview`: boolean - Se mostra dialog

**Validações:**
```typescript
// Formatos
SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime']

// Tamanhos
MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
```

**Fluxo:**
```
1. Usuário clica em botão (Imagem ou Vídeo)
2. File input abre
3. Usuário seleciona arquivo
4. Validação de formato e tamanho
5. Criar preview URL (createObjectURL)
6. Mostrar dialog de preview
7. Usuário confirma ou cancela
8. Se confirmar: chamar onSend(file, mediaType)
9. Limpar estado e fechar dialog
```

---

#### 2. MediaMessageDisplay
**Localização:** `src/components/chat/MediaMessageDisplay.tsx`

**Responsabilidades:**
- Exibir imagens com preview otimizado
- Exibir vídeos com player nativo
- Fullscreen para imagens
- Download de mídia
- Hover overlay com ações

**Props:**
```typescript
interface MediaMessageDisplayProps {
  mediaData: string; // Base64 encoded media
  mediaType: string; // MIME type
  sender: 'me' | 'peer';
  width?: number; // Largura original
  height?: number; // Altura original
}
```

**Estados:**
- `showFullscreen`: boolean - Se mostra imagem em fullscreen

**Cálculo de Dimensões:**
```typescript
const getPreviewDimensions = () => {
  if (!width || !height) return { width: 300, height: 200 };
  
  const maxSize = 300;
  const ratio = Math.min(maxSize / width, maxSize / height);
  
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
};
```

**Recursos:**
- Lazy loading de imagens
- Preload de metadata para vídeos
- Overlay com ações (hover)
- Dialog fullscreen para imagens
- Botão de download

---

### Atualizações em Componentes Existentes

#### 3. ChatInterface
**Arquivo:** `src/components/chat/ChatInterface.tsx`

**Mudanças:**
- Adicionado prop `onSendMediaMessage`
- Integrado `MediaMessageUploader`
- Botões de mídia ao lado do input
- Visível apenas quando conectado

**Nova Prop:**
```typescript
onSendMediaMessage?: (file: File, mediaType: 'image' | 'video') => void;
```

**Layout:**
```
[Imagem] [Vídeo] [Textarea] [Microfone] [Enviar]
```

---

#### 4. MessageBubble
**Arquivo:** `src/components/chat/MessageBubble.tsx`

**Mudanças:**
- Detecta tipo de mensagem (text/audio/image/video)
- Renderiza `MediaMessageDisplay` para mídia
- Ajusta padding para mídia (p-0 no container, p-2 no conteúdo)
- Mantém timestamp e status de entrega

**Lógica:**
```typescript
const isMediaMessage = (message.type === 'image' || message.type === 'video') 
  && message.mediaData 
  && message.mediaType;

if (isMediaMessage) {
  // Renderiza MediaMessageDisplay
}
```

---

### Atualizações no Backend

#### 5. WebRTCManager
**Arquivo:** `src/lib/webrtc.ts`

**Novos Métodos:**

**sendMediaMessage()**
```typescript
async sendMediaMessage(file: File, mediaType: 'image' | 'video'): Promise<boolean> {
  // 1. Converter File para Base64
  const base64Media = await this.blobToBase64(file);
  
  // 2. Obter dimensões
  let width, height;
  if (mediaType === 'image') {
    const dimensions = await this.getImageDimensions(base64Media);
    width = dimensions.width;
    height = dimensions.height;
  } else {
    const dimensions = await this.getVideoDimensions(base64Media);
    width = dimensions.width;
    height = dimensions.height;
  }
  
  // 3. Enviar via DataChannel
  this.dataChannel.send(JSON.stringify({ 
    type: 'media-message', 
    mediaData: base64Media,
    mediaType: file.type,
    width,
    height
  }));
  
  return true;
}
```

**getImageDimensions()**
```typescript
private getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
}
```

**getVideoDimensions()**
```typescript
private getVideoDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = reject;
    video.src = base64;
  });
}
```

**onMediaMessage()**
```typescript
onMediaMessage(callback: (mediaData: string, mediaType: string, width?: number, height?: number) => void): void {
  this.onMediaMessageCallback = callback;
}
```

**Handler de Mensagens:**
```typescript
dataChannel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'media-message') {
    this.onMediaMessageCallback?.(data.mediaData, data.mediaType, data.width, data.height);
  }
  // ... outros tipos
};
```

---

#### 6. useWebRTC Hook
**Arquivo:** `src/hooks/use-webrtc.ts`

**Novo Método:**

**sendMediaMessage()**
```typescript
const sendMediaMessage = useCallback(async (file: File, mediaType: 'image' | 'video') => {
  if (!contactId) return;

  const success = await webrtc.sendMediaMessage(file, mediaType);
  
  if (success) {
    // Converter file para base64 para salvar localmente
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Media = reader.result as string;
      
      // Obter dimensões
      let width, height;
      if (mediaType === 'image') {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            resolve(null);
          };
          img.src = base64Media;
        });
      } else {
        const video = document.createElement('video');
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            width = video.videoWidth;
            height = video.videoHeight;
            resolve(null);
          };
          video.src = base64Media;
        });
      }
      
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        text: mediaType === 'image' ? '[Imagem]' : '[Vídeo]',
        sender: 'me',
        timestamp: Date.now(),
        delivered: true,
        type: mediaType,
        mediaData: base64Media,
        mediaType: file.type,
        mediaWidth: width,
        mediaHeight: height
      };

      setMessages((prev) => [...prev, newMessage]);
      StorageManager.addMessage(contactId, newMessage);
    };
    reader.readAsDataURL(file);
  }
}, [contactId]);
```

**Handler de Mensagens Recebidas:**
```typescript
const handleMediaMessage = (mediaData: string, mediaType: string, width?: number, height?: number) => {
  if (!contactId) return;

  const isImage = mediaType.startsWith('image/');
  const isVideo = mediaType.startsWith('video/');

  const newMessage: Message = {
    id: Date.now().toString(),
    text: isImage ? '[Imagem]' : '[Vídeo]',
    sender: 'peer',
    timestamp: Date.now(),
    delivered: true,
    type: isImage ? 'image' : 'video',
    mediaData,
    mediaType,
    mediaWidth: width,
    mediaHeight: height
  };

  setMessages((prev) => [...prev, newMessage]);
  StorageManager.addMessage(contactId, newMessage);
  
  // Tocar som de notificação
  NotificationManager.playMessageNotification();
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
  type?: 'text' | 'audio' | 'image' | 'video'; // Atualizado
  audioData?: string;
  audioDuration?: number;
  mediaData?: string; // Novo: Base64 encoded media
  mediaType?: string; // Novo: MIME type (image/jpeg, video/mp4, etc)
  mediaWidth?: number; // Novo: Largura original
  mediaHeight?: number; // Novo: Altura original
}
```

---

## Fluxo Completo

### Cenário: Usuário A envia imagem para Usuário B

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE ENVIO DE IMAGEM/VÍDEO P2P             │
└─────────────────────────────────────────────────────────────┘

Usuário A (Sender)                    Usuário B (Receiver)
       │                                      │
       │ 1. Clica em botão Imagem/Vídeo       │
       │ 2. Seleciona arquivo                 │
       │ 3. Validação (formato, tamanho)      │
       │ 4. Preview em dialog                 │
       │ 5. Clica "Enviar"                    │
       │                                      │
       │ 6. File → Base64                     │
       │ 7. Obter dimensões (width, height)   │
       │ 8. sendMediaMessage()                │
       │                                      │
       │────── media-message (DataChannel) ───>
       │       { mediaData, mediaType,        │
       │         width, height }              │
       │                                      │
       │ 9. Salva localmente                  │ 10. Recebe mensagem
       │ 10. Exibe MediaMessageDisplay        │ 11. Salva localmente
       │                                      │ 12. Exibe MediaMessageDisplay
       │                                      │ 13. Toca notificação sonora
       │                                      │
       │                                      │ 14. Clica na imagem
       │                                      │ 15. Abre fullscreen
       │                                      │
       ▼                                      ▼
   Mídia enviada                        Mídia recebida
```

---

## Validações e Limites

### Upload

| Validação | Limite | Ação |
|-----------|--------|------|
| Formato de imagem | JPEG, PNG, GIF, WebP | Rejeita com toast |
| Formato de vídeo | MP4, WebM, MOV | Rejeita com toast |
| Tamanho de imagem | 10 MB | Rejeita com toast |
| Tamanho de vídeo | 50 MB | Rejeita com toast |

### Exibição

| Elemento | Comportamento |
|----------|---------------|
| Preview de imagem | Max 300x300px, mantém aspect ratio |
| Preview de vídeo | Max 300x300px, mantém aspect ratio |
| Fullscreen | Imagens apenas, max 90vw x 90vh |
| Lazy loading | Imagens usam loading="lazy" |
| Preload | Vídeos usam preload="metadata" |

---

## Tratamento de Erros

### Erros de Upload

**1. Formato Não Suportado**
```typescript
toast({
  title: 'Formato não suportado',
  description: 'Por favor, selecione um arquivo de imagem/vídeo válido.',
  variant: 'destructive'
});
```

**2. Arquivo Muito Grande**
```typescript
toast({
  title: 'Arquivo muito grande',
  description: 'O arquivo não pode exceder 10MB/50MB.',
  variant: 'destructive'
});
```

**3. Erro ao Enviar**
```typescript
toast({
  title: 'Erro ao Enviar',
  description: 'Não foi possível enviar o arquivo. Tente novamente.',
  variant: 'destructive'
});
```

### Erros de Exibição

**1. Erro ao Carregar Imagem**
```typescript
// Fallback silencioso - imagem não carrega
console.error('Erro ao carregar imagem');
```

**2. Erro ao Carregar Vídeo**
```typescript
// Player mostra erro nativo do navegador
video.onerror = (error) => {
  console.error('Erro ao carregar vídeo:', error);
};
```

---

## Testes

### Teste 1: Enviar Imagem
1. Conectar com contato
2. Clicar em botão de imagem
3. Selecionar imagem JPEG (< 10MB)
4. ✅ Verificar: Preview aparece em dialog
5. ✅ Verificar: Nome e tamanho exibidos
6. Clicar em "Enviar"
7. ✅ Verificar: Imagem aparece no chat
8. ✅ Verificar: Preview otimizado (max 300px)

### Teste 2: Enviar Vídeo
1. Conectar com contato
2. Clicar em botão de vídeo
3. Selecionar vídeo MP4 (< 50MB)
4. ✅ Verificar: Preview com player em dialog
5. Clicar em "Enviar"
6. ✅ Verificar: Vídeo aparece no chat
7. ✅ Verificar: Player com controles funciona

### Teste 3: Receber Imagem
1. Usuário A envia imagem
2. ✅ Verificar: Usuário B recebe imagem
3. ✅ Verificar: Preview otimizado exibido
4. ✅ Verificar: Som de notificação toca
5. Clicar na imagem
6. ✅ Verificar: Abre em fullscreen

### Teste 4: Receber Vídeo
1. Usuário A envia vídeo
2. ✅ Verificar: Usuário B recebe vídeo
3. ✅ Verificar: Player exibido
4. Clicar em play
5. ✅ Verificar: Vídeo reproduz corretamente

### Teste 5: Validação de Formato
1. Tentar enviar arquivo .txt como imagem
2. ✅ Verificar: Toast de erro "Formato não suportado"
3. ✅ Verificar: Arquivo não é enviado

### Teste 6: Validação de Tamanho
1. Tentar enviar imagem > 10MB
2. ✅ Verificar: Toast de erro "Arquivo muito grande"
3. ✅ Verificar: Arquivo não é enviado

### Teste 7: Download de Mídia
1. Receber imagem
2. Hover sobre imagem
3. ✅ Verificar: Overlay com botões aparece
4. Clicar em botão de download
5. ✅ Verificar: Arquivo baixa corretamente

### Teste 8: Cancelar Envio
1. Selecionar imagem
2. Preview aparece
3. Clicar em "Cancelar"
4. ✅ Verificar: Dialog fecha
5. ✅ Verificar: Nenhuma mensagem enviada

### Teste 9: Múltiplas Mídias
1. Enviar 3 imagens seguidas
2. ✅ Verificar: Todas aparecem no chat
3. ✅ Verificar: Cada uma com preview correto
4. ✅ Verificar: Fullscreen funciona para todas

### Teste 10: Armazenamento Local
1. Enviar imagem
2. Recarregar página
3. ✅ Verificar: Imagem ainda está no histórico
4. Clicar na imagem
5. ✅ Verificar: Fullscreen funciona

---

## Melhorias Futuras

### Curto Prazo
- [ ] Compressão automática de imagens grandes
- [ ] Thumbnail para vídeos (captura de frame)
- [ ] Indicador de progresso de upload
- [ ] Suporte a múltiplos arquivos simultâneos

### Médio Prazo
- [ ] Editor de imagem (crop, rotate, filter)
- [ ] Captura de foto/vídeo pela câmera
- [ ] Galeria de mídia (visualizar todas as mídias)
- [ ] Chunking para arquivos muito grandes

### Longo Prazo
- [ ] Suporte a GIFs animados
- [ ] Stickers e emojis personalizados
- [ ] Compartilhamento de localização
- [ ] Documentos (PDF, DOC, etc.)

---

## Considerações Técnicas

### Base64 vs Blob URL

**Por que Base64?**
- Persistência em localStorage
- Transmissão via DataChannel (JSON)
- Compatibilidade cross-browser
- Não requer gerenciamento de URLs

**Desvantagens:**
- Aumento de ~33% no tamanho
- Maior uso de memória
- Não ideal para arquivos muito grandes

### Limites de Tamanho

**Por que 10MB para imagens e 50MB para vídeos?**
- localStorage tem limite de ~5-10MB por domínio
- Base64 aumenta tamanho em 33%
- DataChannel tem limite de mensagem (~256KB chunks)
- Balanceamento entre funcionalidade e performance

**Solução para arquivos maiores:**
- Implementar chunking (dividir em partes)
- Enviar chunks sequencialmente
- Remontar no receptor

### Performance

**Otimizações Implementadas:**
- Lazy loading de imagens
- Preload de metadata para vídeos
- Preview otimizado (max 300px)
- Blob URL para preview (não Base64)
- Cleanup de Blob URLs após uso

---

## Arquivos Criados/Modificados

### Criados
1. `src/components/chat/MediaMessageUploader.tsx` - Componente de upload
2. `src/components/chat/MediaMessageDisplay.tsx` - Componente de exibição
3. `MEDIA_MESSAGE_GUIDE.md` - Esta documentação

### Modificados
1. `src/types/types.ts` - Adicionado campos de mídia ao Message
2. `src/lib/webrtc.ts` - Adicionado suporte a mensagens de mídia
3. `src/hooks/use-webrtc.ts` - Adicionado sendMediaMessage e handler
4. `src/components/chat/ChatInterface.tsx` - Integrado MediaMessageUploader
5. `src/components/chat/MessageBubble.tsx` - Suporte a exibição de mídia
6. `src/pages/Chat.tsx` - Passado sendMediaMessage para ChatInterface

---

**Status:** ✅ Implementado e funcional  
**Versão:** 1.0  
**Data:** 2026-01-16  
**Lint:** ✅ Passou sem erros
