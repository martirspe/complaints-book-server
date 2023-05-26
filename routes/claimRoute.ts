import { Router } from 'express';
import { deleteClaim, getClaim, getClaims, postClaim, putClaim } from '../controllers/claimController';

const router = Router();

router.get('/', getClaims);
router.get('/:id', getClaim);
router.post('/', postClaim);
router.put('/:id', putClaim);
router.delete('/:id', deleteClaim);

export default router;
