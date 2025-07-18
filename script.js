document.addEventListener("DOMContentLoaded", () => {
  carregarDisciplinas();

  function carregarDisciplinas() {
    fetch("disciplinas.json")
      .then(res => res.json())
      .then(disciplinas => {
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

    // Atualizar o select recém criado com as disciplinas do JSON
    carregarDisciplinas();
  };

  window.gerarPDF = async function() {
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

      doc.text(origem, 10, y);
      doc.text(cursada, 35, y);
      doc.text(codCursada, 85, y);
      doc.text(nota, 110, y);
      doc.text(aproveitada, 130, y);
      doc.text(codAproveitar, 175, y);

      y += lineHeight * 1.5;
    });

    doc.save("aproveitamento_estudos.pdf");
  };
});
