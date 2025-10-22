// ====================================
// Estado Global da Aplicação
// ====================================
const state = {
  cursos: [],
  cursoSelecionado: null,
  disciplinasCurso: null,
  disciplinas: [],
  proximoId: 1
};

// ====================================
// Inicialização
// ====================================
window.addEventListener('DOMContentLoaded', async () => {
  await carregarCursos();
  setupEventListeners();
});

function setupEventListeners() {
  const cursoSelect = document.getElementById('cursoSelect');
  cursoSelect.addEventListener('change', onCursoChange);
}

// ====================================
// Carregamento de Dados
// ====================================
async function carregarCursos() {
  try {
    const response = await fetch('cursos.json');
    state.cursos = await response.json();

    const select = document.getElementById('cursoSelect');
    select.innerHTML = '<option value="">Selecione um curso</option>';

    state.cursos.forEach(curso => {
      const option = document.createElement('option');
      option.value = curso.id;
      option.textContent = curso.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    alert('Erro ao carregar lista de cursos. Verifique se o arquivo cursos.json existe.');
  }
}

async function onCursoChange(event) {
  const cursoId = event.target.value;

  if (!cursoId) {
    document.getElementById('cursoInfo').style.display = 'none';
    document.getElementById('disciplinasSection').style.display = 'none';
    document.getElementById('actionsSection').style.display = 'none';
    return;
  }

  const curso = state.cursos.find(c => c.id === cursoId);
  if (!curso) return;

  try {
    const response = await fetch(curso.arquivo);
    const dadosCurso = await response.json();

    state.cursoSelecionado = dadosCurso;
    state.disciplinasCurso = dadosCurso.disciplinas;

    document.getElementById('cursoNome').textContent = dadosCurso.nome;
    document.getElementById('cursoInfo').style.display = 'block';
    document.getElementById('disciplinasSection').style.display = 'block';
    document.getElementById('actionsSection').style.display = 'block';

    // Limpar disciplinas anteriores se houver
    state.disciplinas = [];
    state.proximoId = 1;
    document.getElementById('disciplinasTableBody').innerHTML = '';

    // Adicionar primeira disciplina
    adicionarDisciplina();

  } catch (error) {
    console.error('Erro ao carregar dados do curso:', error);
    alert('Erro ao carregar dados do curso.');
  }
}

// ====================================
// Gerenciamento de Disciplinas
// ====================================
function adicionarDisciplina() {
  const template = document.getElementById('disciplinaTemplate');
  const clone = template.content.cloneNode(true);

  const disciplinaRow = clone.querySelector('.disciplina-row');
  const disciplinaId = state.proximoId++;
  disciplinaRow.dataset.id = disciplinaId;

  clone.querySelector('.disciplina-numero').textContent = disciplinaId;

  // Adicionar ao tbody
  document.getElementById('disciplinasTableBody').appendChild(clone);

  // Adicionar ao estado
  state.disciplinas.push({
    id: disciplinaId,
    anexos: []
  });

  atualizarNumerosDisciplinas();
}

function removerDisciplina(button) {
  const row = button.closest('.disciplina-row');
  const id = parseInt(row.dataset.id);

  if (document.querySelectorAll('.disciplina-row').length <= 1) {
    alert('É necessário ter pelo menos uma disciplina.');
    return;
  }

  // Remover do estado
  const index = state.disciplinas.findIndex(d => d.id === id);
  if (index !== -1) {
    state.disciplinas.splice(index, 1);
  }

  // Remover do DOM
  row.remove();

  atualizarNumerosDisciplinas();
}

function atualizarNumerosDisciplinas() {
  const rows = document.querySelectorAll('.disciplina-row');
  rows.forEach((row, index) => {
    row.querySelector('.disciplina-numero').textContent = index + 1;
  });
}

// ====================================
// Funções de Formulário
// ====================================
function mostrarCampoIES(select) {
  const row = select.closest('.disciplina-row');
  const inputIesOutra = row.querySelector('.ies-outra');

  if (select.value === 'Externa') {
    inputIesOutra.style.display = 'block';
  } else {
    inputIesOutra.style.display = 'none';
    inputIesOutra.value = '';
  }
}

function carregarDisciplinasPorTipo(selectTipo) {
  const tipo = selectTipo.value;
  const row = selectTipo.closest('.disciplina-row');
  const inputDisciplina = row.querySelector('.disciplina-aproveitar-input');
  const inputCodigo = row.querySelector('.disciplina-aproveitar-codigo');
  const codigoAproveitar = row.querySelector('.codigo-aproveitar');

  if (!tipo || !state.disciplinasCurso) {
    inputDisciplina.placeholder = 'Selecione o tipo primeiro';
    inputDisciplina.disabled = true;
    inputDisciplina.value = '';
    inputCodigo.value = '';
    codigoAproveitar.value = '';
    return;
  }

  const disciplinas = state.disciplinasCurso[tipo] || [];

  // Armazenar disciplinas na row para uso posterior
  row.dataset.disciplinas = JSON.stringify(disciplinas);

  inputDisciplina.placeholder = 'Buscar disciplina...';
  inputDisciplina.disabled = false;
  inputDisciplina.value = '';
  inputCodigo.value = '';
  codigoAproveitar.value = '';
}

function filtrarDisciplinas(input) {
  const row = input.closest('.disciplina-row');
  const suggestionsDiv = row.querySelector('.autocomplete-suggestions');
  const query = input.value.toLowerCase().trim();

  if (!row.dataset.disciplinas) {
    suggestionsDiv.classList.remove('show');
    return;
  }

  const disciplinas = JSON.parse(row.dataset.disciplinas);

  if (!query) {
    // Mostrar todas se o campo estiver vazio mas focado
    renderizarSugestoes(suggestionsDiv, disciplinas, '', row);
    return;
  }

  // Filtrar disciplinas
  const filtradas = disciplinas.filter(d =>
    d.nome.toLowerCase().includes(query)
  );

  renderizarSugestoes(suggestionsDiv, filtradas, query, row);
}

function mostrarSugestoes(input) {
  const row = input.closest('.disciplina-row');
  const suggestionsDiv = row.querySelector('.autocomplete-suggestions');

  if (!row.dataset.disciplinas) {
    return;
  }

  const disciplinas = JSON.parse(row.dataset.disciplinas);
  const query = input.value.toLowerCase().trim();

  if (query) {
    const filtradas = disciplinas.filter(d =>
      d.nome.toLowerCase().includes(query)
    );
    renderizarSugestoes(suggestionsDiv, filtradas, query, row);
  } else {
    renderizarSugestoes(suggestionsDiv, disciplinas, '', row);
  }
}

function renderizarSugestoes(suggestionsDiv, disciplinas, query, row) {
  suggestionsDiv.innerHTML = '';

  if (disciplinas.length === 0) {
    suggestionsDiv.innerHTML = '<div class="autocomplete-no-results">Nenhuma disciplina encontrada</div>';
    suggestionsDiv.classList.add('show');
    return;
  }

  disciplinas.forEach(d => {
    const item = document.createElement('div');
    item.className = 'autocomplete-suggestion-item';
    item.dataset.codigo = d.codigo;
    item.dataset.nome = d.nome;
    item.dataset.cargaHoraria = d.carga_horaria;

    // Destacar texto correspondente à busca
    let nomeHTML = d.nome;
    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      nomeHTML = d.nome.replace(regex, '<span class="autocomplete-suggestion-highlight">$1</span>');
    }

    item.innerHTML = nomeHTML;

    item.addEventListener('click', () => {
      selecionarDisciplina(row, d.codigo, d.nome, d.carga_horaria);
    });

    suggestionsDiv.appendChild(item);
  });

  suggestionsDiv.classList.add('show');
}

function selecionarDisciplina(row, codigo, nome, cargaHoraria) {
  const inputDisciplina = row.querySelector('.disciplina-aproveitar-input');
  const inputCodigo = row.querySelector('.disciplina-aproveitar-codigo');
  const codigoAproveitar = row.querySelector('.codigo-aproveitar');
  const suggestionsDiv = row.querySelector('.autocomplete-suggestions');

  inputDisciplina.value = nome;
  inputCodigo.value = codigo;
  inputCodigo.dataset.cargaHoraria = cargaHoraria;
  codigoAproveitar.value = codigo;

  suggestionsDiv.classList.remove('show');
  suggestionsDiv.innerHTML = '';
}

// Fechar sugestões ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-wrapper')) {
    document.querySelectorAll('.autocomplete-suggestions').forEach(div => {
      div.classList.remove('show');
    });
  }
});

