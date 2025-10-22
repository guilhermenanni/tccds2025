<?php
session_start();
if (!isset($_SESSION['id'])) {
    header("Location: login.php");
    exit;
}

include('conex.php');
$id_time = $_SESSION['id'];

// Puxa dados do time
$sql = "SELECT img_time, nm_time, email_time, time_cnpj, sobre_time 
        FROM tb_time WHERE id_time = $id_time";
$res = $conex->query($sql);
$dados = $res->fetch_assoc();
$imagem = $dados['img_time'] ?? 'default.png'; 
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Área do Time - DraftMe</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }

        /* Estilos para o sistema de filtro */
        .filtro-container {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
        }

        .filtro-form {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: end;
        }

        .filtro-group {
            flex: 1;
            min-width: 150px;
        }

        .filtro-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }

        .filtro-group select,
        .filtro-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }

        .btn-filtrar {
            background-color: #2196F3;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-filtrar:hover {
            background-color: #0b7dda;
        }

        .btn-limpar {
            background-color: #6c757d;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
        }

        .btn-limpar:hover {
            background-color: #5a6268;
        }

        .filtro-acoes {
            display: flex;
            gap: 10px;
        }

        /* Estilos para a barra de pesquisa */
        .pesquisa-container {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
        }

        .pesquisa-form {
            margin-top: 10px;
        }

        .info-pesquisa {
            background-color: #e8f4fd;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            border-left: 4px solid #2196F3;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .time-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .time-info {
            flex: 1;
        }
        .time-img {
            margin-left: 20px;
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
        .btn-danger {
            background-color: #f44336;
        }
        .btn-danger:hover {
            background-color: #d32f2f;
        }
        .post-container {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        .seletiva-container {
            border: 2px solid #4CAF50;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            background-color: #f0fff0;
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
        .btn-comentar {
            background-color: #4CAF50;
            color: white;
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn-comentar:hover {
            background-color: #45a049;
        }
        .btn-inscrever {
            background-color: #4CAF50;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        .btn-inscrever:hover {
            background-color: #45a049;
        }
        .btn-detalhes {
            background-color: #2196F3;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            margin-left: 10px;
        }
        .btn-detalhes:hover {
            background-color: #0b7dda;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
            background-color: #fefefe;
            margin: 10% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
            border-radius: 5px;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        .inscrito-item {
            padding: 8px;
            margin-bottom: 8px;
            background-color: #f9f9f9;
            border-radius: 4px;
            border-left: 3px solid #4CAF50;
        }
        .aba-curtidas {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .aba-header {
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .aba-conteudo {
            display: none;
            margin-top: 10px;
        }
        .aba-conteudo.ativa {
            display: block;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            flex-wrap: wrap;
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
        .form-postagem {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .form-postagem textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
        }
        .form-postagem input[type="text"],
        .form-postagem input[type="file"] {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .upload-container {
            margin-top: 20px;
            padding: 15px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bem-vindo, <?php echo htmlspecialchars($dados['nm_time']); ?>!</h1>

        <div class="tabs">
            <div class="tab ativa" onclick="mostrarAba('criar-postagem')">Criar Postagem</div>
            <div class="tab" onclick="mostrarAba('criar-seletiva')">Criar Seletiva</div>
            <div class="tab" onclick="mostrarAba('minhas-postagens')">Minhas Postagens</div>
            <div class="tab" onclick="mostrarAba('minhas-seletivas')">Minhas Seletivas</div>
            <div class="tab" onclick="mostrarAba('postagens-gerais')">Postagens Gerais</div>
            <div class="tab" onclick="mostrarAba('seletivas-disponiveis')">Seletivas Disponíveis</div>
            <div class="tab" onclick="mostrarAba('postagens-curtidas')">Postagens Curtidas</div>
        </div>

        <!-- ABA: CRIAR POSTAGEM -->
        <div id="criar-postagem" class="aba-conteudo ativa">
            <h2>Nova Postagem</h2>
            <div class="form-postagem">
                <form action="criar_postagem.php" method="POST" enctype="multipart/form-data">
                    <label>Texto da postagem:</label><br>
                    <textarea name="texto" rows="4" cols="50" required></textarea><br>

                    <label>Imagem da postagem (opcional):</label><br>
                    <input type="file" name="imagem" accept="image/*"><br>

                    <label>Categoria:</label><br>
                    <input type="text" name="categoria" required><br>

                    <label>Tag:</label><br>
                    <input type="text" name="tag"><br>

                    <button type="submit" class="btn">Postar</button>
                </form>
            </div>
        </div>

        <!-- ABA: CRIAR SELETIVA -->
        <div id="criar-seletiva" class="aba-conteudo">
            <h2>Nova Seletiva</h2>
            <div class="form-postagem">
                <form action="criar_seletiva.php" method="POST">
                    <label>Título da seletiva:</label><br>
                    <input type="text" name="titulo" required><br>

                    <label>Localização:</label><br>
                    <input type="text" name="localizacao" required><br>

                    <label>Cidade:</label><br>
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
                    </select><br>

                    <label>Data:</label><br>
                    <input type="date" name="data_seletiva" required><br>

                    <label>Hora:</label><br>
                    <input type="time" name="hora" required><br>

                    <label>Categoria:</label><br>
                    <select name="categoria" required>
                        <option value="Futebol">Futebol</option>
                        <option value="Vôlei">Vôlei</option>
                        <option value="Basquete">Basquete</option>
                        <option value="Handebol">Handebol</option>
                        <option value="Outro">Outro</option>
                    </select><br>

                    <label>Subcategoria (ex: Sub-12, Sub-13):</label><br>
                    <select name="subcategoria" required>
        <option value="Sub-12">Sub-12</option>
        <option value="Sub-13">Sub-13</option>
        <option value="Sub-14">Sub-14</option>
        <option value="Sub-15">Sub-15</option>
        <option value="Sub-16">Sub-16</option>
        <option value="Sub-17">Sub-17</option>
        <option value="Sub-18">Sub-18</option>
        <option value="Sub-20">Sub-20</option>
                    </select><br>

                    <label>Sobre a seletiva:</label><br>
                    <textarea name="sobre" rows="4" cols="50" required></textarea><br>

                    <button type="submit" class="btn">Criar Seletiva</button>
                </form>
            </div>
        </div>

        <!-- ABA: MINHAS POSTAGENS -->
        <div id="minhas-postagens" class="aba-conteudo">
            <!-- Dados do Time -->
            <div class="time-header">
                <div class="time-info">
                    <h2>Dados do Time</h2>
                    <p><strong>Email:</strong> <?php echo htmlspecialchars($dados['email_time']); ?></p>
                    <p><strong>CNPJ:</strong> <?php echo htmlspecialchars($dados['time_cnpj']); ?></p>
                    <?php if (!empty($dados['sobre_time']) && trim($dados['sobre_time']) !== ''): ?>
        <p><strong>Sobre:</strong> <?php echo nl2br(htmlspecialchars($dados['sobre_time'])); ?></p>
    <?php else: ?>
        <p><strong>Sobre:</strong> <em>Nenhuma descrição adicionada ainda.</em></p>
    <?php endif; ?>

                                <!-- Botão para editar informações do time -->
            <a href="editar_time.php" class="btn" style="margin-top: 15px; display: inline-block;">
                <i class='bx bx-edit'></i> Editar Informações do Time
            </a>

                </div>
                <div class="time-img">
                    <img src="uploads/<?php echo htmlspecialchars($imagem); ?>" alt="Imagem do time" width="150">
                </div>
            </div>

            <!-- Postagens do Time -->
            <h2>Postagens do Seu Time</h2>
            <?php
            $sql_posts = "SELECT * FROM tb_postagem WHERE id_time = $id_time ORDER BY data_postagem DESC";
            $result_posts = $conex->query($sql_posts);

            if ($result_posts->num_rows > 0) {
                while ($post = $result_posts->fetch_assoc()) {
                    echo "<div class='post-container'>";
                    echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                    echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                    echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                    if (!empty($post['img_postagem'])) {
                        echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
                    }

                    echo "<small>Postado em: " . $post['data_postagem'] . "</small>";
                    
                    // Botão de curtir e contador
                    echo "<div class='curtida-container'>";
                    echo "<button class='btn-curtir' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>🤍</button>";
                    
                    // Contar curtidas
                    $sql_curtidas = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                    $result_curtidas = $conex->query($sql_curtidas);
                    $curtidas = $result_curtidas->fetch_assoc();
                    echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                    
                    echo "</div>";

                    // adicione o estilizar ae pfv
                    echo "<form action='excluir_postagem_tm.php' method='POST' style='margin-top: 10px;'>";
                    echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                    echo "<button type='submit' class='btn-excluir' onclick='return confirm(\"Tem certeza que deseja excluir esta postagem?\")'>Excluir Postagem</button>";
                    echo "</form>";
                    
                    // Formulário para adicionar comentário
                    echo "<div class='form-comentario'>";
                    echo "<form action='adicionar_comentario.php' method='POST'>";
                    echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                    echo "<textarea name='texto_comentario' rows='2' cols='40' placeholder='Adicione um comentário...' required></textarea>";
                    echo "<button type='submit' class='btn-comentar'>Comentar</button>";
                    echo "</form>";
                    echo "</div>";
                    
                    // Exibir comentários existentes
                    $id_postagem = $post['id_postagem'];
                    $sql_comentarios = "SELECT c.*, 
                                       COALESCE(u.nm_usuario, t.nm_time) as autor,
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
                            echo "<div class='comentario'>";
                            echo "<strong>" . htmlspecialchars($comentario['autor']) . " (" . $comentario['tipo_autor'] . "):</strong> ";
                            echo htmlspecialchars($comentario['texto_comentario']);
                            echo "<br><small>Em: " . $comentario['data_comentario'] . "</small>";
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

<div id="minhas-seletivas" class="aba-conteudo">
    <!-- Dados do Time -->
    <div class="time-header">
        <div class="time-info">
    <h2>Dados do Time</h2>
    <p><strong>Email:</strong> <?php echo htmlspecialchars($dados['email_time']); ?></p>
    <p><strong>CNPJ:</strong> <?php echo htmlspecialchars($dados['time_cnpj']); ?></p>
    <?php if (!empty($dados['sobre_time'])): ?>
        <p><strong>Sobre:</strong> <?php echo nl2br(htmlspecialchars($dados['sobre_time'])); ?></p>
    <?php else: ?>
        <p><strong>Sobre:</strong> <em>Nenhuma descrição adicionada ainda.</em></p>
    <?php endif; ?>
            
            <!-- Botão para editar informações do time -->
            <a href="editar_time.php" class="btn" style="margin-top: 15px; display: inline-block;">
                <i class='bx bx-edit'></i> Editar Informações do Time
            </a>
        </div>
        <div class="time-img">
            <img src="uploads/<?php echo htmlspecialchars($imagem); ?>" alt="Imagem do time" width="150">
        </div>
    </div>



<!-- Seletivas do Time -->
<h2>Suas Seletivas</h2>
<?php
// Exibir mensagens de feedback
if (isset($_SESSION['mensagem'])) {
    $tipo = $_SESSION['tipo_mensagem'] ?? 'info';
    $classe = $tipo === 'success' ? 'style="color: green; padding: 10px; background-color: #e8f5e8; border-radius: 4px;"' : 'style="color: red; padding: 10px; background-color: #ffe8e8; border-radius: 4px;"';
    echo "<div $classe>" . htmlspecialchars($_SESSION['mensagem']) . "</div>";
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
        echo "<p><strong>Data:</strong> " . htmlspecialchars($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
        echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
        echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
        echo "<small>Criada em: " . $seletiva['data_postagem'] . "</small>";
        
        echo "<div style='margin-top: 15px;'>";
        echo "<button class='btn-detalhes' onclick='abrirModal(" . $seletiva['id_seletiva'] . ")'>Ver Inscritos</button>";
        
        // Botão de excluir seletiva
        echo "<form action='excluir_seletiva.php' method='POST' style='display: inline-block; margin-left: 10px;'>";
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

        <!-- ABA: POSTAGENS GERAIS -->
        <div id="postagens-gerais" class="aba-conteudo">
            <h2>Postagens Gerais (Usuários e Times)</h2>
            
            <!-- Barra de Pesquisa para Postagens -->
            <div class="pesquisa-container">
                <h3>Buscar Postagens por Usuário ou Time</h3>
                <form method="GET" class="pesquisa-form">
                    <input type="hidden" name="aba" value="postagens-gerais">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" name="pesquisa" placeholder="Digite o nome do usuário ou time..." 
                               value="<?php echo isset($_GET['pesquisa']) ? htmlspecialchars($_GET['pesquisa']) : ''; ?>" 
                               style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        <button type="submit" class="btn" style="padding: 10px 20px;">Buscar</button>
                        <?php if (isset($_GET['pesquisa']) && !empty($_GET['pesquisa'])): ?>
                            <a href="home_tm.php" class="btn-limpar" style="padding: 10px 20px;">Limpar Busca</a>
                        <?php endif; ?>
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
                echo " | <a href='home_tm.php' style='color: #2196F3;'>Mostrar todas as postagens</a>";
                echo "</div>";
            }
            
            // Query base para postagens gerais
            $sql_posts_gerais = "SELECT p.*, 
                                COALESCE(u.nm_usuario, t.nm_time) as autor,
                                CASE WHEN p.id_usuario IS NOT NULL THEN 'usuário' ELSE 'time' END as tipo_autor
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
                    echo "<strong>" . htmlspecialchars($post['autor']) . " (" . $post['tipo_autor'] . ")</strong><br>";
                    echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                    echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                    echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                    if (!empty($post['img_postagem'])) {
                        echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
                    }

                    echo "<small>Postado em: " . $post['data_postagem'] . "</small>";
                    
                    // Botão de curtir e contador
                    echo "<div class='curtida-container'>";
                    echo "<button class='btn-curtir' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>🤍</button>";
                    
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
                    echo "<textarea name='texto_comentario' rows='2' cols='40' placeholder='Adicione um comentário...' required></textarea>";
                    echo "<button type='submit' class='btn-comentar'>Comentar</button>";
                    echo "</form>";
                    echo "</div>";
                    
                    // Exibir comentários existentes
                    $id_postagem = $post['id_postagem'];
                    $sql_comentarios = "SELECT c.*, 
                                       COALESCE(u.nm_usuario, t.nm_time) as autor,
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
                            echo "<div class='comentario'>";
                            echo "<strong>" . htmlspecialchars($comentario['autor']) . " (" . $comentario['tipo_autor'] . "):</strong> ";
                            echo htmlspecialchars($comentario['texto_comentario']);
                            echo "<br><small>Em: " . $comentario['data_comentario'] . "</small>";
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
                    echo "<p>Ainda não existem postagens gerais.</p>";
                }
            }
            
            $stmt->close();
            ?>
        </div>

<!-- ABA: SELETIVAS DISPONÍVEIS -->
<div id="seletivas-disponiveis" class="aba-conteudo">
    <h2>Seletivas Disponíveis</h2>
    
    <!-- Barra de Pesquisa para Seletivas -->
    <div class="pesquisa-container">
        <h3>Buscar Seletivas por Time</h3>
        <form method="GET" class="pesquisa-form">
            <input type="hidden" name="aba" value="seletivas-disponiveis">
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" name="pesquisa_seletiva" placeholder="Digite o nome do time..." 
                       value="<?php echo isset($_GET['pesquisa_seletiva']) ? htmlspecialchars($_GET['pesquisa_seletiva']) : ''; ?>" 
                       style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <button type="submit" class="btn" style="padding: 10px 20px;">Buscar</button>
                <?php if (isset($_GET['pesquisa_seletiva']) && !empty($_GET['pesquisa_seletiva'])): ?>
                    <a href="home_tm.php" class="btn-limpar" style="padding: 10px 20px;">Limpar Busca</a>
                <?php endif; ?>
            </div>
        </form>
    </div>
    
    <!-- Sistema de Filtro -->
    <div class="filtro-container">
        <form method="GET" class="filtro-form">
            <input type="hidden" name="aba" value="seletivas-disponiveis">
            <?php if (isset($_GET['pesquisa_seletiva']) && !empty($_GET['pesquisa_seletiva'])): ?>
                <input type="hidden" name="pesquisa_seletiva" value="<?php echo htmlspecialchars($_GET['pesquisa_seletiva']); ?>">
            <?php endif; ?>
            
            <div class="filtro-group">
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
            
            <div class="filtro-group">
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
            
            <div class="filtro-group">
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
            
            <div class="filtro-group">
                <label for="filtro_data">Data da Seletiva:</label>
                <input type="date" id="filtro_data" name="filtro_data" value="<?php echo isset($_GET['filtro_data']) ? htmlspecialchars($_GET['filtro_data']) : ''; ?>">
            </div>
            
            <div class="filtro-acoes">
                <button type="submit" class="btn-filtrar">Filtrar</button>
                <a href="home_tm.php" class="btn-limpar">Limpar Filtros</a>
            </div>
        </form>
    </div>

    <?php
    // Verificar se há pesquisa de seletiva ativa
    $pesquisa_seletiva_ativa = isset($_GET['pesquisa_seletiva']) && !empty($_GET['pesquisa_seletiva']);
    $termo_pesquisa_seletiva = $pesquisa_seletiva_ativa ? $_GET['pesquisa_seletiva'] : '';
    
    if ($pesquisa_seletiva_ativa) {
        echo "<div class='info-pesquisa'>";
        echo "<strong>Filtro ativo:</strong> Mostrando seletivas do time \"<em>" . htmlspecialchars($termo_pesquisa_seletiva) . "</em>\"";
        echo " | <a href='home_tm.php' style='color: #2196F3;'>Mostrar todas as seletivas</a>";
        echo "</div>";
    }
    
    // Query base para seletivas disponíveis
    $sql_seletivas_gerais = "SELECT s.*, t.nm_time 
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
            echo "<p><strong>Time:</strong> " . htmlspecialchars($seletiva['nm_time']) . "</p>";
            echo "<p><strong>Local:</strong> " . htmlspecialchars($seletiva['localizacao']) . "</p>";
            echo "<p><strong>Cidade:</strong> " . htmlspecialchars($seletiva['cidade']) . "</p>";
            echo "<p><strong>Data:</strong> " . htmlspecialchars($seletiva['data_seletiva']) . " às " . htmlspecialchars($seletiva['hora']) . "</p>";
            echo "<p><strong>Categoria:</strong> " . htmlspecialchars($seletiva['categoria']) . " - " . htmlspecialchars($seletiva['subcategoria']) . "</p>";
            echo "<p><strong>Sobre:</strong> " . nl2br(htmlspecialchars($seletiva['sobre'])) . "</p>";
            echo "<small>Postada em: " . $seletiva['data_postagem'] . "</small>";
            echo "</div>";
        }
    } else {
        echo "<p>Nenhuma seletiva encontrada com os filtros aplicados.</p>";
        
        // Mostrar link para limpar filtros se houver algum filtro ativo
        if (!empty($filtros) || $pesquisa_seletiva_ativa) {
            echo "<p><a href='home_tm.php' class='btn-limpar'>Limpar filtros e ver todas as seletivas</a></p>";
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
                            CASE WHEN p.id_usuario IS NOT NULL THEN 'usuário' ELSE 'time' END as tipo_autor
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
                    echo "<strong>" . htmlspecialchars($post['autor']) . " (" . $post['tipo_autor'] . ")</strong><br>";
                    echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                    echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                    echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                    if (!empty($post['img_postagem'])) {
                        echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
                    }

                    echo "<small>Postado em: " . $post['data_postagem'] . "</small>";
                    
                    // Botão de curtir (já estará preenchido)
                    echo "<div class='curtida-container'>";
                    echo "<button class='btn-curtir curtido' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>❤️</button>";
                    
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

        <div style="margin-top: 20px;">
            <a href="logout.php" class="btn btn-danger">Sair da Conta</a>
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
            document.querySelectorAll('.aba-conteudo').forEach(aba => {
                aba.classList.remove('ativa');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('ativa');
            });
            document.getElementById(abaId).classList.add('ativa');
            event.target.classList.add('ativa');
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

        // Fechar o modal quando clicar no X
        document.getElementsByClassName("close")[0].onclick = function() {
            document.getElementById("modalInscritos").style.display = "none";
        }

        // Fechar o modal quando clicar fora dele
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
        
        // Função para validar data da seletiva no formulário
        function validarDataSeletiva() {
            const dataInput = document.getElementById('data_seletiva');
            const dataSeletiva = new Date(dataInput.value);
            const hoje = new Date();
            const fimProximoAno = new Date();
            fimProximoAno.setFullYear(hoje.getFullYear() + 1, 11, 31); // 31 de dezembro do próximo ano
            
            // Reset do horário para comparar apenas a data
            hoje.setHours(0, 0, 0, 0);
            dataSeletiva.setHours(0, 0, 0, 0);
            fimProximoAno.setHours(0, 0, 0, 0);
            
            if (dataSeletiva < hoje) {
                alert('A data da seletiva não pode ser anterior ao dia atual.');
                dataInput.focus();
                return false;
            }
            
            if (dataSeletiva > fimProximoAno) {
                alert('A data da seletiva não pode ser após 31 de dezembro do próximo ano.');
                dataInput.focus();
                return false;
            }
            
            return true;
        }

        // Configurar limites de data no input date
        document.addEventListener('DOMContentLoaded', function() {
            const dataInput = document.getElementById('data_seletiva');
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
            
            // Prioridade: se houver pesquisa de postagens, mostrar postagens gerais
            if (pesquisa) {
                mostrarAba('postagens-gerais');
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('ativa');
                });
                document.querySelector('[onclick="mostrarAba(\'postagens-gerais\')"]').classList.add('ativa');
            }
            // Se houver pesquisa de seletivas, mostrar seletivas disponíveis
            else if (pesquisaSeletiva) {
                mostrarAba('seletivas-disponiveis');
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('ativa');
                });
                document.querySelector('[onclick="mostrarAba(\'seletivas-disponiveis\')"]').classList.add('ativa');
            }
            // Se não houver pesquisa, mas houver filtros de seletiva
            else if (filtroSubcategoria || filtroCategoria || filtroCidade || filtroData) {
                mostrarAba('seletivas-disponiveis');
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('ativa');
                });
                document.querySelector('[onclick="mostrarAba(\'seletivas-disponiveis\')"]').classList.add('ativa');
            }
        }

        // Executar quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            aplicarFiltroAutomatico();
            
            // Configurar data mínima para o filtro de data (hoje)
            const filtroData = document.getElementById('filtro_data');
            if (filtroData) {
                const hoje = new Date().toISOString().split('T')[0];
                filtroData.setAttribute('min', hoje);
            }
            
            // Verificar estado inicial das curtidas
            var botoesCurtir = document.querySelectorAll('.btn-curtir');
            
            botoesCurtir.forEach(function(botao) {
                var idPostagem = botao.getAttribute('data-id');
                
                fetch('verificar_curtida_time.php?id_postagem=' + idPostagem)
                .then(response => response.json())
                .then(data => {
                    if (data.curtiu) {
                        botao.classList.add('curtido');
                        botao.innerHTML = '❤️';
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar curtida:', error);
                });
            });
        });
    </script>
</body>
</html>