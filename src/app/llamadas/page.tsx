"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Phone, ArrowDownLeft, Clock, Loader2, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/logger";

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
        throw new Error('Error al cargar las llamadas');
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
      setError('No se pudieron cargar las llamadas. Intente nuevamente más tarde.');
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

  // Renderizar estado de carga
  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Cargando datos de llamadas...</p>
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
              Intentar nuevamente
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
            <h1 className="text-3xl font-bold tracking-tight">Llamadas Entrantes</h1>
            <p className="text-muted-foreground">
              Registro de llamadas entrantes al número de denuncias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Buscar llamadas..." 
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
              Actualizar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Llamadas
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.totalCalls || 0}</div>
              <p className="text-xs text-muted-foreground">
                Última actualización: {formatLastUpdated()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Denuncias Generadas
              </CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.stats.callsWithComplaints || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.conversionRate || 0}% de conversión
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Duración Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.avgDuration || "0:00"}</div>
              <p className="text-xs text-muted-foreground">
                Minutos por llamada
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            {(loading || refreshing) && data ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>{refreshing ? "Actualizando..." : "Cargando..."}</span>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Denuncia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          {data?.calls.length === 0 
                            ? "No hay llamadas registradas aún" 
                            : "No se encontraron llamadas con el término de búsqueda"}
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
                              call.status === 'completed' 
                                ? 'bg-green-500/20 text-green-500' 
                                : call.status === 'in-progress' 
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {call.status === 'completed' 
                                ? 'Completada' 
                                : call.status === 'in-progress'
                                ? 'En curso'
                                : 'Error'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              call.hasDenuncia 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-gray-500/20 text-gray-500'
                            }`}>
                              {call.hasDenuncia ? 'Generada' : 'No generada'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredCalls.length} de {data?.calls.length || 0} llamadas · 
                    Última actualización: {formatLastUpdated()} · 
                    {refreshing && <span className="ml-2 text-primary">Actualizando...</span>}
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