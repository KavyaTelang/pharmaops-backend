import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as qaController from '../controllers/qa.controller';

const router = Router();

// All QA routes require authentication and QA role
router.use(authenticate);
router.use(authorize('QA'));

// ===== REVIEW QUEUE =====

// GET /api/qa/review-queue
router.get('/review-queue', asyncHandler(qaController.getReviewQueue));

// GET /api/qa/documents/:docId/details
router.get('/documents/:docId/details', asyncHandler(qaController.getDocumentDetails));

// ===== DOCUMENT APPROVAL/REJECTION (21 CFR Part 11 Compliant) =====

// POST /api/qa/documents/:docId/approve
router.post(
  '/documents/:docId/approve',
  [
    body('password').notEmpty(),
    body('comments').optional(),
  ],
  asyncHandler(qaController.approveDocument)
);

// POST /api/qa/documents/:docId/reject
router.post(
  '/documents/:docId/reject',
  [
    body('reason').notEmpty(),
  ],
  asyncHandler(qaController.rejectDocument)
);

// ===== STATS =====

// GET /api/qa/stats
router.get('/stats', asyncHandler(qaController.getQAStats));

export default router;