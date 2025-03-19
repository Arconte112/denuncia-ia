import { NextResponse } from 'next/server';
import { complaintService } from '@/lib/db-service';
import { Complaint } from '@/lib/supabase';

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
    
    // Si se está actualizando el estado, usar updateStatus para mantener un historial
    if (data.status !== undefined && data.status !== existingComplaint.status) {
      // Validar que el estado sea válido
      if (!['new', 'in_progress', 'resolved', 'closed'].includes(data.status)) {
        return NextResponse.json(
          { error: 'Estado de denuncia no válido' },
          { status: 400 }
        );
      }
      
      // Actualizar estado y registrar en historial
      const updatedComplaint = await complaintService.updateStatus(
        id, 
        data.status as 'new' | 'in_progress' | 'resolved' | 'closed',
        data.user_id || null,
        data.notes || null
      );
      
      if (!updatedComplaint) {
        return NextResponse.json(
          { error: 'Error al actualizar el estado de la denuncia' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(updatedComplaint);
    } 
    
    // Para otros campos, usar el método update normal
    // Filtrar solo los campos permitidos para actualización
    const updatesData: Partial<Complaint> = {};
    
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
    if (data.summary !== undefined) updatesData.summary = data.summary;
    
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