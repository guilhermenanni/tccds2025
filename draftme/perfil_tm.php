<?php
session_start();
include('conex.php');

// Verificar se foi passado um ID de usuário ou time
if (!isset($_GET['id_usuario']) && !isset($_GET['id_time'])) {
    header("Location: home_tm.php");
    exit;
}

$tipo_perfil = '';
$dados_perfil = null;
$foto_perfil = 'default.png';

if (isset($_GET['id_usuario'])) {
    $tipo_perfil = 'usuario';
    $id_perfil = $_GET['id_usuario'];
    
    // Buscar dados do usuário
    $sql = "SELECT * FROM tb_usuario WHERE id_usuario = ?";
    $stmt = $conex->prepare($sql);
    $stmt->bind_param("i", $id_perfil);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $dados_perfil = $result->fetch_assoc();
        $foto_perfil = $dados_perfil['img_usuario'] ?? 'default.png';
    }
    $stmt->close();
    
} elseif (isset($_GET['id_time'])) {
    $tipo_perfil = 'time';
    $id_perfil = $_GET['id_time'];
    
    // Buscar dados do time
    $sql = "SELECT * FROM tb_time WHERE id_time = ?";
    $stmt = $conex->prepare($sql);
    $stmt->bind_param("i", $id_perfil);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $dados_perfil = $result->fetch_assoc();
        $foto_perfil = $dados_perfil['img_time'] ?? 'default.png';
    }
    $stmt->close();
}

