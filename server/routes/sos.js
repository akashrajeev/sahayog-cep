import { Router } from 'express';
import { createSOS } from '../controllers/sosController.js';

const router = Router();

router.post('/', createSOS);

export default router;


