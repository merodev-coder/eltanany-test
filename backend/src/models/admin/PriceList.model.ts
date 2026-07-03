// backend/src/models/admin/PriceList.model.ts
// Singleton PriceList — stores converted HTML from the uploaded .docx.
// Atomic upsert via findOneAndUpdate.

import { adminMongoose, adminDb } from '../../config/db.js';

const priceListSchema = new adminMongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'اسم الملف مطلوب'],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, 'محتوى القائمة مطلوب'],
    },
  },
  { timestamps: true }
);

priceListSchema.index({ createdAt: -1 });

// Create the raw model first
const PriceListRaw = adminDb.model('PriceList', priceListSchema);

// Augment with the singleton upsert method on the model constructor
(PriceListRaw as any).upsertSingleton = async function (
  payload: { fileName: string; htmlContent: string }
) {
  return PriceListRaw.findOneAndUpdate(
    {},
    {
      $set: {
        fileName: payload.fileName,
        htmlContent: payload.htmlContent,
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      sort: { createdAt: -1 },
    }
  );
};

// Export with full typing
export type PriceListModelType = typeof PriceListRaw & {
  upsertSingleton(payload: { fileName: string; htmlContent: string }): Promise<any>;
};

export const PriceList = PriceListRaw as PriceListModelType;
export default PriceList;
