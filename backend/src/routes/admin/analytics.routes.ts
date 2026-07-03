// backend/src/routes/admin/analytics.routes.ts
import { Router } from 'express';
import { getMonthlyAnalytics, getOverviewStats } from '../../controllers/admin/analytics.controller.js';

const router = Router();

router.get('/monthly', getMonthlyAnalytics);
router.get('/overview', getOverviewStats);

export default router;
