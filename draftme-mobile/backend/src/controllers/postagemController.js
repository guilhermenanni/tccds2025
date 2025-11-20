// backend/src/controllers/postagemController.js

import { createPool } from '../config/db.js';

const pool = createPool();

// 2. POSTAGENS

// Lista todas as postagens (feed)
export const listarPostagens = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        p.id_postagem,
        p.texto_postagem,
        p.img_postagem,
        p.categoria,
        p.tag,
        p.data_postagem,
        u.id_usuario,
        u.nm_usuario,
        u.img_usuario,
        t.id_time,
        t.nm_time,
        t.img_time,
        (SELECT COUNT(*) FROM tb_curtida c WHERE c.id_postagem = p.id_postagem) AS curtidas_count
      FROM tb_postagem p
      LEFT JOIN tb_usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN tb_time t ON p.id_time = t.id_time
      ORDER BY p.data_postagem DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Criação de postagem
export const criarPostagem = async (req, res, next) => {
  try {
    const { texto_postagem, categoria, tag, img_postagem } = req.body;
    const { id, type } = req.user;

    if (!texto_postagem || texto_postagem.trim() === '') {
      return res
        .status(400)
        .json({ success: false, message: 'Texto da postagem é obrigatório' });
    }

    let id_usuario = null;
    let id_time = null;

    if (type === 'usuario') id_usuario = id;
    if (type === 'time') id_time = id;

    const [result] = await pool.query(
      `INSERT INTO tb_postagem 
      (texto_postagem, img_postagem, categoria, tag, id_usuario, id_time)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        texto_postagem,
        img_postagem || null,
        categoria || null,
        tag || null,
        id_usuario,
        id_time,
      ]
    );

    const [rows] = await pool.query(
      `SELECT 
        p.id_postagem,
        p.texto_postagem,
        p.img_postagem,
        p.categoria,
        p.tag,
        p.data_postagem,
        u.id_usuario,
        u.nm_usuario,
        u.img_usuario,
        t.id_time,
        t.nm_time,
        t.img_time,
        0 AS curtidas_count
      FROM tb_postagem p
      LEFT JOIN tb_usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN tb_time t ON p.id_time = t.id_time
      WHERE p.id_postagem = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Postagem criada com sucesso',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// Curtir postagem
export const curtirPostagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let id_usuario = null;
    let id_time = null;

    if (user.type === 'usuario') id_usuario = user.id;
    if (user.type === 'time') id_time = user.id;

    await pool.query(
      `INSERT INTO tb_curtida (id_postagem, id_usuario, id_time)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE data_curtida = CURRENT_TIMESTAMP`,
      [id, id_usuario, id_time]
    );

    res.json({ success: true, message: 'Postagem curtida' });
  } catch (err) {
    next(err);
  }
};

// Remover curtida
export const descurtirPostagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let id_usuario = null;
    let id_time = null;

    if (user.type === 'usuario') id_usuario = user.id;
    if (user.type === 'time') id_time = user.id;

    await pool.query(
      `DELETE FROM tb_curtida 
       WHERE id_postagem = ? AND 
             ((id_usuario IS NOT NULL AND id_usuario = ?) OR 
              (id_time IS NOT NULL AND id_time = ?))`,
      [id, id_usuario, id_time]
    );

    res.json({ success: true, message: 'Curtida removida' });
  } catch (err) {
    next(err);
  }
};

// Deletar postagem (apenas dono)
export const deletarPostagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await pool.query(
      'SELECT id_usuario, id_time FROM tb_postagem WHERE id_postagem = ?',
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Postagem não encontrada' });
    }

    const post = rows[0];

    if (
      (user.type === 'usuario' && post.id_usuario !== user.id) &&
      (user.type === 'time' && post.id_time !== user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar esta postagem',
      });
    }

    await pool.query('DELETE FROM tb_postagem WHERE id_postagem = ?', [id]);

    res.json({ success: true, message: 'Postagem deletada com sucesso' });
  } catch (err) {
    next(err);
  }
};
