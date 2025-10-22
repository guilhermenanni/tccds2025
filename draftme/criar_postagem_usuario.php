<?php
// Arquivo: criar_postagem_usuario.php (CORRIGIDO)
session_start();
include('conex.php');

// Headers para garantir que retorna JSON
header('Content-Type: application/json');

// Verificação de sessão
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuário não autenticado.']);
    exit;
}

$id_usuario = $_SESSION['id'];
$texto = isset($_POST['texto']) ? trim($_POST['texto']) : '';
$categoria = isset($_POST['categoria']) ? trim($_POST['categoria']) : '';
$tag = isset($_POST['tag']) ? trim($_POST['tag']) : '';
$img_nome = null;

// Validação básica
if (empty($texto) || empty($categoria)) {
    echo json_encode(['success' => false, 'error' => 'Texto e categoria são obrigatórios.']);
    exit;
}

// Verifica se imagem foi enviada
if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
    $ext = strtolower($ext);
    
    // Verifica se é uma extensão válida
    $extensoes_validas = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($ext, $extensoes_validas)) {
        echo json_encode(['success' => false, 'error' => 'Formato de imagem inválido. Use JPG, PNG ou GIF.']);
        exit;
    }
    
    $img_nome = uniqid("post_", true) . "." . $ext;
    $destino = "uploads/" . $img_nome;

    if (!is_dir("uploads")) {
        if (!mkdir("uploads", 0755, true)) {
            echo json_encode(['success' => false, 'error' => 'Erro ao criar diretório de uploads.']);
            exit;
        }
    }

    if (!move_uploaded_file($_FILES['imagem']['tmp_name'], $destino)) {
        echo json_encode(['success' => false, 'error' => 'Erro ao salvar imagem.']);
        exit;
    }
}

// Insere no banco
try {
    $stmt = $conex->prepare("INSERT INTO tb_postagem (texto_postagem, img_postagem, categoria, tag, id_usuario) VALUES (?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception('Erro no prepare: ' . $conex->error);
    }
    
    $stmt->bind_param("ssssi", $texto, $img_nome, $categoria, $tag, $id_usuario);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Postagem criada com sucesso!']);
    } else {
        throw new Exception('Erro no execute: ' . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erro no banco de dados: ' . $e->getMessage()]);
}

// Não redireciona se for AJAX
exit;
?>