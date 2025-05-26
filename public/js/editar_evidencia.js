// public/js/editar_evidencia.js
document.addEventListener('DOMContentLoaded', async () => {
  // autenticação
  let user;
  try {
    const r = await fetch('/api/auth/me', { credentials:'include' });
    if (!r.ok) throw new Error();
    user = await r.json();
    if (!['admin','assistente'].includes(user.role)) throw new Error();
  } catch {
    return window.location.href = '/';
  }

  document.getElementById('current-date').textContent =
    new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

  const params = new URLSearchParams(window.location.search);
  const evidenciaId = params.get('id');
  if (!evidenciaId) return window.location.href = '/gerenciar_casos.html';

  // carregar responsáveis
  try {
    const ur = await fetch('/api/users?limit=100',{credentials:'include'});
    const { data } = await ur.json();
    document.getElementById('responsavel-select').innerHTML =
      '<option value="">Selecione...</option>' +
      data.filter(u=>['admin','assistente'].includes(u.role))
          .map(u=>`<option value="${u.username}">${u.username} (${u.role})</option>`)
          .join('');
  } catch { alert('Erro ao carregar responsáveis'); }

  // carregar evidência e caso
  let ev;
  try {
    const er = await fetch(`/api/evidencias/${evidenciaId}`,{credentials:'include'});
    if (!er.ok) throw new Error();
    ev = await er.json();

    // preenche dados
    document.getElementById('evidence-id').textContent = ev._id;
    document.getElementById('evidencia-id').value    = ev._id;
    document.getElementById('evidence-creation-date').textContent =
      new Date(ev.createdAt).toLocaleDateString('pt-BR');
    document.getElementById('evidence-creator').textContent =
      ev.registradoPor?.username || 'Não informado';

    const cr = await fetch(`/api/casos/${ev.caso}`,{credentials:'include'});
    if (cr.ok) {
      const caso = (await cr.json()).caso;
      document.getElementById('caso-vinculado-info').textContent =
        `${caso.numeroCaso} – ${caso.titulo}`;
      document.getElementById('caso-id-display').textContent = ev.caso;
    }

    document.getElementById('tipo-input').value         = ev.tipo;
    document.getElementById('descricao-input').value    = ev.descricao;
    document.getElementById('responsavel-select').value = ev.responsavelColeta || '';
    document.getElementById('date-input').value         = ev.dataColeta.split('T')[0];
    document.getElementById('current-file-name').textContent =
      ev.arquivo?.filename || 'Sem arquivo';
    document.getElementById('ultima-atualizacao').value =
      ev.updatedAt ? new Date(ev.updatedAt).toLocaleString('pt-BR') : 'Nunca';

    if (ev.arquivo?.filename.match(/\.(jpe?g|png|gif)$/i)) {
      document.getElementById('preview-image').src = `/api/evidencias/${ev._id}/arquivo`;
    }
  } catch {
    return window.location.href = '/gerenciar_casos.html';
  }

  // preview ao trocar arquivo
  document.getElementById('file-input').addEventListener('change',e=>{
    const f = e.target.files[0];
    if (f?.type.startsWith('image/')) {
      const r=new FileReader(); r.onload=e=>document.getElementById('preview-image').src=e.target.result; r.readAsDataURL(f);
    } else {
      document.getElementById('preview-image').src='images/document-icon.png';
    }
  });

  // cancelar
  document.querySelector('.cancel-btn').addEventListener('click',()=>{
    if(confirm('Cancelar edição?')) window.location.href='/gerenciar_casos.html';
  });

  // excluir
  document.querySelector('.delete-btn').addEventListener('click',async()=>{
    if(!confirm('Excluir evidência?')) return;
    const dr=await fetch(`/api/evidencias/${evidenciaId}`,{method:'DELETE',credentials:'include'});
    if(!dr.ok) { const err=await dr.json(); alert(err.message); }
    else window.location.href='/gerenciar_casos.html';
  });

  // salvar
  document.getElementById('evidence-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData();
    fd.append('tipo',document.getElementById('tipo-input').value);
    fd.append('descricao',document.getElementById('descricao-input').value);
    fd.append('responsavelColeta',document.getElementById('responsavel-select').value);
    fd.append('dataColeta',document.getElementById('date-input').value);
    const f=document.getElementById('file-input').files[0]; if(f) fd.append('arquivo',f);
    const ur=await fetch(`/api/evidencias/${evidenciaId}`,{method:'PUT',credentials:'include',body:fd});
    if(!ur.ok) { const err=await ur.json(); alert(err.message); }
    else window.location.href='/gerenciar_casos.html';
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