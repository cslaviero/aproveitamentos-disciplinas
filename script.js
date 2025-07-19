function mostrarCampoIES(select) {
  const externaDiv = select.parentElement.parentElement.querySelector(".ies-externa");
  if (select.value === "Externa") {
    externaDiv.style.display = "block";
  } else {
    externaDiv.style.display = "none";
    externaDiv.querySelector("input").value = "";
  }
}

function atualizarDisciplina(select) {
  const inputCodigo = select.parentElement.parentElement.querySelector(".codigo-aproveitar");
  inputCodigo.value = select.value;
}

function addDisciplina() {
  const container = document.getElementById("disciplinas");
  const nova = container.firstElementChild.cloneNode(true);
  nova.querySelectorAll("input").forEach(input => input.value = "");
  nova.querySelectorAll("select").forEach(sel => sel.selectedIndex = 0);
  nova.querySelector(".ies-externa").style.display = "none";
  container.appendChild(nova);
}

async function carregarDisciplinasPorTipo(selectTipo) {
  const tipo = selectTipo.value;
  const container = selectTipo.parentElement.parentElement;
  const selectDisciplina = container.querySelector(".disciplina-aproveitar");
  selectDisciplina.innerHTML = '<option>Carregando...</option>';

  if (!tipo) {
    selectDisciplina.innerHTML = '<option>Selecione o tipo primeiro</option>';
    return;
  }

  let url = '';
  if (tipo === 'obrigatoria') {
    url = 'disciplinas_obrigatorias.json';
  } else if (tipo === 'optativa') {
    url = 'disciplinas_optativas.json';
  }

  try {
    const response = await fetch(url);
    const disciplinas = await response.json();

    selectDisciplina.innerHTML = '<option value="">Selecione</option>';
    disciplinas.forEach(d => {
      const option = document.createElement('option');
      option.value = d.codigo;
      option.textContent = `${d.codigo} - ${d.nome}`;
      selectDisciplina.appendChild(option);
    });
  } catch (err) {
    console.error('Erro ao carregar disciplinas:', err);
    selectDisciplina.innerHTML = '<option>Erro ao carregar</option>';
  }
}

async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const disciplinas = document.querySelectorAll(".disciplina");
  let y = 15;
  const lineHeight = 5;
  const pageHeight = 280;

  doc.setFontSize(7);

  disciplinas.forEach((d, i) => {
    if (y + 35 > pageHeight) {
      doc.addPage();
      y = 15;
    }

    doc.setFont("helvetica", "bold");
    doc.text(`Disciplina ${i + 1}:`, 10, y);
    y += lineHeight;

    doc.text("IES", 10, y);
    doc.text("Disc. Cursada", 35, y);
    doc.text("Cód.", 85, y);
    doc.text("Nota", 100, y);
    doc.text("C.H.", 115, y);
    doc.text("Tipo", 130, y);
    doc.text("Aproveitar como", 150, y);
    doc.text("Cód.", 190, y);
    doc.text("C.H.", 205, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");

    const ies = d.querySelector(".ies-select").value;
    const iesOutro = d.querySelector(".ies-outra").value;
    const origem = ies === "Externa" ? iesOutro || "-" : "UFMT";

    const cursada = d.querySelector(".disciplina-cursada").value || "-";
    const codCursada = d.querySelector(".codigo-cursada").value || "-";
    const nota = d.querySelector(".nota").value || "-";
    const cargaCursada = d.querySelector(".carga-horaria-cursada").value || "-";

    const tipo = d.querySelector(".tipo-disciplina")?.value || "-";

    const selectAproveitar = d.querySelector("select.disciplina-aproveitar");
    const codAproveitar = d.querySelector(".codigo-aproveitar").value || "-";
    const aproveitadaNome = selectAproveitar.options[selectAproveitar.selectedIndex]?.text?.split(" - ")[1] || "-";

    let cargaAproveitada = "-";
    try {
      if (tipo === 'obrigatoria') {
        cargaAproveitada = disciplinasObrigatorias.find(dd => dd.codigo === codAproveitar)?.carga_horaria || "-";
      } else if (tipo === 'optativa') {
        cargaAproveitada = disciplinasOptativas.find(dd => dd.codigo === codAproveitar)?.carga_horaria || "-";
      }
    } catch {
      cargaAproveitada = "-";
    }

    const xIES = 10, wIES = 20;
    const xCursada = 35, wCursada = 45;
    const xCodCursada = 85, wCodCursada = 15;
    const xNota = 100, wNota = 10;
    const xCargaCursada = 115, wCargaCursada = 10;
    const xTipo = 130, wTipo = 15;
    const xAproveitar = 150, wAproveitar = 40;
    const xCodAproveitar = 190, wCodAproveitar = 15;
    const xCargaAproveitar = 205, wCargaAproveitar = 10;

    const lines = {
      ies: doc.splitTextToSize(origem, wIES),
      cursada: doc.splitTextToSize(cursada, wCursada),
      codCursada: doc.splitTextToSize(codCursada, wCodCursada),
      nota: doc.splitTextToSize(nota, wNota),
      cargaCursada: doc.splitTextToSize(cargaCursada, wCargaCursada),
      tipo: doc.splitTextToSize(tipo.charAt(0).toUpperCase() + tipo.slice(1), wTipo),
      aproveitada: doc.splitTextToSize(aproveitadaNome, wAproveitar),
      codAproveitar: doc.splitTextToSize(codAproveitar, wCodAproveitar),
      cargaAproveitar: doc.splitTextToSize(cargaAproveitada, wCargaAproveitar),
    };

    const maxLines = Math.max(...Object.values(lines).map(arr => arr.length));

    for (let i = 0; i < maxLines; i++) {
      const yLine = y + i * lineHeight;
      doc.text(lines.ies[i] || "", xIES, yLine);
      doc.text(lines.cursada[i] || "", xCursada, yLine);
      doc.text(lines.codCursada[i] || "", xCodCursada, yLine);
      doc.text(lines.nota[i] || "", xNota + wNota, yLine, { align: "right" });
      doc.text(lines.cargaCursada[i] || "", xCargaCursada, yLine);
      doc.text(lines.tipo[i] || "", xTipo, yLine);
      doc.text(lines.aproveitada[i] || "", xAproveitar, yLine);
      doc.text(lines.codAproveitar[i] || "", xCodAproveitar, yLine);
      doc.text(lines.cargaAproveitar[i] || "", xCargaAproveitar, yLine);
    }

    y += maxLines * lineHeight + 3;
  });

  doc.save("aproveitamento_estudos.pdf");
}

// Variáveis globais
let disciplinasObrigatorias = [];
let disciplinasOptativas = [];

async function carregarJSONs() {
  try {
    const respObrig = await fetch('disciplinas_obrigatorias.json');
    disciplinasObrigatorias = await respObrig.json();

    const respOpt = await fetch('disciplinas_optativas.json');
    disciplinasOptativas = await respOpt.json();

    document.querySelectorAll('.tipo-disciplina').forEach(sel => {
      sel.selectedIndex = 0;
    });
    document.querySelectorAll('.disciplina-aproveitar').forEach(sel => {
      sel.innerHTML = '<option>Selecione o tipo primeiro</option>';
    });
  } catch (e) {
    console.error('Erro ao carregar JSONs:', e);
  }
}

window.addEventListener('DOMContentLoaded', carregarJSONs);