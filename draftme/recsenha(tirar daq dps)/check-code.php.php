<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_code = $_POST['code'];
    $email = $_POST['email'];
    
    if ($user_code == $_SESSION['verification_code'] && $email == $_SESSION['email']) {
        // Código correto, redireciona para redefinir senha
        header("Location: reset-password.html?email=" . urlencode($email));
    } else {
        // Código incorreto
        header("Location: verify-code.html?email=" . urlencode($email) . "&error=invalid_code");
    }
}
?>