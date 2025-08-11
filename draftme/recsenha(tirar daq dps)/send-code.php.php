<?php
session_start();
include 'db_connection.php';

$email = $_POST['email'];

// Verifica se o email existe no banco de dados
$stmt = $conn->prepare("SELECT * FROM tb_time WHERE email_time = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Gera um código de verificação
    $verification_code = rand(100000, 999999);
    
    // Armazena o código na sessão
    $_SESSION['verification_code'] = $verification_code;
    $_SESSION['email'] = $email;
    
    // Aqui você implementaria o envio de email
    // Este é um exemplo simulado
    $to = $email;
    $subject = "Password Recovery Code";
    $message = "Your verification code is: $verification_code";
    $headers = "From: no-reply@ludiflex.com";
    
    // mail($to, $subject, $message, $headers); // Descomente esta linha em produção
    
    // Redireciona para a página de verificação
    header("Location: verify-code.html?email=" . urlencode($email));
} else {
    // Email não encontrado
    header("Location: forgot-password.html?error=email_not_found");
}

$stmt->close();
$conn->close();
?>