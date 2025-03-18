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
    // Obtener la URL base para referencias a audio
    const hostUrl = process.env.HOST_URL || request.nextUrl.origin;
    
    // Devolver TwiML para instruir a Twilio qué hacer con la llamada
    const twiml = 
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      // Reproducir mensaje de bienvenida desde un archivo MP3 pregrabado en lugar de usar Say
      '<Play>' + hostUrl + '/audio/bienvenida.mp3</Play>' +
      // Reproducir el tono de beep
      '<Play>' + hostUrl + '/audio/beep.mp3</Play>' +
      '<Record ' +
        'timeout="10" ' +     // Tiempo de espera para detectar voz (en segundos)
        'maxLength="300" ' +  // Duración máxima de 5 minutos (en segundos)
        'endSilenceTimeout="10" ' + // Finalizar después de 10 segundos de silencio
        'transcribe="false" ' +
        'recordingStatusCallback="/api/twilio/recording-status" ' +
        'recordingStatusCallbackMethod="POST" ' +
      '/>' +
      // Reproducir mensaje de error desde un archivo MP3 pregrabado en lugar de usar Say
      '<Play>' + hostUrl + '/audio/error-grabacion.mp3</Play>' +
      '</Response>';
    
    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error en el webhook de Twilio:', error);
    
    // En caso de error, devolver un TwiML simple con audio pregrabado
    const errorTwiml = 
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      '<Play>' + (process.env.HOST_URL || request.nextUrl.origin) + '/audio/error-sistema.mp3</Play>' +
      '<Hangup/>' +
      '</Response>';
    
    return new NextResponse(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

// Ruta para el estado de la grabación
export async function GET() {
  return NextResponse.json({ message: 'Twilio Webhook API' });
} 