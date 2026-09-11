import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dataRoutes from './routes/dataroutes.js';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Verificación de variables de entorno obligatorias.
// Sin JWT_SECRET, cualquier login/verificación de sesión revienta con un 500
// genérico que no dice nada útil en los logs — lo dejamos explícito acá.
const REQUIRED_ENV_VARS = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT', 'JWT_SECRET'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(
    `⚠️  Faltan variables de entorno obligatorias: ${missingEnvVars.join(', ')}. ` +
    'Configúralas en el panel de Render (Environment) o en tu archivo .env local.'
  );
}

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 4000;

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://inveschool.netlify.app',
  'https://front-inventarioschool-v1.onrender.com',
  'https://inventarioschool-v1.onrender.com',
  'https://frontend-phi-five-52.vercel.app',
];

const allowedOriginPattern = /\.(netlify\.app|vercel\.app)$/;

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman) o con orígenes permitidos
    if (!origin || allowedOrigins.includes(origin) || allowedOriginPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Para permitir cookies y autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Manejo de solicitudes preflight (OPTIONS)
app.options('*', cors(corsOptions));

// Middleware para agregar cabeceras CORS de forma dinámica
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Middleware para procesar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas
app.use('/api', dataRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal', details: err.message });
});

// Ver origen de las solicitudes (Debug)
app.use((req, res, next) => {
  console.log('Origen de la solicitud:', req.headers.origin);
  next();
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
