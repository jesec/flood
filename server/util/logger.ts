import pino from 'pino';
import pretty from 'pino-pretty';

const appName = 'flood';
const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

const shouldPrettyPrint = () => {
  const format = process.env.LOG_FORMAT;
  if (format === 'pretty' || format === 'text') {
    return true;
  }
  if (format === 'json') {
    return false;
  }

  return process.env.NODE_ENV === 'development' && process.stdout.isTTY;
};

export const createLoggerOptions = (component?: string): pino.LoggerOptions => {
  return {
    name: component ? `${appName}:${component}` : appName,
    level,
    timestamp: pino.stdTimeFunctions.isoTime,
  };
};

const createDestination = () => {
  if (!shouldPrettyPrint()) {
    return undefined;
  }

  return pretty({
    colorize: true,
    levelFirst: true,
    singleLine: true,
    translateTime: 'SYS:standard',
    errorLikeObjectKeys: ['err', 'error'],
  });
};

const logger = pino(createLoggerOptions(), createDestination());

export const createLogger = (component: string, bindings: Record<string, unknown> = {}) => {
  const componentLogger = pino(createLoggerOptions(component), createDestination());
  return Object.keys(bindings).length > 0 ? componentLogger.child(bindings) : componentLogger;
};

export default logger;
