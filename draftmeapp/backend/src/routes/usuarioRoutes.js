import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  obterPerfilUsuario,
  obterPerfilTime,
  atualizarPerfilUsuario,
  atualizarPerfilTime,
  listarPostagensUsuario,
  listarPostagensTime,
} from '../controllers/usuarioController.js';

const router = Router();

router.get('/usuario/:id', obterPerfilUsuario);
router.get('/time/:id', obterPerfilTime);
router.put('/usuario/:id', authMiddleware, atualizarPerfilUsuario);
router.put('/time/:id', authMiddleware, atualizarPerfilTime);
router.get('/usuario/:id/postagens', listarPostagensUsuario);
router.get('/time/:id/postagens', listarPostagensTime);

export default router;
