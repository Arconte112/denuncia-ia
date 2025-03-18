import { NextResponse } from 'next/server';

// Datos de ejemplo para la API
const exampleComplaints = [
  {
    id: "1",
    date: "2023-03-15",
    phoneNumber: "+12345678901",
    duration: "2:45",
    status: "Nuevo",
    audioUrl: "/example-audio.mp3",
    transcription: "Buenos días, quiero hacer una denuncia sobre un incidente que ocurrió ayer en la calle Principal. Aproximadamente a las 8 de la noche, presencié un acto de vandalismo donde varias personas estaban dañando propiedad pública, específicamente algunos bancos del parque y una parada de autobús. Pude identificar a al menos tres individuos, todos parecían ser jóvenes de entre 18 y 25 años. Uno llevaba una sudadera roja, otro una chaqueta negra, y el tercero vestía completamente de gris. Intenté acercarme pero se mostraron agresivos verbalmente. Hay cámaras de seguridad en la zona que podrían haber captado el incidente. Considero importante que se investigue este caso para prevenir futuros actos similares."
  },
  {
    id: "2",
    date: "2023-03-14",
    phoneNumber: "+12345678902",
    duration: "5:12",
    status: "Revisado",
    audioUrl: "/example-audio.mp3",
    transcription: "Quiero denunciar un caso de ruido excesivo que ocurre todas las noches en el apartamento vecino. Llevo más de dos semanas sin poder dormir adecuadamente debido a fiestas y música a alto volumen que continúan hasta las 3 o 4 de la madrugada. He intentado hablar con los vecinos pero no han atendido a mis peticiones. También he contactado con el administrador del edificio pero no ha tomado medidas efectivas. Esta situación está afectando seriamente mi salud y mi rendimiento laboral. Solicito que se tomen medidas urgentes para resolver este problema."
  },
  {
    id: "3",
    date: "2023-03-12",
    phoneNumber: "+12345678903",
    duration: "1:30",
    status: "En proceso",
    audioUrl: "/example-audio.mp3",
    transcription: "Hola, llamo para denunciar una situación en mi lugar de trabajo. He observado varias irregularidades en el manejo de residuos peligrosos en la fábrica donde trabajo. La empresa no está cumpliendo con los protocolos de seguridad establecidos y está desechando materiales tóxicos directamente en un arroyo cercano. Temo por las consecuencias ambientales y de salud pública que esto puede ocasionar. He intentado hablar con mis superiores pero han ignorado mis preocupaciones. Prefiero mantener mi identidad anónima por temor a represalias laborales."
  }
];

export async function GET() {
  // En una implementación real, obtendríamos las denuncias de una base de datos
  return NextResponse.json(exampleComplaints);
}

// Ruta para obtener una denuncia específica por ID
export async function POST(request: Request) {
  // En una implementación real, aquí crearíamos una nueva denuncia
  const data = await request.json();
  
  const nuevaDenuncia = {
    id: (exampleComplaints.length + 1).toString(),
    date: new Date().toISOString().split('T')[0],
    phoneNumber: data.phoneNumber || "desconocido",
    duration: data.duration || "0:00",
    status: "Nuevo",
    audioUrl: data.audioUrl || "/example-audio.mp3",
    transcription: data.transcription || "Sin transcripción"
  };
  
  // En una implementación real, guardaríamos en la base de datos
  // exampleComplaints.push(nuevaDenuncia);
  
  return NextResponse.json(nuevaDenuncia);
} 