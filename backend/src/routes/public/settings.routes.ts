// backend/src/routes/public/settings.routes.ts
// Public endpoints — no authentication required.

import { Router } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import PriceList from '../../models/admin/PriceList.model.js';
import { Request, Response } from 'express';

const router = Router();

// Hardcoded payment details (same as CheckoutPage)
const PAYMENT_INFO = {
  vodafoneCashNumber: '01000000000',
  instaPayAccount: '@eltanany',
} as const;

// GET /api/v1/public/settings
router.get('/', (_req, res) => {
  res.status(200).json({ success: true, data: PAYMENT_INFO });
});

// GET /api/v1/public/settings/price-list
// Mirrors GET /api/v1/public/price-list — both serve the same MongoDB data.
router.get(
  '/price-list',
  catchAsync(async (_req, res) => {
    const doc = await PriceList.findOne().sort({ createdAt: -1 }).lean();
    if (!doc) {
      return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({
      success: true,
      data: {
        fileName: doc.fileName,
        htmlContent: doc.htmlContent,
      },
    });
  })
);

export default router;
