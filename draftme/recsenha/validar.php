<?php
include_once('../conex.php');

$email = $_POST['email'];
$code = $_POST['code'];

$sql = "SELECT * FROM tb_recuperacao WHERE email = ? AND codigo = ? AND expiracao >= NOW()";
$stmt = $conex->prepare($sql);
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    header("Location: recsenha.html?email=" . urlencode($email));
    exit();
} else {
    echo "Código inválido ou expirado.";
}
?>
