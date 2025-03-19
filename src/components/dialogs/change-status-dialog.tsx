import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Tipo para estados de la denuncia
type ComplaintStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

// Mapeo de estados para visualización
const statusDisplay = {
  'new': { label: 'Nuevo', className: 'bg-green-500/20 text-green-500' },
  'in_progress': { label: 'En proceso', className: 'bg-yellow-500/20 text-yellow-500' },
  'resolved': { label: 'Resuelto', className: 'bg-blue-500/20 text-blue-500' },
  'closed': { label: 'Cerrado', className: 'bg-gray-500/20 text-gray-500' }
};

interface ChangeStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: ComplaintStatus;
  complaintId: string;
  onStatusChanged: (newStatus: ComplaintStatus) => void;
}

export function ChangeStatusDialog({
  isOpen,
  onClose,
  currentStatus,
  complaintId,
  onStatusChanged
}: ChangeStatusDialogProps) {
  const [status, setStatus] = useState<ComplaintStatus>(currentStatus);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (status === currentStatus) {
      toast.error("Debes seleccionar un estado diferente al actual");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/denuncias/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la denuncia');
      }

      // Esperar un momento para que el usuario vea el estado de "Guardando..."
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Estado actualizado a "${statusDisplay[status].label}"`);
      onStatusChanged(status);
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo actualizar el estado. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStatus(currentStatus);
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado de la denuncia</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo estado para la denuncia #{complaintId.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup value={status} onValueChange={(val) => setStatus(val as ComplaintStatus)} className="space-y-3">
            {Object.entries(statusDisplay).map(([key, { label, className }]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`status-${key}`} disabled={key === currentStatus} />
                <Label htmlFor={`status-${key}`} className="flex items-center">
                  <span className={`mr-2 px-2 py-1 rounded-full text-xs ${className}`}>
                    {label}
                  </span>
                  {key === currentStatus && <span className="text-xs text-muted-foreground">(Estado actual)</span>}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-4">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Añade notas sobre este cambio de estado"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={status === currentStatus || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 