import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { Copy, Check, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfferAcceptorProps {
  onAcceptOffer: (offerCode: string) => void;
  answerData: string;
  isProcessing: boolean;
}

export function OfferAcceptor({ onAcceptOffer, answerData, isProcessing }: OfferAcceptorProps) {
  const [offerCode, setOfferCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleAccept = () => {
    if (!offerCode.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, cole o código de conexão.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Validar se é um JSON válido
      JSON.parse(offerCode);
      onAcceptOffer(offerCode);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Código de conexão inválido.',
        variant: 'destructive'
      });
    }
  };

  const handleCopyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(answerData);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Código de resposta copiado para a área de transferência.'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o código.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Aceitar Conexão
        </CardTitle>
        <CardDescription>
          Cole o código de conexão recebido de outro usuário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!answerData ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Código de Conexão
              </label>
              <Textarea
                value={offerCode}
                onChange={(e) => setOfferCode(e.target.value)}
                placeholder="Cole aqui o código de conexão..."
                className="font-mono text-xs min-h-[120px] resize-none"
              />
            </div>

            <Button
              onClick={handleAccept}
              disabled={!offerCode.trim() || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Processando...' : 'Aceitar Conexão'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 p-4 bg-background rounded-lg border border-border">
              <QRCodeDataUrl
                text={answerData}
                width={200}
                className="bg-white p-4 rounded-lg"
              />
              <p className="text-sm text-muted-foreground text-center">
                Código de resposta gerado
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                value={answerData}
                readOnly
                className="font-mono text-xs min-h-[120px] resize-none"
              />
              <Button
                onClick={handleCopyAnswer}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código de Resposta
                  </>
                )}
              </Button>
            </div>

            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground">
                <strong>Próximo passo:</strong> Envie este código de resposta para a pessoa que 
                iniciou a conexão. Ela deve colar este código para completar a conexão.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
