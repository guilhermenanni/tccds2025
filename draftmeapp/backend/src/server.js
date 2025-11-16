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

createPool()
  .getConnection()
  .then((conn) => {
    console.log('✅ Conectado ao MySQL com sucesso');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no MySQL:', err.message);
  });

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/postagens', postagemRoutes);
app.use('/comentarios', comentarioRoutes);
app.use('/seletivas', seletivaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/health', healthRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API DraftMe rodando na porta ${PORT}`);
});
