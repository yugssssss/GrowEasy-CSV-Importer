import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, validated environment configuration.
 * Everything the app needs from process.env is read here once,
 * so the rest of the code never touches process.env directly.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // AI batching / reliability tuning
  batchSize: Number(process.env.BATCH_SIZE) || 15,
  batchConcurrency: Number(process.env.BATCH_CONCURRENCY) || 3,
  maxRetries: Number(process.env.MAX_RETRIES) || 3,

  // Safety limits
  maxRows: Number(process.env.MAX_ROWS) || 5000,
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 5,

  // CORS — comma separated list of allowed origins, or "*" for all
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

/**
 * Fail fast if a required key is missing when the server boots.
 * We only warn (not crash) so the health endpoint still works,
 * but any /import call will clearly report the misconfiguration.
 */
export function assertConfig() {
  if (!env.openaiApiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      '[config] OPENAI_API_KEY is not set. Add it to backend/.env before importing CSVs.'
    );
  }
}
