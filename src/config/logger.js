const pino = require('pino');
const path = require('path');
const fs = require('fs');

// Crear carpeta logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Función para capturar archivo y línea del caller
function getCallerInfo() {
  const err = new Error();
  const stack = err.stack.split('\n');
  // stack[0] = "Error"
  // stack[1] = "at getCallerInfo"
  // stack[2] = "at logger method wrapper"
  // stack[3] = "at actual caller" <- queremos este
  const callerLine = stack[3] || stack[2];
  const match = callerLine.match(/at\s+(?:.*\s+)?\(?(.+):(\d+):(\d+)\)?/);
  if (match) {
    const filePath = match[1];
    const line = match[2];
    // Extraer solo el nombre del archivo relativo
    const fileName = filePath.includes('SistemaPracticaProfesional') 
      ? filePath.split('SistemaPracticaProfesional')[1].replace(/\\/g, '/')
      : path.basename(filePath);
    return { file: fileName, line: parseInt(line) };
  }
  return {};
}

// Configuración según el entorno
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  
  // Desarrollo: Consola pretty + archivo
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'info',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          }
        },
        {
          target: 'pino/file',
          level: 'debug',
          options: { 
            destination: path.join(logsDir, 'app.log'),
            mkdir: true
          }
        }
      ]
    }
  }),
  
  // Producción: Solo archivo JSON
  ...(process.env.NODE_ENV === 'production' && {
    transport: {
      target: 'pino/file',
      options: {
        destination: path.join(logsDir, 'app.log')
      }
    }
  })
};

const baseLogger = pino(loggerConfig);

// Wrapper para agregar información del caller automáticamente
const logger = {
  trace: (obj, msg) => {
    const caller = getCallerInfo();
    if (typeof obj === 'string') {
      // Si solo se pasa un string, usarlo como mensaje
      baseLogger.trace({ ...caller }, obj);
    } else {
      baseLogger.trace({ ...obj, ...caller }, msg);
    }
  },
  debug: (obj, msg) => {
    const caller = getCallerInfo();
    if (typeof obj === 'string') {
      baseLogger.debug({ ...caller }, obj);
    } else {
      baseLogger.debug({ ...obj, ...caller }, msg);
    }
  },
  info: (obj, msg) => {
    const caller = getCallerInfo();
    if (typeof obj === 'string') {
      baseLogger.info({ ...caller }, obj);
    } else {
      baseLogger.info({ ...obj, ...caller }, msg);
    }
  },
  warn: (obj, msg) => {
    const caller = getCallerInfo();
    if (typeof obj === 'string') {
      baseLogger.warn({ ...caller }, obj);
    } else {
      baseLogger.warn({ ...obj, ...caller }, msg);
    }
  },
  error: (obj, msg) => {
    const caller = getCallerInfo();
    if (typeof obj === 'string') {
      baseLogger.error({ ...caller }, obj);
    } else {
      baseLogger.error({ ...obj, ...caller }, msg);
    }
  },
  fatal: (obj, msg) => {
    const caller = getCallerInfo();
    if (typeof obj === 'string') {
      baseLogger.fatal({ ...caller }, obj);
    } else {
      baseLogger.fatal({ ...obj, ...caller }, msg);
    }
  }
};

module.exports = logger;