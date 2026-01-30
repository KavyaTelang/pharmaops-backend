import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import * as vendorController from '../controllers/vendor.controller';

const router = Router();

// All routes require VENDOR role
router.use(authenticateToken);
router.use(authorizeRole('VENDOR'));

// Get vendor's orders
router.get('/orders', vendorController.getMyOrders);

// Accept vendor invitation
router.post('/invitation/accept', vendorController.acceptInvitation);

// Accept an order
router.post('/orders/:orderId/accept', vendorController.acceptOrder);

// Upload document
router.post('/documents/upload', vendorController.uploadDocument);

// Create shipment
router.post('/shipments/create', vendorController.createShipment);

export default router;