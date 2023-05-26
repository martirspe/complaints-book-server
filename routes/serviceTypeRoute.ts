import { Router } from 'express';
import { getServiceTypes } from '../controllers/serviceTypeController';

const router = Router();

router.get('/', getServiceTypes);

export default router;
