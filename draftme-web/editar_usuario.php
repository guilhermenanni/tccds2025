<?php
session_start();
if (!isset($_SESSION['id'])) {
    header("Location: login_us.php");
    exit;
}

include('conex.php');
$id_usuario = $_SESSION['id'];

// Buscar dados atuais do usuário
$sql = "SELECT * FROM tb_usuario WHERE id_usuario = $id_usuario";
$res = $conex->query($sql);
$usuario = $res->fetch_assoc();

$msg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Processar informações básicas
    if (isset($_POST['nome_usuario'], $_POST['email_usuario'], $_POST['cpf_usuario'], $_POST['dt_nasc_usuario'])) {
        
        $nome_usuario = mysqli_real_escape_string($conex, $_POST['nome_usuario']);
        $email_usuario = mysqli_real_escape_string($conex, $_POST['email_usuario']);
        $cpf_usuario = mysqli_real_escape_string($conex, $_POST['cpf_usuario']);
        $dt_nasc_usuario = mysqli_real_escape_string($conex, $_POST['dt_nasc_usuario']);
        $tel_usuario = isset($_POST['tel_usuario']) ? mysqli_real_escape_string($conex, $_POST['tel_usuario']) : null;
        $sobre_usuario = isset($_POST['sobre_usuario']) ? mysqli_real_escape_string($conex, $_POST['sobre_usuario']) : null;

        // Verificar se o email já existe (excluindo o próprio usuário)
        $query_verifica_email = "SELECT * FROM tb_usuario WHERE email_usuario = '$email_usuario' AND id_usuario != $id_usuario";
        $result_verifica_email = $conex->query($query_verifica_email);

        if ($result_verifica_email->num_rows > 0) {
            $msg = "<div class='alert error'>E-mail já cadastrado em outro usuário.</div>";
        } else {
            // Verificar se o CPF já existe (excluindo o próprio usuário)
            $query_verifica_cpf = "SELECT * FROM tb_usuario WHERE cpf_usuario = '$cpf_usuario' AND id_usuario != $id_usuario";
            $result_verifica_cpf = $conex->query($query_verifica_cpf);
            
            if ($result_verifica_cpf->num_rows > 0) {
                $msg = "<div class='alert error'>CPF já cadastrado em outro usuário.</div>";
            } else {
                // Atualizar dados do usuário
                $sql_update = "UPDATE tb_usuario SET 
                              nm_usuario = '$nome_usuario', 
                              email_usuario = '$email_usuario', 
                              cpf_usuario = '$cpf_usuario', 
                              dt_nasc_usuario = '$dt_nasc_usuario', 
                              tel_usuario = " . ($tel_usuario ? "'$tel_usuario'" : "NULL") . ",
                              sobre = " . ($sobre_usuario ? "'$sobre_usuario'" : "NULL") . "
                              WHERE id_usuario = $id_usuario";

                if ($conex->query($sql_update)) {
                    $msg = "<div class='alert success'>Informações atualizadas com sucesso!</div>";
                    // Atualizar dados na sessão
                    $_SESSION['nome'] = $nome_usuario;
                    $_SESSION['email'] = $email_usuario;
                    // Atualizar dados locais
                    $usuario['sobre'] = $sobre_usuario;
                } else {
                    $msg = "<div class='alert error'>Erro ao atualizar: " . $conex->error . "</div>";
                }
            }
        }
    }
}

