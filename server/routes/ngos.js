import { Router } from 'express';
import { registerNGO, listNGOs } from '../controllers/ngosController.js';

const router = Router();

router.post('/', registerNGO);
router.get('/', listNGOs);

export default router;


