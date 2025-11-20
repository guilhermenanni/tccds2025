// backend/src/controllers/postagemController.js

import { createPool } from '../config/db.js';

const pool = createPool();

// ========================================
// LISTAR POSTAGENS (FEED)
// ========================================
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

        -- autor já pronto
        CASE 
          WHEN u.id_usuario IS NOT NULL THEN u.nm_usuario
          WHEN t.id_time IS NOT NULL THEN t.nm_time
        END AS autor,

        CASE 
          WHEN u.id_usuario IS NOT NULL THEN u.img_usuario
          WHEN t.id_time IS NOT NULL THEN t.img_time
        END AS avatar,

        (SELECT COUNT(*) FROM tb_curtida c WHERE c.id_postagem = p.id_postagem) AS curtidas_count,
        (SELECT COUNT(*) FROM tb_comentario m WHERE m.id_postagem = p.id_postagem) AS comentarios_count

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

// ========================================
// CRIAR POSTAGEM
// ========================================
export const criarPostagem = async (req, res, next) => {
  try {
    const { texto_postagem, categoria, tag, img_postagem } = req.body;
    const { id, type } = req.user;

    if (!texto_postagem || texto_postagem.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Texto é obrigatório',
      });
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

        CASE 
          WHEN u.id_usuario IS NOT NULL THEN u.nm_usuario
          WHEN t.id_time IS NOT NULL THEN t.nm_time
        END AS autor,

        CASE 
          WHEN u.id_usuario IS NOT NULL THEN u.img_usuario
          WHEN t.id_time IS NOT NULL THEN t.img_time
        END AS avatar,

        0 AS curtidas_count,
        0 AS comentarios_count

      FROM tb_postagem p
      LEFT JOIN tb_usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN tb_time t ON p.id_time = t.id_time
      WHERE p.id_postagem = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ========================================
// CURTIR POSTAGEM
// ========================================
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

    res.json({ success: true, message: 'Curtido!' });
  } catch (err) {
    next(err);
  }
};

// ========================================
// DESCURTIR POSTAGEM
// ========================================
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
       ((id_usuario = ?) OR (id_time = ?))`,
      [id, id_usuario, id_time]
    );

    res.json({ success: true, message: 'Descurtido!' });
  } catch (err) {
    next(err);
  }
};

// ========================================
// LISTAR COMENTÁRIOS
// ========================================
export const listarComentarios = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        m.id_comentario,
        m.comentario,
        m.data_comentario,
        u.nm_usuario AS autor,
        u.img_usuario AS avatar
      FROM tb_comentario m
      LEFT JOIN tb_usuario u ON m.id_usuario = u.id_usuario
      WHERE m.id_postagem = ?
      ORDER BY m.data_comentario ASC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ========================================
// CRIAR COMENTÁRIO
// ========================================
export const criarComentario = async (req, res, next) => {
  try {
    const { id } = req.params; // ID da postagem
    const { comentario } = req.body;
    const user = req.user;

    if (!comentario || comentario.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comente algo...',
      });
    }

    const id_usuario = user.id;

    await pool.query(
      `INSERT INTO tb_comentario (id_postagem, id_usuario, comentario)
       VALUES (?, ?, ?)`,
      [id, id_usuario, comentario]
    );

    res.json({ success: true, message: 'Comentário publicado!' });
  } catch (err) {
    next(err);
  }
};
