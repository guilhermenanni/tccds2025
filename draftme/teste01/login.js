// Função para realizar o login
document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.setItem('token', result.token); // Salva o token no localStorage
      window.location.href = 'index.html'; // Redireciona para a página do feed
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Erro no login:', error);
  }
});
// Função para registrar o usuário
document.getElementById('register').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (response.ok) {
      alert('Usuário registrado com sucesso! Agora, faça login.');
      window.location.href = 'login.html'; // Redireciona para a página de login
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Erro no registro:', error);
  }
});
