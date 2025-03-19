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
  'new': { label: 'New', className: 'bg-green-500/20 text-green-500' },
  'in_progress': { label: 'In progress', className: 'bg-yellow-500/20 text-yellow-500' },
  'resolved': { label: 'Resolved', className: 'bg-blue-500/20 text-blue-500' },
  'closed': { label: 'Closed', className: 'bg-gray-500/20 text-gray-500' }
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
      toast.error("You must select a different status from the current one");
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
        throw new Error('Error updating complaint status');
      }

      // Esperar un momento para que el usuario vea el estado de "Guardando..."
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Status updated to "${statusDisplay[status].label}"`);
      onStatusChanged(status);
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Status could not be updated. Please try again.');
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
          <DialogTitle>Change complaint status</DialogTitle>
          <DialogDescription>
            Select new status for complaint #{complaintId.substring(0, 8)}
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
                  {key === currentStatus && <span className="text-xs text-muted-foreground">(Current status)</span>}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-4">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Add notes about this status change"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={status === currentStatus || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 