import express from 'express';
import rateLimit from 'express-rate-limit';
import { checkDatabase, checkLiveness } from './health.controller.js';

const router = express.Router();

// Suficiente para un monitor que consulta cada pocos minutos; evita que se use para saturar la base.
const dbCheckLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });

router.get('/health', checkLiveness);
router.get('/health/db', dbCheckLimiter, checkDatabase);

export default router;
