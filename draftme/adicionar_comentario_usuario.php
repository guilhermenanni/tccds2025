<?php
session_start();
include('conex.php');

if (!isset($_SESSION['id'])) {
    header("Location: login_us.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_usuario = $_SESSION['id'];
    $id_postagem = $_POST['id_postagem'];
    $texto_comentario = trim($_POST['texto_comentario']);
    
    if (!empty($texto_comentario)) {
        $stmt = $conex->prepare("INSERT INTO tb_comentario (id_postagem, id_usuario, texto_comentario) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $id_postagem, $id_usuario, $texto_comentario);
        
        if ($stmt->execute()) {
            header("Location: home_us.php");
            exit;
        } else {
            echo "Erro ao adicionar comentário: " . $conex->error;
        }
    } else {
        header("Location: home_us.php");
        exit;
    }
} else {
    header("Location: home_us.php");
    exit;
}
?>






