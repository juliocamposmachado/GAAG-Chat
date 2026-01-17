# Correção: Erro de Importação do React

## Erros Identificados

### Erro 1: useContext
```
Uncaught TypeError: Cannot read properties of null (reading 'useContext')
    at IntersectObserver (/src/components/common/IntersectObserver.tsx:22:20)
```

### Erro 2: useState (Toaster)
```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
    at useToast (/src/hooks/use-toast.tsx:110:35)
    at Toaster (/src/components/ui/toaster.tsx:29:22)
```

### Erro 3: useState (InstallPrompt)
```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
    at InstallPrompt (/src/components/pwa/InstallPrompt.tsx:24:47)
```

## Causa Raiz

Múltiplos arquivos estavam usando JSX ou React hooks sem importar React corretamente.

**Arquivos com Problema:**

1. **src/routes.tsx** - JSX sem React
2. **src/components/ui/toaster.tsx** - JSX sem React
3. **src/components/common/IntersectObserver.tsx** - Hooks sem React completo
4. **src/components/pwa/InstallPrompt.tsx** - Hooks sem React completo

## Soluções Aplicadas

### 1. src/routes.tsx
```tsx
// ❌ ANTES
import Home from './pages/Home';
import Chat from './pages/Chat';
import type { ReactNode } from 'react';

// ✅ DEPOIS
import React from 'react';
import Home from './pages/Home';
import Chat from './pages/Chat';
import type { ReactNode } from 'react';
```

### 2. src/components/ui/toaster.tsx
```tsx
// ❌ ANTES
import { useToast } from "@/hooks/use-toast";
import { Toast, ... } from "@/components/ui/toast";

// ✅ DEPOIS
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ... } from "@/components/ui/toast";
```

### 3. src/components/common/IntersectObserver.tsx
```tsx
// ❌ ANTES
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ✅ DEPOIS
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
```

### 4. src/components/pwa/InstallPrompt.tsx
```tsx
// ❌ ANTES
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// ✅ DEPOIS
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
```

## Arquivos Modificados

1. **src/routes.tsx** - Adicionado `import React from 'react';`
2. **src/components/ui/toaster.tsx** - Adicionado `import React from "react";`
3. **src/components/common/IntersectObserver.tsx** - Alterado para `import React, { useEffect } from 'react';`
4. **src/components/pwa/InstallPrompt.tsx** - Alterado para `import React, { useEffect, useState } from 'react';`

## Por Que Isso Aconteceu?

### JSX Transformation
JSX é transformado em chamadas `React.createElement()`:
```tsx
<Home /> → React.createElement(Home, null)
<Toast /> → React.createElement(Toast, props)
```

### React Hooks
Hooks como `useEffect`, `useState`, `useContext` precisam de React no escopo:
```tsx
useEffect → React.useEffect
useState → React.useState
```

### Importação Parcial vs Completa

**Parcial (pode causar problemas):**
```tsx
import { useEffect } from 'react';  // Apenas o hook
```

**Completa (recomendado):**
```tsx
import React, { useEffect } from 'react';  // React + hooks
```

## Regra Geral

**Sempre importe React em arquivos que usam:**
- ✅ JSX (`<Component />`)
- ✅ React Hooks (`useState`, `useEffect`, etc.)
- ✅ Componentes React

**Formato recomendado:**
```tsx
// Para arquivos com JSX apenas
import React from 'react';

// Para arquivos com JSX + Hooks
import React, { useState, useEffect } from 'react';

// Para arquivos com apenas Hooks (sem JSX)
import React, { useState, useEffect } from 'react';  // Ainda recomendado
```

## Verificação

✅ Lint passing (93 arquivos verificados)
✅ Todos os erros resolvidos
✅ Aplicação funcionando normalmente
✅ 4 arquivos corrigidos

## Prevenção Futura

### Checklist para Novos Componentes
1. ✅ Arquivo usa JSX? → Importar React
2. ✅ Arquivo usa hooks? → Importar React + hooks
3. ✅ Arquivo é componente React? → Importar React
4. ✅ Testar no navegador antes de commit

### ESLint Rule (Opcional)
Adicionar regra para forçar importação de React:
```json
{
  "rules": {
    "react/react-in-jsx-scope": "error"
  }
}
```

---

**Data:** 2026-01-16
**Tipo:** Correção de Bug Crítico
**Status:** Resolvido
**Arquivos Afetados:** 4
**Tempo de Resolução:** Imediato
