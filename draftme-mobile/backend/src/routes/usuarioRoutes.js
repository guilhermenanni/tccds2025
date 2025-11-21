// draftme-mobile/backend/src/routes/usuarioRoutes.js
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  obterPerfilUsuario,
  atualizarPerfilUsuario,
  listarPostagensUsuario,
  obterPerfilTime,
  atualizarPerfilTime,
  listarPostagensTime,
} from '../controllers/usuarioController.js';

const router = Router();

// PERFIL DE USUÁRIO
router.get('/usuario/:id', obterPerfilUsuario);
router.put('/usuario/:id', authMiddleware, atualizarPerfilUsuario);
router.get('/usuario/:id/postagens', listarPostagensUsuario);

// PERFIL DE TIME
router.get('/time/:id', obterPerfilTime);
router.put('/time/:id', authMiddleware, atualizarPerfilTime);
router.get('/time/:id/postagens', listarPostagensTime);

export default router;
