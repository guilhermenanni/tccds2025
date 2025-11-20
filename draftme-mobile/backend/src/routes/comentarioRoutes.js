import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listarComentariosPorPostagem,
  adicionarComentario,
  deletarComentario,
} from '../controllers/comentarioController.js';

const router = Router();

router.get('/postagem/:id_postagem', listarComentariosPorPostagem);
router.post('/', authMiddleware, adicionarComentario);
router.delete('/:id', authMiddleware, deletarComentario);

export default router;
