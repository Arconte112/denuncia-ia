// Servicio de logging para depuración y monitoreo de errores
// Solo activará logs detallados en producción cuando sea necesario

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

type LogPayload = {
  message: string;
  context?: Record<string, any>;
  timestamp?: string;
  service?: string;
  level?: LogLevel;
  error?: Error | unknown;
};

// Verifica si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

// Variable para activar logs detallados en producción (se puede cambiar en runtime)
let verboseLoggingEnabled = false;

export const logger = {
  // Habilita logs detallados en producción
  enableVerboseLogging: () => {
    verboseLoggingEnabled = true;
    logger.info('Verbose logging enabled', { service: 'logger' });
  },

  // Deshabilita logs detallados en producción
  disableVerboseLogging: () => {
    verboseLoggingEnabled = false;
    logger.info('Verbose logging disabled', { service: 'logger' });
  },

  // Log de depuración (solo visible en desarrollo o si verbose está activado)
  debug: (message: string, params?: Omit<LogPayload, 'message' | 'level'>) => {
    if (!isProduction || verboseLoggingEnabled) {
      logToConsole({
        message,
        level: LogLevel.DEBUG,
        timestamp: new Date().toISOString(),
        ...params
      });
    }
  },

  // Log informativo
  info: (message: string, params?: Omit<LogPayload, 'message' | 'level'>) => {
    logToConsole({
      message,
      level: LogLevel.INFO,
      timestamp: new Date().toISOString(),
      ...params
    });
  },

  // Log de advertencia
  warn: (message: string, params?: Omit<LogPayload, 'message' | 'level'>) => {
    logToConsole({
      message,
      level: LogLevel.WARN,
      timestamp: new Date().toISOString(),
      ...params
    });
  },

  // Log de error
  error: (message: string, params?: Omit<LogPayload, 'message' | 'level'>) => {
    const { error, ...rest } = params || {};
    
    // Capturar stack trace si hay un error
    const errorObject = error instanceof Error ? error : new Error(String(error));
    
    logToConsole({
      message,
      level: LogLevel.ERROR,
      timestamp: new Date().toISOString(),
      error: {
        name: errorObject.name,
        message: errorObject.message,
        stack: errorObject.stack
      },
      ...rest
    });
  },

  // Log crítico (siempre se muestra y podría enviar alertas)
  critical: (message: string, params?: Omit<LogPayload, 'message' | 'level'>) => {
    const { error, ...rest } = params || {};
    
    // Capturar stack trace si hay un error
    const errorObject = error instanceof Error ? error : new Error(String(error));
    
    logToConsole({
      message,
      level: LogLevel.CRITICAL,
      timestamp: new Date().toISOString(),
      error: {
        name: errorObject.name,
        message: errorObject.message,
        stack: errorObject.stack
      },
      ...rest
    });
    
    // En un sistema real, aquí se enviarían alertas (SMS, email, etc.)
  }
};

// Función para mostrar logs formateados en la consola
function logToConsole(logPayload: LogPayload) {
  const { level, message, timestamp, service, context, error } = logPayload;
  
  // Formato para logs
  const prefix = `[${timestamp}] [${level}]${service ? ` [${service}]` : ''}`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(`${prefix} ${message}`, context || '');
      break;
    case LogLevel.INFO:
      console.info(`${prefix} ${message}`, context || '');
      break;
    case LogLevel.WARN:
      console.warn(`${prefix} ${message}`, context || '');
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      console.error(`${prefix} ${message}`, error || '', context || '');
      break;
    default:
      console.log(`${prefix} ${message}`, context || '');
  }
}

// Exportar también las constantes
export { LogLevel };
export type { LogPayload }; 