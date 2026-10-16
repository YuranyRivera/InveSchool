import express from 'express';
import { verifyToken } from '../middlewares/authenticate.js';
import { auditWrites } from '../middlewares/audit.js';
import { blockDemoWrites } from '../middlewares/demo-mode.js';
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import suppliersRoutes from '../modules/suppliers/suppliers.routes.js';
import administrativeArticlesRoutes from '../modules/administrative-articles/administrative-articles.routes.js';
import storageArticlesRoutes from '../modules/storage-articles/storage-articles.routes.js';
import transfersRoutes from '../modules/transfers/transfers.routes.js';
import disposalsRoutes from '../modules/disposals/disposals.routes.js';
import stockMovementsRoutes from '../modules/stock-movements/stock-movements.routes.js';

const router = express.Router();

// --- Públicas: login, recuperación de contraseña y demo ---
router.use(authRoutes);

// --- Protegidas: todo lo de abajo exige una sesión válida ---
const protectedRouter = express.Router();
protectedRouter.use(verifyToken);
// Toda operación que modifica datos queda en la bitácora (también los intentos rechazados)...
protectedRouter.use(auditWrites);
// ...y la demo pública es de solo lectura.
protectedRouter.use(blockDemoWrites);

for (const moduleRoutes of [
  usersRoutes,
  auditRoutes,
  dashboardRoutes,
  suppliersRoutes,
  administrativeArticlesRoutes,
  storageArticlesRoutes,
  transfersRoutes,
  disposalsRoutes,
  stockMovementsRoutes,
]) {
  protectedRouter.use(moduleRoutes);
}

router.use(protectedRouter);

export default router;
