import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  obterPerfilUsuario,
  atualizarPerfilUsuario,
  listarPostagensUsuario,
} from '../controllers/usuarioController.js';

const router = Router();

// PERFIL DE USUÁRIO
router.get('/usuario/:id', obterPerfilUsuario);
router.put('/usuario/:id', authMiddleware, atualizarPerfilUsuario);
router.get('/usuario/:id/postagens', listarPostagensUsuario);

export default router;
