import { OpenAI } from 'openai';
import { callService, complaintService } from './db-service';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { withRetry } from './retry';

// Tipo para la respuesta estructurada de GPT-4o
export type ComplaintAnalysis = {
  category: string;
  priority: 'low' | 'medium' | 'high';
  summary: string;
};

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export const audioProcessor = {
  async downloadAudio(recordingUrl: string): Promise<ArrayBuffer> {
    logger.info('Descargando audio', { 
      service: 'audio-processor',
      context: { recordingUrl }
    });
    
    return withRetry(async () => {
      try {
        // Agregar autenticación si es necesario
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
        
        const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
        
        const response = await fetch(recordingUrl, {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
        
        if (!response.ok) {
          const errorMsg = `Error al descargar el audio: ${response.statusText}`;
          logger.error(errorMsg, {
            service: 'audio-processor',
            context: { 
              recordingUrl,
              status: response.status,
              statusText: response.statusText
            }
          });
          throw new Error(errorMsg);
        }
        
        const audioBuffer = await response.arrayBuffer();
        logger.debug('Audio descargado correctamente', {
          service: 'audio-processor',
          context: { 
            recordingUrl,
            sizeBytes: audioBuffer.byteLength
          }
        });
        
        return audioBuffer;
      } catch (error) {
        logger.error('Error al descargar el audio', {
          service: 'audio-processor',
          context: { recordingUrl },
          error
        });
        throw error;
      }
    }, {
      maxRetries: 3,
      initialDelay: 500,
      operationName: 'descarga de audio',
      shouldRetry: (error) => {
        // Reintentar errores de red o errores 5xx
        if (error instanceof Error) {
          return error.message.includes('fetch') || 
                 error.message.includes('500') || 
                 error.message.includes('503');
        }
        return true;
      }
    });
  },
  
  async transcribeAudio(audioBuffer: ArrayBuffer, filename: string = 'audio.wav'): Promise<string> {
    logger.info('Transcribiendo audio', { 
      service: 'audio-processor', 
      context: { 
        filename,
        sizeBytes: audioBuffer.byteLength 
      } 
    });
    
    return withRetry(async () => {
      try {
        const startTime = Date.now();
        
        const transcription = await openai.audio.transcriptions.create({
          file: new File([audioBuffer], filename, { type: 'audio/wav' }),
          model: 'whisper-1',
          language: 'es'
        });
        
        const duration = Date.now() - startTime;
        logger.info('Transcripción completada', {
          service: 'audio-processor',
          context: {
            durationMs: duration,
            textLength: transcription.text.length
          }
        });
        
        return transcription.text;
      } catch (error) {
        logger.error('Error al transcribir el audio', {
          service: 'audio-processor',
          context: { filename },
          error
        });
        throw error;
      }
    }, {
      maxRetries: 2,
      initialDelay: 1000,
      operationName: 'transcripción de audio',
      shouldRetry: (error) => {
        // No reintentar errores de formato o validación
        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();
          return !errorMsg.includes('format') && 
                 !errorMsg.includes('invalid') &&
                 !errorMsg.includes('file type');
        }
        return true;
      }
    });
  },
  
  async analyzeTranscription(transcription: string): Promise<ComplaintAnalysis> {
    logger.info('Analizando transcripción', { 
      service: 'audio-processor',
      context: { 
        transcriptionLength: transcription.length,
        transcriptionExcerpt: transcription.substring(0, 100) + '...'
      } 
    });
    
    return withRetry(async () => {
      try {
        const startTime = Date.now();
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an assistant specialized in analyzing complaints.
              Extract the relevant information from the transcription and return it in JSON format with the following structure:
              {
                "category": "Must be exactly one of the following categories: Theft, Domestic Violence, Vandalism, Noise, Drugs, Fraud, Corruption, Harassment, Threats, Other",
                "priority": "low/medium/high (based on urgency and severity)",
                "summary": "Concise summary of the complaint (maximum 200 characters)"
              }
              Use your best judgment to classify the priority based on the severity of the incident.`
            },
            {
              role: 'user',
              content: transcription
            }
          ]
        });
        
        const duration = Date.now() - startTime;
        const analysisText = response.choices[0]?.message.content || '{}';
        
        // Intentar parsear la respuesta JSON
        try {
          const analysis = JSON.parse(analysisText) as ComplaintAnalysis;
          
          logger.info('Análisis de transcripción completado', {
            service: 'audio-processor',
            context: {
              durationMs: duration,
              category: analysis.category,
              priority: analysis.priority
            }
          });
          
          return analysis;
        } catch (parseError) {
          logger.error('Error al parsear la respuesta de análisis como JSON', {
            service: 'audio-processor',
            context: { responseText: analysisText },
            error: parseError
          });
          
          // Crear un análisis básico como fallback
          return {
            category: 'Otro',
            priority: 'medium',
            summary: 'No se pudo analizar la denuncia. Requiere revisión manual.'
          };
        }
      } catch (error) {
        logger.error('Error al analizar la transcripción', {
          service: 'audio-processor',
          context: { transcriptionExcerpt: transcription.substring(0, 100) + '...' },
          error
        });
        throw error;
      }
    }, {
      maxRetries: 2,
      initialDelay: 1000,
      operationName: 'análisis de transcripción',
    });
  },
  
  async processTwilioRecording(
    callSid: string,
    recordingSid: string,
    recordingUrl: string,
    from: string,
    duration: string
  ): Promise<void> {
    logger.info('Procesando grabación de Twilio', {
      service: 'audio-processor',
      context: {
        callSid,
        recordingSid,
        from,
        duration
      }
    });
    
    try {
      // Convertir duración a entero
      const durationSeconds = parseInt(duration) || 0;
      
      // Verificar si la llamada es demasiado corta (menos de 10 segundos)
      const isCallTooShort = durationSeconds < 10;
      
      if (isCallTooShort) {
        logger.warn('Llamada demasiado corta para procesar', {
          service: 'audio-processor',
          context: {
            callSid,
            durationSeconds,
            minRequiredSeconds: 10
          }
        });
      }
      
      // 1. Buscar si ya existe el registro de llamada por call_sid
      const calls = await withRetry(
        () => callService.getAll(),
        { operationName: 'obtención de llamadas' }
      );
      
      let existingCall = calls.find(call => call.call_sid === callSid);
      
      let call;
      if (!existingCall) {
        // Crear registro de llamada con un nuevo UUID
        const callId = uuidv4();
        logger.info('Creando nuevo registro de llamada', {
          service: 'audio-processor',
          context: {
            callId,
            callSid,
            from
          }
        });
        
        call = await withRetry(
          () => callService.create({
            id: callId,
            call_sid: callSid,
            phone_number: from,
            timestamp: new Date().toISOString(),
            duration: durationSeconds,
            status: isCallTooShort ? 'failed' : 'completed',
            audio_url: recordingUrl,
            recording_sid: recordingSid,
            has_complaint: false,
            notes: isCallTooShort ? 'Llamada muy corta (menos de 10 segundos)' : null
          }),
          { operationName: 'creación de registro de llamada' }
        );
        
        if (!call) {
          const errorMsg = 'No se pudo crear el registro de llamada';
          logger.error(errorMsg, {
            service: 'audio-processor',
            context: { callSid, from }
          });
          throw new Error(errorMsg);
        }
      } else {
        // Actualizar registro de llamada existente
        logger.info('Actualizando registro de llamada existente', {
          service: 'audio-processor',
          context: {
            callId: existingCall.id,
            callSid
          }
        });
        
        call = await withRetry(
          () => callService.update(existingCall.id, {
            duration: durationSeconds,
            status: isCallTooShort ? 'failed' : 'completed',
            audio_url: recordingUrl,
            recording_sid: recordingSid,
            notes: isCallTooShort ? 'Llamada muy corta (menos de 10 segundos)' : existingCall.notes
          }),
          { operationName: 'actualización de registro de llamada' }
        );
        
        if (!call) {
          const errorMsg = 'No se pudo actualizar el registro de llamada';
          logger.error(errorMsg, {
            service: 'audio-processor',
            context: { callId: existingCall.id, callSid }
          });
          throw new Error(errorMsg);
        }
      }

      // Si la llamada es demasiado corta, no continuar con el proceso de denuncia
      if (isCallTooShort) {
        logger.info('Llamada muy corta, no se procesará como denuncia', {
          service: 'audio-processor',
          context: {
            callSid,
            durationSeconds
          }
        });
        return;
      }
      
      // 2. Descargar y transcribir el audio
      const audioBuffer = await this.downloadAudio(recordingUrl);
      const transcription = await this.transcribeAudio(audioBuffer);
      
      // 3. Analizar la transcripción
      const analysis = await this.analyzeTranscription(transcription);
      
      // 4. Crear una denuncia basada en la llamada y el análisis
      logger.info('Creando registro de denuncia', {
        service: 'audio-processor',
        context: {
          callId: call.id,
          category: analysis.category,
          priority: analysis.priority
        }
      });
      
      const complaint = await withRetry(
        () => complaintService.create({
          call_id: call.id,
          transcription: transcription,
          status: 'new',
          category: analysis.category,
          priority: analysis.priority,
          assigned_to: null,
          resolution: null,
          resolved_at: null,
          summary: analysis.summary
        }),
        { operationName: 'creación de denuncia' }
      );
      
      if (!complaint) {
        const errorMsg = 'No se pudo crear la denuncia';
        logger.error(errorMsg, {
          service: 'audio-processor',
          context: { callId: call.id }
        });
        throw new Error(errorMsg);
      }
      
      // 5. Actualizar la llamada para indicar que tiene una denuncia asociada
      await withRetry(
        () => callService.update(call.id, { has_complaint: true }),
        { operationName: 'actualización de estado de llamada' }
      );
      
      logger.info('Procesamiento de grabación completado con éxito', {
        service: 'audio-processor',
        context: {
          callSid,
          complaintId: complaint.id,
          category: analysis.category
        }
      });
    } catch (error) {
      logger.critical('Error crítico en el procesamiento de la grabación', {
        service: 'audio-processor',
        context: {
          callSid,
          recordingSid,
          from
        },
        error
      });
      throw error;
    }
  }
}; 