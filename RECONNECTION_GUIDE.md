# Guia de Reconexão Automática - GAAG Chat

## Visão Geral

O GAAG Chat implementa reconexão automática usando as credenciais WebRTC salvas da conexão original. Quando você clica em "Conectar" em um contato salvo, o sistema automaticamente restabelece a conexão P2P sem necessidade de trocar códigos novamente.

## Como Funciona

### Salvamento de Credenciais

Quando uma conexão WebRTC é estabelecida pela primeira vez:

1. **Usuário Iniciador (cria a oferta):**
   - Gera código de oferta (SDP offer)
   - Recebe código de resposta do peer
   - Sistema salva: `offerCode` e `answerCode`
   - Papel salvo: `initiator`

2. **Usuário Receptor (aceita a oferta):**
   - Recebe código de oferta do peer
   - Gera código de resposta (SDP answer)
   - Sistema salva: `offerCode` e `answerCode`
   - Papel salvo: `receiver`

### Fluxo de Reconexão

#### Passo 1: Usuário Clica em "Conectar"

```typescript
// Home.tsx
const handleSelectSavedContact = async (contact: SavedContact) => {
  // Carrega credenciais salvas
  navigate('/chat', { 
    state: { 
      reconnect: true,
      savedContact: contact  // Inclui offerCode, answerCode, myRole
    } 
  });
};
```

#### Passo 2: Sistema Detecta Reconexão

```typescript
// Chat.tsx
useEffect(() => {
  const state = location.state as { reconnect?: boolean; savedContact?: SavedContact };
  
  if (state?.reconnect && state?.savedContact) {
    // Iniciar reconexão automática
    reconnect();
  }
}, [location.state]);
```

#### Passo 3: Reconexão Baseada no Papel

**Se você foi o Iniciador:**
```typescript
if (savedContact.myRole === 'initiator' && savedContact.answerCode) {
  // Aceitar resposta salva
  await acceptAnswer(savedContact.answerCode);
  // Conexão restabelecida!
}
```

**Se você foi o Receptor:**
```typescript
if (savedContact.myRole === 'receiver' && savedContact.offerCode) {
  // Aceitar oferta salva e gerar nova resposta
  const answer = await acceptOffer(savedContact.offerCode);
  
  // Atualizar resposta salva
  StorageManager.updateSavedContactAnswer(savedContact.id, answer);
  // Conexão restabelecida!
}
```

#### Passo 4: Histórico Restaurado

- Todas as mensagens anteriores são carregadas do localStorage
- Interface de chat é exibida com histórico completo
- Usuário pode continuar conversando de onde parou

## Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    PRIMEIRA CONEXÃO                         │
└─────────────────────────────────────────────────────────────┘

Usuário A (Iniciador)              Usuário B (Receptor)
       │                                    │
       │ 1. Gera Oferta                     │
       │────────────────────────────────────>
       │                                    │
       │                     2. Aceita Oferta
       │                     3. Gera Resposta
       │<────────────────────────────────────
       │                                    │
       │ 4. Aceita Resposta                 │
       │                                    │
       ▼                                    ▼
   Salva:                              Salva:
   - offerCode                         - offerCode
   - answerCode                        - answerCode
   - role: initiator                   - role: receiver


┌─────────────────────────────────────────────────────────────┐
│                      RECONEXÃO                              │
└─────────────────────────────────────────────────────────────┘

Usuário A (Iniciador)              Usuário B (Receptor)
       │                                    │
       │ 1. Clica "Conectar"                │
       │ 2. Carrega answerCode salvo        │
       │ 3. Aceita resposta                 │
       │                                    │
       │────────────────────────────────────>
       │         Conexão P2P                │
       │<────────────────────────────────────
       │                                    │
       │                     1. Clica "Conectar"
       │                     2. Carrega offerCode salvo
       │                     3. Aceita oferta
       │                     4. Gera nova resposta
       │                                    │
       ▼                                    ▼
   Conectado!                          Conectado!
   Histórico restaurado                Histórico restaurado
