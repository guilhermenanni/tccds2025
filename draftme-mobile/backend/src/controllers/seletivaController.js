// backend/src/controllers/seletivaController.js

import { createPool } from '../config/db.js';

const pool = createPool();

// 4. SELETIVAS

// Lista todas as seletivas disponíveis
export const listarSeletivas = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        s.id_seletiva,
        s.titulo,
        s.sobre,
        s.localizacao,
        s.cidade,
        s.data_seletiva,
        s.hora,
        s.categoria,
        s.subcategoria,
        t.id_time,
        t.nm_time,
        t.img_time
      FROM tb_seletiva s
      INNER JOIN tb_time t ON s.id_time = t.id_time
      ORDER BY s.data_postagem DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Filtra seletivas por categoria
export const listarSeletivasPorCategoria = async (req, res, next) => {
  try {
    const { categoria } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        s.id_seletiva,
        s.titulo,
        s.sobre,
        s.localizacao,
        s.cidade,
        s.data_seletiva,
        s.hora,
        s.categoria,
        s.subcategoria,
        t.id_time,
        t.nm_time,
        t.img_time
      FROM tb_seletiva s
      INNER JOIN tb_time t ON s.id_time = t.id_time
      WHERE s.categoria = ?
      ORDER BY s.data_postagem DESC`,
      [categoria]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Filtra seletivas por cidade
export const listarSeletivasPorCidade = async (req, res, next) => {
  try {
    const { cidade } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        s.id_seletiva,
        s.titulo,
        s.sobre,
        s.localizacao,
        s.cidade,
        s.data_seletiva,
        s.hora,
        s.categoria,
        s.subcategoria,
        t.id_time,
        t.nm_time,
        t.img_time
      FROM tb_seletiva s
      INNER JOIN tb_time t ON s.id_time = t.id_time
      WHERE s.cidade = ?
      ORDER BY s.data_postagem DESC`,
      [cidade]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Criação de seletiva
export const criarSeletiva = async (req, res, next) => {
  try {
    const { type, id } = req.user;
    const {
      titulo,
      localizacao,
      cidade,
      data_seletiva,
      hora,
      categoria,
      subcategoria,
      sobre,
    } = req.body;

    if (type !== 'time') {
      return res
        .status(403)
        .json({ success: false, message: 'Apenas times podem criar seletivas' });
    }

    if (!titulo || !localizacao || !cidade || !data_seletiva || !hora) {
      return res.status(400).json({
        success: false,
        message: 'Título, local, cidade, data e hora são obrigatórios',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO tb_seletiva 
        (id_time, titulo, localizacao, cidade, data_seletiva, hora, categoria, subcategoria, sobre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        titulo,
        localizacao,
        cidade,
        data_seletiva,
        hora,
        categoria || null,
        subcategoria || null,
        sobre || '',
      ]
    );

    const [rows] = await pool.query(
      `SELECT 
        s.id_seletiva,
        s.titulo,
        s.sobre,
        s.localizacao,
        s.cidade,
        s.data_seletiva,
        s.hora,
        s.categoria,
        s.subcategoria,
        t.id_time,
        t.nm_time,
        t.img_time
      FROM tb_seletiva s
      INNER JOIN tb_time t ON s.id_time = t.id_time
      WHERE s.id_seletiva = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Seletiva criada com sucesso',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// Inscrever usuário
export const inscreverSeletiva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (user.type !== 'usuario') {
      return res.status(403).json({
        success: false,
        message: 'Apenas usuários podem se inscrever',
      });
    }

    const id_usuario = user.id;

    const [existing] = await pool.query(
      `SELECT id_inscricao FROM tb_inscricao_seletiva 
       WHERE id_seletiva = ? AND id_usuario = ?`,
      [id, id_usuario]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Usuário já inscrito',
      });
    }

    await pool.query(
      `INSERT INTO tb_inscricao_seletiva (id_seletiva, id_usuario)
       VALUES (?, ?)`,
      [id, id_usuario]
    );

    res.json({ success: true, message: 'Inscrição realizada' });
  } catch (err) {
    next(err);
  }
};

// CANCELAR INSCRIÇÃO — AQUI ESTÁ A FUNÇÃO NOVA
export const cancelarInscricao = async (req, res, next) => {
  try {
    const { id } = req.params; // ID da seletiva
    const user = req.user;

    if (user.type !== 'usuario') {
      return res.status(403).json({
        success: false,
        message: 'Apenas usuários podem cancelar inscrição',
      });
    }

    const id_usuario = user.id;

    const [result] = await pool.query(
      `DELETE FROM tb_inscricao_seletiva 
       WHERE id_seletiva = ? AND id_usuario = ?`,
      [id, id_usuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Inscrição cancelada com sucesso',
    });
  } catch (err) {
    next(err);
  }
};

// Lista inscrições de um usuário específico
export const listarInscricoesUsuario = async (req, res, next) => {
  try {
    const { id_usuario } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        i.id_inscricao,
        i.data_inscricao,
        i.status,
        s.id_seletiva,
        s.titulo,
        s.localizacao,
        s.cidade,
        s.data_seletiva,
        s.hora,
        s.categoria,
        s.subcategoria,
        t.id_time,
        t.nm_time,
        t.img_time
      FROM tb_inscricao_seletiva i
      INNER JOIN tb_seletiva s ON i.id_seletiva = s.id_seletiva
      INNER JOIN tb_time t ON s.id_time = t.id_time
      WHERE i.id_usuario = ?
      ORDER BY i.data_inscricao DESC`,
      [id_usuario]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Minhas seletivas (usuário logado)
export const listarMinhasSeletivas = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.type !== 'usuario') {
      return res.status(403).json({
        success: false,
        message: 'Apenas usuários podem ver suas seletivas',
      });
    }

    const id_usuario = user.id;

    const [rows] = await pool.query(
      `SELECT 
        i.id_inscricao,
        i.data_inscricao,
        i.status,
        s.id_seletiva,
        s.titulo,
        s.localizacao,
        s.cidade,
        s.data_seletiva,
        s.hora,
        s.categoria,
        s.subcategoria,
        t.id_time,
        t.nm_time,
        t.img_time
      FROM tb_inscricao_seletiva i
      INNER JOIN tb_seletiva s ON i.id_seletiva = s.id_seletiva
      INNER JOIN tb_time t ON s.id_time = t.id_time
      WHERE i.id_usuario = ?
      ORDER BY i.data_inscricao DESC`,
      [id_usuario]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
