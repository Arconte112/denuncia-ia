# Denuncia IA

Denuncia IA permite recibir llamadas telefónicas, transcribirlas con Whisper y gestionar los reportes desde un panel web. El objetivo es acelerar la captura de denuncias ciudadanas (o tickets de soporte) automatizando la llegada, transcripción, asignación y seguimiento.

https://github.com/user-attachments/assets/40d0a988-61f5-4baa-a9b0-a4fb79ba8791

## ✨ Funcionalidades
- **Recepción por voz** con Twilio Voice → webhook HTTP (`/api/twilio`).
- **Transcripción automática** usando OpenAI Whisper.
- **Panel de administración**: dashboard con estadísticas, listado de denuncias, filtro por estado, detalle con audio original y transcripción.
- **Gestión**: asignación de responsables, cambio de status, notas internas.
- **Soporte integrado**: botón flotante que envía tickets vía Resend.
- **Notificaciones**: entregas de email (opcional) cuando llega una nueva denuncia.

## 🧱 Stack técnico
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS + shadcn/ui, Recharts.
- **Backend**: Next.js Route Handlers, Supabase (DB + Auth + Storage), Nodemailer/Resend.
- **Telefonía**: Twilio Programmable Voice.
- **IA**: OpenAI Whisper (transcripción).
- **Infra**: Docker/Vercel, autenticación NextAuth (magic links).

## ⚙️ Variables de entorno principales
Revisa el archivo `.env.example`. Los campos obligatorios son:

| Variable | Descripción |
|----------|-------------|
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Credenciales del número que recibe las denuncias. |
| `OPENAI_API_KEY` | Token para transcribir audio con Whisper. |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | Configuración NextAuth para sesiones seguras. |
| `HOST_URL` | URL pública para recibir webhooks (ngrok/Vercel). |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Proyecto Supabase (auth & storage). |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role para mutaciones server-side. |
| `RESEND_API_KEY`, `SUPPORT_EMAIL_FROM`, `SUPPORT_EMAIL_TO` | Opcional: envíos de correo para tickets/staff. |

## 🚀 Cómo correrlo localmente
1. Clona el repo y crea tu `.env.local` usando la plantilla `.env.example`.
2. Instala dependencias (`npm install`).
3. Opcional: levanta Supabase local con los scripts en `sql/`.
4. Ejecuta `npm run dev` y expone tu entorno con ngrok para apuntar Twilio a `https://<ngrok-url>/api/twilio`.
5. Configura en el dashboard de Twilio el webhook de voz hacia tu endpoint.

## 🧭 Flujo de denuncia
1. El ciudadano llama al número de Twilio.
2. Twilio envía el audio a `/api/twilio`. Se almacena el archivo y se encola la transcripción.
3. Whisper transcribe y guarda el texto en Supabase.
4. El dashboard refleja la nueva denuncia con audio, texto y metadatos.
5. El equipo puede actualizar estado, asignar responsables y disparar correos.

## 🛣 Roadmap sugerido
- Integrar marcas de tiempo / diarización en la transcripción.
- Etiquetado automático (NLU) según contenido de la denuncia.
- Exportar reportes en CSV / PDF.
- Control de roles (operador / analista / administrador).
- Automatizar respuestas con plantillas y Resend.

## 🤝 Contribuir
1. Crea una rama (`git checkout -b feature/...`).
2. Ejecuta `npm run lint` antes de abrir el PR.
3. Documenta los cambios y añade screenshots si afectan el UI.

## 📄 Licencia
MIT © Rainier Alejandro; originalmente iniciado como “Denuncia IA” y evolucionado para casos de uso reales.
