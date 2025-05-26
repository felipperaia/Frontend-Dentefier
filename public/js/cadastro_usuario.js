document.addEventListener('DOMContentLoaded', async () => {
  // Atualiza data atual
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // Autenticação e verificação de permissão (apenas admin)
  let currentUser;
  try {
    const authRes = await fetch('/api/auth/me', { credentials: 'include' });
    if (!authRes.ok) throw new Error();
    currentUser = await authRes.json();
  } catch (err) {
    alert('Você precisa estar logado.');
    return window.location.href = '/';
  }

  // Exibe papel do usuário logado
  const papelEl = document.getElementById('usuario-papel');
  if (papelEl) papelEl.textContent = currentUser.role;

  if (currentUser.role !== 'admin') {
    alert('Apenas administradores podem acessar esta página.');
    return window.location.href = '/';
  }

  // Manipula envio do formulário de cadastro
  const form = document.getElementById('user-form');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const fm = new FormData(form);
    const payload = {
      username: fm.get('username'),
      password: fm.get('password'),
      role:     fm.get('tipo_usuario'),
      email:    fm.get('email'),
      phone:    fm.get('phone') || undefined,
      department: fm.get('department') || undefined
    };

    try {
      const resp = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.message || resp.statusText);

      alert('Usuário cadastrado com sucesso!');
      window.location.href = 'gerenciar_usuario.html';
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      alert('Erro ao cadastrar usuário: ' + (error.message || 'Erro desconhecido'));
    }
  });
});

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