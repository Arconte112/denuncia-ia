"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Activity, FileText, Phone, UserCheck, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

// Tipos para los datos de la API
interface StatsItem {
  title: string;
  value: string;
  description: string;
  icon: string;
}

interface ChartDataItem {
  name: string;
  denuncias: number;
  llamadas: number;
}

interface TypeDataItem {
  name: string;
  cantidad: number;
}

interface LatestComplaint {
  id: string;
  category: string;
  created_at: string;
  status: string;
}

interface StatusDistribution {
  new: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

interface DashboardData {
  statsData: StatsItem[];
  chartData: ChartDataItem[];
  typeData: TypeDataItem[];
  latestComplaints: LatestComplaint[];
  statusDistribution: StatusDistribution;
}

// Funciones para traducir textos de la API
const translateStatTitle = (title: string): string => {
  const translations: Record<string, string> = {
    'Total Denuncias': 'Total Complaints',
    'Denuncias Pendientes': 'Pending Complaints',
    'Denuncias Resueltas': 'Resolved Complaints',
    'Denuncias Procesadas': 'Processed Complaints',
    'Tasa de Resolución': 'Resolution Rate',
    'Llamadas Recibidas': 'Received Calls',
    'Duración Promedio': 'Average Duration',
    'Tiempo Promedio': 'Average Time',
    'Usuarios Activos': 'Active Users'
  };
  return translations[title] || title;
};

const translateStatDescription = (description: string): string => {
  const translations: Record<string, string> = {
    'Total de denuncias registradas': 'Total registered complaints',
    'Denuncias sin resolver': 'Unresolved complaints',
    'Denuncias marcadas como resueltas': 'Complaints marked as resolved',
    'Porcentaje de resolución': 'Resolution percentage',
    'Llamadas recibidas': 'Received calls',
    'Promedio de duración de llamadas': 'Average call duration',
    'Duración promedio de llamadas': 'Average call duration',
    'Usuarios activos en el sistema': 'Active users in the system',
    '100% más que el mes pasado': '100% more than last month',
    '11% de las denuncias totales': '11% of total complaints'
  };
  return translations[description] || description;
};

const translateChartData = (chartData: ChartDataItem[]): any[] => {
  return chartData.map(item => ({
    name: item.name,
    complaints: item.denuncias,
    calls: item.llamadas
  }));
};

const translateTypeData = (typeData: TypeDataItem[]): any[] => {
  return typeData.map(item => ({
    name: item.name,
    quantity: item.cantidad
  }));
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Evitar errores de hidratación de SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Error loading dashboard data');
        }
        
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Error:', err);
        setError('Could not load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Renderizar estado de carga
  if (loading || !mounted) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Renderizar error
  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="p-6 bg-destructive/10 rounded-lg text-center max-w-md">
            <h2 className="text-lg font-bold mb-2">Error</h2>
            <p>{error || 'Could not load dashboard data.'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mapeo de nombres de iconos a componentes
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="h-5 w-5" />;
      case 'Phone': return <Phone className="h-5 w-5" />;
      case 'UserCheck': return <UserCheck className="h-5 w-5" />;
      case 'Activity': return <Activity className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // Mapeo de estados a nombres en español
  const statusMap: Record<string, string> = {
    'new': 'New',
    'in_progress': 'In progress',
    'resolved': 'Resolved',
    'closed': 'Closed'
  };

  // Función para formatear fechas relativas
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const complaintDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - complaintDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else {
      return `${diffHours}h ago`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name ? `Hello, ${user.name}` : user?.email}
            </span>
            <Button variant="outline" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Overview of the complaint system.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.statsData.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {translateStatTitle(stat.title)}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  {getIcon(stat.icon)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {translateStatDescription(stat.description)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Complaints Evolution</CardTitle>
              <CardDescription>
                Total complaints and calls per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={translateChartData(data.chartData)}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                        border: '1px solid #333',
                        color: '#fff'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="calls" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="complaints" 
                      stroke="#82ca9d" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Complaint Types</CardTitle>
              <CardDescription>
                Classification by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={translateTypeData(data.typeData)}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                        border: '1px solid #333',
                        color: '#fff'
                      }} 
                    />
                    <Bar 
                      dataKey="quantity" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Latest Complaints</CardTitle>
              <CardDescription>
                The {data.latestComplaints.length} most recent complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.latestComplaints.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No complaints registered yet.
                  </div>
                ) : (
                  data.latestComplaints.map((complaint) => (
                    <div key={complaint.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">Complaint #{complaint.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {complaint.category}
                        </p>
                      </div>
                      <div className="text-sm">
                        {formatRelativeTime(complaint.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>
                Current status of complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>New</span>
                  </div>
                  <span className="font-medium">{data.statusDistribution.new}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-green-500" style={{ 
                    width: `${data.statusDistribution.new * 100 / 
                      (data.statusDistribution.new + 
                       data.statusDistribution.in_progress + 
                       data.statusDistribution.resolved + 
                       data.statusDistribution.closed) || 0}%` 
                  }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span>In progress</span>
                  </div>
                  <span className="font-medium">{data.statusDistribution.in_progress}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ 
                    width: `${data.statusDistribution.in_progress * 100 / 
                      (data.statusDistribution.new + 
                       data.statusDistribution.in_progress + 
                       data.statusDistribution.resolved + 
                       data.statusDistribution.closed) || 0}%` 
                  }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>Resolved</span>
                  </div>
                  <span className="font-medium">{data.statusDistribution.resolved}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-blue-500" style={{ 
                    width: `${data.statusDistribution.resolved * 100 / 
                      (data.statusDistribution.new + 
                       data.statusDistribution.in_progress + 
                       data.statusDistribution.resolved + 
                       data.statusDistribution.closed) || 0}%` 
                  }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500" />
                    <span>Closed</span>
                  </div>
                  <span className="font-medium">{data.statusDistribution.closed}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-gray-500" style={{ 
                    width: `${data.statusDistribution.closed * 100 / 
                      (data.statusDistribution.new + 
                       data.statusDistribution.in_progress + 
                       data.statusDistribution.resolved + 
                       data.statusDistribution.closed) || 0}%` 
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}