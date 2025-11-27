import express from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import { applySecurity } from './middleware/security.js';
import { chatRouter } from './routes/chat.js';
import { openApiRouter } from './routes/openapi.js';
import { authRouter } from './routes/auth.js';
import { imagesRouter } from './routes/images.js';

const app = express();

if (!config.geminiApiKey) {
  throw new Error('[startup] GEMINI_API_KEY is required. Mock responses have been removed.');
}

if (!config.authEmail || (!config.authPassword && !config.authPasswordHash)) {
  throw new Error('[startup] AUTH_EMAIL and AUTH_PASSWORD (or AUTH_PASSWORD_HASH) must be set to enable login.');
}

if (!config.jwtSecret) {
  throw new Error('[startup] JWT_SECRET must be set to issue authentication tokens.');
}

app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.logFormat));
applySecurity(app);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/images', imagesRouter);
app.use('/api', openApiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Unhandled error', err);
  res.status(500).json({ error: 'Unexpected error' });
});

app.listen(config.port, () => {
  console.log(`[server] Listening on port ${config.port}`);
});
