// Formulário de postagem
const postForm = document.getElementById('post-form');
const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');

// Função para salvar a postagem
postForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o envio do formulário padrão

  const newPost = {
    id: Date.now(),
    user: "Usuário Anônimo", // Pode ser substituído por um sistema de login
    text: postText.value,
    image: URL.createObjectURL(postImage.files[0]), // Cria URL para a imagem carregada
    likes: 0,
    comments: 0,
  };

  // Salva a postagem no localStorage (simula envio para o banco de dados)
  let savedPosts = JSON.parse(localStorage.getItem('posts')) || [];
  savedPosts.push(newPost);
  localStorage.setItem('posts', JSON.stringify(savedPosts));

  // Limpa o formulário após postagem
  postText.value = '';
  postImage.value = '';

  // Redireciona para o feed
  window.location.href = "index.html";
});
