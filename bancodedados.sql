
create database db_aplicativo;
use db_aplicativo;
 
create table tb_usuario_comum( 
id_usuario_comum int auto_increment primary key,
nm_usuario_comum varchar(90),
cpf_usuario_comum int(11),
dt_nasc_usuario_comum date,
localizacao_usuario_comum varchar(100),
tel_usuaio_comum int(12)
);

create table tb_usuario_time(
id_time int auto_increment primary key,
nm_time varchar(90),
time_cnpj int(11),
esporte_time varchar(45),
localizacao_time varchar (100),
id_usuario_comum int not null,
foreign key(id_usuario_comum) references tb_usuario_comum(id_usuario_comum)
);

create table tb_usuario_adm_time(
id_usuario_adm_time int auto_increment primary key,
id_usuario_comum int not null,
id_usuario_time int not null,
foreign key(id_usuario_comum) references tb_usuario_comum(id_usuario_comum),
foreign key(id_usuario_time) references tb_usuario_time(id_usuario_time)
);
