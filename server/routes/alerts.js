import { Router } from 'express';
import { 
  getAlerts, 
  createAlert, 
  updateAlert, 
  deactivateAlert 
} from '../controllers/alertsController.js';

const router = Router();

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.patch('/:id/deactivate', deactivateAlert);

export default router;


