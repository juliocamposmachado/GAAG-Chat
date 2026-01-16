# P2P Chat - Aplicativo de Comunicação Descentralizada

## 📱 Visão Geral

Aplicativo de comunicação peer-to-peer (P2P) baseado em WebRTC que permite conversas privadas e descentralizadas entre usuários, sem armazenamento em nuvem ou servidores intermediários.

## ✨ Características Principais

- **100% Privado**: Comunicação direta entre dispositivos via WebRTC
- **Sem Servidor**: Nenhum dado de mensagem passa ou é armazenado em servidores
- **Criptografia Ponta-a-Ponta**: Nativa do WebRTC
- **Armazenamento Local**: Mensagens salvas apenas no dispositivo
- **Sem Login**: Não requer cadastro, e-mail ou telefone
- **Dark Mode**: Interface escura focada em privacidade
- **QR Code**: Conexão fácil via QR Code ou código manual

## 🚀 Como Usar

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
7. Clique em "Ir para o Chat"

### Durante o Chat

- **Enviar Mensagens**: Digite e pressione Enter ou clique no botão enviar
- **Indicador de Digitação**: Veja quando o outro usuário está digitando
- **Status de Conexão**: Monitore o estado da conexão no topo
- **Exportar Dados**: Faça backup das conversas localmente
- **Desconectar**: Encerre a conexão quando desejar

## 🔧 Tecnologias

- **React + TypeScript**: Framework e tipagem
- **WebRTC**: Comunicação P2P
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes de UI
- **localStorage**: Persistência local
- **QRCode.js**: Geração de QR Codes

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
│   │   └── MessageBubble.tsx      # Bolhas de mensagem
│   └── connection/
│       ├── QRCodeGenerator.tsx    # Gerador de código de conexão
│       └── OfferAcceptor.tsx      # Aceitador de conexão
├── hooks/
│   └── use-webrtc.ts              # Hook de gerenciamento WebRTC
├── lib/
│   ├── webrtc.ts                  # Gerenciador WebRTC
│   └── storage.ts                 # Gerenciador de armazenamento local
├── pages/
│   ├── Home.tsx                   # Página inicial
│   └── Chat.tsx                   # Página de chat
└── types/
    └── types.ts                   # Definições de tipos
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

© 2026 P2P Chat - Privacidade e segurança em primeiro lugar
