<?php
session_start();
include('conex.php');

if (!isset($_SESSION['id'])) {
    header("Location: login_us.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_usuario = $_SESSION['id'];
    $id_seletiva = $_POST['id_seletiva'];
    
    // Verificar se já está inscrito
    $check = $conex->prepare("SELECT * FROM tb_inscricao_seletiva WHERE id_seletiva = ? AND id_usuario = ?");
    $check->bind_param("ii", $id_seletiva, $id_usuario);
    $check->execute();
    $result = $check->get_result();
    
    if ($result->num_rows > 0) {
        header("Location: home_us.php?erro=Você já está inscrito nesta seletiva!");
        exit;
    }
    
    $stmt = $conex->prepare("INSERT INTO tb_inscricao_seletiva (id_seletiva, id_usuario) VALUES (?, ?)");
    $stmt->bind_param("ii", $id_seletiva, $id_usuario);
    
    if ($stmt->execute()) {
        header("Location: home_us.php?sucesso=Inscrição realizada com sucesso!");
        exit;
    } else {
        echo "Erro ao realizar inscrição: " . $conex->error;
    }
} else {
    header("Location: home_us.php");
    exit;
}
?>