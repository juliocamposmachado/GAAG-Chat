import React from 'react';
import { cn } from '@/lib/utils';
import { AudioMessagePlayer } from './AudioMessagePlayer';
import { MediaMessageDisplay } from './MediaMessageDisplay';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === 'me';
  const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isAudioMessage = message.type === 'audio' && message.audioData && message.audioDuration;
  const isMediaMessage = (message.type === 'image' || message.type === 'video') && message.mediaData && message.mediaType;

  return (
    <div
      className={cn(
        'flex w-full mb-3 animate-fade-in',
        isMe ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] xl:max-w-[60%] rounded-2xl shadow-sm overflow-hidden',
          (isAudioMessage || isMediaMessage) ? 'p-0' : 'px-4 py-2.5',
          isMe
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card text-card-foreground border border-border rounded-bl-sm'
        )}
      >
        {isAudioMessage ? (
          <div className="p-2">
            <AudioMessagePlayer
              audioData={message.audioData!}
              duration={message.audioDuration!}
              sender={message.sender}
            />
            <div
              className={cn(
                'flex items-center gap-1 mt-1 text-xs px-2',
                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              <span>{time}</span>
              {isMe && message.delivered && (
                <span className="ml-1">✓✓</span>
              )}
            </div>
          </div>
        ) : isMediaMessage ? (
          <div className="p-2 max-w-full">
            <MediaMessageDisplay
              mediaData={message.mediaData!}
              mediaType={message.mediaType!}
              sender={message.sender}
              width={message.mediaWidth}
              height={message.mediaHeight}
            />
            <div
              className={cn(
                'flex items-center gap-1 mt-1 text-xs',
                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              <span>{time}</span>
              {isMe && message.delivered && (
                <span className="ml-1">✓✓</span>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.text}
            </p>
            <div
              className={cn(
                'flex items-center gap-1 mt-1 text-xs',
                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              <span>{time}</span>
              {isMe && message.delivered && (
                <span className="ml-1">✓✓</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
