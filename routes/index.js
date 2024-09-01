import { Router } from 'express';

import registerRoute from './registerRoute.js';
import loginRoute from './loginRoute.js';
import userRoutes from './userRoutes.js';
import scheduleRoutes from './scheduleRoutes.js';
import urlRoutes from './urlRoutes.js';
import refreshRoute from './refreshRoute.js';
import profileRoutes from './profileRoutes.js';

const router = Router();

router.use('/', registerRoute);
router.use('/', loginRoute);
router.use('/', userRoutes);
router.use('/', scheduleRoutes);
router.use('/', urlRoutes);
router.use('/', refreshRoute);
router.use('/', profileRoutes);

export default router;
