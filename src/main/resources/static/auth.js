// auth.js

const supabaseClient = supabase.createClient(
  'https://ymegzjtafckofamnhufx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZWd6anRhZmNrb2ZhbW5odWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NjAwNjAsImV4cCI6MjA2MTUzNjA2MH0.qckDo6a2cri9EtMJZp5LeeZzpwueaxRguAcoPgscD7s'
);

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

// Função para inicializar os elementos da interface
function inicializarInterface() {
  // Alternar entre as abas de login e registro
  const tabButtons = document.querySelectorAll('.tab-btn');
  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove a classe active de todos os botões e formulários
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        // Adiciona a classe active ao botão clicado e ao formulário correspondente
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        const form = document.getElementById(`${tabId}-form`);
        if (form) {
          form.classList.add('active');
        }
      });
    });
  }
}

// Aguarda o DOM estar completamente carregado antes de inicializar
document.addEventListener('DOMContentLoaded', inicializarInterface);

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

// Função para inicializar os manipuladores de formulário
function inicializarFormularios() {
  // Manipulador do formulário de login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Iniciando login');
    
    const email = e.target.email.value;
    const senha = e.target.senha.value;
    
    try {
      console.log('Enviando dados de login', { email });
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
      });
      
      if (error) throw error;
      
      // O Supabase já gerencia o token de sessão automaticamente
      const { user, session } = data;
      
      // Armazena informações adicionais do usuário e o token de autenticação
      localStorage.setItem('usuarioNome', user.user_metadata.nome || user.email);
      localStorage.setItem('authToken', session.access_token);
      localStorage.setItem('loginSuccess', 'true');
      
      mostrarToast('Login realizado com sucesso!');
      // Redireciona para a página principal após o login
      window.location.href = 'index.html';
      
    } catch (error) {
      console.error('Erro de login: Credenciais de login inválidas', error.message);
      mostrarToast(error.message || 'Erro ao realizar login. Tente novamente.', 'error');
    }
    });
  } else {
    console.error('Formulário de login não encontrado');
  }

  // Manipulador do formulário de registro
  const registroForm = document.getElementById('registro-form');
  if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validarFormularioRegistro(e.target)) {
      return;
    }
    
    const nome = e.target.nome.value;
    const email = e.target.email.value;
    const senha = e.target.senha.value;
    
    try {
      console.log('Enviando dados de registro');
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome
          }
        }
      });
      
      if (error) throw error;
      
      mostrarToast('Registro realizado com sucesso!');
      // Limpa o formulário
      e.target.reset();
      // Muda para a aba de login
      document.querySelector('.tab-btn[data-tab="login"]').click();
      
    } catch (error) {
      console.error('Erro de registro:', error.message);
      mostrarToast(error.message || 'Erro ao realizar registro. Tente novamente.', 'error');
    }
    });
  } else {
    console.error('Formulário de registro não encontrado');
  }
}

// Inicializa os formulários quando o DOM estiver carregado
if (document.getElementById('login-form') || document.getElementById('registro-form')) {
  document.addEventListener('DOMContentLoaded', inicializarFormularios);
}