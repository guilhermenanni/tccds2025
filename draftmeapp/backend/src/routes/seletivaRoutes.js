import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listarSeletivas,
  listarSeletivasPorCategoria,
  listarSeletivasPorCidade,
  criarSeletiva,
  inscreverSeletiva,
  listarInscricoesUsuario,
} from '../controllers/seletivaController.js';

const router = Router();

router.get('/', listarSeletivas);
router.get('/categoria/:categoria', listarSeletivasPorCategoria);
router.get('/cidade/:cidade', listarSeletivasPorCidade);
router.post('/', authMiddleware, criarSeletiva);
router.post('/:id/inscrever', authMiddleware, inscreverSeletiva);
router.get('/usuario/:id_usuario', authMiddleware, listarInscricoesUsuario);

export default router;
