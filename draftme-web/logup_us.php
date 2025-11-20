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
        $sobre = isset($_POST['sobre']) ? mysqli_real_escape_string($conex, $_POST['sobre']) : null;

        $query_verifica = "SELECT * FROM tb_usuario WHERE email_usuario = '$email'";
        $result_verifica = $conex->query($query_verifica);

        if ($result_verifica->num_rows > 0) {
            $msg = "<p style='color:red;'>E-mail já cadastrado.</p>";
        } else {
            $sql = "INSERT INTO tb_usuario (nm_usuario, email_usuario, cpf_usuario, dt_nasc_usuario, tel_usuario, senha_usuario, sobre)
                    VALUES ('$nome', '$email', '$cpf', '$data_nascimento', '$telefone', '$senha', " . ($sobre ? "'$sobre'" : "NULL") . ")";

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
    height: 550px;
    background-color: var(--white-color);
    border-radius: 15px;
    padding: 120px 32px 64px;
    border: 1px solid var(--primary-color);
    box-shadow: 0 8px 15px var(--shadow-color);
    transition: var(--transition-3s);
    overflow-y: auto;
}
textarea.input-field {
    min-height: 80px;
    resize: vertical;
    padding-top: 15px;
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
                <input type="text" name="cpf" class="input-field" maxlength="11" 
                    pattern="\d{11}" inputmode="numeric" required 
                    title="Digite apenas números (11 dígitos)">
                <label class="label">CPF</label>
                <i class='bx bx-id-card icon'></i>
            </div>

            <div class="input-box">
                <input type="date" name="data_nascimento" class="input-field" id="data_nascimento" required>
                <label class="label"></label>
                <i class='bx bx-calendar icon'></i>
            </div>

            <!-- TELEFONE SEM LIMITE -->
            <div class="input-box">
                <input type="tel" name="telefone" class="input-field" inputmode="numeric" required>
                <label class="label"></label>
                <i class='bx bx-phone icon'></i>
            </div>

            <div class="input-box">
                <input type="password" name="senha" class="input-field" required>
                <label class="label">Senha</label>
            </div>

            <div class="input-box">
                <textarea name="sobre" class="input-field" placeholder=" "></textarea>
                <label class="label">Sobre você (Opcional)</label>
                <i class='bx bx-edit icon'></i>
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

    <script src="js/script.js"></script>

<script>
// CPF - permite apenas números
document.querySelector('input[name="cpf"]').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
});

// TELEFONE - permite números ilimitados, com máscara dinâmica se quiser
const telInput = document.querySelector('input[name="telefone"]');
telInput.addEventListener('input', function(e) {
    let v = this.value.replace(/\D/g, '');
    // Não corta mais o número
    if (v.length > 0) {
        if (v.length <= 2) {
            v = v.replace(/^(\d*)/, '($1');
        } else if (v.length <= 6) {
            v = v.replace(/^(\d{2})(\d*)/, '($1) $2');
        } else if (v.length <= 10) {
            v = v.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
        } else {
            v = v.replace(/^(\d{2})(\d{5})(\d{4})(.*)/, '($1) $2-$3 $4');
        }
    }
    this.value = v;
});

// Ajustar altura do textarea automaticamente
document.querySelector('textarea[name="sobre"]').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Limitar data de nascimento para até 30 anos atrás
const dataInput = document.getElementById('data_nascimento');
const hoje = new Date();
const maxDate = hoje.toISOString().split('T')[0];
const minDate = new Date();
minDate.setFullYear(minDate.getFullYear() - 30);
dataInput.max = maxDate;
dataInput.min = minDate.toISOString().split('T')[0];

// Mensagem personalizada se a data for inválida
dataInput.addEventListener('change', function() {
    const dataSelecionada = new Date(this.value);
    if (dataSelecionada < minDate || dataSelecionada > hoje) {
        alert("A data de nascimento deve estar entre " + 
              minDate.toLocaleDateString('pt-BR') + " e " + 
              hoje.toLocaleDateString('pt-BR') + 
              " (até 30 anos de idade).");
        this.value = "";
    }
});
</script>

</body>
</html>
