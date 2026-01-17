import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { QRCodeGenerator } from '@/components/connection/QRCodeGenerator';
import { OfferAcceptor } from '@/components/connection/OfferAcceptor';
import { SavedContactsList } from '@/components/connection/SavedContactsList';
import { NotificationPermissionPrompt } from '@/components/notifications/NotificationPermissionPrompt';
import { useWebRTC } from '@/hooks/use-webrtc';
import { StorageManager } from '@/lib/storage';
import { NotificationManager } from '@/lib/notifications';
import { Shield, MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SavedContact } from '@/types';

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOffer, acceptOffer, acceptAnswer, connectionState } = useWebRTC();

  const [offerData, setOfferData] = useState('');
  const [answerData, setAnswerData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answerCode, setAnswerCode] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [contactId, setContactId] = useState<string>('');
  const [waitingForConnection, setWaitingForConnection] = useState(false);
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
  const [currentRole, setCurrentRole] = useState<'initiator' | 'receiver'>('initiator');
  const [currentOfferCode, setCurrentOfferCode] = useState('');
  const [currentAnswerCode, setCurrentAnswerCode] = useState('');

  // Carregar contatos salvos e inicializar notificações
  useEffect(() => {
    const contacts = StorageManager.getAllSavedContacts();
    setSavedContacts(contacts);
    
    // Inicializar sistema de notificações
    NotificationManager.initialize();
  }, []);

  // Monitorar estado de conexão e redirecionar quando conectado
  useEffect(() => {
    if (connectionState === 'connected' && contactId && waitingForConnection) {
      // Salvar contato com códigos de conexão
      const savedContact: SavedContact = {
        id: contactId,
        name: 'Novo Contato',
        offerCode: currentRole === 'initiator' ? currentOfferCode : undefined,
        answerCode: currentRole === 'receiver' ? currentAnswerCode : undefined,
        myRole: currentRole,
        createdAt: Date.now(),
        lastConnected: Date.now()
      };
      
      StorageManager.saveSavedContact(savedContact);
      
      toast({
        title: 'Conectado!',
        description: 'Redirecionando para o chat...'
      });
      
      setTimeout(() => {
        navigate('/chat');
      }, 500);
    }
  }, [connectionState, contactId, waitingForConnection, navigate, toast, currentRole, currentOfferCode, currentAnswerCode]);

  const handleGenerateOffer = async () => {
    setIsGenerating(true);
    try {
      const offer = await createOffer();
      setOfferData(offer);
      setCurrentOfferCode(offer);
      setCurrentRole('initiator');
      setShowAnswerInput(true);
      
      // Criar sessão de chat para o iniciador
      const newContactId = `peer-${Date.now()}`;
      setContactId(newContactId);
      StorageManager.setCurrentSession(newContactId);
      StorageManager.saveChatSession({
        contactId: newContactId,
        contactName: 'Novo Contato',
        messages: [],
        createdAt: Date.now()
      });
      
      toast({
        title: 'Código gerado!',
        description: 'Compartilhe este código com a pessoa que deseja conectar.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o código de conexão.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptOffer = async (offerCode: string) => {
    setIsProcessing(true);
    try {
      const answer = await acceptOffer(offerCode);
      setAnswerData(answer);
      setCurrentAnswerCode(answer);
      setCurrentRole('receiver');
      
      // Criar sessão de chat para o receptor
      const newContactId = `peer-${Date.now()}`;
      setContactId(newContactId);
      StorageManager.setCurrentSession(newContactId);
      StorageManager.saveChatSession({
        contactId: newContactId,
        contactName: 'Novo Contato',
        messages: [],
        createdAt: Date.now()
      });

      toast({
        title: 'Código de resposta gerado!',
        description: 'Envie este código para completar a conexão. Aguardando conexão...'
      });

      // Marcar que estamos aguardando conexão
      setWaitingForConnection(true);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o código de conexão.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAnswer = async () => {
    if (!answerCode.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, cole o código de resposta.',
        variant: 'destructive'
      });
      return;
    }

    try {
      JSON.parse(answerCode);
      await acceptAnswer(answerCode);

      toast({
        title: 'Processando...',
        description: 'Estabelecendo conexão...'
      });

      // Marcar que estamos aguardando conexão
      setWaitingForConnection(true);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Código de resposta inválido.',
        variant: 'destructive'
      });
    }
  };

  const handleSelectSavedContact = async (contact: SavedContact) => {
    // Solicitar permissão de notificação
    await NotificationManager.requestPermission();
    
    toast({
      title: 'Reconectando...',
      description: `Estabelecendo conexão com ${contact.name}`
    });

    // Usar o contato salvo para reconectar
    setContactId(contact.id);
    StorageManager.setCurrentSession(contact.id);
    StorageManager.updateSavedContactLastConnected(contact.id);

    // Atualizar lista de contatos
    const contacts = StorageManager.getAllSavedContacts();
    setSavedContacts(contacts);

    // Notificar reconexão
    NotificationManager.notifyReconnection(contact.name);

    // Navegar para o chat com informações de reconexão
    navigate('/chat', { 
      state: { 
        reconnect: true,
        savedContact: contact
      } 
    });
  };

  const handleDeleteSavedContact = (contactId: string) => {
    StorageManager.deleteSavedContact(contactId);
    const contacts = StorageManager.getAllSavedContacts();
    setSavedContacts(contacts);
    
    toast({
      title: 'Contato excluído',
      description: 'O contato foi removido da lista.'
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GAAG Chat</h1>
                <p className="text-xs text-muted-foreground">Comunicação privada e descentralizada</p>
              </div>
            </div>
            <NotificationPermissionPrompt />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Saved Contacts */}
          {savedContacts.length > 0 && (
            <SavedContactsList
              contacts={savedContacts}
              onSelectContact={handleSelectSavedContact}
              onDeleteContact={handleDeleteSavedContact}
            />
          )}

          {/* Info Card */}
          <Card className="bg-accent border-accent-foreground/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <MessageCircle className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-accent-foreground">
                    <strong>Comunicação 100% privada:</strong> Suas mensagens são transmitidas diretamente 
                    entre dispositivos, sem passar por servidores. Nenhum dado é armazenado na nuvem.
                  </p>
                  <p className="text-xs text-accent-foreground/80">
                    Para iniciar uma conversa, gere um código de conexão ou aceite um código de outra pessoa.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Tabs */}
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Gerar Conexão</TabsTrigger>
              <TabsTrigger value="accept">Aceitar Conexão</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <QRCodeGenerator
                offerData={offerData}
                onGenerateOffer={handleGenerateOffer}
                isGenerating={isGenerating}
              />

              {showAnswerInput && offerData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Receber Código de Resposta</CardTitle>
                    <CardDescription>
                      Cole aqui o código de resposta que você recebeu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={answerCode}
                      onChange={(e) => setAnswerCode(e.target.value)}
                      placeholder="Cole o código de resposta aqui..."
                      className="font-mono text-xs min-h-[120px] resize-none"
                    />
                    <Button
                      onClick={handleAcceptAnswer}
                      disabled={!answerCode.trim()}
                      className="w-full"
                      size="lg"
                    >
                      Conectar e Iniciar Chat
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="accept" className="space-y-4">
              <OfferAcceptor
                onAcceptOffer={handleAcceptOffer}
                answerData={answerData}
                isProcessing={isProcessing}
              />

              {answerData && waitingForConnection && (
                <Card className="bg-accent border-accent-foreground/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-accent-foreground">
                          Aguardando conexão...
                        </p>
                        <p className="text-xs text-accent-foreground/80 mt-1">
                          Você será redirecionado automaticamente quando a conexão for estabelecida.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Status de conexão */}
          {waitingForConnection && (
            <Card className="bg-muted border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {connectionState === 'connecting' && 'Estabelecendo conexão GAAG...'}
                      {connectionState === 'connected' && 'Conectado! Redirecionando...'}
                      {connectionState === 'failed' && 'Falha na conexão. Tente novamente.'}
                      {connectionState === 'disconnected' && 'Aguardando conexão...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Status: {connectionState}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">like look solutions</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Projeto Visionado Por</p>
              <p className="font-medium text-foreground">
                Julio Cesar Campos Machado - Programador Full Stack
              </p>
              <a 
                href="https://likelook.wixsite.com/solutions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-block mt-1"
              >
                likelook.wixsite.com/solutions
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              © 2026 GAAG Chat • Privacidade e segurança em primeiro lugar
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
