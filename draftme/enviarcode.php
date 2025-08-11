<?php
session_start();
include 'conex.php';

$email = $_POST['email'];


$stmt = $conn->prepare("SELECT * FROM tb_time WHERE email_time = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {


    $verification_code = rand(100000, 999999);
    

    $_SESSION['verification_code'] = $verification_code;
    $_SESSION['email'] = $email;
    
    // Aqui você implementaria o envio de email
    // Este é um exemplo simulado kkkkkkk pq eu não sei mandar o email
    $to = $email;
    $subject = "Password Recovery Code";
    $message = "Your verification code is: $verification_code";
    $headers = "From: no-reply@ludiflex.com";
    

    
    header("Location: verify-code.html?email=" . urlencode($email));
} else {
    header("Location: forgot-password.html?error=email_not_found");
}

$stmt->close();
$conn->close();
?>