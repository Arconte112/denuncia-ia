import { NextResponse } from 'next/server';
import { callService } from '@/lib/db-service';
import { supabase } from '@/lib/supabase';

// Definir una interfaz para la denuncia
interface ComplaintInfo {
  id: string;
  call_id: string;
  category: string | null;
  summary: string | null;
}

// Definir interfaz para el mapa de denuncias
interface ComplaintsMap {
  [key: string]: ComplaintInfo;
}

export async function GET() {
  try {
    // Obtener todas las llamadas
    const calls = await callService.getAll();

    // Obtener información de denuncias para las llamadas que tienen una
    const callIds = calls.filter(call => call.has_complaint).map(call => call.id);
    
    // Inicializar un mapa con tipo específico
    let complaintsMap: ComplaintsMap = {};
    
    if (callIds.length > 0) {
      const { data: complaints } = await supabase
        .from('complaints')
        .select('id, call_id, category, summary')
        .in('call_id', callIds);
      
      if (complaints) {
        // Crear un mapa de call_id -> complaint para fácil acceso
        complaintsMap = complaints.reduce((map: ComplaintsMap, complaint) => {
          map[complaint.call_id] = complaint;
          return map;
        }, {});
      }
    }
    
    // Calcular estadísticas adicionales
    let totalDuration = 0;
    let validCalls = 0;
    
    calls.forEach(call => {
      if (call.duration !== null) {
        totalDuration += call.duration;
        validCalls++;
      }
    });
    
    const avgDuration = validCalls > 0 ? Math.round(totalDuration / validCalls) : 0;
    const avgMinutes = Math.floor(avgDuration / 60);
    const avgSeconds = avgDuration % 60;
    const formattedAvgDuration = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;
    
    // Calcular la tasa de conversión a denuncias
    const callsWithComplaints = calls.filter(call => call.has_complaint).length;
    const conversionRate = calls.length > 0 
      ? Math.round((callsWithComplaints / calls.length) * 100) 
      : 0;
    
    // Formatear los datos para la visualización
    const formattedCalls = calls.map(call => {
      // Formatear la fecha y hora
      const date = new Date(call.timestamp);
      
      // Obtener información de la denuncia si existe
      const complaint = call.has_complaint ? complaintsMap[call.id] : null;
      
      return {
        id: call.id,
        date: date.toISOString().split('T')[0], // formato YYYY-MM-DD
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        phoneNumber: call.phone_number,
        duration: call.duration !== null ? formatDuration(call.duration) : 'N/A',
        status: call.status === 'failed' ? 'Error' : (call.status === 'completed' ? 'Completed' : 'In progress'),
        hasDenuncia: call.has_complaint,
        complaintId: complaint ? complaint.id : null,
        complaintCategory: complaint ? complaint.category : null,
        complaintSummary: complaint ? complaint.summary : null,
        callSid: call.call_sid,
        recordingSid: call.recording_sid,
        audioUrl: call.audio_url,
        notes: call.notes
      };
    });
    
    return NextResponse.json({
      calls: formattedCalls,
      stats: {
        totalCalls: calls.length,
        callsWithComplaints,
        conversionRate,
        avgDuration: formattedAvgDuration
      }
    });
  } catch (error) {
    console.error('Error al obtener las llamadas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las llamadas' },
      { status: 500 }
    );
  }
}

// Función auxiliar para formatear la duración en formato mm:ss
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 