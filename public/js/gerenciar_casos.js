// public/js/gerenciar_casos.js

document.addEventListener('DOMContentLoaded', async () => {
  // Verifica autenticação e ajusta visibilidade
  let user;
  try {
    const me = await fetch('https://backend-dentefier.onrender.com/api/auth/me', { credentials: 'include' });
    if (!me.ok) throw new Error('Não autenticado');
    user = await me.json();
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = user.role === 'admin' ? 'block' : 'none';
    });
  } catch {
    return window.location.href = '/';
  }

  // Define data atual
  const hoje = new Date();
  document.getElementById('current-date').textContent = hoje.toLocaleDateString('pt-BR');
  document.getElementById('current-year').textContent = hoje.getFullYear();

  // Botão novo caso
  const btnNew = document.getElementById('new-case-btn');
  if (btnNew) {
    btnNew.style.display = user.role === 'assistente' ? 'none' : 'inline-block';
    btnNew.onclick = () => window.location.href = '/cadastro_casounico.html';
  }

  // Configura filtros iniciais pela URL
  const params = new URLSearchParams(window.location.search);
  const statusParam = params.get('statusF');
  if (statusParam) {
    const statusSelect = document.getElementById('filter-status');
    if ([...statusSelect.options].some(o => o.value === statusParam)) {
      statusSelect.value = statusParam;
    }
  }

  // 1) Carrega casos sem popular responsavel
  let allCases = [];
  try {
    const rc = await fetch('https://backend-dentefier.onrender.com/api/casos', { credentials: 'include' });
    if (!rc.ok) throw new Error('Erro ao carregar casos');
    allCases = await rc.json();
  } catch (e) {
    console.error(e);
    allCases = [];
  }

  // 2) Preload usernames de cada responsavel via GET /api/users/:id
  const userMap = {};
  const uniqueIds = [...new Set(allCases.map(c => c.responsavel).filter(Boolean))];
  await Promise.all(uniqueIds.map(async id => {
    try {
      const res = await fetch(`https://backend-dentefier.onrender.com/api/users/${id}`, { credentials: 'include' });
      if (res.ok) {
        const u = await res.json();
        userMap[id] = u.username;
      }
    } catch { /* ignorar falhas por usuário */ }
  }));

  const perPage = 6;
  let currentPage = 1;

  // Carrega página e aplica filtros
  function loadPage(page) {
    currentPage = page;
    const statusF = document.getElementById('filter-status').value;
    const typeF   = document.getElementById('filter-type').value;
    const q       = document.getElementById('search-input').value.toLowerCase();

    const filtered = allCases.filter(c =>
      (statusF === 'todos' || c.status === statusF) &&
      (typeF   === 'todos' || c.contexto.tipoCaso === typeF) &&
      (!q || c.titulo.toLowerCase().includes(q) || c.numeroCaso.toLowerCase().includes(q))
    );

    const start = (page - 1) * perPage;
    renderCaseCards(filtered.slice(start, start + perPage));
    createPagination(filtered.length);
  }

  // Renderiza cards de caso
  function renderCaseCards(casos) {
    const container = document.getElementById('cases-container');
    container.innerHTML = '';
    if (!casos.length) {
      container.innerHTML = '<p class="no-results">Nenhum caso encontrado.</p>';
      return;
    }

    casos.forEach(c => {
      const statusClass = c.status === 'Finalizado' ? 'status-finalizado'
        : c.status === 'Arquivado' ? 'status-arquivado' : 'status-aberto';
      const dateFmt = new Date(c.dataAbertura).toLocaleDateString('pt-BR');

      const canEvidence = ['admin','assistente'].includes(user.role);
      const canReport   = ['admin','perito'].includes(user.role);

      // Usa o mapa para traduzir id para username
      const responsavelUsername = userMap[c.responsavel] || 'Não informado';

      container.insertAdjacentHTML('beforeend', `
        <div class="case-card">
          <div class="case-header">
            <h3>${c.titulo}</h3>
            <span>${c.contexto.tipoCaso}</span>
          </div>
          <div class="case-body">
            <p><strong>Código:</strong> #${c.numeroCaso}</p>
            <p><strong>Data:</strong> ${dateFmt}</p>
            <p><strong>Responsável:</strong> ${responsavelUsername}</p>
            <p><strong>Status:</strong> <span class="status-indicator ${statusClass}"></span> ${c.status}</p>
            <div class="case-actions">
              <a href="detalhes_caso.html?id=${c._id}"><button class="btn-view">Visualizar</button></a>
              ${canEvidence ? `<a href="evidencia.html?id=${c._id}"><button class="btn-evidence">Evidências</button></a>` : ''}
              ${canReport   ? `<a href="relatorio.html?id=${c._id}"><button class="btn-report">Relatório</button></a>` : ''}
            </div>
          </div>
        </div>
      `);
    });
  }

  // Cria paginação
  function createPagination(total) {
    const totalPages = Math.ceil(total / perPage);
    const pag = document.getElementById('pagination-container');
    pag.innerHTML = '';
    if (totalPages < 2) return;
    const btn = (txt, disabled, onClick) => {
      const b = document.createElement('button');
      b.innerHTML = txt;
      b.disabled = disabled;
      b.onclick = onClick;
      return b;
    };

    pag.appendChild(btn('&laquo;', currentPage === 1, () => loadPage(currentPage - 1)));
    for (let i = 1; i <= totalPages; i++) {
      const b = btn(i, false, () => loadPage(i));
      if (i === currentPage) b.classList.add('active');
      pag.appendChild(b);
    }
    pag.appendChild(btn('&raquo;', currentPage === totalPages, () => loadPage(currentPage + 1)));
  }

  // Inicializa a primeira página
  loadPage(1);

  // Eventos de filtro e busca
  document.getElementById('filter-status').onchange = () => loadPage(1);
  document.getElementById('filter-type').onchange   = () => loadPage(1);
  document.getElementById('search-btn').onclick     = () => loadPage(1);
  document.getElementById('search-input').onkeypress = e => e.key === 'Enter' && loadPage(1);
});

// Acessibilidade: contraste e tamanho de fonte
document.addEventListener('DOMContentLoaded', () => {
  const btnContrast = document.getElementById('btn-contrast');
  const btnFontInc  = document.getElementById('btn-font-increase');
  const btnFontDec  = document.getElementById('btn-font-decrease');
  const root        = document.documentElement;
  const getFontSize = () => parseFloat(getComputedStyle(root).getPropertyValue('--base-font-size'));
  const setFontSize = size => root.style.setProperty('--base-font-size', size + 'px');

  btnContrast.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
  btnFontInc.addEventListener('click', () => {
    let size = getFontSize(); if (size < 24) setFontSize(size + 2);
    localStorage.setItem('fontSize', getFontSize());
  });
  btnFontDec.addEventListener('click', () => {
    let size = getFontSize(); if (size > 12) setFontSize(size - 2);
    localStorage.setItem('fontSize', getFontSize());
  });
  if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
  const savedFont = parseFloat(localStorage.getItem('fontSize'));
  if (savedFont) setFontSize(savedFont);
});