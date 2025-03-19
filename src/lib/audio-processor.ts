import { OpenAI } from 'openai';
import { callService, complaintService } from './db-service';
import { v4 as uuidv4 } from 'uuid';

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
        throw new Error(`Error al descargar el audio: ${response.statusText}`);
      }
      
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error al descargar el audio:', error);
      throw error;
    }
  },
  
  async transcribeAudio(audioBuffer: ArrayBuffer, filename: string = 'audio.wav'): Promise<string> {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], filename, { type: 'audio/wav' }),
        model: 'whisper-1',
        language: 'es'
      });
      
      return transcription.text;
    } catch (error) {
      console.error('Error al transcribir el audio:', error);
      throw error;
    }
  },
  
  async analyzeTranscription(transcription: string): Promise<ComplaintAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Eres un asistente especializado en analizar denuncias. 
            Extrae la información relevante de la transcripción y devuélvela en formato JSON con la siguiente estructura:
            {
              "category": "Debe ser exactamente una de las siguientes categorías: Robo, Violencia doméstica, Vandalismo, Ruido, Drogas, Fraude, Corrupción, Acoso, Amenazas, Otro",
              "priority": "low/medium/high (basado en la urgencia y gravedad)",
              "summary": "Resumen conciso de la denuncia (máximo 200 caracteres)"
            }
            Usa tu mejor criterio para clasificar la prioridad basándote en la gravedad del incidente.`
          },
          {
            role: 'user',
            content: transcription
          }
        ]
      });
      
      // Parsear la respuesta JSON
      const analysisText = response.choices[0]?.message.content || '{}';
      return JSON.parse(analysisText) as ComplaintAnalysis;
    } catch (error) {
      console.error('Error al analizar la transcripción:', error);
      throw error;
    }
  },
  
  async processTwilioRecording(
    callSid: string,
    recordingSid: string,
    recordingUrl: string,
    from: string,
    duration: string
  ): Promise<void> {
    try {
      // Convertir duración a entero
      const durationSeconds = parseInt(duration) || 0;
      
      // Verificar si la llamada es demasiado corta (menos de 10 segundos)
      const isCallTooShort = durationSeconds < 10;
      
      // 1. Buscar si ya existe el registro de llamada por call_sid
      let calls = await callService.getAll();
      let existingCall = calls.find(call => call.call_sid === callSid);
      
      let call;
      if (!existingCall) {
        // Crear registro de llamada con un nuevo UUID
        const callId = uuidv4();
        call = await callService.create({
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
        });
        
        if (!call) {
          throw new Error('No se pudo crear el registro de llamada');
        }
      } else {
        // Actualizar registro de llamada existente
        call = await callService.update(existingCall.id, {
          duration: durationSeconds,
          status: isCallTooShort ? 'failed' : 'completed',
          audio_url: recordingUrl,
          recording_sid: recordingSid,
          notes: isCallTooShort ? 'Llamada muy corta (menos de 10 segundos)' : existingCall.notes
        });
        
        if (!call) {
          throw new Error('No se pudo actualizar el registro de llamada');
        }
      }

      // Si la llamada es demasiado corta, no continuar con el proceso de denuncia
      if (isCallTooShort) {
        console.log(`Llamada ${callSid} no procesada: duración (${durationSeconds}s) menor a 10 segundos`);
        return;
      }
      
      // 2. Descargar y transcribir el audio
      const audioBuffer = await this.downloadAudio(recordingUrl);
      const transcription = await this.transcribeAudio(audioBuffer);
      
      // 3. Analizar la transcripción
      const analysis = await this.analyzeTranscription(transcription);
      
      // 4. Crear una denuncia basada en la llamada y el análisis
      const complaint = await complaintService.create({
        call_id: call.id, // Usamos el ID del registro de la llamada
        transcription: transcription,
        status: 'new',
        category: analysis.category,
        priority: analysis.priority,
        assigned_to: null,
        resolution: null,
        resolved_at: null,
        summary: analysis.summary // Añadimos el resumen a la denuncia
      });
      
      if (!complaint) {
        throw new Error('No se pudo crear la denuncia');
      }
      
      // 5. Actualizar la llamada para indicar que tiene una denuncia asociada
      await callService.update(call.id, { has_complaint: true });
      
      console.log('Procesamiento completo para la llamada:', callSid);
    } catch (error) {
      console.error('Error en el procesamiento de la grabación:', error);
      throw error;
    }
  }
}; 