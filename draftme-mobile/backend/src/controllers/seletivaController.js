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

// Filtra seletivas por "cidade" (aqui usamos localizacao/cidade como referência)
export const listarSeletivasPorCidade = async (req, res, next) => {
  try {
    const { cidade } = req.params;
    const like = `%${cidade}%`;

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
      WHERE s.localizacao LIKE ? OR s.cidade LIKE ?
      ORDER BY s.data_postagem DESC`,
      [like, like]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Criação de seletiva (time logado)
export const criarSeletiva = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.type !== 'time') {
      return res.status(403).json({
        success: false,
        message: 'Apenas times podem criar seletivas',
      });
    }

    let id_time = user.id;

    const {
      titulo,
      sobre,
      localizacao,
      data_seletiva,
      hora,
      categoria,
      subcategoria,
      cidade,
    } = req.body;

    // validação de campos obrigatórios
    if (!titulo || !sobre || !localizacao || !data_seletiva || !hora) {
      return res.status(400).json({
        success: false,
        message: 'Preencha título, sobre, localizacao, data e hora.',
      });
    }

    // 🤝 GAMBIS CONTROLADA:
    // garante que sempre exista um registro em tb_time com esse id_time
    const [times] = await pool.query(
      'SELECT id_time FROM tb_time WHERE id_time = ?',
      [id_time]
    );

    if (times.length === 0) {
      // cria o time com o MESMO id_time do token
      const fakeName = `Time ${id_time}`;
      const fakeEmail = `time${id_time}@auto.local`;
      const fakeCategoria = 'auto';

      await pool.query(
        `INSERT INTO tb_time (id_time, nm_time, email_time, categoria_time)
         VALUES (?, ?, ?, ?)`,
        [id_time, fakeName, fakeEmail, fakeCategoria]
      );
    }

    // se não vier cidade, usa a própria localização como fallback
    const cidadeFinal =
      cidade && cidade.trim().length > 0 ? cidade.trim() : localizacao;

    await pool.query(
      `INSERT INTO tb_seletiva 
        (id_time, titulo, localizacao, cidade, data_seletiva, hora, categoria, subcategoria, sobre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_time,
        titulo,
        localizacao,
        cidadeFinal,
        data_seletiva,
        hora,
        categoria || 'Geral',
        subcategoria || 'Geral',
        sobre,
      ]
    );

    res.json({
      success: true,
      message: 'Seletiva criada com sucesso',
    });
  } catch (err) {
    next(err);
  }
};

// Inscrição em seletiva (usuário logado)
export const inscreverSeletiva = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user || user.type !== 'usuario') {
      return res.status(403).json({
        success: false,
        message: 'Apenas usuários podem se inscrever em seletivas',
      });
    }

    const id_usuario = user.id;

    await pool.query(
      `INSERT INTO tb_inscricao_seletiva (id_seletiva, id_usuario)
       VALUES (?, ?)`,
      [id, id_usuario]
    );

    res.json({
      success: true,
      message: 'Inscrição realizada com sucesso',
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Você já está inscrito nesta seletiva',
      });
    }
    next(err);
  }
};

// CANCELAR inscrição em seletiva (usuário logado)
export const cancelarInscricao = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user || user.type !== 'usuario') {
      return res.status(403).json({
        success: false,
        message: 'Apenas usuários podem cancelar inscrições',
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

/**
 * Lista "minhas seletivas"
 *  - se for USUÁRIO: seletivas em que ele está inscrito
 *  - se for TIME: seletivas criadas por ele
 */
export const listarMinhasSeletivas = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado',
      });
    }

    // Usuário comum -> seletivas em que ele está inscrito
    if (user.type === 'usuario') {
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
      ORDER BY i.data_inscricao DESC
      `,
        [id_usuario]
      );

      return res.json({ success: true, data: rows });
    }

    // Time -> seletivas criadas pelo time
    if (user.type === 'time') {
      const id_time = user.id;

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
        WHERE s.id_time = ?
        ORDER BY s.data_postagem DESC`,
        [id_time]
      );

      return res.json({ success: true, data: rows });
    }

    return res.status(403).json({
      success: false,
      message: 'Tipo de usuário inválido para esta operação',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Lista os jogadores inscritos em uma seletiva específica,
 * garantindo que apenas o TIME dono da seletiva consiga ver.
 */
export const listarInscritosSeletiva = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // id da seletiva

    if (!user || user.type !== 'time') {
      return res.status(403).json({
        success: false,
        message: 'Apenas times podem ver os inscritos de uma seletiva',
      });
    }

    const id_time = user.id;
    const [rows] = await pool.query(
      `SELECT
        i.id_inscricao,
        i.data_inscricao,
        u.id_usuario,
        u.nm_usuario,
        u.email_usuario,
        u.tel_usuario,       -- ⬅️ AQUI (ESTAVA FALTANDO)
        u.img_usuario        -- opcional, mas já deixei pra você
      FROM tb_inscricao_seletiva i
      INNER JOIN tb_seletiva s ON i.id_seletiva = s.id_seletiva
      INNER JOIN tb_usuario u ON i.id_usuario = u.id_usuario
      WHERE i.id_seletiva = ?
        AND s.id_time = ?
      ORDER BY i.data_inscricao DESC`,
      [id, id_time]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};
