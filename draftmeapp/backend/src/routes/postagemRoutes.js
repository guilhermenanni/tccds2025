import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listarPostagens,
  criarPostagem,
  curtirPostagem,
  descurtirPostagem,
  deletarPostagem,
} from '../controllers/postagemController.js';

const router = Router();

router.get('/', listarPostagens);
router.post('/', authMiddleware, criarPostagem);
router.post('/:id/curtir', authMiddleware, curtirPostagem);
router.delete('/:id/curtir', authMiddleware, descurtirPostagem);
router.delete('/:id', authMiddleware, deletarPostagem);

export default router;
