"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Phone, ArrowDownLeft, Clock } from "lucide-react";

// Datos de ejemplo para las llamadas (solo entrantes)
const callsData = [
  {
    id: "1",
    date: "2023-03-17",
    time: "14:25",
    phoneNumber: "+12345678901",
    duration: "2:45",
    status: "Completada",
    hasDenuncia: true,
    denunciaId: "1"
  },
  {
    id: "2",
    date: "2023-03-17",
    time: "13:10",
    phoneNumber: "+12345678902",
    duration: "5:12",
    status: "Completada",
    hasDenuncia: true,
    denunciaId: "2"
  },
  {
    id: "3",
    date: "2023-03-16",
    time: "18:42",
    phoneNumber: "+12345678903",
    duration: "1:30",
    status: "Completada",
    hasDenuncia: true,
    denunciaId: "3"
  },
  {
    id: "4",
    date: "2023-03-16",
    time: "16:33",
    phoneNumber: "+12345678904",
    duration: "0:22",
    status: "No completada",
    hasDenuncia: false
  },
  {
    id: "5",
    date: "2023-03-15",
    time: "10:15",
    phoneNumber: "+12345678905",
    duration: "4:15",
    status: "Completada",
    hasDenuncia: false
  }
];

export default function LlamadasPage() {
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
              <div className="text-2xl font-bold">{callsData.length}</div>
              <p className="text-xs text-muted-foreground">
                En los últimos 7 días
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
                {callsData.filter(call => call.hasDenuncia).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(callsData.filter(call => call.hasDenuncia).length / callsData.length * 100)}% de conversión
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
              <div className="text-2xl font-bold">2:48</div>
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
                {callsData.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>{call.date}</TableCell>
                    <TableCell>{call.time}</TableCell>
                    <TableCell>{call.phoneNumber}</TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${call.status === "Completada" ? "bg-green-500/20 text-green-500" : ""}
                        ${call.status === "No completada" ? "bg-red-500/20 text-red-500" : ""}
                      `}>
                        {call.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {call.hasDenuncia ? (
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/denuncias/${call.denunciaId}`}>
                            Ver denuncia
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">No generada</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 