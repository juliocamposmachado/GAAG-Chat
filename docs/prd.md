# Aplicativo de Comunicação P2P WebRTC - Documento de Requisitos

## 1. Visão Geral do Aplicativo

### 1.1 Nome do Aplicativo
App de Comunicação P2P\n
### 1.2 Descrição do Aplicativo
Aplicativo de comunicação direta peer-to-peer (P2P) baseado em WebRTC, que permite comunicação descentralizada entre usuários sem armazenamento em nuvem ou banco de dados central. O sistema garante privacidade absoluta através de criptografia ponta-a-ponta e armazenamento exclusivamente local.

### 1.3 Objetivo
Criar um mensageiro privado, minimalista, seguro e descentralizado onde a comunicação ocorre diretamente entre dispositivos, sem intermediários, servidores de armazenamento ou rastreamento de dados.

## 2. Arquitetura Técnica

### 2.1 Modelo de Comunicação
- Comunicação peer-to-peer (P2P) direta entre dispositivos
- WebRTC (DataChannel + Audio + Video)
- Servidor de sinalização temporária apenas para iniciar conexão
- STUN público (Google STUN: stun:stun.l.google.com:19302)\n- TURN apenas se estritamente necessário
- Nenhum dado de mensagem trafega ou permanece em servidor

### 2.2 Armazenamento
- LocalStorage (web)
- IndexedDB (web)
- Storage local do app (mobile)
- Backup manual via exportação de JSON criptografado
- Importação local de backups
- Sem backup automático externo
- **Persistência de conexões estabelecidas no LocalStorage**
- **Salvamento de conversas com nome personalizado no LocalStorage**
- **Manutenção do vínculo entre usuários para futuras conversas**
- **Armazenamento de credenciais de conexão para reconexão**

### 2.3 Segurança
- Criptografia ponta-a-ponta obrigatória (nativa do WebRTC)
- Chaves geradas localmente\n- Sem login, e-mail, telefone ou rastreamento
- Identidade baseada em QR Code, código temporário ou link P2P
\n## 3. Funcionalidades Principais
\n### 3.1 Comunicação
- Mensagens de texto
- Mensagens de voz (opcional)
- Chamadas de áudio (opcional)
- Chamadas de vídeo (opcional)
- Indicador de digitando
- Confirmação de entrega local\n
### 3.2 Conexão entre Usuários
- Usuário A gera código/QR
- Usuário B escaneia ou digita código
- Estabelecimento de conexão direta\n- Canal permanece ativo enquanto ambos estiverem online\n- **Salvamento automático da conexão no LocalStorage após estabelecimento**
- **Reconexão automática com contatos salvos em futuras sessões**

### 3.3 Gestão de Conversas
- Lista de contatos diretos
- Conversas ativas
- Histórico de mensagens salvo localmente\n- **Nomeação personalizada de conversas pelo usuário**
- **Persistência de todas as conversas no LocalStorage**
- **Manutenção do histórico completo de cada conversa nomeada**
- Exportação/importação manual de dados

### 3.4 Persistência de Vínculos
- **Armazenamento de informações de conexão (peer ID, chaves de sessão) no LocalStorage**
- **Recuperação automática de conversas anteriores ao reabrir o aplicativo**\n- **Preservação do vínculo entre usuários mesmo após desconexão temporária**
- **Lista de conversas salvas acessível na interface principal**\n
### 3.5 Reconexão
- **Botão Reconectar disponível em cada conversa salva**
- **Utilização das credenciais armazenadas localmente para restabelecer conexão**
- **Notificação sonora no dispositivo ao reconectar com sucesso**\n- **Notificação visual indicando status de reconexão**
- **Tentativa automática de reconexão usando dados salvos**

## 4. Interface do Usuário\n
### 4.1 Estilo Visual
- Design minimalista
- Dark mode
- Interface focada em contatos diretos e conversas ativas
- Inspiração UX de chat com bolhas de mensagem
- Sem feed ou timeline

### 4.2 Estrutura de Páginas
- Tela de geração de oferta (Usuário A)
- Tela de aceitação de oferta (Usuário B)
- Tela de chat com histórico de mensagens
- **Tela de lista de conversas salvas com nomes personalizados**
- **Opção para nomear/renomear conversas**
- Área de input de mensagens
- Botões de ação (Gerar Oferta, Aceitar Oferta, Finalizar Conexão, Salvar Conversa, **Reconectar**)\n
### 4.3 Notificações
- **Notificação sonora ao reconectar com sucesso**\n- **Notificação sonora ao enviar mensagem**
- **Notificação sonora ao receber mensagem**\n- **Notificação visual de status de conexão**
- **Feedback visual durante tentativa de reconexão**

## 5. Limitações Técnicas\n
### 5.1 Requisitos de Funcionamento
- Ambos os usuários devem estar online simultaneamente para troca de mensagens em tempo real
- Mensagens não são entregues se usuário estiver offline
- Não há fila de mensagens em servidor
- Comunicação depende de configuração NAT/firewall
- **Histórico e vínculos são mantidos localmente mesmo quando offline**
- **Reconexão depende da disponibilidade do outro usuário online**

### 5.2 Escopo
- Não é substituto completo de mensageiros corporativos
- É um mensageiro descentralizado focado em privacidade
- Controle total do usuário sobre seus dados

## 6. Plataformas Suportadas
- **Web App (PWA - Progressive Web App instalável)**
- **Android (via WebView ou Flutter)**\n- **Desktop (Electron ou Tauri)**

### 6.1 Requisitos de Instalação
- **Configuração de PWA com manifest.json**
- **Service Worker para funcionamento offline**\n- **Ícones de aplicativo em múltiplas resoluções**
- **Suporte a instalação via navegador (Add to Home Screen)**
- **Capacidade de executar como aplicativo standalone**
- **Permissões para notificações sonoras e visuais**

## 7. Código Base Fornecido\n
O usuário forneceu código HTML/JavaScript funcional implementando:
- Configuração RTCPeerConnection com servidor STUN do Google
- Criação de DataChannel para chat
- Geração e troca de ofertas/respostas SDP
- Interface básica com áreas de texto para oferta/resposta
- Sistema de mensagens com distinção visual (me/peer)
- Envio de mensagens via tecla Enter
\n## 8. Princípios do Projeto
- Autonomia informacional
- Privacidade absoluta
- Minimização de dados
- Comunicação direta entre partes
- Transparência sobre limitações técnicas
- **Persistência local de dados e vínculos**
- **Controle total do usuário sobre nomeação e organização de conversas**
- **Instalabilidade como aplicativo nativo**
- **Reconexão facilitada com credenciais salvas**\n- **Feedback sonoro e visual para melhor experiência do usuário**