"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChevronLeft, Download, FileText, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChangeStatusDialog } from "@/components/dialogs/change-status-dialog";
import { StatusHistory } from "@/components/complaint/status-history";

// Tipo para la denuncia
interface Complaint {
  id: string;
  call_id: string;
  transcription: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  category: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  call?: {
    phone_number: string;
    duration: number | null;
    audio_url: string | null;
    recording_sid: string | null;
    call_sid: string;
    timestamp: string;
  };
  summary?: string;
}

// Mapeo de estados para visualización
const statusDisplay = {
  'new': { label: 'Nuevo', className: 'bg-green-500/20 text-green-500' },
  'in_progress': { label: 'En proceso', className: 'bg-yellow-500/20 text-yellow-500' },
  'resolved': { label: 'Resuelto', className: 'bg-blue-500/20 text-blue-500' },
  'closed': { label: 'Cerrado', className: 'bg-gray-500/20 text-gray-500' }
};

// Intervalo de actualización en milisegundos (30 segundos)
const AUTO_REFRESH_INTERVAL = 30000;

export default function DenunciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Usar React.use para desenvolver la promesa de params
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);

  // Función para formatear la duración en minutos:segundos
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para obtener la URL de audio a través de nuestro proxy
  const getProxyAudioUrl = (recordingSid: string | null) => {
    if (!recordingSid) return null;
    return `/api/audio?recording_sid=${recordingSid}`;
  };

  // Función para cargar los datos de la denuncia
  const fetchComplaint = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch(`/api/denuncias/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Denuncia no encontrada');
        }
        throw new Error('Error al cargar la denuncia');
      }
      
      const data = await response.json();
      setComplaint(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la denuncia');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Función para actualizar manualmente
  const handleRefresh = () => {
    fetchComplaint(true);
  };

  // Cargar los datos de la denuncia inicialmente
  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  // Configurar actualización automática
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchComplaint(true);
    }, AUTO_REFRESH_INTERVAL);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [fetchComplaint]);

  // Función para formatear la hora de última actualización
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Cargando detalles de la denuncia...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-center text-red-500">Denuncia no encontrada</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="mb-4">{error || 'La denuncia que estás buscando no existe o ha sido eliminada.'}</p>
              <Button asChild>
                <Link href="/denuncias">
                  Volver al listado de denuncias
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Obtener URL del audio utilizando nuestro proxy
  const proxyAudioUrl = complaint.call && complaint.call.recording_sid 
    ? getProxyAudioUrl(complaint.call.recording_sid)
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="icon" className="h-8 w-8">
              <Link href="/denuncias">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Denuncia #{complaint.id.substring(0, 8)}</h1>
              <p className="text-muted-foreground">
                Recibida el {complaint.created_at ? format(new Date(complaint.created_at), 'PPP', { locale: es }) : 'fecha desconocida'}
                {refreshing && <span className="ml-2 text-primary animate-pulse"> · Actualizando...</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            {proxyAudioUrl && (
              <Button variant="outline" asChild>
                <a href={proxyAudioUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar audio
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">ID</dt>
                  <dd className="font-mono">{complaint.id.substring(0, 12)}...</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Fecha</dt>
                  <dd>{complaint.created_at ? format(new Date(complaint.created_at), 'PPP', { locale: es }) : 'N/A'}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Número</dt>
                  <dd>{complaint.call?.phone_number || 'Desconocido'}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Duración</dt>
                  <dd>{complaint.call?.duration !== undefined ? formatDuration(complaint.call.duration) : 'N/A'}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Categoría</dt>
                  <dd>{complaint.category || 'Sin categoría'}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Prioridad</dt>
                  <dd className={`px-2 py-1 rounded-full text-xs ${
                    complaint.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                    complaint.priority === 'medium' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {complaint.priority === 'high' ? 'Alta' : 
                     complaint.priority === 'medium' ? 'Media' : 'Baja'}
                  </dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Estado</dt>
                  <dd>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusDisplay[complaint.status].className}`}>
                      {statusDisplay[complaint.status].label}
                    </span>
                  </dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Última actualización</dt>
                  <dd>{formatLastUpdated()}</dd>
                </div>
              </dl>
              
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => setIsStatusDialogOpen(true)}
                >
                  Cambiar estado
                </Button>
              </div>

              {complaint && (
                <ChangeStatusDialog
                  isOpen={isStatusDialogOpen}
                  onClose={() => setIsStatusDialogOpen(false)}
                  currentStatus={complaint.status}
                  complaintId={complaint.id}
                  onStatusChanged={(newStatus) => {
                    // Actualizar el estado local
                    setComplaint({
                      ...complaint,
                      status: newStatus
                    });
                    
                    // Indicar actualización
                    setRefreshing(true);
                    
                    // Incrementar el contador para refrescar el historial
                    setRefreshHistoryTrigger(prev => prev + 1);
                    
                    // Actualizar la hora de última actualización
                    setLastUpdated(new Date());
                    
                    // Simular un pequeño retraso antes de quitar el indicador de actualización
                    setTimeout(() => {
                      setRefreshing(false);
                    }, 1000);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Grabación y Transcripción</CardTitle>
            </CardHeader>
            <CardContent>
              {proxyAudioUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Audio Original</h3>
                  <div className="p-4 bg-secondary/50 rounded-md">
                    <audio controls className="w-full">
                      <source src={proxyAudioUrl} type="audio/mpeg" />
                      Tu navegador no soporta la reproducción de audio.
                    </audio>
                  </div>
                </div>
              )}

              {complaint.summary && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Resumen IA</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      Generado con GPT-4o
                    </div>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <p className="text-sm font-medium">{complaint.summary}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Transcripción</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Generado con Whisper AI
                  </div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-md overflow-auto max-h-[400px]">
                  {complaint.transcription ? (
                    <p className="text-sm whitespace-pre-wrap">{complaint.transcription}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay transcripción disponible para esta denuncia.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          {complaint && <StatusHistory complaintId={complaint.id} refreshTrigger={refreshHistoryTrigger} />}
        </div>
      </div>
    </DashboardLayout>
  );
} 