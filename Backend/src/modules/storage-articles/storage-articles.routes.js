import express from 'express';
import { validateIdParam } from '../../middlewares/security.js';
import {
  createStorageArticle,
  deleteStorageArticle,
  getLastStorageArticleId,
  listStorageArticles,
  listStorageProducts,
  updateStorageArticle,
} from './storage-articles.controller.js';

const router = express.Router();
router.param('id', validateIdParam);

router.get('/articulos', listStorageArticles);
router.get('/articulos/last-id', getLastStorageArticleId);
router.post('/articulos', createStorageArticle);
router.put('/articulos/:id', updateStorageArticle);
router.delete('/articulos/:id', deleteStorageArticle);
router.get('/productos', listStorageProducts);

export default router;
