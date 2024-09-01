import { Router } from 'express';

import registerRoute from './registerRoute.js';
import loginRoute from './loginRoute.js';
import userRoutes from './userRoutes.js';
import scheduleRoutes from './scheduleRoutes.js';

const router = Router();

router.use('/', registerRoute);
router.use('/', loginRoute);
router.use('/', userRoutes);
router.use('/', scheduleRoutes);

export default router;
