import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// All routes require ADMIN role
router.use(authenticateToken);
router.use(authorizeRole('ADMIN'));

// Data retrieval routes
router.get('/products', adminController.getProducts);
router.get('/vendors', adminController.getVendors);
router.get('/orders', adminController.getOrders);
router.get('/documents', adminController.getDocuments);
router.get('/shipments', adminController.getShipments);

// Action routes
router.post('/orders/create-request', adminController.createOrderRequest);
router.post('/vendors/invite', adminController.inviteVendor);
router.post('/compliance/define-rule', adminController.defineComplianceRule);
router.post('/documents/upload-master', adminController.uploadMasterSOP);

export default router;