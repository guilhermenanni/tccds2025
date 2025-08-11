<?php
session_start();
include('conex.php');

$msg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['nome_time'], $_POST['email_time'], $_POST['senha_time'], $_POST['categoria_time'], $_POST['esporte_time'], $_POST['localizacao_time'])) {


        
        $nome_time = mysqli_real_escape_string($conex, $_POST['nome_time']);
        $email_time = mysqli_real_escape_string($conex, $_POST['email_time']);
        $senha_time = password_hash($_POST['senha_time'], PASSWORD_DEFAULT);
        $cnpj_time = isset($_POST['time_cnpj']) ? mysqli_real_escape_string($conex, $_POST['time_cnpj']) : null;
        $categoria_time = mysqli_real_escape_string($conex, $_POST['categoria_time']);
        $esporte_time = mysqli_real_escape_string($conex, $_POST['esporte_time']);
        $localizacao_time = mysqli_real_escape_string($conex, $_POST['localizacao_time']);


        $query_verifica = "SELECT * FROM tb_time WHERE email_time = '$email_time'";
        $result_verifica = $conex->query($query_verifica);

        if ($result_verifica->num_rows > 0) {
            $msg = "<div class='alert error'>E-mail já cadastrado.</div>";
        } else {
            // sisteminha pra ver se o cnpj existe mas sla tenho que arrumar isso ae dps
            if ($cnpj_time) {
                $query_cnpj = "SELECT * FROM tb_time WHERE time_cnpj = '$cnpj_time'";
                $result_cnpj = $conex->query($query_cnpj);
                
                if ($result_cnpj->num_rows > 0) {
                    $msg = "<div class='alert error'>CNPJ já cadastrado.</div>";
                } else {

                    $sql = "INSERT INTO tb_time (nm_time, email_time, senha_time, time_cnpj, categoria_time, esporte_time, localizacao_time)
                            VALUES ('$nome_time', '$email_time', '$senha_time', " . ($cnpj_time ? "'$cnpj_time'" : "NULL") . ", '$categoria_time', '$esporte_time', '$localizacao_time')";

                    if ($conex->query($sql)) {
                        $msg = "<div class='alert success'>Time cadastrado com sucesso!</div>";
                    } else {
                        $msg = "<div class='alert error'>Erro ao cadastrar: " . $conex->error . "</div>";
                    }
                }
            } else {
                // Inserir sem CNPJ<-mudar isso aqui para o npvo banco de dados 
                $sql = "INSERT INTO tb_time (nm_time, email_time, senha_time, time_cnpj, categoria_time, esporte_time, localizacao_time)
                        VALUES ('$nome_time', '$email_time', '$senha_time', NULL, '$categoria_time', '$esporte_time', '$localizacao_time')";

                if ($conex->query($sql)) {
                    $msg = "<div class='alert success'>Time cadastrado com sucesso!</div>";
                } else {
                    $msg = "<div class='alert error'>Erro ao cadastrar: " . $conex->error . "</div>";
                }
            }
        }
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
        .alert {
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 4px;
            text-align: center;
            font-weight: 500;
        }
        .error {
            background-color: #ffebee;
            color: #d32f2f;
            border: 1px solid #ef9a9a;
        }
        .success {
            background-color: #e8f5e9;
            color: #388e3c;
            border: 1px solid #a5d6a7;
        }
        .input-field:not(:placeholder-shown) ~ .label,
        .input-field:focus ~ .label {
            top: 0;
            font-size: 14px;
            background-color: var(--white-color);
            color: var(--primary-color);
            padding: 0 10px;
        }
        .input-field:not(:placeholder-shown):not(:focus) ~ .label {
            color: var(--secondary-color);
        }
    </style>
</head>
<body>

    <div class="wrapper">
        <div class="form-header">
            <div class="titles">
                <div class="title-login">Cadastrar - DraftMe</div>
            </div>
        </div>

        <?php echo $msg; ?>

        <form method="POST" class="login-form" autocomplete="off">
            <div class="input-box">
                <input type="text" name="nome_time" class="input-field" required placeholder=" ">
                <label class="label">Nome do Time</label>
                <i class='bx bx-group icon'></i>
            </div>

            <div class="input-box">
                <input type="email" name="email_time" class="input-field" required placeholder=" ">
                <label class="label">Email</label>
                <i class='bx bx-envelope icon'></i>
            </div>

            <div class="input-box">
                <input type="password" name="senha_time" class="input-field" required minlength="8" placeholder=" ">
                <label class="label">Senha</label>
            </div>

            <div class="input-box">
                <input type="text" name="time_cnpj" class="input-field" maxlength="14" placeholder=" ">
                <label class="label">CNPJ</label>
                <i class='bx bx-id-card icon'></i>
            </div>

<div class="input-box">
    <select name="categoria_time" class="input-field" required>
        <option value="" disabled selected hidden></option>
        <option value="Sub-12">Sub-12</option>
        <option value="Sub-13">Sub-13</option>
        <option value="Sub-14">Sub-14</option>
        <option value="Sub-15">Sub-15</option>
        <option value="Sub-16">Sub-16</option>
        <option value="Sub-17">Sub-17</option>
        <option value="Sub-18">Sub-18</option>
        <option value="Sub-20">Sub-20</option>
    </select>
    <label class="label">Categoria</label>
    <i class='bx bx-category icon'></i>
</div>


        <div class="input-box">
    <select name="esporte_time" class="input-field" required>
        <option value="" disabled selected hidden></option>
        <option value="Futebol">Futebol</option>
        <option value="Futsal">Futsal</option>
        <option value="Basquete">Basquete</option>
        <option value="Vôlei">Vôlei</option>
        <option value="Handebol">Handebol</option>
        <option value="Rugby">Rugby</option>
    </select>
    <label class="label">Esporte</label>
    <i class='bx bx-football icon'></i>
</div>


            <div class="input-box">
                <input type="text" name="localizacao_time" class="input-field" required placeholder=" ">
                <label class="label">Localização</label>
                <i class='bx bx-map icon'></i>
            </div>

            <div class="form-cols">
                <div class="col-1">
                    <input type="checkbox" id="agree-time" required>
                    <label for="agree-time"> Aceito os <a href="termos.html">termos de contrato</a></label>
                </div>
            </div>

            <div class="input-box">
                <button type="submit" class="btn-submit">Cadastrar Time <i class='bx bx-log-in'></i></button>
            </div>

            <div class="switch-form">
                <span>Já tem um time? <a href="login_tm.php">Entrar</a></span>
            </div>
        </form>
    </div>
    <script src="js/script.js"></script>
    <script>
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const alert = document.querySelector('.alert');
                if(alert) alert.remove();
            });
        });
    </script>
</body>
</html>