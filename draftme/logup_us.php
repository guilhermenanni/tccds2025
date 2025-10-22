<?php
session_start();
include('conex.php'); 

$msg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['nome'], $_POST['email'], $_POST['senha'], $_POST['cpf'], $_POST['data_nascimento'], $_POST['telefone'])) {
        $nome = mysqli_real_escape_string($conex, $_POST['nome']);
        $email = mysqli_real_escape_string($conex, $_POST['email']);
        $cpf = mysqli_real_escape_string($conex, $_POST['cpf']);
        $data_nascimento = mysqli_real_escape_string($conex, $_POST['data_nascimento']);
        $telefone = mysqli_real_escape_string($conex, $_POST['telefone']);
        $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

    
        $query_verifica = "SELECT * FROM tb_usuario WHERE email_usuario = '$email'";
        $result_verifica = $conex->query($query_verifica);

        if ($result_verifica->num_rows > 0) {
            $msg = "<p style='color:red;'>E-mail já cadastrado.</p>";
        } else {
            // Inserir novo usuário no banco de dados
            $sql = "INSERT INTO tb_usuario (nm_usuario, email_usuario, cpf_usuario, dt_nasc_usuario, tel_usuario, senha_usuario, adm_time)
                    VALUES ('$nome', '$email', '$cpf', '$data_nascimento', '$telefone', '$senha', 0)";

            if ($conex->query($sql) === TRUE) {
                $msg = "<p style='color:green;'>Usuário cadastrado com sucesso!</p>";
            } else {
                $msg = "<p style='color:red;'>Erro ao cadastrar: " . $conex->error . "</p>";
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
    height: 500px;
    background-color: var(--white-color);
    border-radius: 15px;
    padding: 120px 32px 64px;
    border: 1px solid var(--primary-color);
    box-shadow: 0 8px 15px var(--shadow-color);
    transition: var(--transition-3s);
    overflow-y: auto;  /* Permite rolagem vertical */
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
                <input type="text" name="nome" class="input-field" required>
                <label class="label">Nome</label>
                <i class='bx bx-user icon'></i>
            </div>

            <div class="input-box">
                <input type="email" name="email" class="input-field" required>
                <label class="label">Email</label>
                <i class='bx bx-envelope icon'></i>
            </div>

            <div class="input-box">
                <input type="text" name="cpf" class="input-field" maxlength="11" required>
                <label class="label">CPF</label>
                <i class='bx bx-id-card icon'></i>
            </div>

            <div class="input-box">
                <input type="date" name="data_nascimento" class="input-field" required>
                <label class="label"></label>

            </div>

            <div class="input-box">
                <input type="tel" name="telefone" class="input-field" maxlength="15" required>
                <label class="label">Telefone</label>
                <i class='bx bx-phone icon'></i>
            </div>

            <div class="input-box">
                <input type="password" name="senha" class="input-field" required>
                <label class="label">Senha</label>
                <i class='bx bx-lock-alt icon'></i>
            </div>

            <div class="form-cols">
                <div class="col-1">
                    <input type="checkbox" id="agree" required>
                    <label for="agree"> Eu concordo com os <a href="termos.html">termos e condições</a></label>
                </div>
            </div>

            <div class="input-box">
                <button type="submit" class="btn-submit">Cadastrar <i class='bx bx-log-in'></i></button>
            </div>

            <div class="switch-form">
                <span>Já tem uma conta? <a href="login_us.php">Entrar</a></span>
            </div>
            <br>
        </form>
    </div>

</body>
</html>
