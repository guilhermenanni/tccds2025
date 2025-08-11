const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Rota para registro de novos usuários
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário já existe
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (result.length > 0) {
      return res.status(400).json({ message: 'Usuário já existe!' });
    }

    // Criptografa a senha
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criptografar a senha', error: err });
      }

      // Salva o novo usuário no banco de dados
      const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Erro ao registrar o usuário', error: err });
        }
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
      });
    });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário existe
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (result.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    // Verifica se a senha está correta
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(400).json({ message: 'Senha incorreta' });
      }

      // Cria o token JWT
      const token = jwt.sign({ userId: result[0].id }, 'secreta-chave', { expiresIn: '1h' });

      res.status(200).json({ message: 'Login realizado com sucesso', token });
    });
  });
});

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token de autenticação necessário' });
  }

  jwt.verify(token, 'secreta-chave', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.userId = decoded.userId;
    next();
  });
};

app.post('/posts', authenticate, (req, res) => {
  const { text, image } = req.body;
  const userId = req.userId;

  const query = 'INSERT INTO posts (user_id, text, image) VALUES (?, ?, ?)';
  db.query(query, [userId, text, image], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao criar postagem', error: err });
    }
    res.status(201).json({ message: 'Postagem criada com sucesso', postId: result.insertId });
  });
});
