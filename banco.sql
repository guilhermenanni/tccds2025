CREATE DATABASE IF NOT EXISTS db_draftme;
USE db_draftme;

#drop database db_draftme;

-- criação da tabela de times
CREATE TABLE tb_time (
    id_time int auto_increment primary key,
    nm_time varchar(90) not null,
    email_time varchar(100) not null,
    time_cnpj varchar(14), 
    categoria_time varchar(20) not null,
    senha_time varchar(300),
    esporte_time varchar(90),
    sobre_time longtext,
    localizacao_time varchar(100),
    img_time VARCHAR(255)
);
ALTER TABLE tb_time DROP COLUMN localizacao_time;

-- criação da tabela de usuários
CREATE TABLE tb_usuario (
    id_usuario int auto_increment primary key,
    nm_usuario varchar(90) not null,
    senha_usuario varchar(90) not null,
    cpf_usuario varchar(11) not null,
    email_usuario varchar(100) not null,
    dt_nasc_usuario date not null,
    tel_usuario varchar(12),
    id_time int, 
    foreign key (id_time) references tb_time(id_time)
);
ALTER TABLE tb_usuario ADD COLUMN img_usuario VARCHAR(255) DEFAULT 'default.png';
ALTER TABLE tb_usuario ADD COLUMN sobre longtext;



-- criação da tabela de postagens (MODIFICADA para aceitar tanto usuários quanto times)
CREATE TABLE tb_postagem (
    id_postagem INT AUTO_INCREMENT PRIMARY KEY,
    texto_postagem VARCHAR(255),
    img_postagem VARCHAR(255),
    categoria VARCHAR(20),
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tag VARCHAR(40),
    id_usuario INT NULL,
    id_time INT NULL,
    FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_time) REFERENCES tb_time(id_time) ON DELETE CASCADE,
    -- Garante que apenas um dos dois (usuário ou time) está preenchido
    CONSTRAINT chk_postagem_entidade CHECK (
        (id_usuario IS NOT NULL AND id_time IS NULL) OR 
        (id_usuario IS NULL AND id_time IS NOT NULL)
    )
);

-- Tabela para recuperação de senha
CREATE TABLE tb_recuperacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    expiracao DATETIME NOT NULL
);

-- Tabela para comentários
CREATE TABLE tb_comentario (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_postagem INT NOT NULL,
    id_time INT NULL,
    id_usuario INT NULL,
    texto_comentario TEXT NOT NULL,
    data_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_postagem) REFERENCES tb_postagem(id_postagem) ON DELETE CASCADE,
    FOREIGN KEY (id_time) REFERENCES tb_time(id_time) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
    -- Garante que apenas um dos dois (usuário ou time) está preenchido
    CONSTRAINT chk_comentario_entidade CHECK (
        (id_usuario IS NOT NULL AND id_time IS NULL) OR 
        (id_usuario IS NULL AND id_time IS NOT NULL)
    )
);

-- Tabela para seletivas
CREATE TABLE tb_seletiva (
    id_seletiva INT AUTO_INCREMENT PRIMARY KEY,
    id_time INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    data_seletiva DATE NOT NULL,
    hora TIME NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(50) NOT NULL,
    sobre TEXT NOT NULL,
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_time) REFERENCES tb_time(id_time)
);
ALTER TABLE tb_seletiva ADD COLUMN cidade VARCHAR(100) NOT NULL;

-- Tabela para inscrições nas seletivas
CREATE TABLE tb_inscricao_seletiva (
    id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    id_seletiva INT NOT NULL,
    id_usuario INT NOT NULL,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'confirmada', 'rejeitada') DEFAULT 'pendente',
    FOREIGN KEY (id_seletiva) REFERENCES tb_seletiva(id_seletiva),
    FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario)
);

-- Tabela para curtidas
CREATE TABLE tb_curtida (
    id_curtida INT AUTO_INCREMENT PRIMARY KEY,
    id_postagem INT NOT NULL,
    id_usuario INT NULL,
    id_time INT NULL,
    data_curtida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_postagem) REFERENCES tb_postagem(id_postagem) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_time) REFERENCES tb_time(id_time) ON DELETE CASCADE,
    -- Garante que apenas um dos dois (usuário ou time) está preenchido
    CONSTRAINT chk_curtida_entidade CHECK (
        (id_usuario IS NOT NULL AND id_time IS NULL) OR 
        (id_usuario IS NULL AND id_time IS NOT NULL)
    ),
    -- Impede curtidas duplicadas da mesma entidade na mesma postagem
    UNIQUE KEY curtida_unica (id_postagem, id_usuario, id_time)
);

-- Índices para melhor performance
CREATE INDEX idx_curtida_postagem ON tb_curtida (id_postagem);
CREATE INDEX idx_curtida_usuario ON tb_curtida (id_usuario);
CREATE INDEX idx_curtida_time ON tb_curtida (id_time);
CREATE INDEX idx_curtida_data ON tb_curtida (data_curtida);



select * from tb_usuario;
select * from tb_seletiva;
select * from tb_time;

SELECT 
    c.*,
    COALESCE(u.nm_usuario, t.nm_time) as entidade_nome,
    CASE WHEN c.id_usuario IS NOT NULL THEN 'usuário' ELSE 'time' END as tipo_entidade
FROM tb_curtida c
LEFT JOIN tb_usuario u ON c.id_usuario = u.id_usuario
LEFT JOIN tb_time t ON c.id_time = t.id_time
WHERE c.id_postagem = 1;
