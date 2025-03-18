import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener el parámetro de URL recording_sid de la consulta
    const searchParams = request.nextUrl.searchParams;
    const recordingSid = searchParams.get('recording_sid');
    
    if (!recordingSid) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro recording_sid' },
        { status: 400 }
      );
    }
    
    // Construir la URL de Twilio con credenciales
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!twilioAccountSid || !twilioAuthToken) {
      return NextResponse.json(
        { error: 'Faltan credenciales de Twilio en las variables de entorno' },
        { status: 500 }
      );
    }
    
    // Construir la URL de la grabación
    const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Recordings/${recordingSid}.mp3`;
    
    // Autenticación Basic Auth para Twilio
    const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    // Obtener el audio de Twilio
    const response = await fetch(recordingUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) {
      console.error(`Error al obtener el audio de Twilio: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Error al obtener el audio de Twilio' },
        { status: response.status }
      );
    }
    
    // Obtener el contenido binario
    const audioBuffer = await response.arrayBuffer();
    
    // Devolver el audio con el tipo MIME correcto
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="recording-${recordingSid}.mp3"`,
        'Cache-Control': 'public, max-age=31536000' // Caché por 1 año
      }
    });
    
  } catch (error) {
    console.error('Error al procesar la solicitud de audio:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de audio' },
      { status: 500 }
    );
  }
} 