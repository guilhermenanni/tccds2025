// backend/src/controllers/usuarioController.js

import { createPool } from '../config/db.js';

const pool = createPool();

/**
 * GET /usuarios/usuario/:id
 * Retorna os dados do usuário (perfil)
 */
export const obterPerfilUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
        SELECT
          id_usuario,
          nm_usuario,
          email_usuario,
          tel_usuario,
          img_usuario,
          sobre
        FROM tb_usuario
        WHERE id_usuario = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('Erro interno ao obter perfil do usuário:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao obter perfil do usuário',
    });
  }
};

/**
 * PUT /usuarios/usuario/:id
 * Atualiza os dados do usuário (nome, telefone, imagem, sobre)
 * Requer authMiddleware antes da rota para garantir que está logado.
 */
export const atualizarPerfilUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nm_usuario,
      tel_usuario,
      img_usuario,
      sobre,
    } = req.body;

    // Atualiza apenas os campos que fazem sentido para o perfil
    await pool.query(
      `
        UPDATE tb_usuario
        SET
          nm_usuario = COALESCE(?, nm_usuario),
          tel_usuario = ?,
          img_usuario = ?,
          sobre = ?
        WHERE id_usuario = ?
      `,
      [
        nm_usuario ?? null,
        tel_usuario ?? null,
        img_usuario ?? null,
        sobre ?? null,
        id,
      ]
    );

    // Busca o registro atualizado para retornar
    const [rows] = await pool.query(
      `
        SELECT
          id_usuario,
          nm_usuario,
          email_usuario,
          tel_usuario,
          img_usuario,
          sobre
        FROM tb_usuario
        WHERE id_usuario = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado após atualização',
      });
    }

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: rows[0],
    });
  } catch (err) {
    console.error('Erro interno ao atualizar perfil do usuário:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar perfil do usuário',
    });
  }
};

/**
 * GET /usuarios/usuario/:id/postagens
 * Lista as postagens feitas por um usuário específico
 */
export const listarPostagensUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
        SELECT
          p.id_postagem,
          p.texto_postagem,
          p.img_postagem,
          p.categoria,
          p.tag,
          p.data_postagem
        FROM tb_postagem p
        WHERE p.id_usuario = ?
        ORDER BY p.data_postagem DESC
      `,
      [id]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('Erro interno ao listar postagens do usuário:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao listar postagens do usuário',
    });
  }
};
