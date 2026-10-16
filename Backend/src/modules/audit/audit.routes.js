import express from 'express';
import { requireRole } from '../../middlewares/authenticate.js';
import { DEMO_ROLE } from '../../utils/validation.js';
import { listAuditLog } from './audit.controller.js';

const router = express.Router();

// Solo Administrador; la demo la ve con correos e IP enmascarados.
router.get('/auditoria', requireRole('Administrador', DEMO_ROLE), listAuditLog);

export default router;
