"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileText, Search, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

// Tipo para las denuncias
interface Complaint {
  id: string;
  call_id: string;
  transcription: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  category: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  call?: {
    phone_number: string;
    duration: number | null;
  };
}

// Mapeo de estados para visualización
const statusDisplay = {
  'new': { label: 'New', className: 'bg-green-500/20 text-green-500' },
  'in_progress': { label: 'In progress', className: 'bg-yellow-500/20 text-yellow-500' },
  'resolved': { label: 'Resolved', className: 'bg-blue-500/20 text-blue-500' },
  'closed': { label: 'Closed', className: 'bg-gray-500/20 text-gray-500' }
};

// Intervalo de actualización en milisegundos (30 segundos)
const AUTO_REFRESH_INTERVAL = 30000;

export default function DenunciasPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Función para formatear la duración en minutos:segundos
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para cargar las denuncias
  const fetchComplaints = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch('/api/denuncias');
      
      if (!response.ok) {
        throw new Error('Error loading complaints');
      }
      
      const data = await response.json();
      setComplaints(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Could not load complaints. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Función para actualizar manualmente
  const handleRefresh = () => {
    fetchComplaints(true);
  };

  // Cargar las denuncias al inicio
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Configurar actualización automática
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchComplaints(true);
    }, AUTO_REFRESH_INTERVAL);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [fetchComplaints]);

  // Filtrar denuncias basado en la búsqueda
  const filteredComplaints = complaints.filter(complaint => 
    complaint.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.call?.phone_number.includes(searchTerm) ||
    complaint.id.includes(searchTerm)
  );

  // Función para formatear la hora de última actualización
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
            <p className="text-muted-foreground">
              Manage complaints received by phone call
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search complaints..." 
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
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading complaints...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              {error}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No complaints found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComplaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-mono">{complaint.id.substring(0, 8)}...</TableCell>
                          <TableCell>{complaint.created_at 
                            ? formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true, locale: enUS }) 
                            : 'N/A'}</TableCell>
                          <TableCell>{complaint.call?.phone_number || 'Unknown'}</TableCell>
                          <TableCell>{complaint.call?.duration !== undefined ? formatDuration(complaint.call.duration) : 'N/A'}</TableCell>
                          <TableCell>{complaint.category || 'No category'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${statusDisplay[complaint.status].className}`}>
                              {statusDisplay[complaint.status].label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/denuncias/${complaint.id}`}>
                                View details
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredComplaints.length} of {complaints.length} complaints · 
                  Last updated: {formatLastUpdated()} · 
                  {refreshing && <span className="ml-2 text-primary">Updating...</span>}
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
} 