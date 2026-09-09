// ======================================
// CABRAL • GESTÃO FINANCEIRA
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  // ======================================
  // ELEMENTOS
  // ======================================

  const transactionForm = document.getElementById("transactionForm");
  const transactionList = document.getElementById("transactionList");
  const dateInput = document.getElementById("date");

  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");
  const monthFilter = document.getElementById("monthFilter");

  const exportCSV = document.getElementById("exportCSV");
  const refreshBtn = document.getElementById("refreshBtn");

  const notificationBtn = document.getElementById("notificationBtn");
  const notificationDot = document.getElementById("notificationDot");
  const notificationPanel = document.getElementById("notificationPanel");
  const notificationList = document.getElementById("notificationList");

  const incomeValue = document.getElementById("incomeValue");
  const expenseValue = document.getElementById("expenseValue");
  const balanceValue = document.getElementById("balanceValue");
  const incomeTrend = document.getElementById("incomeTrend");
  const expenseTrend = document.getElementById("expenseTrend");
  const balanceTrend = document.getElementById("balanceTrend");

  const predictionValue = document.getElementById("predictionValue");
  const predictionTrend = document.getElementById("predictionTrend");

  const ticketMedioValue = document.getElementById("ticketMedioValue");
  const cmvValue = document.getElementById("cmvValue");
  const deliveryValue = document.getElementById("deliveryValue");
  const transactionsCountValue = document.getElementById("transactionsCountValue");

  const alertsGrid = document.getElementById("alertsGrid");
  const goalsGrid = document.getElementById("goalsGrid");
  const aiAnalysis = document.getElementById("aiAnalysis");

  const chartResultLabel = document.getElementById("chartResultLabel");

  const navButtons = document.querySelectorAll(".nav-btn");
  const viewSections = document.querySelectorAll("[data-views]");

  // ======================================
  // DADOS INICIAIS
  // (com datas reais, espalhadas em 3 meses, pra filtro de mês e
  // comparativos mês a mês funcionarem de verdade)
  // ======================================

  const defaultTransactions = [
    { id: 1, description: "Troca Câmara Fria", category: "Manutenção", type: "expense", amount: 12500, date: "2026-05-10" },
    { id: 2, description: "Evento Corporativo", category: "Eventos", type: "income", amount: 18500, date: "2026-05-15" },
    { id: 3, description: "Compra de Estoque", category: "Estoque", type: "expense", amount: 6200, date: "2026-05-05" },
    { id: 4, description: "Atendimento Mensal", category: "Atendimento", type: "income", amount: 24000, date: "2026-05-20" },
    { id: 5, description: "Campanha Digital", category: "Marketing", type: "expense", amount: 3200, date: "2026-04-18" },
    { id: 6, description: "Serviço de Bar", category: "Bar", type: "income", amount: 14150, date: "2026-05-12" },
    { id: 7, description: "Infraestrutura", category: "Infraestrutura", type: "expense", amount: 5100, date: "2026-04-22" },
    { id: 8, description: "Fornecedor Principal", category: "Fornecedores", type: "expense", amount: 13549, date: "2026-03-28" },
    { id: 9, description: "Delivery iFood", category: "Delivery", type: "income", amount: 9800, date: "2026-05-08" },
    { id: 10, description: "Delivery Rappi", category: "Delivery", type: "income", amount: 6200, date: "2026-05-18" },
    { id: 11, description: "Delivery iFood", category: "Delivery", type: "income", amount: 7200, date: "2026-04-10" },
    { id: 12, description: "Atendimento Mensal", category: "Atendimento", type: "income", amount: 21000, date: "2026-04-14" },
    { id: 13, description: "Compra de Estoque", category: "Estoque", type: "expense", amount: 5400, date: "2026-04-08" },
    { id: 14, description: "Evento Corporativo", category: "Eventos", type: "income", amount: 12000, date: "2026-03-20" },
    { id: 15, description: "Atendimento Mensal", category: "Atendimento", type: "income", amount: 19500, date: "2026-03-12" },
    { id: 16, description: "Compra de Estoque", category: "Estoque", type: "expense", amount: 4800, date: "2026-03-15" }
  ];

  let transactions = JSON.parse(localStorage.getItem("cabralTransactions")) || defaultTransactions;

  const defaultGoals = {
    reservaAlvo: 25000,
    reducaoAlvoPercent: 15
  };

  let goals = JSON.parse(localStorage.getItem("cabralGoals")) || defaultGoals;

  let selectedMonth = "all";
  let currentView = "dashboard";

  // ======================================
  // FORMATAÇÃO
  // ======================================

  function formatCurrency(value) {

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value || 0);

  }

  function formatPercent(value) {

    const rounded = Math.round(value * 10) / 10;

    return `${rounded > 0 ? "+" : ""}${rounded}%`;

  }

  function getMonthKey(dateString) {

    return dateString.slice(0, 7); // "2026-05"

  }

  function getMonthLabel(monthKey) {

    const [year, month] = monthKey.split("-").map(Number);

    const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
      .format(new Date(year, month - 1, 1));

    return label.charAt(0).toUpperCase() + label.slice(1);

  }

  function daysBetween(dateA, dateB) {

    const msPerDay = 1000 * 60 * 60 * 24;

    return Math.round((dateA - dateB) / msPerDay);

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
  // SALVAR
  // ======================================

  function saveTransactions() {

    localStorage.setItem("cabralTransactions", JSON.stringify(transactions));

  }

  function saveGoals() {

    localStorage.setItem("cabralGoals", JSON.stringify(goals));

  }

  // ======================================
  // FILTRO DE MÊS: opções geradas a partir dos dados reais
  // ======================================

  function populateMonthFilter() {

    const monthKeys = [...new Set(transactions.map(transaction => getMonthKey(transaction.date)))]
      .sort()
      .reverse();

    const previousValue = monthFilter.value || selectedMonth;

    monthFilter.innerHTML = `<option value="all">Todos os meses</option>`;

    monthKeys.forEach(monthKey => {

      const option = document.createElement("option");

      option.value = monthKey;
      option.textContent = getMonthLabel(monthKey);

      monthFilter.appendChild(option);

    });

    // Mantém a seleção anterior se ainda existir; senão, cai no mês mais recente
    if (monthKeys.includes(previousValue) || previousValue === "all") {

      monthFilter.value = previousValue;

    } else {

      monthFilter.value = monthKeys[0] || "all";

    }

    selectedMonth = monthFilter.value;

  }

  // ======================================
  // CÁLCULOS FINANCEIROS (respeitam o mês selecionado)
  // ======================================

  function getTransactionsForMonth(monthKey) {

    if (monthKey === "all") {

      return transactions;

    }

    return transactions.filter(transaction => getMonthKey(transaction.date) === monthKey);

  }

  function computeTotals(transactionSet) {

    const income = transactionSet
      .filter(transaction => transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const expense = transactionSet
      .filter(transaction => transaction.type === "expense")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const deliveryIncome = transactionSet
      .filter(transaction => transaction.type === "income" && transaction.category === "Delivery")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const estoqueExpense = transactionSet
      .filter(transaction => transaction.type === "expense" && transaction.category === "Estoque")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const incomeCount = transactionSet.filter(transaction => transaction.type === "income").length;

    return { income, expense, balance: income - expense, deliveryIncome, estoqueExpense, incomeCount };

  }

  function getSortedMonthKeys() {

    return [...new Set(transactions.map(transaction => getMonthKey(transaction.date)))].sort();

  }

  // ======================================
  // ATUALIZAR DASHBOARD (cards, KPIs, gráfico)
  // ======================================

  function updateDashboard() {

    const monthTransactions = getTransactionsForMonth(selectedMonth);
    const totals = computeTotals(monthTransactions);

    incomeValue.textContent = formatCurrency(totals.income);
    expenseValue.textContent = formatCurrency(totals.expense);
    balanceValue.textContent = formatCurrency(totals.balance);

    // Comparativo com o mês anterior ao selecionado (ou aos dois últimos meses, se "todos")
    const sortedMonths = getSortedMonthKeys();

    // Valores padrão, usados quando não há mês anterior disponível pra comparar
    incomeTrend.textContent = "Sem mês anterior pra comparar";
    incomeTrend.className = "card-trend neutral-trend";

    expenseTrend.textContent = "Sem mês anterior pra comparar";
    expenseTrend.className = "card-trend neutral-trend";

    balanceTrend.textContent = totals.balance >= 0 ? "Fluxo positivo" : "Fluxo negativo";
    balanceTrend.className = `card-trend ${totals.balance >= 0 ? "positive" : "negative"}`;

    if (sortedMonths.length >= 2) {

      const referenceMonth = selectedMonth === "all"
        ? sortedMonths[sortedMonths.length - 1]
        : selectedMonth;

      const referenceIndex = sortedMonths.indexOf(referenceMonth);

      if (referenceIndex > 0) {

        const previousMonth = sortedMonths[referenceIndex - 1];
        const previousTotals = computeTotals(getTransactionsForMonth(previousMonth));

        const incomeChange = previousTotals.income > 0
          ? ((totals.income - previousTotals.income) / previousTotals.income) * 100
          : 0;

        const expenseChange = previousTotals.expense > 0
          ? ((totals.expense - previousTotals.expense) / previousTotals.expense) * 100
          : 0;

        incomeTrend.textContent = `${formatPercent(incomeChange)} vs. mês anterior`;
        incomeTrend.className = `card-trend ${incomeChange >= 0 ? "positive" : "negative"}`;

        expenseTrend.textContent = `${formatPercent(expenseChange)} em custos`;
        expenseTrend.className = `card-trend ${expenseChange <= 0 ? "positive" : "negative"}`;

      }

    }

    // KPIs secundários
    ticketMedioValue.textContent = formatCurrency(
      totals.incomeCount > 0 ? totals.income / totals.incomeCount : 0
    );

    cmvValue.textContent = totals.income > 0
      ? `${Math.round((totals.estoqueExpense / totals.income) * 1000) / 10}%`
      : "0%";

    deliveryValue.textContent = totals.income > 0
      ? `${Math.round((totals.deliveryIncome / totals.income) * 1000) / 10}%`
      : "0%";

    transactionsCountValue.textContent = monthTransactions.length;

    // Previsão de manutenção: dias desde a última despesa de categoria "Manutenção"
    updateMaintenancePrediction();

    updateChart(totals.income, totals.expense);

    updateAlerts();
    updateGoals();
    updateAIAnalysis(totals);

  }

  function updateMaintenancePrediction() {

    const maintenanceExpenses = transactions
      .filter(transaction => transaction.category === "Manutenção" && transaction.type === "expense")
      .sort((a, b) => b.date.localeCompare(a.date));

    if (maintenanceExpenses.length === 0) {

      predictionValue.textContent = "Sem histórico";
      predictionTrend.textContent = "Nenhuma manutenção registrada";
      predictionTrend.className = "card-trend negative";

      return;

    }

    const lastMaintenance = maintenanceExpenses[0];
    const daysSince = daysBetween(new Date(), new Date(lastMaintenance.date));

    predictionValue.textContent = daysSince > 60 ? "Revisão Recomendada" : "Dentro do Prazo";

    predictionTrend.textContent = daysSince >= 0
      ? `Última manutenção há ${daysSince} dias`
      : `Próxima manutenção em ${Math.abs(daysSince)} dias`;

    predictionTrend.className = `card-trend ${daysSince > 60 ? "negative" : "positive"}`;

  }

  // ======================================
  // ALERTAS OPERACIONAIS (computados a partir dos dados reais)
  // ======================================

  function computeAlerts() {

    const alerts = [];
    const sortedMonths = getSortedMonthKeys();

    if (sortedMonths.length >= 2) {

      const latestMonth = sortedMonths[sortedMonths.length - 1];
      const previousMonth = sortedMonths[sortedMonths.length - 2];

      const latestTotals = computeTotals(getTransactionsForMonth(latestMonth));
      const previousTotals = computeTotals(getTransactionsForMonth(previousMonth));

      // Custos
      if (previousTotals.expense > 0) {

        const expenseChange = ((latestTotals.expense - previousTotals.expense) / previousTotals.expense) * 100;

        if (expenseChange > 5) {

          alerts.push({
            type: "danger",
            icon: "!",
            title: "Custos Elevados",
            text: `Despesas operacionais subiram ${formatPercent(expenseChange)} em relação a ${getMonthLabel(previousMonth)}.`
          });

        } else if (expenseChange < -5) {

          alerts.push({
            type: "positive",
            icon: "↓",
            title: "Custos em Queda",
            text: `Despesas operacionais caíram ${formatPercent(Math.abs(expenseChange))} em relação a ${getMonthLabel(previousMonth)}.`
          });

        }

      }

      // Delivery
      if (previousTotals.deliveryIncome > 0) {

        const deliveryChange = ((latestTotals.deliveryIncome - previousTotals.deliveryIncome) / previousTotals.deliveryIncome) * 100;

        if (deliveryChange > 5) {

          alerts.push({
            type: "neutral",
            icon: "↗",
            title: "Delivery em Crescimento",
            text: `Receita de delivery cresceu ${formatPercent(deliveryChange)} em relação a ${getMonthLabel(previousMonth)}.`
          });

        }

      } else if (latestTotals.deliveryIncome > 0) {

        alerts.push({
          type: "neutral",
          icon: "↗",
          title: "Delivery em Crescimento",
          text: `Delivery gerou ${formatCurrency(latestTotals.deliveryIncome)} em ${getMonthLabel(latestMonth)}, sem histórico anterior pra comparar.`
        });

      }

    }

    // Manutenção
    const maintenanceExpenses = transactions
      .filter(transaction => transaction.category === "Manutenção" && transaction.type === "expense")
      .sort((a, b) => b.date.localeCompare(a.date));

    if (maintenanceExpenses.length === 0) {

      alerts.push({
        type: "warning",
        icon: "!",
        title: "Manutenção Pendente",
        text: "Nenhuma manutenção foi registrada ainda. Considere agendar uma revisão preventiva."
      });

    } else {

      const daysSince = daysBetween(new Date(), new Date(maintenanceExpenses[0].date));

      if (daysSince > 60) {

        alerts.push({
          type: "warning",
          icon: "!",
          title: "Manutenção Pendente",
          text: `Já se passaram ${daysSince} dias desde a última manutenção registrada (${maintenanceExpenses[0].description}).`
        });

      }

    }

    if (alerts.length === 0) {

      alerts.push({
        type: "positive",
        icon: "✓",
        title: "Tudo em Ordem",
        text: "Nenhum alerta operacional no momento. Os indicadores estão dentro do esperado."
      });

    }

    return alerts;

  }

  function renderAlertCard(alert) {

    return `
      <div class="alert-card ${alert.type}">
        <div class="alert-icon">${alert.icon}</div>
        <div>
          <h3>${escapeHTML(alert.title)}</h3>
          <p>${escapeHTML(alert.text)}</p>
        </div>
      </div>
    `;

  }

  function updateAlerts() {

    const alerts = computeAlerts();

    alertsGrid.innerHTML = alerts.map(renderAlertCard).join("");

    // O painel de notificações reaproveita os mesmos alertas, sempre em sincronia
    const activeAlerts = alerts.filter(alert => alert.type !== "positive");

    if (activeAlerts.length === 0) {

      notificationList.innerHTML = `<p class="notification-empty">Nenhum alerta pendente. Tudo em ordem!</p>`;
      notificationDot.classList.add("hidden");

    } else {

      notificationList.innerHTML = activeAlerts.map(alert => `
        <div class="notification-item">
          <strong>${escapeHTML(alert.title)}</strong>
          ${escapeHTML(alert.text)}
        </div>
      `).join("");

      notificationDot.classList.remove("hidden");

    }

  }

  // ======================================
  // METAS FINANCEIRAS (alvo editável, guardado no localStorage)
  // ======================================

  function updateGoals() {

    const allTotals = computeTotals(transactions);
    const sortedMonths = getSortedMonthKeys();

    const reservaProgress = goals.reservaAlvo > 0
      ? Math.min(100, Math.max(0, (allTotals.balance / goals.reservaAlvo) * 100))
      : 0;

    let reducaoProgress = 0;
    let reducaoAtual = 0;

    if (sortedMonths.length >= 2) {

      const latestTotals = computeTotals(getTransactionsForMonth(sortedMonths[sortedMonths.length - 1]));
      const previousTotals = computeTotals(getTransactionsForMonth(sortedMonths[sortedMonths.length - 2]));

      if (previousTotals.expense > 0) {

        reducaoAtual = ((previousTotals.expense - latestTotals.expense) / previousTotals.expense) * 100;

      }

    }

    reducaoProgress = goals.reducaoAlvoPercent > 0
      ? Math.min(100, Math.max(0, (reducaoAtual / goals.reducaoAlvoPercent) * 100))
      : 0;

    goalsGrid.innerHTML = `

      <div class="goal-card">
        <div class="goal-header">
          <span>Reserva Operacional</span>
          <strong data-goal="reservaAlvo">${Math.round(reservaProgress)}%</strong>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width: ${reservaProgress}%;"></div>
        </div>
        <div class="goal-target">Alvo: ${formatCurrency(goals.reservaAlvo)} de saldo acumulado</div>
      </div>

      <div class="goal-card">
        <div class="goal-header">
          <span>Redução de Custos</span>
          <strong data-goal="reducaoAlvoPercent">${Math.round(reducaoProgress)}%</strong>
        </div>
        <div class="progress-bar">
          <div class="progress secondary-progress" style="width: ${reducaoProgress}%;"></div>
        </div>
        <div class="goal-target">Alvo: reduzir ${goals.reducaoAlvoPercent}% das despesas mês a mês</div>
      </div>

    `;

    goalsGrid.querySelectorAll("[data-goal]").forEach(element => {

      element.addEventListener("click", () => {

        const goalKey = element.dataset.goal;

        const currentValue = goals[goalKey];

        const label = goalKey === "reservaAlvo"
          ? "Novo valor alvo de reserva operacional (R$):"
          : "Nova meta de redução de custos (%):";

        const input = prompt(label, currentValue);

        if (input === null) {
          return;
        }

        const parsed = Number(input.replace(",", "."));

        if (Number.isNaN(parsed) || parsed <= 0) {

          alert("Digite um valor numérico válido e maior que zero.");

          return;

        }

        goals[goalKey] = parsed;

        saveGoals();
        updateGoals();

      });

    });

  }

  // ======================================
  // ANÁLISE INTELIGENTE (texto gerado a partir dos dados reais)
  // ======================================

  function updateAIAnalysis(totals) {

    const parts = [];

    parts.push(
      totals.balance >= 0
        ? `Fluxo financeiro positivo no período, com saldo de ${formatCurrency(totals.balance)}.`
        : `Atenção: o período fechou com saldo negativo de ${formatCurrency(Math.abs(totals.balance))}.`
    );

    if (totals.income > 0) {

      const deliveryPercent = Math.round((totals.deliveryIncome / totals.income) * 100);

      if (deliveryPercent > 0) {

        parts.push(`O delivery representa ${deliveryPercent}% da receita do período.`);

      }

    }

    const maintenanceExpenses = transactions
      .filter(transaction => transaction.category === "Manutenção" && transaction.type === "expense")
      .sort((a, b) => b.date.localeCompare(a.date));

    if (maintenanceExpenses.length > 0) {

      const daysSince = daysBetween(new Date(), new Date(maintenanceExpenses[0].date));

      if (daysSince > 60) {

        parts.push("Há previsão de manutenção estrutural pendente, que pode impactar os próximos ciclos operacionais.");

      }

    } else {

      parts.push("Nenhuma manutenção foi registrada até o momento — vale considerar um planejamento preventivo.");

    }

    aiAnalysis.innerHTML = `<p>${parts.join(" ")}</p>`;

  }

  // ======================================
  // RENDERIZAÇÃO DA TABELA (respeita busca, tipo e mês)
  // ======================================

  function getFilteredTransactions() {

    const search = searchInput.value.toLowerCase().trim();
    const typeValue = typeFilter.value;

    return getTransactionsForMonth(selectedMonth).filter(transaction => {

      const matchesSearch =
        transaction.description.toLowerCase().includes(search) ||
        transaction.category.toLowerCase().includes(search);

      const matchesType = typeValue === "all" || transaction.type === typeValue;

      return matchesSearch && matchesType;

    });

  }

  function renderTransactions() {

    const filtered = getFilteredTransactions()
      .sort((a, b) => b.date.localeCompare(a.date));

    transactionList.innerHTML = "";

    if (filtered.length === 0) {

      transactionList.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            Nenhuma transação encontrada.
          </td>
        </tr>
      `;

      return;

    }

    filtered.forEach(transaction => {

      const row = document.createElement("tr");

      const typeLabel = transaction.type === "income" ? "Receita" : "Despesa";
      const statusLabel = transaction.type === "income" ? "Entrada" : "Saída";

      const formattedDate = new Intl.DateTimeFormat("pt-BR").format(new Date(`${transaction.date}T00:00:00`));

      row.innerHTML = `

        <td>${formattedDate}</td>
        <td>${escapeHTML(transaction.description)}</td>
        <td>${escapeHTML(transaction.category)}</td>
        <td>${typeLabel}</td>
        <td>${formatCurrency(transaction.amount)}</td>

        <td>
          <span class="status ${transaction.type}">${statusLabel}</span>
        </td>

        <td>
          <button class="delete-btn" data-id="${transaction.id}">Excluir</button>
        </td>

      `;

      transactionList.appendChild(row);

    });

  }

  // ======================================
  // NOVA TRANSAÇÃO
  // ======================================

  transactionForm.addEventListener("submit", event => {

    event.preventDefault();

    const description = document.getElementById("description").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const type = document.getElementById("type").value;

    if (!description || !amount || amount <= 0 || !date) {

      alert("Preencha corretamente a descrição, o valor e a data.");

      return;

    }

    transactions.unshift({ id: Date.now(), description, category, type, amount, date });

    saveTransactions();
    populateMonthFilter();
    renderTransactions();
    updateDashboard();

    transactionForm.reset();
    dateInput.value = new Date().toISOString().split("T")[0];

  });

  // ======================================
  // EXCLUIR TRANSAÇÃO (com confirmação)
  // ======================================

  transactionList.addEventListener("click", event => {

    if (!event.target.classList.contains("delete-btn")) {
      return;
    }

    const id = Number(event.target.dataset.id);
    const transaction = transactions.find(item => item.id === id);

    const confirmed = confirm(
      `Tem certeza que deseja excluir "${transaction ? transaction.description : "esta transação"}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    transactions = transactions.filter(item => item.id !== id);

    saveTransactions();
    populateMonthFilter();
    renderTransactions();
    updateDashboard();

  });

  // ======================================
  // PESQUISA E FILTROS
  // ======================================

  searchInput.addEventListener("input", renderTransactions);

  typeFilter.addEventListener("change", renderTransactions);

  monthFilter.addEventListener("change", () => {

    selectedMonth = monthFilter.value;

    renderTransactions();
    updateDashboard();

  });

  // ======================================
  // EXPORTAR CSV (exporta o que está filtrado na tela)
  // ======================================

  exportCSV.addEventListener("click", () => {

    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {

      alert("Não existem transações para exportar com os filtros atuais.");

      return;

    }

    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];

    const rows = filtered.map(transaction => [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type === "income" ? "Receita" : "Despesa",
      transaction.amount.toFixed(2).replace(".", ",")
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cabral-financeiro.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  });

  // ======================================
  // ATUALIZAR (com feedback visual real)
  // ======================================

  refreshBtn.addEventListener("click", () => {

    populateMonthFilter();
    renderTransactions();
    updateDashboard();

    const originalText = refreshBtn.textContent;

    refreshBtn.textContent = "Atualizado ✓";
    refreshBtn.classList.add("success");

    setTimeout(() => {

      refreshBtn.textContent = originalText;
      refreshBtn.classList.remove("success");

    }, 1500);

  });

  // ======================================
  // NOTIFICAÇÕES (dropdown real, em vez de alert())
  // ======================================

  notificationBtn.addEventListener("click", event => {

    event.stopPropagation();

    notificationPanel.classList.toggle("hidden");

  });

  document.addEventListener("click", event => {

    if (!notificationPanel.contains(event.target) && event.target !== notificationBtn) {

      notificationPanel.classList.add("hidden");

    }

  });

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      notificationPanel.classList.add("hidden");

    }

  });

  // ======================================
  // NAVEGAÇÃO ENTRE VISÕES
  // ======================================

  navButtons.forEach(button => {

    button.addEventListener("click", () => {

      currentView = button.dataset.view;

      navButtons.forEach(btn => btn.classList.toggle("active", btn === button));

      viewSections.forEach(section => {

        const views = section.dataset.views.split(" ");

        section.classList.toggle("hidden", !views.includes(currentView));

      });

    });

  });

  // ======================================
  // GRÁFICO
  // ======================================

  let financeChart = null;

  function updateChart(income, expense) {

    const canvas = document.getElementById("financeChart");

    if (!canvas) {
      return;
    }

    if (financeChart) {
      financeChart.destroy();
    }

    const total = income + expense;

    chartResultLabel.textContent = total > 0
      ? `${Math.round(((income - expense) / total) * 100)}%`
      : "0%";

    financeChart = new Chart(canvas, {

      type: "doughnut",

      data: {

        labels: ["Receitas", "Despesas"],

        datasets: [{

          data: [income, expense],
          borderWidth: 0,
          backgroundColor: ["#4ade80", "#f87171"],
          hoverOffset: 8

        }]

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
              font: { family: "Inter" }
            }

          }

        }

      }

    });

  }

  // ======================================
  // INICIALIZAÇÃO
  // ======================================

  dateInput.value = new Date().toISOString().split("T")[0];

  populateMonthFilter();
  renderTransactions();
  updateDashboard();

});