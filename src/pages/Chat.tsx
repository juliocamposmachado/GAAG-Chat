import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SaveContactDialog } from '@/components/chat/SaveContactDialog';
import { useWebRTC } from '@/hooks/use-webrtc';
import { StorageManager } from '@/lib/storage';
import { NotificationManager } from '@/lib/notifications';
import { Shield, ArrowLeft, Download, Trash2, Edit, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contactId, setContactId] = useState<string | null>(null);
  const [contactName, setContactName] = useState<string>('Novo Contato');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    connectionState,
    messages,
    peerTyping,
    sendMessage,
    sendTypingIndicator,
    disconnect,
    reset
  } = useWebRTC(contactId || undefined);

  useEffect(() => {
    const currentSession = StorageManager.getCurrentSession();
    if (!currentSession) {
      navigate('/');
      return;
    }
    setContactId(currentSession);

    // Carregar nome do contato
    const session = StorageManager.getChatSession(currentSession);
    if (session) {
      setContactName(session.contactName);
    }

    // Verificar se já está salvo
    const savedContact = StorageManager.getSavedContact(currentSession);
    setIsSaved(!!savedContact);

    // Solicitar permissão de notificação
    NotificationManager.requestPermission();
  }, [navigate]);

  // Notificar quando conexão for estabelecida
  useEffect(() => {
    if (connectionState === 'connected' && contactName) {
      NotificationManager.notifyConnectionEstablished(contactName);
    }
  }, [connectionState, contactName]);

  // Notificar quando receber nova mensagem
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.sender === 'peer') {
        // Mensagem recebida - sempre tocar som
        NotificationManager.playMessageSound();
        
        // Notificação visual apenas se janela não estiver em foco
        if (!document.hasFocus()) {
          NotificationManager.notifyNewMessage(contactName, lastMessage.text);
        }
      } else if (lastMessage.sender === 'me') {
        // Mensagem enviada - tocar som
        NotificationManager.playMessageSound();
      }
    }
  }, [messages, contactName]);

  const handleDisconnect = () => {
    disconnect();
    StorageManager.clearCurrentSession();
    if (contactId) {
      StorageManager.updateContactStatus(contactId, false);
    }
    navigate('/');
  };

  const handleExportData = () => {
    try {
      const data = StorageManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gaag-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup criado!',
        description: 'Seus dados foram exportados com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveContact = (name: string) => {
    if (!contactId) return;

    // Atualizar nome na sessão
    StorageManager.updateSessionName(contactId, name);
    
    // Atualizar nome no contato salvo se já existir
    const savedContact = StorageManager.getSavedContact(contactId);
    if (savedContact) {
      StorageManager.updateSavedContactName(contactId, name);
    }

    setContactName(name);
    setIsSaved(true);

    toast({
      title: 'Contato salvo!',
      description: `"${name}" foi salvo com sucesso.`
    });
  };

  const handleRenameContact = (name: string) => {
    if (!contactId) return;

    // Atualizar nome na sessão
    StorageManager.updateSessionName(contactId, name);
    
    // Atualizar nome no contato salvo
    StorageManager.updateSavedContactName(contactId, name);

    setContactName(name);

    toast({
      title: 'Contato renomeado!',
      description: `Nome alterado para "${name}".`
    });
  };

  const handleClearData = () => {
    reset();
    StorageManager.clearAllData();
    toast({
      title: 'Dados apagados',
      description: 'Todas as conversas foram removidas.'
    });
    navigate('/');
  };

  if (!contactId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-semibold">{contactName}</h1>
                <p className="text-xs text-muted-foreground">
                  {connectionState === 'connected' && 'Online'}
                  {connectionState === 'connecting' && 'Conectando...'}
                  {connectionState === 'disconnected' && 'Desconectado'}
                  {connectionState === 'failed' && 'Falha na conexão'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Menu">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isSaved && (
                    <>
                      <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Contato
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Renomear
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => document.getElementById('clear-data-trigger')?.click()}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Apagar Dados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    id="clear-data-trigger"
                    variant="ghost"
                    size="icon"
                    title="Apagar dados"
                    className="hidden"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apagar todos os dados?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todas as conversas e contatos serão 
                      permanentemente removidos do armazenamento local.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>
                      Apagar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Desconectar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desconectar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você será desconectado desta conversa. O histórico de mensagens 
                      permanecerá salvo localmente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect}>
                      Desconectar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          connectionState={connectionState}
          peerTyping={peerTyping}
          onTyping={sendTypingIndicator}
        />
      </div>

      {/* Save Contact Dialog */}
      <SaveContactDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        currentName={contactName}
        onSave={handleSaveContact}
        mode="save"
      />

      {/* Rename Contact Dialog */}
      <SaveContactDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        currentName={contactName}
        onSave={handleRenameContact}
        mode="rename"
      />
    </div>
  );
}
