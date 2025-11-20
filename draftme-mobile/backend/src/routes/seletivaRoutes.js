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
  cancelarInscricao, // <-- ADICIONADO
} from '../controllers/seletivaController.js';

const router = Router();

// Lista todas as seletivas
router.get('/', listarSeletivas);

// Filtros
router.get('/categoria/:categoria', listarSeletivasPorCategoria);
router.get('/cidade/:cidade', listarSeletivasPorCidade);

// Seletivas do usuário logado
router.get('/minhas', authMiddleware, listarMinhasSeletivas);

// Criação de seletiva (time logado)
router.post('/', authMiddleware, criarSeletiva);

// Inscrição
router.post('/:id/inscrever', authMiddleware, inscreverSeletiva);

// CANCELAR inscrição (rota que faltava!)
router.delete('/:id/inscrever', authMiddleware, cancelarInscricao);

// Listar inscrições de um usuário específico
router.get('/usuario/:id_usuario', authMiddleware, listarInscricoesUsuario);

export default router;
