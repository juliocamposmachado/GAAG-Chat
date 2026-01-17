import { Phone, PhoneOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface IncomingCallDialogProps {
  open: boolean;
  contactName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallDialog({ open, contactName, onAccept, onReject }: IncomingCallDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-2xl">
            Chamada de Voz
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg pt-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Phone className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{contactName}</p>
                <p className="text-sm text-muted-foreground">está chamando...</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-4 justify-center">
          <Button
            variant="destructive"
            size="lg"
            onClick={onReject}
            className="flex-1"
          >
            <PhoneOff className="w-5 h-5 mr-2" />
            Recusar
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Phone className="w-5 h-5 mr-2" />
            Atender
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
