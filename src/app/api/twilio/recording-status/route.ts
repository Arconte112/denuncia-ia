import { NextRequest, NextResponse } from 'next/server';
import { audioProcessor } from '@/lib/audio-processor';

export async function POST(request: NextRequest) {
  try {
    // Parsear la solicitud de Twilio
    const formData = await request.formData();
    const recordingStatus = formData.get('RecordingStatus') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const callSid = formData.get('CallSid') as string;
    
    // Obtener From, si no existe o es null, usar un valor predeterminado
    let from = formData.get('From') as string;
    if (!from) {
      from = 'client:TwilioClient'; // Valor para llamadas desde Twilio Client
    }
    
    const duration = formData.get('RecordingDuration') as string;

    console.log(`Estado de grabación para llamada ${callSid}: ${recordingStatus}`);
    console.log(`URL de la grabación: ${recordingUrl}`);
    console.log(`Número de origen: ${from}`);

    if (recordingStatus === 'completed') {
      // En lugar de redirigir a la ruta principal, procesamos directamente aquí
      try {
        // Procesar la grabación de forma asíncrona
        // No esperamos a que termine para no bloquear la respuesta a Twilio
        audioProcessor.processTwilioRecording(
          callSid,
          recordingSid,
          recordingUrl,
          from,
          duration
        ).catch(error => {
          console.error('Error en el procesamiento asíncrono:', error);
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Procesamiento de grabación iniciado',
          recording_sid: recordingSid,
          call_sid: callSid
        });
      } catch (error) {
        console.error('Error al iniciar el procesamiento:', error);
        return NextResponse.json(
          { success: false, error: 'Error al iniciar el procesamiento de la grabación' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Estado de grabación: ${recordingStatus}` 
    });
  } catch (error) {
    console.error('Error en el webhook de estado de grabación:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el procesamiento del estado de grabación' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Twilio Recording Status Webhook API' });
} 