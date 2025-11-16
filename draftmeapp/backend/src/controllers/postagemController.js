import { createPool } from '../config/db.js';

const pool = createPool();

// 2. POSTAGENS

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
        (SELECT COUNT(*) FROM tb_curtida c WHERE c.id_postagem = p.id_postagem) AS curtidas_count,
        (SELECT COUNT(*) FROM tb_comentario c WHERE c.id_postagem = p.id_postagem) AS comentarios_count
      FROM tb_postagem p
      LEFT JOIN tb_usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN tb_time t ON p.id_time = t.id_time
      ORDER BY p.data_postagem DESC`
    );

    const data = rows.map((row) => ({
      id_postagem: row.id_postagem,
      texto_postagem: row.texto_postagem,
      img_postagem: row.img_postagem,
      categoria: row.categoria,
      tag: row.tag,
      autor: row.nm_usuario || row.nm_time,
      avatar: row.img_usuario || row.img_time,
      tipo_autor: row.nm_usuario ? 'usuario' : 'time',
      curtidas_count: row.curtidas_count,
      comentarios_count: row.comentarios_count,
      data_postagem: row.data_postagem,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const criarPostagem = async (req, res, next) => {
  try {
    const { texto_postagem, categoria, tag, img_postagem } = req.body;
    const { id, type } = req.user;

    let id_usuario = null;
    let id_time = null;

    if (type === 'usuario') id_usuario = id;
    if (type === 'time') id_time = id;

    const [result] = await pool.query(
      `INSERT INTO tb_postagem 
      (texto_postagem, img_postagem, categoria, tag, id_usuario, id_time)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [texto_postagem, img_postagem || null, categoria || null, tag || null, id_usuario, id_time]
    );

    const [rows] = await pool.query(
      'SELECT * FROM tb_postagem WHERE id_postagem = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: rows[0],
      message: 'Postagem criada com sucesso',
    });
  } catch (err) {
    next(err);
  }
};

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
       WHERE id_postagem = ? 
         AND (id_usuario = ? OR id_time = ?)`,
      [id, id_usuario, id_time]
    );

    res.json({ success: true, message: 'Curtida removida' });
  } catch (err) {
    next(err);
  }
};

export const deletarPostagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await pool.query(
      'SELECT id_usuario, id_time FROM tb_postagem WHERE id_postagem = ?',
      [id]
    );

    const post = rows[0];
    if (!post) {
      return res.status(404).json({ success: false, message: 'Postagem não encontrada' });
    }

    if (
      (user.type === 'usuario' && post.id_usuario !== user.id) &&
      (user.type === 'time' && post.id_time !== user.id)
    ) {
      return res.status(403).json({ success: false, message: 'Sem permissão para deletar esta postagem' });
    }

    await pool.query('DELETE FROM tb_postagem WHERE id_postagem = ?', [id]);

    res.json({ success: true, message: 'Postagem deletada com sucesso' });
  } catch (err) {
    next(err);
  }
};
