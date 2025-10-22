<?php
session_start();
include('conex.php'); 

$erro_login = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['email']) && isset($_POST['senha'])) {
        $email = $conex->real_escape_string($_POST['email']);
        $senha = $_POST['senha'];

        $sql_code = "SELECT * FROM tb_time WHERE email_time = '$email'"; 
        $sql_query = $conex->query($sql_code) or die("Falha na execução do código SQL: " . $conex->error);

        if ($sql_query->num_rows > 0) {
            $usuario = $sql_query->fetch_assoc();

            if (isset($usuario['senha_time']) && password_verify($senha, $usuario['senha_time'])) {
                
                session_regenerate_id(true); 


                $_SESSION['id'] = $usuario['id_time'];
                $_SESSION['nome'] = $usuario['nm_time'];
                $_SESSION['sobre'] = $usuario['sobre_time'];
                $_SESSION['email'] = $usuario['email_time'];
                $_SESSION['categoria'] = $usuario['categoria_time'];
                $_SESSION['esporte'] = $usuario['esporte_time'];
                $_SESSION['localizacao'] = $usuario['localizacao_time'];
                $_SESSION['cnpj'] = $usuario['time_cnpj'];
                $_SESSION['id_usuario'] = $usuario['id_usuario'];
                $_SESSION['ultimo_acesso'] = time(); 

                header("Location: home_tm.php");
                exit;
            } else {
                $erro_login = "Senha incorreta.";
            }
        } else {
            $erro_login = "Usuário não encontrado.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - DraftMe</title>
    <link rel="shortcut icon" href="1.ico" type="image/x-icon">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="wrapper">
        <div class="form-header">
            <div class="titles">
                <div class="title-login">Login</div>
            </div>
        </div>

        <?php if (!empty($erro_login)): ?>
            <p style="color:red; text-align:center;"><?php echo $erro_login; ?></p>
        <?php endif; ?>

        <form action="" method="POST" class="login-form" autocomplete="off">
            <div class="input-box">
                <input type="text" class="input-field" name="email" id="log-email" required>
                <label for="log-email" class="label">Email</label>
                <i class='bx bx-envelope icon'></i>
            </div>

            <div class="input-box">
                <input type="password" class="input-field" name="senha" id="log-pass" required>
                <label for="log-pass" class="label">Senha</label>

            </div>

            <div class="form-cols">
                <div class="col-1"></div>
                <div class="col-2">
                    <a href="emailpost.html">Esqueceu sua senha?</a>
                </div>
            </div>

            <div class="input-box">
                <button type="submit" class="btn-submit" id="SignInBtn">Entrar <i class='bx bx-log-in'></i></button>
            </div>

            <div class="switch-form">
                <span>Não tem uma conta ainda? <a href="logup_tm.php">Cadastrar</a></span>
            </div>
        </form>
    </div>
        <script src="js/script.js"></script>
</body>
</html>
