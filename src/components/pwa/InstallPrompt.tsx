import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevenir o prompt automático
      e.preventDefault();
      // Guardar o evento para usar depois
      setDeferredPrompt(e);
      // Mostrar o prompt customizado
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);

    // Limpar o prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Guardar no localStorage que o usuário dispensou
    localStorage.setItem('gaag_install_prompt_dismissed', 'true');
  };

  // Não mostrar se já foi dispensado
  useEffect(() => {
    const dismissed = localStorage.getItem('gaag_install_prompt_dismissed');
    if (dismissed === 'true') {
      setShowInstallPrompt(false);
    }
  }, []);

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Instalar GAAG Chat</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-2"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Instale o aplicativo para acesso rápido e uso offline
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1"
              size="sm"
            >
              Instalar
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Agora não
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
