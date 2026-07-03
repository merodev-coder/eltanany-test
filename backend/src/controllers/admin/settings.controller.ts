import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

// No DB at all. Hardcoded payment info (matches frontend CheckoutPage.tsx)
const VODAFONE_NUMBER = '01000000000';
const INSTAPAY_ACCOUNT = '@eltanany';

// ── GET /api/v1/admin/settings/payment ────────────────────────────────────
export const getPaymentMethods = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { vodafoneCashNumber: VODAFONE_NUMBER, instaPayAccount: INSTAPAY_ACCOUNT },
  });
});

// ── POST /api/v1/admin/settings/payment ───────────────────────────────────
export const updatePaymentMethods = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'تم تحديث طرق الدفع',
    data: { vodafoneCashNumber: VODAFONE_NUMBER, instaPayAccount: INSTAPAY_ACCOUNT },
  });
});

// ── Price-list (from PriceList model) ──────────────────────────────────────
export { getPriceList } from './priceList.controller.js';
export { createPriceList } from './priceList.controller.js';
export { removePriceList as deletePriceList, removePriceList } from './priceList.controller.js';
export { updatePriceListSchema } from './../../validators/settings.validator.js';
