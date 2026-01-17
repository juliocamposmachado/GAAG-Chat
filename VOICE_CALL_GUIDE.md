# Guia de Chamadas de Voz - GAAG Chat

## Visão Geral

O GAAG Chat agora suporta chamadas de voz P2P (peer-to-peer) usando WebRTC. As chamadas são completamente privadas, criptografadas ponta-a-ponta e não passam por nenhum servidor intermediário.

## Funcionalidades

### ✅ Recursos Implementados

- **Chamadas de voz P2P**: Áudio transmitido diretamente entre dispositivos
- **Criptografia nativa**: DTLS-SRTP automática do WebRTC
- **Controle de microfone**: Mutar/desmutar durante chamada
- **Interface intuitiva**: Dialogs para chamadas recebidas e interface de chamada ativa
- **Notificações**: Som de toque e notificações visuais
- **Contador de duração**: Tempo de chamada em tempo real
- **Integração com chat**: Alternar entre chat e chamada

## Como Usar

### Iniciar uma Chamada

1. **Conecte-se com um contato** (estabeleça conexão WebRTC primeiro)
2. **Clique no ícone de telefone** no cabeçalho do chat
3. **Aguarde o contato aceitar** a chamada
4. **Comece a conversar** quando a chamada for aceita

### Receber uma Chamada

1. **Notificação aparece** quando alguém te chama
2. **Som de toque** é reproduzido automaticamente
3. **Escolha uma ação:**
   - **Atender**: Clique no botão verde com ícone de telefone
   - **Recusar**: Clique no botão vermelho com ícone de telefone cortado

### Durante a Chamada

**Controles disponíveis:**

- **Mutar/Desmutar**: Clique no ícone de microfone
  - Microfone ativo: Ícone azul
  - Microfone mutado: Ícone vermelho
  
- **Encerrar chamada**: Clique no botão vermelho com telefone cortado

**Informações exibidas:**

- Nome do contato
- Status: "Chamada em andamento"
- Duração da chamada (formato MM:SS)

### Encerrar uma Chamada

- **Durante chamada ativa**: Clique no botão "Encerrar"
- **Ao desconectar do chat**: Chamada é encerrada automaticamente
- **Quando peer encerra**: Você recebe notificação

## Requisitos Técnicos

### Permissões Necessárias

1. **Microfone**: Navegador solicitará acesso ao microfone
2. **Notificações**: Para receber alertas de chamadas recebidas

### Compatibilidade

**Navegadores suportados:**
- ✅ Chrome/Edge (Desktop e Mobile)
- ✅ Firefox (Desktop e Mobile)
- ✅ Safari (Desktop e Mobile)
- ✅ Opera

**Requisitos:**
- Conexão WebRTC estabelecida
- Microfone funcional
- Navegador com suporte a getUserMedia API

### Limitações

⚠️ **Ambos devem estar online:**
- Chamadas são P2P em tempo real
- Não há gravação ou voicemail

⚠️ **Apenas áudio:**
- Vídeo não está implementado (pode ser adicionado futuramente)

⚠️ **Qualidade depende da conexão:**
- Conexão ruim = áudio com cortes
- Latência pode variar

## Fluxo Técnico

### 1. Iniciar Chamada (Caller)

```typescript
// Usuário clica no botão de chamada
await startVoiceCall();

// Sistema:
1. Solicita acesso ao microfone (getUserMedia)
2. Adiciona tracks de áudio à conexão WebRTC
3. Envia sinal 'call-request' via DataChannel
4. Atualiza estado para 'calling'
5. Exibe "Chamando..."
```

### 2. Receber Chamada (Callee)

```typescript
// Sistema recebe sinal 'call-request'
onCallState('ringing');

// Interface:
1. Exibe dialog de chamada recebida
2. Toca som de toque (ringtone)
3. Envia notificação visual
4. Aguarda ação do usuário
```

### 3. Aceitar Chamada

