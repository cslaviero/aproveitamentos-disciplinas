document.addEventListener("DOMContentLoaded", () => {
  let disciplinas = []; // variável global para guardar os dados

  carregarDisciplinas();

  function carregarDisciplinas() {
    fetch("disciplinas.json")
      .then(res => res.json())
      .then(data => {
        disciplinas = data;  // salvar os dados na variável global
        preencherSelects(disciplinas);
      })
      .catch(err => {
        console.error("Erro ao carregar disciplinas:", err);
        document.querySelectorAll(".disciplina-aproveitar").forEach(sel => {
          sel.innerHTML = '<option value="">Erro ao carregar</option>';
        });
      });
  }

  function preencherSelects(disciplinas) {
    document.querySelectorAll(".disciplina-aproveitar").forEach(select => {
      select.innerHTML = '<option value="">Selecione</option>';
      disciplinas.forEach(d => {
        const option = document.createElement("option");
        option.value = d.codigo;
        option.textContent = `${d.codigo} - ${d.nome}`;
        select.appendChild(option);
      });
    });
  }

  window.mostrarCampoIES = function(select) {
    const externaDiv = select.closest(".disciplina").querySelector(".ies-externa");
    if (select.value === "Externa") {
      externaDiv.style.display = "block";
    } else {
      externaDiv.style.display = "none";
      externaDiv.querySelector("input").value = "";
    }
  };

  window.atualizarDisciplina = function(select) {
    const inputCodigo = select.closest(".disciplina").querySelector(".codigo-aproveitar");
    inputCodigo.value = select.value;
  };

  window.addDisciplina = function() {
    const container = document.getElementById("disciplinas");
    const nova = container.firstElementChild.cloneNode(true);
    nova.querySelectorAll("input").forEach(input => input.value = "");
    nova.querySelectorAll("select").forEach(sel => sel.selectedIndex = 0);
    nova.querySelector(".ies-externa").style.display = "none";
    container.appendChild(nova);

    // Atualizar os selects do novo bloco
    preencherSelects(disciplinas);
  };

  window.gerarPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text("Tabela de Disciplinas", 10, 10);

    const tableTop = 20;
    const rowHeight = 8;
    let y = tableTop;

    // Cabeçalhos da tabela
    doc.setFont(undefined, "bold");
    doc.text("IES", 10, y);
    doc.text("Disciplina Cursada", 45, y);
    doc.text("Cód", 95, y);
    doc.text("Nota", 115, y);
    doc.text("Aproveitar como", 135, y);
    doc.text("Cód", 175, y);
    doc.setFont(undefined, "normal");

    y += 10;

    const lineHeight = 8;
    const linhaAltura = 4;

    disciplinas.forEach((disciplina) => {
      const origem = disciplina.origem || "-";
      const cursada = disciplina.nomeCursada || "-";
      const codCursada = disciplina.codigoCursada || "-";
      const nota = disciplina.nota || "-";
      const aproveitada = disciplina.nomeAproveitar || "-";
      const codAproveitar = disciplina.codigoAproveitar || "-";

      const origemLines = doc.splitTextToSize(origem, 30);
      const cursadaLines = doc.splitTextToSize(cursada, 45);
      const aproveitadaLines = doc.splitTextToSize(aproveitada, 40);

      const maxLines = Math.max(origemLines.length, cursadaLines.length, aproveitadaLines.length);

      for (let j = 0; j < maxLines; j++) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.text(origemLines[j] || "", 10, y);
        doc.text(cursadaLines[j] || "", 45, y);
        doc.text(j === 0 ? codCursada : "", 95, y);
        doc.text(j === 0 ? nota : "", 115, y);
        doc.text(aproveitadaLines[j] || "", 135, y);
        doc.text(j === 0 ? codAproveitar : "", 175, y);

        y += linhaAltura;
      }

      y += 4; // espaço extra entre linhas de diferentes disciplinas
    });

    doc.save("tabela_disciplinas.pdf");
  };

});
