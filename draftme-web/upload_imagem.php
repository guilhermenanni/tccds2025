<?php
session_start();
include('conex.php');

if (!isset($_SESSION['id'])) {
    header("Location: login.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['imagem'])) {
    $id_time = $_SESSION['id'];
    $imagem = $_FILES['imagem'];

    // Verifica erros
    if ($imagem['error'] === UPLOAD_ERR_OK) {
        $extensao = pathinfo($imagem['name'], PATHINFO_EXTENSION);
        $nome_arquivo = uniqid("time_", true) . "." . strtolower($extensao);
        $caminho_destino = "uploads/" . $nome_arquivo;

        // Cria a pasta se não existir
        if (!is_dir("uploads")) {
            mkdir("uploads", 0755, true);
        }

        // Move o arquivo enviado
        if (move_uploaded_file($imagem['tmp_name'], $caminho_destino)) {
            // Atualiza no banco de dados
            $stmt = $conex->prepare("UPDATE tb_time SET img_time = ? WHERE id_time = ?");
            $stmt->bind_param("si", $nome_arquivo, $id_time);
            $stmt->execute();

            header("Location: home_tm.php");
            exit;
        } else {
            echo "Erro ao mover o arquivo.";
        }
    } else {
        echo "Erro no upload: " . $imagem['error'];
    }
} else {
    echo "Requisição inválida.";
}
?>
