# Instrucciones para el archivo de audio

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