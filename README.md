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
