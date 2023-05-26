import { Router } from 'express';
import { postClaimDetails } from '../controllers/claimDetailsController';

const router = Router();

router.post('/', postClaimDetails);

export default router;
