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


?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Área do Usuário - DraftMe</title>
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
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .user-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .user-info {
            flex: 1;
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
        .aba-curtidas, .aba-seletivas {
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
        .btn-excluir {
            background-color: #f44336;
            color: white;
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        .btn-excluir:hover {
            background-color: #d32f2f;
        }
        /* Novos estilos para fotos de perfil */
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
        .user-img img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="user-header">
            <div class="user-info">
                <h1>Bem-vindo, <?php echo htmlspecialchars($_SESSION['nome']); ?>!</h1>
                <p><strong>Email:</strong> <?php echo htmlspecialchars($_SESSION['email']); ?></p>
            </div>
            <a href="logout.php" class="btn btn-danger">Sair</a>
        </div>

        <div class="tabs">
            <div class="tab ativa" onclick="mostrarAba('criar-postagem')">Criar Postagem</div>
            <div class="tab" onclick="mostrarAba('minhas-postagens')">Minhas Postagens</div>
            <div class="tab" onclick="mostrarAba('seletivas-disponiveis')">Seletivas Disponíveis</div>
            <div class="tab" onclick="mostrarAba('minhas-seletivas')">Minhas Seletivas</div>
            <div class="tab" onclick="mostrarAba('postagens')">Postagens Gerais</div>
            <div class="tab" onclick="mostrarAba('curtidas')">Postagens Curtidas</div>
        </div>

        <!-- ABA: CRIAR POSTAGEM -->
        <div id="criar-postagem" class="aba-conteudo ativa">
            <h2>Criar Nova Postagem</h2>
            <div class="form-postagem">
                <form id="formPostagem" enctype="multipart/form-data">
                    <label>Texto da postagem:</label><br>
                    <textarea name="texto" rows="4" placeholder="O que você está pensando?" required></textarea><br>
                    
                    <label>Imagem da postagem (opcional):</label><br>
                    <input type="file" name="imagem" accept="image/*"><br>
                    
                    <label>Categoria:</label><br>
                    <input type="text" name="categoria" placeholder="Ex: Notícia, Evento, etc." required><br>
                    
                    <label>Tag:</label><br>
                    <input type="text" name="tag" placeholder="Ex: #futebol #treino"><br>
                    
                    <button type="submit" class="btn">Publicar Postagem</button>
                </form>
                <div id="mensagemPostagem"></div>
            </div>
        </div>

<!-- ABA: MINHAS POSTAGENS -->
<div id="minhas-postagens" class="aba-conteudo">
    <!-- Dados do Usuário -->
    <div class="user-header">
        <div class="user-info">
            <h2>Dados do Usuário</h2>
            <p><strong>Nome:</strong> <?php echo htmlspecialchars($dados_usuario['nm_usuario']); ?></p>
            <p><strong>Email:</strong> <?php echo htmlspecialchars($dados_usuario['email_usuario']); ?></p>
            <p><strong>CPF:</strong> <?php echo htmlspecialchars($dados_usuario['cpf_usuario']); ?></p>
            <p><strong>Data de Nascimento:</strong> <?php echo formatarDataSemHora($dados_usuario['dt_nasc_usuario']); ?></p>
            <p><strong>Telefone:</strong> <?php echo htmlspecialchars($dados_usuario['tel_usuario'] ?? 'Não informado'); ?></p>
            
            <?php if (!empty($dados_usuario['sobre']) && trim($dados_usuario['sobre']) !== ''): ?>
                <p><strong>Sobre:</strong> <?php echo nl2br(htmlspecialchars($dados_usuario['sobre'])); ?></p>
            <?php else: ?>
                <p><strong>Sobre:</strong> <em>Nenhuma descrição adicionada ainda.</em></p>
            <?php endif; ?>
            <!-- Botão para editar informações do usuário -->
            <a href="editar_usuario.php" class="btn" style="margin-top: 15px; display: inline-block;">
                <i class='bx bx-edit'></i> Editar Informações
            </a>
        </div>
        <div class="user-img">
            <img src="uploads/<?php echo htmlspecialchars($dados_usuario['img_usuario'] ?? 'default.png'); ?>" alt="Imagem do usuário">
        </div>
    </div>

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
                    echo "<img src='uploads/" . htmlspecialchars($dados_usuario['img_usuario'] ?? 'default.png') . "' alt='Avatar' class='post-avatar'>";
                    echo "<div>";
                    echo "<strong><a href='perfil.php?id_usuario=" . $id_usuario . "' style='color: #333; text-decoration: none;'>" . htmlspecialchars($dados_usuario['nm_usuario']) . "</a> (usuário)</strong><br>";
                    echo "<small>" . formatarDataBr($post['data_postagem']) . "</small>";
                    echo "</div>";
                    echo "</div>";
                    
                    echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                    echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                    echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                    if (!empty($post['img_postagem'])) {
                        echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
                    }

                    echo "<small>Postado em: " . formatarDataBr($post['data_postagem']) . "</small>";
                    
                    // Botão de curtir e contador
                    echo "<div class='curtida-container'>";
                    echo "<button class='btn-curtir' data-id='" . $post['id_postagem'] . "' onclick='curtirPostagem(" . $post['id_postagem'] . ", this)'>🤍</button>";
                    
                    // Contar curtidas
                    $sql_curtidas = "SELECT COUNT(*) as total FROM tb_curtida WHERE id_postagem = " . $post['id_postagem'];
                    $result_curtidas = $conex->query($sql_curtidas);
                    $curtidas = $result_curtidas->fetch_assoc();
                    echo "<span class='contador-curtidas'>" . $curtidas['total'] . " curtida(s)</span>";
                    
                    echo "</div>";
                    
                    // Botão para excluir postagem
                    echo "<form action='excluir_postagem.php' method='POST' style='margin-top: 10px;'>";
                    echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                    echo "<button type='submit' class='btn-excluir' onclick='return confirm(\"Tem certeza que deseja excluir esta postagem?\")'>Excluir Postagem</button>";
                    echo "</form>";
                    
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
                            echo "<br><small>Em: " . formatarDataBr($comentario['data_comentario']) . "</small>";
                            echo "</div>";
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
                    <a href="home_us.php" class="btn-limpar" style="padding: 10px 20px;">Limpar Busca</a>
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
                <a href="home_us.php" class="btn-limpar">Limpar Filtros</a>
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
        echo " | <a href='home_us.php' style='color: #2196F3;'>Mostrar todas as seletivas</a>";
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
            echo "<div>";
            echo "<strong><a href='perfil.php?id_time=" . $seletiva['id_time'] . "' style='color: #333; text-decoration: none;'>" . htmlspecialchars($seletiva['nm_time']) . "</a> (time)</strong><br>";
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
            
            if ($ja_inscrito) {
                echo "<p style='color:green;'><strong>✅ Você já está inscrito nesta seletiva</strong></p>";
            } else {
                echo "<form action='inscrever_seletiva.php' method='POST'>";
                echo "<input type='hidden' name='id_seletiva' value='" . $seletiva['id_seletiva'] . "'>";
                echo "<button type='submit' class='btn-inscrever'>Inscrever-se</button>";
                echo "</form>";
            }
            
            echo "</div>";
        }
    } else {
        echo "<p>Nenhuma seletiva encontrada com os filtros aplicados.</p>";
        
        // Mostrar link para limpar filtros se houver algum filtro ativo
        if (!empty($filtros) || $pesquisa_seletiva_ativa) {
            echo "<p><a href='home_us.php' class='btn-limpar'>Limpar filtros e ver todas as seletivas</a></p>";
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
                    echo "<div>";
                    echo "<strong><a href='perfil.php?id_time=" . $seletiva['id_time'] . "' style='color: #333; text-decoration: none;'>" . htmlspecialchars($seletiva['nm_time']) . "</a> (time)</strong><br>";
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

        <!-- ABA: POSTAGENS GERAIS -->
        <div id="postagens" class="aba-conteudo">
            <h2>Postagens Gerais</h2>
            
            <!-- Barra de Pesquisa para Postagens -->
            <div class="pesquisa-container">
                <h3>Buscar Postagens por Usuário ou Time</h3>
                <form method="GET" class="pesquisa-form">
                    <input type="hidden" name="aba" value="postagens">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" name="pesquisa" placeholder="Digite o nome do usuário ou time..." 
                               value="<?php echo isset($_GET['pesquisa']) ? htmlspecialchars($_GET['pesquisa']) : ''; ?>" 
                               style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        <button type="submit" class="btn" style="padding: 10px 20px;">Buscar</button>
                        <?php if (isset($_GET['pesquisa']) && !empty($_GET['pesquisa'])): ?>
                            <a href="home_us.php" class="btn-limpar" style="padding: 10px 20px;">Limpar Busca</a>
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
                echo " | <a href='home_us.php' style='color: #2196F3;'>Mostrar todas as postagens</a>";
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
                    echo "<div>";
                    
                    // Link para o perfil
                    if ($post['tipo_autor'] == 'usuário' && $post['id_usuario']) {
                        echo "<strong><a href='perfil.php?id_usuario=" . $post['id_usuario'] . "' style='color: #333; text-decoration: none;'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong><br>";
                    } else if ($post['tipo_autor'] == 'time' && $post['id_time']) {
                        echo "<strong><a href='perfil.php?id_time=" . $post['id_time'] . "' style='color: #333; text-decoration: none;'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong><br>";
                    } else {
                        echo "<strong>" . htmlspecialchars($post['autor']) . " (" . $post['tipo_autor'] . ")</strong><br>";
                    }
                    
                    echo "<small>" . formatarDataBr($post['data_postagem']) . "</small>";
                    echo "</div>";
                    echo "</div>";
                    
                    echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                    echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                    echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                    if (!empty($post['img_postagem'])) {
                        echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
                    }

                    echo "<small>Postado em: " . formatarDataBr($post['data_postagem']) . "</small>";
                    
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
                    echo "<form action='adicionar_comentario_usuario.php' method='POST'>";
                    echo "<input type='hidden' name='id_postagem' value='" . $post['id_postagem'] . "'>";
                    echo "<textarea name='texto_comentario' rows='2' cols='40' placeholder='Adicione um comentário...' required></textarea>";
                    echo "<button type='submit' class='btn'>Comentar</button>";
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
                            echo "<div class='post-header'>";
                            echo "<img src='uploads/" . htmlspecialchars($avatar_comentario) . "' alt='Avatar' class='post-avatar'>";
                            echo "<div>";
                            echo "<strong>" . htmlspecialchars($comentario['autor']) . " (" . $comentario['tipo_autor'] . ")</strong><br>";
                            echo htmlspecialchars($comentario['texto_comentario']);
                            echo "<br><small>Em: " . formatarDataBr($comentario['data_comentario']) . "</small>";
                            echo "</div>";
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

        <!-- ABA: POSTAGENS CURTIDAS -->
        <div id="curtidas" class="aba-conteudo">
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
                    echo "<div>";
                    
                    // Link para o perfil
                    if ($post['tipo_autor'] == 'usuário' && $post['id_usuario']) {
                        echo "<strong><a href='perfil.php?id_usuario=" . $post['id_usuario'] . "' style='color: #333; text-decoration: none;'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong><br>";
                    } else if ($post['tipo_autor'] == 'time' && $post['id_time']) {
                        echo "<strong><a href='perfil.php?id_time=" . $post['id_time'] . "' style='color: #333; text-decoration: none;'>" . htmlspecialchars($post['autor']) . "</a> (" . $post['tipo_autor'] . ")</strong><br>";
                    } else {
                        echo "<strong>" . htmlspecialchars($post['autor']) . " (" . $post['tipo_autor'] . ")</strong><br>";
                    }
                    
                    echo "<small>" . formatarDataBr($post['data_postagem']) . "</small>";
                    echo "</div>";
                    echo "</div>";
                    
                    echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
                    echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
                    echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

                    if (!empty($post['img_postagem'])) {
                        echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
                    }

                    echo "<small>Postado em: " . formatarDataBr($post['data_postagem']) . "</small>";
                    
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
                echo "<p>Você ainda não curtiu nenhuma postagem.</p>";
            }
            ?>
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
        
        // Formulário de postagem com AJAX
        document.getElementById('formPostagem').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var formData = new FormData(this);
            var mensagemDiv = document.getElementById('mensagemPostagem');
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
                mostrarAba('postagens');
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('ativa');
                });
                document.querySelector('[onclick="mostrarAba(\'postagens\')"]').classList.add('ativa');
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
                
                fetch('verificar_curtida_usuario.php?id_postagem=' + idPostagem)
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