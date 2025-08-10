const express = require('express');
const mysql2 = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_draftme'
});

//cadastro: 
app.post('/register', async (req, res) => {
    const { nome, senha, email, cpf, dtNasc, time } = req.body;

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    db.query('INSERT INTO tb_usuario (nm_usuario, senha_usuario, cpf_usuario, email_usuario, dt_nasc_usuario, id_time) VALUES (?, ?, ?, ?, ?, ?)'
        [nome, senha, cpf, email, dtNasc, time],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'usuario cadastrado com sucesso' });
            }
        );
});

//login: 
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.query('SELECT * FROM tb_usuarios WHERE email_usuario = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({error: err});
        if (results.length === 0) return res.status(401).json({ error: 'usuaio nao encontrado' });

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) return res.status(401).json({ error: 'senha incorreta' });

        const token = jwt.sign({id: usuario.id_usuario}, 'secreta', { expiresIn: '1h' });

        res.json({message: 'login bem sucedido', token });
    });
});

app.listen(3000, () => console.log('servidor rodando na porta 3000'));