```typescript
// Usuário clica em "Atender"
acceptVoiceCall();

// Sistema:
1. Envia sinal 'call-accept' via DataChannel
2. Atualiza estado para 'active'
3. Exibe interface de chamada ativa
4. Conecta stream remoto ao elemento <audio>
```

### 4. Chamada Ativa

```typescript
// Ambos os lados:
- Estado: 'active'
- Streams de áudio fluindo P2P
- Interface mostra controles e duração
- Áudio é reproduzido automaticamente
```

### 5. Encerrar Chamada

```typescript
// Qualquer lado pode encerrar
endVoiceCall();

// Sistema:
1. Envia sinal 'call-end' via DataChannel
2. Para todos os tracks de áudio locais
3. Remove tracks da conexão WebRTC
4. Atualiza estado para 'ended'
5. Limpa streams
6. Retorna para interface de chat
```

## Arquitetura

### Componentes

**1. WebRTCManager (lib/webrtc.ts)**
- Gerencia conexão WebRTC
- Adiciona/remove tracks de áudio
- Envia sinais de chamada via DataChannel
- Controla microfone (mute/unmute)

**2. useWebRTC Hook (hooks/use-webrtc.ts)**
- Expõe métodos de chamada para componentes
- Gerencia estados (callState, remoteStream)
- Callbacks para eventos de chamada

**3. IncomingCallDialog (components/voice/)**
- Dialog para chamadas recebidas
- Botões: Atender / Recusar
- Animação de pulsação

**4. ActiveCallInterface (components/voice/)**
- Interface durante chamada ativa
- Controles: Mute / Encerrar
- Contador de duração
- Elemento <audio> para stream remoto

**5. Chat.tsx (pages/)**
- Integra componentes de voz
- Botão de chamada no header
- Alterna entre chat e chamada

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    CHAMADA DE VOZ P2P                       │
└─────────────────────────────────────────────────────────────┘

Usuário A (Caller)                    Usuário B (Callee)
       │                                      │
       │ 1. Clica "Chamar"                    │
       │ 2. getUserMedia(audio)               │
       │ 3. addTrack(audioTrack)              │
       │                                      │
       │────── call-request (DataChannel) ────>
       │                                      │
       │                         4. Recebe sinal
       │                         5. Toca ringtone
       │                         6. Mostra dialog
       │                                      │
       │                         7. Clica "Atender"
       │<───── call-accept (DataChannel) ──────
       │                                      │
       │ 8. Estado: active                    │ 8. Estado: active
       │                                      │
       │<══════ Audio Stream (WebRTC) ═══════>
       │                                      │
       │ 9. Conversa em andamento             │ 9. Conversa em andamento
       │                                      │
       │ 10. Clica "Encerrar"                 │
       │────── call-end (DataChannel) ────────>
       │                                      │
       │ 11. Para tracks                      │ 11. Para tracks
       │ 12. Remove streams                   │ 12. Remove streams
       │                                      │
       ▼                                      ▼
   Chamada encerrada                    Chamada encerrada
