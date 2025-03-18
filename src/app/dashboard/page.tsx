"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Activity, FileText, Phone, UserCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Datos de ejemplo para las estadísticas
const statsData = [
  {
    title: "Total Denuncias",
    value: "128",
    description: "12% más que el mes pasado",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Llamadas Recibidas",
    value: "154",
    description: "5% más que el mes pasado",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    title: "Denuncias Procesadas",
    value: "94",
    description: "73% de las denuncias totales",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    title: "Tiempo Promedio",
    value: "3:42",
    description: "Duración promedio de llamadas",
    icon: <Activity className="h-5 w-5" />,
  },
];

// Datos de ejemplo para los gráficos
const chartData = [
  { name: 'Ene', denuncias: 4, llamadas: 8 },
  { name: 'Feb', denuncias: 10, llamadas: 12 },
  { name: 'Mar', denuncias: 15, llamadas: 20 },
  { name: 'Abr', denuncias: 12, llamadas: 15 },
  { name: 'May', denuncias: 20, llamadas: 25 },
  { name: 'Jun', denuncias: 25, llamadas: 30 },
];

const typeData = [
  { name: 'Ruido', cantidad: 32 },
  { name: 'Vandalismo', cantidad: 24 },
  { name: 'Robo', cantidad: 18 },
  { name: 'Ambientales', cantidad: 15 },
  { name: 'Otros', cantidad: 11 },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Vista general del sistema de denuncias.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Evolución de Denuncias</CardTitle>
              <CardDescription>
                Total de denuncias y llamadas por mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
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
                      dataKey="llamadas" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="denuncias" 
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
              <CardTitle>Tipos de Denuncia</CardTitle>
              <CardDescription>
                Clasificación por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={typeData}
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
                      dataKey="cantidad" 
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
              <CardTitle>Últimas Denuncias</CardTitle>
              <CardDescription>
                Las 5 denuncias más recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">Denuncia #{128 - i + 1}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {i === 1 ? "Ruido excesivo en vecindario" : 
                         i === 2 ? "Vandalismo en parque público" :
                         i === 3 ? "Vertido ilegal de residuos" :
                         i === 4 ? "Acoso en lugar de trabajo" : 
                                  "Estafa telefónica"}
                      </p>
                    </div>
                    <div className="text-sm">
                      {i === 1 ? "hace 2h" : 
                       i === 2 ? "hace 5h" :
                       i === 3 ? "hace 1d" :
                       i === 4 ? "hace 2d" : 
                                "hace 3d"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>
                Estado actual de las denuncias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Nuevo</span>
                  </div>
                  <span className="font-medium">42</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '33%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span>En proceso</span>
                  </div>
                  <span className="font-medium">54</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: '42%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>Resuelto</span>
                  </div>
                  <span className="font-medium">32</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '25%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 