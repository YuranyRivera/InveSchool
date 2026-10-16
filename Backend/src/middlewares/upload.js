import crypto from 'crypto';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carpeta temporal: las imágenes se suben a Cloudinary y luego se borran de aquí.
const uploadDir = join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Solo formatos de imagen comunes; la extensión se decide aquí, nunca desde el nombre que envía el usuario.
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  // Nombre aleatorio: evita path traversal y sobrescribir archivos de otros.
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype]}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    return cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

/** Convierte los errores de subida (tamaño, tipo de archivo) en respuestas 400 claras. */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'El archivo es demasiado grande. El máximo es 5 MB.' : 'No se pudo procesar el archivo.';
    return res.status(400).json({ message });
  }
  if (err) {
    // Errores del filtro de tipo de archivo (uploadConfig).
    return res.status(400).json({ message: err.message });
  }
  return next();
};
