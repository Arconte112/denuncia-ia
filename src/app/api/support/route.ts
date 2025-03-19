import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializar Resend con la clave API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, subject, message, systemInfo } = body;
    
    // Validar que los campos requeridos estén presentes
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
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
    
    // Enviar correo al equipo de soporte
    await resend.emails.send({
      from: `Soporte Denuncias IA <${process.env.SUPPORT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: process.env.SUPPORT_EMAIL_TO || 'support@example.com',
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
        <p><small>Este ticket fue generado desde el sistema de Denuncias IA.</small></p>
      `,
    });
    
    // Enviar confirmación al usuario
    await resend.emails.send({
      from: `Soporte Denuncias IA <${process.env.SUPPORT_EMAIL_FROM || 'onboarding@resend.dev'}>`,
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
        <p><small>Este es un mensaje automático, por favor no responda a este correo.</small></p>
      `,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al enviar el ticket de soporte:', error);
    return NextResponse.json(
      { error: 'No se pudo enviar el ticket de soporte' },
      { status: 500 }
    );
  }
} 