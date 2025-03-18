# Archivos de Audio para la Plataforma de Denuncias

Este directorio contiene los archivos de audio utilizados por la plataforma.

## Archivos Requeridos

1. `beep.mp3` - Un tono corto que indica al usuario que puede comenzar a hablar para realizar su denuncia.
   - Duración recomendada: 0.5-1 segundo
   - Puede ser generado con herramientas online o descargado de una biblioteca de efectos de sonido

## Instrucciones para Añadir Archivos

Para generar o conseguir estos archivos:

1. Para `beep.mp3`:
   - Opción 1: Usar un generador de tonos online como https://www.audiocheck.net/audiofrequencysignalgenerator_sinetone.php
   - Opción 2: Descargar de una biblioteca libre de derechos como https://freesound.org/
   - Opción 3: Grabar un tono simple con cualquier herramienta de grabación

## Información Importante

- Los archivos de audio deben ser de buena calidad pero de tamaño pequeño para cargar rápidamente
- Formato recomendado: MP3, 128kbps
- Todos los archivos deben estar optimizados para web
- Asegúrese de tener los derechos necesarios para cualquier audio que utilice

## Integración con Twilio

Estos archivos son utilizados en las respuestas TwiML de Twilio para proporcionar indicaciones a los usuarios que llaman al sistema de denuncias.

La URL completa que Twilio utilizará será: `{HOST_URL}/audio/[nombre-del-archivo]`

Donde `HOST_URL` es la URL base de la aplicación, configurada en las variables de entorno.

## Instrucciones para el archivo de audio

## Archivo welcome.mp3

En esta carpeta debes colocar un archivo de audio MP3 llamado `welcome.mp3` que será reproducido cuando un usuario llame al número de Twilio.

Este audio debería contener instrucciones claras para el denunciante, como por ejemplo:

"Gracias por llamar al sistema de denuncias. Por favor, después del tono, describa detalladamente la situación que desea denunciar. Cuando termine, simplemente cuelgue y su denuncia será procesada automáticamente."

## Requisitos técnicos

- El archivo debe estar en formato MP3.
- El nombre del archivo debe ser exactamente `welcome.mp3` (en minúsculas).
- Se recomienda una calidad de audio clara para que los denunciantes puedan entender perfectamente las instrucciones.
- Duración recomendada: entre 15 y 30 segundos.

## Ubicación

El archivo debe colocarse directamente en esta carpeta:
`/public/audio/welcome.mp3`

Una vez que hayas añadido el archivo, estará disponible en:
`https://tu-dominio.com/audio/welcome.mp3`

Y será reproducido automáticamente cuando un usuario llame al número de teléfono configurado en Twilio. 