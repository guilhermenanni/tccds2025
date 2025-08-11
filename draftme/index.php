<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Início</title>
    <link rel="stylesheet" href="csss/style.css">
    <link rel="shortcut icon" href="1.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css"
        integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">
</head>
<body>
    <div class="container">
        <div class="content first-content">
            <div class="first-column">
                <h2 class="title title-primary">Seja bem-vindo ao nosso site!</h2>
                <p class="description description-primary">Se você for um jogador, clique abaixo:</p>
                <button id="signin" class="btn btn-primary">Entrar</button>
            </div>    
            <div class="second-column">
                <h2 class="title title-second">Entrar aqui!</h2>
                <div class="social-media"></div>
                <p class="description description-second">Se for um time entre aqui por favor :)</p>
                <form method="get" action="login_tm.php">
                <button type="submit" class="btn btn-second">Time</button>
                </form>
        
            </div>
        </div>

        <div class="content second-content">
            <div class="first-column">
                <h2 class="title title-primary">Bem-vindo de volta!</h2>
                <p class="description description-primary">Se você não for um jogador, clique abaixo:</p>
                <button id="signup" class="btn btn-primary">Entrar</button>
            </div>
            <div class="second-column">
                <h2 class="title title-second">Entrar aqui!</h2>
                <div class="social-media"></div>
                <p class="description description-second">Se for um jogador entre aqui por favor :)</p>
                <form method="get" action="login_us.php">
                <button type="submit" class="btn btn-second">Jogador</button>
                </form>

            </div>
        </div>
    </div>

    <script src="jss/app.js"></script>
</body>
</html>

