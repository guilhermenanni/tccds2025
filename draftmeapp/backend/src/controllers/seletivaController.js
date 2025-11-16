import { createPool } from '../config/db.js';

const pool = createPool();

// 4. SELETIVAS

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
      ORDER BY s.data_seletiva ASC, s.hora ASC`
    );

    const data = rows.map((row) => ({
      id_seletiva: row.id_seletiva,
      titulo: row.titulo,
      sobre: row.sobre,
      localizacao: row.localizacao,
      cidade: row.cidade,
      data_seletiva: row.data_seletiva,
      hora: row.hora,
      categoria: row.categoria,
      subcategoria: row.subcategoria,
      time: {
        id_time: row.id_time,
        nm_time: row.nm_time,
        img_time: row.img_time,
      },
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const listarSeletivasPorCategoria = async (req, res, next) => {
  try {
    const { categoria } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        s.*,
        t.nm_time,
        t.img_time
      FROM tb_seletiva s
      INNER JOIN tb_time t ON s.id_time = t.id_time
      WHERE s.categoria = ?
      ORDER BY s.data_seletiva ASC, s.hora ASC`,
      [categoria]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const listarSeletivasPorCidade = async (req, res, next) => {
  try {
    const { cidade } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        s.*,
        t.nm_time,
        t.img_time
      FROM tb_seletiva s
      INNER JOIN tb_time t ON s.id_time = t.id_time
      WHERE s.cidade = ?
      ORDER BY s.data_seletiva ASC, s.hora ASC`,
      [cidade]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const criarSeletiva = async (req, res, next) => {
  try {
    const { id, type } = req.user;
    if (type !== 'time') {
      return res.status(403).json({ success: false, message: 'Apenas times podem criar seletivas' });
    }

    const {
      titulo,
      sobre,
      localizacao,
      cidade,
      data_seletiva,
      hora,
      categoria,
      subcategoria,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO tb_seletiva 
      (id_time, titulo, sobre, localizacao, cidade, data_seletiva, hora, categoria, subcategoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, titulo, sobre, localizacao, cidade, data_seletiva, hora, categoria, subcategoria]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tb_seletiva WHERE id_seletiva = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: rows[0],
      message: 'Seletiva criada com sucesso',
    });
  } catch (err) {
    next(err);
  }
};

export const inscreverSeletiva = async (req, res, next) => {
  try {
    const { id } = req.params; // id_seletiva
    const { id: idUsuario, type } = req.user;

    if (type !== 'usuario') {
      return res.status(403).json({ success: false, message: 'Apenas jogadores podem se inscrever em seletivas' });
    }

    await pool.query(
      `INSERT INTO tb_inscricao_seletiva (id_seletiva, id_usuario)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data_inscricao = CURRENT_TIMESTAMP`,
      [id, idUsuario]
    );

    res.json({ success: true, message: 'Inscrição realizada com sucesso' });
  } catch (err) {
    next(err);
  }
};

export const listarInscricoesUsuario = async (req, res, next) => {
  try {
    const { id_usuario } = req.params;
    const { id, type } = req.user;

    if (type !== 'usuario' || Number(id_usuario) !== id) {
      return res.status(403).json({ success: false, message: 'Sem permissão para visualizar estas inscrições' });
    }

    const [rows] = await pool.query(
      `SELECT 
        i.id_inscricao,
        i.status,
        i.data_inscricao,
        s.id_seletiva,
        s.titulo,
        s.cidade,
        s.data_seletiva,
        s.hora,
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
