// backend/src/routes/comentarioRoutes.js

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listarComentariosPorPostagem,
  adicionarComentario,
  deletarComentario,
} from '../controllers/comentarioController.js';

const router = Router();

// Lista comentários de uma postagem
router.get('/postagem/:id_postagem', listarComentariosPorPostagem);

// Adiciona comentário (aceita body com id_postagem)
router.post('/', authMiddleware, adicionarComentario);

// Também aceita comentário com id na URL, se o front chamar assim
router.post('/postagem/:id_postagem', authMiddleware, adicionarComentario);

// Deleta comentário
router.delete('/:id', authMiddleware, deletarComentario);

export default router;
