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

    // Log de todos los datos recibidos para depuración
    const allFormData = Object.fromEntries(formData.entries());
    logger.debug('Datos completos recibidos de Twilio', {
      service: 'recording-status',
      context: {
        requestId,
        formData: allFormData
      }
    });
    
    // Extraer los datos necesarios
    const recordingStatus = formData.get('RecordingStatus') as string || null;
    const recordingSid = formData.get('RecordingSid') as string || null;
    const recordingUrl = formData.get('RecordingUrl') as string || null;
    const callSid = formData.get('CallSid') as string || null;
    
    // Obtener From, si no existe o es null, usar un valor predeterminado
    let from = formData.get('From') as string;
    if (!from) {
      from = formData.get('Caller') as string || 'Unknown';
    }
    
    const duration = formData.get('RecordingDuration') as string || formData.get('Duration') as string || null;
    const callStatus = formData.get('CallStatus') as string || null;

    logger.info('Datos de grabación recibidos', {
      service: 'recording-status',
      context: {
        requestId,
        callSid,
        recordingSid,
        recordingStatus,
        callStatus,
        from,
        duration
      }
    });

    // Si tenemos un callSid pero no tenemos información de grabación,
    // puede ser porque la llamada terminó sin grabar o hubo un problema con la grabación
    if (callSid && !recordingSid && !recordingStatus) {
      const callDuration = formData.get('CallDuration') as string || null;
      
      logger.info('Llamada finalizada sin grabación completada', {
        service: 'recording-status',
        context: {
          requestId,
          callSid,
          callStatus,
          callDuration,
          from
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Llamada finalizada sin grabación',
        call_sid: callSid,
        call_status: callStatus,
        request_id: requestId
      });
    }

    // Validar que tengamos los datos mínimos necesarios
    if (!callSid) {
      const errorMsg = 'ID de llamada no proporcionado';
      logger.error(errorMsg, {
        service: 'recording-status',
        context: {
          requestId,
          receivedFields: allFormData
        }
      });
      
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    // Si tenemos información de grabación completa, procesarla
    if (recordingStatus === 'completed' && recordingUrl && recordingSid) {
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
          duration || ''
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

    // Para cualquier otro estado, devolvemos una respuesta exitosa
    logger.info('Estado de llamada/grabación procesado', {
      service: 'recording-status',
      context: {
        requestId,
        callSid,
        recordingStatus,
        callStatus
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: recordingStatus 
        ? `Estado de grabación: ${recordingStatus}` 
        : `Estado de llamada: ${callStatus || 'desconocido'}`,
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