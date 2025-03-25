create database db_draftame;
use db_draftame;

CREATE TABLE tb_time(
id_time INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
nm_time VARCHAR(90) NOT NULL,
time_cnpj VARCHAR(14) ,
categoria_time VARCHAR(20) NOT NULL,
esporte_time VARCHAR(90),
localizacao_time VARCHAR(100),
id_usuario INT NOT NULL,
FOREIGN KEY(id_usuario) REFERENCES tb_usuario(id_usuario)
);

CREATE TABLE tb_usuario(
id_usuario INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
nm_usuario VARCHAR(90) NOT NULL,
cpf_usuario VARCHAR(11) NOT NULL,
dt_nasc_usuario DATE NOT NULL,
localizacao_usuario VARCHAR(100) NOT NULL,
tel_usuario VARCHAR(12),
adm_time TINYINT(1), -- se for 0 ele nao é dono de um time, se for 1 ele é
id_time int, -- se ele tiver um no caso, por isso nao tem not null
FOREIGN KEY(id_time) REFERENCES tb_time(id_time)
);

-- ta errado, mas ta reperesentado assim pra facilitar o entendimento, pra realmente criar as tabelas do jeito certo voce tem que usar o:
/*
ALTER TABLE tb_time ADD COLUMN id_usuario INT NOT NULL;
ALTER TABLE tb_time ADD CONSTRAINT fk_time_usuario 
FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario);
*/

CREATE TABLE tb_postagem(
id_postagem INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
texto_postagem VARCHAR(255),
img_postagem VARCHAR(255),
categoria VARCHAR(20),
data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
tag VARCHAR(40),
id_usuario INT NOT NULL,
FOREIGN KEY(id_usuario) REFERENCES tb_usuario(id_usuario)
);

CREATE TABLE tb_resposta_postagem(
id_resposta int auto_increment primary key,
id_usuario int not null,
id_postagem int not null,
texto_resposta varchar(230), 
foreign key (id_usuario) references tb_usuario(id_usuario),
foreign key (id_postagem) references tb_postagem(id_postagem)
);

create table tb_chat(
id_chat int auto_increment primary key,
id_usuario int not null,
texto_mensagem varchar(400),
foreign key (id_usuario ) references tb_usuario(id_usuario)
);

/*

OBSERVAÇOES

o cnpj do time nao esta not null, tendo em vista que talves possamos ter times amadores
ain, mas guilherme, eu nao gostei de tal coisa, FODASSE, O GIT HUB TA AQUI, MUDA, SEU ARROMBADO!!!!!(essa é pra tu japa)
ta meio incompleto por que ainda ta faltando definir umas coisas, tipo, se vai ter char de texto, se as pessoas vao poder responder postagens e tals (sim, vai ter e eas pessoas podem)
se eu esquecer de tirar isso aqui até outubro vai pega malzao


*/
DROP DATABASE db_aplicativo;
