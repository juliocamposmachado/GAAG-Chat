import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, BellOff } from 'lucide-react';
import { NotificationManager } from '@/lib/notifications';

export function NotificationPermissionPrompt() {
  const [open, setOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(
    NotificationManager.checkPermission()
  );

  const handleRequestPermission = async () => {
    const granted = await NotificationManager.requestPermission();
    setHasPermission(granted);
    setOpen(false);
  };

  const handleTestNotification = () => {
    NotificationManager.notify('Teste de Notificação', {
      body: 'As notificações estão funcionando! 🔔',
      tag: 'test'
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        {hasPermission ? (
          <>
            <Bell className="w-4 h-4" />
            Notificações Ativas
          </>
        ) : (
          <>
            <BellOff className="w-4 h-4" />
            Ativar Notificações
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificações do GAAG Chat</DialogTitle>
            <DialogDescription>
              Receba notificações com som quando:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Reconexão</p>
                <p className="text-xs text-muted-foreground">
                  Quando você reconectar com um contato salvo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Nova Mensagem</p>
                <p className="text-xs text-muted-foreground">
                  Quando receber uma mensagem (som sempre, notificação visual apenas em segundo plano)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Mensagem Enviada</p>
                <p className="text-xs text-muted-foreground">
                  Quando você enviar uma mensagem (apenas som como feedback)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Conexão Estabelecida</p>
                <p className="text-xs text-muted-foreground">
                  Quando a conexão P2P for estabelecida com sucesso
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {hasPermission ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleTestNotification}
                  className="flex-1"
                >
                  Testar Notificação
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Agora Não
                </Button>
                <Button
                  onClick={handleRequestPermission}
                  className="flex-1"
                >
                  Permitir Notificações
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
