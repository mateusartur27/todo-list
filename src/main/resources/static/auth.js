// auth.js

// Função para mostrar mensagens de toast
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
  
  console.log('Iniciando login');
  
  const email = e.target.email.value;
  const senha = e.target.senha.value;
  
  try {
    console.log('Enviando dados de login', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    
    if (error) throw error;
    
    // O Supabase já gerencia o token de sessão automaticamente
    const { user, session } = data;
    
    // Armazena informações adicionais do usuário se necessário
    localStorage.setItem('usuarioNome', user.user_metadata.nome || user.email);
    
    mostrarToast('Login realizado com sucesso!');
    // Redireciona para a página principal após o login
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    console.error('Erro de login:', error.message);
    mostrarToast(error.message || 'Erro ao realizar login. Tente novamente.', 'error');
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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome: nome
        }
      }
    });
    
    if (error) throw error;
    
    mostrarToast('Registro realizado com sucesso! Verifique seu email para confirmar o cadastro.');
    // Limpa o formulário
    e.target.reset();
    // Muda para a aba de login
    document.querySelector('.tab-btn[data-tab="login"]').click();
    
  } catch (error) {
    console.error('Erro de registro:', error.message);
    mostrarToast(error.message || 'Erro ao realizar registro. Tente novamente.', 'error');
  }
});

// Verifica se o usuário já está autenticado ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Se já estiver autenticado, redireciona para a página principal
    window.location.href = 'index.html';
  }
});