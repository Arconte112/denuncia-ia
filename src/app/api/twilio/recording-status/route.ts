import { NextRequest, NextResponse } from 'next/server';
import { audioProcessor } from '@/lib/audio-processor';
import { logger } from '@/lib/logger';
import { withRetry } from '@/lib/retry';

export async function POST(request: NextRequest) {
  // Generar un ID único para rastrear esta solicitud específica
  const requestId = Math.random().toString(36).substring(2, 15);
  
  logger.info('Solicitud recibida en recording-status', {
    service: 'recording-status',
    context: {
      requestId,
      url: request.url,
      method: request.method,
    }
  });
  
  try {
    // Parsear la solicitud de Twilio
    const formData = await request.formData();
    
    // Extraer los datos necesarios
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

    logger.info('Datos de grabación recibidos', {
      service: 'recording-status',
      context: {
        requestId,
        callSid,
        recordingSid,
        recordingStatus,
        from,
        duration
      }
    });

    // Validar que tengamos los datos mínimos necesarios
    if (!recordingStatus || !callSid) {
      const errorMsg = 'Datos de grabación incompletos';
      logger.error(errorMsg, {
        service: 'recording-status',
        context: {
          requestId,
          receivedFields: Object.fromEntries(formData.entries())
        }
      });
      
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    if (recordingStatus === 'completed') {
      // Verificar que tenemos una URL de grabación
      if (!recordingUrl || !recordingSid) {
        const errorMsg = 'URL de grabación o ID de grabación no proporcionados';
        logger.error(errorMsg, {
          service: 'recording-status',
          context: {
            requestId,
            callSid,
            recordingStatus
          }
        });
        
        return NextResponse.json(
          { success: false, error: errorMsg },
          { status: 400 }
        );
      }
      
      // En lugar de redirigir a la ruta principal, procesamos directamente aquí
      try {
        logger.info('Iniciando procesamiento asíncrono de grabación', {
          service: 'recording-status',
          context: {
            requestId,
            callSid,
            recordingSid
          }
        });
        
        // Procesar la grabación de forma asíncrona
        // No esperamos a que termine para no bloquear la respuesta a Twilio
        audioProcessor.processTwilioRecording(
          callSid,
          recordingSid,
          recordingUrl,
          from,
          duration
        ).catch(error => {
          logger.error('Error en el procesamiento asíncrono de grabación', {
            service: 'recording-status',
            context: {
              requestId,
              callSid,
              recordingSid
            },
            error
          });
        });
        
        logger.info('Procesamiento de grabación iniciado exitosamente', {
          service: 'recording-status',
          context: {
            requestId,
            callSid,
            recordingSid
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Procesamiento de grabación iniciado',
          recording_sid: recordingSid,
          call_sid: callSid,
          request_id: requestId
        });
      } catch (error) {
        logger.error('Error al iniciar el procesamiento de grabación', {
          service: 'recording-status',
          context: {
            requestId,
            callSid,
            recordingSid
          },
          error
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error al iniciar el procesamiento de la grabación',
            request_id: requestId
          },
          { status: 500 }
        );
      }
    }

    logger.info('Estado de grabación procesado', {
      service: 'recording-status',
      context: {
        requestId,
        callSid,
        recordingStatus
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Estado de grabación: ${recordingStatus}`,
      request_id: requestId
    });
  } catch (error) {
    logger.error('Error general en el webhook de estado de grabación', {
      service: 'recording-status',
      context: {
        requestId
      },
      error
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en el procesamiento del estado de grabación',
        request_id: requestId
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  logger.debug('Solicitud GET recibida en recording-status', {
    service: 'recording-status'
  });
  
  return NextResponse.json({ message: 'Twilio Recording Status Webhook API' });
} 