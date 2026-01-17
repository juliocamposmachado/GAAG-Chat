import React from 'react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Image, Video, X, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaMessageUploaderProps {
  onSend: (file: File, mediaType: 'image' | 'video') => void;
}

export function MediaMessageUploader({ onSend }: MediaMessageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'];

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar formato
    const supportedFormats = type === 'image' ? SUPPORTED_IMAGE_FORMATS : SUPPORTED_VIDEO_FORMATS;
    if (!supportedFormats.includes(file.type)) {
      toast({
        title: 'Formato não suportado',
        description: `Por favor, selecione um arquivo ${type === 'image' ? 'de imagem' : 'de vídeo'} válido.`,
        variant: 'destructive'
      });
      return;
    }

    // Validar tamanho
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      toast({
        title: 'Arquivo muito grande',
        description: `O arquivo não pode exceder ${maxSizeMB}MB.`,
        variant: 'destructive'
      });
      return;
    }

    // Criar preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setMediaType(type);
    setShowPreview(true);

    // Limpar input
    event.target.value = '';
  };

  const handleSend = async () => {
    if (!selectedFile || !mediaType) return;

    setIsProcessing(true);
    try {
      await onSend(selectedFile, mediaType);
      handleCancel();
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      toast({
        title: 'Erro ao Enviar',
        description: 'Não foi possível enviar o arquivo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setShowPreview(false);
  };

  return (
    <>
      {/* Botões de upload */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleImageClick}
        title="Enviar imagem"
        className="shrink-0"
      >
        <Image className="w-5 h-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleVideoClick}
        title="Enviar vídeo"
        className="shrink-0"
      >
        <Video className="w-5 h-5" />
      </Button>

      {/* Inputs ocultos */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={(e) => handleFileSelect(e, 'image')}
        className="hidden"
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => handleFileSelect(e, 'video')}
        className="hidden"
      />

      {/* Dialog de preview */}
      <Dialog open={showPreview} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mediaType === 'image' ? 'Enviar Imagem' : 'Enviar Vídeo'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden max-h-[60vh]">
            {mediaType === 'image' && previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain"
              />
            )}

            {mediaType === 'video' && previewUrl && (
              <video
                src={previewUrl}
                controls
                className="max-w-full max-h-[60vh]"
              />
            )}
          </div>

          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              <p>Nome: {selectedFile.name}</p>
              <p>Tamanho: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
