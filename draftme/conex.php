<?php

$hostname = "localhost";
$bancodedados = "db_draftme";
$usuario = "root";
$senha = "";


$conex = new mysqli($hostname, $usuario, $senha, $bancodedados);


if ($conex->connect_errno) {
    echo "Deu merda: (" . $conex->connect_errno . ") " . $conex->connect_error;
}
?>