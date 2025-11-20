<?php
include_once('conex.php');

$email = $_POST['email'];
$new_password = $_POST['new_password'];
$confirm_password = $_POST['confirm_password'];

if ($new_password !== $confirm_password) {
    echo "As senhas não coincidem!";
    exit();
}

$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

// Tenta atualizar em tb_usuario
$sql_user = "UPDATE tb_usuario SET senha_usuario = ? WHERE email_usuario = ?";
$stmt_user = $conex->prepare($sql_user);
$stmt_user->bind_param("ss", $hashed_password, $email);
$stmt_user->execute();

// Tenta atualizar em tb_time
$sql_time = "UPDATE tb_time SET senha_time = ? WHERE email_time = ?";
$stmt_time = $conex->prepare($sql_time);
$stmt_time->bind_param("ss", $hashed_password, $email);
$stmt_time->execute();

// Limpa códigos usados
$conex->prepare("DELETE FROM tb_recuperacao WHERE email = ?")->bind_param("s", $email)->execute();

header("Location: index.php?senha_alterada=true");
exit();
?>
  