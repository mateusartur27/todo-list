// script.js
const API = '/tarefas';

// Função para exportar lista de tarefas
async function exportarListaTarefas() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      mostrarToast('Usuário não autenticado.', 'error');
      return;
    }
    const uid = session.user.id;
  // Usando uid do Supabase Authentication
  const { data: tarefasData, error } = await supabaseClient
    .from('tarefas')
    .select('*')
    .eq('user_id', uid);

  if (error) {
    mostrarToast('Erro ao carregar tarefas.', 'error');
    return;
  }

  const tarefas = tarefasData;
    
    // Criar o objeto Blob com os dados
    const blob = new Blob([JSON.stringify(tarefas, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // Criar elemento de link para download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minhas-tarefas.json';
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    mostrarToast('Lista de tarefas exportada com sucesso!');
  } catch (error) {
    mostrarToast('Erro ao exportar lista de tarefas.', 'error');
  }
}

// Adicionar evento ao botão de exportação
document.getElementById('exportar-lista').addEventListener('click', exportarListaTarefas);
let filtroAtual = 'all';
let ordenacao = 'criacao'; // Opções: 'data', 'titulo' ou 'criacao'
let termoBusca = '';

// Adiciona informações do usuário e botão de logout no cabeçalho
async function configurarCabecalho() {
  // Verifica se o elemento já existe
  if (document.querySelector('.user-info')) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  const usuarioNome = user ? user.user_metadata.nome || user.email : 'Usuário';
  const header = document.querySelector('.header');
  
  if (!header) {
    console.warn('Elemento header não encontrado');
    return;
  }
  
  // Cria o elemento de informações do usuário
  const userInfo = document.createElement('div');
  userInfo.className = 'user-info';
  userInfo.innerHTML = `
    <span>Olá, ${usuarioNome || 'Usuário'}</span>
    <button id="btn-logout" class="btn-logout">
      <i class="fas fa-sign-out-alt"></i> Sair
    </button>
  `;
  
  header.appendChild(userInfo);
  
  // Adiciona evento de logout
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('usuarioNome'); // Remove apenas o nome, Supabase cuida do resto
    window.location.href = 'login.html';
  });
}

// Função para calcular estatísticas das tarefas
function calcularEstatisticas(tarefas) {
  if (!Array.isArray(tarefas)) {
    console.error('Dados inválidos para cálculo de estatísticas:', tarefas);
    return {
      total: 0,
      concluidas: 0,
      pendentes: 0,
      percentualConcluidas: 0
    };
  }

  const total = tarefas.length;
  const concluidas = tarefas.filter(t => t && t.status === 'CONCLUIDA').length;
  const pendentes = total - concluidas;
  const percentualConcluidas = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  
  return {
    total,
    concluidas,
    pendentes,
    percentualConcluidas
  };
}

