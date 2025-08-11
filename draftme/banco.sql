-- criação do banco de dados
create database db_draftme;
use db_draftme;

#drop database db_draftme;

-- criação da tabela de times
create table tb_time (
    id_time int auto_increment primary key,
    nm_time varchar(90) not null,
	email_time varchar(100) not null,
    time_cnpj varchar(14), 
    categoria_time varchar(20) not null,
    senha_time varchar(300),
    esporte_time varchar(90),
	sobre_time longtext,
    localizacao_time varchar(100)
);


ALTER TABLE tb_time ADD COLUMN img_time VARCHAR(255);


-- criação da tabela de usuários
create table tb_usuario (
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

-- adicionando a fk do usuário na tabela de times
alter table tb_time add column id_usuario int not null;
alter table tb_time add constraint fk_time_usuario
    foreign key (id_usuario) references tb_usuario(id_usuario);

-- criação da tabela de postagens
CREATE TABLE tb_postagem (
    id_postagem INT AUTO_INCREMENT PRIMARY KEY,
    texto_postagem VARCHAR(255),
    img_postagem VARCHAR(255),
    categoria VARCHAR(20),
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tag VARCHAR(40),
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario)
);

ALTER TABLE tb_postagem
    DROP FOREIGN KEY tb_postagem_ibfk_1,
    DROP COLUMN id_usuario,
    ADD COLUMN id_time INT NOT NULL,
    ADD FOREIGN KEY (id_time) REFERENCES tb_time(id_time);


-- criação da tabela de respostas de postagens
create table tb_resposta_postagem (
    id_resposta int auto_increment primary key,
    id_usuario int not null,
    id_postagem int not null,
    texto_resposta varchar(230),
    foreign key (id_usuario) references tb_usuario(id_usuario),
    foreign key (id_postagem) references tb_postagem(id_postagem)
);

-- criação da tabela de chat
create table tb_chat (
    id_chat int auto_increment primary key,
    id_usuario int not null,
    texto_mensagem varchar(400),
    foreign key (id_usuario) references tb_usuario(id_usuario)
);

select * from tb_usuario;
select * from tb_time;

