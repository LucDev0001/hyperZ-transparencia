// /var/www/html/hyperz/transparency/js/parties.js
let partyChart1 = null;
let partyChart2 = null;

async function loadPartyOptions() {
  const select = document.getElementById("partyAnalyticsSelect");
  if (!select || select.children.length > 1) return;

  try {
    const json = await api.camara("partidos?itens=100&ordem=ASC&ordenarPor=sigla");

    select.innerHTML = '<option value="">Selecione um partido...</option>';
    json.dados.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.sigla;
      opt.textContent = p.sigla + " - " + p.nome;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Erro ao carregar partidos para análise:", e);
    select.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

async function analyzeParty() {
  const sigla = document.getElementById("partyAnalyticsSelect").value;
  if (!sigla) {
    alert("Por favor, selecione um partido.");
    return;
  }

  const dashboard = document.getElementById("party-dashboard");
  const loadingBar = document.getElementById("party-loading-bar");
  const loadingBarInner = loadingBar.querySelector("div");
  const loadingText = document.getElementById("party-loading-text");

  dashboard.classList.remove("hidden");
  loadingBar.classList.remove("hidden");
  loadingText.classList.remove("hidden");
  loadingText.textContent = `Buscando membros do ${sigla}...`;
  loadingBarInner.style.width = "5%";

  try {
    // 1. Buscar membros
    const jsonMembers = await api.camara(`deputados?siglaPartido=${sigla}&itens=100`);
    const members = jsonMembers.dados;

    // Limitar amostra para não travar (Top 20 primeiros da lista)
    const sampleSize = Math.min(members.length, 20);
    const sampleMembers = members.slice(0, sampleSize);

    document.getElementById(
      "party-member-count"
    ).textContent = `${sampleSize} (Amostra)`;

    let totalPartySpent = 0;
    const politicianRanking = [];
    const companyRanking = {};
    const currentYear = new Date().getFullYear();

    // 2. Iterar sobre a amostra e buscar gastos
    for (let i = 0; i < sampleSize; i++) {
      const deputy = sampleMembers[i];
      const progress = Math.round(((i + 1) / sampleSize) * 100);
      loadingBarInner.style.width = `${progress}%`;
      loadingText.textContent = `Analisando gastos de ${deputy.nome} (${
        i + 1
      }/${sampleSize})...`;

      try {
        const jsonExp = await api.camara(`deputados/${deputy.id}/despesas?ano=${currentYear}&itens=100`);

        let deputyTotal = 0;
        jsonExp.dados.forEach((d) => {
          const val = parseFloat(d.valorLiquido) || 0;
          deputyTotal += val;
          totalPartySpent += val;

          // Agrupar empresas
          const companyName = d.nomeFornecedor;
          if (!companyRanking[companyName]) companyRanking[companyName] = 0;
          companyRanking[companyName] += val;
        });

        politicianRanking.push({
          name: deputy.nome,
          total: deputyTotal,
          photo: deputy.urlFoto,
        });
      } catch (err) {
        console.error(`Erro ao analisar deputado ${deputy.id}`, err);
      }
    }

    // 3. Renderizar Resultados
    loadingText.textContent = "Gerando gráficos...";

    // Atualizar Totais
    document.getElementById("party-total-spent").textContent =
      window.formatCurrency(totalPartySpent);

    // Top Empresas
    const sortedCompanies = Object.entries(companyRanking)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (sortedCompanies.length > 0) {
      document.getElementById("party-top-supplier").textContent =
        sortedCompanies[0][0];
    }

    // Top Políticos
    const sortedPoliticians = politicianRanking
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Renderizar Gráficos
    renderPartyCharts(sortedPoliticians, sortedCompanies);
  } catch (e) {
    console.error(e);
    alert("Erro ao analisar partido.");
  } finally {
    loadingBar.classList.add("hidden");
    loadingText.classList.add("hidden");
  }
}

function renderPartyCharts(politicians, companies) {
  const ctx1 = document
    .getElementById("partyTopPoliticiansChart")
    .getContext("2d");
  const ctx2 = document
    .getElementById("partyTopCompaniesChart")
    .getContext("2d");

  if (partyChart1) partyChart1.destroy();
  if (partyChart2) partyChart2.destroy();

  // Gráfico Políticos
  partyChart1 = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: politicians.map((p) => p.name),
      datasets: [
        {
          label: "Gasto Total (R$)",
          data: politicians.map((p) => p.total),
          backgroundColor: "#8b5cf6",
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "#27272a" }, ticks: { color: "#a1a1aa" } },
        y: { ticks: { color: "#fff" } },
      },
    },
  });

  // Gráfico Empresas
  partyChart2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: companies.map((c) => c[0].substring(0, 20) + "..."),
      datasets: [
        {
          label: "Recebido (R$)",
          data: companies.map((c) => c[1]),
          backgroundColor: "#10b981",
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "#27272a" }, ticks: { color: "#a1a1aa" } },
        y: { ticks: { color: "#fff" } },
      },
    },
  });
}
