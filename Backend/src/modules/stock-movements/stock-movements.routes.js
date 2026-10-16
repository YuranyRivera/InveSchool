import express from 'express';
import { validateIdParam } from '../../middlewares/security.js';
import {
  createMovement,
  deleteMovement,
  deleteMovementRecord,
  getMovementDetails,
  listMovementSummaries,
  updateMovement,
} from './stock-movements.controller.js';

const router = express.Router();
router.param('id', validateIdParam);

router.post('/movimientos', createMovement);
router.put('/movimientos/:id', updateMovement);
router.delete('/movimientos/:id', deleteMovement);
router.get('/movimiento/:id', getMovementDetails);
router.delete('/eliminar-movimiento/:id', deleteMovementRecord);
router.get('/reporte-general', listMovementSummaries);

export default router;
