// backend/src/validators/settings.validator.ts
import { z } from 'zod';

// ── Admin: GET /payment ────────────────────────────────────────────────────
export const getPaymentSettingsSchema = z.object({});

// ── Admin: POST /payment ───────────────────────────────────────────────────
export const updatePaymentSettingsSchema = z.object({
  body: z.object({
    vodafoneCashNumber: z
      .string()
      .max(20, 'رقم Vodafone Cash طويل جداً')
      .regex(/^$|^[\d+\-() ]{0,20}$/, 'أدخل رقم هاتف صالح')
      .optional(),
    instaPayAccount: z
      .string()
      .max(50, 'حساب InstaPay طويل جداً')
      .regex(/^$|^.{3,50}$/, 'أدخل حساب InstaPay صالح (3–50 حرف)')
      .optional(),
  }),
});

// ── Admin: POST /price-list ────────────────────────────────────────────────
// Client sends { fileName, htmlContent } as JSON (mammoth ran in-browser).
export const updatePriceListSchema = z.object({
  body: z.object({
    fileName: z
      .string()
      .min(1, 'اسم الملف مطلوب')
      .max(200, 'اسم الملف طويل جداً'),
    htmlContent: z
      .string()
      .min(1, 'محتوى القائمة مطلوب'),
  }),
});

// ── Admin: DELETE /price-list ─────────────────────────────────────────────
// No body — unconditionally clears the price-list.
export const clearPriceListSchema = z.object({});
