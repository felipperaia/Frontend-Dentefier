// public/js/tela_inicio.js

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos
  const nomeEl = document.getElementById('usuario-nome');
  const papelEl = document.getElementById('usuario-papel');
  const dateEl = document.getElementById('current-date');
  const openEl = document.getElementById('casos-abertos');
  const doneEl = document.getElementById('casos-encerrados');
  const archivedEl = document.getElementById('casos-arquivados');
  const recentBody = document.getElementById('recent-cases-body');

  // Data atual
  dateEl.textContent = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

  try {
    // 1. Usuário
    const userRes = await fetch('https://backend-dentefier.onrender.com/api/auth/me', { credentials: 'include' });
    if (!userRes.ok) throw new Error('Não autenticado');
    const user = await userRes.json();
    nomeEl.textContent = user.username;
    papelEl.textContent = user.role;
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = user.role === 'admin' ? 'block' : 'none');

    // 2. Carregar casos
    const casosRes = await fetch('https://backend-dentefier.onrender.com/api/casos', { credentials: 'include' });
    if (!casosRes.ok) throw new Error('Erro ao buscar casos');
    const casos = await casosRes.json();

    // 3. Mapear responsáveis
    const userMap = {};
    const uniqueIds = [...new Set(casos.map(c => c.responsavel).filter(Boolean))];
    await Promise.all(uniqueIds.map(async id => {
      try {
        const r = await fetch(`https://backend-dentefier.onrender.com/api/users/${id}`, { credentials: 'include' });
        if (r.ok) {
          const u = await r.json();
          userMap[id] = u.username;
        } else {
          userMap[id] = 'Não informado';
        }
      } catch {
        userMap[id] = 'Não informado';
      }
    }));

    // 4. Contagem de status
    const statusCount = casos.reduce((a, c) => (a[c.status] = (a[c.status] || 0) + 1, a), {});
    openEl.textContent = statusCount['Em andamento'] || 0;
    doneEl.textContent = statusCount['Finalizado'] || 0;
    archivedEl.textContent = statusCount['Arquivado'] || 0;

    // 5. Gráficos
    // Status
    new Chart(document.getElementById('status-chart').getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Em andamento', 'Finalizado', 'Arquivado'],
        datasets: [{
          data: [
            statusCount['Em andamento'] || 0,
            statusCount['Finalizado'] || 0,
            statusCount['Arquivado'] || 0
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(201, 203, 207, 0.7)'
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'white', // Define a cor do texto das legendas como branco
              font: {
                size: 12 // Opcional: define o tamanho da fonte
              }
            }  
          }
        }
      }
    });

    // Tipo de caso
    const typeCount = casos.reduce((a, c) => (a[c.contexto.tipoCaso] = (a[c.contexto.tipoCaso] || 0) + 1, a), {});
    const tiposCasos = Object.keys(typeCount);

    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(255, 205, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(201, 203, 207, 0.7)'
    ];

    const typeBackgroundColors = tiposCasos.map((_, index) =>
      backgroundColors[index % backgroundColors.length]);

    new Chart(document.getElementById('type-chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: tiposCasos,
        datasets: [{
          label: 'Qtd',
          data: Object.values(typeCount),
          backgroundColor: typeBackgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          
          y: {
            beginAtZero: true,
            ticks: {
              color: 'white' // Define a cor dos números do eixo Y como branca
            },
          },
          x: {
            beginAtZero: true,
            ticks: {
              color: 'white' // Define a cor dos números do eixo Y como branca
            },
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Casos por Responsável (Atualizado)
    const expertCount = casos.reduce((a, c) => {
      const responsavelId = c.responsavel;
      const username = userMap[responsavelId] || 'Não informado';
      a[username] = (a[username] || 0) + 1;
      return a;
    }, {});

    new Chart(document.getElementById('expert-chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(expertCount),
        datasets: [{
          label: 'Casos',
          data: Object.values(expertCount),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'white' // Define a cor dos números do eixo Y como branca
            },
          },
          x: {
            beginAtZero: true,
            ticks: {
              color: 'white' // Define a cor dos números do eixo Y como branca
            },
          }
        }
      }
    });

    // 6. Casos Recentes (Atualizado)
    const sorted = casos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    recentBody.innerHTML = '';
    sorted.forEach(c => {
      const tr = document.createElement('tr');
      const responsavelId = c.responsavel;
      const responsavelUsername = userMap[responsavelId] || 'Não informado';

      tr.innerHTML = `
        <td><a href="detalhes_caso.html?id=${c._id}" style="color: white;">${c.titulo}</a></td>
        <td>${c.contexto.tipoCaso}</td>
        <td>${c.status}</td>
        <td>${new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
        <td>${responsavelUsername}</td>
        <td><button class="btn-link" onclick="window.location.href='detalhes_caso.html?id=${c._id}'">Ver</button></td>
      `;
      recentBody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    window.location.href = '/';
  }
});

// Acessibilidade (mantido igual)
document.addEventListener('DOMContentLoaded', () => {
  const btnContrast = document.getElementById('btn-contrast');
  const btnFontInc = document.getElementById('btn-font-increase');
  const btnFontDec = document.getElementById('btn-font-decrease');
  const root = document.documentElement;

  const getFontSize = () => parseFloat(getComputedStyle(root).getPropertyValue('--base-font-size'));
  const setFontSize = size => root.style.setProperty('--base-font-size', size + 'px');

  btnContrast.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

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

  if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
  const savedFont = parseFloat(localStorage.getItem('fontSize'));
  if (savedFont) setFontSize(savedFont);
});