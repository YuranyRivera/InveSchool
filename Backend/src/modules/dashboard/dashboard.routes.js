import express from 'express';
import {
  countActiveAdministrativeArticles,
  countAdministrativeDisposals,
  countStorageArticles,
  countStorageDisposals,
  listRecentActivity,
} from './dashboard.controller.js';

const router = express.Router();

router.get('/ultimo-registro', listRecentActivity);
router.get('/total-articulos-almacenamiento', countStorageArticles);
router.get('/total-activos', countActiveAdministrativeArticles);
router.get('/total-inactivos', countAdministrativeDisposals);
router.get('/total-historial-bajas', countStorageDisposals);

export default router;
