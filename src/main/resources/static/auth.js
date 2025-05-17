// auth.js
gurei, para que 
// Importar o Supabase
const { createClient } = supabase;

// Criar o cliente Supabase
const supabaseClient = createClient(
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

// Garantir que o DOM está carregado
document.addEventListener('DOMContentLoaded', () => {
  // Alternar entre as abas de login e registro
  const tabButtons = document.querySelectorAll('.tab-btn');
  if (tabButtons) {
    tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove a classe active de todos os botões e formulários
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    // Adiciona a classe active ao botão clicado e ao formulário correspondente
    btn.classList.add('active');
    const tabId = btn.dataset.tab;
    document.getElementById(`${tabId}-form`).classList.add('active');
        });
  }
});
  }
    });
  }
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

// Formulário de Login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const senha = e.target.senha.value;
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password: senha
        });
  }
});
    
    if (error) throw error;
    
    // Armazena o nome do usuário no localStorage
    if (data.user.user_metadata && data.user.user_metadata.nome) {
      localStorage.setItem('usuarioNome', data.user.user_metadata.nome);
    }
    
    // Armazena o token de acesso para uso nas requisições à API
    if (data.session && data.session.access_token) {
      localStorage.setItem('authToken', data.session.access_token);
    }
    
    // Redireciona para a página principal
    window.location.href = 'index.html';
  } catch (error) {
    mostrarToast(error.message || 'Erro ao fazer login', 'error');
  }
    });
  }
});

// Manipulador do formulário de registro
document.addEventListener('DOMContentLoaded', () => {
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
  }
});