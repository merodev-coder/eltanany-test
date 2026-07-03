// backend/src/routes/admin/product.routes.ts
import { Router } from 'express';
import * as productController from '../../controllers/admin/product.controller.js';
import validate from '../../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../../validators/product.validator.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', validate(createProductSchema), productController.createProduct);
router.patch('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
