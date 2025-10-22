<?php
// Arquivo: curtir_postagem_usuario.php (CORRIGIDO)
session_start();
include('conex.php');

// VERIFICAÇÃO CORRIGIDA
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuário não autenticado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_postagem = intval($_POST['id_postagem']);
    $id_usuario = $_SESSION['id'];
    
    // Verificar se a postagem existe
    $check_post = $conex->prepare("SELECT id_postagem FROM tb_postagem WHERE id_postagem = ?");
    $check_post->bind_param("i", $id_postagem);
    $check_post->execute();
    $result_post = $check_post->get_result();
    
    if ($result_post->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Postagem não encontrada']);
        exit;
    }
    
    // Verificar se já curtiu
    $check = $conex->prepare("SELECT id_curtida FROM tb_curtida WHERE id_postagem = ? AND id_usuario = ?");
    $check->bind_param("ii", $id_postagem, $id_usuario);
    $check->execute();
    $result = $check->get_result();
    
    if ($result->num_rows > 0) {
        // Se já curtiu, remove a curtida
        $stmt = $conex->prepare("DELETE FROM tb_curtida WHERE id_postagem = ? AND id_usuario = ?");
        $stmt->bind_param("ii", $id_postagem, $id_usuario);
        $acao = 'descurtir';
    } else {
        // Se não curtiu, adiciona a curtida
        $stmt = $conex->prepare("INSERT INTO tb_curtida (id_postagem, id_usuario) VALUES (?, ?)");
        $stmt->bind_param("ii", $id_postagem, $id_usuario);
        $acao = 'curtir';
    }
    
    if ($stmt->execute()) {
        // Retorna a nova contagem de curtidas
        $count = $conex->prepare("SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = ?");
        $count->bind_param("i", $id_postagem);
        $count->execute();
        $result_count = $count->get_result();
        $data = $result_count->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'action' => $acao,
            'curtidas' => $data['total']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Erro ao processar curtida: ' . $conex->error]);
    }
} else {
    header("Location: home_us.php");
    exit;
}
?>