// ====================================
// Sistema de Anexos
// ====================================
function adicionarAnexos(input) {
  const row = input.closest('.disciplina-row');
  const id = parseInt(row.dataset.id);
  const disciplina = state.disciplinas.find(d => d.id === id);

  if (!disciplina) return;

  const files = Array.from(input.files);
  const anexosList = row.querySelector('.anexos-list-mini');
  const anexosCount = row.querySelector('.anexos-count');

  files.forEach(file => {
    // Adicionar ao estado
    disciplina.anexos.push({
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      file: file
    });
  });

  // Atualizar contador e lista
  atualizarAnexosUI(row, disciplina.anexos, id);

  // Limpar input
  input.value = '';
}

function atualizarAnexosUI(row, anexos, disciplinaId) {
  const anexosList = row.querySelector('.anexos-list-mini');
  const anexosCount = row.querySelector('.anexos-count');

  anexosCount.textContent = `(${anexos.length})`;

  anexosList.innerHTML = '';
  anexos.forEach(anexo => {
    const item = document.createElement('div');
    item.className = 'anexo-item-mini';
    item.textContent = anexo.nome;
    item.title = anexo.nome;
    anexosList.appendChild(item);
  });
}

function removerAnexo(button, disciplinaId, nomeArquivo) {
  const disciplina = state.disciplinas.find(d => d.id === disciplinaId);
  if (!disciplina) return;

  // Remover do estado
  const index = disciplina.anexos.findIndex(a => a.nome === nomeArquivo);
  if (index !== -1) {
    disciplina.anexos.splice(index, 1);
  }

  // Remover do DOM
  button.closest('.anexo-item').remove();
}

