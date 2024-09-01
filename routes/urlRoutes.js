import express from 'express';
import { generatePresignedUrl } from '../utils/s3Utils.js';

const router = express.Router();

router.get('/generate-presigned-url', generatePresignedUrl);

export default router;
