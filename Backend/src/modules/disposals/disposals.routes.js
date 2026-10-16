import express from 'express';
import { handleUploadError, upload } from '../../middlewares/upload.js';
import { validateIdParam } from '../../middlewares/security.js';
import {
  deleteAdministrativeDisposal,
  deleteStorageDisposal,
  disposeStorageArticle,
  listAdministrativeDisposals,
  listStorageDisposals,
} from './disposals.controller.js';

const router = express.Router();
router.param('id', validateIdParam);

// Bajas de artículos administrativos
router.get('/articulos_baja', listAdministrativeDisposals);
router.delete('/articulos_baja/:id', deleteAdministrativeDisposal);

// Bajas de almacén (con foto opcional)
router.post('/articulos-baja/:id', upload.single('imagen'), handleUploadError, disposeStorageArticle);
router.get('/articulos-baja-historial', listStorageDisposals);
router.delete('/articulos_baja_historial/:id', deleteStorageDisposal);

export default router;
