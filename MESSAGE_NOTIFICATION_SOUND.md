# Som de Notificação de Mensagem - Like Look Solutions

## Resumo

Implementado som de notificação para mensagens recebidas no Like Look Solutions. Quando o usuário recebe uma mensagem (texto ou áudio), um som curto de 440Hz (nota Lá/A4) é reproduzido automaticamente.

## Funcionalidade

### Características do Som

**Frequência:** 440Hz (Lá / A4)
**Duração:** 0.3 segundos
**Volume:** 0.2 (20% do máximo)
**Tipo de onda:** Senoidal (sine)
**Envelope:** Fade in rápido (0.05s) + Fade out suave (0.25s)

### Quando Toca

✅ **Toca quando:**
- Recebe mensagem de texto do peer
- Recebe mensagem de áudio do peer

❌ **NÃO toca quando:**
- Envia mensagem própria
- Recebe indicador de digitação
- Recebe sinais de chamada de voz

## Implementação

### NotificationManager
**Arquivo:** `src/lib/notifications.ts`

**Método Adicionado:**
```typescript
static playMessageNotification(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Frequência: 440Hz (Lá / A4)
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    
    // Envelope: fade in rápido, fade out suave
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Fechar contexto após reprodução
    setTimeout(() => {
      audioContext.close();
    }, 400);
  } catch (error) {
    console.error('[Notificações] Erro ao tocar som de mensagem:', error);
  }
}
```

### useWebRTC Hook
**Arquivo:** `src/hooks/use-webrtc.ts`

**Chamadas Adicionadas:**

**1. Mensagem de Texto:**
```typescript
const handleMessage = (text: string) => {
  // ... criar e salvar mensagem
  
  // Tocar som de notificação de mensagem
  NotificationManager.playMessageNotification();
};
```

**2. Mensagem de Áudio:**
```typescript
const handleAudioMessage = (audioData: string, duration: number) => {
  // ... criar e salvar mensagem de áudio
  
  // Tocar som de notificação de mensagem
  NotificationManager.playMessageNotification();
};
```

## Fluxo Técnico

```
┌─────────────────────────────────────────────────────────────┐
│           FLUXO DE NOTIFICAÇÃO SONORA DE MENSAGEM           │
└─────────────────────────────────────────────────────────────┘

Usuário A (Sender)                    Usuário B (Receiver)
       │                                      │
       │ 1. Envia mensagem                    │
       │────── message (DataChannel) ─────────>
       │                                      │
       │                                      │ 2. handleMessage()
       │                                      │ 3. Cria Message object
       │                                      │ 4. Salva em localStorage
       │                                      │ 5. Atualiza UI
       │                                      │
       │                                      │ 6. playMessageNotification()
       │                                      │    ↓
       │                                      │ 7. Cria AudioContext
       │                                      │ 8. Cria Oscillator (440Hz)
       │                                      │ 9. Configura Gain (fade)
       │                                      │ 10. Reproduz som (0.3s)
       │                                      │ [🔔 440Hz beep]
       │                                      │
       │                                      │ 11. Fecha AudioContext
       │                                      │
       ▼                                      ▼
   Mensagem enviada                     Mensagem recebida + Som
```

## Especificações de Áudio

### Parâmetros do Oscilador

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| Frequência | 440 Hz | Nota Lá (A4) - padrão de afinação |
| Tipo de onda | sine | Onda senoidal (som puro) |
| Duração total | 0.3s | Som curto e discreto |

### Envelope de Ganho

| Fase | Tempo | Ganho | Descrição |
|------|-------|-------|-----------|
| Início | 0s | 0.0 | Silêncio inicial |
| Fade In | 0.05s | 0.2 | Ataque rápido |
| Fade Out | 0.3s | 0.0 | Decaimento suave |

### Diagrama de Envelope

```
Ganho
0.2 │     ╱╲
    │    ╱  ╲
    │   ╱    ╲___
0.0 │__╱         ╲___
    └─────────────────> Tempo
    0s  0.05s    0.3s
```

## Comparação com Outros Sons

| Som | Frequência | Duração | Repetição | Uso |
|-----|------------|---------|-----------|-----|
| **Mensagem** | 440Hz | 0.3s | Uma vez | Mensagem recebida |
| Chamada Recebida | 800Hz | 0.5s | 5x (1s intervalo) | Chamada recebida |
| Chamada Saindo | 600Hz + 700Hz | 0.4s cada | Contínuo (2s intervalo) | Chamando |

## Tratamento de Erros

