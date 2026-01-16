import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { QRCodeGenerator } from '@/components/connection/QRCodeGenerator';
import { OfferAcceptor } from '@/components/connection/OfferAcceptor';
import { useWebRTC } from '@/hooks/use-webrtc';
import { StorageManager } from '@/lib/storage';
import { Shield, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOffer, acceptOffer, acceptAnswer } = useWebRTC();

  const [offerData, setOfferData] = useState('');
  const [answerData, setAnswerData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answerCode, setAnswerCode] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);

  const handleGenerateOffer = async () => {
    setIsGenerating(true);
    try {
      const offer = await createOffer();
      setOfferData(offer);
      setShowAnswerInput(true);
      
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
      
      // Criar sessão de chat
      const contactId = `peer-${Date.now()}`;
      StorageManager.setCurrentSession(contactId);
      StorageManager.saveChatSession({
        contactId,
        contactName: 'Contato P2P',
        messages: [],
        createdAt: Date.now()
      });

      toast({
        title: 'Código de resposta gerado!',
        description: 'Envie este código para completar a conexão.'
      });
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
      
      // Criar sessão de chat
      const contactId = `peer-${Date.now()}`;
      StorageManager.setCurrentSession(contactId);
      StorageManager.saveChatSession({
        contactId,
        contactName: 'Contato P2P',
        messages: [],
        createdAt: Date.now()
      });

      toast({
        title: 'Conexão estabelecida!',
        description: 'Redirecionando para o chat...'
      });

      setTimeout(() => {
        navigate('/chat');
      }, 1000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Código de resposta inválido.',
        variant: 'destructive'
      });
    }
  };

  const handleGoToChat = () => {
    if (answerData) {
      // Aguardar que o outro usuário cole a resposta
      toast({
        title: 'Aguardando',
        description: 'Aguarde o outro usuário colar o código de resposta.',
        variant: 'default'
      });
    } else {
      navigate('/chat');
    }
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
                <h1 className="text-xl font-bold">P2P Chat</h1>
                <p className="text-xs text-muted-foreground">Comunicação privada e descentralizada</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
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

              {answerData && (
                <Button
                  onClick={handleGoToChat}
                  className="w-full"
                  size="lg"
                >
                  Ir para o Chat
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 P2P Chat • Privacidade e segurança em primeiro lugar
          </p>
        </div>
      </footer>
    </div>
  );
}
