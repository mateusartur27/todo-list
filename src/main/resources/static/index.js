// Redireciona para a página de login se não estiver autenticado
window.addEventListener('DOMContentLoaded', () => {
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    // Se não estiver autenticado, redireciona para a página de login
    window.location.href = 'login.html';
  }
});