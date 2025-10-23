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
$id_time = $_SESSION['id'];

// Puxa dados do time
$sql = "SELECT img_time, nm_time, email_time, time_cnpj, sobre_time 
        FROM tb_time WHERE id_time = $id_time";
$res = $conex->query($sql);
$dados = $res->fetch_assoc();

// Verificar se a imagem existe e usar default se não existir
$imagem = 'default.png';
if (!empty($dados['img_time']) && file_exists('uploads/' . $dados['img_time'])) {
    $imagem = $dados['img_time'];
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Área do Time - DraftMe</title>
    <link rel="stylesheet" href="hometm_style.css">
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
                    <li><a href="#" onclick="mostrarAba('minhas-postagens')"><span class="icon-profile"></span>Perfil</a></li>
                    <li><a href="#" onclick="mostrarAba('minhas-seletivas')"><span class="icon-seletivas"></span>Minhas Seletivas</a></li>
                    <li><a href="#" onclick="mostrarAba('seletivas-disponiveis')"><span class="icon-seletivas"></span>Seletivas Disponíveis</a></li>
                    <li><a href="#" onclick="mostrarAba('postagens-curtidas')"><span class="icon-liked"></span>Postagens Curtidas</a></li>
                </ul>
            </nav>

            <!-- Perfil do Time -->
            <div class="profile-card">
                <img src="uploads/<?php echo htmlspecialchars($imagem); ?>" alt="Imagem do time">
                <h3><?php echo htmlspecialchars($dados['nm_time']); ?></h3>
                <p><?php echo htmlspecialchars($dados['email_time']); ?></p>
                <a href="editar_time.php" class="btn-edit">Editar Perfil</a>
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
                    <form action="criar_postagem.php" method="POST" enctype="multipart/form-data" class="form-postagem-integrada">
                        <textarea name="texto" placeholder="O que está acontecendo?" rows="4" required></textarea>
                        
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
                </div>

                <?php
                // Verificar se há pesquisa ativa
                $pesquisa_ativa = isset($_GET['pesquisa']) && !empty($_GET['pesquisa']);
                $termo_pesquisa = $pesquisa_ativa ? $_GET['pesquisa'] : '';
                
                if ($pesquisa_ativa) {
                    echo "<div class='info-pesquisa'>";
                    echo "<strong>Filtro ativo:</strong> Mostrando postagens de \"<em>" . htmlspecialchars($termo_pesquisa) . "</em>\"";
                    echo " | <a href='home_tm.php' style='color: #1DA1F2;'>Mostrar todas as postagens</a>";
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
                            echo "<strong><a href='perfil_tm.php?id_usuario=" . $post['id_usuario'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
                        } else if ($post['tipo_autor'] == 'time' && $post['id_time']) {
                            echo "<strong><a href='perfil_tm.php?id_time=" . $post['id_time'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
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
                        echo "<button class='btn-action btn-curtir' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>";
                        echo "<span class='icon-liked'></span> <span class='btn-text'>Curtir</span>";
                        echo "</button>";
                        
                        // Contar curtidas
                        $sql_curtidas = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                        $result_curtidas = $conex->query($sql_curtidas);
                        $curtidas = $result_curtidas->fetch_assoc();
                        echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                        echo "</div>";
                        
                        // Formulário para adicionar comentário
                        echo "<div class='form-comentario'>";
                        echo "<form action='adicionar_comentario.php' method='POST'>";
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
                $sql_posts = "SELECT * FROM tb_postagem WHERE id_time = $id_time ORDER BY data_postagem DESC";
                $result_posts = $conex->query($sql_posts);

                if ($result_posts->num_rows > 0) {
                    while ($post = $result_posts->fetch_assoc()) {
                        echo "<div class='post-container'>";
                        
                        // Header da postagem com foto
                        echo "<div class='post-header'>";
                        echo "<img src='uploads/" . htmlspecialchars($imagem) . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        echo "<strong><a href='perfil_tm.php?id_time=" . $id_time . "'>" . htmlspecialchars($dados['nm_time']) . "</a> (time)</strong>";
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
                        
                        // Botão excluir
                        echo "<form action='excluir_postagem_tm.php' method='POST' style='margin-left: auto;'>";
                        echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                        echo "<button type='submit' class='btn-excluir' onclick='return confirm(\"Tem certeza que deseja excluir esta postagem?\")'>Excluir</button>";
                        echo "</form>";
                        echo "</div>";
                        
                        // Formulário para adicionar comentário
                        echo "<div class='form-comentario'>";
                        echo "<form action='adicionar_comentario.php' method='POST'>";
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
                    echo "<p>Seu time ainda não fez nenhuma postagem.</p>";
                }
                ?>
            </div>

            <!-- ABA: MINHAS SELETIVAS -->
            <div id="minhas-seletivas" class="aba-conteudo">
                <h2>Minhas Seletivas</h2>
                <?php
                // Exibir mensagens de feedback
                if (isset($_SESSION['mensagem'])) {
                    $tipo = $_SESSION['tipo_mensagem'] ?? 'info';
                    $classe = $tipo === 'success' ? 'mensagem-feedback success' : 'mensagem-feedback error';
                    echo "<div class='$classe'>" . htmlspecialchars($_SESSION['mensagem']) . "</div>";
                    unset($_SESSION['mensagem']);
                    unset($_SESSION['tipo_mensagem']);
                }

                $sql_seletivas = "SELECT * FROM tb_seletiva WHERE id_time = $id_time ORDER BY data_postagem DESC";
                $result_seletivas = $conex->query($sql_seletivas);

                if ($result_seletivas->num_rows > 0) {
                    while ($seletiva = $result_seletivas->fetch_assoc()) {
                        echo "<div class='seletiva-container'>";
                        echo "<h3>" . htmlspecialchars($seletiva['titulo']) . "</h3>";
                        echo "<p><strong>Local:</strong> " . htmlspecialchars($seletiva['localizacao']) . "</p>";
                        echo "<p><strong>Cidade:</strong> " . htmlspecialchars($seletiva['cidade']) . "</p>";
                        echo "<p><strong>Data:</strong> " . formatarDataSemHora($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
                        echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
                        echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
                        echo "<small>Criada em: " . formatarDataBr($seletiva['data_postagem']) . "</small>";
                        
                        echo "<div class='seletiva-actions'>";
                        echo "<button class='btn-detalhes' onclick='abrirModal(" . $seletiva['id_seletiva'] . ")'>Ver Inscritos</button>";
                        
                        // Botão de excluir seletiva
                        echo "<form action='excluir_seletiva.php' method='POST' style='display: inline;'>";
                        echo "<input type='hidden' name='id_seletiva' value='" . $seletiva['id_seletiva'] . "'>";
                        echo "<button type='submit' class='btn btn-danger' onclick='return confirm(\"Tem certeza que deseja excluir esta seletiva? Todas as inscrições serão perdidas.\")'>Excluir Seletiva</button>";
                        echo "</form>";
                        echo "</div>";
                        
                        echo "</div>";
                    }
                } else {
                    echo "<p>Seu time ainda não criou nenhuma seletiva.</p>";
                }
                ?>
            </div>

            <!-- ABA: SELETIVAS DISPONÍVEIS (COM CRIAR SELETIVA) -->
            <div id="seletivas-disponiveis" class="aba-conteudo">
                <h2>Seletivas Disponíveis</h2>
                
                <!-- Formulário de Criar Seletiva Integrado -->
                <div class="form-criacao-integrada">
                    <h3>Criar Seletiva</h3>
                    <form action="criar_seletiva.php" method="POST" class="form-seletiva-integrada">
                        <input type="text" name="titulo" placeholder="Título da seletiva" required>
                        <input type="text" name="localizacao" placeholder="Localização" required>
                        
                        <div class="form-grid">
                            <select name="cidade" required>
                                <option value="">Selecione uma cidade</option>
                                <option value="São Paulo">São Paulo</option>
                                <option value="Guarulhos">Guarulhos</option>
                                <option value="Campinas">Campinas</option>
                                <option value="São Bernardo do Campo">São Bernardo do Campo</option>
                                <option value="Santo André">Santo André</option>
                                <option value="Osasco">Osasco</option>
                                <option value="São José dos Campos">São José dos Campos</option>
                                <option value="Ribeirão Preto">Ribeirão Preto</option>
                                <option value="Sorocaba">Sorocaba</option>
                                <option value="Mauá">Mauá</option>
                                <option value="São José do Rio Preto">São José do Rio Preto</option>
                                <option value="Santos">Santos</option>
                                <option value="Diadema">Diadema</option>
                                <option value="Jundiaí">Jundiaí</option>
                                <option value="Piracicaba">Piracicaba</option>
                                <option value="Carapicuíba">Carapicuíba</option>
                                <option value="Bauru">Bauru</option>
                                <option value="Itaquaquecetuba">Itaquaquecetuba</option>
                                <option value="São Vicente">São Vicente</option>
                                <option value="Praia Grande">Praia Grande</option>
                                <option value="Outra">Outra</option>
                            </select>
                            
                            <input type="date" name="data_seletiva" required>
                        </div>
                        
                        <div class="form-grid">
                            <input type="time" name="hora" required>
                            
                            <select name="categoria" required>
                                <option value="Futebol">Futebol</option>
                                <option value="Vôlei">Vôlei</option>
                                <option value="Basquete">Basquete</option>
                                <option value="Handebol">Handebol</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        
                        <div class="form-grid">
                            <select name="subcategoria" required>
                                <option value="Sub-12">Sub-12</option>
                                <option value="Sub-13">Sub-13</option>
                                <option value="Sub-14">Sub-14</option>
                                <option value="Sub-15">Sub-15</option>
                                <option value="Sub-16">Sub-16</option>
                                <option value="Sub-17">Sub-17</option>
                                <option value="Sub-18">Sub-18</option>
                                <option value="Sub-20">Sub-20</option>
                            </select>
                            
                            <button type="submit" class="btn btn-primary">Criar Seletiva</button>
                        </div>
                        
                        <textarea name="sobre" placeholder="Sobre a seletiva..." rows="4" required></textarea>
                    </form>
                </div>

                <?php
                // Verificar se há pesquisa de seletiva ativa
                $pesquisa_seletiva_ativa = isset($_GET['pesquisa_seletiva']) && !empty($_GET['pesquisa_seletiva']);
                $termo_pesquisa_seletiva = $pesquisa_seletiva_ativa ? $_GET['pesquisa_seletiva'] : '';
                
                if ($pesquisa_seletiva_ativa) {
                    echo "<div class='info-pesquisa'>";
                    echo "<strong>Filtro ativo:</strong> Mostrando seletivas do time \"<em>" . htmlspecialchars($termo_pesquisa_seletiva) . "</em>\"";
                    echo " | <a href='home_tm.php' style='color: #1DA1F2;'>Mostrar todas as seletivas</a>";
                    echo "</div>";
                }
                
                // Query base para seletivas disponíveis
                $sql_seletivas_gerais = "SELECT s.*, t.nm_time, t.img_time 
                                         FROM tb_seletiva s
                                         INNER JOIN tb_time t ON s.id_time = t.id_time
                                         WHERE s.data_seletiva >= CURDATE()";
                
                // Aplicar filtro de pesquisa por time se existir
                if ($pesquisa_seletiva_ativa) {
                    $sql_seletivas_gerais .= " AND t.nm_time LIKE ?";
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
                    $sql_seletivas_gerais .= " AND " . implode(" AND ", $filtros);
                }
                
                $sql_seletivas_gerais .= " ORDER BY s.data_seletiva ASC, s.hora ASC";
                
                // Preparar e executar a query
                $stmt = $conex->prepare($sql_seletivas_gerais);
                
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
                $result_seletivas_gerais = $stmt->get_result();
                
                // Mostrar contagem de resultados
                $total_resultados = $result_seletivas_gerais->num_rows;
                echo "<p><strong>Resultados encontrados: " . $total_resultados . "</strong></p>";
                
                if ($total_resultados > 0) {
                    while ($seletiva = $result_seletivas_gerais->fetch_assoc()) {
                        echo "<div class='seletiva-container'>";
                        echo "<h3>" . htmlspecialchars($seletiva['titulo']) . "</h3>";
                        
                        // Header com foto do time
                        echo "<div class='post-header'>";
                        echo "<img src='uploads/" . htmlspecialchars($seletiva['img_time'] ?? 'default.png') . "' alt='Avatar' class='post-avatar'>";
                        echo "<div class='post-header-meta'>";
                        echo "<strong><a href='perfil_tm.php?id_time=" . $seletiva['id_time'] . "'>" . htmlspecialchars($seletiva['nm_time']) . "</a> (time)</strong>";
                        echo "</div>";
                        echo "</div>";
                        
                        echo "<p><strong>Local:</strong> " . htmlspecialchars($seletiva['localizacao']) . "</p>";
                        echo "<p><strong>Cidade:</strong> " . htmlspecialchars($seletiva['cidade']) . "</p>";
                        echo "<p><strong>Data:</strong> " . formatarDataSemHora($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
                        echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
                        echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
                        echo "<small>Postada em: " . formatarDataBr($seletiva['data_postagem']) . "</small>";
                        echo "</div>";
                    }
                } else {
                    echo "<p>Nenhuma seletiva encontrada com os filtros aplicados.</p>";
                    
                    // Mostrar link para limpar filtros se houver algum filtro ativo
                    if (!empty($filtros) || $pesquisa_seletiva_ativa) {
                        echo "<p><a href='home_tm.php' class='btn btn-secondary'>Limpar filtros e ver todas as seletivas</a></p>";
                    }
                }
                
                $stmt->close();
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
                               WHERE c.id_time = $id_time
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
                            echo "<strong><a href='perfil_tm.php?id_usuario=" . $post['id_usuario'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
                        } else if ($post['tipo_autor'] == 'time' && $post['id_time']) {
                            echo "<strong><a href='perfil_tm.php?id_time=" . $post['id_time'] . "'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong>";
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
                    echo "<p>Seu time ainda não curtiu nenhuma postagem.</p>";
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
                            <a href="home_tm.php" class="btn btn-secondary">Limpar</a>
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
                            <a href="home_tm.php" class="btn btn-secondary">Limpar</a>
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
                            <a href="home_tm.php" class="btn btn-secondary">Limpar</a>
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

    <!-- Modal para exibir inscritos -->
    <div id="modalInscritos" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Inscritos na Seletiva</h2>
            <div id="conteudoInscritos"></div>
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

        // Função para abrir o modal e carregar os inscritos
        function abrirModal(idSeletiva) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById("conteudoInscritos").innerHTML = this.responseText;
                    document.getElementById("modalInscritos").style.display = "block";
                }
            };
            xhr.open("GET", "buscar_inscritos.php?id_seletiva=" + idSeletiva, true);
            xhr.send();
        }

        // Fechar o modal quando clicar no X - CORREÇÃO
        document.querySelector(".close").onclick = function() {
            document.getElementById("modalInscritos").style.display = "none";
        }

        // Fechar o modal quando clicar fora dele - CORREÇÃO
        window.onclick = function(event) {
            var modal = document.getElementById("modalInscritos");
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        // Função para curtir/descurtir postagem (ESPECÍFICA PARA TIME)
        function curtirPostagem(idPostagem, elemento) {
            var formData = new FormData();
            formData.append('id_postagem', idPostagem);
            
            fetch('curtir_postagem_time.php', {
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

        // Configurar limites de data no input date
        document.addEventListener('DOMContentLoaded', function() {
            const dataInput = document.querySelector('input[name="data_seletiva"]');
            if (dataInput) {
                const hoje = new Date();
                const fimProximoAno = new Date();
                fimProximoAno.setFullYear(hoje.getFullYear() + 1, 11, 31);
                
                // Formatar datas para YYYY-MM-DD
                const hojeFormatado = hoje.toISOString().split('T')[0];
                const fimProximoAnoFormatado = fimProximoAno.toISOString().split('T')[0];
                
                dataInput.setAttribute('min', hojeFormatado);
                dataInput.setAttribute('max', fimProximoAnoFormatado);
            }

            // GARANTIR QUE O MODAL INICIE FECHADO
            document.getElementById("modalInscritos").style.display = "none";

            // Configurar data mínima para o filtro de data (hoje)
            const filtroData = document.getElementById('filtro_data');
            if (filtroData) {
                const hoje = new Date().toISOString().split('T')[0];
                filtroData.setAttribute('min', hoje);
            }

            // Inicializar sidebar direita
            atualizarSidebarDireita('home');
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

        // Executar quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            aplicarFiltroAutomatico();
        });
    </script>
</body>
</html>