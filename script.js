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

async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const disciplinas = document.querySelectorAll(".disciplina");
  let y = 15;
  const lineHeight = 7;
  const pageHeight = 280;

  doc.setFontSize(9);

  disciplinas.forEach((d, i) => {
    if (y + 30 > pageHeight) {
      doc.addPage();
      y = 15;
    }

    // Cabeçalho em negrito para título e colunas
    doc.setFont("helvetica", "bold");

    doc.text(`Disciplina ${i + 1}:`, 10, y);
    y += lineHeight;

    doc.text("IES", 10, y);
    doc.text("Disciplina Cursada", 35, y);
    doc.text("Código", 85, y);
    doc.text("Nota", 110, y);
    doc.text("Aproveitar como", 130, y);
    doc.text("Código", 175, y);
    y += lineHeight;

    // Dados em fonte normal
    doc.setFont("helvetica", "normal");

    const ies = d.querySelector(".ies-select").value;
    const iesOutro = d.querySelector(".ies-outra").value;
    const origem = ies === "Externa" ? iesOutro || "-" : "UFMT";

    const cursada = d.querySelector(".disciplina-cursada").value || "-";
    const codCursada = d.querySelector(".codigo-cursada").value || "-";
    const nota = d.querySelector(".nota").value || "-";

    const selectAproveitar = d.querySelector("select.disciplina-aproveitar");
    const aproveitada = selectAproveitar.options[selectAproveitar.selectedIndex].text.split(" - ")[1] || "-";
    const codAproveitar = d.querySelector(".codigo-aproveitar").value || "-";

    // Definindo posições e larguras aproximadas das colunas
    const xIES = 10;
    const wIES = 20;

    const xCursada = 35;
    const wCursada = 45;

    const xCodCursada = 85;
    const wCodCursada = 20;

    const xNota = 110;
    const wNota = 15;

    const xAproveitar = 130;
    const wAproveitar = 40;

    const xCodAproveitar = 175;
    const wCodAproveitar = 25;

    // Quebrar textos longos em linhas que cabem na largura da coluna
    const iesLines = doc.splitTextToSize(origem, wIES);
    const cursadaLines = doc.splitTextToSize(cursada, wCursada);
    const codCursadaLines = doc.splitTextToSize(codCursada, wCodCursada);
    const notaLines = doc.splitTextToSize(nota, wNota);
    const aproveitarLines = doc.splitTextToSize(aproveitada, wAproveitar);
    const codAproveitarLines = doc.splitTextToSize(codAproveitar, wCodAproveitar);

    // Descobre o maior número de linhas para ajustar o "y"
    const maxLines = Math.max(
      iesLines.length,
      cursadaLines.length,
      codCursadaLines.length,
      notaLines.length,
      aproveitarLines.length,
      codAproveitarLines.length
    );

    // Imprime cada coluna em sua posição, iniciando na mesma coordenada y
    doc.text(iesLines, xIES, y);
    doc.text(cursadaLines, xCursada, y);
    doc.text(codCursadaLines, xCodCursada, y);
    doc.text(notaLines, xNota, y);
    doc.text(aproveitarLines, xAproveitar, y);
    doc.text(codAproveitarLines, xCodAproveitar, y);

    // Ajusta y para a próxima linha considerando múltiplas linhas possíveis
    y += lineHeight * maxLines * 1.5;
  });

  doc.save("aproveitamento_estudos.pdf");
}
