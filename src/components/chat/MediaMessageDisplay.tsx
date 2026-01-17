import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaMessageDisplayProps {
  mediaData: string;
  mediaType: string;
  sender: 'me' | 'peer';
  width?: number;
  height?: number;
}

export function MediaMessageDisplay({ 
  mediaData, 
  mediaType, 
  sender,
  width,
  height 
}: MediaMessageDisplayProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const isImage = mediaType.startsWith('image/');
  const isVideo = mediaType.startsWith('video/');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaData;
    link.download = `gaag-${isImage ? 'image' : 'video'}-${Date.now()}.${mediaType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular dimensões para preview (max 300x300)
  const getPreviewDimensions = () => {
    if (!width || !height) return { width: 300, height: 200 };
    
    const maxSize = 300;
    const ratio = Math.min(maxSize / width, maxSize / height);
    
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  };

  const previewDims = getPreviewDimensions();

  return (
    <>
      <div className="relative group">
        {isImage && (
          <div className="relative">
            <img
              src={mediaData}
              alt="Imagem enviada"
              className={cn(
                "rounded-lg cursor-pointer object-cover",
                "hover:opacity-90 transition-opacity"
              )}
              style={{
                maxWidth: `${previewDims.width}px`,
                maxHeight: `${previewDims.height}px`
              }}
              onClick={() => setShowFullscreen(true)}
              loading="lazy"
            />
            
            {/* Overlay com ações */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setShowFullscreen(true)}
                className="w-8 h-8"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="w-8 h-8"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {isVideo && (
          <div className="relative">
            <video
              src={mediaData}
              controls
              className="rounded-lg max-w-full"
              style={{
                maxWidth: `${previewDims.width}px`,
                maxHeight: `${previewDims.height}px`
              }}
              preload="metadata"
            />
            
            <Button
              variant="secondary"
              size="icon"
              onClick={handleDownload}
              className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Dialog fullscreen para imagens */}
      {isImage && (
        <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={mediaData}
                alt="Imagem em tela cheia"
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="absolute top-4 right-4"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
