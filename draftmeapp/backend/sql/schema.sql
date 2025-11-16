CREATE DATABASE IF NOT EXISTS db_draftme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_draftme;

CREATE TABLE IF NOT EXISTS tb_usuario (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nm_usuario VARCHAR(100) NOT NULL,
  email_usuario VARCHAR(100) UNIQUE NOT NULL,
  senha_usuario VARCHAR(255) NOT NULL,
  cpf_usuario VARCHAR(11) UNIQUE NOT NULL,
  dt_nasc_usuario DATE NOT NULL,
  tel_usuario VARCHAR(11),
  img_usuario VARCHAR(255),
  sobre TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_time (
  id_time INT PRIMARY KEY AUTO_INCREMENT,
  nm_time VARCHAR(100) NOT NULL,
  email_time VARCHAR(100) UNIQUE NOT NULL,
  senha_time VARCHAR(255) NOT NULL,
  time_cnpj VARCHAR(14) UNIQUE NOT NULL,
  categoria_time VARCHAR(50),
  esporte_time VARCHAR(50) DEFAULT 'futebol',
  sobre_time TEXT,
  img_time VARCHAR(255),
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_postagem (
  id_postagem INT PRIMARY KEY AUTO_INCREMENT,
  texto_postagem TEXT NOT NULL,
  img_postagem VARCHAR(255),
  categoria VARCHAR(50),
  tag VARCHAR(100),
  id_usuario INT,
  id_time INT,
  data_postagem DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_time) REFERENCES tb_time(id_time) ON DELETE CASCADE,
  INDEX idx_categoria (categoria),
  INDEX idx_data (data_postagem)
);

CREATE TABLE IF NOT EXISTS tb_curtida (
  id_curtida INT PRIMARY KEY AUTO_INCREMENT,
  id_postagem INT NOT NULL,
  id_usuario INT,
  id_time INT,
  data_curtida DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_postagem) REFERENCES tb_postagem(id_postagem) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_time) REFERENCES tb_time(id_time) ON DELETE CASCADE,
  UNIQUE KEY unique_like (id_postagem, id_usuario, id_time),
  INDEX idx_postagem (id_postagem)
);

CREATE TABLE IF NOT EXISTS tb_comentario (
  id_comentario INT PRIMARY KEY AUTO_INCREMENT,
  id_postagem INT NOT NULL,
  texto_comentario TEXT NOT NULL,
  id_usuario INT,
  id_time INT,
  data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_postagem) REFERENCES tb_postagem(id_postagem) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_time) REFERENCES tb_time(id_time) ON DELETE CASCADE,
  INDEX idx_postagem (id_postagem),
  INDEX idx_data (data_comentario)
);

CREATE TABLE IF NOT EXISTS tb_seletiva (
  id_seletiva INT PRIMARY KEY AUTO_INCREMENT,
  id_time INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  sobre TEXT,
  localizacao VARCHAR(200),
  cidade VARCHAR(100),
  data_seletiva DATE NOT NULL,
  hora TIME NOT NULL,
  categoria VARCHAR(50),
  subcategoria VARCHAR(50),
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_time) REFERENCES tb_time(id_time) ON DELETE CASCADE,
  INDEX idx_time (id_time),
  INDEX idx_cidade (cidade),
  INDEX idx_categoria (categoria)
);

CREATE TABLE IF NOT EXISTS tb_inscricao_seletiva (
  id_inscricao INT PRIMARY KEY AUTO_INCREMENT,
  id_seletiva INT NOT NULL,
  id_usuario INT NOT NULL,
  data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pendente', 'confirmada', 'rejeitada') DEFAULT 'pendente',
  UNIQUE KEY unique_inscricao (id_seletiva, id_usuario),
  FOREIGN KEY (id_seletiva) REFERENCES tb_seletiva(id_seletiva) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
  INDEX idx_seletiva (id_seletiva),
  INDEX idx_usuario (id_usuario),
  INDEX idx_status (status)
);
