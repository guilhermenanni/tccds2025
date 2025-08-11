-- Banco de dados para rede social esportiva profissional
CREATE DATABASE rede_esportiva_pro;
USE rede_esportiva_pro;

-- Tabela de usuários (atletas e clubes)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('atleta', 'clube') NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    foto_perfil VARCHAR(255),
    banner_perfil VARCHAR(255),
    data_nascimento DATE,
    genero ENUM('masculino', 'feminino', 'outro'),
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    cnpj VARCHAR(18) UNIQUE,
    cidade VARCHAR(50),
    estado VARCHAR(2),
    pais VARCHAR(50),
    biografia TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP,
    verificado BOOLEAN DEFAULT FALSE,
    status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo'
);

-- Tabela de esportes
CREATE TABLE esportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    icone VARCHAR(50)
);

-- Tabela de especialidades (ligação entre usuários e esportes)
CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    esporte_id INT NOT NULL,
    posicao VARCHAR(50),
    nivel ENUM('iniciante', 'intermediario', 'avancado', 'profissional'),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (esporte_id) REFERENCES esportes(id)
);

-- Tabela de conquistas
CREATE TABLE conquistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_conquista DATE,
    tipo ENUM('trofeu', 'medalha', 'certificado', 'outro'),
    imagem VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de postagens
CREATE TABLE postagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conteudo TEXT,
    tipo ENUM('texto', 'imagem', 'video', 'link', 'evento') NOT NULL,
    midia VARCHAR(255),
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visibilidade ENUM('publico', 'conexoes', 'privado') DEFAULT 'publico',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de comentários
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postagem_id INT NOT NULL,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de reações
CREATE TABLE reacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postagem_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo ENUM('curtir', 'apoio', 'impressionante', 'insightful') DEFAULT 'curtir',
    data_reacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE KEY (postagem_id, usuario_id)
);

-- Tabela de conexões
CREATE TABLE conexoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conexao_id INT NOT NULL,
    status ENUM('pendente', 'aceito', 'recusado', 'bloqueado') DEFAULT 'pendente',
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resposta TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (conexao_id) REFERENCES usuarios(id),
    UNIQUE KEY (usuario_id, conexao_id)
);

-- Tabela de mensagens
CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
);

-- Tabela de notificações
CREATE TABLE notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('conexao', 'curtida', 'comentario', 'mensagem', 'evento') NOT NULL,
    remetente_id INT,
    postagem_id INT,
    conteudo TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data_notificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (postagem_id) REFERENCES postagens(id)
);

-- Tabela de eventos
CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    criador_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME,
    localizacao VARCHAR(255),
    esporte_id INT,
    tipo ENUM('treinamento', 'competicao', 'workshop', 'social') NOT NULL,
    visibilidade ENUM('publico', 'privado') DEFAULT 'publico',
    FOREIGN KEY (criador_id) REFERENCES usuarios(id),
    FOREIGN KEY (esporte_id) REFERENCES esportes(id)
);

-- Tabela de participantes de eventos
CREATE TABLE participantes_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    status ENUM('confirmado', 'pendente', 'recusado') DEFAULT 'pendente',
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE KEY (evento_id, usuario_id)
);

-- Inserir esportes básicos
INSERT INTO esportes (nome, icone) VALUES 
('Futebol', 'soccer-ball'),
('Basquete', 'basketball-ball'),
('Natação', 'swimmer'),
('Tênis', 'table-tennis'),
('Vôlei', 'volleyball-ball'),
('Atletismo', 'running'),
('Ginástica', 'dumbbell'),
('Esportes Aquáticos', 'water'),
('Artes Marciais', 'fist-raised'),
('Outros', 'question-circle');