# Plataforma de Denuncias IA

Una plataforma para recibir denuncias telefónicas, transcribirlas con IA y gestionarlas.

## Características

- Recepción de denuncias mediante llamadas telefónicas a través de Twilio
- Transcripción automática de denuncias utilizando Whisper de OpenAI
- Panel de administración para gestionar las denuncias recibidas
- Visualización de denuncias con su información, audio y transcripción
- API RESTful para interactuar con el sistema

## Tecnologías

- [Next.js](https://nextjs.org/) - Framework de React para aplicaciones web
- [Shadcn UI](https://ui.shadcn.com/) - Biblioteca de componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS para diseño
- [Twilio](https://www.twilio.com/) - Plataforma de comunicaciones para llamadas
- [OpenAI Whisper](https://openai.com/research/whisper) - Modelo de reconocimiento de voz para transcripciones

## Requisitos

- Node.js 18.0.0 o superior
- Cuenta de Twilio con un número de teléfono
- Cuenta de OpenAI con acceso a la API de Whisper
- Variables de entorno configuradas (ver `.env.local.example`)

## Instalación

1. Clona este repositorio
   ```bash
   git clone https://github.com/tu-usuario/denuncia-ia.git
   cd denuncia-ia
   ```

2. Instala las dependencias
   ```bash
   npm install
   ```

3. Crea un archivo `.env.local` basado en `.env.local.example` y añade tus claves
   ```bash
   cp .env.local.example .env.local
   ```

4. Abre `.env.local` y añade tus claves de API de Twilio y OpenAI

## Ejecución

1. Inicia el servidor de desarrollo
   ```bash
   npm run dev
   ```

2. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación

## Configuración de Twilio

1. Inicia sesión en tu [cuenta de Twilio](https://www.twilio.com/)
2. Configura un número de teléfono
3. En la configuración del número, establece el webhook para las llamadas a:
   ```
   https://tu-dominio.com/api/twilio
   ```
4. Asegúrate de que el método esté configurado como HTTP POST

## Uso

1. Los usuarios llaman al número de Twilio configurado
2. La llamada es recibida y procesada por el sistema
3. La denuncia es transcrita automáticamente
4. Los administradores pueden ver y gestionar las denuncias desde el panel

## Estructura del Proyecto

- `/app` - Páginas y rutas de Next.js
- `/app/api` - Puntos finales de la API
- `/components` - Componentes de React reutilizables
- `/lib` - Utilidades y funciones auxiliares

## Desarrollo

Para añadir nuevos componentes de Shadcn UI:

```bash
npx shadcn@latest add [nombre-del-componente]
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

# Sistema de Soporte

El sistema incluye un botón flotante de soporte que permite a los usuarios enviar tickets directamente al equipo de soporte técnico. Para configurar correctamente esta funcionalidad, siga estos pasos:

## Configuración de Resend para el Envío de Correos

1. Cree una cuenta en [Resend](https://resend.com) si aún no tiene una.

2. Obtenga su API Key desde el dashboard de Resend.

3. Agregue las siguientes variables de entorno en su archivo `.env.local`:

```
RESEND_API_KEY=re_su_clave_api_aquí
SUPPORT_EMAIL_FROM=su_dominio_verificado@ejemplo.com
SUPPORT_EMAIL_TO=correo_donde_recibir_tickets@ejemplo.com
```

4. Para entornos de producción, asegúrese de verificar su dominio en Resend para poder enviar correos desde su propio dominio.

## Funcionamiento

- El botón de soporte está visible en todas las páginas del dashboard.
- La información del usuario (email y nombre) se obtiene automáticamente del usuario logueado.
- Al hacer clic en el botón, se abre un formulario donde el usuario solo necesita ingresar el asunto y el mensaje.
- Al enviar el formulario, se envía un correo al equipo de soporte y una confirmación al usuario.
- El sistema recopila automáticamente información sobre el navegador, URL y resolución para facilitar la resolución de problemas.

## Personalización

Puede personalizar el aspecto y comportamiento del botón de soporte modificando los siguientes archivos:

- `src/components/support/support-button.tsx`: Apariencia y comportamiento del botón y formulario
- `src/app/api/support/route.ts`: Lógica de envío de correos y formato de los mensajes

## Seguridad

- Se requiere que el usuario esté autenticado para enviar tickets de soporte.
- Las credenciales de API se almacenan de forma segura en variables de entorno.
- Toda la comunicación se realiza a través de solicitudes HTTP seguras.
- Resend proporciona análisis y seguimiento de correos enviados.
