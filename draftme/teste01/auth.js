// auth.js - Sistema de autenticação com JWT e localStorage
class AuthService {
  static async login(username, password) {
    // Simulação de chamada API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password.length >= 6) {
          const user = {
            id: `user-${Math.random().toString(36).substr(2, 9)}`,
            username,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            avatar: username.charAt(0).toUpperCase(),
            sport: 'futebol', // Esporte padrão
            token: `fake-jwt-token-${Math.random().toString(36).substr(2)}`
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('authToken', user.token);
          resolve(user);
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 800); // Simula delay de rede
    });
  }

  static async register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.username && userData.password) {
          const user = {
            id: `user-${Math.random().toString(36).substr(2, 9)}`,
            ...userData,
            avatar: userData.name.charAt(0).toUpperCase(),
            token: `fake-jwt-token-${Math.random().toString(36).substr(2)}`
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('authToken', user.token);
          resolve(user);
        } else {
          reject(new Error('Dados incompletos'));
        }
      }, 1000);
    });
  }

  static logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
  }

  static getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  static isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  static async updateProfile(updatedData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const updatedUser = { ...user, ...updatedData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        resolve(updatedUser);
      }, 600);
    });
  }
}