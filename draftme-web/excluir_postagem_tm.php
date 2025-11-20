<?php
session_start();
if (!isset($_SESSION['id'])) {
    header("Location: login_tm.php");
    exit;
}

include('conex.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id_postagem'])) {
    $id_postagem = $_POST['id_postagem'];
    $id_usuario = $_SESSION['id'];
    
    // Verificar se a postagem pertence ao usuário
    $sql_verificar = "SELECT * FROM tb_postagem WHERE id_postagem = ? AND id_time = ?";
    $stmt_verificar = $conex->prepare($sql_verificar);
    $stmt_verificar->bind_param("ii", $id_postagem, $id_usuario);
    $stmt_verificar->execute();
    $result_verificar = $stmt_verificar->get_result();
    
    if ($result_verificar->num_rows > 0) {
        // A postagem pertence ao usuário, pode excluir
        
        // Primeiro, vamos buscar o nome da imagem se existir
        $postagem = $result_verificar->fetch_assoc();
        $imagem_postagem = $postagem['img_postagem'];
        
        // Iniciar transação para garantir que todas as operações sejam completadas
        $conex->begin_transaction();
        
        try {
            // 1. Excluir curtidas da postagem
            $sql_curtidas = "DELETE FROM tb_curtida WHERE id_postagem = ?";
            $stmt_curtidas = $conex->prepare($sql_curtidas);
            $stmt_curtidas->bind_param("i", $id_postagem);
            $stmt_curtidas->execute();
            
            // 2. Excluir comentários da postagem
            $sql_comentarios = "DELETE FROM tb_comentario WHERE id_postagem = ?";
            $stmt_comentarios = $conex->prepare($sql_comentarios);
            $stmt_comentarios->bind_param("i", $id_postagem);
            $stmt_comentarios->execute();
            
            // 3. Excluir a postagem
            $sql_postagem = "DELETE FROM tb_postagem WHERE id_postagem = ?";
            $stmt_postagem = $conex->prepare($sql_postagem);
            $stmt_postagem->bind_param("i", $id_postagem);
            $stmt_postagem->execute();
            
            // 4. Se existir uma imagem, excluir o arquivo físico
            if (!empty($imagem_postagem)) {
                $caminho_imagem = 'uploads/' . $imagem_postagem;
                if (file_exists($caminho_imagem)) {
                    unlink($caminho_imagem);
                }
            }
            
            // Confirmar todas as operações
            $conex->commit();
            
            $_SESSION['mensagem'] = "Postagem excluída com sucesso!";
            $_SESSION['tipo_mensagem'] = "success";
            
        } catch (Exception $e) {
            // Em caso de erro, reverter todas as operações
            $conex->rollback();
            
            $_SESSION['mensagem'] = "Erro ao excluir postagem: " . $e->getMessage();
            $_SESSION['tipo_mensagem'] = "error";
        }
        
    } else {
        // A postagem não pertence ao usuário
        $_SESSION['mensagem'] = "Você não tem permissão para excluir esta postagem.";
        $_SESSION['tipo_mensagem'] = "error";
    }
    
} else {
    $_SESSION['mensagem'] = "Requisição inválida.";
    $_SESSION['tipo_mensagem'] = "error";
}

// Redirecionar de volta para a home do usuário
header("Location: home_tm.php");
exit;
?>

