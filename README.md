# GAAG Chat - Aplicativo de Comunicação Descentralizada

## 📱 Visão Geral

Aplicativo de comunicação peer-to-peer baseado em WebRTC que permite conversas privadas e descentralizadas entre usuários, sem armazenamento em nuvem ou servidores intermediários.

## ✨ Características Principais

- **100% Privado**: Comunicação direta entre dispositivos via WebRTC
- **Sem Servidor**: Nenhum dado de mensagem passa ou é armazenado em servidores
- **Criptografia Ponta-a-Ponta**: Nativa do WebRTC
- **Armazenamento Local**: Mensagens salvas apenas no dispositivo
- **Sem Login**: Não requer cadastro, e-mail ou telefone
- **Dark Mode**: Interface escura focada em privacidade
- **QR Code**: Conexão fácil via QR Code ou código manual
- **📱 PWA (Instalável)**: Instale como aplicativo no seu dispositivo
- **💾 Contatos Salvos**: Salve conexões para reconectar rapidamente
- **✏️ Renomear Contatos**: Personalize nomes dos seus contatos
- **🔄 Reconexão Rápida**: Acesse conversas anteriores com um clique
- **📞 Chamadas de Voz**: Chamadas P2P com áudio criptografado
- **🔔 Notificações com Som**: Receba alertas sonoros de reconexões, mensagens e chamadas

## 🚀 Como Usar

### 📲 Instalar o Aplicativo (Recomendado)

O GAAG Chat é um PWA (Progressive Web App) e pode ser instalado no seu dispositivo:

**Android/Chrome:**
1. Abra o GAAG Chat no navegador
2. Toque no banner "Instalar GAAG Chat" ou
3. Menu (⋮) → "Instalar aplicativo"

**iOS/Safari:**
1. Abra no Safari
2. Toque em Compartilhar (□↑)
3. "Adicionar à Tela de Início"

**Desktop:**
1. Clique no ícone de instalação (⊕) na barra de endereço
2. Ou Menu → "Instalar GAAG Chat"

### Iniciar uma Conexão (Usuário A)

1. Acesse a página inicial
2. Clique em "Gerar Código de Conexão"
3. Compartilhe o QR Code ou código gerado com o Usuário B
4. Aguarde o Usuário B processar e enviar o código de resposta
5. Cole o código de resposta recebido
6. Clique em "Conectar e Iniciar Chat"

### Aceitar uma Conexão (Usuário B)

1. Acesse a página inicial
2. Vá para a aba "Aceitar Conexão"
3. Cole o código recebido do Usuário A
4. Clique em "Aceitar Conexão"
5. Copie o código de resposta gerado
6. Envie o código de resposta para o Usuário A
7. Aguarde a conexão ser estabelecida (redirecionamento automático)

### Durante o Chat

- **Enviar Mensagens**: Digite e pressione Enter ou clique no botão enviar
- **Indicador de Digitação**: Veja quando o outro usuário está digitando
- **Status de Conexão**: Monitore o estado da conexão no topo
- **Chamada de Voz**: Clique no ícone de telefone (📞) para iniciar chamada
- **Salvar Contato**: Menu (⋮) → "Salvar Contato" para reconexão futura
- **Renomear**: Menu (⋮) → "Renomear" para personalizar o nome
- **Exportar Dados**: Menu (⋮) → "Exportar Dados" para backup
- **Desconectar**: Encerre a conexão quando desejar

### Chamadas de Voz

**Iniciar Chamada:**
1. Certifique-se de estar conectado com o contato
2. Clique no ícone de telefone (📞) no cabeçalho
3. Aguarde o contato aceitar a chamada
4. Comece a conversar quando conectado

**Receber Chamada:**
1. Você receberá notificação com som de toque
2. Clique em "Atender" para aceitar
3. Ou clique em "Recusar" para rejeitar

**Durante a Chamada:**
- **Mutar/Desmutar**: Clique no ícone de microfone
- **Encerrar**: Clique no botão vermelho de telefone
- **Duração**: Visualize o tempo de chamada em tempo real

**Requisitos:**
- Permissão de acesso ao microfone
- Conexão WebRTC estabelecida
- Ambos os usuários online

### Reconectar com Contatos Salvos

1. Na página inicial, veja a lista de "Contatos Salvos"
2. Clique em "Conectar" no contato desejado
3. O histórico de mensagens será restaurado automaticamente
4. Você receberá uma notificação com som confirmando a reconexão

### Notificações

**Ativar Notificações:**
1. Clique no botão de sino (🔔) no header
2. Permita notificações quando solicitado
3. Teste a notificação para confirmar

**Você será notificado quando:**
- Reconectar com um contato salvo (visual + som)
- Receber uma nova mensagem (sempre som, visual sempre em mobile, apenas em background no desktop)
- Enviar uma mensagem (som sempre, visual apenas em mobile)
- Receber uma chamada de voz (visual + som de toque)
- Conexão WebRTC for estabelecida com sucesso (visual + som)

**Todas as notificações incluem som!**

**Diferenças Mobile vs Desktop:**
- **Mobile:** Notificações sempre aparecem, mesmo com app aberto
- **Desktop:** Notificações apenas quando app em segundo plano

## 🔧 Tecnologias

