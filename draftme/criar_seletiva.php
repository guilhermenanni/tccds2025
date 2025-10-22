<?php
session_start();
include('conex.php');

if (!isset($_SESSION['id'])) {
    header("Location: login.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_time = $_SESSION['id'];
    $titulo = $_POST['titulo'];
    $localizacao = $_POST['localizacao'];
    $cidade = $_POST['cidade']; // NOVO CAMPO ADICIONADO
    $data_seletiva = $_POST['data_seletiva'];
    $hora = $_POST['hora'];
    $categoria = $_POST['categoria'];
    $subcategoria = $_POST['subcategoria'];
    $sobre = $_POST['sobre'];
    
    // Validações de data
    $hoje = date('Y-m-d');
    $fimProximoAno = date('Y-m-d', strtotime('+1 year', strtotime(date('Y-12-31'))));
    
    // Validar se a data não é vazia
    if (empty($data_seletiva)) {
        $_SESSION['mensagem'] = "Data da seletiva é obrigatória.";
        $_SESSION['tipo_mensagem'] = "error";
        header("Location: home_tm.php");
        exit;
    }
    
    // Validar se a data não é anterior ao dia atual
    if ($data_seletiva < $hoje) {
        $_SESSION['mensagem'] = " A data da seletiva não pode ser anterior ao dia atual.";
        $_SESSION['tipo_mensagem'] = "error";
        header("Location: home_tm.php");
        exit;
    }
    
    // Validar se a data não é após o fim do próximo ano
    if ($data_seletiva > $fimProximoAno) {
        $_SESSION['mensagem'] = " A data da seletiva não pode ser após 31 de dezembro do próximo ano.";
        $_SESSION['tipo_mensagem'] = "error";
        header("Location: home_tm.php");
        exit;
    }
    
    // Validação adicional: não permitir seletivas no passado considerando data e hora
    $dataHoraSeletiva = $data_seletiva . ' ' . $hora;
    $agora = date('Y-m-d H:i:s');
    
    if ($dataHoraSeletiva < $agora) {
        $_SESSION['mensagem'] = " A data e hora da seletiva não podem ser no passado.";
        $_SESSION['tipo_mensagem'] = "error";
        header("Location: home_tm.php");
        exit;
    }
    
    // Inserir no banco de dados (ATUALIZADO COM CIDADE)
    $stmt = $conex->prepare("INSERT INTO tb_seletiva (id_time, titulo, localizacao, cidade, data_seletiva, hora, categoria, subcategoria, sobre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssssss", $id_time, $titulo, $localizacao, $cidade, $data_seletiva, $hora, $categoria, $subcategoria, $sobre);
    
    if ($stmt->execute()) {
        $_SESSION['mensagem'] = "Seletiva criada com sucesso!";
        $_SESSION['tipo_mensagem'] = "success";
        header("Location: home_tm.php");
        exit;
    } else {
        $_SESSION['mensagem'] = "Erro ao criar seletiva: " . $conex->error;
        $_SESSION['tipo_mensagem'] = "error";
        header("Location: home_tm.php");
        exit;
    }
} else {
    header("Location: home_tm.php");
    exit;
}
?>