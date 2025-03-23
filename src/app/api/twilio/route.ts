import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { OpenAI } from 'openai';
import { logger } from '@/lib/logger';
import { withRetry } from '@/lib/retry';

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
  // Generar un ID único para la petición para rastrearla en los logs
  const requestId = Math.random().toString(36).substring(2, 15);
  
  logger.info('Solicitud recibida en el webhook de Twilio', {
    service: 'twilio-webhook',
    context: {
      requestId,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent')
    }
  });
  
  try {
    // Verificar que tengamos las credenciales necesarias
    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Credenciales de Twilio no configuradas');
    }
    
    // Obtener la URL base para referencias a audio
    // IMPORTANTE: Usamos el HOST_URL configurado, con fallback a origen de la solicitud
    const configuredHostUrl = process.env.HOST_URL;
    const hostUrl = configuredHostUrl || request.nextUrl.origin;
    
    logger.debug('Preparando respuesta TwiML', {
      service: 'twilio-webhook',
      context: {
        requestId,
        configuredHostUrl,
        hostUrl,
        requestOrigin: request.nextUrl.origin
      }
    });
    
    // Crear la URL del callback de estado de grabación absoluta
    const recordingStatusCallbackUrl = `${hostUrl}/api/twilio/recording-status`;
    
    logger.debug('URL de callback configurada', {
      service: 'twilio-webhook',
      context: {
        requestId,
        recordingStatusCallbackUrl
      }
    });
    
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
        'recordingStatusCallback="' + recordingStatusCallbackUrl + '" ' +
        'recordingStatusCallbackMethod="POST" ' +
      '/>' +
      // Reproducir mensaje de error desde un archivo MP3 pregrabado en lugar de usar Say
      '<Play>' + hostUrl + '/audio/error-grabacion.mp3</Play>' +
      '</Response>';
    
    logger.info('Respuesta TwiML generada con éxito', {
      service: 'twilio-webhook',
      context: {
        requestId
      }
    });
    
    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    logger.error('Error en el webhook de Twilio', {
      service: 'twilio-webhook',
      context: {
        requestId
      },
      error
    });
    
    // En caso de error, devolver un TwiML simple con audio pregrabado
    try {
      const hostUrl = process.env.HOST_URL || request.nextUrl.origin;
      const errorTwiml = 
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Response>' +
        '<Play>' + hostUrl + '/audio/error-sistema.mp3</Play>' +
        '<Hangup/>' +
        '</Response>';
      
      logger.info('Devolviendo TwiML de error al cliente', {
        service: 'twilio-webhook',
        context: {
          requestId
        }
      });
      
      return new NextResponse(errorTwiml, {
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    } catch (secondaryError) {
      // Error crítico al intentar manejar el error original
      logger.critical('Error crítico al generar respuesta de error', {
        service: 'twilio-webhook',
        context: {
          requestId,
          originalError: error
        },
        error: secondaryError
      });
      
      // Último recurso: texto plano de error
      return new NextResponse('Error interno del servidor', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  }
}

// Ruta para el estado de la grabación
export async function GET() {
  logger.debug('Solicitud GET recibida en el webhook de Twilio', {
    service: 'twilio-webhook'
  });
  
  return NextResponse.json({ message: 'Twilio Webhook API' });
} 