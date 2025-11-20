<?php
include_once('conex.php');

$email = $_POST['email'];
$codigo = rand(100000, 999999); // código de 6 dígitos
$expiracao = date('Y-m-d H:i:s', strtotime('+10 minutes'));

// Verifica se o email existe em alguma tabela
$sql = "SELECT email_usuario FROM tb_usuario WHERE email_usuario = ? 
        UNION 
        SELECT email_time FROM tb_time WHERE email_time = ?";
$stmt = $conex->prepare($sql);
$stmt->bind_param("ss", $email, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Armazena o código
    $stmt = $conex->prepare("INSERT INTO tb_recuperacao (email, codigo, expiracao) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $codigo, $expiracao);
    $stmt->execute();

    // Envia o código por e-mail
    $assunto = "Seu código de verificação";
    $mensagem = "Seu código de verificação é: $codigo\n\nEle expira em 10 minutos.";
    $headers = "From: no-reply@draftme.com.br";

    mail($email, $assunto, $mensagem, $headers);

    header("Location: validarcode.html?email=$email");
    exit();
} else {
    echo "E-mail não encontrado.";
}
?>
