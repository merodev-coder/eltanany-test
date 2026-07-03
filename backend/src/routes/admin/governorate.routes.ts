// backend/src/routes/admin/governorate.routes.ts
import { Router } from 'express';
import * as governorateController from '../../controllers/admin/governorate.controller.js';

const router = Router();

router.get('/', governorateController.getAllGovernorates);
router.post('/', governorateController.createGovernorate);
router.patch('/:id', governorateController.updateGovernorate);
router.delete('/:id', governorateController.deleteGovernorate);

export default router;
