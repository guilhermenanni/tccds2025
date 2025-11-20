import { Router } from 'express';
import { loginUsuario, loginTime, registerUsuario, registerTime } from '../controllers/authController.js';

const router = Router();

router.post('/login/usuario', loginUsuario);
router.post('/login/time', loginTime);
router.post('/register/usuario', registerUsuario);
router.post('/register/time', registerTime);

export default router;
