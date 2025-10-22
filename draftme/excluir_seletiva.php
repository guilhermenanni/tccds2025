<?php
session_start();
if (!isset($_SESSION['id'])) {
    header("Location: login.php");
    exit;
}

include('conex.php');
$id_time = $_SESSION['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id_seletiva'])) {
    $id_seletiva = intval($_POST['id_seletiva']);
    
    // Verificar se a seletiva pertence ao time logado
    $sql_verificar = "SELECT id_time FROM tb_seletiva WHERE id_seletiva = $id_seletiva";
    $result_verificar = $conex->query($sql_verificar);
    
    if ($result_verificar->num_rows > 0) {
        $seletiva = $result_verificar->fetch_assoc();
        
        if ($seletiva['id_time'] == $id_time) {
            // Primeiro, excluir as inscrições relacionadas à seletiva
            $sql_excluir_inscricoes = "DELETE FROM tb_inscricao_seletiva WHERE id_seletiva = $id_seletiva";
            $conex->query($sql_excluir_inscricoes);
            
            // Agora excluir a seletiva
            $sql_excluir_seletiva = "DELETE FROM tb_seletiva WHERE id_seletiva = $id_seletiva";
            
            if ($conex->query($sql_excluir_seletiva)) {
                $_SESSION['mensagem'] = "Seletiva excluída com sucesso!";
                $_SESSION['tipo_mensagem'] = "success";
            } else {
                $_SESSION['mensagem'] = "Erro ao excluir seletiva: " . $conex->error;
                $_SESSION['tipo_mensagem'] = "error";
            }
        } else {
            $_SESSION['mensagem'] = "Você não tem permissão para excluir esta seletiva.";
            $_SESSION['tipo_mensagem'] = "error";
        }
    } else {
        $_SESSION['mensagem'] = "Seletiva não encontrada.";
        $_SESSION['tipo_mensagem'] = "error";
    }
    
    // Redirecionar de volta para a página anterior
    header("Location: " . $_SERVER['HTTP_REFERER']);
    exit;
} else {
    $_SESSION['mensagem'] = "Requisição inválida.";
    $_SESSION['tipo_mensagem'] = "error";
    header("Location: home_tm.php");
    exit;
}
?>