<?php
session_start();
if (!isset($_SESSION['id'])) {
    header("Location: index.php");
    exit;
}

// Função para formatar data no padrão brasileiro
function formatarDataBr($data) {
    return date('d/m/Y H:i', strtotime($data));
}

// Função para formatar data sem hora
function formatarDataSemHora($data) {
    return date('d/m/Y', strtotime($data));
}

include('conex.php');
$id_usuario = $_SESSION['id'];

// Buscar dados do usuário
$sql = "SELECT * FROM tb_usuario WHERE id_usuario = $id_usuario";
$res = $conex->query($sql);
$dados_usuario = $res->fetch_assoc();

// Verificar se a imagem existe e usar default se não existir
$imagem = 'default.png';
if (!empty($dados_usuario['img_usuario']) && file_exists('uploads/' . $dados_usuario['img_usuario'])) {
    $imagem = $dados_usuario['img_usuario'];
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Área do Usuário - DraftMe</title>
        <link rel="shortcut icon" href="1.ico" type="image/x-icon">
    <link rel="stylesheet" href="hometm_style.css">
    <style>
        /* Estilos adicionais específicos para usuários */
        .profile-img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 20px;
            border: 3px solid #1DA1F2;
        }
        
        .profile-display {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .profile-details {
            flex: 1;
        }
        
        .profile-details p {
            margin: 8px 0;
            color: #333;
        }
        
        .info-pesquisa {
            background-color: #e8f4fd;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #1DA1F2;
            font-size: 0.9em;
        }
        
        .info-pesquisa a {
            color: #1DA1F2;
            text-decoration: none;
            font-weight: bold;
        }
        
        .info-pesquisa a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar Esquerda -->
        <div class="left-sidebar">
            <div class="logo-container">
                <img src="draftmelogo.png" alt="Logo DraftMe" onerror="this.style.display='none'">
                <h2>DraftMe</h2>
            </div>
            
            <nav class="nav-menu">
                <ul>
                    <li><a href="#" class="active" onclick="mostrarAba('home')"><span class="icon-home"></span>Home</a></li>
                    <li><a href="#" onclick="mostrarAba('minhas-postagens')"><span class="icon-profile"></span>Minhas Postagens</a></li>
                    <li><a href="#" onclick="mostrarAba('seletivas-disponiveis')"><span class="icon-seletivas"></span>Seletivas Disponíveis</a></li>
                    <li><a href="#" onclick="mostrarAba('minhas-seletivas')"><span class="icon-seletivas"></span>Minhas Seletivas</a></li>
                    <li><a href="#" onclick="mostrarAba('postagens-curtidas')"><span class="icon-liked"></span>Postagens Curtidas</a></li>
                </ul>
            </nav>

            <!-- Perfil do Usuário -->
            <div class="profile-card">
                <img src="uploads/<?php echo htmlspecialchars($imagem); ?>" alt="Imagem do usuário">
                <h3><?php echo htmlspecialchars($dados_usuario['nm_usuario']); ?></h3>
                <p><?php echo htmlspecialchars($dados_usuario['email_usuario']); ?></p>
                <a href="editar_usuario.php" class="btn-edit">Editar Perfil</a>
            </div>

            <div class="logout-button-container">
                <a href="logout.php" class="btn btn-danger"><span class="icon-logout"></span>Sair</a>
            </div>
        </div>

        <!-- Conteúdo Principal -->
        <div class="main-content">
            <!-- ABA: HOME (POSTAGENS GERAIS + CRIAR POSTAGEM) -->
            <div id="home" class="aba-conteudo ativa">
                <h2>Home</h2>
                
                <!-- Formulário de Criar Postagem Integrado -->
                <div class="form-criacao-integrada">
                    <h3>Criar Postagem</h3>
                    <form id="formPostagem" enctype="multipart/form-data" class="form-postagem-integrada">
                        <textarea name="texto" placeholder="O que você está pensando?" rows="4" required></textarea>
                        
                        <div class="post-options">
                            <label class="btn-image">
                                Selecionar Imagem
                                <input type="file" name="imagem" accept="image/*" style="display: none;">
                            </label>
                            
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="text" name="categoria" placeholder="Categoria" required style="padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
                                <input type="text" name="tag" placeholder="Tag" style="padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Postar</button>
                        </div>
                    </form>
                    <div id="mensagemPostagem"></div>
                </div>

                <?php
                // Verificar se há pesquisa ativa
                $pesquisa_ativa = isset($_GET['pesquisa']) && !empty($_GET['pesquisa']);
                $termo_pesquisa = $pesquisa_ativa ? $_GET['pesquisa'] : '';
                
                if ($pesquisa_ativa) {
                    echo "<div class='info-pesquisa'>";
                    echo "<strong>Filtro ativo:</strong> Mostrando postagens de \"<em>" . htmlspecialchars($termo_pesquisa) . "</em>\"";
                    echo " | <a href='home_us.php'>Mostrar todas as postagens</a>";
                    echo "</div>";
                }
                
                // Query base para postagens gerais
                $sql_posts_gerais = "SELECT p.*, 
                                    COALESCE(u.nm_usuario, t.nm_time) as autor,
                                    COALESCE(u.id_usuario, t.id_time) as id_autor,
                                    COALESCE(u.img_usuario, t.img_time) as avatar,
                                    CASE WHEN p.id_usuario IS NOT NULL THEN 'usuário' ELSE 'time' END as tipo_autor,
                                    p.id_usuario,
                                    p.id_time
                                   FROM tb_postagem p
                                   LEFT JOIN tb_usuario u ON p.id_usuario = u.id_usuario 
                                   LEFT JOIN tb_time t ON p.id_time = t.id_time 
                                   WHERE 1=1";
                
                // Aplicar filtro de pesquisa se existir
                if ($pesquisa_ativa) {
                    $sql_posts_gerais .= " AND (u.nm_usuario LIKE ? OR t.nm_time LIKE ?)";
                }
                
                $sql_posts_gerais .= " ORDER BY p.data_postagem DESC";
                
                // Preparar e executar a query
                $stmt = $conex->prepare($sql_posts_gerais);
                
                if ($pesquisa_ativa) {
                    $termo_like = "%" . $termo_pesquisa . "%";
                    $stmt->bind_param("ss", $termo_like, $termo_like);
                }
                
                $stmt->execute();
                $result_posts_gerais = $stmt->get_result();
                
                // Mostrar contagem de resultados
                $total_resultados = $result_posts_gerais->num_rows;
                
                if ($pesquisa_ativa) {
                    echo "<p><strong>Resultados encontrados: " . $total_resultados . "</strong></p>";
                }
                
                if ($total_resultados > 0) {
                    while ($post = $result_posts_gerais->fetch_assoc()) {
                        echo "<div class='post-container'>";
                        
                        // Header da postagem com foto e link para perfil
                        echo "<div class='post-header'>";
                        $avatar = $post['avatar'] ?? 'default.png';
                        echo "<img src='uploads/" . htmlspecialchars($avatar) . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        
                        // Link para o perfil
                        if ($post['tipo_autor'] == 'usuário' && $post['id_usuario']) {
                            echo "<strong><a href='perfil.php?id_usuario=" . $post['id_usuario'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
                        } else if ($post['tipo_autor'] == 'time' && $post['id_time']) {
                            echo "<strong><a href='perfil.php?id_time=" . $post['id_time'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
                        } else {
                            echo "<strong>" . htmlspecialchars($post['autor']) . " (" . $post['tipo_autor'] . ")</strong>";
                        }
                        
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
                        
                        // Verificar se o usuário já curtiu esta postagem
                        $sql_curtiu = "SELECT * FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'] . " AND id_usuario = $id_usuario";
                        $result_curtiu = $conex->query($sql_curtiu);
                        $ja_curtiu = $result_curtiu->num_rows > 0;
                        
                        echo "<button class='btn-action btn-curtir " . ($ja_curtiu ? 'curtido' : '') . "' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>";
                        echo "<span class='icon-liked'></span> <span class='btn-text'>" . ($ja_curtiu ? 'Curtido' : 'Curtir') . "</span>";
                        echo "</button>";
                        
                        // Contar curtidas
                        $sql_curtidas = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                        $result_curtidas = $conex->query($sql_curtidas);
                        $curtidas = $result_curtidas->fetch_assoc();
                        echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                        echo "</div>";
                        
                        // Formulário para adicionar comentário
                        echo "<div class='form-comentario'>";
                        echo "<form action='adicionar_comentario_usuario.php' method='POST'>";
                        echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                        echo "<textarea name='texto_comentario' placeholder='Adicione um comentário...' required></textarea>";
                        echo "<button type='submit' class='btn-comentar'>Comentar</button>";
                        echo "</form>";
                        echo "</div>";
                        
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
                    if ($pesquisa_ativa) {
                        echo "<p>Nenhuma postagem encontrada para \"<em>" . htmlspecialchars($termo_pesquisa) . "</em>\".</p>";
                    } else {
                        echo "<p>Ainda não existem postagens.</p>";
                    }
                }
                
                $stmt->close();
                ?>
            </div>

            <!-- ABA: MINHAS POSTAGENS -->
            <div id="minhas-postagens" class="aba-conteudo">
                <h2>Minhas Postagens</h2>
                <?php
                $sql_minhas_postagens = "SELECT * FROM tb_postagem 
                                       WHERE id_usuario = $id_usuario 
                                       ORDER BY data_postagem DESC";
                $result_minhas_postagens = $conex->query($sql_minhas_postagens);

                if ($result_minhas_postagens->num_rows > 0) {
                    while ($post = $result_minhas_postagens->fetch_assoc()) {
                        echo "<div class='post-container'>";
                        
                        // Header da postagem com foto
                        echo "<div class='post-header'>";
                        echo "<img src='uploads/" . htmlspecialchars($imagem) . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        echo "<strong><a href='perfil.php?id_usuario=" . $id_usuario . "'>" . htmlspecialchars($dados_usuario['nm_usuario']) . "</a> (usuário)</strong>";
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
                        
                        // Verificar se o usuário já curtiu esta postagem
                        $sql_curtiu = "SELECT * FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'] . " AND id_usuario = $id_usuario";
                        $result_curtiu = $conex->query($sql_curtiu);
                        $ja_curtiu = $result_curtiu->num_rows > 0;
                        
                        echo "<button class='btn-action btn-curtir " . ($ja_curtiu ? 'curtido' : '') . "' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>";
                        echo "<span class='icon-liked'></span> <span class='btn-text'>" . ($ja_curtiu ? 'Curtido' : 'Curtir') . "</span>";
                        echo "</button>";
                        
                        // Contar curtidas
                        $sql_curtidas = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                        $result_curtidas = $conex->query($sql_curtidas);
                        $curtidas = $result_curtidas->fetch_assoc();
                        echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                        
                        // Botão para excluir postagem
                        echo "<form action='excluir_postagem.php' method='POST' style='margin-left: auto;'>";
                        echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                        echo "<button type='submit' class='btn-excluir' onclick='return confirm(\"Tem certeza que deseja excluir esta postagem?\")'>Excluir Postagem</button>";
                        echo "</form>";
                        echo "</div>";
                        
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
                    echo "<p>Você ainda não fez nenhuma postagem.</p>";
                }
                ?>
            </div>

            <!-- ABA: SELETIVAS DISPONÍVEIS -->
            <div id="seletivas-disponiveis" class="aba-conteudo">
                <h2>Seletivas Disponíveis</h2>

                <?php
                // Verificar se há pesquisa de seletiva ativa
                $pesquisa_seletiva_ativa = isset($_GET['pesquisa_seletiva']) && !empty($_GET['pesquisa_seletiva']);
                $termo_pesquisa_seletiva = $pesquisa_seletiva_ativa ? $_GET['pesquisa_seletiva'] : '';
                
                if ($pesquisa_seletiva_ativa) {
                    echo "<div class='info-pesquisa'>";
                    echo "<strong>Filtro ativo:</strong> Mostrando seletivas do time \"<em>" . htmlspecialchars($termo_pesquisa_seletiva) . "</em>\"";
                    echo " | <a href='home_us.php'>Mostrar todas as seletivas</a>";
                    echo "</div>";
                }
                
                // Query base para seletivas disponíveis
                $sql_seletivas = "SELECT s.*, t.nm_time, t.img_time 
                                 FROM tb_seletiva s
                                 INNER JOIN tb_time t ON s.id_time = t.id_time
                                 WHERE s.data_seletiva >= CURDATE()";
                
                // Aplicar filtro de pesquisa por time se existir
                if ($pesquisa_seletiva_ativa) {
                    $sql_seletivas .= " AND t.nm_time LIKE ?";
                }
                
                // Aplicar filtros adicionais se existirem
                $filtros = array();
                $params = array();
                $types = "";
                
                if (isset($_GET['filtro_subcategoria']) && !empty($_GET['filtro_subcategoria'])) {
                    $filtros[] = "s.subcategoria = ?";
                    $params[] = $_GET['filtro_subcategoria'];
                    $types .= "s";
                }
                
                if (isset($_GET['filtro_categoria']) && !empty($_GET['filtro_categoria'])) {
                    $filtros[] = "s.categoria = ?";
                    $params[] = $_GET['filtro_categoria'];
                    $types .= "s";
                }
                
                if (isset($_GET['filtro_cidade']) && !empty($_GET['filtro_cidade'])) {
                    $filtros[] = "s.cidade = ?";
                    $params[] = $_GET['filtro_cidade'];
                    $types .= "s";
                }
                
                if (isset($_GET['filtro_data']) && !empty($_GET['filtro_data'])) {
                    $filtros[] = "s.data_seletiva = ?";
                    $params[] = $_GET['filtro_data'];
                    $types .= "s";
                }
                
                // Adicionar WHERE clauses se houver filtros
                if (!empty($filtros)) {
                    $sql_seletivas .= " AND " . implode(" AND ", $filtros);
                }
                
                $sql_seletivas .= " ORDER BY s.data_seletiva ASC, s.hora ASC";
                
                // Preparar e executar a query
                $stmt = $conex->prepare($sql_seletivas);
                
                if ($pesquisa_seletiva_ativa) {
                    $termo_like_seletiva = "%" . $termo_pesquisa_seletiva . "%";
                    if (!empty($params)) {
                        $stmt->bind_param("s" . $types, $termo_like_seletiva, ...$params);
                    } else {
                        $stmt->bind_param("s", $termo_like_seletiva);
                    }
                } else if (!empty($params)) {
                    $stmt->bind_param($types, ...$params);
                }
                
                $stmt->execute();
                $result_seletivas = $stmt->get_result();
                
                // Mostrar contagem de resultados
                $total_resultados = $result_seletivas->num_rows;
                echo "<p><strong>Resultados encontrados: " . $total_resultados . "</strong></p>";
                
                if ($total_resultados > 0) {
                    while ($seletiva = $result_seletivas->fetch_assoc()) {
                        echo "<div class='seletiva-container'>";
                        echo "<h3>" . htmlspecialchars($seletiva['titulo']) . "</h3>";
                        
                        // Header com foto do time
                        echo "<div class='post-header'>";
                        echo "<img src='uploads/" . htmlspecialchars($seletiva['img_time'] ?? 'default.png') . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        echo "<strong><a href='perfil.php?id_time=" . $seletiva['id_time'] . "'>" . htmlspecialchars($seletiva['nm_time']) . "</a> (time)</strong>";
                        echo "</div>";
                        echo "</div>";
                        
                        echo "<p><strong>Local:</strong> " . htmlspecialchars($seletiva['localizacao']) . "</p>";
                        echo "<p><strong>Cidade:</strong> " . htmlspecialchars($seletiva['cidade']) . "</p>";
                        echo "<p><strong>Data:</strong> " . formatarDataSemHora($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
                        echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
                        echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
                        
                        $sql_inscricao = "SELECT * FROM tb_inscricao_seletiva 
                                         WHERE id_seletiva = " . $seletiva['id_seletiva'] . " 
                                         AND id_usuario = $id_usuario";
                        $result_inscricao = $conex->query($sql_inscricao);
                        $ja_inscrito = $result_inscricao->num_rows > 0;
                        
                        echo "<div class='seletiva-actions'>";
                        if ($ja_inscrito) {
                            echo "<p style='color:green;'><strong>✅ Você já está inscrito nesta seletiva</strong></p>";
                        } else {
                            echo "<form action='inscrever_seletiva.php' method='POST'>";
                            echo "<input type='hidden' name='id_seletiva' value='" . $seletiva['id_seletiva'] . "'>";
                            echo "<button type='submit' class='btn btn-primary'>Inscrever-se</button>";
                            echo "</form>";
                        }
                        echo "</div>";
                        
                        echo "</div>";
                    }
                } else {
                    echo "<p>Nenhuma seletiva encontrada com os filtros aplicados.</p>";
                    
                    // Mostrar link para limpar filtros se houver algum filtro ativo
                    if (!empty($filtros) || $pesquisa_seletiva_ativa) {
                        echo "<p><a href='home_us.php' class='btn btn-secondary'>Limpar filtros e ver todas as seletivas</a></p>";
                    }
                }
                
                $stmt->close();
                ?>
            </div>

            <!-- ABA: MINHAS SELETIVAS -->
            <div id="minhas-seletivas" class="aba-conteudo">
                <h2>Minhas Seletivas Inscritas</h2>
                <?php
                $sql_minhas_seletivas = "SELECT s.*, t.nm_time, t.img_time, i.data_inscricao, i.status 
                                       FROM tb_inscricao_seletiva i
                                       INNER JOIN tb_seletiva s ON i.id_seletiva = s.id_seletiva
                                       INNER JOIN tb_time t ON s.id_time = t.id_time
                                       WHERE i.id_usuario = $id_usuario
                                       ORDER BY s.data_seletiva ASC";
                $result_minhas_seletivas = $conex->query($sql_minhas_seletivas);

                if ($result_minhas_seletivas->num_rows > 0) {
                    while ($seletiva = $result_minhas_seletivas->fetch_assoc()) {
                        echo "<div class='seletiva-container'>";
                        echo "<h3>" . htmlspecialchars($seletiva['titulo']) . "</h3>";
                        
                        // Header com foto do time
                        echo "<div class='post-header'>";
                        echo "<img src='uploads/" . htmlspecialchars($seletiva['img_time'] ?? 'default.png') . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        echo "<strong><a href='perfil.php?id_time=" . $seletiva['id_time'] . "'>" . htmlspecialchars($seletiva['nm_time']) . "</a> (time)</strong>";
                        echo "</div>";
                        echo "</div>";
                        
                        echo "<p><strong>Local:</strong> " . htmlspecialchars($seletiva['localizacao']) . "</p>";
                        echo "<p><strong>Data:</strong> " . formatarDataSemHora($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
                        echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
                        echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
                        echo "<p><strong>Status da Inscrição:</strong> <span style='color:";
                        echo $seletiva['status'] == 'confirmada' ? 'green' : ($seletiva['status'] == 'rejeitada' ? 'red' : 'orange');
                        echo "'>" . ucfirst($seletiva['status']) . "</span></p>";
                        echo "<p><strong>Data da Inscrição:</strong> " . formatarDataBr($seletiva['data_inscricao']) . "</p>";
                        echo "</div>";
                    }
                } else {
                    echo "<p>Você não está inscrito em nenhuma seletiva.</p>";
                }
                ?>
            </div>

            <!-- ABA: POSTAGENS CURTIDAS -->
            <div id="postagens-curtidas" class="aba-conteudo">
                <h2>Postagens Curtidas</h2>
                <?php
                $sql_curtidas = "SELECT p.*, 
                                COALESCE(u.nm_usuario, t.nm_time) as autor,
                                COALESCE(u.id_usuario, t.id_time) as id_autor,
                                COALESCE(u.img_usuario, t.img_time) as avatar,
                                CASE WHEN p.id_usuario IS NOT NULL THEN 'usuário' ELSE 'time' END as tipo_autor,
                                p.id_usuario,
                                p.id_time
                               FROM tb_postagem p
                               LEFT JOIN tb_usuario u ON p.id_usuario = u.id_usuario 
                               LEFT JOIN tb_time t ON p.id_time = t.id_time 
                               INNER JOIN tb_curtida c ON p.id_postagem = c.id_postagem
                               WHERE c.id_usuario = $id_usuario
                               ORDER BY c.data_curtida DESC";
                $result_curtidas = $conex->query($sql_curtidas);
                
                if ($result_curtidas && $result_curtidas->num_rows > 0) {
                    while ($post = $result_curtidas->fetch_assoc()) {
                        echo "<div class='post-container'>";
                        
                        // Header da postagem com foto e link para perfil
                        echo "<div class='post-header'>";
                        $avatar = $post['avatar'] ?? 'default.png';
                        echo "<img src='uploads/" . htmlspecialchars($avatar) . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        
                        // Link para o perfil
                        if ($post['tipo_autor'] == 'usuário' && $post['id_usuario']) {
                            echo "<strong><a href='perfil.php?id_usuario=" . $post['id_usuario'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
                        } else if ($post['tipo_autor'] == 'time' && $post['id_time']) {
                            echo "<strong><a href='perfil.php?id_time=" . $post['id_time'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
                        } else {
                            echo "<strong>" . htmlspecialchars($post['autor']) . " (" . $post['tipo_autor'] . ")</strong>";
                        }
                        
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
                        
                        // Botão de curtir (já estará preenchido)
                        echo "<div class='post-actions'>";
                        echo "<button class='btn-action btn-curtir curtido' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>";
                        echo "<span class='icon-liked'></span> <span class='btn-text'>Curtido</span>";
                        echo "</button>";
                        
                        // Contar curtidas
                        $sql_count = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                        $result_count = $conex->query($sql_count);
                        if ($result_count) {
                            $curtidas = $result_count->fetch_assoc();
                            echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                        }
                        
                        echo "</div>";
                        echo "</div>";
                    }
                } else {
                    echo "<p>Você ainda não curtiu nenhuma postagem.</p>";
                }
                ?>
            </div>
        </div>

        <!-- Sidebar Direita Dinâmica -->
        <div class="right-sidebar">
            <!-- Conteúdo para Home (Pesquisa de Postagens) -->
            <div id="right-home" class="right-sidebar-content ativa">
                <div class="right-pesquisa-container">
                    <h3>Buscar Postagens</h3>
                    <form method="GET" class="right-pesquisa-form">
                        <input type="hidden" name="aba" value="home">
                        <input type="text" name="pesquisa" placeholder="Digite o nome do usuário ou time..." 
                               value="<?php echo isset($_GET['pesquisa']) ? htmlspecialchars($_GET['pesquisa']) : ''; ?>">
                        <button type="submit" class="btn btn-primary">Buscar</button>
                        <?php if (isset($_GET['pesquisa']) && !empty($_GET['pesquisa'])): ?>
                            <a href="home_us.php" class="btn btn-secondary">Limpar</a>
                        <?php endif; ?>
                    </form>
                </div>
            </div>

            <!-- Conteúdo para Seletivas Disponíveis (Pesquisa e Filtros) -->
            <div id="right-seletivas" class="right-sidebar-content">
                <div class="right-pesquisa-container">
                    <h3>Buscar Seletivas</h3>
                    <form method="GET" class="right-pesquisa-form">
                        <input type="hidden" name="aba" value="seletivas-disponiveis">
                        <input type="text" name="pesquisa_seletiva" placeholder="Digite o nome do time..." 
                               value="<?php echo isset($_GET['pesquisa_seletiva']) ? htmlspecialchars($_GET['pesquisa_seletiva']) : ''; ?>">
                        <button type="submit" class="btn btn-primary">Buscar</button>
                        <?php if (isset($_GET['pesquisa_seletiva']) && !empty($_GET['pesquisa_seletiva'])): ?>
                            <a href="home_us.php" class="btn btn-secondary">Limpar</a>
                        <?php endif; ?>
                    </form>
                </div>

                <div class="right-filtro-container">
                    <h3>Filtrar Seletivas</h3>
                    <form method="GET" class="right-filtro-form">
                        <input type="hidden" name="aba" value="seletivas-disponiveis">
                        <?php if (isset($_GET['pesquisa_seletiva']) && !empty($_GET['pesquisa_seletiva'])): ?>
                            <input type="hidden" name="pesquisa_seletiva" value="<?php echo htmlspecialchars($_GET['pesquisa_seletiva']); ?>">
                        <?php endif; ?>
                        
                        <div class="right-filtro-group">
                            <label for="filtro_subcategoria">Subcategoria:</label>
                            <select id="filtro_subcategoria" name="filtro_subcategoria">
                                <option value="">Todas as subcategorias</option>
                                <option value="Sub-12" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-12') ? 'selected' : ''; ?>>Sub-12</option>
                                <option value="Sub-13" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-13') ? 'selected' : ''; ?>>Sub-13</option>
                                <option value="Sub-14" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-14') ? 'selected' : ''; ?>>Sub-14</option>
                                <option value="Sub-15" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-15') ? 'selected' : ''; ?>>Sub-15</option>
                                <option value="Sub-16" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-16') ? 'selected' : ''; ?>>Sub-16</option>
                                <option value="Sub-17" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-17') ? 'selected' : ''; ?>>Sub-17</option>
                                <option value="Sub-18" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-18') ? 'selected' : ''; ?>>Sub-18</option>
                                <option value="Sub-20" <?php echo (isset($_GET['filtro_subcategoria']) && $_GET['filtro_subcategoria'] == 'Sub-20') ? 'selected' : ''; ?>>Sub-20</option>
                            </select>
                        </div>
                        
                        <div class="right-filtro-group">
                            <label for="filtro_categoria">Esporte:</label>
                            <select id="filtro_categoria" name="filtro_categoria">
                                <option value="">Todos os esportes</option>
                                <option value="Futebol" <?php echo (isset($_GET['filtro_categoria']) && $_GET['filtro_categoria'] == 'Futebol') ? 'selected' : ''; ?>>Futebol</option>
                                <option value="Vôlei" <?php echo (isset($_GET['filtro_categoria']) && $_GET['filtro_categoria'] == 'Vôlei') ? 'selected' : ''; ?>>Vôlei</option>
                                <option value="Basquete" <?php echo (isset($_GET['filtro_categoria']) && $_GET['filtro_categoria'] == 'Basquete') ? 'selected' : ''; ?>>Basquete</option>
                                <option value="Handebol" <?php echo (isset($_GET['filtro_categoria']) && $_GET['filtro_categoria'] == 'Handebol') ? 'selected' : ''; ?>>Handebol</option>
                                <option value="Outro" <?php echo (isset($_GET['filtro_categoria']) && $_GET['filtro_categoria'] == 'Outro') ? 'selected' : ''; ?>>Outro</option>
                            </select>
                        </div>
                        
                        <div class="right-filtro-group">
                            <label for="filtro_cidade">Cidade:</label>
                            <select id="filtro_cidade" name="filtro_cidade">
                                <option value="">Todas as cidades</option>
                                <option value="São Paulo" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'São Paulo') ? 'selected' : ''; ?>>São Paulo</option>
                                <option value="Guarulhos" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Guarulhos') ? 'selected' : ''; ?>>Guarulhos</option>
                                <option value="Campinas" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Campinas') ? 'selected' : ''; ?>>Campinas</option>
                                <option value="São Bernardo do Campo" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'São Bernardo do Campo') ? 'selected' : ''; ?>>São Bernardo do Campo</option>
                                <option value="Santo André" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Santo André') ? 'selected' : ''; ?>>Santo André</option>
                                <option value="Osasco" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Osasco') ? 'selected' : ''; ?>>Osasco</option>
                                <option value="São José dos Campos" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'São José dos Campos') ? 'selected' : ''; ?>>São José dos Campos</option>
                                <option value="Ribeirão Preto" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Ribeirão Preto') ? 'selected' : ''; ?>>Ribeirão Preto</option>
                                <option value="Sorocaba" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Sorocaba') ? 'selected' : ''; ?>>Sorocaba</option>
                                <option value="Mauá" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Mauá') ? 'selected' : ''; ?>>Mauá</option>
                                <option value="São José do Rio Preto" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'São José do Rio Preto') ? 'selected' : ''; ?>>São José do Rio Preto</option>
                                <option value="Santos" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Santos') ? 'selected' : ''; ?>>Santos</option>
                                <option value="Diadema" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Diadema') ? 'selected' : ''; ?>>Diadema</option>
                                <option value="Jundiaí" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Jundiaí') ? 'selected' : ''; ?>>Jundiaí</option>
                                <option value="Piracicaba" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Piracicaba') ? 'selected' : ''; ?>>Piracicaba</option>
                                <option value="Carapicuíba" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Carapicuíba') ? 'selected' : ''; ?>>Carapicuíba</option>
                                <option value="Bauru" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Bauru') ? 'selected' : ''; ?>>Bauru</option>
                                <option value="Itaquaquecetuba" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Itaquaquecetuba') ? 'selected' : ''; ?>>Itaquaquecetuba</option>
                                <option value="São Vicente" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'São Vicente') ? 'selected' : ''; ?>>São Vicente</option>
                                <option value="Praia Grande" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Praia Grande') ? 'selected' : ''; ?>>Praia Grande</option>
                                <option value="Outra" <?php echo (isset($_GET['filtro_cidade']) && $_GET['filtro_cidade'] == 'Outra') ? 'selected' : ''; ?>>Outra</option>
                            </select>
                        </div>
                        
                        <div class="right-filtro-group">
                            <label for="filtro_data">Data da Seletiva:</label>
                            <input type="date" id="filtro_data" name="filtro_data" value="<?php echo isset($_GET['filtro_data']) ? htmlspecialchars($_GET['filtro_data']) : ''; ?>">
                        </div>
                        
                        <div class="right-filtro-acoes">
                            <button type="submit" class="btn btn-primary">Filtrar</button>
                            <a href="home_us.php" class="btn btn-secondary">Limpar</a>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Conteúdo para outras abas (vazio) -->
            <div id="right-outras" class="right-sidebar-content">
                <h3>Informações</h3>
                <p>Navegue pelas diferentes seções para ver mais opções.</p>
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
            
            // Remover active de todos os links de navegação
            document.querySelectorAll('.nav-menu a').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Mostrar aba principal selecionada
            document.getElementById(abaId).classList.add('ativa');
            event.target.classList.add('active');
            
            // Atualizar sidebar direita baseada na aba selecionada
            atualizarSidebarDireita(abaId);
        }

        // Função para atualizar a sidebar direita
        function atualizarSidebarDireita(abaId) {
            // Esconder todo o conteúdo da sidebar direita
            document.querySelectorAll('.right-sidebar-content').forEach(conteudo => {
                conteudo.classList.remove('ativa');
            });
            
            // Mostrar conteúdo apropriado baseado na aba
            switch(abaId) {
                case 'home':
                    document.getElementById('right-home').classList.add('ativa');
                    break;
                case 'seletivas-disponiveis':
                    document.getElementById('right-seletivas').classList.add('ativa');
                    break;
                default:
                    document.getElementById('right-outras').classList.add('ativa');
                    break;
            }
        }

        // Função para curtir/descurtir postagem (ESPECÍFICA PARA USUÁRIO)
        function curtirPostagem(idPostagem, elemento) {
            var formData = new FormData();
            formData.append('id_postagem', idPostagem);
            
            fetch('curtir_postagem_usuario.php', {
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

        // Formulário de postagem via AJAX
        document.getElementById('formPostagem').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const mensagemDiv = document.getElementById('mensagemPostagem');
            mensagemDiv.innerHTML = '<p style="color:blue;">⏳ Enviando postagem...</p>';
            
            fetch('criar_postagem_usuario.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                // Verifica se a resposta é JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    return response.text().then(text => {
                        throw new Error('Resposta não é JSON: ' + text.substring(0, 100));
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Resposta do servidor:', data);
                if (data.success) {
                    mensagemDiv.innerHTML = '<p style="color:green;">✅ ' + data.message + '</p>';
                    this.reset();
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    mensagemDiv.innerHTML = '<p style="color:red;">❌ ' + data.error + '</p>';
                }
            })
            .catch(error => {
                console.error('Erro completo:', error);
                mensagemDiv.innerHTML = '<p style="color:red;">❌ Erro de comunicação: ' + error.message + '</p>';
            });
        });

        // Configurar limites de data no input date
        document.addEventListener('DOMContentLoaded', function() {
            // Configurar data mínima para o filtro de data (hoje)
            const filtroData = document.getElementById('filtro_data');
            if (filtroData) {
                const hoje = new Date().toISOString().split('T')[0];
                filtroData.setAttribute('min', hoje);
            }

            // Inicializar sidebar direita
            atualizarSidebarDireita('home');
            
            // Aplicar filtros automáticos se houver parâmetros na URL
            aplicarFiltroAutomatico();
        });

        // Função para aplicar filtros automáticos ao carregar a página
        function aplicarFiltroAutomatico() {
            const urlParams = new URLSearchParams(window.location.search);
            const filtroSubcategoria = urlParams.get('filtro_subcategoria');
            const filtroCategoria = urlParams.get('filtro_categoria');
            const filtroCidade = urlParams.get('filtro_cidade');
            const filtroData = urlParams.get('filtro_data');
            const pesquisa = urlParams.get('pesquisa');
            const pesquisaSeletiva = urlParams.get('pesquisa_seletiva');
            
            // Prioridade: se houver pesquisa de postagens, mostrar home
            if (pesquisa) {
                mostrarAba('home');
                document.querySelectorAll('.nav-menu a').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelector('[onclick="mostrarAba(\'home\')"]').classList.add('active');
            }
            // Se houver pesquisa de seletivas, mostrar seletivas disponíveis
            else if (pesquisaSeletiva) {
                mostrarAba('seletivas-disponiveis');
                document.querySelectorAll('.nav-menu a').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelector('[onclick="mostrarAba(\'seletivas-disponiveis\')"]').classList.add('active');
            }
            // Se não houver pesquisa, mas houver filtros de seletiva
            else if (filtroSubcategoria || filtroCategoria || filtroCidade || filtroData) {
                mostrarAba('seletivas-disponiveis');
                document.querySelectorAll('.nav-menu a').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelector('[onclick="mostrarAba(\'seletivas-disponiveis\')"]').classList.add('active');
            }
        }
    </script>
</body>
</html>