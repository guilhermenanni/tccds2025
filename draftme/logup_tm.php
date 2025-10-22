<?php
session_start();
include('conex.php'); 

$msg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['nome_time'], $_POST['email_time'], $_POST['senha_time'], $_POST['categoria_time'], $_POST['esporte_time'], $_POST['localizacao_time'])) {
        $nome_time = mysqli_real_escape_string($conex, $_POST['nome_time']);
        $email_time = mysqli_real_escape_string($conex, $_POST['email_time']);
        $senha_time = password_hash($_POST['senha_time'], PASSWORD_DEFAULT);
        $categoria_time = mysqli_real_escape_string($conex, $_POST['categoria_time']);
        $esporte_time = mysqli_real_escape_string($conex, $_POST['esporte_time']);
        $localizacao_time = mysqli_real_escape_string($conex, $_POST['localizacao_time']);
        $time_cnpj = isset($_POST['time_cnpj']) ? mysqli_real_escape_string($conex, $_POST['time_cnpj']) : null;

        // Verificar se o usuário está logado
        if (!isset($_SESSION['id_usuario'])) {
            $msg = "<p style='color:red;'>É necessário estar logado para cadastrar um time.</p>";
        } else {
            $id_usuario = $_SESSION['id_usuario'];

            // Verificar se o email já está cadastrado
            $query_verifica = "SELECT * FROM tb_time WHERE email_time = '$email_time'";
            $result_verifica = $conex->query($query_verifica);

            if ($result_verifica->num_rows > 0) {
                $msg = "<p style='color:red;'>E-mail já cadastrado para outro time.</p>";
            } else {
                $sql = "INSERT INTO tb_time (nm_time, email_time, senha_time, time_cnpj, categoria_time, esporte_time, localizacao_time, id_usuario)
                        VALUES ('$nome_time', '$email_time', '$senha_time', " . ($time_cnpj ? "'$time_cnpj'" : "NULL") . ", '$categoria_time', '$esporte_time', '$localizacao_time', '$id_usuario')";

                if ($conex->query($sql) === TRUE) {
                    $msg = "<p style='color:green;'>Time cadastrado com sucesso!</p>";
                } else {
                    $msg = "<p style='color:red;'>Erro ao cadastrar: " . $conex->error . "</p>";
                }
            }
        }

        $conex->close();
    }
}
?>



<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastrar</title>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="shortcut icon" href="1.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/style.css">

    <style>
.wrapper {
    position: relative;
    width: 430px;
    max-height: 80vh;
    background-color: var(--white-color);
    border-radius: 15px;
    padding: 120px 32px 64px;
    border: 1px solid var(--primary-color);
    box-shadow: 0 8px 15px var(--shadow-color);
    overflow-y: auto;
    transition: var(--transition-3s);
}
    </style>
</head>
<body>

    <div class="wrapper">
        <div class="form-header">
            <div class="titles">
                <div class="title-login">Cadastrar</div>
            </div>
        </div>

        <?= $msg ?>

        <form method="POST" class="login-form" autocomplete="off">
            <div class="input-box">
                <input type="text" name="nome_time" class="input-field" required>
                <label class="label">Nome do Time</label>
                <i class='bx bx-group icon'></i>
            </div>

            <div class="input-box">
                <input type="email" name="email_time" class="input-field" required>
                <label class="label">Email</label>
                <i class='bx bx-envelope icon'></i>
            </div>

            <div class="input-box">
                <input type="password" name="senha_time" class="input-field" required>
                <label class="label">Senha</label>
                <i class='bx bx-lock-alt icon'></i>
            </div>

            <div class="input-box">
                <input type="text" name="time_cnpj" class="input-field" maxlength="14">
                <label class="label">CNPJ (opcional)</label>
                <i class='bx bx-id-card icon'></i>
            </div>

            <div class="input-box">
                <input type="text" name="categoria_time" class="input-field" required>
                <label class="label">Categoria</label>
                <i class='bx bx-category icon'></i>
            </div>

            <div class="input-box">
                <input type="text" name="esporte_time" class="input-field" required>
                <label class="label">Esporte</label>
                <i class='bx bx-football icon'></i>
            </div>

            <div class="input-box">
                <input type="text" name="localizacao_time" class="input-field" required>
                <label class="label">Localização</label>
                <i class='bx bx-map icon'></i>
            </div>

            <div class="input-box">
                <button type="submit" class="btn-submit">Cadastrar <i class='bx bx-log-in'></i></button>
            </div>

            <div class="switch-form">
                <span>Já tem um time? <a href="login_tm.php">Entrar</a></span>
            </div>
            <br>
        </form>
    </div>

</body>
</html>
