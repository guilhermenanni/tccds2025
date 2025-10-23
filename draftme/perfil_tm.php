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

// Função para formatar data no padrão brasileiro
function formatarDataBr($data) {
    return date('d/m/Y H:i', strtotime($data));
}

// Verificar se o usuário está logado e seu tipo
$usuario_logado = isset($_SESSION['id']);
$tipo_usuario_logado = isset($_SESSION['tipo']) ? $_SESSION['tipo'] : null;
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
        <link rel="shortcut icon" href="1.ico" type="image/x-icon">
    <title>Perfil - DraftMe</title>
    <link rel="stylesheet" href="hometm_style.css">
    <style>
        /* Estilos específicos para a página de perfil */
        .perfil-header {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            gap: 30px;
        }
        
        .perfil-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #1DA1F2;
        }
        
        .perfil-info {
            flex: 1;
        }
        
        .perfil-info h1 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 1.8em;
            font-weight: bold;
        }
        
        .perfil-info p {
            margin: 8px 0;
            color: #555;
            line-height: 1.5;
        }
        
        .perfil-info strong {
            color: #333;
        }
        
        .voltar-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background-color: #1DA1F2;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-bottom: 20px;
            transition: background-color 0.2s;
        }
        
        .voltar-btn:hover {
            background-color: #1A91DA;
        }
        
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
            background-color: #ffffff;
            border-radius: 8px 8px 0 0;
            padding: 0 20px;
        }
        
        .tab {
            padding: 15px 25px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            font-weight: 500;
            color: #657786;
            transition: all 0.2s;
        }
        
        .tab.ativa {
            border-bottom-color: #1DA1F2;
            color: #1DA1F2;
            font-weight: 600;
        }
        
        .tab:hover {
            color: #1DA1F2;
            background-color: #f8f9fa;
        }
        
        .aba-conteudo {
            display: none;
        }
        
        .aba-conteudo.ativa {
            display: block;
        }
        
        .sem-conteudo {
            text-align: center;
            padding: 40px 20px;
            color: #657786;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        
        .sem-conteudo p {
            margin: 0;
            font-size: 1.1em;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar Esquerda (igual ao home_tm) -->
        <div class="left-sidebar">
            <div class="logo-container">
                <img src="draftmelogo.png" alt="Logo DraftMe" onerror="this.style.display='none'">
                <h2>DraftMe</h2>
            </div>
            
            <nav class="nav-menu">
                <ul>
                    <li><a href="home_tm.php"><span class="icon-home"></span>Home</a></li>
                    <li><a href="#" class="active"><span class="icon-profile"></span>Perfil</a></li>
                    <li><a href="home_tm.php" onclick="mostrarAba('minhas-seletivas')"><span class="icon-seletivas"></span>Minhas Seletivas</a></li>
                    <li><a href="home_tm.php" onclick="mostrarAba('seletivas-disponiveis')"><span class="icon-seletivas"></span>Seletivas Disponíveis</a></li>
                    <li><a href="home_tm.php" onclick="mostrarAba('postagens-curtidas')"><span class="icon-liked"></span>Postagens Curtidas</a></li>
                </ul>
            </nav>

            <!-- Perfil do Time Logado (se estiver logado como time) -->
            <?php if ($usuario_logado && $tipo_usuario_logado === 'time'): ?>
            <?php
            $id_time_logado = $_SESSION['id'];
            $sql_time_logado = "SELECT img_time, nm_time, email_time FROM tb_time WHERE id_time = $id_time_logado";
            $res_time_logado = $conex->query($sql_time_logado);
            $dados_time_logado = $res_time_logado->fetch_assoc();
            $imagem_time_logado = !empty($dados_time_logado['img_time']) && file_exists('uploads/' . $dados_time_logado['img_time']) ? $dados_time_logado['img_time'] : 'default.png';
            ?>
            <div class="profile-card">
                <img src="uploads/<?php echo htmlspecialchars($imagem_time_logado); ?>" alt="Imagem do time">
                <h3><?php echo htmlspecialchars($dados_time_logado['nm_time']); ?></h3>
                <p><?php echo htmlspecialchars($dados_time_logado['email_time']); ?></p>
                <a href="editar_time.php" class="btn-edit">Editar Perfil</a>
            </div>
            <?php endif; ?>

            <div class="logout-button-container">
                <a href="logout.php" class="btn btn-danger"><span class="icon-logout"></span>Sair</a>
            </div>
        </div>

        <!-- Conteúdo Principal -->
        <div class="main-content">
            <a href="home_tm.php" class="voltar-btn">← Voltar para Home</a>
            
            <!-- Cabeçalho do Perfil -->
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

            <!-- Abas de Navegação -->
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
                        
                        // Header da postagem com foto
                        echo "<div class='post-header'>";
                        echo "<img src='uploads/" . htmlspecialchars($foto_perfil) . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        echo "<strong>" . htmlspecialchars($tipo_perfil == 'usuario' ? $dados_perfil['nm_usuario'] : $dados_perfil['nm_time']) . "</strong>";
                        echo "<small>" . formatarDataBr($post['data_postagem']) . "</small>";
                        echo "</div>";
                        echo "</div>";
                        
                        echo "<div class='post-content'>";
                        echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                        echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                        echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                        if (!empty($post['img_postagem'])) {
                            echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' alt='Imagem da postagem'>";
                        }
                        echo "</div>";

                        echo "<small>Postado em: " . formatarDataBr($post['data_postagem']) . "</small>";
                        
                        // Botão de curtir e contador
                        echo "<div class='post-actions'>";
                        echo "<button class='btn-action btn-curtir' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>";
                        echo "<span class='icon-liked'></span> <span class='btn-text'>Curtir</span>";
                        echo "</button>";
                        
                        // Contar curtidas
                        $sql_curtidas = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                        $result_curtidas = $conex->query($sql_curtidas);
                        $curtidas = $result_curtidas->fetch_assoc();
                        echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                        echo "</div>";

                        // Formulário para adicionar comentário (apenas se time logado)
                        if ($usuario_logado && $tipo_usuario_logado === 'time') {
                            echo "<div class='form-comentario'>";
                            echo "<form action='adicionar_comentario.php' method='POST'>";
                            echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                            echo "<textarea name='texto_comentario' placeholder='Adicione um comentário...' required></textarea>";
                            echo "<button type='submit' class='btn-comentar'>Comentar</button>";
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
                                echo "<img src='uploads/" . htmlspecialchars($avatar_comentario) . "' alt='Avatar' class='post-avatar'>";
                                echo "<div class='comentario-content'>";
                                echo "<strong>" . htmlspecialchars($comentario['autor']) . " (" . $comentario['tipo_autor'] . ")</strong>";
                                echo "<p>" . htmlspecialchars($comentario['texto_comentario']) . "</p>";
                                echo "<small>Em: " . formatarDataBr($comentario['data_comentario']) . "</small>";
                                echo "</div>";
                                echo "</div>";
                            }
                            echo "</div>";
                        }
                        echo "</div>";
                    }
                } else {
                    echo "<div class='sem-conteudo'>";
                    echo "<p>Nenhuma postagem encontrada.</p>";
                    echo "</div>";
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
                        
                        // Header com foto do time
                        echo "<div class='post-header'>";
                        echo "<img src='uploads/" . htmlspecialchars($foto_perfil) . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        echo "<strong>" . htmlspecialchars($dados_perfil['nm_time']) . " (time)</strong>";
                        echo "</div>";
                        echo "</div>";
                        
                        echo "<p><strong>Local:</strong> " . htmlspecialchars($seletiva['localizacao']) . "</p>";
                        echo "<p><strong>Cidade:</strong> " . htmlspecialchars($seletiva['cidade']) . "</p>";
                        echo "<p><strong>Data:</strong> " . htmlspecialchars($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
                        echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
                        echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
                        echo "<small>Criada em: " . formatarDataBr($seletiva['data_postagem']) . "</small>";
                        echo "</div>";
                    }
                } else {
                    echo "<div class='sem-conteudo'>";
                    echo "<p>Nenhuma seletiva encontrada.</p>";
                    echo "</div>";
                }
                $stmt->close();
                ?>
            </div>
            <?php endif; ?>
        </div>

        <!-- Sidebar Direita (vazia para perfil) -->
        <div class="right-sidebar">
            <div class="right-sidebar-content ativa">
                <div class="right-pesquisa-container">
                    <h3>Informações do Perfil</h3>
                    <p>Visualizando perfil <?php echo $tipo_perfil == 'usuario' ? 'do usuário' : 'do time'; ?>.</p>
                    <p>Navegue pelas abas para ver as postagens<?php echo $tipo_perfil == 'time' ? ' e seletivas' : ''; ?>.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Função para mostrar abas
        function mostrarAba(abaId) {
            // Esconder todas as abas principais
            document.querySelectorAll('.aba-conteudo').forEach(aba => {
                aba.classList.remove('ativa');
            });
            
            // Remover active de todas as tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('ativa');
            });
            
            // Mostrar aba principal selecionada
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
                    var contador = elemento.parentNode.querySelector('.contador-curtidas');
                    if (contador) {
                        contador.textContent = data.curtidas + ' curtida(s)';
                    }
                    
                    // Alterar aparência do botão
                    if (data.action === 'curtir') {
                        elemento.classList.add('curtido');
                        elemento.querySelector('.btn-text').textContent = 'Curtido';
                    } else {
                        elemento.classList.remove('curtido');
                        elemento.querySelector('.btn-text').textContent = 'Curtir';
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

        // Configurar quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar estado das abas
            mostrarAba('postagens');
        });
    </script>
</body>
</html>