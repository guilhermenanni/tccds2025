<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_code = $_POST['code'];
    $email = $_POST['email'];
    
    if ($user_code == $_SESSION['verification_code'] && $email == $_SESSION['email']) {

        header("Location: recsenha?email=" . urlencode($email));
    } else {

        
        header("Location: vereficarcode.html?email=" . urlencode($email) . "&error=invalid_code");
    }
}
?>