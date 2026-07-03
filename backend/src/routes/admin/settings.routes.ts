// backend/src/routes/admin/settings.routes.ts
// Price-list now accepts { fileName, htmlContent } JSON (mammoth runs in browser).
import { Router } from 'express';
import {
  getPaymentMethods,
  updatePaymentMethods,
  getPriceList,
  createPriceList,
  removePriceList,
} from './../../controllers/admin/settings.controller.js';
import { paymentLimiter } from './../../middleware/paymentRateLimiter.js';
import validate from './../../middleware/validate.js';
import {
  getPaymentSettingsSchema,
  updatePaymentSettingsSchema,
  updatePriceListSchema,
} from './../../validators/settings.validator.js';

const router = Router();

// ── Payment (backwards-compat — values are hardcoded, saving is a no-op) ──
router.get('/payment', getPaymentMethods);
router.post(
  '/payment',
  paymentLimiter,
  validate(updatePaymentSettingsSchema),
  updatePaymentMethods
);

// ── Price-list (client converts .docx → HTML, server just saves the string) ─
router.get('/price-list', getPriceList);
router.post(
  '/price-list',
  validate(updatePriceListSchema),
  createPriceList
);
router.delete('/price-list', removePriceList);

export default router;
