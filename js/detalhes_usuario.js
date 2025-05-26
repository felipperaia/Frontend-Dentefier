// js/detalhes_usuario.js
(async () => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) return alert('ID de usuário ausente.');
  
    const res = await fetch(`https://backend-dentefier.onrender.com/api/users/${id}`, { credentials:'include' });
    if (!res.ok) return alert('Usuário não encontrado.');
    const u = await res.json();
  
    const dl = document.getElementById('detalhes-list');
    const fields = [
      ['Nome de usuário', u.username],
      ['E-mail', u.email],
      ['Função', u.role],
      ['Telefone', u.phone || '—'],
      ['Departamento', u.department || '—'],
      ['Criado em', new Date(u.createdAt).toLocaleString('pt-BR')],
      ['Atualizado em', new Date(u.updatedAt).toLocaleString('pt-BR')]
    ];
    fields.forEach(([label, val]) => {
      dl.insertAdjacentHTML('beforeend', `<dt>${label}</dt><dd>${val}</dd>`);
    });
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