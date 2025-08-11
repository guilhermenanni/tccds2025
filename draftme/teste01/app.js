// app.js - Versão Profissional
class RedeEsportiva {
  constructor() {
    this.init();
    this.loadUser();
    this.setupEventListeners();
  }

  init() {
    // Verificar autenticação
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    // Configurações iniciais
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.apiUrl = 'https://api.redeesportivapro.com/v1';
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  async loadUser() {
    try {
      const response = await this.fetchApi('/users/me');
      this.currentUser = response.data;
      this.updateUI();
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      this.showToast('Erro ao carregar dados do perfil', 'error');
    }
  }

  async fetchApi(endpoint, method = 'GET', body = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    };

    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    };

    const response = await fetch(`${this.apiUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  }

  updateUI() {
    // Atualizar elementos da UI com dados do usuário
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = this.currentUser.name;
    });

    document.querySelectorAll('.user-avatar').forEach(el => {
      el.src = this.currentUser.foto_perfil || 'img/default-avatar.jpg';
      el.alt = `Foto de ${this.currentUser.name}`;
    });

    // Atualizar outras informações conforme necessário
  }

  setupEventListeners() {
    // Eventos de postagem
    document.getElementById('post-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createPost();
    });

    // Eventos de conexão
    document.querySelectorAll('.connect-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.dataset.userId;
        await this.toggleConnection(userId, e.target);
      });
    });

    // Eventos de curtida
    document.getElementById('feed')?.addEventListener('click', async (e) => {
      if (e.target.closest('.like-btn')) {
        const postId = e.target.closest('.like-btn').dataset.postId;
        await this.toggleLike(postId, e.target.closest('.like-btn'));
      }
    });

    // Eventos de comentário
    document.getElementById('feed')?.addEventListener('submit', async (e) => {
      if (e.target.classList.contains('comment-form')) {
        e.preventDefault();
        const postId = e.target.dataset.postId;
        const content = e.target.querySelector('textarea').value;
        await this.addComment(postId, content);
        e.target.querySelector('textarea').value = '';
      }
    });
  }

  async createPost() {
    const form = document.getElementById('post-form');
    const content = form.querySelector('textarea').value;
    const fileInput = form.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    if (!content && !file) {
      this.showToast('Por favor, adicione conteúdo ou mídia para postar', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', 'public');
      if (file) formData.append('media', file);

      const response = await fetch(`${this.apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Erro ao criar postagem');

      this.showToast('Postagem criada com sucesso!');
      form.reset();
      this.loadFeed();
    } catch (error) {
      console.error('Erro ao criar postagem:', error);
      this.showToast(error.message, 'error');
    }
  }

  async toggleConnection(userId, button) {
    try {
      const isConnected = button.classList.contains('connected');
      
      if (isConnected) {
        await this.fetchApi(`/connections/${userId}`, 'DELETE');
        button.classList.remove('connected');
        button.textContent = 'Conectar';
      } else {
        await this.fetchApi('/connections', 'POST', { user_id: userId });
        button.classList.add('connected');
        button.textContent = 'Conectado';
      }
      
      this.showToast(`Conexão ${isConnected ? 'removida' : 'estabelecida'} com sucesso`);
    } catch (error) {
      console.error('Erro ao atualizar conexão:', error);
      this.showToast(error.message, 'error');
    }
  }

  async toggleLike(postId, button) {
    try {
      const isLiked = button.classList.contains('liked');
      
      if (isLiked) {
        await this.fetchApi(`/posts/${postId}/unlike`, 'POST');
        button.classList.remove('liked');
      } else {
        await this.fetchApi(`/posts/${postId}/like`, 'POST');
        button.classList.add('liked');
      }
      
      // Atualizar contador
      const countElement = button.querySelector('.like-count');
      const currentCount = parseInt(countElement.textContent);
      countElement.textContent = isLiked ? currentCount - 1 : currentCount + 1;
    } catch (error) {
      console.error('Erro ao curtir postagem:', error);
    }
  }

  async addComment(postId, content) {
    if (!content.trim()) return;
    
    try {
      await this.fetchApi(`/posts/${postId}/comments`, 'POST', { content });
      this.showToast('Comentário adicionado!');
      this.loadFeed();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      this.showToast(error.message, 'error');
    }
  }

  async loadFeed(filter = 'all') {
    try {
      const response = await this.fetchApi(`/posts?filter=${filter}`);
      this.renderFeed(response.data);
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      this.showToast('Erro ao carregar o feed', 'error');
    }
  }

  renderFeed(posts) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = '';

    if (posts.length === 0) {
      feedContainer.innerHTML = `
        <div class="empty-feed">
          <i class="fas fa-newspaper"></i>
          <h3>Nenhuma postagem encontrada</h3>
          <p>Conecte-se com outros atletas ou crie sua primeira postagem!</p>
        </div>
      `;
      return;
    }

    posts.forEach(post => {
      const postElement = this.createPostElement(post);
      feedContainer.appendChild(postElement);
    });
  }

  createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    postElement.innerHTML = `
      <div class="post-header">
        <img src="${post.user.foto_perfil || 'img/default-avatar.jpg'}" alt="${post.user.name}" class="post-avatar">
        <div class="post-user-info">
          <h4>${post.user.name}</h4>
          <p class="post-meta">${this.formatDate(post.created_at)} • ${post.visibility === 'public' ? '🌍 Público' : '🔒 Conexões'}</p>
        </div>
        <button class="btn btn-icon more-options">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
      
      <div class="post-content">
        <p>${post.content}</p>
        ${post.media ? `<img src="${post.media}" alt="Mídia da postagem" class="post-media">` : ''}
      </div>
      
      <div class="post-stats">
        <span>${post.likes_count} curtidas</span>
        <span>${post.comments_count} comentários</span>
      </div>
      
      <div class="post-actions">
        <button class="btn btn-action like-btn ${post.is_liked ? 'liked' : ''}" data-post-id="${post.id}">
          <i class="far fa-thumbs-up"></i> <span class="like-count">${post.likes_count}</span>
        </button>
        <button class="btn btn-action comment-btn">
          <i class="far fa-comment"></i> Comentar
        </button>
        <button class="btn btn-action share-btn">
          <i class="far fa-share-square"></i> Compartilhar
        </button>
      </div>
      
      <div class="post-comments">
        ${post.recent_comments.map(comment => `
          <div class="comment">
            <img src="${comment.user.foto_perfil || 'img/default-avatar.jpg'}" alt="${comment.user.name}" class="comment-avatar">
            <div class="comment-content">
              <strong>${comment.user.name}</strong>
              <p>${comment.content}</p>
              <small>${this.formatDate(comment.created_at)}</small>
            </div>
          </div>
        `).join('')}
        
        <form class="comment-form" data-post-id="${post.id}">
          <img src="${this.currentUser.foto_perfil || 'img/default-avatar.jpg'}" alt="Seu perfil" class="comment-avatar">
          <textarea placeholder="Adicione um comentário..." required></textarea>
          <button type="submit" class="btn btn-primary btn-sm">Publicar</button>
        </form>
      </div>
    `;
    
    return postElement;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // diferença em segundos
    
    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new RedeEsportiva();
  
  // Expor métodos globais se necessário
  window.app = app;
});