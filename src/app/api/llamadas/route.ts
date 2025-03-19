import { NextResponse } from 'next/server';
import { callService } from '@/lib/db-service';

export async function GET() {
  try {
    // Obtener todas las llamadas
    const calls = await callService.getAll();
    
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
      return {
        id: call.id,
        date: date.toISOString().split('T')[0], // formato YYYY-MM-DD
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        phoneNumber: call.phone_number,
        duration: call.duration !== null ? formatDuration(call.duration) : 'N/A',
        status: call.status === 'failed' ? 'Fallida' : (call.status === 'completed' ? 'Completada' : 'En progreso'),
        hasDenuncia: call.has_complaint,
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