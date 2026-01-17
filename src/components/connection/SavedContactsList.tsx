import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Users, Trash2, MessageCircle, Clock } from 'lucide-react';
import type { SavedContact } from '@/types';

interface SavedContactsListProps {
  contacts: SavedContact[];
  onSelectContact: (contact: SavedContact) => void;
  onDeleteContact: (contactId: string) => void;
}

export function SavedContactsList({ contacts, onSelectContact, onDeleteContact }: SavedContactsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (contacts.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nenhum contato salvo
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Conecte-se com alguém e salve o contato para futuras conversas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Contatos Salvos
        </CardTitle>
        <CardDescription>
          Clique em um contato para reconectar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{contact.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {contact.lastConnected 
                      ? `Última conexão: ${formatDate(contact.lastConnected)}`
                      : `Criado: ${formatDate(contact.createdAt)}`
                    }
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onSelectContact(contact)}
                  >
                    Conectar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(contact.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{contact.name}"? 
                          O histórico de mensagens será mantido, mas você precisará 
                          trocar códigos novamente para reconectar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingId(null)}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (deletingId) {
                              onDeleteContact(deletingId);
                              setDeletingId(null);
                            }
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
