import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { apiLimiter, securityHeaders } from './middlewares/security.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';

/** Crea la aplicación Express (sin levantar el servidor: así también se puede usar en pruebas). */
export const createApp = () => {
  const app = express();

  // Render/Vercel ponen un proxy delante: necesario para que el límite de solicitudes vea la IP real.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(securityHeaders);

  // CORS: solo los orígenes exactos configurados en CORS_ORIGINS (sin comodines).
  app.use(
    cors({
      origin(origin, callback) {
        // Sin cabecera Origin = petición de servidor a servidor (curl, health checks): no aplica CORS.
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api', apiLimiter, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
