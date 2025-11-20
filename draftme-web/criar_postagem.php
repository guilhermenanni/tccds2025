<?php
session_start();
include('conex.php');

if (!isset($_SESSION['id'])) {
    echo "Time não autenticado.";
    exit;
}

$id_time = $_SESSION['id'];
$texto = $_POST['texto'] ?? '';
$categoria = $_POST['categoria'] ?? '';
$tag = $_POST['tag'] ?? '';
$img_nome = null;

// Verifica se imagem foi enviada
if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
    $img_nome = uniqid("post_", true) . "." . strtolower($ext);
    $destino = "uploads/" . $img_nome;

    if (!is_dir("uploads")) {
        mkdir("uploads", 0755, true);
    }

    move_uploaded_file($_FILES['imagem']['tmp_name'], $destino);
}

// Insere no banco
$stmt = $conex->prepare("INSERT INTO tb_postagem (texto_postagem, img_postagem, categoria, tag, id_time) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $texto, $img_nome, $categoria, $tag, $id_time);
$stmt->execute();

header("Location: home_tm.php");
exit;
?>
