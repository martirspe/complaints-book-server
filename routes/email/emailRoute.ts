import { Router } from 'express';
import { sendMail } from '../../controllers/email/emailController';

const router = Router();

router.post('/', sendMail);

export default router;
