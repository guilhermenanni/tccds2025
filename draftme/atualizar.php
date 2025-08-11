<?php
session_start();
include 'conex.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $new_password = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
    

    $stmt = $conn->prepare("UPDATE tb_time SET senha_time = ? WHERE email_time = ?");
    $stmt->bind_param("ss", $new_password, $email);
    
    if ($stmt->execute()) {
        session_destroy();
        header("Location: index.html?password_updated=true");
    } else {
        header("Location: reset-password.html?email=" . urlencode($email) . "&error=update_failed");
    }
    
    $stmt->close();
}

$conn->close();
?>