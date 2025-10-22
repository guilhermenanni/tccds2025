<?php
session_start();
if (!isset($_SESSION['id'])) {
    header("Location: login_tm.php");
    exit;
}

include('conex.php');
$id_time = $_SESSION['id'];

// Buscar dados atuais do time
$sql = "SELECT * FROM tb_time WHERE id_time = $id_time";
$res = $conex->query($sql);
$time = $res->fetch_assoc();

$msg = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['nome_time'], $_POST['email_time'])) {
        
        $nome_time = mysqli_real_escape_string($conex, $_POST['nome_time']);
        $email_time = mysqli_real_escape_string($conex, $_POST['email_time']);
        $cnpj_time = isset($_POST['time_cnpj']) ? mysqli_real_escape_string($conex, $_POST['time_cnpj']) : null;
        $sobre_time = isset($_POST['sobre_time']) ? mysqli_real_escape_string($conex, $_POST['sobre_time']) : null;

        // Verificar se o email já existe (excluindo o próprio time)
        $query_verifica = "SELECT * FROM tb_time WHERE email_time = '$email_time' AND id_time != $id_time";
        $result_verifica = $conex->query($query_verifica);

        if ($result_verifica->num_rows > 0) {
            $msg = "<div class='alert error'>E-mail já cadastrado em outro time.</div>";
        } else {
            // Verificar se o CNPJ já existe (excluindo o próprio time)
            if ($cnpj_time) {
                $query_cnpj = "SELECT * FROM tb_time WHERE time_cnpj = '$cnpj_time' AND id_time != $id_time";
                $result_cnpj = $conex->query($query_cnpj);
                
                if ($result_cnpj->num_rows > 0) {
                    $msg = "<div class='alert error'>CNPJ já cadastrado em outro time.</div>";
                } else {
                    // Atualizar dados do time
                    $sql_update = "UPDATE tb_time SET 
                                  nm_time = '$nome_time', 
                                  email_time = '$email_time', 
                                  time_cnpj = " . ($cnpj_time ? "'$cnpj_time'" : "NULL") . ", 
                                  sobre_time = " . ($sobre_time ? "'$sobre_time'" : "NULL") . "
                                  WHERE id_time = $id_time";

                    if ($conex->query($sql_update)) {
                        $msg = "<div class='alert success'>Informações do time atualizadas com sucesso!</div>";
                    } else {
                        $msg = "<div class='alert error'>Erro ao atualizar: " . $conex->error . "</div>";
                    }
                }
            } else {
                // Atualizar sem CNPJ
                $sql_update = "UPDATE tb_time SET 
                              nm_time = '$nome_time', 
                              email_time = '$email_time', 
                              time_cnpj = NULL, 
                              sobre_time = " . ($sobre_time ? "'$sobre_time'" : "NULL") . "
                              WHERE id_time = $id_time";

                if ($conex->query($sql_update)) {
                    $msg = "<div class='alert success'>Informações do time atualizadas com sucesso!</div>";
                } else {
                    $msg = "<div class='alert error'>Erro ao atualizar: " . $conex->error . "</div>";
                }
            }
        }
    }
}

// Processar upload de imagem
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES['imagem'])) {
    if ($_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
        $extensao = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));
        $extensoes_permitidas = array('jpg', 'jpeg', 'png', 'gif');
        
        if (in_array($extensao, $extensoes_permitidas)) {
            $nome_arquivo = uniqid() . '.' . $extensao;
            $caminho_arquivo = 'uploads/' . $nome_arquivo;
            
            if (move_uploaded_file($_FILES['imagem']['tmp_name'], $caminho_arquivo)) {
                // Deletar imagem antiga se não for a default
                if ($time['img_time'] && $time['img_time'] != 'default.png') {
                    @unlink('uploads/' . $time['img_time']);
                }
                
                $sql_imagem = "UPDATE tb_time SET img_time = '$nome_arquivo' WHERE id_time = $id_time";
                if ($conex->query($sql_imagem)) {
                    $time['img_time'] = $nome_arquivo;
                    $msg = "<div class='alert success'>Imagem do time atualizada com sucesso!</div>";
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
    <title>Editar Time - DraftMe</title>
    
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
    </style>
</head>
<body>

    <div class="wrapper">
        <div class="form-header">
            <div class="titles">
                <div class="title-login">Editar Time</div>
            </div>
        </div>

        <?php echo $msg; ?>

        <!-- Seção de Upload de Imagem (igual ao home_tm) -->
        <div class="upload-container">
            <h3>Alterar Imagem do Time</h3>
            <div class="current-image">
                <img src="uploads/<?php echo htmlspecialchars($time['img_time'] ?? 'default.png'); ?>" alt="Imagem atual do time">
            </div>
            
            <form method="POST" enctype="multipart/form-data" style="display: inline-block;">
                <input type="file" name="imagem" accept="image/*" required>
                <br>
                <button type="submit" class="btn-submit" style="margin-top: 10px;">
                    <i class='bx bx-upload'></i> Alterar Imagem
                </button>
            </form>
        </div>

        <!-- Formulário de Informações do Time -->
        <form method="POST" class="login-form" autocomplete="off">
            <div class="input-box">
                <input type="text" name="nome_time" class="input-field" required 
                       value="<?php echo htmlspecialchars($time['nm_time']); ?>" placeholder=" ">
                <label class="label">Nome do Time</label>
                <i class='bx bx-group icon'></i>
            </div>

            <div class="input-box">
                <input type="email" name="email_time" class="input-field" required 
                       value="<?php echo htmlspecialchars($time['email_time']); ?>" placeholder=" ">
                <label class="label">Email</label>
                <i class='bx bx-envelope icon'></i>
            </div>

            <div class="input-box">
                <input type="number" name="time_cnpj" class="input-field" maxlength="14" 
                       value="<?php echo htmlspecialchars($time['time_cnpj'] ?? ''); ?>" placeholder=" "
                       oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
                       maxlength="14" min="0" step="1">
                <label class="label">CNPJ (Opcional)</label>
                <i class='bx bx-id-card icon'></i>
            </div>

            <div class="input-box">
                <textarea name="sobre_time" class="input-field" placeholder=" " style="min-height: 80px; resize: vertical;"><?php echo htmlspecialchars($time['sobre_time'] ?? ''); ?></textarea>
                <label class="label">Sobre o Time (Opcional)</label>
                <i class='bx bx-edit icon'></i>
            </div>
            
            <div class="switch-form">
                <a href="home_tm.php" style="color: var(--primary-color); text-decoration: none;">
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

        // Validar CNPJ para aceitar apenas números
        document.querySelector('input[name="time_cnpj"]').addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, ''); // Remove tudo que não for número
        });
    </script>
</body>
</html>