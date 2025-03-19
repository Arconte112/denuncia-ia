import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import { withRetry } from '@/lib/retry';

// Inicializar Resend con la clave API
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  // ID único para rastrear la solicitud
  const requestId = Math.random().toString(36).substring(2, 15);
  
  logger.info('Solicitud de soporte recibida', {
    service: 'support-api',
    context: {
      requestId
    }
  });
  
  try {
    // Verificar que Resend esté configurado
    if (!resend) {
      const errorMsg = 'Servicio de email no configurado correctamente';
      logger.error(errorMsg, {
        service: 'support-api',
        context: {
          requestId,
          resendApiKey: resendApiKey ? 'configurado' : 'no configurado'
        }
      });
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    const { email, name, subject, message, systemInfo } = body;
    
    logger.debug('Datos de ticket de soporte recibidos', {
      service: 'support-api',
      context: {
        requestId,
        email,
        name,
        subject,
        messageLength: message?.length,
        hasSystemInfo: !!systemInfo
      }
    });
    
    // Validar que los campos requeridos estén presentes
    if (!email || !subject || !message) {
      const errorMsg = 'Faltan campos requeridos';
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!subject) missingFields.push('subject');
      if (!message) missingFields.push('message');
      
      logger.warn(errorMsg, {
        service: 'support-api',
        context: {
          requestId,
          missingFields
        }
      });
      
      return NextResponse.json(
        { error: errorMsg, missingFields },
        { status: 400 }
      );
    }

    // Formatear la información del sistema
    const systemInfoHtml = systemInfo 
      ? `
        <h3>Información del sistema</h3>
        <ul>
          <li><strong>Navegador:</strong> ${systemInfo.userAgent}</li>
          <li><strong>Fecha y hora:</strong> ${new Date(systemInfo.timestamp).toLocaleString()}</li>
          <li><strong>URL:</strong> ${systemInfo.url}</li>
          <li><strong>Resolución:</strong> ${systemInfo.screenSize}</li>
        </ul>
      `
      : '';
    
    // Configurar destinatario y remitente
    const supportEmailFrom = process.env.SUPPORT_EMAIL_FROM || 'onboarding@resend.dev';
    const supportEmailTo = process.env.SUPPORT_EMAIL_TO || 'support@example.com';
    
    logger.info('Enviando email al equipo de soporte', {
      service: 'support-api',
      context: {
        requestId,
        from: `VoiceGuard Support <${supportEmailFrom}>`,
        to: supportEmailTo,
        subject: `Ticket de soporte: ${subject}`
      }
    });
    
    // Enviar correo al equipo de soporte con reintentos
    const supportEmailResult = await withRetry(
      async () => {
        return resend.emails.send({
          from: `VoiceGuard Support <${supportEmailFrom}>`,
          to: supportEmailTo,
          replyTo: email,
          subject: `Ticket de soporte: ${subject}`,
          html: `
            <h2>Nuevo ticket de soporte</h2>
            <p><strong>De:</strong> ${name || 'Usuario'} (${email})</p>
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${message.replace(/\n/g, '<br/>')}</p>
            ${systemInfoHtml}
            <hr />
            <p><small>This ticket was generated from the VoiceGuard system.</small></p>
            <p><small>ID de solicitud: ${requestId}</small></p>
          `,
        });
      },
      { 
        maxRetries: 3,
        initialDelay: 500,
        operationName: 'envío de email al soporte'
      }
    );
    
    logger.info('Email enviado exitosamente al equipo de soporte', {
      service: 'support-api',
      context: {
        requestId,
        emailResponse: supportEmailResult ? 'success' : 'unknown'
      }
    });
    
    // Enviar confirmación al usuario con reintentos
    logger.info('Enviando confirmación al usuario', {
      service: 'support-api',
      context: {
        requestId,
        userEmail: email
      }
    });
    
    await withRetry(
      async () => {
        return resend.emails.send({
          from: `VoiceGuard Support <${supportEmailFrom}>`,
          to: email,
          subject: `Confirmación de ticket: ${subject}`,
          html: `
            <h2>Hemos recibido su ticket de soporte</h2>
            <p>Estimado/a ${name || 'usuario/a'},</p>
            <p>Hemos recibido su ticket de soporte con el asunto: <strong>${subject}</strong>.</p>
            <p>Nuestro equipo revisará su consulta y le responderá a la brevedad posible.</p>
            <p>A continuación se muestra una copia de su mensaje:</p>
            <p><em>${message.replace(/\n/g, '<br/>')}</em></p>
            <hr />
            <p><small>This is an automated message, please do not reply to this email.</small></p>
            <p><small>Reference ID: ${requestId}</small></p>
          `,
        });
      },
      { 
        maxRetries: 2,
        initialDelay: 500,
        operationName: 'envío de email de confirmación'
      }
    );
    
    logger.info('Proceso de ticket de soporte completado exitosamente', {
      service: 'support-api',
      context: {
        requestId
      }
    });
    
    return NextResponse.json({ 
      success: true,
      requestId
    });
  } catch (error) {
    logger.error('Error al procesar el ticket de soporte', {
      service: 'support-api',
      context: {
        requestId
      },
      error
    });
    
    return NextResponse.json(
      { 
        error: 'No se pudo enviar el ticket de soporte',
        requestId,
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 