- **React + TypeScript**: Framework e tipagem
- **WebRTC**: Comunicação peer-to-peer
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes de UI
- **localStorage**: Persistência local
- **QRCode.js**: Geração de QR Codes
- **PWA**: Service Worker + Manifest para instalação
- **Vite**: Build tool e dev server
- **Notifications API**: Notificações do navegador
- **Web Audio API**: Geração de sons de notificação

## 📋 Limitações

- **Ambos Online**: Usuários devem estar online simultaneamente
- **Sem Fila**: Mensagens não são entregues se o destinatário estiver offline
- **NAT/Firewall**: Pode requerer configuração de rede em alguns casos
- **Sem Histórico na Nuvem**: Mensagens existem apenas nos dispositivos

## 🔐 Privacidade

- Nenhum dado pessoal é coletado
- Nenhuma mensagem é armazenada em servidores
- Comunicação criptografada ponta-a-ponta
- Controle total sobre seus dados
- Backup manual opcional

## 📦 Estrutura do Projeto

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx      # Interface principal do chat
│   │   ├── MessageBubble.tsx      # Bolhas de mensagem
│   │   └── SaveContactDialog.tsx  # Dialog para salvar/renomear
│   ├── connection/
│   │   ├── QRCodeGenerator.tsx    # Gerador de código de conexão
│   │   ├── OfferAcceptor.tsx      # Aceitador de conexão
│   │   └── SavedContactsList.tsx  # Lista de contatos salvos
│   ├── notifications/
│   │   └── NotificationPermissionPrompt.tsx  # Prompt de permissão
│   └── pwa/
│       └── InstallPrompt.tsx      # Prompt de instalação PWA
├── hooks/
│   └── use-webrtc.ts              # Hook de gerenciamento WebRTC
├── lib/
│   ├── webrtc.ts                  # Gerenciador WebRTC
│   ├── storage.ts                 # Gerenciador de armazenamento local
│   └── notifications.ts           # Gerenciador de notificações
├── pages/
│   ├── Home.tsx                   # Página inicial
│   └── Chat.tsx                   # Página de chat
└── types/
    └── types.ts                   # Definições de tipos
public/
├── manifest.json                  # Manifest PWA
└── sw.js                          # Service Worker
```

## 🎨 Design

- **Cores**: Tema escuro com roxo (#8B5CF6) como cor primária
- **Tipografia**: Sistema de fontes padrão
- **Layout**: Responsivo para desktop e mobile
- **Componentes**: shadcn/ui para consistência

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Lint
npm run lint
```

## 📚 Documentação Adicional

- **[PWA_GUIDE.md](./PWA_GUIDE.md)**: Guia completo sobre PWA e instalação
- **[CONTACT_MANAGEMENT.md](./CONTACT_MANAGEMENT.md)**: Sistema de gerenciamento de contatos
- **[RECONNECTION_GUIDE.md](./RECONNECTION_GUIDE.md)**: Reconexão automática com credenciais salvas
- **[VOICE_CALL_GUIDE.md](./VOICE_CALL_GUIDE.md)**: Chamadas de voz P2P com WebRTC
- **[NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md)**: Sistema de notificações com som
- **[MOBILE_NOTIFICATIONS.md](./MOBILE_NOTIFICATIONS.md)**: Notificações otimizadas para mobile

---

## 👨‍💻 Créditos

**Projeto Visionado Por:**  
Julio Cesar Campos Machado - Programador Full Stack  
🔗 [likelook.wixsite.com/solutions](https://likelook.wixsite.com/solutions)

**like look solutions**

---

## Project Directory

```
├── README.md # Documentation
├── components.json # Component library configuration
├── index.html # Entry file
├── package.json # Package management
├── postcss.config.js # PostCSS configuration
├── public # Static resources directory
│   ├── favicon.png # Icon
│   └── images # Image resources
├── src # Source code directory
│   ├── App.tsx # Entry file
│   ├── components # Components directory
│   ├── context # Context directory
│   ├── hooks # Common hooks directory
│   ├── index.css # Global styles
│   ├── lib # Utility library directory
│   ├── main.tsx # Entry file
│   ├── routes.tsx # Routing configuration
│   ├── pages # Pages directory
│   ├── types # Type definitions directory
├── tsconfig.app.json # TypeScript frontend configuration file
├── tsconfig.json # TypeScript configuration file
├── tsconfig.node.json # TypeScript Node.js configuration file
└── vite.config.ts # Vite configuration file
```

## Tech Stack

Vite, TypeScript, React, WebRTC, Tailwind CSS, shadcn/ui

## Development Guidelines

### Environment Requirements

```
# Node.js ≥ 20
# npm ≥ 10
Example:
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

### After installation, follow these steps:

```
# Step 1: Download the code package
# Step 2: Extract the code package
# Step 3: Open the code package with your IDE and navigate into the code directory
# Step 4: In the IDE terminal, run the command to install dependencies: npm i
# Step 5: In the IDE terminal, run the command to start the development server: npm run dev -- --host 127.0.0.1
# Step 6: if step 5 failed, try this command to start the development server: npx vite --host 127.0.0.1
```

## 📄 Licença

© 2026 GAAG Chat - Privacidade e segurança em primeiro lugar
