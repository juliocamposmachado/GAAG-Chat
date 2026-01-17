# Som de Chamada Saindo - GAAG Chat

## Resumo

Implementado som de toque contínuo quando o usuário inicia uma chamada de voz (caller side). O som é diferente do toque de chamada recebida para distinguir entre "chamando" e "recebendo chamada".

## Funcionalidade

### Som de Chamada Saindo (Outgoing Call Ringtone)

**Quando toca:**
- Usuário clica no botão de telefone para iniciar chamada
- Estado da chamada muda para 'calling'
- Som toca continuamente até:
  - Peer aceitar a chamada (callState → 'active')
  - Peer rejeitar a chamada (callState → 'ended')
  - Usuário cancelar a chamada
  - Componente ser desmontado

**Características do som:**
- **Frequências**: 600 Hz + 700 Hz (dois tons sequenciais)
- **Duração**: 0.4s por tom
- **Intervalo entre tons**: 450ms
- **Repetição**: A cada 2 segundos
- **Tipo**: Contínuo (não para automaticamente)

**Diferença do som de chamada recebida:**
- Chamada recebida: 800 Hz, 5 toques máximo, para automaticamente
- Chamada saindo: 600 Hz + 700 Hz, contínuo, para quando chamada conecta/encerra

## Implementação

### 1. NotificationManager (src/lib/notifications.ts)

**Propriedades adicionadas:**
```typescript
private static outgoingCallInterval: number | null = null;
private static audioContext: AudioContext | null = null;
```

**Método: playOutgoingCallRingtone()**
```typescript
static playOutgoingCallRingtone(): void {
  // Parar qualquer toque anterior
  this.stopOutgoingCallRingtone();

  // Criar AudioContext
  this.audioContext = new AudioContext();
  
  const playRing = () => {
    // Primeiro tom: 600 Hz
    const oscillator = this.audioContext.createOscillator();
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    // ... configuração de ganho e reprodução
    
    // Segundo tom: 700 Hz (após 450ms)
    setTimeout(() => {
      const oscillator2 = this.audioContext.createOscillator();
      oscillator2.frequency.value = 700;
      // ... configuração de ganho e reprodução
    }, 450);
  };
  
  // Tocar imediatamente
  playRing();
  
  // Repetir a cada 2 segundos
  this.outgoingCallInterval = window.setInterval(playRing, 2000);
}
```

**Método: stopOutgoingCallRingtone()**
```typescript
static stopOutgoingCallRingtone(): void {
  // Limpar interval
  if (this.outgoingCallInterval !== null) {
    clearInterval(this.outgoingCallInterval);
    this.outgoingCallInterval = null;
  }
  
  // Fechar AudioContext
  if (this.audioContext) {
    this.audioContext.close();
    this.audioContext = null;
  }
}
```

---

### 2. Chat.tsx (src/pages/Chat.tsx)

**useEffect adicionado:**
```typescript
// Tocar som quando iniciar chamada (calling)
useEffect(() => {
  if (callState === 'calling') {
    // Tocar som de chamada saindo
    NotificationManager.playOutgoingCallRingtone();
  } else if (callState === 'active' || callState === 'ended' || callState === 'idle') {
    // Parar som quando chamada for aceita, encerrada ou voltar ao idle
    NotificationManager.stopOutgoingCallRingtone();
  }

  // Cleanup: parar som ao desmontar componente
  return () => {
    NotificationManager.stopOutgoingCallRingtone();
  };
}, [callState]);
```

**Fluxo:**
1. `callState` muda para 'calling' → `playOutgoingCallRingtone()` é chamado
2. Som começa a tocar continuamente
3. `callState` muda para 'active' ou 'ended' → `stopOutgoingCallRingtone()` é chamado
4. Som para imediatamente

---

## Fluxo Completo

### Cenário: Usuário A chama Usuário B

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE SOM DE CHAMADA SAINDO                 │
└─────────────────────────────────────────────────────────────┘

Usuário A (Caller)                    Usuário B (Callee)
       │                                      │
       │ 1. Clica "Chamar"                    │
       │ 2. callState → 'calling'             │
       │ 3. playOutgoingCallRingtone()        │
       │                                      │
       │ [🔊 600Hz + 700Hz tocando...]        │
       │                                      │
       │────── call-request ──────────────────>
       │                                      │
       │ [🔊 Som continua tocando...]         │ 4. Recebe chamada
       │                                      │ 5. Toca ringtone (800Hz)
       │                                      │
       │                                      │ 6. Clica "Atender"
       │<───── call-accept ────────────────────
       │                                      │
       │ 7. callState → 'active'              │
       │ 8. stopOutgoingCallRingtone()        │
       │ [🔇 Som para]                        │
       │                                      │
       │<══════ Audio Stream ═════════════════>
       │                                      │
       │ Chamada ativa                        │ Chamada ativa
