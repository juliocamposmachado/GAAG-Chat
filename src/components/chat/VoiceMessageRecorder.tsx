import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, X, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}

export function VoiceMessageRecorder({ onSend, onCancel }: VoiceMessageRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const { toast } = useToast();

  const MAX_DURATION = 120; // 2 minutos

  useEffect(() => {
    return () => {
      // Cleanup ao desmontar
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Usar codec webm/opus para melhor compressão
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const actualDuration = (Date.now() - startTimeRef.current) / 1000;
        
        // Verificar tamanho do arquivo (limite: 5MB)
        if (audioBlob.size > 5 * 1024 * 1024) {
          toast({
            title: 'Áudio muito grande',
            description: 'O áudio não pode exceder 5MB. Tente gravar uma mensagem mais curta.',
            variant: 'destructive'
          });
          setIsRecording(false);
          setDuration(0);
          return;
        }

        onSend(audioBlob, actualDuration);
        setIsRecording(false);
        setDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Timer para atualizar duração
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(elapsed);

        // Parar automaticamente ao atingir duração máxima
        if (elapsed >= MAX_DURATION) {
          stopRecording();
        }
      }, 100);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast({
        title: 'Erro ao Gravar Áudio',
        description: 'Não foi possível acessar o microfone. Verifique as permissões.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setIsProcessing(true);
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    setIsRecording(false);
    setDuration(0);
    chunksRef.current = [];
    
    if (onCancel) {
      onCancel();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={startRecording}
        title="Gravar mensagem de áudio"
        className="shrink-0"
      >
        <Mic className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg w-full">
      {/* Indicador de gravação */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
        <span className="text-sm font-medium">
          {formatDuration(duration)}
        </span>
        <span className="text-xs text-muted-foreground">
          / {formatDuration(MAX_DURATION)}
        </span>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          disabled={isProcessing}
          title="Cancelar gravação"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <Button
          variant="default"
          size="icon"
          onClick={stopRecording}
          disabled={isProcessing || duration < 1}
          title="Enviar áudio"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
