import multer from 'multer';
import { log } from '../utils/helpers.js';

/** 404 handler for unknown routes. */
export function notFound(_req, res) {
  res.status(404).json({ success: false, error: 'Route not found.' });
}

/**
 * Central error handler. Turns thrown errors (multer limits, OpenAI failures,
 * config problems, etc.) into consistent JSON responses with sensible codes.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ success: false, error: err.message });
  }

  const message = err?.message || 'Unexpected server error.';

  // Missing API key / model misconfiguration => 500 with a clear hint.
  const isConfig = /OPENAI_API_KEY/i.test(message);
  const status = isConfig ? 500 : err.status || 500;

  log.error('Request failed', message);
  return res.status(status).json({ success: false, error: message });
}
