# Archivos de Audio para el Sistema de Denuncias

Este directorio contiene los archivos de audio utilizados por el sistema de denuncias para la interacción con Twilio.

## Archivos Requeridos

Para que el sistema funcione correctamente, se necesitan los siguientes archivos MP3:

1. **bienvenida.mp3** - Mensaje de bienvenida y explicación del sistema.
   - Contenido sugerido: "Bienvenido al sistema de denuncias. Por favor, después del tono, describa en detalle su denuncia. Puede hablar hasta 5 minutos y el sistema detectará automáticamente cuando termine. Si hay 10 segundos de silencio, la llamada finalizará."

2. **beep.mp3** - Tono que indica al usuario que puede comenzar a hablar.
   - Ya incluido en el repositorio.

3. **error-grabacion.mp3** - Mensaje cuando no se recibe ninguna grabación.
   - Contenido sugerido: "No hemos recibido ninguna grabación. Por favor, intente de nuevo más tarde."

4. **error-sistema.mp3** - Mensaje cuando ocurre un error en el sistema.
   - Contenido sugerido: "Ha ocurrido un error en el sistema. Por favor, intente más tarde."

## Instrucciones para Crear los Archivos de Audio

Puedes crear estos archivos de audio de varias maneras:

### Opción 1: Utilizando servicios de síntesis de voz

1. Utiliza servicios como [Amazon Polly](https://aws.amazon.com/polly/), [Google Text-to-Speech](https://cloud.google.com/text-to-speech), o [Azure Text to Speech](https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech/).
2. Selecciona una voz en español mexicano o latinoamericano.
3. Introduce el texto correspondiente y genera el archivo MP3.
4. Descarga el archivo y colócalo en este directorio.

### Opción 2: Grabando tu propia voz

1. Utiliza una herramienta de grabación como Audacity, Adobe Audition, o incluso aplicaciones móviles.
2. Graba los mensajes con un micrófono de buena calidad en un ambiente silencioso.
3. Guarda los archivos en formato MP3 con calidad media (128kbps es suficiente).
4. Coloca los archivos en este directorio.

### Opción 3: Utilizando herramientas online gratuitas

1. Visita sitios como [TextToSpeech.io](https://ttsmp3.com/) o [Natural Readers](https://www.naturalreaders.com/).
2. Selecciona una voz en español.
3. Introduce el texto y descarga el archivo MP3.
4. Coloca los archivos en este directorio.

## Formato Recomendado

- Formato: MP3
- Bitrate: 128kbps (suficiente para llamadas telefónicas)
- Canales: Mono (preferible para llamadas telefónicas)
- Tasa de muestreo: 44.1kHz o 22.05kHz

## Nota Importante

Al usar archivos de audio pregrabados en lugar de la síntesis de voz de Twilio, reduces significativamente el costo por llamada, ya que Twilio cobra por la generación de voz con `<Say>` pero no por la reproducción de archivos con `<Play>`. 