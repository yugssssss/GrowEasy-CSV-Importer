import { createApp } from './app.js';
import { env, assertConfig } from './config/env.js';
import { log } from './utils/helpers.js';

assertConfig();

const app = createApp();

app.listen(env.port, () => {
  log.info(`GrowEasy CSV Importer API listening on port ${env.port}`);
  log.info(`Health: http://localhost:${env.port}/api/health`);
});