// ====================================
// Coleta de Dados do Formulário
// ====================================
function coletarDadosFormulario() {
  const rows = document.querySelectorAll('.disciplina-row');
  const dados = {
    curso: state.cursoSelecionado,
    disciplinas: []
  };

  rows.forEach((row, index) => {
    const id = parseInt(row.dataset.id);
    const disciplinaState = state.disciplinas.find(d => d.id === id);

    const iesSelect = row.querySelector('.ies-select').value;
    const iesOutra = row.querySelector('.ies-outra').value;

    const inputAproveitar = row.querySelector('.disciplina-aproveitar-input');
    const inputCodigo = row.querySelector('.disciplina-aproveitar-codigo');

    const disciplina = {
      numero: index + 1,
      id: id,
      ies: {
        tipo: iesSelect,
        nome: iesSelect === 'Externa' ? iesOutra : 'UFMT'
      },
      cursada: {
        nome: row.querySelector('.disciplina-cursada').value,
        codigo: row.querySelector('.codigo-cursada').value,
        cargaHoraria: row.querySelector('.carga-horaria-cursada').value,
        nota: row.querySelector('.nota').value
      },
      aproveitamento: {
        tipo: row.querySelector('.tipo-disciplina').value,
        codigo: inputCodigo ? inputCodigo.value : '',
        nome: inputAproveitar ? inputAproveitar.value : '',
        cargaHoraria: inputCodigo ? inputCodigo.dataset.cargaHoraria : ''
      },
      anexos: disciplinaState ? disciplinaState.anexos.map(a => ({
        nome: a.nome,
        tipo: a.tipo,
        tamanho: a.tamanho
      })) : []
    };

    dados.disciplinas.push(disciplina);
  });

  return dados;
}

