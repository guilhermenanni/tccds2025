// backend/src/controllers/comentarioController.js

import { createPool } from '../config/db.js';

const pool = createPool();

// 3. COMENTÁRIOS

// Lista comentários de uma postagem específica
export const listarComentariosPorPostagem = async (req, res, next) => {
  try {
    // app pode mandar como /comentarios/postagem/:id_postagem
    const { id_postagem } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        c.id_comentario,
        c.comentario,           -- nome correto da coluna
        c.data_comentario,
        u.id_usuario,
        u.nm_usuario,
        u.img_usuario,
        t.id_time,
        t.nm_time,
        t.img_time
      FROM tb_comentario c
      LEFT JOIN tb_usuario u ON c.id_usuario = u.id_usuario
      LEFT JOIN tb_time t ON c.id_time = t.id_time
      WHERE c.id_postagem = ?
      ORDER BY c.data_comentario ASC`,
      [id_postagem]
    );

    const data = rows.map((row) => ({
      id_comentario: row.id_comentario,
      texto_comentario: row.comentario,      // o front continua usando texto_comentario
      data_comentario: row.data_comentario,
      autor: row.nm_usuario || row.nm_time,
      avatar: row.img_usuario || row.img_time,
      tipo_autor: row.nm_usuario ? 'usuario' : 'time',
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Adiciona comentário em uma postagem
export const adicionarComentario = async (req, res, next) => {
  try {
    // pode vir no body (id_postagem) ou na URL (/comentarios/postagem/:id_postagem)
    let id_postagem = req.body.id_postagem || req.params.id_postagem;
    const { texto_comentario } = req.body;
    const { id, type } = req.user;

    if (!id_postagem) {
      return res.status(400).json({
        success: false,
        message: 'ID da postagem não informado',
      });
    }

    if (!texto_comentario || texto_comentario.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'O comentário não pode ser vazio.',
      });
    }

    let id_usuario = null;
    let id_time = null;
    if (type === 'usuario') id_usuario = id;
    if (type === 'time') id_time = id;

    const [result] = await pool.query(
      `INSERT INTO tb_comentario (id_postagem, comentario, id_usuario, id_time)
       VALUES (?, ?, ?, ?)`,
      [id_postagem, texto_comentario, id_usuario, id_time]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tb_comentario WHERE id_comentario = ?',
      [result.insertId]
    );

    const row = rows[0];

    const data = {
      id_comentario: row.id_comentario,
      id_postagem: row.id_postagem,
      id_usuario: row.id_usuario,
      id_time: row.id_time,
      texto_comentario: row.comentario,        // normaliza pro nome que o front espera
      data_comentario: row.data_comentario,
    };

    res.status(201).json({
      success: true,
      data,
      message: 'Comentário adicionado com sucesso',
    });
  } catch (err) {
    next(err);
  }
};

// Deleta comentário (apenas o dono pode apagar)
export const deletarComentario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await pool.query(
      'SELECT id_usuario, id_time FROM tb_comentario WHERE id_comentario = ?',
      [id]
    );

    const comentario = rows[0];
    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado',
      });
    }

    const ehDonoUsuario =
      user.type === 'usuario' && comentario.id_usuario === user.id;
    const ehDonoTime =
      user.type === 'time' && comentario.id_time === user.id;

    if (!ehDonoUsuario && !ehDonoTime) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar este comentário',
      });
    }

    await pool.query('DELETE FROM tb_comentario WHERE id_comentario = ?', [id]);

    res.json({ success: true, message: 'Comentário deletado com sucesso' });
  } catch (err) {
    next(err);
  }
};
