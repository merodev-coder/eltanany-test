// backend/src/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter: FileRouter = {
receiptUploader: f({
image: {
maxFileSize: "4MB",
maxFileCount: 1,
},
})
.onUploadComplete(async ({ metadata, file }) => {
console.log("Receipt upload completed:", file.name, file.ufsUrl);
return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
}),

// Base .docx upload (price list, docs, etc.) — 16MB max
// Frontend already restricts to admin-only via the upload button visibility.
// The authenticated save happens separately via POST /admin/settings/price-list.
docxUploader: f({
"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
maxFileSize: "16MB",
maxFileCount: 1,
},
})
.onUploadComplete(async ({ metadata, file }) => {
console.log("DOCX upload completed:", file.name, file.ufsUrl);
return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
}),

productImageUploader: f({
image: {
maxFileSize: "4MB",
maxFileCount: 6,
},
})
.onUploadComplete(async ({ metadata, file }) => {
console.log("Product image upload completed:", file.name, file.ufsUrl);
return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
}),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
