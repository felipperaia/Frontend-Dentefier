(async () => {
  // 1) Autenticação + role
  let user;
  try {
    const r = await fetch('https://backend-dentefier.onrender.com/api/auth/me', { credentials: 'include' });
    if (!r.ok) throw new Error();
    user = await r.json();
  } catch {
    alert('Você precisa estar logado.');
    return window.location.href = '/';
  }
  if (user.role !== 'admin') {
    alert('Acesso negado.');
    return window.location.href = '/';
  }

  // 2) UI inicial
  document.getElementById('current-date').textContent =
    new Date().toLocaleDateString('pt-BR', { year:'numeric', month:'long', day:'numeric' });
  document.getElementById('usuario-papel').textContent = user.role;
  document.querySelectorAll('.admin-only')
    .forEach(el => el.style.display = user.role === 'admin' ? 'block' : 'none');

  // 3) Estado de paginação e sort
  let currentPage = 1;
  const rows = 10;
  let sortCol = 'username';
  let sortDir = 'asc';

  const API = '/api/users';

  // 4) Função genérica de renderização
  async function fetchUsers() {
    const url = new URL(API, window.location.origin);
    url.searchParams.set('page', currentPage);
    url.searchParams.set('limit', rows);
    url.searchParams.set('sort', sortCol);
    url.searchParams.set('order', sortDir);
    url.searchParams.set('search', document.getElementById('search-input').value);
    url.searchParams.set('role', document.getElementById('filter-tipo').value);

    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) return window.location.href = '/';
      throw new Error('Erro ao carregar usuários');
    }
    return res.json(); 
  }

  async function renderUsers() {
    const { data, pagination } = await fetchUsers();
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    data.forEach(u => {
      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.phone || '—'}</td>
          <td><span class="tag tag-${u.role}">${u.role}</span></td>
          <td>${u.department || '—'}</td>
          <td>${new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
          <td>
          <div style="display: flex; gap: 5px;">
            <button onclick="viewUser('${u._id}')">🔍</button>
            <button onclick="editUser('${u._id}')">✏️</button>
            <button onclick="promptDelete('${u._id}','${u.username}')">🗑️</button>
          </td>
        </tr>
      `);
    });
    document.getElementById('users-count').textContent = data.length;
    document.getElementById('total-users').textContent = pagination.totalDocs;
    renderPagination(pagination.totalPages);
  }

  // 5) Busca e filtro
  window.filterUsers = () => {
    currentPage = 1;
    renderUsers();
  };
  document.getElementById('search-btn').onclick = filterUsers;
  document.getElementById('filter-tipo').onchange = filterUsers;

  // 6) Ordenação
  window.sortTable = idx => {
    const cols = ['username','email','phone','role','department','createdAt'];
    const col = cols[idx];
    if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else {
      sortCol = col;
      sortDir = 'asc';
    }
    renderUsers();
  };

  // 7) Paginação UI
  function renderPagination(totalPages) {
    const pag = document.getElementById('pagination');
    pag.innerHTML = '';
    if (totalPages < 2) return;

    const makeBtn = (txt,disabled,cb) => {
      const b = document.createElement('button');
      b.innerHTML = txt;
      b.disabled = disabled;
      b.addEventListener('click', cb);
      if (!disabled && txt === String(currentPage)) b.classList.add('active');
      return b;
    };

    pag.appendChild(makeBtn('&laquo;', currentPage === 1, () => { currentPage--; renderUsers(); }));
    for (let i = 1; i <= totalPages; i++) {
      pag.appendChild(makeBtn(i, false, () => { currentPage = i; renderUsers(); }));
    }
    pag.appendChild(makeBtn('&raquo;', currentPage === totalPages, () => { currentPage++; renderUsers(); }));
  }

  // 8) Delete com modal
  window.promptDelete = (id,name) => {
    document.getElementById('user-to-delete').textContent = name;
    document.getElementById('delete-modal').classList.add('open');
    window.confirmDelete = async () => {
      const r = await fetch(`https://backend-dentefier.onrender.com/api/users/${id}`, { method:'DELETE', credentials:'include' });
      if (r.ok) {
        renderUsers(); 
        closeDeleteModal();
        const notif = document.getElementById('notification');
        notif.classList.add('show');
        setTimeout(()=>notif.classList.remove('show'),3000);
      } else alert('Erro ao excluir');
    };
    window.closeDeleteModal = () => document.getElementById('delete-modal').classList.remove('open');
  };

  // 9) View/Edit
  window.viewUser = id => window.location.href = `detalhes_usuario.html?id=${id}`;
  window.editUser = id => window.location.href = `editar_usuario.html?id=${id}`;

  // 10) Iniciar
  renderUsers();
})();
document.addEventListener('DOMContentLoaded', () => {
  const btnContrast = document.getElementById('btn-contrast');
  const btnFontInc = document.getElementById('btn-font-increase');
  const btnFontDec = document.getElementById('btn-font-decrease');

  // 1) Dark / Light Mode
  btnContrast.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    // opcional: salvar preferência no localStorage
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  // 2) Fonte maior / menor
  const root = document.documentElement;
  const getFontSize = () => parseFloat(getComputedStyle(root).getPropertyValue('--base-font-size'));
  const setFontSize = size => root.style.setProperty('--base-font-size', size + 'px');

  btnFontInc.addEventListener('click', () => {
    let size = getFontSize();
    if (size < 24) setFontSize(size + 2);
    localStorage.setItem('fontSize', getFontSize());
  });

  btnFontDec.addEventListener('click', () => {
    let size = getFontSize();
    if (size > 12) setFontSize(size - 2);
    localStorage.setItem('fontSize', getFontSize());
  });

  // 3) Ao carregar, reaplica preferências salvas
  const savedDark = localStorage.getItem('darkMode') === 'true';
  if (savedDark) document.body.classList.add('dark-mode');
  const savedFont = parseFloat(localStorage.getItem('fontSize'));
  if (savedFont) setFontSize(savedFont);
});