```

## Requisitos para Reconexão

### ✅ Necessário

1. **Ambos usuários online:**
   - WebRTC requer conexão P2P ativa
   - Não há servidor intermediário para armazenar mensagens

2. **Credenciais salvas:**
   - Pelo menos um dos códigos (offer ou answer)
   - Papel do usuário (initiator ou receiver)

3. **Navegadores compatíveis:**
   - Suporte a WebRTC
   - localStorage habilitado

### ❌ Não Necessário

1. **Trocar códigos novamente:**
   - Sistema reutiliza credenciais salvas
   - Reconexão é automática

2. **Servidor de sinalização:**
   - Apenas usado na primeira conexão
   - Reconexão usa códigos salvos localmente

## Casos de Uso

### Caso 1: Reconexão Bem-Sucedida

**Cenário:**
- Usuário A e B já conversaram antes
- Ambos salvaram o contato
- Ambos estão online

**Fluxo:**
1. Usuário A clica em "Conectar" no contato de B
2. Sistema aceita resposta salva automaticamente
3. Usuário B clica em "Conectar" no contato de A
4. Sistema aceita oferta salva e gera nova resposta
5. Conexão P2P estabelecida
6. Histórico de mensagens restaurado
7. Ambos podem conversar normalmente

**Resultado:** ✅ Sucesso

---

### Caso 2: Peer Offline

**Cenário:**
- Usuário A clica em "Conectar"
- Usuário B está offline

**Fluxo:**
1. Usuário A clica em "Conectar"
2. Sistema tenta aceitar resposta salva
3. Conexão P2P não é estabelecida (peer offline)
4. Estado permanece "connecting"

**Resultado:** ⚠️ Aguardando peer online

**Solução:** Aguardar peer ficar online e tentar novamente

---

### Caso 3: Credenciais Inválidas

**Cenário:**
- Credenciais salvas estão corrompidas
- Ou foram modificadas manualmente

**Fluxo:**
1. Usuário clica em "Conectar"
2. Sistema tenta usar credenciais salvas
3. Erro ao aceitar oferta/resposta
4. Toast de erro é exibido

**Resultado:** ❌ Erro

**Solução:** Criar nova conexão (trocar códigos novamente)

---

### Caso 4: Primeiro Usuário Reconecta

**Cenário:**
- Apenas um usuário clica em "Conectar"
- Outro usuário não iniciou reconexão

**Fluxo:**
1. Usuário A clica em "Conectar"
2. Sistema aceita resposta salva
3. Aguarda peer estabelecer conexão
4. Estado: "connecting"

**Resultado:** ⏳ Aguardando peer

**Solução:** Segundo usuário deve clicar em "Conectar" também

## Logs de Debug

### Console Logs Durante Reconexão

```javascript
// Início da reconexão
[Reconexão] Iniciando reconexão automática {
  role: 'initiator',
  hasOffer: true,
  hasAnswer: true
}

// Se Iniciador
[Reconexão] Aceitando resposta salva (initiator)

// Se Receptor
[Reconexão] Aceitando oferta salva (receiver)

// WebRTC
[WebRTC] Setting remote description (answer)
[WebRTC] Connection state: connecting
[WebRTC] Connection state: connected

// Sucesso
Toast: "Reconectado! Conexão restabelecida com [Nome]"
```

### Erros Comuns

```javascript
// Peer offline
[WebRTC] ICE connection state: failed
[WebRTC] Connection state: failed

// Credenciais inválidas
[Reconexão] Erro ao reconectar: DOMException: Failed to execute 'setRemoteDescription'

// Sem credenciais
[Reconexão] Erro: Credenciais não encontradas
```

## Troubleshooting

### Reconexão não funciona

**Problema:** Clico em "Conectar" mas nada acontece

**Verificar:**
1. Console do navegador tem erros?
2. Credenciais estão salvas? (localStorage → saved_contacts)
3. Outro usuário também clicou em "Conectar"?
4. Ambos estão online?

**Solução:**
- Verificar logs do console
- Tentar criar nova conexão
- Verificar conexão de internet

---

### Conexão fica em "connecting"

**Problema:** Estado permanece "connecting" indefinidamente

**Causas:**
- Peer está offline
- Firewall bloqueando conexão P2P
- NAT muito restritivo

**Solução:**
- Aguardar peer ficar online
- Verificar configurações de firewall
- Tentar em rede diferente

---

### Histórico não aparece

**Problema:** Conexão estabelecida mas mensagens antigas não aparecem

**Causas:**
- localStorage foi limpo
- Dados corrompidos
- ID do contato mudou

**Solução:**
- Verificar localStorage → chat_sessions
- Importar backup se disponível
- Histórico pode ter sido perdido

---

### Erro "Failed to execute 'setRemoteDescription'"

**Problema:** Erro ao aceitar oferta/resposta

**Causas:**
- Credenciais corrompidas
- Formato JSON inválido
- Códigos incompatíveis

**Solução:**
- Excluir contato salvo
- Criar nova conexão
- Trocar códigos novamente

## Segurança

### Criptografia

- **WebRTC nativo:** Criptografia DTLS-SRTP automática
- **Ponta-a-ponta:** Dados nunca passam por servidor
- **Credenciais locais:** Armazenadas apenas no dispositivo

### Privacidade

- **Sem rastreamento:** Nenhum dado enviado para servidor
- **Sem login:** Identidade baseada em códigos temporários
- **Sem backup externo:** Dados existem apenas localmente

### Limitações

- **Credenciais em texto claro:** localStorage não é criptografado
- **Sem proteção de dispositivo:** Acesso físico = acesso aos dados
- **Sem sincronização:** Trocar de dispositivo = perder contatos

## Melhorias Futuras

### Possíveis Implementações

1. **Criptografia de localStorage:**
   - Criptografar credenciais salvas
   - Senha mestra do usuário
   - Proteção contra acesso físico

2. **Sincronização P2P:**
   - Sincronizar contatos entre dispositivos
   - Usando WebRTC para transferência
   - Sem servidor intermediário

3. **Reconexão Automática:**
   - Detectar quando peer fica online
   - Tentar reconectar automaticamente
   - Notificar usuário quando conectado

4. **Backup Criptografado:**
   - Exportar dados criptografados
   - Importar em outro dispositivo
   - Senha para descriptografar

5. **QR Code para Reconexão:**
   - Gerar QR com credenciais
   - Escanear para reconectar
   - Mais rápido que digitar códigos

## Referências

- [WebRTC API - MDN](https://developer.mozilla.org/pt-BR/docs/Web/API/WebRTC_API)
- [RTCPeerConnection - MDN](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)
- [localStorage - MDN](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage)
- [CONTACT_MANAGEMENT.md](./CONTACT_MANAGEMENT.md) - Sistema de contatos
- [README.md](./README.md) - Documentação principal
