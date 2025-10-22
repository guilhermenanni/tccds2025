<?php
session_start();
include('conex.php');

if (!isset($_SESSION['id'])) {
    exit("Acesso não autorizado.");
}

if (isset($_GET['id_seletiva'])) {
    $id_seletiva = $_GET['id_seletiva'];
    
    // Verificar se a seletiva pertence ao time do usuário logado
    $id_time = $_SESSION['id'];
    $check = $conex->prepare("SELECT * FROM tb_seletiva WHERE id_seletiva = ? AND id_time = ?");
    $check->bind_param("ii", $id_seletiva, $id_time);
    $check->execute();
    $result = $check->get_result();
    
    if ($result->num_rows == 0) {
        exit("Acesso não autorizado a esta seletiva.");
    }
    
    // Buscar inscritos
    $sql = "SELECT u.*, i.data_inscricao, i.status 
            FROM tb_inscricao_seletiva i 
            INNER JOIN tb_usuario u ON i.id_usuario = u.id_usuario 
            WHERE i.id_seletiva = ? 
            ORDER BY i.data_inscricao DESC";
    $stmt = $conex->prepare($sql);
    $stmt->bind_param("i", $id_seletiva);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        while ($inscrito = $result->fetch_assoc()) {
            echo "<div class='inscrito-item'>";
            echo "<strong>" . htmlspecialchars($inscrito['nm_usuario']) . "</strong> (" . htmlspecialchars($inscrito['email_usuario']) . ")";
            echo "<br>Telefone: " . htmlspecialchars($inscrito['tel_usuario']);
            echo "<br>Data de inscrição: " . $inscrito['data_inscricao'];
            echo "<br>Status: " . $inscrito['status'];
            echo "</div>";
        }
    } else {
        echo "<p>Nenhum inscrito encontrado para esta seletiva.</p>";
    }
} else {
    echo "<p>Seletiva não especificada.</p>";
}
?>