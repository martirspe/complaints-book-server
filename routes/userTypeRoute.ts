import { Router } from 'express';
import { getUsersTypes } from '../controllers/userTypeController';

const router = Router();

router.get('/', getUsersTypes);

export default router;
