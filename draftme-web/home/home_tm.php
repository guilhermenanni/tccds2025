<?php
session_start();
if (!isset($_SESSION['id'])) {
    header("Location: login_tm.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Área do Time</title>
</head>
<body>


    <?php
    include('conex.php');
    $id_time = $_SESSION['id'];
    $sql = "SELECT img_time FROM tb_time WHERE id_time = $id_time";
    $res = $conex->query($sql);
    $dados = $res->fetch_assoc();
    $imagem = $dados['img_time'] ?? 'default.png'; 
    ?>

<div class="container">
        <h1>Bem-vindo, <?php echo htmlspecialchars($_SESSION['nome']); ?>!</h1>

        <h2>Informações do Time</h2>
        <ul>
            <li><strong>Email:</strong> <?php echo htmlspecialchars($_SESSION['email']); ?></li>
            <li><strong>CNPJ:</strong> <?php echo htmlspecialchars($_SESSION['cnpj']); ?></li>
            <li><strong>Categoria:</strong> <?php echo htmlspecialchars($_SESSION['categoria']); ?></li>
            <li><strong>Esporte:</strong> <?php echo htmlspecialchars($_SESSION['esporte']); ?></li>
            <li><strong>Localização:</strong> <?php echo htmlspecialchars($_SESSION['localizacao']); ?></li>
        </ul>

        <p><a href="logout.php" style="color:red;">Sair da conta</a></p>
    </div>

    <img src="uploads/<?php echo htmlspecialchars($imagem); ?>" alt="Imagem do time" width="200"><br><br>

    <form action="upload_imagem.php" method="POST" enctype="multipart/form-data">
        <label>Alterar imagem do time:</label><br>
        <input type="file" name="imagem" accept="image/*" required><br><br>
        <button type="submit">Enviar</button>
    </form>


    <hr>
<h2>Nova Postagem</h2>

<form action="criar_postagem.php" method="POST" enctype="multipart/form-data">
    <label>Texto da postagem:</label><br>
    <textarea name="texto" rows="4" cols="50" required></textarea><br><br>

    <label>Imagem da postagem (opcional):</label><br>
    <input type="file" name="imagem" accept="image/*"><br><br>

    <label>Categoria:</label><br>
    <input type="text" name="categoria" required><br><br>

    <label>Tag:</label><br>
    <input type="text" name="tag"><br><br>

    <button type="submit">Postar</button>
</form>




<hr>
<h2>Postagens do Seu Time</h2>

<?php
$sql_posts = "SELECT * FROM tb_postagem WHERE id_time = $id_time ORDER BY data_postagem DESC";
$result_posts = $conex->query($sql_posts);

if ($result_posts->num_rows > 0) {
    while ($post = $result_posts->fetch_assoc()) {
        echo "<div style='border:1px solid #ccc; padding:10px; margin-bottom:15px;'>";
        echo "<strong>Categoria:</strong> " . htmlspecialchars($post['categoria']) . "<br>";
        echo "<strong>Tag:</strong> " . htmlspecialchars($post['tag']) . "<br>";
        echo "<p>" . nl2br(htmlspecialchars($post['texto_postagem'])) . "</p>";

        if (!empty($post['img_postagem'])) {
            echo "<img src='uploads/" . htmlspecialchars($post['img_postagem']) . "' width='250'><br>";
        }

        echo "<small>Postado em: " . $post['data_postagem'] . "</small>";
        echo "</div>";
    }
} else {
    echo "<p>Seu time ainda não fez nenhuma postagem.</p>";
}
?>



    <p><a href="logout.php">Sair</a></p>
</body>
</html>
