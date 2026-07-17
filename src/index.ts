import express from 'express';
import { config } from './config';
import { securityHeaders, rateLimiter } from './middlewares/security.middleware';
import logger from './middlewares/logger';
import routes from './routes';
import { pool } from './config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = express();

app.use(securityHeaders);
app.use(rateLimiter);
app.use(express.json({ limit: '10kb' }));

app.use(routes);

async function migrate(): Promise<void> {
  try {
    const sql = readFileSync(join(__dirname, '../sql/001_init.sql'), 'utf-8');
    await pool.query(sql);
    logger.info('Database migration completed');
  } catch (err) {
    logger.warn({ err }, 'Migration skipped or already applied');
  }
}

migrate()
  .then(() => {
    app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
    });
  });


