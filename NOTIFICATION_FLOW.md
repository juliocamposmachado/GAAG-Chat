# Fluxo de Notificações - GAAG Chat

## Resumo Rápido

Este documento descreve o comportamento completo do sistema de notificações do GAAG Chat.

## Eventos que Geram Notificações

### 1. Reconexão com Contato Salvo
**Trigger:** Usuário clica em "Conectar" na lista de contatos salvos

**Comportamento:**
- ✅ Som: Dois bipes (800Hz + 1000Hz)
- ✅ Notificação Visual: "Reconectado! Você está conectado com [Nome]"
- ✅ Sempre notifica (independente do foco da janela)

**Código:**
```typescript
NotificationManager.notifyReconnection(contactName);
```

---

### 2. Conexão WebRTC Estabelecida
**Trigger:** Conexão P2P é estabelecida com sucesso

**Comportamento:**
- ✅ Som: Dois bipes
- ✅ Notificação Visual: "Conexão Estabelecida! Agora você está conectado com [Nome]"
- ✅ Sempre notifica (independente do foco da janela)

**Código:**
```typescript
NotificationManager.notifyConnectionEstablished(contactName);
```

---

### 3. Mensagem Recebida
**Trigger:** Peer envia uma mensagem

**Comportamento:**
- ✅ Som: **SEMPRE** toca (dois bipes)
- ⚠️ Notificação Visual: **APENAS** se janela não estiver em foco
  - Título: "Nova mensagem de [Nome]"
  - Corpo: Prévia da mensagem (até 50 caracteres)

**Código:**
```typescript
if (lastMessage.sender === 'peer') {
  // Som sempre toca
  NotificationManager.playMessageSound();
  
  // Notificação visual apenas em background
  if (!document.hasFocus()) {
    NotificationManager.notifyNewMessage(contactName, lastMessage.text);
  }
}
```

**Razão:** 
- Som fornece feedback imediato mesmo quando usuário está digitando
- Notificação visual evitada quando usuário já está vendo a conversa

---

### 4. Mensagem Enviada
**Trigger:** Usuário envia uma mensagem

**Comportamento:**
- ✅ Som: **SEMPRE** toca (dois bipes)
- ❌ Notificação Visual: **NÃO** exibe
- 💡 Propósito: Feedback sonoro de confirmação de envio

**Código:**
```typescript
if (lastMessage.sender === 'me') {
  // Som de confirmação
  NotificationManager.playMessageSound();
}
```

**Razão:**
- Feedback auditivo confirma que mensagem foi enviada
- Usuário não precisa de notificação visual (ele mesmo enviou)

---

## Tabela Resumo

| Evento | Som | Notificação Visual | Condição |
|--------|-----|-------------------|----------|
| Reconexão | ✅ Sempre | ✅ Sempre | - |
| Conexão Estabelecida | ✅ Sempre | ✅ Sempre | - |
| Mensagem Recebida | ✅ Sempre | ⚠️ Apenas em background | `!document.hasFocus()` |
| Mensagem Enviada | ✅ Sempre | ❌ Nunca | - |

---

## Características do Som

**Tecnologia:** Web Audio API

**Especificações:**
- **Tipo:** Dois bipes sequenciais
- **Frequências:** 800Hz (primeiro) + 1000Hz (segundo)
- **Duração:** 0.3 segundos cada
- **Intervalo:** 150ms entre bipes
- **Volume:** 30% (0.3)
- **Forma de Onda:** Senoidal (sine)
- **Envelope:** Fade in/out suave

**Código:**
```typescript
// Primeiro bipe
oscillator.frequency.value = 800;
gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);
gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.3);

// Segundo bipe (após 150ms)
oscillator2.frequency.value = 1000;
```

---

## Permissões

### Solicitação Automática
- Ao entrar na página de chat
- Ao reconectar com contato salvo

### Solicitação Manual
- Botão de sino (🔔) no header da página inicial
- Dialog explicativo com lista de benefícios
- Botão de teste de notificação

### Estados
- `default`: Não solicitado
- `granted`: Permissão concedida ✅
- `denied`: Permissão negada ❌

---

## Experiência do Usuário

### Cenário 1: Usuário Ativo no Chat
**Situação:** Janela em foco, conversando ativamente

**Comportamento:**
- Recebe mensagem → Som toca ✅
- Envia mensagem → Som toca ✅
- Notificações visuais → Não aparecem ❌

**Razão:** Usuário já está vendo a conversa, não precisa de notificação visual

---

### Cenário 2: Usuário em Outra Aba
**Situação:** GAAG Chat aberto mas em aba de background

**Comportamento:**
- Recebe mensagem → Som toca ✅ + Notificação visual ✅
- Envia mensagem → Som toca ✅ (se voltar e enviar)

**Razão:** Notificação visual alerta usuário para voltar ao chat

---

### Cenário 3: Usuário Reconectando
**Situação:** Clica em "Conectar" em contato salvo

**Comportamento:**
- Som toca ✅
- Notificação visual aparece ✅
- Redireciona para chat

**Razão:** Confirma ação importante do usuário

---

## Compatibilidade

### Desktop
- ✅ Chrome/Edge: Som + Notificações funcionam perfeitamente
- ✅ Firefox: Som + Notificações funcionam perfeitamente
- ✅ Safari: Som + Notificações funcionam perfeitamente

### Mobile
- ✅ Android Chrome: Som + Notificações funcionam
- ⚠️ iOS Safari: Requer PWA instalado para notificações
- ✅ Android Firefox: Som + Notificações funcionam

### PWA Instalado
- ✅ Todas as plataformas: Funcionalidade completa
- ✅ Notificações persistem mesmo com app fechado (se suportado pelo SO)

---

## Troubleshooting

### Som não toca
1. Verificar volume do dispositivo
2. Verificar modo silencioso
3. Verificar permissão de autoplay do navegador
4. Testar: `NotificationManager.playMessageSound()`

### Notificação não aparece
1. Verificar permissão: `Notification.permission`
2. Verificar suporte: `'Notification' in window`
3. Verificar configurações do sistema operacional
4. Testar: `NotificationManager.notify('Teste', { body: 'Teste' })`

### Som toca demais
- Comportamento esperado: Som toca em TODAS as mensagens
- Para desativar: Modificar código ou adicionar configuração de usuário

---

## Melhorias Futuras

### Configurações de Usuário
- [ ] Ativar/desativar som para mensagens enviadas
- [ ] Ativar/desativar som para mensagens recebidas
- [ ] Ajustar volume do som
- [ ] Escolher tipo de som (bipe, sino, etc.)

### Notificações Avançadas
- [ ] Botões de ação nas notificações
- [ ] Resposta rápida via notificação
- [ ] Agrupamento de múltiplas mensagens
- [ ] Modo "Não Perturbe" com horários

### Acessibilidade
- [ ] Opção de vibração (mobile)
- [ ] Feedback visual alternativo ao som
- [ ] Configuração de contraste para notificações

---

## Referências

- [Notifications API - MDN](https://developer.mozilla.org/pt-BR/docs/Web/API/Notifications_API)
- [Web Audio API - MDN](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Audio_API)
- [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md) - Documentação completa
