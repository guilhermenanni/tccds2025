// backend/src/server.js

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { configDotenv } from './config/env.js';
import { createPool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postagemRoutes from './routes/postagemRoutes.js';
import comentarioRoutes from './routes/comentarioRoutes.js';
import seletivaRoutes from './routes/seletivaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

// Testa conexão com o banco
createPool()
  .getConnection()
  .then((conn) => {
    console.log('✅ Conectado ao MySQL com sucesso');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no MySQL:', err.message);
  });

// Middlewares globais
app.use(cors());

// Aumenta o limite do JSON para aceitar imagens base64 maiores
app.use(
  express.json({
    limit: '10mb',
  })
);
app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true,
  })
);

app.use(morgan('dev'));

// Rotas
app.use('/auth', authRoutes);
app.use('/postagens', postagemRoutes);
app.use('/comentarios', comentarioRoutes);
app.use('/seletivas', seletivaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/health', healthRoutes);

// Middleware de erro centralizado
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API DraftMe rodando na porta ${PORT}`);
});
