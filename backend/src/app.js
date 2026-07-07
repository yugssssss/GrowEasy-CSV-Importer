import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import importRoutes from './routes/import.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  // CORS: allow a single origin, a comma list, or all ("*").
  const origins =
    env.corsOrigin === '*'
      ? true
      : env.corsOrigin.split(',').map((o) => o.trim());
  app.use(cors({ origin: origins }));

  // JSON body support (used by the { csv } fallback path).
  app.use(express.json({ limit: `${env.maxFileSizeMb + 1}mb` }));

  // Health check — handy for uptime pings and Render/Railway probes.
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'groweasy-csv-importer',
      model: env.openaiModel,
      time: new Date().toISOString(),
    });
  });

  app.use('/api', importRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
