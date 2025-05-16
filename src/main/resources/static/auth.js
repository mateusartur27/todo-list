// auth.js
const API_AUTH = '/usuarios';

// Função para mostrar mensagens de toast (reutilizada do script.js)
function mostrarToast(mensagem, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  
  const container = document.getElementById('toast-container');
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

// Alternar entre as abas de login e registro
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove a classe active de todos os botões e formulários
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    // Adiciona a classe active ao botão clicado e ao formulário correspondente
    btn.classList.add('active');
    const tabId = btn.dataset.tab;
    document.getElementById(`${tabId}-form`).classList.add('active');
  });
});

// Função para validar o formulário de registro
function validarFormularioRegistro(form) {
  const senha = form.senha.value;
  const confirmarSenha = form.confirmarSenha.value;
  
  if (senha !== confirmarSenha) {
    mostrarToast('As senhas não coincidem', 'error');
    return false;
  }
  
  if (senha.length < 6) {
    mostrarToast('A senha deve ter pelo menos 6 caracteres', 'error');
    return false;
  }
  
  return true;
}

// Manipulador do formulário de login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  console.log('Você chamar signIn'); // Log ANTES da chamada de autenticação
  
  const email = e.target.email.value;
  const senha = e.target.senha.value;
  
  try {
    console.log('SIGNIN', { email, senha }); // Log dos dados de autenticação
    
    const response = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, senha })
    });
    
    console.log('DEPOIS', { status: response.status }); // Log DEPOIS da chamada de autenticação
    
    if (response.ok) {
      const data = await response.json();
      // Armazena o token e informações do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('usuarioId', data.id);
      localStorage.setItem('usuarioNome', data.nome);
      
      mostrarToast('Login realizado com sucesso!');
      // Redireciona para a página principal após o login
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      const erro = await response.json();
      mostrarToast(erro.mensagem || 'Credenciais inválidas', 'error');
    }
  } catch (error) {
    mostrarToast('Erro ao realizar login. Tente novamente.', 'error');
    console.error('Erro de login:', error);
  }
});

// Manipulador do formulário de registro
document.getElementById('registro-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!validarFormularioRegistro(e.target)) {
    return;
  }
  
  const nome = e.target.nome.value;
  const email = e.target.email.value;
  const senha = e.target.senha.value;
  
  try {
    const response = await fetch(`${API_AUTH}/registro`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nome, email, senha })
    });
    
    if (response.ok) {
      mostrarToast('Registro realizado com sucesso! Faça login para continuar.');
      // Limpa o formulário
      e.target.reset();
      // Muda para a aba de login
      document.querySelector('.tab-btn[data-tab="login"]').click();
    } else {
      const erro = await response.json();
      mostrarToast(erro.mensagem || 'Erro ao realizar registro', 'error');
    }
  } catch (error) {
    mostrarToast('Erro ao realizar registro. Tente novamente.', 'error');
    console.error('Erro de registro:', error);
  }
});

// Verifica se o usuário já está autenticado ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const authToken = localStorage.getItem('authToken');
  
  if (authToken) {
    // Se já estiver autenticado, redireciona para a página principal
    window.location.href = 'index.html';
  }
});