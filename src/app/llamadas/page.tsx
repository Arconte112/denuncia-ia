"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Phone, ArrowDownLeft, Clock, Loader2, Search, RefreshCw, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";

// Tipos para los datos de la API
interface Call {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  duration: string;
  status: string;
  hasDenuncia: boolean;
  callSid?: string;
  recordingSid?: string | null;
  notes?: string | null;
  complaintId?: string | null;
  complaintCategory?: string | null;
  complaintSummary?: string | null;
}

interface CallStats {
  totalCalls: number;
  callsWithComplaints: number;
  conversionRate: number;
  avgDuration: string;
}

interface CallsData {
  calls: Call[];
  stats: CallStats;
}

// Intervalo de actualización en milisegundos (30 segundos)
const AUTO_REFRESH_INTERVAL = 30000;

export default function LlamadasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CallsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Obtener datos de llamadas
  const fetchCalls = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      logger.debug('Solicitando datos de llamadas', {
        service: 'llamadas-page',
        context: { isRefresh }
      });
      
      const response = await fetch('/api/llamadas');
      
      if (!response.ok) {
        throw new Error('Error loading calls');
      }
      
      const callsData = await response.json();
      setData(callsData);
      setLastUpdated(new Date());
      setError(null);
      
      logger.debug('Datos de llamadas actualizados', {
        service: 'llamadas-page',
        context: { 
          totalCalls: callsData.calls.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error:', err);
      logger.error('Error al cargar datos de llamadas', {
        service: 'llamadas-page',
        error: err
      });
      setError('Could not load calls. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cargar las llamadas al inicio
  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  // Configurar actualización automática
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCalls(true);
    }, AUTO_REFRESH_INTERVAL);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [fetchCalls]);

  // Filtrar llamadas basado en la búsqueda
  const filteredCalls = data?.calls.filter(call => 
    call.phoneNumber.includes(searchTerm) ||
    call.id.includes(searchTerm) ||
    call.date.includes(searchTerm)
  ) || [];

  // Función para actualizar manualmente
  const handleRefresh = () => {
    fetchCalls(true);
  };

  // Función para formatear la hora de última actualización
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };

  // Función para navegar a los detalles de una denuncia
  const goToComplaint = (complaintId: string) => {
    router.push(`/denuncias/${complaintId}`);
  };

  // Renderizar estado de carga
  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading call data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Renderizar error
  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="p-6 bg-destructive/10 rounded-lg text-center max-w-md">
            <h2 className="text-lg font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Incoming Calls</h1>
            <p className="text-muted-foreground">
              Record of incoming calls to the complaint number
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search calls..." 
                className="w-64 pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing || loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Calls
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.totalCalls || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last update: {formatLastUpdated()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Generated Complaints
              </CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.stats.callsWithComplaints || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.conversionRate || 0}% conversion
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.avgDuration || "0:00"}</div>
              <p className="text-xs text-muted-foreground">
                Minutes per call
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Call History</CardTitle>
          </CardHeader>
          <CardContent>
            {(loading || refreshing) && data ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>{refreshing ? "Updating..." : "Loading..."}</span>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          {data?.calls.length === 0 
                            ? "No calls registered yet" 
                            : "No calls found with the search term"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCalls.map((call) => (
                        <TableRow key={call.id}>
                          <TableCell>{call.date}</TableCell>
                          <TableCell>{call.time}</TableCell>
                          <TableCell>{call.phoneNumber}</TableCell>
                          <TableCell>{call.duration}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              call.status === 'Completed' 
                                ? 'bg-green-500/20 text-green-500' 
                                : call.status === 'In progress' 
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {call.status === 'Completed' 
                                ? 'Completed' 
                                : call.status === 'In progress'
                                ? 'In progress'
                                : 'Error'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              call.hasDenuncia 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-gray-500/20 text-gray-500'
                            }`}>
                              {call.hasDenuncia ? 'Generated' : 'Not generated'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {call.hasDenuncia && call.complaintId && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-secondary"
                                onClick={() => goToComplaint(call.complaintId as string)}
                                title="View complaint details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredCalls.length} of {data?.calls.length || 0} calls · 
                    Last update: {formatLastUpdated()} · 
                    {refreshing && <span className="ml-2 text-primary">Updating...</span>}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 