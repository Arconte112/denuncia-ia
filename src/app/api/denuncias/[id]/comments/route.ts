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
    
    // Obtener los comentarios
    const comments = await complaintService.getComments(id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error(`Error al obtener comentarios para la denuncia:`, error);
    return NextResponse.json(
      { error: 'Error al obtener los comentarios' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    
    // Obtener los datos del comentario
    const data = await request.json();
    
    if (!data.user_id) {
      return NextResponse.json(
        { error: 'Se requiere un ID de usuario' },
        { status: 400 }
      );
    }
    
    if (!data.comment || data.comment.trim() === '') {
      return NextResponse.json(
        { error: 'El comentario no puede estar vacío' },
        { status: 400 }
      );
    }
    
    // Añadir el comentario
    const comment = await complaintService.addComment(
      id,
      data.user_id,
      data.comment
    );
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Error al añadir el comentario' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error(`Error al añadir comentario a la denuncia:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 