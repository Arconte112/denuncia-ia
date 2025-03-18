"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Datos de ejemplo para mostrar en la página
const exampleComplaints = [
  {
    id: "1",
    date: "2023-03-15",
    phoneNumber: "+12345678901",
    duration: "2:45",
    status: "Nuevo"
  },
  {
    id: "2",
    date: "2023-03-14",
    phoneNumber: "+12345678902",
    duration: "5:12",
    status: "Revisado"
  },
  {
    id: "3",
    date: "2023-03-12",
    phoneNumber: "+12345678903",
    duration: "1:30",
    status: "En proceso"
  },
  {
    id: "4",
    date: "2023-03-10",
    phoneNumber: "+12345678904",
    duration: "3:22",
    status: "Nuevo"
  },
  {
    id: "5",
    date: "2023-03-08",
    phoneNumber: "+12345678905",
    duration: "4:15",
    status: "Revisado"
  }
];

export default function DenunciasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Denuncias</h1>
            <p className="text-muted-foreground">
              Gestiona las denuncias recibidas por llamada telefónica
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Buscar denuncias..." 
                className="w-64 pl-8" 
              />
            </div>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Número Telefónico</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exampleComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{complaint.id}</TableCell>
                    <TableCell>{complaint.date}</TableCell>
                    <TableCell>{complaint.phoneNumber}</TableCell>
                    <TableCell>{complaint.duration}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${complaint.status === "Nuevo" ? "bg-green-500/20 text-green-500" : ""}
                        ${complaint.status === "Revisado" ? "bg-blue-500/20 text-blue-500" : ""}
                        ${complaint.status === "En proceso" ? "bg-yellow-500/20 text-yellow-500" : ""}
                      `}>
                        {complaint.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/denuncias/${complaint.id}`}>
                          Ver detalles
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {exampleComplaints.length} de {exampleComplaints.length} denuncias
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 