```

---

## Testes

### Teste 1: Som toca ao iniciar chamada
1. Conectar com um contato
2. Clicar no botão de telefone
3. ✅ Verificar: Som de dois tons (600Hz + 700Hz) começa a tocar
4. ✅ Verificar: Som repete a cada 2 segundos

### Teste 2: Som para quando chamada é aceita
1. Usuário A chama Usuário B
2. Som está tocando no lado do Usuário A
3. Usuário B aceita a chamada
4. ✅ Verificar: Som para imediatamente no lado do Usuário A
5. ✅ Verificar: Chamada ativa sem som de toque

### Teste 3: Som para quando chamada é rejeitada
1. Usuário A chama Usuário B
2. Som está tocando no lado do Usuário A
3. Usuário B rejeita a chamada
4. ✅ Verificar: Som para imediatamente no lado do Usuário A
5. ✅ Verificar: Estado volta para 'idle'

### Teste 4: Som para ao desmontar componente
1. Usuário A chama Usuário B
2. Som está tocando
3. Usuário A navega para outra página (desconecta)
4. ✅ Verificar: Som para imediatamente
5. ✅ Verificar: Sem vazamento de memória (AudioContext fechado)

### Teste 5: Múltiplas chamadas
1. Usuário A chama Usuário B
2. Som está tocando
3. Usuário A cancela e chama novamente
4. ✅ Verificar: Som anterior para
5. ✅ Verificar: Novo som começa a tocar
6. ✅ Verificar: Apenas um som tocando por vez

---

## Troubleshooting

### Som não toca ao iniciar chamada

**Causas:**
- AudioContext bloqueado pelo navegador (requer interação do usuário)
- Permissão de áudio negada
- callState não mudou para 'calling'

**Solução:**
1. Verificar console para erros
2. Verificar se callState === 'calling'
3. Tentar em navegador diferente
4. Verificar se há interação do usuário antes (clique no botão)

---

### Som continua tocando após aceitar chamada

**Causas:**
- callState não mudou para 'active'
- stopOutgoingCallRingtone() não foi chamado
- Interval não foi limpo

**Solução:**
1. Verificar console: callState deve ser 'active'
2. Verificar se useEffect está sendo executado
3. Recarregar página
4. Verificar se há erros no console

---

### Som toca múltiplas vezes simultaneamente

**Causas:**
- playOutgoingCallRingtone() chamado múltiplas vezes
- Interval anterior não foi limpo
- Múltiplos AudioContexts criados

**Solução:**
1. stopOutgoingCallRingtone() sempre chama clearInterval
2. Verificar se useEffect tem cleanup correto
3. Recarregar página para limpar estado

---

## Melhorias Futuras

### Curto Prazo
- [ ] Permitir usuário ajustar volume do toque
- [ ] Adicionar opção para silenciar toque
- [ ] Vibração em dispositivos móveis

### Médio Prazo
- [ ] Toques personalizáveis (escolher frequências)
- [ ] Diferentes toques para diferentes contatos
- [ ] Fade in/fade out suave

### Longo Prazo
- [ ] Upload de arquivo de áudio personalizado
- [ ] Biblioteca de toques pré-definidos
- [ ] Sincronização de preferências entre dispositivos

---

## Arquivos Modificados

1. **src/lib/notifications.ts**
   - Adicionado `outgoingCallInterval` e `audioContext`
   - Adicionado `playOutgoingCallRingtone()`
   - Adicionado `stopOutgoingCallRingtone()`

2. **src/pages/Chat.tsx**
   - Adicionado useEffect para controlar som baseado em callState
   - Cleanup automático ao desmontar

3. **VOICE_CALL_GUIDE.md**
   - Atualizado com informações sobre som de chamada saindo
   - Adicionado troubleshooting

4. **VOICE_CALL_IMPLEMENTATION.md**
   - Atualizado fluxos técnicos
   - Adicionado detalhes sobre ringtones

---

**Status:** ✅ Implementado e funcional  
**Versão:** 1.1  
**Data:** 2026-01-16  
**Lint:** ✅ Passou sem erros
