// js/editar_usuario.js
(async () => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) return alert('ID de usuário ausente.');
  
    // busca dados iniciais
    const resUser = await fetch(`https://backend-dentefier.onrender.com/api/users/${id}`, { credentials:'include' });
    if (!resUser.ok) return alert('Não foi possível obter dados do usuário.');
    const user = await resUser.json();
  
    const form = document.getElementById('form-edicao');
    form.username.value = user.username;
    form.email.value    = user.email;
    form.role.value     = user.role;
    form.phone.value    = user.phone || '';
    form.department.value = user.department || '';
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = {
        username: form.username.value,
        email: form.email.value,
        phone: form.phone.value,
        department: form.department.value
      };
      const res = await fetch(`https://backend-dentefier.onrender.com/api/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert('Usuário atualizado com sucesso!');
        window.location.href = 'gerenciar_usuario.html';
      } else {
        const err = await res.json();
        document.getElementById('msg-error').textContent = err.message || 'Erro desconhecido';
      }
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