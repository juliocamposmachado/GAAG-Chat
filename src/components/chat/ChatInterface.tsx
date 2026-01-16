import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './MessageBubble';
import { Send, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, ConnectionState } from '@/types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  connectionState: ConnectionState;
  peerTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export function ChatInterface({
  messages,
  onSendMessage,
  connectionState,
  peerTyping = false,
  onTyping
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isConnected = connectionState === 'connected';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerTyping]);

  const handleInputChange = (value: string) => {
    setInputText(value);

    if (onTyping) {
      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        onTyping(true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !isConnected) return;

    onSendMessage(inputText.trim());
    setInputText('');
    
    if (isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status da conexão */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-card border-b border-border">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm text-muted-foreground">
              {connectionState === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </span>
          </>
        )}
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-background">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Nenhuma mensagem ainda.<br />
              Envie a primeira mensagem!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {peerTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Área de input */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? 'Digite uma mensagem...' : 'Aguardando conexão...'}
            disabled={!isConnected}
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none',
              !isConnected && 'opacity-50 cursor-not-allowed'
            )}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || !isConnected}
            size="icon"
            className="shrink-0 h-[44px] w-[44px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