```

## Estados da Chamada

### CallState Enum

```typescript
type CallState = 'idle' | 'calling' | 'ringing' | 'active' | 'ended';
```

**idle**: Nenhuma chamada em andamento
- Interface: Botão de chamada visível
- Ação: Usuário pode iniciar chamada

**calling**: Chamada sendo iniciada (caller)
- Interface: "Chamando..."
- Ação: Aguardando peer aceitar

**ringing**: Chamada recebida (callee)
- Interface: Dialog de chamada recebida
- Ação: Usuário pode aceitar ou recusar

**active**: Chamada em andamento
- Interface: Controles de chamada ativa
- Ação: Usuário pode mutar ou encerrar

**ended**: Chamada encerrada
- Interface: Retorna para chat
- Ação: Estado volta para 'idle'

## Sinais de Chamada (DataChannel)

### Tipos de Mensagens

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

## Notificações

### Som de Toque (Ringtone)

**Características:**
- Frequência: 800 Hz
- Duração: 0.5s por toque
- Intervalo: 1s entre toques
- Máximo: 5 toques

**Implementação:**
```typescript
playCallRingtone() {
  // Web Audio API
  // Oscilador senoidal
  // Repetição com setTimeout
}
```

### Notificação Visual

**Quando exibir:**
- Chamada recebida (sempre)
- Janela em background (desktop)
- Qualquer situação (mobile)

**Conteúdo:**
- Título: "📞 Chamada de Voz"
- Corpo: "[Nome] está chamando..."
- Ícone: Favicon do app
- requireInteraction: true (não desaparece automaticamente)

## Troubleshooting

### Microfone não funciona

**Problema:** Erro ao iniciar chamada

**Causas:**
- Permissão negada
- Microfone em uso por outro app
- Microfone não conectado

**Solução:**
1. Verificar permissões do navegador
2. Fechar outros apps usando microfone
3. Conectar microfone físico
4. Testar em chrome://settings/content/microphone

---

### Áudio não é ouvido

**Problema:** Chamada ativa mas sem áudio

**Causas:**
- Stream remoto não conectado
- Volume do sistema mutado
- Elemento <audio> não reproduzindo

**Solução:**
1. Verificar console: "Remote Stream Received"
2. Verificar volume do sistema
3. Verificar se autoplay está permitido
4. Recarregar página e tentar novamente

---

### Chamada não conecta

**Problema:** Fica em "Chamando..." indefinidamente

**Causas:**
- Peer não aceitou
- Peer está offline
- DataChannel não aberto

**Solução:**
1. Verificar se peer está conectado
2. Verificar estado da conexão WebRTC
3. Peer deve clicar em "Atender"
4. Tentar encerrar e chamar novamente

---

### Áudio com cortes

**Problema:** Qualidade ruim, áudio picotado

**Causas:**
- Conexão de internet instável
- Alta latência
- Perda de pacotes

**Solução:**
1. Verificar velocidade da internet
2. Aproximar-se do roteador WiFi
3. Fechar outros apps usando internet
4. Tentar em horário com menos tráfego

---

### Erro "getUserMedia failed"

**Problema:** Não consegue acessar microfone

**Causas:**
- HTTPS não está sendo usado (em produção)
- Permissão negada permanentemente
- Navegador não suporta getUserMedia

**Solução:**
1. Usar HTTPS (obrigatório para getUserMedia)
2. Resetar permissões do site
3. Usar navegador compatível
4. Verificar se microfone está funcionando

## Melhorias Futuras

### Funcionalidades Planejadas

1. **Chamada de vídeo**
   - Adicionar tracks de vídeo
   - Interface com preview de câmera
   - Controle de câmera on/off

2. **Indicador de qualidade**
   - Mostrar força do sinal
   - Latência em tempo real
   - Perda de pacotes

3. **Histórico de chamadas**
   - Salvar duração e data
   - Estatísticas de chamadas
   - Exportar histórico

4. **Chamada em grupo**
   - Suporte para múltiplos peers
   - Mixer de áudio
   - Controles individuais

5. **Gravação de chamadas**
   - Gravar áudio localmente
   - Exportar como arquivo
   - Criptografar gravações

6. **Efeitos de áudio**
   - Cancelamento de ruído
   - Equalização
   - Compressão

## Segurança e Privacidade

### Criptografia

✅ **DTLS-SRTP**: Criptografia nativa do WebRTC
✅ **Ponta-a-ponta**: Áudio nunca passa por servidor
✅ **Sem gravação**: Nenhum áudio é armazenado

### Privacidade

✅ **Sem rastreamento**: Nenhum dado de chamada é coletado
✅ **Sem metadados**: Duração e participantes não são registrados
✅ **Sem terceiros**: Apenas você e seu contato

### Permissões

⚠️ **Microfone**: Necessário para chamadas
⚠️ **Notificações**: Opcional, mas recomendado

## Referências

- [WebRTC getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [RTCPeerConnection addTrack](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)

---

**Versão:** 1.0  
**Data:** 2026-01-16  
**Status:** ✅ Implementado e funcional
