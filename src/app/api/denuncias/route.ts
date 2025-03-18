import { NextResponse } from 'next/server';
import { complaintService } from '@/lib/db-service';
import { Complaint } from '@/lib/supabase';

export async function GET() {
  try {
    const complaints = await complaintService.getAll();
    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Error al obtener denuncias:', error);
    return NextResponse.json(
      { error: 'Error al obtener las denuncias' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newComplaint: Partial<Complaint> = {
      call_id: data.call_id,
      transcription: data.transcription || null,
      status: 'new' as const,
      category: data.category || null,
      priority: (data.priority || 'medium') as 'low' | 'medium' | 'high',
      assigned_to: data.assigned_to || null,
      resolution: null,
      resolved_at: null
    };
    
    const complaint = await complaintService.create(newComplaint);
    
    if (!complaint) {
      return NextResponse.json(
        { error: 'No se pudo crear la denuncia' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Error al crear denuncia:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 