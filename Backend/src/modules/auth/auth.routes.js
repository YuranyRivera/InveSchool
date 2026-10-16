import express from 'express';
import { demoLogin, login, logout, requestPasswordReset, resetPassword, updateProfile } from './auth.controller.js';
import { verifyToken } from '../../middlewares/authenticate.js';
import { demoLoginLimiter, loginLimiter, passwordResetLimiter } from '../../middlewares/security.js';
import { auditWrites } from '../../middlewares/audit.js';
import { blockDemoWrites } from '../../middlewares/demo-mode.js';

const router = express.Router();

// Públicas (con límite de intentos)
router.post('/login', loginLimiter, login);
router.post('/reset-password', passwordResetLimiter, requestPasswordReset);
router.post('/update-password', passwordResetLimiter, resetPassword);
router.post('/demo-login', demoLoginLimiter, demoLogin);

// El cierre de sesión es local (se descarta el token); este endpoint solo confirma.
router.post('/logout', logout);

// Requieren sesión
router.post('/update-profile', verifyToken, auditWrites, blockDemoWrites, updateProfile);

export default router;
