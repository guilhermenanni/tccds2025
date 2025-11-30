// backend/src/routes/seletivaRoutes.js

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listarSeletivas,
  listarSeletivasPorCategoria,
  listarSeletivasPorCidade,
  criarSeletiva,
  inscreverSeletiva,
  listarInscricoesUsuario,
  listarMinhasSeletivas,
  cancelarInscricao,
  listarInscritosSeletiva, // 👈 NOVO
} from '../controllers/seletivaController.js';

const router = Router();

// Lista geral
router.get('/', listarSeletivas);

// Filtros
router.get('/categoria/:categoria', listarSeletivasPorCategoria);
router.get('/cidade/:cidade', listarSeletivasPorCidade);

// Minhas seletivas (usuário ou time logado)
router.get('/minhas', authMiddleware, listarMinhasSeletivas);

// Criação de seletiva (time logado)
router.post('/', authMiddleware, criarSeletiva);

// Inscrever (usuário logado)
router.post('/:id/inscrever', authMiddleware, inscreverSeletiva);

// Cancelar inscrição (usuário logado)
router.delete('/:id/inscrever', authMiddleware, cancelarInscricao);

// 🔎 Listar inscritos de uma seletiva (time dono da seletiva)
router.get('/:id/inscritos', authMiddleware, listarInscritosSeletiva);

// Listar inscrições de um usuário específico
router.get('/usuario/:id_usuario', authMiddleware, listarInscricoesUsuario);

export default router;
