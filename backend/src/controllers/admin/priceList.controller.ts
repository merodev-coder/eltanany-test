// backend/src/controllers/admin/priceList.controller.ts
// Accepts { fileName, htmlContent } from the client (mammoth runs in the browser),
// then atomically upserts the singleton PriceList document.

import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import PriceList from '../../models/admin/PriceList.model.js';

// ── GET /api/v1/admin/price-list ──────────────────────────
export const getPriceList = catchAsync(
  async (_req: Request, res: Response) => {
    const doc = await PriceList.findOne().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: doc
        ? { fileName: doc.fileName, htmlContent: doc.htmlContent }
        : null,
    });
  }
);

// ── POST /api/v1/admin/price-list ──────────────────────────
// Client sends { fileName, htmlContent } as JSON (mammoth ran in-browser).
export const createPriceList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileName, htmlContent } = req.body as {
      fileName?: string;
      htmlContent?: string;
    };

    if (!fileName?.trim() || !htmlContent?.trim()) {
      return next(new AppError('اسم الملف ومحتواه مطلوبان', 400));
    }

    const doc = await PriceList.upsertSingleton({
      fileName: fileName.trim(),
      htmlContent: htmlContent.trim(),
    });

    res.status(200).json({
      success: true,
      message: 'تم حفظ قائمة الأسعار بنجاح',
      data: { fileName: doc.fileName, htmlContent: doc.htmlContent },
    });
  }
);

// ── DELETE /api/v1/admin/price-list ────────────────────────
export const removePriceList = catchAsync(
  async (_req: Request, res: Response) => {
    await PriceList.deleteMany({});
    res.status(200).json({ success: true, data: null });
  }
);