### Erro ao Criar AudioContext

**Causa:** Navegador não suporta Web Audio API

**Tratamento:**
```typescript
try {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  // ... reproduzir som
} catch (error) {
  console.error('[Notificações] Erro ao tocar som de mensagem:', error);
  // Falha silenciosa - não bloqueia funcionalidade
}
```

### Autoplay Bloqueado

**Causa:** Política de autoplay do navegador

**Comportamento:**
- Som pode não tocar na primeira mensagem
- Após interação do usuário, funciona normalmente
- Não exibe erro para o usuário

## Testes

### Teste 1: Som ao Receber Mensagem de Texto
1. Usuário A conecta com Usuário B
2. Usuário A envia mensagem de texto
3. ✅ Verificar: Usuário B ouve som de 440Hz
4. ✅ Verificar: Som dura aproximadamente 0.3s
5. ✅ Verificar: Mensagem aparece no chat

### Teste 2: Som ao Receber Mensagem de Áudio
1. Usuário A conecta com Usuário B
2. Usuário A envia mensagem de áudio
3. ✅ Verificar: Usuário B ouve som de 440Hz
4. ✅ Verificar: Mensagem de áudio aparece no chat
5. ✅ Verificar: Som de notificação é diferente do áudio da mensagem

### Teste 3: Sem Som ao Enviar Mensagem
1. Usuário A envia mensagem
2. ✅ Verificar: Usuário A NÃO ouve som de notificação
3. ✅ Verificar: Apenas mensagens recebidas tocam som

### Teste 4: Múltiplas Mensagens Seguidas
1. Usuário A envia 3 mensagens rapidamente
2. ✅ Verificar: Usuário B ouve 3 sons de notificação
3. ✅ Verificar: Sons não se sobrepõem (cada um completa)

### Teste 5: Som Durante Chamada de Voz
1. Usuário A e B estão em chamada de voz ativa
2. Usuário A envia mensagem de texto
3. ✅ Verificar: Usuário B ouve som de notificação
4. ✅ Verificar: Som não interfere com áudio da chamada

### Teste 6: Navegadores Diferentes
1. Testar em Chrome
2. ✅ Verificar: Som funciona
3. Testar em Firefox
4. ✅ Verificar: Som funciona
5. Testar em Safari
6. ✅ Verificar: Som funciona (com webkitAudioContext)

## Melhorias Futuras

### Curto Prazo
- [ ] Opção para silenciar notificações
- [ ] Ajuste de volume nas configurações
- [ ] Sons diferentes para texto vs áudio

### Médio Prazo
- [ ] Escolha de tom de notificação (Dó, Ré, Mi, etc.)
- [ ] Upload de som personalizado
- [ ] Vibração em dispositivos móveis

### Longo Prazo
- [ ] Sons diferentes por contato
- [ ] Tema sonoro (conjunto de sons)
- [ ] Notificação sonora para eventos (conexão, desconexão)

## Notas Técnicas

### Por que 440Hz?

440Hz é a frequência padrão da nota Lá (A4) na afinação moderna. É uma frequência:
- **Reconhecível:** Amplamente usada como referência musical
- **Agradável:** Tom médio, nem muito agudo nem muito grave
- **Não intrusiva:** Volume baixo (20%) para não incomodar

### Web Audio API

A implementação usa Web Audio API por:
- **Controle preciso:** Frequência, duração, envelope exatos
- **Baixa latência:** Som reproduz instantaneamente
- **Sem arquivos:** Não precisa carregar MP3/WAV
- **Leve:** Não consome banda ou armazenamento

### Compatibilidade

| Navegador | Suporte | Observação |
|-----------|---------|------------|
| Chrome | ✅ | AudioContext nativo |
| Firefox | ✅ | AudioContext nativo |
| Safari | ✅ | Requer webkitAudioContext |
| Edge | ✅ | AudioContext nativo |
| Opera | ✅ | AudioContext nativo |

## Arquivos Modificados

1. **src/lib/notifications.ts**
   - Adicionado método `playMessageNotification()`
   - Configuração de oscilador 440Hz
   - Envelope de ganho com fade in/out

2. **src/hooks/use-webrtc.ts**
   - Importado `NotificationManager`
   - Chamada de `playMessageNotification()` em `handleMessage()`
   - Chamada de `playMessageNotification()` em `handleAudioMessage()`

---

**Status:** ✅ Implementado e funcional  
**Versão:** 1.0  
**Data:** 2026-01-16  
**Lint:** ✅ Passou sem erros
