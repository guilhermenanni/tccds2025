// feed.js - Lógica do feed interativo
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Carregar feed
function loadFeed(filter = 'all') {
  const feedContainer = document.getElementById('feed');
  feedContainer.innerHTML = '';
  
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.sport === filter);
  
  if (filteredPosts.length === 0) {
    feedContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem;">
        <i class="fas fa-newspaper" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
        <h3>Nenhuma postagem encontrada</h3>
        <p>Seja o primeiro a compartilhar algo!</p>
      </div>
    `;
    return;
  }
  
  filteredPosts.forEach(post => {
    const postElement = createPostElement(post);
    feedContainer.appendChild(postElement);
  });
}

// Criar elemento de postagem
function createPostElement(post) {
  const currentUser = AuthService.getCurrentUser();
  const isLiked = post.likes.includes(currentUser.id);
  
  const postElement = document.createElement('div');
  postElement.className = 'card post-card';
  postElement.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">${post.user.avatar}</div>
      <div>
        <div class="post-user">${post.user.name}</div>
        <div class="post-time">${formatDate(post.createdAt)}</div>
      </div>
    </div>
    <div class="post-content">
      <p>${post.content}</p>
      ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
    </div>
    <div class="post-actions">
      <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${post.id}">
        <i class="fas fa-heart"></i> ${post.likes.length}
      </button>
      <button class="action-btn comment-btn" data-id="${post.id}">
        <i class="fas fa-comment"></i> ${post.comments.length}
      </button>
    </div>
    <div class="comment-section" id="comments-${post.id}">
      ${post.comments.slice(0, 2).map(comment => `
        <div class="comment">
          <div class="post-avatar" style="width: 30px; height: 30px; font-size: 0.8rem;">${comment.user.avatar}</div>
          <div>
            <div class="post-user" style="font-size: 0.9rem;">${comment.user.name}</div>
            <div style="font-size: 0.9rem;">${comment.text}</div>
          </div>
        </div>
      `).join('')}
      <form class="comment-form" data-id="${post.id}" style="display: flex; margin-top: 1rem;">
        <input type="text" class="form-control" placeholder="Adicione um comentário..." required 
          style="flex: 1; border-radius: 20px 0 0 20px; border-right: none;">
        <button type="submit" class="btn btn-primary" 
          style="border-radius: 0 20px 20px 0; padding: 0 1.5rem;">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  `;
  
  return postElement;
}

// Formatador de data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Evento de submit do formulário de postagem
document.getElementById('postForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const postBtn = document.getElementById('postBtn');
  const postLoading = document.getElementById('postLoading');
  const postContent = document.getElementById('postContent');
  const postImage = document.getElementById('postImage');
  const postSport = document.getElementById('postSport');
  const currentUser = AuthService.getCurrentUser();
  
  // Mostrar loading
  postBtn.disabled = true;
  postLoading.style.display = 'inline-block';
  
  try {
    let imageUrl = '';
    if (postImage.files[0]) {
      imageUrl = await uploadImage(postImage.files[0]);
    }
    
    const newPost = {
      id: Date.now().toString(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      content: postContent.value,
      image: imageUrl,
      sport: postSport.value,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // Resetar formulário
    postContent.value = '';
    postImage.value = '';
    document.getElementById('fileName').textContent = '';
    
    // Recarregar feed
    loadFeed(document.querySelector('.filter-btn.active').dataset.filter);
    showToast('Postagem criada com sucesso!');
  } catch (error) {
    showToast('Erro ao criar postagem', 'error');
  } finally {
    postBtn.disabled = false;
    postLoading.style.display = 'none';
  }
});

// Upload de imagem (simulado)
function uploadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Eventos delegados para curtidas e comentários
document.getElementById('feed')?.addEventListener('click', (e) => {
  if (e.target.closest('.like-btn')) {
    const btn = e.target.closest('.like-btn');
    const postId = btn.dataset.id;
    const post = posts.find(p => p.id === postId);
    const currentUser = AuthService.getCurrentUser();
    
    const userIndex = post.likes.indexOf(currentUser.id);
    if (userIndex === -1) {
      post.likes.push(currentUser.id);
      btn.classList.add('liked');
    } else {
      post.likes.splice(userIndex, 1);
      btn.classList.remove('liked');
    }
    
    btn.innerHTML = `
      <i class="fas fa-heart"></i> ${post.likes.length}
    `;
    
    localStorage.setItem('posts', JSON.stringify(posts));
  }
});

document.getElementById('feed')?.addEventListener('submit', (e) => {
  if (e.target.classList.contains('comment-form')) {
    e.preventDefault();
    const form = e.target;
    const postId = form.dataset.id;
    const input = form.querySelector('input');
    const commentText = input.value.trim();
    const currentUser = AuthService.getCurrentUser();
    
    if (!commentText) return;
    
    const post = posts.find(p => p.id === postId);
    post.comments.unshift({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      text: commentText,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('posts', JSON.stringify(posts));
    loadFeed(document.querySelector('.filter-btn.active').dataset.filter);
    input.value = '';
  }
});