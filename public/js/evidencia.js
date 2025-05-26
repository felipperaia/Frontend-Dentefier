// js/evidencia.js

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Autenticação e autorização
  let user;
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) throw new Error('Não autenticado');
    user = await res.json();
  } catch {
    return window.location.href = '/';
  }
  if (!['admin', 'assistente'].includes(user.role)) {
    alert('Acesso negado.');
    return window.location.href = '/';
  }

  document.getElementById('user-display').value = user.username;
  document.getElementById('user-id').value = user._id;

  // 2) Data atual e valor padrão da coleta
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('current-date').textContent = hoje;
  document.getElementById('date-input').value = new Date().toISOString().slice(0, 10);

  // 3) Preview de arquivo
  const fileInput = document.getElementById('file-input');
  const previewImg = document.getElementById('preview-image');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => previewImg.src = e.target.result;
      reader.readAsDataURL(file);
    } else {
      previewImg.src = 'images/placeholder-image.png';
    }
  });

  // 4) Carregar casos dinamicamente
  try {
    const casosRes = await fetch('/api/casos', { credentials: 'include' });
    if (!casosRes.ok) throw new Error();
    const casos = await casosRes.json();
    const selectCaso = document.getElementById('caso-select');
    selectCaso.innerHTML = '<option value="">Selecione um caso</option>' +
      casos.map(c => `<option value="${c._id}">${c.numeroCaso} - ${c.titulo}</option>`).join('');
  } catch {
    alert('Erro ao carregar casos.');
  }

  // 5) Carregar responsáveis (admin e assistente)
  try {
    const usersRes = await fetch('/api/users?limit=100', { credentials: 'include' });
    if (!usersRes.ok) throw new Error();
    const { data } = await usersRes.json();
    const selectResp = document.getElementById('responsavel-select');
    selectResp.innerHTML = '<option value="">Selecione um usuário</option>' +
      data
        .filter(u => ['admin', 'assistente'].includes(u.role))
        .map(u => `<option value="${u.username}">${u.username} (${u.role})</option>`)
        .join('');
  } catch {
    alert('Erro ao carregar responsáveis.');
  }

  // 6) Cancelar
  document.querySelector('.cancel-btn').addEventListener('click', () => {
    if (confirm('Deseja cancelar?')) window.location.href = '/tela_inicio.html';
  });

  // 7) Submeter formulário
  document.getElementById('evidence-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    try {
      const resp = await fetch('/api/evidencias', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.message || 'Erro ao criar evidência');
      }
      alert('Evidência cadastrada com sucesso!');
      window.location.href = '/tela_inicio.html';
    } catch (err) {
      console.error(err);
      alert(err.message);
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