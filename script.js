// ======================================
// CABRAL • GESTÃO FINANCEIRA
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  // ======================================
  // ELEMENTOS
  // ======================================

  const transactionForm =
    document.getElementById("transactionForm");

  const transactionList =
    document.getElementById("transactionList");

  const searchInput =
    document.getElementById("searchInput");

  const typeFilter =
    document.getElementById("typeFilter");

  const exportCSV =
    document.getElementById("exportCSV");

  const refreshBtn =
    document.getElementById("refreshBtn");

  const notificationBtn =
    document.getElementById("notificationBtn");

  const incomeValue =
    document.getElementById("incomeValue");

  const expenseValue =
    document.getElementById("expenseValue");

  const balanceValue =
    document.getElementById("balanceValue");

  // ======================================
  // DADOS INICIAIS
  // ======================================

  const defaultTransactions = [
    {
      id: 1,
      description: "Troca Câmara Fria",
      category: "Manutenção",
      type: "expense",
      amount: 12500
    },
    {
      id: 2,
      description: "Evento Corporativo",
      category: "Eventos",
      type: "income",
      amount: 18500
    },
    {
      id: 3,
      description: "Compra de Estoque",
      category: "Estoque",
      type: "expense",
      amount: 6200
    },
    {
      id: 4,
      description: "Atendimento Mensal",
      category: "Atendimento",
      type: "income",
      amount: 24000
    },
    {
      id: 5,
      description: "Campanha Digital",
      category: "Marketing",
      type: "expense",
      amount: 3200
    },
    {
      id: 6,
      description: "Serviço de Bar",
      category: "Bar",
      type: "income",
      amount: 14150
    },
    {
      id: 7,
      description: "Infraestrutura",
      category: "Infraestrutura",
      type: "expense",
      amount: 5100
    },
    {
      id: 8,
      description: "Fornecedor Principal",
      category: "Fornecedores",
      type: "expense",
      amount: 13549
    }
  ];

  let transactions =
    JSON.parse(
      localStorage.getItem("cabralTransactions")
    ) || defaultTransactions;

  // ======================================
  // FORMATAÇÃO
  // ======================================

  function formatCurrency(value) {

    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    ).format(value);

  }

  // ======================================
  // SALVAR
  // ======================================

  function saveTransactions() {

    localStorage.setItem(
      "cabralTransactions",
      JSON.stringify(transactions)
    );

  }

  // ======================================
  // ATUALIZAR KPIs
  // ======================================

  function updateDashboard() {

    const income =
      transactions
        .filter(transaction => transaction.type === "income")
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

    const expense =
      transactions
        .filter(transaction => transaction.type === "expense")
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

    const balance = income - expense;

    incomeValue.textContent =
      formatCurrency(income);

    expenseValue.textContent =
      formatCurrency(expense);

    balanceValue.textContent =
      formatCurrency(balance);

    updateChart(income, expense);

  }

  // ======================================
  // RENDERIZAÇÃO DA TABELA
  // ======================================

  function renderTransactions() {

    const search =
      searchInput.value
        .toLowerCase()
        .trim();

    const filter =
      typeFilter.value;

    const filtered =
      transactions.filter(transaction => {

        const matchesSearch =
          transaction.description
            .toLowerCase()
            .includes(search) ||
          transaction.category
            .toLowerCase()
            .includes(search);

        const matchesType =
          filter === "all" ||
          transaction.type === filter;

        return matchesSearch && matchesType;

      });

    transactionList.innerHTML = "";

    if (filtered.length === 0) {

      transactionList.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            Nenhuma transação encontrada.
          </td>
        </tr>
      `;

      return;

    }

    filtered.forEach(transaction => {

      const row =
        document.createElement("tr");

      const typeLabel =
        transaction.type === "income"
          ? "Receita"
          : "Despesa";

      const statusLabel =
        transaction.type === "income"
          ? "Entrada"
          : "Saída";

      row.innerHTML = `

        <td>
          ${escapeHTML(transaction.description)}
        </td>

        <td>
          ${escapeHTML(transaction.category)}
        </td>

        <td>
          ${typeLabel}
        </td>

        <td>
          ${formatCurrency(transaction.amount)}
        </td>

        <td>

          <span class="status ${transaction.type}">
            ${statusLabel}
          </span>

        </td>

        <td>

          <button
            class="delete-btn"
            data-id="${transaction.id}"
          >
            Excluir
          </button>

        </td>

      `;

      transactionList.appendChild(row);

    });

  }

  // ======================================
  // PROTEÇÃO CONTRA HTML INJETADO
  // ======================================

  function escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }

  // ======================================
  // NOVA TRANSAÇÃO
  // ======================================

  transactionForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const description =
        document
          .getElementById("description")
          .value
          .trim();

      const amount =
        Number(
          document
            .getElementById("amount")
            .value
        );

      const category =
        document
          .getElementById("category")
          .value;

      const type =
        document
          .getElementById("type")
          .value;

      if (
        !description ||
        !amount ||
        amount <= 0
      ) {

        alert(
          "Preencha corretamente a descrição e o valor."
        );

        return;

      }

      const newTransaction = {

        id: Date.now(),

        description,

        category,

        type,

        amount

      };

      transactions.unshift(
        newTransaction
      );

      saveTransactions();

      renderTransactions();

      updateDashboard();

      transactionForm.reset();

    }
  );

  // ======================================
  // EXCLUIR TRANSAÇÃO
  // ======================================

  transactionList.addEventListener(
    "click",
    event => {

      if (
        !event.target.classList.contains(
          "delete-btn"
        )
      ) {
        return;
      }

      const id =
        Number(
          event.target.dataset.id
        );

      transactions =
        transactions.filter(
          transaction =>
            transaction.id !== id
        );

      saveTransactions();

      renderTransactions();

      updateDashboard();

    }
  );

  // ======================================
  // PESQUISA
  // ======================================

  searchInput.addEventListener(
    "input",
    renderTransactions
  );

  // ======================================
  // FILTRO
  // ======================================

  typeFilter.addEventListener(
    "change",
    renderTransactions
  );

  // ======================================
  // EXPORTAR CSV
  // ======================================

  exportCSV.addEventListener(
    "click",
    () => {

      if (transactions.length === 0) {

        alert(
          "Não existem transações para exportar."
        );

        return;

      }

      const headers = [
        "Descrição",
        "Categoria",
        "Tipo",
        "Valor"
      ];

      const rows =
        transactions.map(
          transaction => [

            transaction.description,

            transaction.category,

            transaction.type === "income"
              ? "Receita"
              : "Despesa",

            transaction.amount
              .toFixed(2)
              .replace(".", ",")

          ]
        );

      const csv = [

        headers,

        ...rows

      ]
        .map(row =>
          row
            .map(value =>
              `"${String(value).replaceAll('"', '""')}"`
            )
            .join(";")
        )
        .join("\n");

      const blob =
        new Blob(
          ["\uFEFF" + csv],
          {
            type: "text/csv;charset=utf-8;"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "cabral-financeiro.csv";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

    }
  );

  // ======================================
  // ATUALIZAR
  // ======================================

  refreshBtn.addEventListener(
    "click",
    () => {

      renderTransactions();

      updateDashboard();

    }
  );

  // ======================================
  // NOTIFICAÇÕES
  // ======================================

  notificationBtn.addEventListener(
    "click",
    () => {

      alert(
        "Você possui 3 alertas operacionais pendentes."
      );

    }
  );

  // ======================================
  // GRÁFICO
  // ======================================

  let financeChart = null;

  function updateChart(
    income,
    expense
  ) {

    const canvas =
      document.getElementById(
        "financeChart"
      );

    if (!canvas) {
      return;
    }

    if (financeChart) {
      financeChart.destroy();
    }

    financeChart =
      new Chart(
        canvas,
        {
          type: "doughnut",

          data: {

            labels: [
              "Receitas",
              "Despesas"
            ],

            datasets: [

              {
                data: [
                  income,
                  expense
                ],

                borderWidth: 0,

                backgroundColor: [
                  "#ffffff",
                  "#52525b"
                ],

                hoverOffset: 8
              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "72%",

            plugins: {

              legend: {

                position: "bottom",

                labels: {

                  color: "#a1a1aa",

                  padding: 20,

                  font: {
                    family: "Inter"
                  }

                }

              }

            }

          }

        }
      );

  }

  // ======================================
  // INICIALIZAÇÃO
  // ======================================

  renderTransactions();

  updateDashboard();

});