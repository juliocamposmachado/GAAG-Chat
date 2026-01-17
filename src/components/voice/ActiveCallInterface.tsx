import { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ActiveCallInterfaceProps {
  contactName: string;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
  onToggleMute: () => boolean;
}

export function ActiveCallInterface({ 
  contactName, 
  remoteStream, 
  onEndCall,
  onToggleMute 
}: ActiveCallInterfaceProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Conectar stream remoto ao elemento de áudio
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(err => {
        console.error('Erro ao reproduzir áudio:', err);
      });
    }
  }, [remoteStream]);

  // Contador de duração da chamada
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const muted = onToggleMute();
    setIsMuted(muted);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex flex-col items-center gap-6">
        {/* Ícone de chamada ativa */}
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <Phone className="w-12 h-12 text-primary" />
        </div>

        {/* Informações da chamada */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold">{contactName}</h3>
          <p className="text-muted-foreground mt-2">
            Chamada em andamento
          </p>
          <p className="text-lg font-mono mt-1 text-primary">
            {formatDuration(callDuration)}
          </p>
        </div>

        {/* Controles */}
        <div className="flex gap-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            onClick={handleToggleMute}
            className="w-16 h-16 rounded-full"
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        {/* Elemento de áudio (oculto) */}
        <audio ref={audioRef} autoPlay />
      </div>
    </Card>
  );
}