if (!$dados_perfil) {
    header("Location: home_tm.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Perfil - DraftMe</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .perfil-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .perfil-info {
            flex: 1;
            margin-left: 20px;
        }
        .perfil-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #4CAF50;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
        }
        .tab.ativa {
            border-bottom-color: #4CAF50;
            font-weight: bold;
        }
        .aba-conteudo {
            display: none;
        }
        .aba-conteudo.ativa {
            display: block;
        }
        .post-container, .seletiva-container {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        .seletiva-container {
            border: 2px solid #4CAF50;
            background-color: #f0fff0;
        }
        .post-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .post-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 10px;
        }
        .btn {
            padding: 8px 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background-color: #45a049;
        }
        .curtida-container {
            display: flex;
            align-items: center;
            margin-top: 10px;
        }
        .btn-curtir {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2em;
            margin-right: 5px;
            color: #65676B;
        }
        .btn-curtir.curtido {
            color: #1877F2;
        }
        .contador-curtidas {
            font-size: 0.9em;
            color: #65676B;
        }
        .comentarios-container {
            margin-top: 10px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .comentario {
            padding: 8px;
            margin-bottom: 8px;
            background-color: #fff;
            border-radius: 4px;
            border-left: 3px solid #4CAF50;
        }
        .form-comentario {
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="javascript:history.back()" class="btn" style="margin-bottom: 20px;">← Voltar</a>
        
        <div class="perfil-header">
            <img src="uploads/<?php echo htmlspecialchars($foto_perfil); ?>" alt="Foto de perfil" class="perfil-img">
            <div class="perfil-info">
                <h1>
                    <?php 
                    if ($tipo_perfil == 'usuario') {
                        echo htmlspecialchars($dados_perfil['nm_usuario']);
                    } else {
                        echo htmlspecialchars($dados_perfil['nm_time']);
                    }
                    ?>
                </h1>
                <p><strong>Email:</strong> 
                    <?php 
                    if ($tipo_perfil == 'usuario') {
                        echo htmlspecialchars($dados_perfil['email_usuario']);
                    } else {
                        echo htmlspecialchars($dados_perfil['email_time']);
                    }
                    ?>
                </p>
                <?php if ($tipo_perfil == 'usuario'): ?>
                    <p><strong>CPF:</strong> <?php echo htmlspecialchars($dados_perfil['cpf_usuario']); ?></p>
                    <p><strong>Data de Nascimento:</strong> <?php echo htmlspecialchars($dados_perfil['dt_nasc_usuario']); ?></p>
                    <p><strong>Telefone:</strong> <?php echo htmlspecialchars($dados_perfil['tel_usuario'] ?? 'Não informado'); ?></p>
                <?php else: ?>
                    <p><strong>CNPJ:</strong> <?php echo htmlspecialchars($dados_perfil['time_cnpj']); ?></p>
                <?php endif; ?>
                
                <?php if (!empty($dados_perfil['sobre']) && trim($dados_perfil['sobre']) !== ''): ?>
                    <p><strong>Sobre:</strong> <?php echo nl2br(htmlspecialchars($dados_perfil['sobre'])); ?></p>
                <?php else: ?>
                    <p><strong>Sobre:</strong> <em>Nenhuma descrição adicionada ainda.</em></p>
                <?php endif; ?>
            </div>
        </div>

        <div class="tabs">
            <div class="tab ativa" onclick="mostrarAba('postagens')">Postagens</div>
            <?php if ($tipo_perfil == 'time'): ?>
                <div class="tab" onclick="mostrarAba('seletivas')">Seletivas</div>
            <?php endif; ?>
        </div>

        <!-- ABA: POSTAGENS -->
        <div id="postagens" class="aba-conteudo ativa">
            <h2>Postagens</h2>
            <?php
            if ($tipo_perfil == 'usuario') {
                $sql_posts = "SELECT * FROM tb_postagem WHERE id_usuario = ? ORDER BY data_postagem DESC";
                $stmt = $conex->prepare($sql_posts);
                $stmt->bind_param("i", $id_perfil);
            } else {
                $sql_posts = "SELECT * FROM tb_postagem WHERE id_time = ? ORDER BY data_postagem DESC";
                $stmt = $conex->prepare($sql_posts);
                $stmt->bind_param("i", $id_perfil);
            }
            
            $stmt->execute();
            $result_posts = $stmt->get_result();
            
            if ($result_posts->num_rows > 0) {
                while ($post = $result_posts->fetch_assoc()) {
                    echo "<div class='post-container'>";
                    echo "<div class='post-header'>";
                    echo "<img src='uploads/" . htmlspecialchars($foto_perfil) . "' alt='Avatar' class='post-avatar'>";
                    echo "<div>";
                    echo "<strong>" . htmlspecialchars($tipo_perfil == 'usuario' ? $dados_perfil['nm_usuario'] : $dados_perfil['nm_time']) . "</strong><br>";
                    echo "<small>" . $post['data_postagem'] . "</small>";
                    echo "</div>";
                    echo "</div>";
                    
                    echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                    echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                    echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                    if (!empty($post['img_postagem'])) {
                        echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
                    }
                    
                    // Botão de curtir e contador
                    echo "<div class='curtida-container'>";
                    echo "<button class='btn-curtir' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>🤍</button>";
                    
                    // Contar curtidas
                    $sql_curtidas = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                    $result_curtidas = $conex->query($sql_curtidas);
                    $curtidas = $result_curtidas->fetch_assoc();
                    echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                    
                    echo "</div>";

                    // Formulário para adicionar comentário (apenas se time logado)
                    if (isset($_SESSION['id'])) {
                        echo "<div class='form-comentario'>";
                        echo "<form action='adicionar_comentario.php' method='POST'>";
                        echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                        echo "<textarea name='texto_comentario' rows='2' cols='40' placeholder='Adicione um comentário...' required></textarea>";
                        echo "<button type='submit' class='btn'>Comentar</button>";
                        echo "</form>";
                        echo "</div>";
                    }
                    
                    // Exibir comentários existentes
                    $id_postagem = $post['id_postagem'];
                    $sql_comentarios = "SELECT c.*, 
                                       COALESCE(u.nm_usuario, t.nm_time) as autor,
                                       COALESCE(u.img_usuario, t.img_time) as avatar,
                                       CASE WHEN c.id_usuario IS NOT NULL THEN 'usuário' ELSE 'time' END as tipo_autor
                                      FROM tb_comentario c 
                                      LEFT JOIN tb_usuario u ON c.id_usuario = u.id_usuario 
                                      LEFT JOIN tb_time t ON c.id_time = t.id_time 
                                      WHERE c.id_postagem = $id_postagem 
                                      ORDER BY c.data_comentario ASC";
                    $result_comentarios = $conex->query($sql_comentarios);

                    if ($result_comentarios->num_rows > 0) {
                        echo "<div class='comentarios-container'>";
                        echo "<h4>Comentários:</h4>";
                        while ($comentario = $result_comentarios->fetch_assoc()) {
                            $avatar_comentario = $comentario['avatar'] ?? 'default.png';
                            echo "<div class='comentario'>";
                            echo "<div class='post-header'>";
                            echo "<img src='uploads/" . htmlspecialchars($avatar_comentario) . "' alt='Avatar' class='post-avatar'>";
                            echo "<div>";
                            echo "<strong>" . htmlspecialchars($comentario['autor']) . " (" . $comentario['tipo_autor'] . ")</strong><br>";
                            echo htmlspecialchars($comentario['texto_comentario']);
                            echo "<br><small>Em: " . $comentario['data_comentario'] . "</small>";
                            echo "</div>";
                            echo "</div>";
                            echo "</div>";
                        }
                        echo "</div>";
                    }
                    echo "</div>";
                }
            } else {
                echo "<p>Nenhuma postagem encontrada.</p>";
            }
            $stmt->close();
            ?>
        </div>

        <!-- ABA: SELETIVAS (APENAS PARA TIMES) -->
        <?php if ($tipo_perfil == 'time'): ?>
        <div id="seletivas" class="aba-conteudo">
            <h2>Seletivas</h2>
            <?php
            $sql_seletivas = "SELECT * FROM tb_seletiva WHERE id_time = ? ORDER BY data_seletiva DESC";
            $stmt = $conex->prepare($sql_seletivas);
            $stmt->bind_param("i", $id_perfil);
            $stmt->execute();
            $result_seletivas = $stmt->get_result();
            
            if ($result_seletivas->num_rows > 0) {
                while ($seletiva = $result_seletivas->fetch_assoc()) {
                    echo "<div class='seletiva-container'>";
                    echo "<h3>" . htmlspecialchars($seletiva['titulo']) . "</h3>";
                    echo "<p><strong>Local:</strong> " . htmlspecialchars($seletiva['localizacao']) . "</p>";
                    echo "<p><strong>Cidade:</strong> " . htmlspecialchars($seletiva['cidade']) . "</p>";
                    echo "<p><strong>Data:</strong> " . htmlspecialchars($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
                    echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
                    echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
                    echo "<small>Criada em: " . $seletiva['data_postagem'] . "</small>";
                    echo "</div>";
                }
            } else {
                echo "<p>Nenhuma seletiva encontrada.</p>";
            }
            $stmt->close();
            ?>
        </div>
        <?php endif; ?>
    </div>

    <script>
        // Função para mostrar abas
        function mostrarAba(abaId) {
            document.querySelectorAll('.aba-conteudo').forEach(aba => {
                aba.classList.remove('ativa');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('ativa');
            });
            document.getElementById(abaId).classList.add('ativa');
            event.target.classList.add('ativa');
        }

        // Função para curtir/descurtir postagem
        function curtirPostagem(idPostagem, elemento) {
            var formData = new FormData();
            formData.append('id_postagem', idPostagem);
            
            // Verificar se é usuário ou time logado
            var url = 'curtir_postagem_time.php'; // para time
            
            fetch(url, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Atualizar contador
                    var contador = elemento.nextElementSibling;
                    contador.textContent = data.curtidas + ' curtida(s)';
                    
                    // Alterar aparência do botão
                    if (data.action === 'curtir') {
                        elemento.classList.add('curtido');
                        elemento.innerHTML = '❤️';
                    } else {
                        elemento.classList.remove('curtido');
                        elemento.innerHTML = '🤍';
                    }
                } else {
                    alert('Erro: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao curtir postagem');
            });
        }
    </script>
</body>
</html>