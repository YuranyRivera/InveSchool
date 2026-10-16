import express from 'express';
import { getSupplierStats, listProductsBySupplier, listSuppliers } from './suppliers.controller.js';

const router = express.Router();

router.get('/proveedores', listSuppliers);
router.get('/productosproveedor', listProductsBySupplier);
router.get('/estadisticas', getSupplierStats);

export default router;
