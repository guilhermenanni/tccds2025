<?php
// Arquivo: verificar_curtida_time.php
session_start();
include('conex.php');

if (!isset($_SESSION['id'])) {
    echo json_encode(['curtiu' => false]);
    exit;
}

if (isset($_GET['id_postagem'])) {
    $id_postagem = $_GET['id_postagem'];
    $id_time = $_SESSION['id'];
    
    $check = $conex->prepare("SELECT * FROM tb_curtida WHERE id_postagem = ? AND id_time = ?");
    $check->bind_param("ii", $id_postagem, $id_time);
    $check->execute();
    $result = $check->get_result();
    
    echo json_encode(['curtiu' => $result->num_rows > 0]);
} else {
    echo json_encode(['curtiu' => false]);
}
?>