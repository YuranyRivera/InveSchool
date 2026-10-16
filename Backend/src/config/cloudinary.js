import { v2 as cloudinary } from 'cloudinary';
import './env.js';

// Único punto de configuración de Cloudinary (imágenes de las bajas de almacén).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
