import { NextResponse } from 'next/server';
import { complaintService } from '@/lib/db-service';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    // Resolver el ID de la llamada
    const resolvedParams = await params;
    const callId = resolvedParams.callId;
    
    // Buscar denuncias asociadas a esa llamada
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        call:calls(*),
        assigned_user:users(*)
      `)
      .eq('call_id', callId)
      .single();
    
    if (error || !data) {
      console.error(`Error al obtener denuncia para la llamada ${callId}:`, error);
      return NextResponse.json(
        { error: 'Denuncia no encontrada para esta llamada' },
        { status: 404 }
      );
    }
    
    // Redirigir a la página de detalle de denuncia
    // Usamos Response en lugar de NextResponse para la redirección
    return Response.redirect(new URL(`/denuncias/${data.id}`, request.url));
  } catch (error) {
    console.error(`Error al obtener denuncia por llamada:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 