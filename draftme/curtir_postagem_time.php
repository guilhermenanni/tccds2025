<?php
// Arquivo: curtir_postagem_time.php
session_start();
include('conex.php');

// Verificar se é um time logado
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'Time não autenticado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_postagem = intval($_POST['id_postagem']);
    $id_time = $_SESSION['id'];
    
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
    $check = $conex->prepare("SELECT id_curtida FROM tb_curtida WHERE id_postagem = ? AND id_time = ?");
    $check->bind_param("ii", $id_postagem, $id_time);
    $check->execute();
    $result = $check->get_result();
    
    if ($result->num_rows > 0) {
        // Se já curtiu, remove a curtida
        $stmt = $conex->prepare("DELETE FROM tb_curtida WHERE id_postagem = ? AND id_time = ?");
        $stmt->bind_param("ii", $id_postagem, $id_time);
        $acao = 'descurtir';
    } else {
        // Se não curtiu, adiciona a curtida
        $stmt = $conex->prepare("INSERT INTO tb_curtida (id_postagem, id_time) VALUES (?, ?)");
        $stmt->bind_param("ii", $id_postagem, $id_time);
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
    // Redireciona para a home do time
    header("Location: home_tm.php");
    exit;
}
?>