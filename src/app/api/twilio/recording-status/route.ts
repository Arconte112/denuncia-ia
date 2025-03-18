import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parsear la solicitud de Twilio
    const formData = await request.formData();
    const recordingStatus = formData.get('RecordingStatus') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const callSid = formData.get('CallSid') as string;

    console.log(`Estado de grabación para llamada ${callSid}: ${recordingStatus}`);
    console.log(`URL de la grabación: ${recordingUrl}`);

    if (recordingStatus === 'completed') {
      // La grabación se ha completado
      // Aquí podríamos iniciar el procesamiento asíncrono
      
      // Redireccionar a la ruta principal para procesar la grabación
      const response = await fetch(`${request.nextUrl.origin}/api/twilio`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Resultado del procesamiento:', result);

      return NextResponse.json({ success: true, message: 'Grabación procesada' });
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