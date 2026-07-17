import express from 'express';
import { config } from './config';
import { securityHeaders, rateLimiter } from './middlewares/security.middleware';
import logger from './middlewares/logger';
import routes from './routes';

const app = express();

app.use(securityHeaders);
app.use(rateLimiter);
app.use(express.json({ limit: '10kb' }));

app.use(routes);



app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
});

export default app;

