import React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (name: string) => void;
  mode: 'save' | 'rename';
}

export function SaveContactDialog({
  open,
  onOpenChange,
  currentName,
  onSave,
  mode
}: SaveContactDialogProps) {
  const [name, setName] = useState(currentName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'save' ? 'Salvar Contato' : 'Renomear Contato'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save' 
              ? 'Dê um nome para este contato para reconectá-lo facilmente no futuro.'
              : 'Digite o novo nome para este contato.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Nome do Contato</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: João, Trabalho, Amigo..."
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {mode === 'save' ? 'Salvar' : 'Renomear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
