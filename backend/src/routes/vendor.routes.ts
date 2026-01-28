import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as vendorController from '../controllers/vendor.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All vendor routes require authentication and VENDOR role
router.use(authenticate);
router.use(authorize('VENDOR'));

// ===== ORDER MANAGEMENT =====

// GET /api/vendor/my-requests
router.get('/my-requests', asyncHandler(vendorController.getMyRequests));

// POST /api/vendor/orders/:orderId/accept
router.post('/orders/:orderId/accept', asyncHandler(vendorController.acceptOrder));

// GET /api/vendor/orders/:orderId/checklist
router.get('/orders/:orderId/checklist', asyncHandler(vendorController.getOrderChecklist));

// ===== DOCUMENT UPLOAD =====

// POST /api/vendor/documents/upload
router.post(
  '/documents/upload',
  upload.single('file'),
  [
    body('orderId').isUUID(),
    body('docType').notEmpty(),
  ],
  asyncHandler(vendorController.uploadDocument)
);

// ===== SHIPMENT MANAGEMENT =====

// POST /api/vendor/shipments/create
router.post(
  '/shipments/create',
  [
    body('orderId').isUUID(),
    body('trackingNumber').notEmpty(),
    body('courierName').notEmpty(),
  ],
  asyncHandler(vendorController.createShipment)
);

// GET /api/vendor/shipments
router.get('/shipments', asyncHandler(vendorController.getMyShipments));

export default router;