// backend/src/routes/public/priceList.routes.ts
// No authentication required.
// Serves the converted HTML string for the public /pricelist page.

import { Router } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import PriceList from '../../models/admin/PriceList.model.js';

const router = Router();

// GET /api/v1/public/price-list
// Returns { fileName, htmlContent } or null if no list has been uploaded yet.
router.get(
  '/',
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
        uploadedAt: doc.createdAt,
      },
    });
  })
);

export default router;
