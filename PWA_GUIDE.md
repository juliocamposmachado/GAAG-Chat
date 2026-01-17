# PWA (Progressive Web App) - GAAG Chat

## O que é PWA?

Progressive Web App (PWA) é uma tecnologia que permite que aplicações web sejam instaladas e usadas como aplicativos nativos em dispositivos móveis e desktop.

## Funcionalidades Implementadas

### 1. Instalação do Aplicativo

**Como instalar:**

#### No Android (Chrome/Edge):
1. Abra o GAAG Chat no navegador
2. Toque no menu (⋮) no canto superior direito
3. Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
4. Confirme a instalação

#### No iOS (Safari):
1. Abra o GAAG Chat no Safari
2. Toque no botão de compartilhar (□↑)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Confirme

#### No Desktop (Chrome/Edge):
1. Abra o GAAG Chat no navegador
2. Clique no ícone de instalação (⊕) na barra de endereço
3. Ou clique no menu (⋮) → "Instalar GAAG Chat"
4. Confirme a instalação

### 2. Prompt de Instalação Customizado

**Componente:** `InstallPrompt`

**Funcionalidades:**
- Aparece automaticamente quando o app pode ser instalado
- Botão "Instalar" para instalação rápida
- Botão "Agora não" para dispensar
- Lembra se o usuário dispensou (não aparece novamente)
- Design consistente com o tema do app

### 3. Uso Offline

**Service Worker implementado:**
- Cache de recursos estáticos (HTML, CSS, JS)
- Cache de imagens e ícones
- Funciona offline após primeira visita
- Atualização automática quando nova versão disponível

**Limitações offline:**
- WebRTC requer conexão com internet
- Não é possível estabelecer novas conexões offline
- Histórico de mensagens permanece acessível

### 4. Experiência de App Nativo

**Características:**
- Abre em janela própria (sem barra de navegador)
- Ícone na tela inicial / área de trabalho
- Splash screen ao abrir
- Tema escuro nativo
- Barra de status personalizada (mobile)

## Arquivos PWA

### 1. manifest.json
**Localização:** `/public/manifest.json`

**Conteúdo:**
```json
{
  "name": "GAAG Chat - Comunicação Privada",
  "short_name": "GAAG Chat",
  "description": "Aplicativo de comunicação peer-to-peer...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#8B5CF6",
  "icons": [...]
}
```

**Propriedades importantes:**
- `display: standalone` - Abre sem barra de navegador
- `theme_color` - Cor da barra de status (roxo do GAAG)
- `background_color` - Cor de fundo do splash screen
- `icons` - Ícones para diferentes tamanhos de tela

### 2. Service Worker (sw.js)
**Localização:** `/public/sw.js`

**Funcionalidades:**
- **Install:** Faz cache dos recursos essenciais
- **Activate:** Remove caches antigos
- **Fetch:** Intercepta requisições e serve do cache quando possível
- **Message:** Permite comunicação com o app

**Estratégia de cache:**
- Cache-first para recursos estáticos
- Network-first para dados dinâmicos
- Ignora requisições WebRTC/WebSocket

### 3. Registro do Service Worker
**Localização:** `/src/main.tsx`

**Código:**
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado');
      });
  });
}
```

### 4. Meta Tags PWA
**Localização:** `/index.html`

**Tags importantes:**
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#8B5CF6" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

## Benefícios do PWA

### Para o Usuário:
1. **Acesso Rápido:** Ícone na tela inicial
2. **Experiência Nativa:** Sem barra de navegador
3. **Uso Offline:** Acesso ao histórico sem internet
4. **Menos Dados:** Cache reduz consumo de dados
5. **Atualizações Automáticas:** Sempre a versão mais recente

### Para o Desenvolvedor:
1. **Sem App Store:** Não precisa publicar em lojas
2. **Atualizações Instantâneas:** Deploy direto
3. **Multiplataforma:** Um código para todos os dispositivos
4. **SEO Friendly:** Indexável por motores de busca
5. **Menor Tamanho:** Não ocupa tanto espaço quanto app nativo

## Requisitos para PWA

### ✅ Implementados:
- [x] HTTPS (fornecido pelo hosting)
- [x] Manifest.json válido
- [x] Service Worker registrado
- [x] Ícones em múltiplos tamanhos
- [x] Meta tags apropriadas
- [x] Responsivo (mobile + desktop)
- [x] Funciona offline (parcialmente)

### Checklist de Qualidade PWA:

**Instalabilidade:**
- ✅ Manifest com name, short_name, icons, start_url
- ✅ Service Worker registrado
- ✅ HTTPS habilitado
- ✅ Ícones 192x192 e 512x512

**Experiência:**
- ✅ Display: standalone
- ✅ Theme color definido
- ✅ Responsivo em todos os tamanhos
- ✅ Funciona offline (recursos em cache)

**Confiabilidade:**
- ✅ Carrega rápido (cache)
- ✅ Funciona sem conexão (parcial)
- ✅ Atualiza automaticamente

## Testando o PWA

### Chrome DevTools:
1. Abra DevTools (F12)
2. Vá para aba "Application"
3. Seção "Manifest" - Verificar manifest.json
4. Seção "Service Workers" - Verificar registro
5. Seção "Cache Storage" - Verificar cache

### Lighthouse:
1. Abra DevTools (F12)
2. Vá para aba "Lighthouse"
3. Selecione "Progressive Web App"
4. Clique em "Generate report"
5. Verifique pontuação e sugestões

### Teste de Instalação:
1. Abra o app em modo anônimo
2. Verifique se aparece o prompt de instalação
3. Instale o app
4. Abra o app instalado
5. Verifique se abre em janela standalone

## Atualizações do PWA

### Como funciona:
1. Usuário abre o app
2. Service Worker verifica se há nova versão
3. Se houver, baixa em background
4. Próxima vez que abrir, usa nova versão

### Forçar atualização:
```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister());
  })
  .then(() => location.reload());
```

## Troubleshooting

### App não aparece para instalação:
- Verifique se está em HTTPS
- Limpe cache do navegador
- Verifique console por erros
- Confirme que manifest.json está acessível

### Service Worker não registra:
- Verifique console por erros
- Confirme que sw.js está em /public/
- Teste em modo anônimo
- Verifique se HTTPS está ativo

### Cache não funciona:
- Abra DevTools → Application → Clear storage
- Desregistre Service Worker
- Recarregue página
- Verifique Cache Storage

## Recursos Adicionais

### Documentação:
- [MDN - Progressive Web Apps](https://developer.mozilla.org/pt-BR/docs/Web/Progressive_web_apps)
- [web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Google - PWA Checklist](https://web.dev/pwa-checklist/)

### Ferramentas:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)
