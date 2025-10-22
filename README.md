# Sistema de Aproveitamento de Estudos

Sistema web moderno para gerenciar solicitações de aproveitamento de disciplinas em universidades.

## Características

- **Multi-curso**: Suporte para múltiplos cursos através de arquivos JSON
- **Interface Moderna**: Design card-based responsivo e intuitivo
- **Anexos**: Sistema completo de upload de documentos comprobatórios
- **Exportação Completa**: Gera arquivo .aprov (ZIP) com JSON, PDF e anexos
- **Importação**: Restaura sessões salvas para continuar editando
- **Persistência**: Salve seu progresso em qualquer momento

## Estrutura do Projeto

```
aproveitamentos-disciplinas/
├── index.html                       # Interface principal
├── script.js                        # Lógica da aplicação
├── styles.css                       # Estilos modernos
├── cursos.json                      # Lista de cursos disponíveis
├── cursos/                          # Dados dos cursos
│   └── engenharia-computacao.json  # Disciplinas do curso
├── PROCESSO.md                      # Guia do processo de aproveitamento
└── README.md                        # Este arquivo
```

## Como Usar

### 1. Iniciar o Sistema

Abra o arquivo `index.html` em um navegador moderno ou use um servidor HTTP local:

```bash
# Usando Python 3
python3 -m http.server 8000

# Ou usando Node.js
npx serve
```

Acesse: `http://localhost:8000`

### 2. Fluxo de Trabalho

1. **Selecione o Curso**
   - Escolha seu curso no dropdown
   - O sistema carrega automaticamente as disciplinas disponíveis

2. **Adicione Disciplinas**
   - Preencha os dados da disciplina cursada
   - Selecione a disciplina equivalente no seu curso atual
   - Adicione documentos comprobatórios (histórico, ementa, etc.)
   - Use "Adicionar outra disciplina" para incluir mais

3. **Salvar Progresso**
   - **Salvar Sessão**: Baixa um JSON com seus dados (sem anexos)
   - **Exportar Tudo**: Cria arquivo .aprov com JSON + PDF + anexos

4. **Continuar Depois**
   - Use "Importar .aprov" para restaurar uma sessão salva
   - Todos os dados e anexos são restaurados automaticamente

## Adicionar Novo Curso

### 1. Criar JSON do Curso

Crie um arquivo em `cursos/nome-do-curso.json`:

```json
{
  "nome": "Nome do Curso",
  "codigo": "nome-do-curso",
  "disciplinas": {
    "obrigatorias": [
      {
        "codigo": "12345678",
        "nome": "Nome da Disciplina",
        "carga_horaria": "64h"
      }
    ],
    "optativas": [
      {
        "codigo": "87654321",
        "nome": "Outra Disciplina",
        "carga_horaria": "32h"
      }
    ]
  }
}
```

### 2. Registrar no cursos.json

Adicione o curso em `cursos.json`:

```json
[
  {
    "id": "engenharia-computacao",
    "nome": "Engenharia de Computação",
    "arquivo": "cursos/engenharia-computacao.json"
  },
  {
    "id": "nome-do-curso",
    "nome": "Nome do Curso",
    "arquivo": "cursos/nome-do-curso.json"
  }
]
```

## Formato do Arquivo .aprov

O arquivo .aprov é um ZIP contendo:

```
aproveitamento_completo.aprov/
├── dados.json              # Dados estruturados da sessão
├── aproveitamento.pdf      # PDF formatado
└── anexos/                 # Documentos comprobatórios
    ├── disciplina_1/
    │   ├── historico.pdf
    │   └── ementa.pdf
    └── disciplina_2/
        └── certificado.pdf
```

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design moderno com variáveis CSS
- **JavaScript (ES6+)**: Lógica da aplicação
- **jsPDF**: Geração de PDFs
- **JSZip**: Manipulação de arquivos ZIP
- **FileSaver.js**: Download de arquivos

## Requisitos

- Navegador moderno com suporte a:
  - ES6+ (async/await, template literals)
  - File API
  - Fetch API
  - CSS Grid/Flexbox

## Navegadores Suportados

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Desenvolvimento

### Estrutura do Código JavaScript

- **Estado Global**: Gerencia dados do curso e disciplinas
- **Carregamento**: Funções para buscar JSONs
- **UI**: Manipulação de disciplinas e formulários
- **Anexos**: Sistema de upload e gerenciamento
- **Export/Import**: ZIP com todos os dados
- **PDF**: Geração com formatação profissional

### Adicionar Funcionalidades

O código é modular e bem comentado. Principais funções:

```javascript
// Adicionar disciplina
adicionarDisciplina()

// Coletar dados do formulário
coletarDadosFormulario()

// Exportar tudo
exportarTudo()

// Importar arquivo
importarArquivo()
```

## Problemas Conhecidos

- Arquivos muito grandes (>100MB) podem causar lentidão
- Importação requer que o curso já esteja cadastrado no sistema

## Licença

Este projeto é de código aberto. Sinta-se livre para usar e modificar.

## Contato

Para dúvidas ou sugestões sobre o sistema, abra uma issue no repositório.

Para informações sobre o processo de aproveitamento, consulte [PROCESSO.md](PROCESSO.md).

---

**Versão 2.0** - Sistema completo com multi-curso, anexos e persistência