// Função para atualizar o resumo estatístico
async function atualizarResumoEstatistico() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      console.warn('Usuário não autenticado ao atualizar estatísticas');
      return;
    }
    
    const { data: tarefas, error } = await supabaseClient
      .from('tarefas')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao carregar tarefas para estatísticas:', error);
      return;
    }

    const stats = calcularEstatisticas(tarefas);
    const resumoContainer = document.getElementById('resumo-estatistico');
    
    if (!resumoContainer) {
      console.warn('Container de resumo estatístico não encontrado');
      return;
    }

    resumoContainer.innerHTML = `
      <div class="stats-item">
        <i class="fas fa-tasks"></i>
        <span>Total: ${stats.total}</span>
      </div>
      <div class="stats-item">
        <i class="fas fa-check-circle"></i>
        <span>Concluídas: ${stats.concluidas}</span>
      </div>
      <div class="stats-item">
        <i class="fas fa-clock"></i>
        <span>Pendentes: ${stats.pendentes}</span>
      </div>
      <div class="stats-item">
        <i class="fas fa-percentage"></i>
        <span>Progresso: ${stats.percentualConcluidas}%</span>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao atualizar resumo estatístico:', error);
  }
}

async function carregarTarefas() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    mostrarToast('Usuário não autenticado.', 'error');
    return;
  }
  const { data: tarefas, error } = await supabaseClient
    .from('tarefas')
    .select('*')
    .eq('user_id', session.user.id);

  if (error) {
    mostrarToast('Erro ao carregar tarefas.', 'error');
    return;
  }

  const ul = document.getElementById('lista-tarefas');
  
  // Garante que tarefas seja um array mesmo quando não há dados
  const tarefasArray = Array.isArray(tarefas) ? tarefas : [];
  
  // Atualiza o resumo estatístico
  atualizarResumoEstatistico(tarefasArray);
  
  let tarefasFiltradas = filtrarTarefas(tarefasArray);
  tarefasFiltradas = ordenarTarefas(tarefasFiltradas);
  
  // Se não houver tarefas, exibe uma mensagem
  if (tarefasArray.length === 0) {
    ul.innerHTML = `
      <li class="no-tasks">
        <div class="task-content">
          <span class="task-title">Nenhuma tarefa encontrada</span>
          <span class="task-description">Comece adicionando uma nova tarefa!</span>
        </div>
      </li>
    `;
    return;
  }
  
  ul.innerHTML = tarefasFiltradas.map(t => `
    <li class="${t.status === 'CONCLUIDA' ? 'completed' : ''}" id="tarefa-${t.id}">
      <div class="task-content">
        <span class="task-title">${t.titulo}</span>
        <span class="task-description">${t.descricao}</span>
        <span class="task-date">${formatarData(t.dataVencimento)}</span>
        <span class="task-status">${t.status === 'CONCLUIDA' ? 'X Concluída' : '⌛ Pendente'}</span>
      </div>
      <div class="task-actions">
        <button onclick="concluir(${t.id})" title="${t.status === 'CONCLUIDA' ? 'Desmarcar tarefa' : 'Marcar como concluída'}"><i class="fas ${t.status === 'CONCLUIDA' ? 'fa-times' : 'fa-check'}"></i></button>
        <button onclick="editar(${t.id})" title="Editar tarefa"><i class="fas fa-edit"></i></button>
        <button onclick="excluir(${t.id})" title="Excluir tarefa"><i class="fas fa-trash"></i></button>
      </div>
      <form class="edit-form" style="display: none;">
        <div class="input-group">
          <div class="input-fields">
            <input name="titulo" type="text" value="${t.titulo}" required />
            <input name="descricao" type="text" value="${t.descricao}" required />
            <input name="dataVencimento" type="date" value="${t.dataVencimento}" required />
          </div>
          <div class="input-group__buttons">
            <button type="submit" class="input-group__button">
              <i class="fas fa-save"></i>
              Salvar
            </button>
            <button type="button" class="input-group__button cancel" onclick="cancelarEdicao(${t.id})">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </li>
  `).join('');
}

function filtrarTarefas(tarefas) {
  let tarefasFiltradas = tarefas;
  
  switch(filtroAtual) {
    case 'concluida':
      tarefasFiltradas = tarefasFiltradas.filter(t => t.status === 'CONCLUIDA');
      break;
    case 'pendente':
      tarefasFiltradas = tarefasFiltradas.filter(t => t.status !== 'CONCLUIDA');
      break;
  }
  
  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    const isDataCompleta = /^\d{2}\/\d{2}\/\d{4}$/.test(termoBusca);
    
    tarefasFiltradas = tarefasFiltradas.filter(t => 
      t.titulo.toLowerCase().includes(termo) || 
      t.descricao.toLowerCase().includes(termo) ||
      (isDataCompleta && formatarData(t.dataVencimento).includes(termo))
    );
  }
  
  return tarefasFiltradas;
}


// Configurar máscara de data no campo de data de vencimento
function configurarMascaraData(input) {
  // intercepta Backspace sobre "/"
  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace') {
      const pos = input.selectionStart;
      const val = input.value;
      if (pos > 0 && val[pos-1] === '/') {
        e.preventDefault();
        // remove a barra e o dígito antes dela
        input.value = val.slice(0, pos-2) + val.slice(pos);
        // reposiciona o caret
        input.setSelectionRange(pos-2, pos-2);
      }
    }
  });

  // reaplica máscara a cada input
  input.addEventListener('input', () => aplicarMascaraData(input));
}

// Configuração do flatpickr para formulário de adição
const novoDate = document.querySelector('#nova-tarefa input[name="dataVencimento"]');
flatpickr(novoDate, {
  locale: "pt",
  dateFormat: "d/m/Y",
  allowInput: true,
  clickOpens: true,
  defaultDate: null,
  onChange: function([date], dateStr, instance) {
    instance.element.setAttribute('data-valor-api', date.toISOString().slice(0,10));
  }
});

document.getElementById('nova-tarefa')
  .addEventListener('submit', async e => {
    e.preventDefault();
    const title = e.target.titulo.value;
    const desc = e.target.descricao.value;
    const dataInput = e.target.dataVencimento;
    const data = dataInput.getAttribute('data-valor-api') || formatarDataParaAPI(dataInput.value);
    
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        mostrarToast('Usuário não autenticado.', 'error');
        return;
      }
      const userId = session.user.id;
      const { data, error } = await supabaseClient
        .from('tarefas')
        .insert([
          {
            titulo: title,
            descricao: desc,
            dataVencimento: data,
            status: 'PENDENTE',
            user_id: userId
          }
        ])
        .select();

      if (error) {
        mostrarToast('Erro ao adicionar tarefa.', 'error');
        return;
      }
      
      mostrarToast('Tarefa adicionada com sucesso!');
    e.target.reset();
    carregarTarefas(userId);
    atualizarResumoEstatistico();
    } catch (error) {
      mostrarToast('Erro ao adicionar tarefa.', 'error');
    }
  });

async function concluir(id) {
  const li = document.getElementById(`tarefa-${id}`);
  const isCompleted = li.classList.contains('completed');
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    mostrarToast('Usuário não autenticado.', 'error');
    return;
  }
  const uid = session.user.id;
  const { data, error } = await supabaseClient
    .from('tarefas')
    .update({ status: isCompleted ? 'PENDENTE' : 'CONCLUIDA' })
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (!error) {
    const tarefa = data[0];
    li.classList.toggle('completed');
    li.querySelector('.task-status').textContent = tarefa.status === 'CONCLUIDA' ? 'X Concluída' : '⌛ Pendente';
    li.querySelector('button[title]').title = tarefa.status === 'CONCLUIDA' ? 'Desmarcar tarefa' : 'Marcar como concluída';
    li.querySelector('button[title] i').className = `fas ${tarefa.status === 'CONCLUIDA' ? 'fa-times' : 'fa-check'}`;
    mostrarToast(isCompleted ? 'Tarefa desmarcada com sucesso!' : 'Tarefa concluída com sucesso!');
    carregarTarefas();
    atualizarResumoEstatistico();
  } else {
    mostrarToast('Erro ao atualizar o status da tarefa.');
  }
}

function cancelarEdicao(id) {
  const li = document.getElementById(`tarefa-${id}`);
  const taskContent = li.querySelector('.task-content');
  const editForm = li.querySelector('.edit-form');
  const taskActions = li.querySelector('.task-actions');
  
  taskContent.style.display = 'block';
  taskActions.style.display = 'flex';
  editForm.style.display = 'none';
}

function editar(id) {
  const li = document.getElementById(`tarefa-${id}`);
  const taskContent = li.querySelector('.task-content');
  const editForm = li.querySelector('.edit-form');
  const taskActions = li.querySelector('.task-actions');
  
  taskContent.style.display = 'none';
  taskActions.style.display = 'none';
  editForm.style.display = 'block';
  
  // Preenche os campos do formulário com os valores atuais
  const editTitle = editForm.querySelector('input[name="titulo"]');
  const editDescription = editForm.querySelector('input[name="descricao"]');
  
  const currentTitle = li.querySelector('.task-title').textContent;
  const currentDescription = li.querySelector('.task-description').textContent;
  
  editTitle.value = currentTitle;
  editDescription.value = currentDescription;
  
  const editDate = editForm.querySelector('input[name="dataVencimento"]');
  const dataOriginal = li.querySelector('.task-date').textContent;
  
  // Configura o valor inicial do campo de data no formato esperado pelo Flatpickr
  if(dataOriginal && dataOriginal !== 'Sem data') {
    editDate.value = dataOriginal;
    editDate.setAttribute('data-valor-api', formatarDataParaAPI(dataOriginal));
  }
  
  configurarMascaraData(editDate);
  flatpickr(editDate, {
    locale: "pt",
    dateFormat: "d/m/Y",
    allowInput: true,
    clickOpens: true,
    defaultDate: dataOriginal && dataOriginal !== 'Sem data' ? dataOriginal : null,
    onChange: function([date], dateStr, instance) {
      instance.element.setAttribute('data-valor-api', date.toISOString().slice(0,10));
    }
  });
  
  editForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataInput = editForm.querySelector('input[name="dataVencimento"]');
    const data = dataInput.getAttribute('data-valor-api') || formatarDataParaAPI(dataInput.value);
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      mostrarToast('Usuário não autenticado.', 'error');
      return;
    }
    const userId = session.user.id;
    const { error } = await supabaseClient
      .from('tarefas')
      .update({
        titulo: formData.get('titulo'),
        descricao: formData.get('descricao'),
        dataVencimento: data
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      mostrarToast('Erro ao editar tarefa.', 'error');
      return;
    }
    
    taskContent.style.display = 'block';
    taskActions.style.display = 'flex';
    editForm.style.display = 'none';
    carregarTarefas();
    mostrarToast('Tarefa editada com sucesso!');
  };
}

// Configurar campo de busca
document.querySelector('.search-input').addEventListener('input', (e) => {
  termoBusca = e.target.value;
  carregarTarefas();
});

// Configurar os botões de filtro
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    filtroAtual = btn.dataset.filter;
    carregarTarefas();
  });
});

// Funções auxiliares
function formatarData(data) {
  if (!data) return 'Sem data';
  const date = new Date(data);
  // Ajuste para evitar problemas de fuso horário
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString('pt-BR');
}

function formatarDataParaAPI(data) {
  if (!data) {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }
  const [dia, mes, ano] = data.split('/');
  // Garante que a data seja formatada corretamente para o backend
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

function aplicarMascaraData(input) {
  let valor = input.value.replace(/\D/g, '');
  if (valor.length > 8) valor = valor.slice(0, 8);
  
  if (valor.length >= 2) {
    valor = valor.slice(0, 2) + '/' + valor.slice(2);
  }
  if (valor.length >= 5) {
    valor = valor.slice(0, 5) + '/' + valor.slice(5);
  }
  
  input.value = valor;
  
  if (valor.length === 10) {
    const [dia, mes, ano] = valor.split('/');
    input.setAttribute('data-valor-api', `${ano}-${mes}-${dia}`);
  }
}

function ordenarTarefas(tarefas) {
  return tarefas.sort((a, b) => {
    if (ordenacao === 'data') {
      return new Date(a.dataVencimento) - new Date(b.dataVencimento);
    } else if (ordenacao === 'titulo') {
      // Extrai números do início dos títulos para comparação numérica
      const numA = parseInt(a.titulo.match(/^\d+/)?.[0] || '0');
      const numB = parseInt(b.titulo.match(/^\d+/)?.[0] || '0');
      
      // Se ambos títulos começam com números, compara numericamente
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numA - numB;
      }
      
      // Caso contrário, compara alfabeticamente
      return a.titulo.localeCompare(b.titulo);
    }
    return a.id - b.id;
  });
}

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

function mostrarModalConfirmacao(id) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <h2>Confirmar Exclusão</h2>
    <p>Tem certeza que deseja excluir esta tarefa?</p>
    <div class="modal-buttons">
      <button class="modal-button cancel">Cancelar</button>
      <button class="modal-button confirm">Excluir</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  return new Promise((resolve) => {
    modal.querySelector('.modal-button.cancel').onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };
    
    modal.querySelector('.modal-button.confirm').onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };
  });
}

async function excluir(id) {
  const confirmar = await mostrarModalConfirmacao(id);
  if (!confirmar) return;
  
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    mostrarToast('Usuário não autenticado.', 'error');
    return;
  }
  const userId = session.user.id;
  const { error } = await supabaseClient
    .from('tarefas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    mostrarToast('Erro ao excluir tarefa.', 'error');
    return;
  }
  const elementoTarefa = document.getElementById(`tarefa-${id}`);
  elementoTarefa.style.animation = 'slideOut 0.3s ease-out forwards';
  
  setTimeout(() => {
    elementoTarefa.remove();
    mostrarToast('Tarefa excluída com sucesso!');
    carregarTarefas();
    atualizarResumoEstatistico();
  }, 300);
}

// Configurar botão de ordenação
document.getElementById('ordenacao').addEventListener('change', (e) => {
  ordenacao = e.target.value;
  carregarTarefas();
});

// Monitora as mudanças no estado de autenticação do Supabase
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Usuário autenticado
    console.log('Usuário autenticado com ID:', session.user.id);
    configurarCabecalho();
    carregarTarefas();
    atualizarResumoEstatistico();
  } else if (event === 'SIGNED_OUT') {
    // Usuário desautenticado
    console.log('Usuário desautenticado');
    // Remove o elemento de informações do usuário
    const userInfo = document.querySelector('.user-info');
    if (userInfo) userInfo.remove();
    // Redireciona para a página de login
    window.location.href = 'login.html';
  }
});

// Configuração do flatpickr
flatpickr("input[name='dataVencimento']", {
  locale: "pt",
  dateFormat: "d/m/Y",
  allowInput: true,
  clickOpens: true,
  defaultDate: null,
  onChange: function([date], dateStr, instance) {
    instance.element.setAttribute('data-valor-api', date.toISOString().slice(0,10));
  }
});

// Verifica o estado de autenticação inicial ao carregar a página
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    console.log('Usuário autenticado na carga inicial com ID:', session.user.id);
    configurarCabecalho();
    carregarTarefas();
  } else {
    console.log('Usuário desautenticado na carga inicial');
    // Redireciona para a página de login se não estiver na página de login
    if (window.location.pathname !== '/login.html') {
      window.location.href = 'login.html';
    }
  }
})();

