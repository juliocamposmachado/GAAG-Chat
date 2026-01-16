import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { Copy, Check, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  offerData: string;
  onGenerateOffer: () => void;
  isGenerating: boolean;
}

export function QRCodeGenerator({ offerData, onGenerateOffer, isGenerating }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offerData);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Código de conexão copiado para a área de transferência.'
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
          <QrCode className="w-5 h-5" />
          Gerar Conexão
        </CardTitle>
        <CardDescription>
          Crie um código de conexão para compartilhar com outro usuário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!offerData ? (
          <Button
            onClick={onGenerateOffer}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Gerando...' : 'Gerar Código de Conexão'}
          </Button>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 p-4 bg-background rounded-lg border border-border">
              <QRCodeDataUrl
                text={offerData}
                width={200}
                className="bg-white p-4 rounded-lg"
              />
              <p className="text-sm text-muted-foreground text-center">
                Escaneie o QR Code ou copie o código abaixo
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                value={offerData}
                readOnly
                className="font-mono text-xs min-h-[120px] resize-none"
              />
              <Button
                onClick={handleCopy}
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
                    Copiar Código
                  </>
                )}
              </Button>
            </div>

            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground">
                <strong>Próximo passo:</strong> Compartilhe este código com a pessoa que deseja conectar. 
                Ela deve usar a opção "Aceitar Conexão" e colar este código.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
