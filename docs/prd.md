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
- **Armazenamento de mensagens de áudio no IndexedDB**

### 2.3 Segurança
- Criptografia ponta-a-ponta obrigatória (nativa do WebRTC)
- Chaves geradas localmente
- Sem login, e-mail, telefone ou rastreamento
- Identidade baseada em QR Code, código temporário ou link P2P

## 3. Funcionalidades Principais

### 3.1 Comunicação
- Mensagens de texto
- **Mensagens de áudio gravadas pelo usuário**
- **Gravação de áudio via MediaRecorder API**
- **Envio de arquivos de áudio via DataChannel**
- **Reprodução de mensagens de áudio recebidas**
- **Indicador visual de duração do áudio**
- **Controles de reprodução (play, pause, barra de progresso)**
- **Ligações de voz P2P em tempo real**
- **Controles de chamada de voz (iniciar, encerrar, mudo, alto-falante)**
- **Indicador visual de chamada de voz ativa**
- **Notificação sonora de chamada de voz recebida**
- Chamadas de áudio (opcional)
- Chamadas de vídeo (opcional)
- Indicador de digitando
- Confirmação de entrega local
\n### 3.2 Conexão entre Usuários
- Usuário A gera código/QR
- Usuário B escaneia ou digita código
- Estabelecimento de conexão direta
- Canal permanece ativo enquanto ambos estiverem online
- **Salvamento automático da conexão no LocalStorage após estabelecimento**
- **Reconexão automática com contatos salvos em futuras sessões**

### 3.3 Gestão de Conversas\n- Lista de contatos diretos
- Conversas ativas
- Histórico de mensagens salvo localmente
- **Histórico de mensagens de áudio salvo localmente**
- **Nomeação personalizada de conversas pelo usuário**
- **Persistência de todas as conversas no LocalStorage**
- **Manutenção do histórico completo de cada conversa nomeada**
- Exportação/importação manual de dados
\n### 3.4 Persistência de Vínculos\n- **Armazenamento de informações de conexão (peer ID, chaves de sessão) no LocalStorage**
- **Recuperação automática de conversas anteriores ao reabrir o aplicativo**
- **Preservação do vínculo entre usuários mesmo após desconexão temporária**
- **Lista de conversas salvas acessível na interface principal**

### 3.5 Reconexão
- **Botão Reconectar disponível em cada conversa salva**
- **Utilização das credenciais armazenadas localmente para restabelecer conexão**
- **Notificação sonora no dispositivo ao reconectar com sucesso**
- **Notificação visual indicando status de reconexão**
- **Tentativa automática de reconexão usando dados salvos**
\n### 3.6 Ligações de Voz
- **Botão de iniciar ligação de voz na interface de chat**
- **Estabelecimento de canal de áudio via WebRTC (getUserMedia + RTCPeerConnection)**
- **Controles durante chamada: mudo, desligar, alto-falante**
- **Indicador de duração da chamada**
- **Notificação sonora ao receber chamada de voz**
- **Opção de aceitar ou recusar chamada recebida**
- **Feedback visual de status da chamada (conectando, ativa, encerrada)**
- **Registro de histórico de chamadas no LocalStorage**

### 3.7 Mensagens de Áudio
- **Botão de gravar áudio na interface de chat**
- **Captura de áudio via getUserMedia (apenas microfone)**
- **Gravação usando MediaRecorder API**
- **Indicador visual durante gravação (tempo decorrido, animação)**
- **Botões de controle: iniciar gravação, pausar, cancelar, enviar**
- **Pré-visualização do áudio antes de enviar**\n- **Compressão de áudio para otimizar transferência P2P**
- **Envio do arquivo de áudio via DataChannel em chunks**
- **Exibição de mensagem de áudio no histórico com ícone distintivo**
- **Player de áudio integrado para reprodução**
- **Controles de reprodução: play/pause, barra de progresso, indicador de tempo**
- **Armazenamento de áudios no IndexedDB com referência na conversa**

## 4. Interface do Usuário

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
- **Botão de gravação de áudio no campo de mensagem**
- **Interface de gravação de áudio com controles**
- **Player de áudio integrado nas mensagens**
- **Controles de ligação de voz (botão iniciar, aceitar, recusar, encerrar)**
- **Painel de chamada de voz ativa com controles (mudo, alto-falante, desligar)**
- Botões de ação (Gerar Oferta, Aceitar Oferta, Finalizar Conexão, Salvar Conversa, **Reconectar**)

### 4.3 Notificações\n- **Notificação sonora ao reconectar com sucesso**
- **Notificação sonora ao enviar mensagem**
- **Notificação sonora ao receber mensagem**
- **Notificação sonora ao receber mensagem de áudio**
- **Notificação sonora ao receber chamada de voz**
- **Notificação visual de status de conexão**\n- **Feedback visual durante tentativa de reconexão**
- **Notificação visual de chamada de voz recebida**
- **Indicador visual de chamada de voz em andamento**
- **Feedback visual durante gravação de áudio**

## 5. Limitações Técnicas

### 5.1 Requisitos de Funcionamento
- Ambos os usuários devem estar online simultaneamente para troca de mensagens em tempo real
- **Envio de mensagens de áudio requer ambos os usuários online e conectados**
- **Ligações de voz requerem ambos os usuários online e conectados**
- Mensagens não são entregues se usuário estiver offline
- Não há fila de mensagens em servidor\n- Comunicação depende de configuração NAT/firewall\n- **Histórico e vínculos são mantidos localmente mesmo quando offline**
- **Reconexão depende da disponibilidade do outro usuário online**\n- **Qualidade de áudio depende da largura de banda e latência da conexão P2P**
- **Tamanho de mensagens de áudio limitado pela capacidade do DataChannel**

### 5.2 Escopo\n- Não é substituto completo de mensageiros corporativos
- É um mensageiro descentralizado focado em privacidade
- Controle total do usuário sobre seus dados

## 6. Plataformas Suportadas\n- **Web App (PWA - Progressive Web App instalável)**\n- **Android (via WebView ou Flutter)**
- **Desktop (Electron ou Tauri)**

### 6.1 Requisitos de Instalação
- **Configuração de PWA com manifest.json**
- **Service Worker para funcionamento offline**
- **Ícones de aplicativo em múltiplas resoluções**\n- **Suporte a instalação via navegador (Add to Home Screen)**
- **Capacidade de executar como aplicativo standalone**
- **Permissões para notificações sonoras e visuais**
- **Permissões para acesso ao microfone (para ligações de voz e gravação de áudio)**
\n## 7. Código Base Fornecido

O usuário forneceu código HTML/JavaScript funcional implementando:
- Configuração RTCPeerConnection com servidor STUN do Google
- Criação de DataChannel para chat
- Geração e troca de ofertas/respostas SDP
- Interface básica com áreas de texto para oferta/resposta
- Sistema de mensagens com distinção visual (me/peer)
- Envio de mensagens via tecla Enter

## 8. Princípios do Projeto
- Autonomia informacional
- Privacidade absoluta
- Minimização de dados
- Comunicação direta entre partes
- Transparência sobre limitações técnicas
- **Persistência local de dados e vínculos**\n- **Controle total do usuário sobre nomeação e organização de conversas**
- **Instalabilidade como aplicativo nativo**
- **Reconexão facilitada com credenciais salvas**
- **Feedback sonoro e visual para melhor experiência do usuário**\n- **Comunicação de voz P2P sem intermediários**
- **Suporte a mensagens de áudio gravadas e reproduzidas localmente**