// Redireciona para a página de login se não estiver autenticado
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Verifica a sessão do Supabase
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      // Se não estiver autenticado, redireciona para a página de login
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    window.location.href = 'login.html';
  }
});