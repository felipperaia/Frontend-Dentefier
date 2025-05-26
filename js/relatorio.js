document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1) Autenticação e usuário
    const ru = await fetch('https://backend-dentefier.onrender.com/api/auth/me', { credentials: 'include' });
    if (!ru.ok) throw new Error('Não autenticado');
    const user = await ru.json();
    document.getElementById('usuarioNome').textContent = user.username;
    document.getElementById('usuarioRole').textContent = user.role;

    // 2) ID do caso
    const params = new URLSearchParams(window.location.search);
    const casoId = params.get('id');
    if (!casoId) {
      alert('ID de caso não fornecido.');
      return window.location.href = '/';
    }

    // 3) Busca dados do caso + evidências
    const res = await fetch(`https://backend-dentefier.onrender.com/api/casos/${encodeURIComponent(casoId)}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Falha ao carregar dados do caso');
    const { caso, evidencias } = await res.json();

    // 4) Datas de cabeçalho e assinatura
    const hoje = new Date();
    document.getElementById('data-atual').textContent =
      hoje.toLocaleDateString('pt-BR', { year:'numeric', month:'long', day:'numeric' });
    document.getElementById('dataAssinatura').textContent =
      hoje.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });

    // 5) Preenchimento básico do caso
    document.getElementById('laudoPericial').textContent = caso.numeroCaso;
    document.getElementById('numeroBO').textContent    = caso.contexto.origemDemanda;
    document.getElementById('boNumero').textContent    = caso.contexto.origemDemanda;
    document.getElementById('laudoId').textContent     = caso.numeroCaso;

    const dt = new Date(caso.dataAbertura);
    document.getElementById('dataRegistro').textContent =
      `${dt.toLocaleDateString('pt-BR')} - ${dt.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}`;
    document.getElementById('tipoCrime').textContent    = caso.contexto.tipoCaso;

    // 6) Status e prioridade
    const statusEl = document.getElementById('statusCaso');
    statusEl.textContent = caso.status;
    statusEl.className = 'status ' + caso.status.toLowerCase().replace(/\s+/g, '-');
    document.getElementById('prioridade').textContent = caso.historico?.[0]?.substatus || 'Não definida';

    // 7) Identificação do examinado
    document.getElementById('identificado').textContent   = caso.dadosIndividuo.nome ? 'Sim' : 'Não';
    document.getElementById('nomeCompleto').textContent   = caso.dadosIndividuo.nome || 'Não identificado';
    document.getElementById('sexo').textContent           = caso.dadosIndividuo.sexo || 'Não determinado';
    document.getElementById('idade').textContent         = caso.dadosIndividuo.idadeEstimado
      ? `${caso.dadosIndividuo.idadeEstimado} anos (estimado)` : 'Não determinado';
    document.getElementById('identidade').textContent    = caso.dadosIndividuo.identificadores || 'Não disponível';
    document.getElementById('etnia').textContent          = caso.dadosIndividuo.etnia || 'Não determinada';
    document.getElementById('condicoesCorpo').textContent = caso.contexto.descricao || 'Não informado';

    // 8) Achados odontológicos
    document.getElementById('registrosAnte').textContent = caso.documentacao?.registrosAnte || 'Não disponível';
    document.getElementById('registrosPost').textContent = caso.documentacao?.registrosPost || 'Não disponível';
    if (caso.documentacao?.fotografias?.length) {
      document.getElementById('fotografias').textContent = `${caso.documentacao.fotografias.length} fotografias disponíveis`;
    } else {
      document.getElementById('fotografiasContainer').style.display = 'none';
    }
    document.getElementById('antecedentes').textContent = caso.dadosIndividuo.antecedentes || 'Não disponível';

    // 9) Conclusão e responsáveis
    document.getElementById('conclusao').textContent     = caso.contexto.descricao || 'Pendente análise final';
    document.getElementById('perito').textContent        = caso.responsavel?.username || 'Não informado';
    // Uso de optional chaining para evitar erro se cadeiaCustodia for undefined
    document.getElementById('auxiliar').textContent      = caso.cadeiaCustodia?.responsavelColeta || 'Não informado';
    document.getElementById('nomeAssinante').textContent = caso.responsavel?.username || '';

    // 10) Tabela de evidências
    const tbody = document.getElementById('corpoTabelaEvidencias');
    if (evidencias?.length) {
      evidencias.forEach(ev => {
        const tr = document.createElement('tr');
        const dtColeta = new Date(ev.dataColeta);
        const registradoPor = ev.registradoPor?.username || ev.registradoPor;
        tr.innerHTML = `
          <td>${ev._id}</td>
          <td>${ev.tipo}</td>
          <td>${ev.descricao}</td>
          <td>${dtColeta.toLocaleDateString('pt-BR')}</td>
          <td>${registradoPor}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      document.getElementById('secao-evidencias').style.display = 'none';
    }

    // 11) Exportar PDF e Imprimir
    const btnPdf = document.getElementById('exportar-pdf');
    const btnImp = document.getElementById('imprimir');
    if (btnPdf) btnPdf.addEventListener('click', handleGeneratePDF);
    if (btnImp) btnImp.addEventListener('click', () => window.print());

  } catch (err) {
    console.error('Erro no script relatorio.js:', err);
    alert('Ocorreu um erro ao processar o relatório. Veja o console para detalhes.');
  }
});

// Função de geração de PDF
async function handleGeneratePDF() {
  try {
    alert('Preparando PDF, aguarde…');
    // Acessando o jsPDF do bundle UMD
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) throw new Error('Biblioteca jsPDF não carregada');

    const doc = new jsPDF('p', 'mm', 'a4');
    const canvas = await html2canvas(document.getElementById('relatorio-para-exportar'), { scale:1, useCORS:true });
    const imgData = canvas.toDataURL('image/jpeg', 1);
    const imgW = 210;
    const pageH = 295;
    const imgH = canvas.height * imgW / canvas.width;
    let pos = 0;
    doc.addImage(imgData, 'JPEG', 0, pos, imgW, imgH);
    let rem = imgH - pageH;
    while (rem > 0) {
      pos = -rem;
      doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, pos, imgW, imgH);
      rem -= pageH;
    }
    const caseId = document.getElementById('laudoPericial').textContent;
    doc.save(`Relatorio_${caseId}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Falha ao gerar PDF: ' + error.message);
  }
}