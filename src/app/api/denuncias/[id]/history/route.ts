import { NextResponse } from 'next/server';
import { complaintService } from '@/lib/db-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Asegurarnos de que params esté resuelto
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Verificar que la denuncia existe
    const complaint = await complaintService.getById(id);
    if (!complaint) {
      return NextResponse.json(
        { error: 'Denuncia no encontrada' },
        { status: 404 }
      );
    }
    
    // Obtener el historial
    const history = await complaintService.getHistory(id);
    return NextResponse.json(history);
  } catch (error) {
    console.error(`Error al obtener historial de la denuncia:`, error);
    return NextResponse.json(
      { error: 'Error al obtener el historial' },
      { status: 500 }
    );
  }
} 