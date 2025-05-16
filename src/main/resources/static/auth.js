// auth.js
// Corrigindo o caminho da API para evitar erros 404
const API_AUTH = 'api/usuarios';

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
  
  console.log('Iniciando login'); // Log ANTES da chamada de autenticação
  
  const email = e.target.email.value;
  const senha = e.target.senha.value;
  
  try {
    console.log('Enviando dados de login', { email, senha }); // Log dos dados de autenticação
    
    // Corrigindo o endpoint para login
    const response = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, senha })
    });
    
    console.log('Resposta recebida', { status: response.status }); // Log DEPOIS da chamada de autenticação
    
    // Verificar o tipo de conteúdo da resposta
    const contentType = response.headers.get('content-type');
    
    if (response.ok) {
      // Verificar se a resposta é JSON antes de tentar processá-la
      if (contentType && contentType.includes('application/json')) {
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
        // Se não for JSON, tratar como texto
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        mostrarToast('Erro no formato da resposta do servidor', 'error');
      }
    } else {
      // Tratar erro com verificação de tipo de conteúdo
      if (contentType && contentType.includes('application/json')) {
        const erro = await response.json();
        mostrarToast(erro.mensagem || 'Credenciais inválidas', 'error');
      } else {
        const text = await response.text();
        console.error('Erro na resposta:', text);
        mostrarToast('Erro ao realizar login. Verifique o servidor.', 'error');
      }
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
    console.log('Enviando dados de registro');
    
    const response = await fetch(`${API_AUTH}/registro`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nome, email, senha })
    });
    
    console.log('Resposta recebida', { status: response.status });
    
    // Verificar o tipo de conteúdo da resposta
    const contentType = response.headers.get('content-type');
    
    if (response.ok) {
      // Verificar se a resposta é JSON antes de tentar processá-la
      mostrarToast('Registro realizado com sucesso! Faça login para continuar.');
      // Limpa o formulário
      e.target.reset();
      // Muda para a aba de login
      document.querySelector('.tab-btn[data-tab="login"]').click();
    } else {
      // Tratar erro com verificação de tipo de conteúdo
      if (contentType && contentType.includes('application/json')) {
        const erro = await response.json();
        mostrarToast(erro.mensagem || 'Erro ao realizar registro', 'error');
      } else {
        const text = await response.text();
        console.error('Erro na resposta de registro:', text);
        mostrarToast('Erro ao realizar registro. Verifique o servidor.', 'error');
      }
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