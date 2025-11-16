import { createPool } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

const pool = createPool();

// 1. AUTENTICAÇÃO

export const loginUsuario = async (req, res, next) => {
  try {
    const { email_usuario, senha_usuario } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM tb_usuario WHERE email_usuario = ?',
      [email_usuario]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
    }

    const isValid = await comparePassword(senha_usuario, user.senha_usuario);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
    }

    const token = generateToken({
      id: user.id_usuario,
      type: 'usuario',
      email: user.email_usuario,
    });

    res.json({
      success: true,
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nm_usuario: user.nm_usuario,
        email_usuario: user.email_usuario,
        img_usuario: user.img_usuario,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginTime = async (req, res, next) => {
  try {
    const { email_time, senha_time } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM tb_time WHERE email_time = ?',
      [email_time]
    );

    const time = rows[0];
    if (!time) {
      return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
    }

    const isValid = await comparePassword(senha_time, time.senha_time);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
    }

    const token = generateToken({
      id: time.id_time,
      type: 'time',
      email: time.email_time,
    });

    res.json({
      success: true,
      token,
      time: {
        id_time: time.id_time,
        nm_time: time.nm_time,
        email_time: time.email_time,
        img_time: time.img_time,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const registerUsuario = async (req, res, next) => {
  try {
    const { nm_usuario, email_usuario, senha_usuario, cpf_usuario, dt_nasc_usuario, tel_usuario } = req.body;

    const hashed = await hashPassword(senha_usuario);

    const [result] = await pool.query(
      `INSERT INTO tb_usuario 
      (nm_usuario, email_usuario, senha_usuario, cpf_usuario, dt_nasc_usuario, tel_usuario)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nm_usuario, email_usuario, hashed, cpf_usuario, dt_nasc_usuario, tel_usuario]
    );

    const id = result.insertId;

    const token = generateToken({
      id,
      type: 'usuario',
      email: email_usuario,
    });

    res.status(201).json({
      success: true,
      token,
      usuario: {
        id_usuario: id,
        nm_usuario,
        email_usuario,
      },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      err.status = 400;
      err.message = 'Email ou CPF já cadastrado';
    }
    next(err);
  }
};

export const registerTime = async (req, res, next) => {
  try {
    const { nm_time, email_time, senha_time, time_cnpj, categoria_time, esporte_time } = req.body;

    const hashed = await hashPassword(senha_time);

    const [result] = await pool.query(
      `INSERT INTO tb_time 
      (nm_time, email_time, senha_time, time_cnpj, categoria_time, esporte_time)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nm_time, email_time, hashed, time_cnpj, categoria_time, esporte_time]
    );

    const id = result.insertId;

    const token = generateToken({
      id,
      type: 'time',
      email: email_time,
    });

    res.status(201).json({
      success: true,
      token,
      time: {
        id_time: id,
        nm_time,
        email_time,
      },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      err.status = 400;
      err.message = 'Email ou CNPJ já cadastrado';
    }
    next(err);
  }
};
