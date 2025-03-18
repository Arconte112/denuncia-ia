"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChevronLeft, Download, FileText } from "lucide-react";

// Datos de ejemplo para mostrar en la página
const exampleComplaints = {
  "1": {
    id: "1",
    date: "2023-03-15",
    phoneNumber: "+12345678901",
    duration: "2:45",
    status: "Nuevo",
    audioUrl: "/example-audio.mp3",
    transcription: "Buenos días, quiero hacer una denuncia sobre un incidente que ocurrió ayer en la calle Principal. Aproximadamente a las 8 de la noche, presencié un acto de vandalismo donde varias personas estaban dañando propiedad pública, específicamente algunos bancos del parque y una parada de autobús. Pude identificar a al menos tres individuos, todos parecían ser jóvenes de entre 18 y 25 años. Uno llevaba una sudadera roja, otro una chaqueta negra, y el tercero vestía completamente de gris. Intenté acercarme pero se mostraron agresivos verbalmente. Hay cámaras de seguridad en la zona que podrían haber captado el incidente. Considero importante que se investigue este caso para prevenir futuros actos similares."
  },
  "2": {
    id: "2",
    date: "2023-03-14",
    phoneNumber: "+12345678902",
    duration: "5:12",
    status: "Revisado",
    audioUrl: "/example-audio.mp3",
    transcription: "Quiero denunciar un caso de ruido excesivo que ocurre todas las noches en el apartamento vecino. Llevo más de dos semanas sin poder dormir adecuadamente debido a fiestas y música a alto volumen que continúan hasta las 3 o 4 de la madrugada. He intentado hablar con los vecinos pero no han atendido a mis peticiones. También he contactado con el administrador del edificio pero no ha tomado medidas efectivas. Esta situación está afectando seriamente mi salud y mi rendimiento laboral. Solicito que se tomen medidas urgentes para resolver este problema."
  },
  "3": {
    id: "3",
    date: "2023-03-12",
    phoneNumber: "+12345678903",
    duration: "1:30",
    status: "En proceso",
    audioUrl: "/example-audio.mp3",
    transcription: "Hola, llamo para denunciar una situación en mi lugar de trabajo. He observado varias irregularidades en el manejo de residuos peligrosos en la fábrica donde trabajo. La empresa no está cumpliendo con los protocolos de seguridad establecidos y está desechando materiales tóxicos directamente en un arroyo cercano. Temo por las consecuencias ambientales y de salud pública que esto puede ocasionar. He intentado hablar con mis superiores pero han ignorado mis preocupaciones. Prefiero mantener mi identidad anónima por temor a represalias laborales."
  },
  "4": {
    id: "4",
    date: "2023-03-10",
    phoneNumber: "+12345678904",
    duration: "3:22",
    status: "Nuevo",
    audioUrl: "/example-audio.mp3",
    transcription: "Buenas tardes, quiero reportar una posible estafa telefónica. Recibí varias llamadas de un número desconocido donde se identificaron como representantes de mi banco, solicitando información personal y financiera. Me resultó sospechoso porque mencionaron detalles incorrectos sobre mi cuenta. Al negarse a proporcionar un número oficial de contacto para verificar su identidad, decidí colgar. Considero importante alertar sobre este posible intento de fraude ya que podrían estar contactando a otros clientes del mismo banco."
  },
  "5": {
    id: "5",
    date: "2023-03-08",
    phoneNumber: "+12345678905",
    duration: "4:15",
    status: "Revisado",
    audioUrl: "/example-audio.mp3",
    transcription: "Llamo para denunciar un caso recurrente de acoso callejero que está ocurriendo en la avenida Constitución, cerca de la parada de autobús principal. Un individuo de aproximadamente 40 años está intimidando regularmente a las mujeres que esperan el transporte, con comentarios inapropiados y siguiéndolas ocasionalmente. Esto ocurre principalmente en horarios de la mañana, entre las 7 y 9 AM. Varias personas han modificado sus rutas por temor. Solicito que se incremente la vigilancia policial en esta zona durante esos horarios."
  }
};

export default function DenunciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const complaint = exampleComplaints[id as keyof typeof exampleComplaints];

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-center text-red-500">Denuncia no encontrada</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="mb-4">La denuncia que estás buscando no existe o ha sido eliminada.</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Denuncia #{complaint.id}</h1>
              <p className="text-muted-foreground">
                Recibida el {complaint.date}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar audio
          </Button>
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
                  <dd>{complaint.id}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Fecha</dt>
                  <dd>{complaint.date}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Número</dt>
                  <dd>{complaint.phoneNumber}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Duración</dt>
                  <dd>{complaint.duration}</dd>
                </div>
                <div className="flex flex-row justify-between">
                  <dt className="font-medium text-muted-foreground">Estado</dt>
                  <dd>
                    <span className={`px-2 py-1 rounded-full text-xs
                      ${complaint.status === "Nuevo" ? "bg-green-500/20 text-green-500" : ""}
                      ${complaint.status === "Revisado" ? "bg-blue-500/20 text-blue-500" : ""}
                      ${complaint.status === "En proceso" ? "bg-yellow-500/20 text-yellow-500" : ""}
                    `}>
                      {complaint.status}
                    </span>
                  </dd>
                </div>
              </dl>
              
              <div className="mt-6 space-y-2">
                <Button className="w-full">
                  Cambiar estado
                </Button>
                <Button variant="outline" className="w-full">
                  Asignar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Grabación y Transcripción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Audio Original</h3>
                <div className="p-4 bg-secondary/50 rounded-md">
                  <audio controls className="w-full">
                    <source src={complaint.audioUrl} type="audio/mpeg" />
                    Tu navegador no soporta la reproducción de audio.
                  </audio>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Transcripción</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Generado con Whisper AI
                  </div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-md overflow-auto max-h-[400px]">
                  <p className="text-sm whitespace-pre-wrap">{complaint.transcription}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 