// Processar upload de imagem (mantido igual)
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES['imagem'])) {
    if ($_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
        $extensao = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));
        $extensoes_permitidas = array('jpg', 'jpeg', 'png', 'gif');
        
        if (in_array($extensao, $extensoes_permitidas)) {
            $nome_arquivo = uniqid() . '.' . $extensao;
            $caminho_arquivo = 'uploads/' . $nome_arquivo;
            
            if (move_uploaded_file($_FILES['imagem']['tmp_name'], $caminho_arquivo)) {
                // Deletar imagem antiga se não for a default
                if ($usuario['img_usuario'] && $usuario['img_usuario'] != 'default.png') {
                    @unlink('uploads/' . $usuario['img_usuario']);
                }
                
                $sql_imagem = "UPDATE tb_usuario SET img_usuario = '$nome_arquivo' WHERE id_usuario = $id_usuario";
                if ($conex->query($sql_imagem)) {
                    $usuario['img_usuario'] = $nome_arquivo;
                    $msg = "<div class='alert success'>Imagem de perfil atualizada com sucesso!</div>";
                } else {
                    $msg = "<div class='alert error'>Erro ao atualizar imagem: " . $conex->error . "</div>";
                }
            } else {
                $msg = "<div class='alert error'>Erro ao fazer upload da imagem.</div>";
            }
        } else {
            $msg = "<div class='alert error'>Formato de arquivo não permitido. Use JPG, JPEG, PNG ou GIF.</div>";
        }
    } elseif ($_FILES['imagem']['error'] !== UPLOAD_ERR_NO_FILE) {
        $msg = "<div class='alert error'>Erro no upload: " . $_FILES['imagem']['error'] . "</div>";
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Perfil - DraftMe</title>
    
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="shortcut icon" href="1.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/style.css">

    <style>
        .upload-container {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #ddd;
            text-align: center;
        }
        .current-image {
            margin-bottom: 15px;
        }
        .current-image img {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid var(--primary-color);
        }
        .upload-container input[type="file"] {
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
            max-width: 300px;
        }
        .wrapper {
            max-height: 90vh;
            overflow-y: auto;
        }
        textarea.input-field {
            min-height: 100px;
            resize: vertical;
            padding-top: 15px;
        }
    </style>
</head>
<body>

    <div class="wrapper">
        <div class="form-header">
            <div class="titles">
                <div class="title-login">Editar Perfil</div>
            </div>
        </div>

        <?php echo $msg; ?>

        <!-- Seção de Upload de Imagem -->
        <div class="upload-container">
            <h3>Alterar Foto de Perfil</h3>
            <div class="current-image">
                <img src="uploads/<?php echo htmlspecialchars($usuario['img_usuario'] ?? 'default.png'); ?>" alt="Imagem atual do usuário">
            </div>
            
            <form method="POST" enctype="multipart/form-data" style="display: inline-block;">
                <input type="file" name="imagem" accept="image/*" required>
                <br>
                <button type="submit" class="btn-submit" style="margin-top: 10px;">
                    <i class='bx bx-upload'></i> Alterar Foto
                </button>
            </form>
        </div>

        <!-- Formulário de Edição -->
        <form method="POST" class="login-form" autocomplete="off">
            <div class="input-box">
                <input type="text" name="nome_usuario" class="input-field" required 
                       value="<?php echo htmlspecialchars($usuario['nm_usuario']); ?>" placeholder=" ">
                <label class="label">Nome Completo</label>
                <i class='bx bx-user icon'></i>
            </div>

            <div class="input-box">
                <input type="email" name="email_usuario" class="input-field" required 
                       value="<?php echo htmlspecialchars($usuario['email_usuario']); ?>" placeholder=" ">
                <label class="label">Email</label>
                <i class='bx bx-envelope icon'></i>
            </div>

            <div class="input-box">
                <input type="text" name="cpf_usuario" class="input-field" required maxlength="11"
                       value="<?php echo htmlspecialchars($usuario['cpf_usuario']); ?>" placeholder=" ">
                <label class="label">CPF</label>
                <i class='bx bx-id-card icon'></i>
            </div>

            <div class="input-box">
                <input type="date" name="dt_nasc_usuario" class="input-field" required 
                       value="<?php echo htmlspecialchars($usuario['dt_nasc_usuario']); ?>" placeholder=" ">
                <label class="label">Data de Nascimento</label>
                <i class='bx bx-calendar icon'></i>
            </div>

            <div class="input-box">
                <input type="text" name="tel_usuario" class="input-field" maxlength="12"
                       value="<?php echo htmlspecialchars($usuario['tel_usuario'] ?? ''); ?>" placeholder=" ">
                <label class="label">Telefone (Opcional)</label>
                <i class='bx bx-phone icon'></i>
            </div>

            <div class="input-box">
                <textarea name="sobre_usuario" class="input-field" placeholder=" "><?php echo htmlspecialchars($usuario['sobre'] ?? ''); ?></textarea>
                <label class="label">Sobre (Opcional)</label>
                <i class='bx bx-edit icon'></i>
            </div>

            <div class="switch-form">
                <a href="home_us.php" style="color: var(--primary-color); text-decoration: none;">
                    <i class='bx bx-arrow-back'></i> Voltar para Home
                </a>
            </div>

            <div class="input-box">
                <button type="submit" class="btn-submit">
                    <i class='bx bx-save'></i> Salvar Alterações
                </button>
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

        // Rolagem suave para o formulário
        document.addEventListener('DOMContentLoaded', function() {
            const wrapper = document.querySelector('.wrapper');
            wrapper.scrollTop = 0;
        });
    </script>
</body>
</html>