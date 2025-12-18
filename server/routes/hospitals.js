import { Router } from 'express';
import { getHospitals } from '../controllers/hospitalsController.js';

const router = Router();

router.get('/', getHospitals);

export default router;