// ====================================
// Salvamento de Sessão (JSON)
// ====================================
function salvarSessao() {
  try {
    const dados = coletarDadosFormulario();
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sessao_aproveitamento.json';
    a.click();

    URL.revokeObjectURL(url);

    alert('Sessão salva com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    alert('Erro ao salvar sessão.');
  }
}

// ====================================
// Geração de PDF
// ====================================
async function gerarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dados = coletarDadosFormulario();

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Solicitação de Aproveitamento de Estudos', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Curso: ${dados.curso.nome}`, 14, 25);

    let y = 35;
    const pageHeight = 280;
    const lineHeight = 6;

    dados.disciplinas.forEach((disc, index) => {
      // Verificar quebra de página
      if (y + 50 > pageHeight) {
        doc.addPage();
        y = 15;
      }

      // Cabeçalho da disciplina
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Disciplina ${disc.numero}`, 14, y);
      y += lineHeight;

      // Tabela de informações
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('IES', 14, y);
      doc.text('Disc. Cursada', 40, y);
      doc.text('Cód.', 90, y);
      doc.text('Nota', 110, y);
      doc.text('C.H.', 125, y);
      doc.text('Aproveitar como', 145, y);
      doc.text('Cód.', 185, y);
      y += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.text(disc.ies.nome || '-', 14, y);

      const nomeCursada = doc.splitTextToSize(disc.cursada.nome || '-', 45);
      doc.text(nomeCursada[0] || '-', 40, y);

      doc.text(disc.cursada.codigo || '-', 90, y);
      doc.text(disc.cursada.nota || '-', 110, y);
      doc.text(disc.cursada.cargaHoraria || '-', 125, y);

      const nomeAprov = doc.splitTextToSize(disc.aproveitamento.nome || '-', 35);
      doc.text(nomeAprov[0] || '-', 145, y);

      doc.text(disc.aproveitamento.codigo || '-', 185, y);

      y += lineHeight;

      // Anexos
      if (disc.anexos && disc.anexos.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.text(`Anexos (${disc.anexos.length}): ${disc.anexos.map(a => a.nome).join(', ')}`, 14, y);
        y += lineHeight - 1;
      }

      y += 3; // Espaço entre disciplinas
    });

    // Rodapé
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 290);
    }

    doc.save('aproveitamento_estudos.pdf');
    alert('PDF gerado com sucesso!');

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF: ' + error.message);
  }
}

// ====================================
// Exportação Completa (.aprov)
// ====================================
async function exportarTudo() {
  try {
    const zip = new JSZip();
    const dados = coletarDadosFormulario();

    // Adicionar JSON
    zip.file('dados.json', JSON.stringify(dados, null, 2));

    // Criar PDF e adicionar
    const pdfBlob = await gerarPDFBlob();
    zip.file('aproveitamento.pdf', pdfBlob);

    // Adicionar anexos
    const anexosFolder = zip.folder('anexos');
    for (const disc of state.disciplinas) {
      if (disc.anexos && disc.anexos.length > 0) {
        const discFolder = anexosFolder.folder(`disciplina_${disc.id}`);
        for (const anexo of disc.anexos) {
          discFolder.file(anexo.nome, anexo.file);
        }
      }
    }

    // Gerar e baixar ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'aproveitamento_completo.aprov');

    alert('Exportação completa realizada com sucesso!');

  } catch (error) {
    console.error('Erro ao exportar:', error);
    alert('Erro ao exportar: ' + error.message);
  }
}

async function gerarPDFBlob() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const dados = coletarDadosFormulario();

  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Solicitação de Aproveitamento de Estudos', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Curso: ${dados.curso.nome}`, 14, 25);

  let y = 35;
  const pageHeight = 280;
  const lineHeight = 6;

  dados.disciplinas.forEach((disc) => {
    if (y + 50 > pageHeight) {
      doc.addPage();
      y = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Disciplina ${disc.numero}`, 14, y);
    y += lineHeight;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('IES', 14, y);
    doc.text('Disc. Cursada', 40, y);
    doc.text('Cód.', 90, y);
    doc.text('Nota', 110, y);
    doc.text('C.H.', 125, y);
    doc.text('Aproveitar como', 145, y);
    doc.text('Cód.', 185, y);
    y += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.text(disc.ies.nome || '-', 14, y);

    const nomeCursada = doc.splitTextToSize(disc.cursada.nome || '-', 45);
    doc.text(nomeCursada[0] || '-', 40, y);

    doc.text(disc.cursada.codigo || '-', 90, y);
    doc.text(disc.cursada.nota || '-', 110, y);
    doc.text(disc.cursada.cargaHoraria || '-', 125, y);

    const nomeAprov = doc.splitTextToSize(disc.aproveitamento.nome || '-', 35);
    doc.text(nomeAprov[0] || '-', 145, y);

    doc.text(disc.aproveitamento.codigo || '-', 185, y);

    y += lineHeight;

    if (disc.anexos && disc.anexos.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      const anexosPath = `anexos/disciplina_${disc.id}/`;
      const anexosText = disc.anexos.map(a => a.nome).join(', ');
      doc.text(`Anexos: Ver pasta ${anexosPath}`, 14, y);
      doc.text(`Arquivos: ${anexosText}`, 14, y + 3);
      y += lineHeight + 1;
    }

    y += 3;
  });

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 290);
  }

  return doc.output('blob');
}

// ====================================
// Importação de Arquivo .aprov
// ====================================
async function importarArquivo() {
  const input = document.getElementById('importFile');
  const file = input.files[0];

  if (!file) return;

  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    // Ler dados.json
    const dadosJson = await contents.file('dados.json').async('string');
    const dados = JSON.parse(dadosJson);

    // Restaurar seleção de curso
    const cursoId = dados.curso.codigo;
    const cursoSelect = document.getElementById('cursoSelect');
    cursoSelect.value = cursoId;

    // Carregar dados do curso
    await onCursoChange({ target: cursoSelect });

    // Aguardar um pouco para garantir que o curso foi carregado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Limpar disciplinas atuais
    state.disciplinas = [];
    state.proximoId = 1;
    document.getElementById('disciplinasTableBody').innerHTML = '';

    // Restaurar disciplinas
    for (const discData of dados.disciplinas) {
      adicionarDisciplina();
      const row = document.querySelector(`.disciplina-row[data-id="${state.proximoId - 1}"]`);

      if (!row) continue;

      // Preencher campos
      row.querySelector('.ies-select').value = discData.ies.tipo;
      if (discData.ies.tipo === 'Externa') {
        row.querySelector('.ies-outra').style.display = 'block';
        row.querySelector('.ies-outra').value = discData.ies.nome;
      }

      row.querySelector('.disciplina-cursada').value = discData.cursada.nome;
      row.querySelector('.codigo-cursada').value = discData.cursada.codigo;
      row.querySelector('.carga-horaria-cursada').value = discData.cursada.cargaHoraria;
      row.querySelector('.nota').value = discData.cursada.nota;

      // Carregar tipo de disciplina
      const tipoSelect = row.querySelector('.tipo-disciplina');
      tipoSelect.value = discData.aproveitamento.tipo;

      // Aguardar carregamento das disciplinas
      carregarDisciplinasPorTipo(tipoSelect);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Selecionar disciplina usando o novo sistema
      selecionarDisciplina(row, discData.aproveitamento.codigo, discData.aproveitamento.nome, discData.aproveitamento.cargaHoraria);

      // Restaurar anexos
      if (discData.anexos && discData.anexos.length > 0) {
        const discId = state.proximoId - 1;
        const disciplinaState = state.disciplinas.find(d => d.id === discId);

        for (const anexoData of discData.anexos) {
          try {
            const anexoPath = `anexos/disciplina_${discData.id}/${anexoData.nome}`;
            const anexoFile = await contents.file(anexoPath).async('blob');
            const file = new File([anexoFile], anexoData.nome, { type: anexoData.tipo });

            disciplinaState.anexos.push({
              nome: file.name,
              tipo: file.type,
              tamanho: file.size,
              file: file
            });
          } catch (err) {
            console.warn('Anexo não encontrado:', anexoData.nome);
          }
        }

        // Atualizar UI de anexos
        atualizarAnexosUI(row, disciplinaState.anexos, discId);
      }
    }

    alert('Arquivo importado com sucesso!');

  } catch (error) {
    console.error('Erro ao importar arquivo:', error);
    alert('Erro ao importar arquivo: ' + error.message);
  } finally {
    input.value = '';
  }
}
