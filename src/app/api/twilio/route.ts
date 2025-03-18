import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { OpenAI } from 'openai';

// Normalmente, cargaríamos estas variables desde .env.local
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
const openaiApiKey = process.env.OPENAI_API_KEY || '';

// Inicializar clientes
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
const openai = new OpenAI({
  apiKey: openaiApiKey
});

export async function POST(request: NextRequest) {
  try {
    // Parsear la solicitud de Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;

    // Verificar que tengamos una URL de grabación
    if (!recordingUrl) {
      // Si no hay grabación, es probable que sea la llamada inicial
      // Aquí retornamos un TwiML para instruir a Twilio qué hacer
      const hostUrl = process.env.HOST_URL || request.nextUrl.origin;
      
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Response>' +
        `<Play>${hostUrl}/audio/welcome.mp3</Play>` +
        '<Record timeout="5" transcribe="false" recordingStatusCallback="/api/twilio/recording-status" />' +
        '</Response>',
        {
          headers: {
            'Content-Type': 'text/xml',
          },
        }
      );
    }

    // Si tenemos una URL de grabación, procesamos la denuncia
    console.log(`Procesando grabación de ${from}, duración: ${recordingDuration} segundos`);

    // 1. Descargar el audio de Twilio
    const audioResponse = await fetch(recordingUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    
    // 2. Transcribir con Whisper
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
        language: 'es'
      });

      // 3. Guardar la transcripción en nuestra base de datos
      // Aquí normalmente guardaríamos en una base de datos
      console.log('Transcripción realizada:', transcription.text);

      // 4. Crear un registro de denuncia
      const denuncia = {
        callSid,
        from,
        recordingUrl,
        duration: recordingDuration,
        transcription: transcription.text,
        timestamp: new Date().toISOString(),
        status: 'Nuevo'
      };

      // Aquí guardaríamos la denuncia en la base de datos
      console.log('Denuncia registrada:', denuncia);

      return NextResponse.json({ success: true, message: 'Denuncia procesada correctamente' });
    } catch (error) {
      console.error('Error al transcribir el audio:', error);
      return NextResponse.json(
        { success: false, error: 'Error al transcribir el audio' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en el webhook de Twilio:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el procesamiento de la denuncia' },
      { status: 500 }
    );
  }
}

// Ruta para el estado de la grabación
export async function GET() {
  return NextResponse.json({ message: 'Twilio Webhook API' });
} 