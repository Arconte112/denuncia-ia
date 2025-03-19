"use client"

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export function SupportButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    if (!user || !user.email) {
      toast.error("Debe iniciar sesión para enviar un ticket de soporte");
      return;
    }

    setIsSubmitting(true);

    try {
      // Recopilar información del sistema
      const systemInfo = {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      };

      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          subject,
          message,
          systemInfo
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el ticket");
      }

      toast.success("Ticket enviado correctamente");
      setSubject("");
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo enviar el ticket. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg"
        size="icon"
      >
        <LifeBuoy className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar a Soporte</DialogTitle>
            <DialogDescription>
              Envíe un ticket con su consulta o problema y nuestro equipo le responderá a la brevedad.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3 flex items-center">
                <span className="text-sm text-muted-foreground">
                  {user?.email || "Debe iniciar sesión para enviar un ticket"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Asunto
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Problema con reproducción de audio"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Mensaje
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describa su problema o consulta con detalle..."
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit} 
              disabled={isSubmitting || !user}
            >
              {isSubmitting ? "Enviando..." : "Enviar Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 