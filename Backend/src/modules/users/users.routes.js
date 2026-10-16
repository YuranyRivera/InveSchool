import express from 'express';
import { requireRole } from '../../middlewares/authenticate.js';
import { validateIdParam } from '../../middlewares/security.js';
import { DEMO_ROLE, USER_ADMIN_ROLES } from '../../utils/validation.js';
import { createUser, deleteUser, listUsers } from './users.controller.js';

const router = express.Router();
router.param('id', validateIdParam);

// La demo puede ver la lista (con correos enmascarados), pero no modificarla.
router.get('/usuarios', requireRole(...USER_ADMIN_ROLES, DEMO_ROLE), listUsers);
router.post('/usuarios', requireRole(...USER_ADMIN_ROLES), createUser);
router.delete('/usuarios/:id', requireRole(...USER_ADMIN_ROLES), deleteUser);

export default router;
