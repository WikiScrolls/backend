import morgan, { StreamOptions } from 'morgan';
import { logger } from '../config/logger';

// Stream object for Morgan to use Winston
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging for health check endpoints
const skip = (req: any) => {
  return req.url === '/health' || req.url === '/';
};

// Morgan format: HTTP method, URL, status code, response time
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
