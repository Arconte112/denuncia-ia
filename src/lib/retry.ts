import { logger } from './logger';

/**
 * Opciones para la función de reintento
 */
export interface RetryOptions {
  /** Número máximo de intentos */
  maxRetries: number;
  /** Retraso inicial en ms */
  initialDelay: number;
  /** Factor para aumentar el retraso exponencialmente */
  backoffFactor: number;
  /** Jitter máximo para añadir aleatoriedad (0-1) */
  jitter: number;
  /** Nombre de la operación para logging */
  operationName?: string;
  /** Función personalizada para evaluar si se debe reintentar basado en el error */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Valores predeterminados para opciones de reintento
 */
const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  backoffFactor: 2,
  jitter: 0.1,
  shouldRetry: () => true,
};

/**
 * Función que ejecuta una operación con reintentos automáticos
 * @param operation Función a ejecutar con posibilidad de reintento
 * @param options Opciones de configuración de reintentos
 * @returns Resultado de la operación
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const opts: RetryOptions = { ...defaultRetryOptions, ...options };
  const operationName = opts.operationName || 'operación';
  
  let attempt = 0;
  let lastError: unknown;
  
  while (attempt <= opts.maxRetries) {
    try {
      if (attempt > 0) {
        logger.info(`Reintentando ${operationName} (intento ${attempt}/${opts.maxRetries})`, {
          service: 'retry',
          context: { attempt, maxRetries: opts.maxRetries }
        });
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;
      
      const shouldRetry = 
        attempt <= opts.maxRetries && 
        (opts.shouldRetry ? opts.shouldRetry(error) : true);
      
      if (!shouldRetry) {
        logger.warn(`No se reintentará ${operationName} después del error`, {
          service: 'retry',
          context: { attempt, maxRetries: opts.maxRetries },
          error
        });
        break;
      }
      
      if (attempt <= opts.maxRetries) {
        // Calcular retraso con backoff exponencial y jitter
        const delay = calculateDelay(attempt, opts);
        
        logger.warn(`Error en ${operationName}, reintentando en ${delay}ms`, {
          service: 'retry',
          context: { attempt, delay, maxRetries: opts.maxRetries },
          error
        });
        
        await sleep(delay);
      }
    }
  }
  
  logger.error(`${operationName} falló después de ${attempt} intentos`, {
    service: 'retry',
    context: { attempts: attempt, maxRetries: opts.maxRetries },
    error: lastError
  });
  
  throw lastError;
}

/**
 * Calcula el retraso para el próximo intento
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  // Backoff exponencial: initialDelay * (backoffFactor ^ attempt)
  const backoffDelay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1);
  
  // Añadir jitter (aleatoriedad) para evitar tormentas de reintentos
  const jitterAmount = backoffDelay * options.jitter;
  const jitter = Math.random() * jitterAmount * 2 - jitterAmount;
  
  return Math.max(0, Math.floor(backoffDelay + jitter));
}

/**
 * Espera un tiempo determinado
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 