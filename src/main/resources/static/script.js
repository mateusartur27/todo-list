// script.js
const API = '/tarefas';
let filtroAtual = 'all';
let ordenacao = 'data'; // Opções: 'data' ou 'titulo'

async function carregarTarefas() {
  const resp = await fetch(API);
  const tarefas = await resp.json();
  const ul = document.getElementById('lista-tarefas');
  
  let tarefasFiltradas = filtrarTarefas(tarefas);
  tarefasFiltradas = ordenarTarefas(tarefasFiltradas);
  
  ul.innerHTML = tarefasFiltradas.map(t => `
    <li class="${t.status === 'CONCLUIDA' ? 'completed' : ''}">
      <div class="task-content">
        <span class="task-title">${t.titulo}</span>
        <span class="task-description">${t.descricao}</span>
        <span class="task-date">${formatarData(t.dataVencimento)}</span>
        <span class="task-status">${t.status === 'CONCLUIDA' ? '✓ Concluída' : '⌛ Pendente'}</span>
      </div>
      <div class="task-actions">
        ${t.status !== 'CONCLUIDA' ? `<button onclick="concluir(${t.id})" title="Marcar como concluída"><i class="fas fa-check"></i></button>` : ''}
        <button onclick="editar(${t.id})" title="Editar tarefa"><i class="fas fa-edit"></i></button>
        <button onclick="excluir(${t.id})" title="Excluir tarefa"><i class="fas fa-trash"></i></button>
      </div>
    </li>
  `).join('');
}

function filtrarTarefas(tarefas) {
  switch(filtroAtual) {
    case 'concluida':
      return tarefas.filter(t => t.status === 'CONCLUIDA');
    case 'pendente':
      return tarefas.filter(t => t.status !== 'CONCLUIDA');
    default:
      return tarefas;
  }
}


document.getElementById('nova-tarefa')
  .addEventListener('submit', async e => {
    e.preventDefault();
    const title = e.target.titulo.value;
    const desc = e.target.descricao.value;
    const data = e.target.dataVencimento.value;
    
    await fetch(API, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
        titulo: title,
        descricao: desc,
        dataVencimento: data
      })
    });
    e.target.reset();
    carregarTarefas();
  });

async function concluir(id) {
  await fetch(`${API}/${id}/concluir`, { method: 'PATCH' });
  carregarTarefas();
}

async function editar(id) {
  const novoTitulo = prompt('Novo título:');
  if (!novoTitulo) return;
  const novaDesc = prompt('Nova descrição:');
  if (!novaDesc) return;
  const novaData = prompt('Nova data de vencimento (DD/MM/AAAA):');
  if (!novaData) return;
  
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      titulo: novoTitulo,
      descricao: novaDesc,
      dataVencimento: formatarDataParaAPI(novaData)
    })
  });
  carregarTarefas();
}

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
  return new Date(data).toLocaleDateString('pt-BR');
}

function formatarDataParaAPI(data) {
  if (!data) return null;
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

function ordenarTarefas(tarefas) {
  return tarefas.sort((a, b) => {
    if (ordenacao === 'data') {
      return new Date(a.dataVencimento) - new Date(b.dataVencimento);
    }
    return a.titulo.localeCompare(b.titulo);
  });
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  mostrarToast('Tarefa excluída com sucesso!');
  carregarTarefas();
}

// Configurar botão de ordenação
document.getElementById('ordenacao').addEventListener('change', (e) => {
  ordenacao = e.target.value;
  carregarTarefas();
});

window.onload = carregarTarefas;
