import { createPool } from '../config/db.js';

const pool = createPool();

// 5. USUÁRIOS / PERFIS

export const obterPerfilUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id_usuario, nm_usuario, email_usuario, tel_usuario, img_usuario, sobre, data_criacao, data_atualizacao
       FROM tb_usuario
       WHERE id_usuario = ?`,
      [id]
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const obterPerfilTime = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id_time, nm_time, email_time, time_cnpj, categoria_time, esporte_time, img_time, sobre_time, data_criacao, data_atualizacao
       FROM tb_time
       WHERE id_time = ?`,
      [id]
    );

    const time = rows[0];
    if (!time) {
      return res.status(404).json({ success: false, message: 'Time não encontrado' });
    }

    res.json({ success: true, data: time });
  } catch (err) {
    next(err);
  }
};

export const atualizarPerfilUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: idToken, type } = req.user;

    if (type !== 'usuario' || Number(id) !== idToken) {
      return res.status(403).json({ success: false, message: 'Sem permissão para editar este perfil' });
    }

    const { nm_usuario, tel_usuario, img_usuario, sobre } = req.body;

    await pool.query(
      `UPDATE tb_usuario
       SET nm_usuario = COALESCE(?, nm_usuario),
           tel_usuario = COALESCE(?, tel_usuario),
           img_usuario = COALESCE(?, img_usuario),
           sobre = COALESCE(?, sobre)
       WHERE id_usuario = ?`,
      [nm_usuario, tel_usuario, img_usuario, sobre, id]
    );

    const [rows] = await pool.query(
      `SELECT id_usuario, nm_usuario, email_usuario, tel_usuario, img_usuario, sobre, data_criacao, data_atualizacao
       FROM tb_usuario
       WHERE id_usuario = ?`,
      [id]
    );

    res.json({ success: true, data: rows[0], message: 'Perfil atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
};

export const atualizarPerfilTime = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: idToken, type } = req.user;

    if (type !== 'time' || Number(id) !== idToken) {
      return res.status(403).json({ success: false, message: 'Sem permissão para editar este perfil' });
    }

    const { nm_time, categoria_time, esporte_time, img_time, sobre_time } = req.body;

    await pool.query(
      `UPDATE tb_time
       SET nm_time = COALESCE(?, nm_time),
           categoria_time = COALESCE(?, categoria_time),
           esporte_time = COALESCE(?, esporte_time),
           img_time = COALESCE(?, img_time),
           sobre_time = COALESCE(?, sobre_time)
       WHERE id_time = ?`,
      [nm_time, categoria_time, esporte_time, img_time, sobre_time, id]
    );

    const [rows] = await pool.query(
      `SELECT id_time, nm_time, email_time, time_cnpj, categoria_time, esporte_time, img_time, sobre_time, data_criacao, data_atualizacao
       FROM tb_time
       WHERE id_time = ?`,
      [id]
    );

    res.json({ success: true, data: rows[0], message: 'Perfil de time atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
};

export const listarPostagensUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        p.id_postagem,
        p.texto_postagem,
        p.img_postagem,
        p.categoria,
        p.tag,
        p.data_postagem
      FROM tb_postagem p
      WHERE p.id_usuario = ?
      ORDER BY p.data_postagem DESC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const listarPostagensTime = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        p.id_postagem,
        p.texto_postagem,
        p.img_postagem,
        p.categoria,
        p.tag,
        p.data_postagem
      FROM tb_postagem p
      WHERE p.id_time = ?
      ORDER BY p.data_postagem DESC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
