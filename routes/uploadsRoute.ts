import { Router } from 'express';
import { uploadFile } from '../controllers/uploadsController';

const router = Router();

router.post('/', uploadFile)

export default router;