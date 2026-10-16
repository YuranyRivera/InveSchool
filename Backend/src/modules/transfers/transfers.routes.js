import express from 'express';
import { validateIdParam } from '../../middlewares/security.js';
import { createTransfer, deleteTransfer, listTransfers, updateTransfer } from './transfers.controller.js';

const router = express.Router();
router.param('id', validateIdParam);

router.get('/traslados', listTransfers);
router.post('/traslados', createTransfer);
router.put('/traslados/:id', updateTransfer);
router.delete('/traslados/:id', deleteTransfer);

export default router;
