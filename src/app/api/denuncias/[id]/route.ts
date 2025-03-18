import { NextResponse } from 'next/server';
import { complaintService } from '@/lib/db-service';
import { Complaint } from '@/lib/supabase';

// Datos de ejemplo para la API (deben coincidir con los de la ruta principal)
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
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Asegurarnos de que params esté resuelto
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const complaint = await complaintService.getById(id);

    if (!complaint) {
      return NextResponse.json(
        { error: 'Denuncia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error(`Error al obtener la denuncia:`, error);
    return NextResponse.json(
      { error: 'Error al obtener la denuncia' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Asegurarnos de que params esté resuelto
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Verificar que la denuncia existe
    const existingComplaint = await complaintService.getById(id);

    if (!existingComplaint) {
      return NextResponse.json(
        { error: 'Denuncia no encontrada' },
        { status: 404 }
      );
    }

    // Obtener los datos a actualizar
    const data = await request.json();
    
    // Filtrar solo los campos permitidos para actualización
    const updatesData: Partial<Complaint> = {};
    
    if (data.status !== undefined) {
      // Asegurarse de que el estado sea válido
      if (!['new', 'in_progress', 'resolved', 'closed'].includes(data.status)) {
        return NextResponse.json(
          { error: 'Estado de denuncia no válido' },
          { status: 400 }
        );
      }
      updatesData.status = data.status as 'new' | 'in_progress' | 'resolved' | 'closed';
      
      // Si se está marcando como resuelta, actualizar el campo resolved_at
      if (data.status === 'resolved' && existingComplaint.status !== 'resolved') {
        updatesData.resolved_at = new Date().toISOString();
      }
    }
    
    if (data.category !== undefined) updatesData.category = data.category;
    if (data.priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(data.priority)) {
        return NextResponse.json(
          { error: 'Prioridad no válida' },
          { status: 400 }
        );
      }
      updatesData.priority = data.priority as 'low' | 'medium' | 'high';
    }
    if (data.assigned_to !== undefined) updatesData.assigned_to = data.assigned_to;
    if (data.resolution !== undefined) updatesData.resolution = data.resolution;
    if (data.transcription !== undefined) updatesData.transcription = data.transcription;
    
    // Actualizar la denuncia
    const updatedComplaint = await complaintService.update(id, updatesData);
    
    if (!updatedComplaint) {
      return NextResponse.json(
        { error: 'Error al actualizar la denuncia' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error(`Error al actualizar la denuncia:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // No implementaremos eliminación real de denuncias por motivos de auditoría
    // En su lugar, podríamos implementar un estado "archivado" o similar
    return NextResponse.json(
      { error: 'La eliminación de denuncias no está permitida' },
      { status: 403 }
    );
  } catch (error) {
    console.error(`Error al procesar la solicitud:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 