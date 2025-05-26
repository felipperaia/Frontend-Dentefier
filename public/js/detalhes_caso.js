// public/js/detalhes_caso.js
document.addEventListener('DOMContentLoaded', async () => {
  const loading       = document.querySelector('.loading-overlay');
  const show          = () => loading.style.display = 'flex';
  const hide          = () => loading.style.display = 'none';
  const params        = new URLSearchParams(window.location.search);
  const caseId        = params.get('id');
  let currentCase, evidencias, user;

  show();
  try {
    const ur = await fetch('/api/auth/me', { credentials:'include' });
    if (!ur.ok) throw 'Não autenticado';
    user = await ur.json();

    const cr = await fetch(`/api/casos/${caseId}`, { credentials:'include' });
    if (!cr.ok) throw 'Caso não encontrado';
    const data = await cr.json();
    currentCase = data.caso;
    evidencias  = data.evidencias;

    renderCase();
    bindEvents();
    setPermissions();
  } catch (err) {
    alert(err);
    window.location.href = 'gerenciar_casos.html';
  } finally {
    hide();
  }

  function renderCase() {
    document.getElementById('case-title').textContent        = currentCase.titulo;
    document.getElementById('current-date').textContent      = new Date().toLocaleDateString('pt-BR');
    const perito = currentCase.responsavel?.username || 'Não atribuído';
    document.getElementById('perito-responsavel').textContent = perito;

    document.querySelectorAll('.report-data').forEach(el => {
      const path = el.dataset.field;
      const val  = get(currentCase, path);
      el.textContent = format(path, val);
    });

    const st    = get(currentCase, 'status');
    const badge = document.querySelector('.status-badge');
    badge.textContent = st;
    badge.className   = `status-badge ${statusClass(st)}`;

    const tb = document.getElementById('evidencias-body');
    tb.innerHTML = evidencias.map(ev => {
      return `<tr>
        <td><input type="checkbox" class="evidence-check" value="${ev._id}"></td>
        <td>${ev.tipo}</td>
        <td>${ev.descricao}</td>
        <td>${new Date(ev.dataColeta).toLocaleDateString('pt-BR')}</td>
        <td>${ev.responsavelColeta || 'N/A'}</td>
        <td class="evidence-actions">
          ${ev.arquivo ? `<button class="btn-evidence btn-view" onclick="viewEvidence('${ev._id}')">Visualizar</button>` : ''}
          ${canEditEvidence() ? `<button class="btn-evidence btn-edit" onclick="editEvidence('${ev._id}')">Editar</button>` : ''}
          ${canDeleteEvidence() ? `<button class="btn-evidence btn-delete" onclick="deleteEvidence('${ev._id}')">Excluir</button>` : ''}
        </td>
      </tr>`;
    }).join('');
    document.getElementById('total-evidencias').textContent = evidencias.length;
  }

  function bindEvents() {
    document.getElementById('edit-case-btn').onclick       = toggleEdit;
    document.getElementById('save-case-btn').onclick       = save;
    document.getElementById('generate-report-btn').onclick = report;
    document.getElementById('select-all').onchange         = e => {
      document.querySelectorAll('.evidence-check')
              .forEach(c => c.checked = e.target.checked);
    };
  }

  function setPermissions() {
    const admin  = user.role === 'admin';
    const perito = user.role === 'perito';
    document.getElementById('edit-case-btn').style.display     = (admin || perito) ? 'inline-block' : 'none';
    document.getElementById('generate-report-btn').style.display = (admin || perito) ? 'inline-block' : 'none';
  }

  function canEditEvidence()   { return ['admin', 'assistente'].includes(user.role); }
  function canDeleteEvidence() { return user.role === 'admin'; }

  window.viewEvidence = id => window.open(`/api/evidencias/${id}/arquivo`, '_blank');
  window.editEvidence = id => window.location.href = `editar_evidencia.html?id=${id}`;

  window.deleteEvidence = async id => {
    if (!confirm('Confirma exclusão desta evidência?')) return;
    show();
    try {
      const res = await fetch(`/api/evidencias/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw 'Erro ao excluir';
      alert('Evidência excluída com sucesso!');
      // recarregar lista
      const idx = evidencias.findIndex(e => e._id === id);
      evidencias.splice(idx, 1);
      renderCase();
    } catch (e) {
      alert(e);
    } finally {
      hide();
    }
  };


    function toggleEdit() {
      const editing=document.body.classList.toggle('edit-mode');
      document.getElementById('edit-case-btn').textContent = editing?'Cancelar':'Editar Caso';
      document.getElementById('save-case-btn').style.display=editing?'inline-block':'none';
      if(editing) makeInputs(); else renderCase();
    }

    function makeInputs() {
      document.querySelectorAll('.report-data').forEach(el=>{
        const path=el.dataset.field;
        const val=get(currentCase,path)||'';
        if(path==='responsavel'){
          if(user.role!=='admin') return;
          // carregar select de usuários
          fetch('/api/users',{credentials:'include'}).then(r=>r.json()).then(list=>{
            el.innerHTML=`<select data-field="responsavel">${list.map(u=>`<option value="${u._id}"${u._id===currentCase.responsavel?' selected':''}>${u.username}</option>`).join('')}</select>`;
          });
        } else {
          el.innerHTML=`<input data-field="${path}" value="${val}">`;
        }
      });
    }

    async function save() {
        show();
        const body = {};
        document.querySelectorAll('.edit-mode .report-data').forEach(el => {
          // só processa se houver controle dentro
          const ctl = el.querySelector('input[data-field], select[data-field]');
          if (!ctl) return;
          const key = ctl.getAttribute('data-field');
          const val = ctl.value;
          set(body, key, val);
        });
        try {
          const res = await fetch(`/api/casos/${caseId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw 'Erro ao salvar';
          currentCase = (await res.json()).caso;
          toggleEdit();
          alert('Alterações salvas com sucesso!');
        } catch (e) {
          alert(e);
        } finally {
          hide();
        }
      }

      function report() {
        const ids = Array.from(document.querySelectorAll('.evidence-check:checked'))
                         .map(c => c.value);
        if (!ids.length) return alert('Selecione evidências');
        // passa o mesmo nome de parâmetro que relatorio.js lê: "id"
        location.href = `relatorio.html?id=${caseId}&evidencias=${ids.join(',')}`;
      }

    window.viewEvidence=id=>window.open(`/api/evidencias/${id}/arquivo`,'_blank');
    
 // Função para editar evidência
 window.editEvidence = id => {
  window.location.href = `editar_evidencia.html?id=${id}`;
};

    // utilitários:
    function get(obj,path){return path.split('.').reduce((o,p)=>o?.[p],obj);}      
    function set(obj, path, val) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === undefined) current[key] = {};
      current = current[key];
    }
    current[keys[keys.length - 1]] = val;
  }
    function format(path,val){ if(path.includes('Data')||path.includes('data')) return val?new Date(val).toLocaleDateString('pt-BR'):'Não informado'; return val||'Não informado'; }
    function statusClass(st){ return {'Em andamento':'open','Finalizado':'closed','Arquivado':'archived'}[st]||''; }
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