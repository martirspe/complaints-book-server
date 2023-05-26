import { Router } from 'express';
import { getClaimTypes } from '../controllers/claimTypeController';

const router = Router();

router.get('/', getClaimTypes);

export default router;
