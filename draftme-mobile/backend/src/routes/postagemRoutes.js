// backend/src/routes/postagemRoutes.js

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listarPostagens,
  criarPostagem,
  curtirPostagem,
  descurtirPostagem,
  listarComentarios,
  criarComentario,
} from '../controllers/postagemController.js';

const router = Router();

router.get('/', listarPostagens);
router.post('/', authMiddleware, criarPostagem);

// Curtir / Descurtir
router.post('/:id/curtir', authMiddleware, curtirPostagem);
router.delete('/:id/curtir', authMiddleware, descurtirPostagem);

// Comentários
router.get('/:id/comentarios', listarComentarios);
router.post('/:id/comentarios', authMiddleware, criarComentario);

export default router;
