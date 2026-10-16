import express from 'express';
import { validateIdParam } from '../../middlewares/security.js';
import {
  createAdministrativeArticle,
  disposeAdministrativeArticle,
  getLastAdministrativeArticleId,
  listAdministrativeArticles,
  listArticlesByLocation,
  updateAdministrativeArticle,
} from './administrative-articles.controller.js';

const router = express.Router();
router.param('id', validateIdParam);

router.get('/articulos-administrativos', listAdministrativeArticles);
router.get('/articulos-administrativos/last-id', getLastAdministrativeArticleId);
router.post('/articulos-administrativos', createAdministrativeArticle);
router.put('/articulos_administrativos/:id', updateAdministrativeArticle);
router.delete('/articulos_administrativos/:id', disposeAdministrativeArticle);
router.get('/productos/:ubicacion', listArticlesByLocation);

export default router;
