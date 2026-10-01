//transparency/js/transparency.js

let currentFilterMode = "mes";
let transfChart1 = null;
let transfChart2 = null;
let gestaoChartInstance = null;
let currentTransfPage = 1;
let currentTransfData = [];
let currentCardPage = 1;

// Instâncias dos gráficos da aba orçamento
let orcEsferaChart = null;
let orcUfChart = null;
let orcFinalidadeChart = null;
let orcCredorChart = null;

window.filterOrcamento = function () {
  if (typeof window.loadCharts === "function") window.loadCharts();
};

window.loadCharts = async function () {
  const statusEl = document.getElementById("budget-status");
  const tableBody = document.getElementById("orcTableBody");

  try {
    if (statusEl) {
      statusEl.innerHTML = `<span class="animate-pulse text-violet-400">🔄 Baixando dados do DataLake do Tesouro (SADIPEM)...</span>`;
    }
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="5" class="px-5 py-8 text-center text-zinc-500 animate-pulse">Consultando PVLs...</td></tr>`;
    }

    // ── INTEGRAÇÃO: DATALAKE TESOURO NACIONAL (SADIPEM) via proxy backend ──
    const ufFilter   = document.getElementById("orcFilterUf")?.value   || "";
    const tipoFilter = document.getElementById("orcFilterTipo")?.value || "";

    const pvlParams = { limit: 200 };
    if (ufFilter)   pvlParams.uf              = ufFilter;
    if (tipoFilter) pvlParams.tipo_interessado = tipoFilter;

    const data = await fetchApi("proxy_pvl", pvlParams);

    if (data.erro || !data.items) {
      throw new Error(data.erro || "Falha na API do Tesouro SADIPEM.");
    }

    const records = data.items;

    // Variáveis para agregação
    let totalEstado = 0;
    let totalMunicipio = 0;
    let totalVolume = 0;
    let qtdDeferidos = 0;
    let qtdAnalise = 0;

    const ufVolume = {};
    const finalidadeVolume = {};
    const credorVolume = {};

    records.forEach((r) => {
      const val = parseFloat(r.valor) || 0;
      totalVolume += val;

      const status = (r.status || "").toLowerCase();
      if (
        status.includes("deferido") ||
        status.includes("regularizado") ||
        status.includes("encaminhado à pgfn")
      ) {
        qtdDeferidos++;
      } else if (
        status.includes("análise") ||
        status.includes("retificação") ||
        status.includes("pendente")
      ) {
        qtdAnalise++;
      }

      if (r.tipo_interessado === "Estado") totalEstado += val;
      else if (r.tipo_interessado === "Município") totalMunicipio += val;

      const uf = r.uf || "BR";
      if (!ufVolume[uf]) ufVolume[uf] = 0;
      ufVolume[uf] += val;

      const fin = r.finalidade || "Não informada";
      if (!finalidadeVolume[fin]) finalidadeVolume[fin] = 0;
      finalidadeVolume[fin] += val;

      const cred = r.credor || "Não informado";
      if (!credorVolume[cred]) credorVolume[cred] = 0;
      credorVolume[cred] += val;
    });

    // Atualiza KPIs
    document.getElementById("orcStatTotal").textContent =
      window.formatCurrency(totalVolume);
    document.getElementById("orcStatDeferidos").textContent = qtdDeferidos;
    document.getElementById("orcStatAnalise").textContent = qtdAnalise;
    document.getElementById("orcStatQtd").textContent = records.length;

    // Destroy old charts
    if (orcEsferaChart) orcEsferaChart.destroy();
    if (orcUfChart) orcUfChart.destroy();
    if (orcFinalidadeChart) orcFinalidadeChart.destroy();
    if (orcCredorChart) orcCredorChart.destroy();

    // Chart 1: Esfera
    orcEsferaChart = new Chart(
      document.getElementById("orcEsferaChart").getContext("2d"),
      {
        type: "doughnut",
        data: {
          labels: ["Estados", "Municípios"],
          datasets: [
            {
              data: [totalEstado, totalMunicipio],
              backgroundColor: ["#10b981", "#3b82f6"],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { color: "#a1a1aa" } },
          },
        },
      },
    );

    // Chart 2: UFs
    const topUfs = Object.entries(ufVolume)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    orcUfChart = new Chart(
      document.getElementById("orcUfChart").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: topUfs.map((u) => u[0]),
          datasets: [
            {
              label: "R$",
              data: topUfs.map((u) => u[1]),
              backgroundColor: "#8b5cf6",
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { grid: { color: "#27272a" }, ticks: { color: "#a1a1aa" } },
            x: { grid: { display: false }, ticks: { color: "#a1a1aa" } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => window.formatCurrency(ctx.raw) },
            },
          },
        },
      },
    );

    // Chart 3: Finalidades
    const topFins = Object.entries(finalidadeVolume)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    orcFinalidadeChart = new Chart(
      document.getElementById("orcFinalidadeChart").getContext("2d"),
      {
        type: "pie",
        data: {
          labels: topFins.map(
            (f) => f[0].substring(0, 20) + (f[0].length > 20 ? "..." : ""),
          ),
          datasets: [
            {
              data: topFins.map((f) => f[1]),
              backgroundColor: [
                "#f59e0b",
                "#ec4899",
                "#14b8a6",
                "#8b5cf6",
                "#64748b",
              ],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: { color: "#a1a1aa", font: { size: 10 } },
            },
            tooltip: {
              callbacks: { label: (ctx) => window.formatCurrency(ctx.raw) },
            },
          },
        },
      },
    );

    // Chart 4: Credores
    const topCreds = Object.entries(credorVolume)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    orcCredorChart = new Chart(
      document.getElementById("orcCredorChart").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: topCreds.map((c) => c[0].substring(0, 15)),
          datasets: [
            {
              label: "R$",
              data: topCreds.map((c) => c[1]),
              backgroundColor: "#ec4899",
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: "#27272a" },
              ticks: { color: "#a1a1aa", display: false },
            },
            y: { grid: { display: false }, ticks: { color: "#a1a1aa" } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => window.formatCurrency(ctx.raw) },
            },
          },
        },
      },
    );

    // Build Table (Top 20 most recent or largest)
    // Let's sort by date first if available, else by value
    const sortedRecords = [...records]
      .sort((a, b) => {
        const valA = parseFloat(a.valor) || 0;
        const valB = parseFloat(b.valor) || 0;
        return valB - valA; // Maior valor primeiro
      })
      .slice(0, 30);

    if (tableBody) {
      document.getElementById("orcTableCount").textContent =
        `Exibindo top ${sortedRecords.length} maiores operações`;
      tableBody.innerHTML = sortedRecords
        .map((r) => {
          let statusBadge = `bg-zinc-800 text-zinc-300`;
          const st = (r.status || "").toLowerCase();
          if (st.includes("deferido") || st.includes("regularizado"))
            statusBadge = `bg-green-900/30 text-green-400 border border-green-800/50`;
          else if (
            st.includes("arquivado") ||
            st.includes("indeferido") ||
            st.includes("cancelado")
          )
            statusBadge = `bg-red-900/30 text-red-400 border border-red-800/50`;
          else if (st.includes("análise") || st.includes("retificação"))
            statusBadge = `bg-amber-900/30 text-amber-400 border border-amber-800/50`;

          return `
            <tr class="hover:bg-white/5 transition">
                <td class="px-5 py-3">
                    <div class="font-bold text-white">${r.interessado || "N/A"}</div>
                    <div class="text-[10px] text-zinc-500">${r.tipo_interessado} - ${r.uf}</div>
                </td>
                <td class="px-5 py-3 text-xs max-w-xs truncate" title="${r.finalidade}">${r.finalidade || "-"}</td>
                <td class="px-5 py-3 text-xs truncate max-w-[150px]" title="${r.credor}">${r.credor || "-"}</td>
                <td class="px-5 py-3 text-right font-mono font-bold text-violet-300">${window.formatCurrency(r.valor)}</td>
                <td class="px-5 py-3 text-center">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge}">${r.status}</span>
                </td>
            </tr>
            `;
        })
        .join("");
    }

    if (statusEl) {
      statusEl.innerHTML = `✅ <b>DataLake Tesouro Nacional Conectado.</b> Dados reais de Operações de Crédito da federação (SADIPEM) carregados.`;
      statusEl.className =
        "mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 text-sm";
    }
  } catch (error) {
    console.error("Falha ao conectar no SADIPEM:", error.message);

    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="5" class="px-5 py-8 text-center text-red-400">
        Não foi possível carregar os dados do Tesouro Nacional.<br>
        <span class="text-zinc-500 text-xs">${error.message}</span>
      </td></tr>`;
    }
    if (statusEl) {
      statusEl.innerHTML = `❌ <strong>Erro:</strong> ${error.message}. Verifique a conexão ou tente recarregar a página.`;
      statusEl.className =
        "mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm";
    }
  }
};

async function loadParties() {
  const select = document.getElementById("partySelect");
  if (!select || select.children.length > 1) return;

  try {
    const json = await api.camara(
      "partidos?itens=100&ordem=ASC&ordenarPor=sigla",
    );
    (json.dados || []).forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.sigla;
      opt.textContent = p.sigla + " - " + p.nome;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Erro ao carregar partidos:", e);
  }
}

async function loadDeputies() {
  const uf = document.getElementById("stateSelect").value;
  const party = document.getElementById("partySelect").value;
  const name = document.getElementById("nameSearch").value;
  const grid = document.getElementById("deputiesGrid");

  grid.innerHTML =
    '<div class="col-span-full text-center py-10 text-zinc-500"><span class="animate-pulse">Carregando dados de Brasília...</span></div>';

  try {
    let query = `deputados?ordem=ASC&ordenarPor=nome&itens=100`;
    if (uf) query += `&siglaUf=${uf}`;
    if (party) query += `&siglaPartido=${party}`;
    if (name) query += `&nome=${name}`;

    const json = await api.camara(query);
    const deputies = json.dados || [];

    if (deputies.length === 0) {
      grid.innerHTML =
        '<div class="col-span-full text-center py-10 text-zinc-500">Nenhum deputado encontrado.</div>';
      return;
    }

    grid.innerHTML = deputies
      .map(
        (d) => `
            <div onclick="openDeputyDetails(${d.id})" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-violet-500 transition group cursor-pointer">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex-shrink-0">
                    <img src="${d.urlFoto}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="${d.nome}">
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-white truncate text-base">${d.nome}</h3>
                    <p class="text-sm text-violet-400 font-bold">${d.siglaPartido} - ${d.siglaUf}</p>
                    <span class="text-xs text-zinc-500 truncate block mt-1">${d.email || ""}</span>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error(error);
    grid.innerHTML =
      '<div class="col-span-full text-center py-10 text-red-500">Erro ao carregar dados da Câmara. Tente novamente.</div>';
  }
}

async function loadSenators() {
  // Delegado ao módulo rico definido em senadores.php
  if (typeof window.loadSenatorsData === 'function') {
    window.loadSenatorsData();
  }
}

async function openSenatorDetails(codigo) {
  // Delegado ao modal rico definido em senadores.php
  if (typeof window._openSenadorDossie === 'function') {
    window._openSenadorDossie(codigo);
  }
}

async function switchSenatorTab(tab, codigo) {
  const tabs = ["sobre", "comissoes", "votacoes", "cargos"];
  tabs.forEach((t) => {
    const c = document.getElementById(`scontent-${t}`);
    const b = document.getElementById(`stab-${t}`);
    if (c) c.classList.add("hidden");
    if (b)
      b.className =
        "flex-1 py-3 text-center font-bold text-zinc-500 hover:text-white whitespace-nowrap px-4 transition-colors";
  });

  const activeContent = document.getElementById(`scontent-${tab}`);
  const activeBtn = document.getElementById(`stab-${tab}`);
  if (activeContent) activeContent.classList.remove("hidden");
  if (activeBtn)
    activeBtn.className =
      "flex-1 py-3 text-center font-bold text-violet-500 border-b-2 border-violet-500 whitespace-nowrap px-4 transition-colors";

  if (!codigo || activeContent?.getAttribute("data-loaded") === "true") return;

  if (tab === "comissoes") {
    try {
      const r = await api.senado(`senador/${codigo}/comissoes`);
      const membros =
        r?.MembroComissaoParlamentar?.Parlamentar?.MembroComissoes?.Comissao;
      const lista = Array.isArray(membros) ? membros : membros ? [membros] : [];
      if (lista.length === 0) {
        activeContent.innerHTML =
          '<div class="text-zinc-500 text-center py-4">Nenhuma comissão encontrada.</div>';
      } else {
        activeContent.innerHTML =
          `<div class="space-y-2 max-h-96 overflow-y-auto pr-2">` +
          lista
            .map(
              (c) => `
            <div class="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
              <div class="font-bold text-white text-sm">${c.DescricaoComissao || c.SiglaComissao || "Comissão"}</div>
              <div class="flex justify-between items-center mt-1">
                <span class="text-xs text-zinc-400">${c.DescricaoParticipacao || ""}</span>
                <span class="text-[10px] text-zinc-500">${c.DataInicio ? window.formatDate(c.DataInicio) : ""} ${c.DataFim ? "→ " + window.formatDate(c.DataFim) : "→ Atual"}</span>
              </div>
            </div>
          `,
            )
            .join("") +
          `</div>`;
      }
    } catch (e) {
      activeContent.innerHTML =
        '<div class="text-red-500 text-center py-4">Erro ao carregar comissões.</div>';
    }
    activeContent.setAttribute("data-loaded", "true");
  }

  if (tab === "votacoes") {
    try {
      const r = await api.senado(`senador/${codigo}/votacoes`);
      const vots = r?.VotacaoParlamentar?.Parlamentar?.Votacoes?.Votacao;
      const lista = Array.isArray(vots) ? vots : vots ? [vots] : [];
      if (lista.length === 0) {
        activeContent.innerHTML =
          '<div class="text-zinc-500 text-center py-4">Nenhuma votação encontrada.</div>';
      } else {
        let sim = 0,
          nao = 0,
          outros = 0;
        lista.forEach((v) => {
          const voto = (v.SiglaVoto || "").toUpperCase();
          if (voto === "SIM" || voto === "S") sim++;
          else if (voto === "NÃO" || voto === "NAO" || voto === "N") nao++;
          else outros++;
        });
        const total = sim + nao + outros;
        activeContent.innerHTML = `
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="bg-green-900/30 border border-green-700/40 p-3 rounded-xl text-center">
              <div class="text-2xl font-black text-green-400">${sim}</div>
              <div class="text-xs text-zinc-400 mt-1">SIM</div>
            </div>
            <div class="bg-red-900/30 border border-red-700/40 p-3 rounded-xl text-center">
              <div class="text-2xl font-black text-red-400">${nao}</div>
              <div class="text-xs text-zinc-400 mt-1">NÃO</div>
            </div>
            <div class="bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-center">
              <div class="text-2xl font-black text-zinc-400">${outros}</div>
              <div class="text-xs text-zinc-400 mt-1">OUTROS</div>
            </div>
          </div>
          <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
            ${lista
              .slice(0, 50)
              .map((v) => {
                const voto = (v.SiglaVoto || "").toUpperCase();
                let badge = "bg-zinc-700 text-zinc-300";
                if (voto === "SIM" || voto === "S")
                  badge = "bg-green-800 text-green-300";
                else if (voto === "NÃO" || voto === "NAO" || voto === "N")
                  badge = "bg-red-800 text-red-300";
                return `
                <div class="bg-zinc-800 p-3 rounded-lg flex justify-between items-start gap-3 border border-zinc-700">
                  <div class="flex-1 min-w-0">
                    <div class="text-white text-sm font-bold truncate">${v.DescricaoVotacao || v.SessaoPlenaria?.CodigoSessao || "Votação"}</div>
                    <div class="text-xs text-zinc-500 mt-1">${v.SessaoPlenaria?.DataSessao ? window.formatDate(v.SessaoPlenaria.DataSessao) : ""}</div>
                  </div>
                  <span class="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${badge}">${v.SiglaVoto || "ABST"}</span>
                </div>
              `;
              })
              .join("")}
          </div>
        `;
      }
    } catch (e) {
      activeContent.innerHTML =
        '<div class="text-red-500 text-center py-4">Erro ao carregar votações.</div>';
    }
    activeContent.setAttribute("data-loaded", "true");
  }

  if (tab === "cargos") {
    try {
      const r = await api.senado(`senador/${codigo}/cargos`);
      const cargos = r?.CargoParlamentar?.Parlamentar?.Cargos?.Cargo;
      const lista = Array.isArray(cargos) ? cargos : cargos ? [cargos] : [];
      if (lista.length === 0) {
        activeContent.innerHTML =
          '<div class="text-zinc-500 text-center py-4">Nenhum cargo encontrado.</div>';
      } else {
        activeContent.innerHTML =
          `<div class="space-y-2 max-h-96 overflow-y-auto pr-2">` +
          lista
            .map(
              (c) => `
            <div class="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
              <div class="font-bold text-violet-400 text-sm">${c.DescricaoCargo || c.SiglaCargo || "Cargo"}</div>
              <div class="text-xs text-zinc-400">${c.NomeCasaLegislativa || c.DescricaoCasaLegislativa || ""}</div>
              <div class="text-[10px] text-zinc-500 mt-1">${c.DataInicio ? window.formatDate(c.DataInicio) : ""} ${c.DataFim ? "→ " + window.formatDate(c.DataFim) : c.DataInicio ? "→ Atual" : ""}</div>
            </div>
          `,
            )
            .join("") +
          `</div>`;
      }
    } catch (e) {
      activeContent.innerHTML =
        '<div class="text-red-500 text-center py-4">Erro ao carregar cargos.</div>';
    }
    activeContent.setAttribute("data-loaded", "true");
  }
}

async function loadPoliticalNews() {
  const grid = document.getElementById("newsGrid");
  if (grid.children.length > 1) return;

  try {
    const news = await api.news();

    grid.innerHTML = news
      .map(
        (n) => `
            <a href="${
              n.link
            }" target="_blank" class="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-violet-500 transition group">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-bold text-violet-400 uppercase tracking-wider">${
                      n.source
                    }</span>
                    <span class="text-xs text-zinc-500">${window.formatDate(n.date * 1000)}</span>
                </div>
                <h3 class="font-bold text-white text-lg mb-2 group-hover:text-violet-300 transition">${
                  n.title
                }</h3>
                <p class="text-sm text-zinc-400 line-clamp-3">${
                  n.description
                }</p>
                <div class="mt-3 text-xs text-zinc-500 flex items-center gap-1">
                    Ler matéria completa 
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
            </a>
        `,
      )
      .join("");
  } catch (e) {
    grid.innerHTML =
      '<div class="col-span-full text-center py-10 text-red-500">Erro ao carregar notícias.</div>';
  }
}

function setFilterMode(mode) {
  currentFilterMode = mode;

  // Atualizar Input
  const container = document.getElementById("filter-input-container");
  if (!container) return;

  const currentYear = new Date().getFullYear();

  if (mode === "ano") {
    let options = "";
    for (let i = currentYear; i >= 2015; i--) {
      options += `<option value="${i}">${i}</option>`;
    }
    container.innerHTML = `<select id="input-ano" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none">${options}</select>`;
  } else if (mode === "mes") {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    let options = "";
    months.forEach((m, i) => {
      const val = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
      const isSelected = i === new Date().getMonth() ? "selected" : "";
      options += `<option value="${val}" ${isSelected}>${m} ${currentYear}</option>`;
    });
    container.innerHTML = `<select id="input-mes" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none">${options}</select>`;
  } else if (mode === "semana") {
    container.innerHTML =
      '<input type="week" id="input-semana" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none">';
  } else if (mode === "dia") {
    const today = new Date().toISOString().split("T")[0];
    container.innerHTML = `<input type="date" id="input-dia" value="${today}" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none">`;
  }
}

async function loadFederalExpenses(force = false) {
  const container = document.getElementById("federal-expenses-list");
  const chartContainer = document.getElementById("gestaoChartContainer");
  const statusDiv = document.getElementById("federal-expenses-status");

  if (
    !force &&
    container.children.length > 0 &&
    !container.querySelector(".animate-pulse")
  ) {
    return;
  }

  container.innerHTML = "";
  if (statusDiv) statusDiv.innerHTML = `<div class="text-center text-zinc-500 py-4"><span class="animate-pulse">Preparando consulta ao Portal da Transparência...</span></div>`;
  if (chartContainer) chartContainer.classList.add("hidden");

  try {
    let allData = [];
    let isPaymentList = false;

    if (currentFilterMode === "ano") {
        const ano = document.getElementById("input-ano")?.value || new Date().getFullYear() - 1;
        const endpoint = `despesas/por-funcional-programatica?ano=${ano}&pagina=1`;
        if (statusDiv) statusDiv.innerHTML = `<div class="text-center text-zinc-500 py-4"><span class="animate-pulse">Consultando orçamento de ${ano}...</span></div>`;
        const data = await api.portal(endpoint);
        allData = Array.isArray(data) ? data : [];
    } else {
        isPaymentList = true;
        const datesToFetch = [];
        let dateLabel = "";

        if (currentFilterMode === "dia") {
            const dia = document.getElementById("input-dia")?.value;
            if (!dia) throw new Error("Selecione um dia");
            datesToFetch.push(dia.split('-').reverse().join('/'));
            dateLabel = datesToFetch[0];
        } else if (currentFilterMode === "mes") {
            const mes = document.getElementById("input-mes")?.value;
            if (!mes) throw new Error("Selecione um mês");
            const [y, m] = mes.split('-');
            const lastDay = new Date(y, m, 0).getDate();
            dateLabel = `${m}/${y}`;
            for (let i = 1; i <= lastDay; i++) {
                datesToFetch.push(`${String(i).padStart(2,'0')}/${m}/${y}`);
            }
        } else if (currentFilterMode === "semana") {
             const semana = document.getElementById("input-semana")?.value;
             if (!semana) throw new Error("Selecione uma semana");
             const [y, w] = semana.split('-W');
             const d = new Date(y, 0, 1 + (w - 1) * 7);
             d.setDate(d.getDate() + (1 - (d.getDay() || 7)));
             dateLabel = `Semana ${w} de ${y}`;
             for(let i=0; i<7; i++){
                const currentDay = new Date(d);
                currentDay.setDate(d.getDate() + i);
                datesToFetch.push(`${String(currentDay.getDate()).padStart(2, '0')}/${String(currentDay.getMonth() + 1).padStart(2, '0')}/${currentDay.getFullYear()}`);
             }
        }
        
        const promises = datesToFetch.map((date, index) => {
            if (statusDiv) {
                const percentage = Math.round(((index + 1) / datesToFetch.length) * 100);
                statusDiv.innerHTML = `<div class="text-center text-zinc-500 py-4 animate-pulse">Consultando ${dateLabel}: dia ${index + 1} de ${datesToFetch.length} (${percentage}%)...</div>`;
            }
            const endpoint = `despesas/documentos?dataEmissao=${date}&fase=3&pagina=1`;
            return api.portal(endpoint);
        });

        const results = await Promise.allSettled(promises);
        
        const errors = [];
        results.forEach(res => {
            if (res.status === 'fulfilled') {
                const data = res.value;
                if (Array.isArray(data)) {
                    allData.push(...data);
                } else if (data && (data.erro || data.message)) {
                    errors.push(data.erro || data.message);
                }
            } else {
                errors.push(res.reason.message || 'Erro de rede');
            }
        });
        
        if (errors.length > 0) {
            container.innerHTML = `<div class="text-center text-yellow-400 bg-yellow-950/30 border border-yellow-800 p-3 rounded-lg text-sm mb-4">⚠️ Algumas consultas falharam. Os dados podem estar incompletos. <br><span class="text-xs text-yellow-600">Erro: ${errors[0]}</span></div>`;
        }
    }
    
    if (statusDiv) statusDiv.innerHTML = "";

    if (allData.length === 0) {
      container.innerHTML += '<div class="text-center text-zinc-500 py-10">Nenhum dado encontrado para o período.</div>';
      if (gestaoChartInstance) gestaoChartInstance.destroy();
      return;
    }
    
    renderGestaoChart(allData, currentFilterMode);

    if (isPaymentList) {
      allData.sort((a,b) => window.parsePtBrFloat(b.valor) - window.parsePtBrFloat(a.valor));
      container.innerHTML += allData
        .map(
          (item) => `
        <div class="bg-zinc-800 p-4 rounded-xl flex justify-between items-center border border-zinc-700 hover:border-violet-500 transition">
            <div class="flex-1 min-w-0 pr-4">
                <div class="font-bold text-white text-sm truncate">${item.favorecido?.nome || "Sem Favorecido"}</div>
                <div class="text-xs text-zinc-500 truncate">${item.orgaoPagador?.nome || "Órgão Desconhecido"}</div>
                <div class="text-[10px] text-zinc-600">${item.dataEmissao || ""} - ${item.documentoResumido?.descricao || 'Pagamento'}</div>
            </div>
            <div class="text-right whitespace-nowrap">
                <div class="text-green-400 font-bold text-sm">${window.formatCurrency(window.parsePtBrFloat(item.valor || "0"))}</div>
            </div>
        </div>
      `,
        )
        .join("");
    } else {
      container.innerHTML += allData
        .map((item) => {
          const nome = item.funcao?.descricao || item.nomeFuncao || item.funcao || "—";
          const codigoFuncao = item.funcao?.codigo || item.codigoFuncao;
          const vPago = window.parsePtBrFloat(item.pago || "0");
          const vEmpenhado = window.parsePtBrFloat(item.empenhado || "0");
          const vLiquidado = window.parsePtBrFloat(item.liquidado || "0");

          return `
        <div class="bg-zinc-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center border border-zinc-700 hover:border-violet-500 transition gap-4">
            <div class="flex-1 min-w-0">
                <div class="font-bold text-white text-sm truncate" title="${nome}">${nome}</div>
                <div class="text-xs text-zinc-500">Função ${codigoFuncao}</div>
            </div>
            <div class="flex gap-6 text-right">
                <div class="hidden md:block">
                    <div class="text-[10px] text-zinc-500 uppercase">Empenhado</div>
                    <div class="text-zinc-300 font-bold text-xs">${window.formatCurrency(vEmpenhado)}</div>
                </div>
                <div class="hidden md:block">
                    <div class="text-[10px] text-zinc-500 uppercase">Liquidado</div>
                    <div class="text-blue-400 font-bold text-xs">${window.formatCurrency(vLiquidado)}</div>
                </div>
                <div>
                    <div class="text-[10px] text-zinc-500 uppercase">Pago</div>
                    <div class="text-green-400 font-bold text-sm">${window.formatCurrency(vPago)}</div>
                </div>
            </div>
        </div>
      `;
        })
        .join("");
    }
  } catch (e) {
    console.error(e);
    if(statusDiv) statusDiv.innerHTML = '';
    container.innerHTML = `<div class="text-center text-red-500 py-4">Erro Crítico: ${e.message}. Verifique o console.</div>`;
  }
}

function renderGestaoChart(data, mode) {
  const ctx = document.getElementById("gestaoChart").getContext("2d");
  const container = document.getElementById("gestaoChartContainer");
  const title = document.getElementById("gestaoChartTitle");

  if (gestaoChartInstance) gestaoChartInstance.destroy();
  container.classList.remove("hidden");

  let labels = [];
  let values = [];
  let label = "Valor (R$)";
  let type = "bar";

  if (mode === "ano") {
    // Agrupa por funcao (por-funcional-programatica retorna uma linha por acao)
    // funcao pode ser string ou objeto {codigo, descricao} dependendo da versão da API
    const byFuncao = {};
    data.forEach((d) => {
      const nome = d.funcao?.descricao || d.nomeFuncao || d.funcao || d.descricaoOrgao || d.orgao || d.nome || "—";
      if (!byFuncao[nome]) byFuncao[nome] = 0;
      byFuncao[nome] += window.parsePtBrFloat(
        d.pago || d.valorPago || d.valor || "0",
      );
    });
    const sorted = Object.entries(byFuncao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    labels = sorted.map(([nome]) =>
      nome.length > 22 ? nome.substring(0, 22) + "…" : nome,
    );
    values = sorted.map(([, val]) => val);
    label = "Orçamento Executado — Top 10 Funções";
    title.textContent = "🏆 Maiores Orçamentos por Área de Governo";
  } else {
    // Evolução Diária (Linha)
    const daily = {};
    data.forEach((d) => {
      const date = d.dataEmissao || d.dataPagamento || ""; // DD/MM/YYYY
      if (!date) return;
      if (!daily[date]) daily[date] = 0;
      daily[date] += window.parsePtBrFloat(d.valor || d.valorDocumento || d.valorPago || "0");
    });

    // Ordenar por data
    labels = Object.keys(daily).sort((a, b) => {
      const [da, ma, ya] = a.split("/");
      const [db, mb, yb] = b.split("/");
      return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });
    values = labels.map((k) => daily[k]);
    type = "line";
    title.textContent = "📅 Evolução de Pagamentos no Período";
  }

  gestaoChartInstance = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: values,
          backgroundColor:
            type === "bar" ? "#8b5cf6" : "rgba(139, 92, 246, 0.1)",
          borderColor: "#8b5cf6",
          borderWidth: 2,
          fill: type === "line",
          tension: 0.4,
          pointRadius: type === "line" ? 3 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: type === "bar" ? "y" : "x",
      scales: {
        x: {
          grid: { color: "#27272a" },
          ticks: { color: "#a1a1aa", font: { size: 10 } },
        },
        y: {
          grid: { color: "#27272a" },
          ticks: { color: "#a1a1aa", font: { size: 10 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return window.formatCurrency(context.raw);
            },
          },
        },
      },
    },
  });
}

function toggleGestaoMode(mode) {
  const inactive =
    "px-4 py-1.5 text-sm font-bold rounded-md text-zinc-400 hover:text-white transition";
  const active =
    "px-4 py-1.5 text-sm font-bold rounded-md bg-violet-600 text-white shadow transition";
  const modes = ["orcamento", "cartoes", "contratos"];
  modes.forEach((m) => {
    const btn = document.getElementById(`btn-gestao-${m}`);
    const view = document.getElementById(`view-gestao-${m}`);
    if (btn) btn.className = m === mode ? active : inactive;
    if (view) view.classList.toggle("hidden", m !== mode);
  });
}

let contratosData = [];

async function searchContratos() {
  const termo = document.getElementById("contratos-search")?.value?.trim() || "";
  const cnpj = document.getElementById("contratos-cnpj")?.value?.replace(/[^\d]/g, "") || "";
  const dataInicial = document.getElementById("contratos-data-ini")?.value || "";
  const dataFinal = document.getElementById("contratos-data-fim")?.value || "";
  const container = document.getElementById("contratos-results");
  const statsBar = document.getElementById("contratos-stats");

  if (!termo && !cnpj && !dataInicial && !dataFinal) {
    container.innerHTML = '<div class="text-center text-amber-400 py-10 px-4">⚠️ Informe ao menos um filtro para a busca.</div>';
    return;
  }

  container.innerHTML = '<div class="text-center text-zinc-500 py-10 animate-pulse">Consultando contratos federais...</div>';
  if (statsBar) statsBar.classList.add("hidden");

  try {
    let endpoint = "";
    
    // Prioridade para busca por CNPJ, que usa um endpoint diferente.
    if (cnpj) {
        endpoint = `contratos/cpf-cnpj?cpfCnpjFornecedor=${cnpj}&pagina=1`;
        if (termo || dataInicial || dataFinal) {
            console.warn("Busca por CNPJ priorizada. Outros filtros (termo, datas) serão ignorados pois não são suportados por este endpoint específico.");
        }
    } else {
        // Endpoint geral 'contratos' exige codigoOrgao ou um período de data para buscas com termo.
        if (termo && !dataInicial && !dataFinal) {
             container.innerHTML = '<div class="text-center text-amber-400 py-10 px-4">⚠️ Ao buscar por um termo, por favor, especifique também um período (data inicial e final).</div>';
             return;
        }
        endpoint = "contratos?pagina=1";
        if (dataInicial) {
            const [y, m, d] = dataInicial.split("-");
            endpoint += `&dataInicial=${d}/${m}/${y}`;
        }
        if (dataFinal) {
            const [y, m, d] = dataFinal.split("-");
            endpoint += `&dataFinal=${d}/${m}/${y}`;
        }
        if (termo) endpoint += `&termo=${encodeURIComponent(termo)}`;
    }

    const data = await api.portal(endpoint);

    // Verificar erros da API antes de tentar iterar
    if (data && (data.erro || data.message)) {
      container.innerHTML = `<div class="text-center text-red-400 py-10 px-4">⚠️ Erro retornado pelo Portal da Transparência:<br><span class="text-zinc-400 text-xs mt-1 block">${data.erro || data.message}</span></div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum contrato encontrado para os filtros informados.</div>';
      if (statsBar) statsBar.classList.add("hidden");
      return;
    }

    contratosData = data;

    const totalValue = data.reduce(
      (acc, c) => acc + window.parsePtBrFloat(c.valorInicialCompra || c.valorGlobal || "0"),
      0,
    );

    if (statsBar) {
      statsBar.innerHTML = `
                <div class="flex flex-wrap gap-4 text-sm items-center">
                    <span class="text-zinc-400">📋 <strong class="text-white">${data.length}</strong> contratos encontrados</span>
                    <span class="text-zinc-400">💰 Total: <strong class="text-green-400">${window.formatCurrency(totalValue)}</strong></span>
                    <button onclick="exportContratosCSV()" class="ml-auto text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded transition font-bold">📥 Exportar CSV</button>
                </div>
            `;
      statsBar.classList.remove("hidden");
    }

    container.innerHTML = data
      .map((c) => {
        const valor = window.parsePtBrFloat(c.valorInicialCompra || c.valorGlobal || "0");
        const fornNome = c.fornecedor?.nome || "Fornecedor não informado";
        const fornCnpj = c.fornecedor?.cnpj || "";
        const orgao = c.unidadeGestora?.orgaoVinculado?.nome || c.unidadeGestora?.nome || "Órgão não informado";
        const modalidade = c.modalidadeCompra?.descricao || "";
        const dataAss = c.dataAssinatura || c.vigencia?.ini || "";
        const dataFim = c.vigencia?.fim || "";
        const isCnpjValid = fornCnpj && fornCnpj.replace(/[^\d]/g, "").length === 14;
        const objeto = c.objeto || "Objeto não informado";
        return `
                <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-violet-500/50 transition">
                    <div class="flex flex-col md:flex-row justify-between gap-3">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start gap-2 mb-1 flex-wrap">
                                ${modalidade ? `<span class="text-[10px] font-bold text-violet-400 border border-violet-500/40 px-2 py-0.5 rounded-full">${modalidade}</span>` : ""}
                                ${dataAss ? `<span class="text-[10px] text-zinc-500 font-mono">${window.formatDate(dataAss)}</span>` : ""}
                                ${dataFim ? `<span class="text-[10px] text-zinc-500">→ ${window.formatDate(dataFim)}</span>` : ""}
                            </div>
                            <div class="font-bold text-white text-sm mb-1">${objeto}</div>
                            <div class="text-xs text-zinc-400">🏛️ ${orgao}</div>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-xs text-zinc-300 font-bold truncate">${fornNome}</span>
                                ${isCnpjValid ? `<button onclick="openCompanyDetails('${fornCnpj}')" class="text-[10px] bg-violet-700 hover:bg-violet-600 text-white px-2 py-0.5 rounded transition whitespace-nowrap flex-shrink-0">🔍 Investigar</button>` : ""}
                            </div>
                            ${fornCnpj ? `<div class="text-[10px] text-zinc-500 font-mono">${fornCnpj}</div>` : ""}
                        </div>
                        <div class="text-right flex-shrink-0">
                            <div class="text-green-400 font-bold text-lg">${window.formatCurrency(valor)}</div>
                            <div class="text-[10px] text-zinc-500">Valor Inicial</div>
                            ${c.numeroContratoEmpenho ? `<div class="text-[10px] text-zinc-600 mt-1">Nº ${c.numeroContratoEmpenho}</div>` : ""}
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-10">Erro ao consultar contratos. Verifique os filtros.</div>';
  }
}

function exportContratosCSV() {
  if (!contratosData.length) return;
  let csv =
    "Número,Objeto,Fornecedor,CNPJ,Órgão,Modalidade,Valor Inicial,Data Assinatura,Vigência Fim\n";
  contratosData.forEach((c) => {
    const row = [
      c.numeroContratoEmpenho || "",
      (c.objeto || c.descricaoObjeto || "").replace(/,/g, " "),
      (c.fornecedor?.nome || c.nomeRazaoSocialFornecedor || "").replace(
        /,/g,
        " ",
      ),
      c.fornecedor?.cnpj || c.cnpjFornecedor || "",
      (c.orgaoSuperior?.nome || "").replace(/,/g, " "),
      (c.modalidade?.descricao || "").replace(/,/g, " "),
      window.parsePtBrFloat(c.valorInicialCompra || c.valorInicial || c.valorGlobal || "0")
        .toFixed(2)
        .replace(".", ","),
      c.dataAssinatura || "",
      c.vigenciaFim || "",
    ];
    csv += row.join(",") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contratos_federais_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function loadPaymentCards(page = 1) {
  currentCardPage = page;
  const start = document.getElementById("card-month-start").value; // YYYY-MM
  const end = document.getElementById("card-month-end").value; // YYYY-MM
  const container = document.getElementById("cards-results-list");
  const pagination = document.getElementById("cards-pagination");

  if (!start || !end) {
    alert("Selecione o período.");
    return;
  }

  // Format to MM/YYYY
  const [y1, m1] = start.split("-");
  const [y2, m2] = end.split("-");
  const fmtStart = `${m1}/${y1}`;
  const fmtEnd = `${m2}/${y2}`;

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Consultando gastos com cartões...</div>';
  pagination.classList.add("hidden");

  try {
    const endpoint = `cartoes?mesExtratoInicio=${fmtStart}&mesExtratoFim=${fmtEnd}&pagina=${page}`;
    const data = await api.portal(endpoint);

    if (!data || data.erro || data.message) {
      container.innerHTML = `<div class="text-center text-red-400 py-10 px-4">⚠️ Erro ao consultar cartões:<br><span class="text-zinc-400 text-xs mt-1 block">${data?.erro || data?.message || "Resposta inválida"}</span></div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum registro encontrado para o período selecionado.</div>';
      return;
    }

    container.innerHTML = data
      .map((c) => {
        // Portal retorna valores como strings PT-BR — usar parsePtBrFloat
        const valor = window.parsePtBrFloat(c.valorTransacao || c.valor || "0");
        const portador =
          c.portador?.nome || c.nomePortador || "Sigiloso/Não Identificado";
        const orgao =
          c.unidadeGestora?.orgaoVinculado?.nome ||
          c.unidadeGestora?.nome ||
          c.nomeOrgao ||
          "Órgão não informado";
        const favorecido =
          c.estabelecimento?.nome || c.nomeFornecedor || "Diversos";
        const dataTransacao = c.dataTransacao || c.mesExtrato || "";

        return `
                <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-violet-500 transition flex flex-col md:flex-row justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-bold bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded uppercase">${c.tipoCartao?.descricao || "CPGF"}</span>
                            <span class="text-xs text-zinc-500">${dataTransacao}</span>
                        </div>
                        <h4 class="text-white font-bold text-sm truncate" title="${portador}">${portador}</h4>
                        <p class="text-zinc-400 text-xs truncate">${orgao}</p>
                        <div class="mt-2 text-xs text-zinc-300">
                            <span class="text-zinc-500">Favorecido:</span> ${favorecido}
                        </div>
                    </div>
                    <div class="text-right flex flex-col justify-center">
                        <div class="text-red-400 font-bold text-sm">${window.formatCurrency(valor)}</div>
                    </div>
                </div>
            `;
      })
      .join("");

    document.getElementById("card-page-num").textContent = `Página ${page}`;
    pagination.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao carregar dados.</div>';
  }
}

function changeCardPage(delta) {
  const newPage = currentCardPage + delta;
  if (newPage < 1) return;
  loadPaymentCards(newPage);
}

function loadYearsOptions() {
  const currentYear = new Date().getFullYear();
  const opts = [];
  for (let i = currentYear; i >= 2015; i--) {
    opts.push(`<option value="${i}">${i}</option>`);
  }
  const html = opts.join("");

  const selTransf = document.getElementById("sel-transf-year");
  if (selTransf && selTransf.children.length === 0) selTransf.innerHTML = html;

  const selEmenda = document.getElementById("sel-emenda-year");
  if (selEmenda && selEmenda.children.length === 0) selEmenda.innerHTML = html;
}

async function loadMunicipalities(uf) {
  const citySelect = document.getElementById("sel-transf-city");
  citySelect.innerHTML = '<option value="">Carregando...</option>';
  citySelect.disabled = true;

  if (!uf) {
    citySelect.innerHTML = '<option value="">Selecione o Estado...</option>';
    return;
  }

  try {
    // Usando BrasilAPI para listar cidades (mais rápido e economiza cota da chave oficial)
    const cities = await api.brasilApi(`ibge/municipios/v1/${uf}`);

    citySelect.innerHTML = '<option value="">Todas as cidades</option>';
    cities.forEach((c) => {
      const opt = document.createElement("option");
      // O Portal da Transparência usa código IBGE (6 ou 7 dígitos). BrasilAPI retorna 7.
      // Vamos guardar o código IBGE no value
      opt.value = c.codigo_ibge;
      opt.textContent = c.nome;
      citySelect.appendChild(opt);
    });
    citySelect.disabled = false;
  } catch (e) {
    console.error(e);
    citySelect.innerHTML = '<option value="">Erro ao carregar</option>';
    citySelect.disabled = false;
  }
}

async function loadFederalTransfers(page = 1) {
  currentTransfPage = page;
  const uf = document.getElementById("sel-transf-uf").value;
  const ibge = document.getElementById("sel-transf-city").value;
  const year = document.getElementById("sel-transf-year").value;
  const type = document.getElementById("sel-transf-type").value;
  const container = document.getElementById("transfers-results");
  const listContainer = document.getElementById("transf-list-container");
  const summaryContainer = document.getElementById("transf-summary");
  const chartsContainer = document.getElementById("transf-charts-area");

  if (!uf) {
    alert("Selecione pelo menos o Estado.");
    return;
  }

  // Mostrar containers e loading
  listContainer.classList.remove("hidden");
  summaryContainer.classList.remove("hidden");
  chartsContainer.classList.remove("hidden");

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Consultando Portal da Transparência...</div>';

  try {
    let endpoint = "";

    if (ibge) {
      // MUNICÍPIO SELECIONADO: Usa Convênios filtrados por código IBGE
      endpoint = `convenios?codigoIBGE=${ibge}&dataVigenciaInicial=01/01/${year}&dataVigenciaFinal=31/12/${year}&pagina=${page}&tamanhoPagina=50`;
    } else {
      // APENAS ESTADO (UF): Usa Convênios para evitar erro de "Muitos Dados"
      endpoint = `convenios?uf=${uf}&dataVigenciaInicial=01/01/${year}&dataVigenciaFinal=31/12/${year}&pagina=${page}&tamanhoPagina=50`;
    }

    const data = await api.portal(endpoint);

    if (data.erro || data.message) {
      let msg = data.erro || data.message;
      if (msg.includes("403"))
        msg =
          "A consulta retornou muitos dados. Por favor, filtre por Município.";
      container.innerHTML = `<div class="text-center text-red-500 py-10">${msg}</div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhuma transferência encontrada.</div>';
      return;
    }

    currentTransfData = data;
    renderTransferDashboard(data);
    document.getElementById("transf-page-info").textContent = `Página ${page}`;
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro na consulta. Verifique sua chave ou tente novamente.</div>';
  }
}

function renderTransferDashboard(data) {
  const container = document.getElementById("transfers-results");

  // 1. Calcular Totais (Baseado na página atual)
  let total = 0;
  let legal = 0;
  let voluntaria = 0;
  const monthlyData = {};
  const cityRanking = {};

  // SORTING: Newest to Oldest
  data.sort((a, b) => {
    const dateA =
      a.dataAssinatura ||
      a.dataPublicacao ||
      a.dataInicioVigencia ||
      a.mesAno ||
      "00/00/0000";
    const dateB =
      b.dataAssinatura ||
      b.dataPublicacao ||
      b.dataInicioVigencia ||
      b.mesAno ||
      "00/00/0000";
    const [dA, mA, yA] = dateA.split("/");
    const [dB, mB, yB] = dateB.split("/");
    return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
  });

  data.forEach((t) => {
    // Normalização de dados (Convênios vs Transferências/Recursos)
    // Convênios usam 'valorGlobal', Transferências usam 'valorTotal' ou 'valor'
    const val = window.parsePtBrFloat(t.valorTotal || t.valorGlobal || t.valor);
    total += val;

    // Identificar tipo
    const isLegal = t.tipoTransferencia?.id === 1 || t.tipoRecurso; // Recursos geralmente são legais

    if (isLegal) legal += val;
    else voluntaria += val;

    // Agrupar por Mês
    // Convênios usam dataInicioVigencia
    const dateRaw =
      t.dataAssinatura ||
      t.dataPublicacao ||
      t.dataInicioVigencia ||
      t.mesAno ||
      "";
    // A API /transferencias retorna dataAssinatura para convênios, mas para legais pode variar.
    // Vamos tentar extrair o mês.
    // Se não tiver data, usamos "Geral"
    const dateStr = t.dataAssinatura || t.dataPublicacao || "";
    let monthKey = "Geral";
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) monthKey = `${parts[1]}/${parts[2]}`;
    }
    if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
    monthlyData[monthKey] += val;

    // Ranking Municípios
    let city = "Estado/Outros";
    if (t.municipio) {
      city = t.municipio.nomeIBGE;
    } else if (t.convenente) {
      // Tenta extrair cidade do nome do convenente ou usa o próprio nome
      city = t.convenente.nome;
    } else if (t.uf) {
      city = t.uf.sigla + " (Governo)";
    }

    if (!cityRanking[city]) cityRanking[city] = 0;
    cityRanking[city] += val;
  });

  // Atualizar Cards
  document.getElementById("summary-total").textContent =
    window.formatCurrency(total);
  document.getElementById("summary-legal").textContent =
    window.formatCurrency(legal);
  document.getElementById("summary-voluntaria").textContent =
    window.formatCurrency(voluntaria);

  // 2. Renderizar Lista
  container.innerHTML = data
    .map((t) => {
      // Normalização para exibição
      const isConvenio = !!t.numero; // Se tem número de convênio
      const tipoNome = isConvenio
        ? `Convênio ${t.numero}`
        : t.tipoTransferencia?.nome || t.tipoRecurso || "Transferência";
      const tipoClass =
        t.tipoTransferencia?.id === 1 || t.tipoRecurso
          ? "text-blue-400"
          : "text-purple-400";

      const dataExibicao =
        t.dataAssinatura || t.dataInicioVigencia || t.mesAno || "-";

      const nomePrincipal = t.municipio
        ? t.municipio.nomeIBGE
        : t.convenente
          ? t.convenente.nome
          : "Governo do Estado";

      const descricao =
        t.objeto ||
        (t.programa
          ? t.programa.nome
          : t.favorecido
            ? t.favorecido.nome
            : "Sem descrição");

      const valor = window.parsePtBrFloat(
        t.valorTotal || t.valorGlobal || t.valor,
      );
      const orgao = t.orgaoSuperior
        ? t.orgaoSuperior.nome
        : t.concedente
          ? t.concedente.nome
          : "";

      const programa = t.programa
        ? `<div class="text-xs text-zinc-500 mt-1">Programa: ${t.programa.nome}</div>`
        : "";
      const situacao = t.situacao
        ? `<span class="text-[10px] bg-zinc-700 px-2 py-0.5 rounded text-zinc-300 ml-2">${t.situacao}</span>`
        : "";

      // Botão de Documentos (Apenas para Convênios)
      let docBtn = "";
      if (isConvenio && t.id) {
        docBtn = `<button onclick="loadConvenioDocuments(${t.id})" class="mt-2 bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] py-1 px-2 rounded transition flex items-center justify-end gap-1 ml-auto">📄 Documentos</button>`;
      }

      return `
        <div class="p-4 hover:bg-zinc-800/50 transition flex flex-col md:flex-row justify-between gap-4">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold ${tipoClass} uppercase tracking-wider border border-zinc-700 px-1 rounded">
                        ${tipoNome}
                    </span>
                    <span class="text-xs text-zinc-500">${dataExibicao}</span>
                    ${situacao}
                </div>
                <h4 class="text-white font-bold text-sm truncate pr-4">${nomePrincipal}</h4>
                <p class="text-zinc-400 text-xs mt-1 line-clamp-2">${descricao}</p>
                ${programa}
            </div>
            <div class="text-right">
                <div class="text-green-400 font-bold text-sm">${window.formatCurrency(valor)}</div>
                <div class="text-[10px] text-zinc-500 mt-1 truncate max-w-[150px] ml-auto">${orgao}</div>
                ${docBtn}
            </div>
        </div>
    `;
    })
    .join("");

  // 3. Renderizar Gráficos
  updateTransferCharts(monthlyData, cityRanking);
}

function updateTransferCharts(monthlyData, cityRanking) {
  const ctx1 = document.getElementById("transfEvolutionChart").getContext("2d");
  const ctx2 = document.getElementById("transfRankingChart").getContext("2d");

  if (transfChart1) transfChart1.destroy();
  if (transfChart2) transfChart2.destroy();

  // Gráfico Evolução
  transfChart1 = new Chart(ctx1, {
    type: "line",
    data: {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: "Valor Recebido (R$)",
          data: Object.values(monthlyData),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#a1a1aa" } },
        y: { grid: { color: "#27272a" }, ticks: { color: "#a1a1aa" } },
      },
    },
  });

  // Gráfico Ranking
  const sortedCities = Object.entries(cityRanking)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  transfChart2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: sortedCities.map((c) => c[0]),
      datasets: [
        {
          label: "Total (R$)",
          data: sortedCities.map((c) => c[1]),
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

function changeTransfPage(delta) {
  const newPage = currentTransfPage + delta;
  if (newPage < 1) return;
  loadFederalTransfers(newPage);
}

function exportTransferCSV() {
  if (!currentTransfData || currentTransfData.length === 0) {
    alert("Sem dados para exportar.");
    return;
  }
  let csv = "Data,UF,Municipio,Tipo,Programa,Favorecido,Valor\n";
  currentTransfData.forEach((t) => {
    const data = t.dataAssinatura || "";
    const uf = t.uf.sigla;
    const muni = t.municipio ? t.municipio.nomeIBGE : "Estado";
    const tipo = t.tipoTransferencia.nome;
    const prog = t.programa ? t.programa.nome.replace(/,/g, " ") : "";
    const fav = t.favorecido ? t.favorecido.nome.replace(/,/g, " ") : "";
    const val = window
      .parsePtBrFloat(t.valorTotal)
      .toFixed(2)
      .replace(".", ",");
    csv += `${data},${uf},${muni},${tipo},${prog},${fav},"${val}"\n`;
  });

  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  link.download = "transferencias_federais.csv";
  link.click();
}

// Alias para manter compatibilidade com o botão antigo se necessário, mas o HTML foi atualizado para chamar loadFederalTransfers
const searchTransfers = () => loadFederalTransfers(1);

async function searchGeneralAmendments() {
  const year = document.getElementById("sel-emenda-year").value;
  const author = document.getElementById("inp-emenda-author").value;
  const type = document.getElementById("sel-emenda-type").value;
  const funcao = document.getElementById("sel-emenda-funcao")?.value || "";
  const container = document.getElementById("amendments-results");

  container.classList.remove("hidden");
  container.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Buscando emendas parlamentares...</div>';

  try {
    let endpoint = `emendas?ano=${year}&pagina=1`;
    if (author) endpoint += `&nomeAutor=${encodeURIComponent(author)}`;
    if (type) endpoint += `&tipoEmenda=${encodeURIComponent(type)}`;
    if (funcao) endpoint += `&codigoFuncao=${encodeURIComponent(funcao)}`;

    const data = await api.portal(endpoint);

    if (data.erro || data.message) {
      container.innerHTML = `<div class="text-center text-red-500 py-4">Erro na API: ${
        data.erro || data.message
      }</div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-4">Nenhuma emenda encontrada com esses filtros.</div>';
      return;
    }

    container.innerHTML = data
      .map((e) => {
        const vEmpenhado = window.parsePtBrFloat(e.valorEmpenhado);
        const vLiquidado = window.parsePtBrFloat(e.valorLiquidado);
        const vPago = window.parsePtBrFloat(e.valorPago);
        const vResto = window.parsePtBrFloat(e.valorRestoInscrito); // Campo correto conforme JSON

        const pLiquidado = vEmpenhado > 0 ? (vLiquidado / vEmpenhado) * 100 : 0;
        const pPago = vEmpenhado > 0 ? (vPago / vEmpenhado) * 100 : 0;

        return `
            <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-green-500 transition">
                <div class="flex justify-between items-start mb-2">
                    <span class="bg-green-600/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Emenda ${
                      e.codigoEmenda
                    }</span>
                    <span class="text-white font-bold text-sm">${window.formatCurrency(vEmpenhado)}</span>
                </div>
                <h4 class="text-white font-bold text-sm mb-1">${
                  e.nomeAutor || e.autor
                }</h4>
                <p class="text-zinc-400 text-xs mb-2">${
                  e.localidadeDoGasto || "Localidade Nacional"
                }</p>
                <div class="flex gap-2 mb-3">
                    <span class="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-1 rounded">${
                      e.funcao
                    }</span>
                    <span class="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-1 rounded">${
                      e.subfuncao
                    }</span>
                </div>
                
                <div class="space-y-2 mb-3">
                    <div>
                        <div class="flex justify-between text-[10px] text-zinc-400 mb-1">
                            <span>Liquidado (${Math.round(pLiquidado)}%)</span>
                            <span class="text-white">${window.formatCurrency(vLiquidado)}</span>
                        </div>
                        <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full" style="width: ${Math.min(100, pLiquidado)}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-[10px] text-zinc-400 mb-1">
                            <span>Pago (${Math.round(pPago)}%)</span>
                            <span class="text-green-400">${window.formatCurrency(vPago)}</span>
                        </div>
                        <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-green-500 h-full" style="width: ${Math.min(100, pPago)}%"></div>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 mt-3">
                    <button onclick="loadAmendmentDocuments('${e.codigoEmenda}')"
                        class="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs py-2 rounded-lg transition flex items-center justify-center gap-1">
                        📄 Documentos
                    </button>
                    <button onclick="switchTab('radar');initRadarTab();showRadarSubTab('sancoes');document.getElementById('radarNome').value='${(e.nomeAutor || e.autor || "").replace(/'/g, "")}';runRadarScan();"
                        class="flex-1 bg-red-900/40 hover:bg-red-800/50 text-red-400 text-xs py-2 rounded-lg transition flex items-center justify-center gap-1 border border-red-900/50">
                        🔍 Investigar Autor
                    </button>
                </div>
            </div>
        `;
      })
      .join("");
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao buscar emendas.</div>';
  }
}

async function loadAmendmentDocuments(codigoEmenda) {
  const modal = document.getElementById("documentsModal");
  const content = document.getElementById("documentsContent");

  modal.classList.remove("hidden");
  content.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Buscando documentos...</div>';

  try {
    // Endpoint: /emendas/documentos/{codigoEmenda}
    const endpoint = `emendas/documentos/${codigoEmenda}?pagina=1`;

    const data = await api.portal(endpoint);

    if (!Array.isArray(data) || data.length === 0) {
      content.innerHTML =
        '<div class="text-center text-zinc-500 py-4">Nenhum documento encontrado para esta emenda.</div>';
      return;
    }

    content.innerHTML = data
      .map(
        (d) => `
        <div class="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
            <div class="flex justify-between items-start">
                <span class="text-violet-400 font-bold text-xs uppercase" title="${d.especieTipo || ""}">${
                  d.fase || "Documento"
                }</span>
                <span class="text-zinc-500 text-xs">${d.data || "-"}</span>
            </div>
            <div class="text-white font-bold text-sm mt-1">${
              d.codigoDocumento || d.codigoDocumentoResumido || "Sem código"
            }</div>
            <div class="text-zinc-400 text-xs mt-1 truncate">${
              d.especieTipo || "Sem descrição"
            }</div>
        </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error(e);
    content.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao carregar documentos.</div>';
  }
}

async function loadConvenioDocuments(id) {
  const modal = document.getElementById("documentsModal");
  const content = document.getElementById("documentsContent");

  modal.classList.remove("hidden");
  content.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Buscando documentos do convênio...</div>';

  try {
    const endpoint = `convenios/documentos?id=${id}&pagina=1`;
    const data = await api.portal(endpoint);

    if (!Array.isArray(data) || data.length === 0) {
      content.innerHTML =
        '<div class="text-center text-zinc-500 py-4">Nenhum documento encontrado.</div>';
      return;
    }

    content.innerHTML = data
      .map(
        (d) => `
        <div class="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
            <div class="flex justify-between items-start">
                <span class="text-violet-400 font-bold text-xs uppercase">${
                  d.tipoDocumento || "Documento"
                }</span>
                <span class="text-zinc-500 text-xs">${d.data || "-"}</span>
            </div>
            <div class="text-white font-bold text-sm mt-1">${window.formatCurrency(d.valor)}</div>
            <div class="text-zinc-400 text-xs mt-1">${
              d.observacao || "Sem observação"
            }</div>
        </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error(e);
    content.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao carregar documentos.</div>';
  }
}

async function analyzeSupplier() {
  const cnpjInput = document
    .getElementById("supplierCnpj")
    .value.replace(/[^\d]/g, "");
  const container = document.getElementById("supplierResult");

  if (cnpjInput.length !== 14) {
    alert("Por favor, digite um CNPJ válido com 14 dígitos.");
    return;
  }

  container.classList.remove("hidden");
  container.innerHTML = `<div class="flex flex-col items-center py-10 gap-3">
        <div class="w-12 h-12 border-4 border-violet-600/40 border-t-violet-500 rounded-full animate-spin"></div>
        <span class="text-zinc-400 text-sm animate-pulse">Cruzando 9 bases de dados do Governo Federal...</span>
        <span class="text-zinc-600 text-xs text-center">pessoa-jurídica · CEIS · CNEP · CEPIM · leniência · notas-fiscais · contratos · despesas</span>
    </div>`;

  const currentYear = new Date().getFullYear();

  try {
    // Todas as requisições em paralelo
    const [
      dataInfo,
      dataMoney,
      dataDocs,
      dataLeniencia,
      dataRenuncia,
      dataNfe,
      dataContratos,
    ] = await Promise.allSettled([
      api.portal(`pessoa-juridica?cnpj=${cnpjInput}`),
      api.portal(
        `despesas/recursos-recebidos?codigoFavorecido=${cnpjInput}&mesAnoInicio=01/${currentYear - 1}&mesAnoFim=12/${currentYear}&pagina=1`,
      ),
      api.portal(
        `despesas/documentos-por-favorecido?codigoPessoa=${cnpjInput}&fase=3&ano=${currentYear}&ordenacaoResultado=2&pagina=1`,
      ),
      api.portal(`acordos-leniencia?cnpjSancionado=${cnpjInput}&pagina=1`),
      api.portal(`renuncias-valor?cnpj=${cnpjInput}&pagina=1`),
      api.portal(`notas-fiscais?cnpjEmitente=${cnpjInput}&pagina=1`),
      api.portal(`contratos/cpf-cnpj?cpfCnpjFornecedor=${cnpj}&pagina=1`).catch(() => null),
    ]);

    const info =
      dataInfo.status === "fulfilled"
        ? Array.isArray(dataInfo.value)
          ? dataInfo.value[0]
          : dataInfo.value
        : null;

    if (!info || info.erro || !info.cnpj) {
      container.innerHTML =
        '<div class="p-6 bg-zinc-800 rounded-xl text-center text-zinc-400">Empresa não encontrada na base de dados do Portal da Transparência.</div>';
      return;
    }

    // Sanções
    const hasLeniencia =
      dataLeniencia.status === "fulfilled" &&
      Array.isArray(dataLeniencia.value) &&
      dataLeniencia.value.length > 0;
    const sanctions = {
      CEIS: info.sancionadoCEIS || false,
      CNEP: info.sancionadoCNEP || false,
      CEAF: info.sancionadoCEAF || false,
      CEPIM: info.sancionadoCEPIM || false,
      LENIÊNCIA: hasLeniencia,
    };
    const isSanctioned = Object.values(sanctions).some(Boolean);
    const sanctionCount = Object.values(sanctions).filter(Boolean).length;

    // Renúncia Fiscal
    let valorRenuncia = 0;
    if (
      dataRenuncia.status === "fulfilled" &&
      Array.isArray(dataRenuncia.value)
    ) {
      dataRenuncia.value.forEach(
        (r) => (valorRenuncia += window.parsePtBrFloat(r.valorRenuncia || "0")),
      );
    }

    // Total recebido
    let totalReceived = 0;
    const moneyList =
      dataMoney.status === "fulfilled" && Array.isArray(dataMoney.value)
        ? dataMoney.value
        : [];
    moneyList.forEach((item) => {
      totalReceived += window.parsePtBrFloat(item.valor || "0");
    });

    // Documentos de pagamento
    const docs =
      dataDocs.status === "fulfilled" && Array.isArray(dataDocs.value)
        ? dataDocs.value
        : [];

    // Flags de atividade
    const flags = [
      { label: "Contratos Gov.", val: info.possuiContratacao, color: "blue" },
      { label: "Convênios", val: info.convenios, color: "blue" },
      { label: "Favorecido", val: info.favorecidoDespesas, color: "green" },
      { label: "Licitações", val: info.participanteLicitacao, color: "blue" },
      { label: "Emitiu NF-e", val: info.emitiuNFe, color: "green" },
      {
        label: "Renúncia Fiscal",
        val: info.beneficiadoRenunciaFiscal,
        color: "yellow",
      },
      {
        label: "Isento/Imune",
        val: info.isentoImuneRenunciaFiscal,
        color: "yellow",
      },
    ];

    // Sanction pill per database
    const sanctionGrid = ["CEIS", "CNEP", "CEAF", "CEPIM", "LENIÊNCIA"]
      .map(
        (db) => `
            <div class="bg-zinc-900 p-3 rounded-xl border ${sanctions[db] ? "border-red-800 bg-red-950/30" : "border-zinc-800"}">
                <span class="block text-[10px] text-zinc-500 font-bold uppercase mb-1">${db}</span>
                <span class="font-black text-sm ${sanctions[db] ? "text-red-400" : "text-green-400"}">${sanctions[db] ? (db === "LENIÊNCIA" ? "⚠️ ACORDO" : "🚫 SIM") : "✅ Não"}</span>
            </div>`,
      )
      .join("");

    const flagPills = flags
      .map(
        (f) => `
            <span class="text-[10px] px-2 py-1 rounded-lg font-bold ${
              f.val
                ? `bg-${f.color}-950 text-${f.color}-300 border border-${f.color}-800`
                : "bg-zinc-900 text-zinc-600 border border-zinc-800 line-through"
            }">${f.label}</span>`,
      )
      .join("");

    const docsHtml =
      docs.length === 0
        ? `<p class="text-zinc-600 text-xs text-center py-4">Nenhum pagamento encontrado em ${currentYear}.</p>`
        : docs
            .slice(0, 8)
            .map(
              (d) => `
                <div class="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0 text-xs gap-2">
                    <div class="min-w-0">
                        <div class="text-zinc-300 truncate font-medium">${d.observacao || d.acao || d.programa || "—"}</div>
                        <div class="text-zinc-600">${d.data || ""} · ${d.orgao || d.ug || ""}</div>
                    </div>
                    <div class="text-green-400 font-black whitespace-nowrap shrink-0">${window.formatCurrency(window.parsePtBrFloat(d.valor || "0"))}</div>
                </div>`,
            )
            .join("");

    // Processar NF-e
    const nfeList =
      dataNfe.status === "fulfilled" && Array.isArray(dataNfe.value)
        ? dataNfe.value
        : [];
    const nfeHtml =
      nfeList.length === 0
        ? ""
        : `
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
            <div class="flex justify-between items-center mb-3">
                <h5 class="font-bold text-white text-sm">🧾 Produtos Vendidos (NF-e)</h5>
                <span class="text-[10px] text-zinc-500">${nfeList.length} notas carregadas</span>
            </div>
            <div class="space-y-2">
                ${nfeList
                  .slice(0, 5)
                  .map((nf) => {
                    const val = window.parsePtBrFloat(
                      nf.valorNotaFiscal || "0",
                    );
                    // Pega a descrição do primeiro item da nota fiscal
                    const produto =
                      nf.itensDeNotaFiscal && nf.itensDeNotaFiscal.length > 0
                        ? nf.itensDeNotaFiscal[0].produto?.descricao
                        : "Descrição não detalhada na API";
                    const orgaoDest = nf.orgaoDestinatario?.nome || "—";
                    return `<div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 text-xs">
                        <div class="flex justify-between gap-3">
                            <span class="font-bold text-white truncate max-w-[70%]" title="${produto}">${produto}</span>
                            <span class="text-green-400 font-black shrink-0">${window.formatCurrency(val)}</span>
                        </div>
                        <div class="text-zinc-500 mt-1 flex justify-between">
                            <span>${nf.dataEmissao || ""} · ${orgaoDest}</span>
                        </div>
                    </div>`;
                  })
                  .join("")}
            </div>
        </div>`;

    // Flag de situação cadastral (falência/inapta/suspensa)
    const situacaoCadastral = (info.situacaoCadastral || info.situacao || "").toLowerCase();
    const isInactive = situacaoCadastral.includes("baixada") || situacaoCadastral.includes("inapta") ||
                       situacaoCadastral.includes("suspensa") || situacaoCadastral.includes("cancelada") ||
                       situacaoCadastral.includes("nula");
    const bankruptcyFlagHtml = isInactive
      ? `<div class="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 mb-4 text-sm">
           <span class="text-red-400 text-lg">⚠️</span>
           <span class="text-red-300 font-bold">Situação Cadastral: <span class="uppercase">${info.situacaoCadastral || info.situacao || "Irregular"}</span></span>
         </div>`
      : "";

    const radarBtn = isSanctioned
      ? `
            <button onclick="switchTab('radar');initRadarTab();showRadarSubTab('sancoes');
                document.getElementById('radarCnpj').value='${cnpjInput}';runRadarScan();"
                class="w-full mt-3 bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/30">
                🔍 Investigar no Radar Anti-Corrupção
            </button>`
      : "";

    container.innerHTML = `
        <!-- Cabeçalho -->
        <div class="bg-gradient-to-br ${isSanctioned ? "from-red-950/50 to-zinc-900 border-red-900/50" : "from-zinc-800 to-zinc-900 border-zinc-700"} border rounded-2xl p-5 mb-4">
            <div class="flex flex-wrap justify-between items-start gap-3">
                <div>
                    <div class="text-xs text-zinc-500 uppercase font-bold mb-1">Pessoa Jurídica</div>
                    <h4 class="text-xl font-black text-white">${info.razaoSocial || "—"}</h4>
                    ${info.nomeFantasia ? `<div class="text-zinc-400 text-sm">${info.nomeFantasia}</div>` : ""}
                    <div class="text-zinc-600 text-xs mt-1">CNPJ: ${info.cnpj}</div>
                </div>
                <div class="text-right">
                    ${
                      isSanctioned
                        ? `<span class="inline-flex items-center gap-1 bg-red-700 text-white px-3 py-1.5 rounded-full text-sm font-black animate-pulse">🚫 ${sanctionCount} SANÇÃO(ÕES)</span>`
                        : `<span class="inline-flex items-center gap-1 bg-green-900/30 text-green-400 border border-green-800 px-3 py-1.5 rounded-full text-sm font-bold">✅ Sem Sanções</span>`
                    }
                </div>
            </div>
            ${radarBtn}
        </div>

        ${bankruptcyFlagHtml}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <!-- Sanções -->
            <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <h5 class="font-bold text-white text-sm mb-3">🚫 Bases de Sanções Oficiais</h5>
                <div class="grid grid-cols-2 gap-2">${sanctionGrid}</div>
            </div>

            <!-- Fluxo Financeiro -->
            <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <h5 class="font-bold text-white text-sm mb-3">💰 Recursos do Governo</h5>
                <div class="mb-3">
                    <div class="text-xs text-zinc-500 uppercase font-bold mb-0.5">Total recebido (últ. 2 anos)</div>
                    <div class="text-3xl font-black text-green-400">${window.formatCurrency(totalReceived)}</div>
                    ${moneyList.length > 0 ? `<div class="text-zinc-600 text-[10px] mt-1">${moneyList.length} registro(s) encontrado(s)</div>` : ""}
                </div>
                <div class="flex flex-wrap gap-1.5 mt-2">${flagPills}</div>
            </div>
        </div>
        
        ${
          valorRenuncia > 0
            ? `
        <!-- Benefícios Fiscais -->
        <div class="bg-yellow-950/30 border border-yellow-700/50 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
                <h5 class="font-bold text-yellow-400 text-sm">🏛️ Recebeu Renúncia Fiscal / Isenções</h5>
                <p class="text-xs text-zinc-400">Esta empresa obteve isenções de impostos do Governo Federal.</p>
            </div>
            <div class="text-2xl font-black text-yellow-500">${window.formatCurrency(valorRenuncia)}</div>
        </div>`
            : ""
        }

        <!-- Documentos de Pagamento -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
            <div class="flex justify-between items-center mb-3">
                <h5 class="font-bold text-white text-sm">📄 Pagamentos em ${currentYear}</h5>
                ${docs.length > 8 ? `<span class="text-[10px] text-zinc-500">${docs.length} total — exibindo 8</span>` : ""}
            </div>
            ${docsHtml}
        </div>

        ${nfeHtml}

        <!-- Ver no Portal -->
        <div class="text-center">
            <a href="https://portaldatransparencia.gov.br/pessoa-juridica/${cnpjInput}" target="_blank" rel="noopener"
               class="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition border border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2">
                🔗 Ver perfil completo no Portal da Transparência
            </a>
            <p class="text-[10px] text-zinc-700 mt-2">Dados públicos — Lei nº 12.527/2011 (LAI)</p>
        </div>`;
  } catch (e) {
    container.innerHTML = `<div class="text-center text-red-500 py-4">Erro na análise: ${e.message}</div>`;
  }
}

async function searchServers() {
  const name = document.getElementById("inp-server-name").value.trim();
  const container = document.getElementById("servers-results");

  if (name.length < 4) {
    alert("Digite pelo menos 4 caracteres para buscar.");
    return;
  }

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Buscando servidores no Portal da Transparência...</div>';

  try {
    // Usa busca_servidores (com rawurlencode + tipoServidor=1)
    const data = await api.buscaServidores(name);

    if (data.erro || data.message) {
      container.innerHTML = `<div class="text-center text-yellow-500 py-6">
        ⚠️ ${data.erro || data.message}
        <br><span class="text-xs text-zinc-500 mt-1 block">Tente um nome mais específico ou use o sobrenome.</span>
      </div>`;
      return;
    }

    // A API retorna array direto ou objeto com dados
    const list = Array.isArray(data) ? data : data.data || data.dados || [];

    if (!list.length) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum servidor encontrado com este nome.</div>';
      return;
    }

    container.innerHTML = `
      <div class="text-xs text-zinc-500 mb-3 px-1">
        <strong class="text-white">${list.length}</strong> servidor(es) encontrado(s) — Poder Executivo Federal (Civis)
      </div>
      <div class="space-y-2">
        ${list
          .slice(0, 40)
          .map((s, idx) => {
            // API retorna objeto aninhado: s.servidor.pessoa.nome, s.fichasCargoEfetivo[0].cargo
            const srv = s.servidor || s;
            const ficha =
              (s.fichasCargoEfetivo || s.fichasMilitar || [])[0] || {};
            const nome = srv.pessoa?.nome || s.nome || s.nomeServidor || "—";
            const cpfMask = srv.pessoa?.cpfFormatado || "";
            const cargo =
              ficha.cargo ||
              ficha.descricaoFuncaoCargo ||
              srv.funcao?.descricaoFuncaoCargo ||
              s.descricaoCargo ||
              s.cargo ||
              "Cargo não informado";
            const orgao =
              srv.orgaoServidorExercicio?.nome ||
              srv.orgaoServidorLotacao?.nome ||
              ficha.orgaoExercicio ||
              s.orgaoLotacao ||
              "Órgão não informado";
            const situacao =
              srv.situacao || ficha.situacaoServidor || s.situacaoVinculo || "";
            const remuneracao =
              parseFloat(
                s.remuneracaoBasicaBruta?.toString().replace(",", "."),
              ) || 0;
            const isCamara =
              orgao.toUpperCase().includes("CÂMARA") ||
              orgao.toUpperCase().includes("CAMARA");
            const nomeEnc = encodeURIComponent(nome);
            return `
            <div class="bg-zinc-900 border ${isCamara ? "border-violet-700/60" : "border-zinc-800"} rounded-xl hover:border-zinc-600 transition">
              <div class="p-4 flex justify-between items-center">
                <div class="flex-1 min-w-0 pr-4">
                  <div class="font-bold text-white truncate">${nome}</div>
                  <div class="text-xs text-zinc-400 mt-0.5">${cargo}</div>
                  <div class="text-xs ${isCamara ? "text-violet-400" : "text-zinc-500"} mt-1">${orgao}</div>
                  ${cpfMask ? `<div class="text-[10px] text-zinc-600 mt-0.5">CPF: ${cpfMask}</div>` : ""}
                </div>
                <div class="text-right flex-shrink-0 flex flex-col items-end gap-1">
                  ${remuneracao > 0 ? `<div class="text-green-400 font-bold text-sm">${window.formatCurrency(remuneracao)}</div><div class="text-[10px] text-zinc-500">Remuneração Bruta</div>` : ""}
                  ${situacao ? `<div class="text-[10px] px-2 py-0.5 rounded ${situacao.includes("ATIVO") ? "bg-green-900/30 text-green-400" : "bg-zinc-800 text-zinc-500"}">${situacao.replace(/_/g, " ")}</div>` : ""}
                  ${isCamara ? '<div class="text-[10px] text-violet-300 font-bold">🏛️ Câmara</div>' : ""}
                  <button onclick="checkServidorVinculos('${nome.replace(/'/g, "\\'")}', 'vinculos-${idx}')"
                    class="mt-1 text-[10px] bg-violet-900/40 hover:bg-violet-800/60 border border-violet-700/50 text-violet-300 px-3 py-1 rounded-lg transition font-bold">
                    🔍 Verificar Vínculos
                  </button>
                </div>
              </div>
              <div id="vinculos-${idx}" class="hidden px-4 pb-4"></div>
            </div>
          `;
          })
          .join("")}
        ${list.length > 40 ? `<p class="text-zinc-600 text-xs text-center pt-2">Exibindo 40 de ${list.length}. Refine a busca.</p>` : ""}
      </div>
      <p class="text-[10px] text-zinc-600 mt-4">Fonte: Portal da Transparência — Servidores Civis do Poder Executivo Federal (LAI)</p>
    `;
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao conectar com a API de Servidores.</div>';
  }
}

// ── Verificar Vínculos de Servidor ───────────────────────────────────────────
window.checkServidorVinculos = async function (nome, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Toggle: se já aberto, fecha
  if (!el.classList.contains("hidden")) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }

  el.classList.remove("hidden");
  el.innerHTML = `<div class="text-xs text-zinc-500 animate-pulse py-2">🔍 Cruzando dados nas bases federais...</div>`;

  const ano = new Date().getFullYear();

  try {
    // Requisições em paralelo: sanções + PEPs + pagamentos recebidos
    const [sancoes, pagamentos] = await Promise.all([
      api.scanCorrupcao(nome, "", "").catch(() => null),
      api
        .portal(
          `despesas/documentos-por-favorecido?codigoPessoa=${encodeURIComponent(nome)}&fase=3&ano=${ano}&pagina=1`,
        )
        .catch(() => null),
    ]);

    let html = `<div class="border-t border-zinc-800 pt-3 space-y-3">`;

    // ── Sanções ──────────────────────────────────────────────────────────────
    const totalSancoes = sancoes?.total_ocorrencias ?? null;
    if (totalSancoes !== null) {
      const cor = totalSancoes > 0 ? "red" : "emerald";
      const icon = totalSancoes > 0 ? "🚨" : "✅";
      html += `<div class="bg-${cor}-950/30 border border-${cor}-800/40 rounded-lg p-3">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold text-${cor}-400">${icon} Sanções Federais (CNEP/CEIS/CEAF/CEPIM/PEP)</span>
          <span class="ml-auto text-xs font-black text-${cor}-300">${totalSancoes} ocorrência(s)</span>
        </div>`;
      if (totalSancoes > 0) {
        Object.entries(sancoes.bases || {}).forEach(([, db]) => {
          if (!db.count) return;
          html += `<div class="text-[11px] text-zinc-400 mt-1">
            <span class="font-bold text-red-300">${db.meta?.nome}</span> — ${db.count} registro(s)
            ${(db.items || [])
              .slice(0, 1)
              .map(
                (item) =>
                  `<div class="text-zinc-500 ml-2">↳ ${item.tipoSancao?.descricaoResumida || item.fundamentoLegal || "—"}</div>`,
              )
              .join("")}
          </div>`;
        });
      } else {
        html += `<div class="text-[11px] text-zinc-500">Nenhuma sanção encontrada nas bases governamentais.</div>`;
      }
      html += `</div>`;
    }

    // ── PEP check (dentro do scan_anticorrupcao) ─────────────────────────────
    const pepBase = sancoes?.bases?.pep;
    if (pepBase?.count > 0) {
      html += `<div class="bg-yellow-950/30 border border-yellow-700/40 rounded-lg p-3">
        <div class="text-xs font-bold text-yellow-400 mb-1">⚠️ Pessoa Politicamente Exposta (PEP)</div>
        ${(pepBase.items || [])
          .slice(0, 2)
          .map(
            (p) => `
          <div class="text-[11px] text-zinc-400">
            <span class="text-yellow-300 font-bold">${p.nome || nome}</span>
            ${p.cargo ? `— ${p.cargo}` : ""}
            ${p.orgao ? `<div class="text-zinc-500 ml-2">↳ ${p.orgao}</div>` : ""}
          </div>`,
          )
          .join("")}
      </div>`;
    }

    // ── Pagamentos recebidos ──────────────────────────────────────────────────
    const docs = Array.isArray(pagamentos) ? pagamentos : [];
    if (docs.length > 0) {
      const total = docs.reduce(
        (s, d) => s + window.parsePtBrFloat(d.valor || d.valorDocumento || "0"),
        0,
      );
      html += `<div class="bg-orange-950/30 border border-orange-800/40 rounded-lg p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold text-orange-400">💰 Pagamentos Federais Recebidos (${ano})</span>
          <span class="ml-auto text-xs font-black text-orange-300">${window.formatCurrency(total)}</span>
        </div>
        ${docs
          .slice(0, 3)
          .map(
            (d) => `
          <div class="text-[11px] text-zinc-400 mb-1 flex justify-between">
            <span class="truncate pr-2">${d.unidadeGestora?.nome || d.orgao || "Órgão"}</span>
            <span class="text-orange-300 shrink-0 font-bold">${window.formatCurrency(window.parsePtBrFloat(d.valor || d.valorDocumento || "0"))}</span>
          </div>`,
          )
          .join("")}
        ${docs.length > 3 ? `<div class="text-[10px] text-zinc-600 mt-1">+${docs.length - 3} documento(s) adicionais</div>` : ""}
      </div>`;
    } else {
      html += `<div class="text-[11px] text-zinc-600 bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
        💳 Nenhum pagamento federal direto encontrado para este ano.
      </div>`;
    }

    // ── Benefícios Sociais ────────────────────────────────────────────────────
    html += `<div class="bg-zinc-900/60 border border-zinc-700/50 rounded-lg p-3">
      <div class="text-xs font-bold text-zinc-300 mb-2">🏥 Benefícios Sociais (Bolsa Família, BPC, PETI...)</div>
      <p class="text-[11px] text-zinc-500 mb-2">
        A API federal mascara o CPF. Informe o <strong class="text-zinc-300">NIS</strong> do servidor para cruzar com todos os programas sociais.
      </p>
      <div class="flex gap-2">
        <input id="nis-input-${containerId}" type="text" maxlength="11" placeholder="NIS ou CPF (11 dígitos)"
          class="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500"
          oninput="this.value=this.value.replace(/\\D/g,'')">
        <button onclick="checkBeneficiosSociais('${containerId}')"
          class="text-[11px] bg-green-800/60 hover:bg-green-700/80 border border-green-700/50 text-green-300 px-3 py-1.5 rounded-lg transition font-bold whitespace-nowrap">
          🔍 Verificar
        </button>
      </div>
      <div id="beneficios-result-${containerId}" class="mt-2"></div>
    </div>`;

    // ── Links para pesquisa manual ────────────────────────────────────────────
    const nomeUrl = encodeURIComponent(nome);
    html += `<div class="flex flex-wrap gap-2 pt-1">
      <a href="https://portaldatransparencia.gov.br/servidores?nome=${nomeUrl}" target="_blank" rel="noopener"
        class="text-[10px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition">
        🔗 Portal da Transparência
      </a>
      <a href="https://portaldatransparencia.gov.br/sancoes?nome=${nomeUrl}" target="_blank" rel="noopener"
        class="text-[10px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition">
        🔗 Sanções Federais
      </a>
    </div>`;

    html += `</div>`;
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<div class="text-xs text-red-500 py-2">Erro ao verificar vínculos.</div>`;
    console.error(e);
  }
};

// ── Verificar Benefícios Sociais por NIS ─────────────────────────────────────
window.checkBeneficiosSociais = async function (containerId) {
  const input = document.getElementById(`nis-input-${containerId}`);
  const resultEl = document.getElementById(`beneficios-result-${containerId}`);
  if (!input || !resultEl) return;

  const nis = input.value.replace(/\D/g, "");
  if (nis.length !== 11) {
    resultEl.innerHTML = `<div class="text-[11px] text-red-400">⚠️ Informe um NIS ou CPF com 11 dígitos.</div>`;
    return;
  }

  resultEl.innerHTML = `<div class="text-[11px] text-zinc-500 animate-pulse">Consultando programas sociais federais...</div>`;

  try {
    const data = await fetchApi("check_beneficios_sociais", { codigo: nis });

    if (data.erro) {
      resultEl.innerHTML = `<div class="text-[11px] text-red-400">${data.erro}</div>`;
      return;
    }

    const total = data.total_programas || 0;
    const cor = total > 0 ? "yellow" : "emerald";
    const icon = total > 0 ? "⚠️" : "✅";

    let html = `<div class="rounded-lg border border-${cor}-700/40 bg-${cor}-950/30 p-3 mt-1">
      <div class="text-xs font-bold text-${cor}-400 mb-2">${icon} ${total > 0 ? `${total} programa(s) ativo(s) encontrado(s)` : "Nenhum benefício social ativo encontrado"}</div>
      <div class="space-y-1">`;

    Object.entries(data.programas || {}).forEach(([, prog]) => {
      const m = prog.meta;
      const ativo = prog.ativo;
      const corProg = ativo ? m.cor : "zinc";
      html += `<div class="flex items-center gap-2 text-[11px]">
        <span class="text-base leading-none">${m.icon}</span>
        <span class="font-bold text-${corProg}-${ativo ? "300" : "600"}">${m.nome}</span>
        <span class="ml-auto px-2 py-0.5 rounded text-[10px] font-black ${
          ativo
            ? `bg-${corProg}-900/50 border border-${corProg}-700 text-${corProg}-300`
            : "bg-zinc-800 text-zinc-600 border border-zinc-700"
        }">
          ${ativo ? "● ATIVO" : "○ sem registro"}
        </span>
      </div>`;

      if (ativo && prog.dados?.length > 0) {
        const d = prog.dados[0];
        const valor = d.valor || d.valorBeneficio || d.valorParcela || "";
        const mesRef =
          d.mesReferencia || d.competencia || d.anoMesCompetencia || "";
        if (valor || mesRef) {
          html += `<div class="text-[10px] text-zinc-500 ml-6 mb-1">
            ${mesRef ? `Ref: ${mesRef}` : ""} ${valor ? `— Valor: R$ ${valor}` : ""}
          </div>`;
        }
      }
    });

    html += `</div>`;
    if (total > 0) {
      html += `<div class="mt-2 pt-2 border-t border-${cor}-800/30 text-[10px] text-${cor}-600">
        ⚠️ Servidor público recebendo benefício social pode configurar irregularidade. Verifique com o órgão competente.
      </div>`;
    }
    html += `</div>`;
    resultEl.innerHTML = html;
  } catch (e) {
    resultEl.innerHTML = `<div class="text-[11px] text-red-400">Erro ao consultar benefícios.</div>`;
  }
};

// ── Viagens a Serviço ────────────────────────────────────────────────────────
window.searchViagens = async function () {
  const dataIni = document.getElementById("viagem-data-ini")?.value || "";
  const dataFim = document.getElementById("viagem-data-fim")?.value || "";
  const termo = document.getElementById("viagem-termo")?.value || "";
  const orgao = document.getElementById("viagem-orgao")?.value || "20000";
  const container = document.getElementById("viagens-results");
  const stats = document.getElementById("viagens-stats");

  // Default: current month if no dates supplied
  const hoje = new Date();
  const iniDate = dataIni || `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-01`;
  const fimDate = dataFim || `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Buscando viagens...</div>';
  stats.classList.add("hidden");

  try {
    const [iy, im, id] = iniDate.split("-");
    const [fy, fm, fd] = fimDate.split("-");
    // API requires: codigoOrgao + dataIdaDe + dataIdaAte + dataRetornoDe + dataRetornoAte
    let endpoint = `viagens?pagina=1&codigoOrgao=${orgao}` +
      `&dataIdaDe=${id}/${im}/${iy}&dataIdaAte=${fd}/${fm}/${fy}` +
      `&dataRetornoDe=${id}/${im}/${iy}&dataRetornoAte=${fd}/${fm}/${fy}`;

    const data = await api.portal(endpoint);

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhuma viagem encontrada para este período.</div>';
      return;
    }

    let filtered = data;
    if (termo) {
      filtered = data.filter((v) =>
        (v.beneficiario?.nome || "")
          .toLowerCase()
          .includes(termo.toLowerCase()),
      );
    }

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum viagem encontrada com este filtro.</div>';
      return;
    }

    window.currentViagensData = filtered;
    let totalValue = 0;

    container.innerHTML = filtered
      .map((v) => {
        const val = window.parsePtBrFloat(v.valorTotalViagem || v.valor || 0);
        totalValue += val;

        const passageiro = v.beneficiario?.nome || "Não informado";
        const cargo = v.cargo?.descricao || v.funcao?.descricao || "";
        const orgaoNome = v.orgao?.nome || v.orgaoPagamento?.nome || "Órgão não informado";
        const motivo = v.viagem?.motivo || v.motivo || "Sem motivo detalhado";
        const tipo = v.tipoViagem || "";
        const situacao = v.situacao || "";
        const urgente = v.viagem?.urgenciaViagem === "Sim";
        const numPcdp = v.viagem?.numPcdp || "";
        const dtIda = v.dataInicioAfastamento || "";
        const dtVolta = v.dataFimAfastamento || "";
        const diarias = v.valorTotalDiarias || 0;
        const passagem = v.valorTotalPassagem || 0;

        const tipoBadge = tipo === "Internacional"
          ? `<span class="text-[10px] font-bold bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800">🌎 Internacional</span>`
          : tipo === "Nacional"
          ? `<span class="text-[10px] font-bold bg-green-900/40 text-green-300 px-2 py-0.5 rounded border border-green-800">🇧🇷 Nacional</span>`
          : "";
        const urgBadge = urgente
          ? `<span class="text-[10px] font-bold bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded border border-amber-700">⚡ URGENTE</span>`
          : "";
        const sitBadge = situacao
          ? `<span class="text-[10px] font-bold bg-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded">${situacao}</span>`
          : "";

        return `
                <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-violet-500 transition">
                    <div class="flex flex-col md:flex-row justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                <span class="text-[10px] font-bold bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded border border-violet-800">✈️ VIAGEM</span>
                                ${tipoBadge}${urgBadge}${sitBadge}
                                <span class="text-xs text-zinc-500 font-mono">${dtIda}${dtVolta ? " → " + dtVolta : ""}</span>
                            </div>
                            <h4 class="font-bold text-white text-sm mb-0.5 truncate">${passageiro}</h4>
                            ${cargo ? `<p class="text-zinc-500 text-xs mb-1">${cargo}</p>` : ""}
                            <p class="text-zinc-400 text-xs mb-1">🏛️ ${orgaoNome}</p>
                            ${numPcdp ? `<p class="text-zinc-600 text-[10px] font-mono mb-1">PCDP: ${numPcdp}</p>` : ""}
                            <p class="text-zinc-400 text-xs mt-2 italic line-clamp-2">"${motivo}"</p>
                        </div>
                        <div class="text-right flex-shrink-0 min-w-[110px]">
                            <div class="text-[10px] text-zinc-500 uppercase">Custo Total</div>
                            <div class="text-red-400 font-black text-lg">${window.formatCurrency(val)}</div>
                            ${diarias > 0 ? `<div class="text-[10px] text-zinc-500 mt-1">Diárias: ${window.formatCurrency(diarias)}</div>` : ""}
                            ${passagem > 0 ? `<div class="text-[10px] text-zinc-500">Passagem: ${window.formatCurrency(passagem)}</div>` : ""}
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");

    stats.innerHTML = `<div class="flex flex-wrap gap-4 text-sm"><span class="text-zinc-400">📋 <strong class="text-white">${filtered.length}</strong> viagens listadas</span><span class="text-zinc-400">💰 Total exibido: <strong class="text-red-400">${window.formatCurrency(totalValue)}</strong></span></div>`;
    stats.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-10">Erro ao buscar viagens.</div>';
  }
};

// ── Licitações / Contratos ──────────────────────────────────────────────────
window.searchLicitacoes = async function () {
  const dataIni = document.getElementById("licitacao-data-ini")?.value || "";
  const dataFim = document.getElementById("licitacao-data-fim")?.value || "";
  const termo = document.getElementById("licitacao-termo")?.value || "";
  const orgaoCode = document.getElementById("licitacao-orgao")?.value || "36000";
  const container = document.getElementById("licitacoes-results");
  const stats = document.getElementById("licitacoes-stats");

  // Default: current month
  const hoje = new Date();
  const iniDate = dataIni || `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-01`;
  const fimDate = dataFim || `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Buscando contratos...</div>';
  stats.classList.add("hidden");

  try {
    const [iy, im, id] = iniDate.split("-");
    const [fy, fm, fd] = fimDate.split("-");
    const endpoint = `contratos?pagina=1&tamanhoPagina=100&codigoOrgao=${orgaoCode}` +
      `&dataVigenciaInicial=${id}/${im}/${iy}&dataVigenciaFinal=${fd}/${fm}/${fy}`;

    const data = await api.portal(endpoint);

    if (data.erro || data.message) {
      container.innerHTML = `<div class="text-center text-red-400 py-10">${data.erro || data.message}</div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum contrato encontrado para este órgão/período.</div>';
      return;
    }

    let filtered = data;
    if (termo) {
      filtered = data.filter((l) =>
        (l.objeto || "").toLowerCase().includes(termo.toLowerCase()) ||
        (l.fornecedor?.nome || "").toLowerCase().includes(termo.toLowerCase())
      );
    }

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum contrato encontrado com este filtro.</div>';
      return;
    }

    let totalValue = 0;

    container.innerHTML = filtered
      .map((l) => {
        const val = window.parsePtBrFloat(l.valorInicialCompra || l.valorFinalCompra || 0);
        totalValue += val;

        const orgaoNome =
          l.unidadeGestora?.orgaoVinculado?.nome ||
          l.unidadeGestora?.orgaoMaximo?.nome ||
          "Órgão não informado";
        const unidadeNome = l.unidadeGestora?.nome || "";
        const modalidade = l.modalidadeCompra || "Contrato";
        const situacao = l.situacaoContrato || "Vigente";
        const objeto = (l.objeto || l.compra?.objeto || "Sem descrição").replace(/^Objeto:\s*/i, "");
        const dataAssin = l.dataAssinatura || l.dataInicioVigencia || "";
        const numContrato = l.numero || "";

        const fornNome = l.fornecedor?.nome || "";
        const fornCnpj = l.fornecedor?.cnpjFormatado || l.fornecedor?.cpfFormatado || "";
        const isCnpj = fornCnpj.replace(/[^\d]/g,"").length === 14;

        const fornHtml = fornNome
          ? `<div class="mt-2 pt-2 border-t border-zinc-700/50 flex items-center justify-between gap-2">
                <span class="text-xs text-zinc-300 truncate">🏢 <strong>${fornNome}</strong></span>
                ${isCnpj ? `<button onclick="openSupplierRadar('${fornCnpj.replace(/[^\d]/g,'')}')" class="text-[10px] bg-red-900/40 hover:bg-red-800/60 border border-red-800/50 text-red-400 px-2 py-1 rounded transition shrink-0">🚨 Radar</button>` : ""}
            </div>`
          : "";

        let situacaoBadge = "bg-blue-900/30 text-blue-400 border-blue-800";
        if (situacao.toLowerCase().includes("encerr") || situacao.toLowerCase().includes("vencido"))
          situacaoBadge = "bg-zinc-700 text-zinc-400 border-zinc-600";

        return `
          <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-violet-500 transition">
            <div class="flex flex-col md:flex-row justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${situacaoBadge}">${situacao}</span>
                  <span class="text-[10px] bg-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded uppercase">${modalidade}</span>
                  <span class="text-xs text-zinc-500 font-mono">${dataAssin}</span>
                </div>
                <h4 class="font-bold text-white text-sm mb-1 line-clamp-2">${objeto}</h4>
                <p class="text-zinc-400 text-xs">🏛️ ${orgaoNome}</p>
                ${unidadeNome ? `<p class="text-zinc-500 text-xs">📂 ${unidadeNome}</p>` : ""}
                ${l.dataFimVigencia ? `<p class="text-zinc-500 text-xs mt-1">Vigência até: ${l.dataFimVigencia}</p>` : ""}
                ${fornHtml}
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-[10px] text-zinc-500 uppercase">Valor Inicial</div>
                <div class="text-green-400 font-black text-lg">${window.formatCurrency(val)}</div>
                ${numContrato ? `<div class="text-[10px] text-zinc-600 mt-1">Contrato: ${numContrato}</div>` : ""}
                <div class="text-[10px] text-zinc-600 mt-1">Proc: ${l.numeroProcesso || "N/A"}</div>
              </div>
            </div>
          </div>`;
      })
      .join("");

    stats.innerHTML = `<div class="flex flex-wrap gap-4 text-sm"><span class="text-zinc-400">📋 <strong class="text-white">${filtered.length}</strong> contratos listados</span><span class="text-zinc-400">💰 Valor total: <strong class="text-green-400">${window.formatCurrency(totalValue)}</strong></span></div>`;
    stats.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-10">Erro ao buscar contratos.</div>';
  }
};

// ── Receitas Públicas ────────────────────────────────────────────────────────
// ── Receitas / Contratos Federais ────────────────────────────────────────────
// O endpoint /receitas do Portal da Transparência requer permissão especial (403).
// Usamos /contratos com agrupamento de valores como alternativa funcional.
window.searchReceitas = async function () {
  const dataIni = document.getElementById("receitas-data-ini")?.value || "";
  const filtroNome = document.getElementById("receitas-filtro-nome")?.value?.toLowerCase() || "";
  const orgaoCode = document.getElementById("receitas-orgao-select")?.value || "36000";
  const container = document.getElementById("receitas-results");
  const stats = document.getElementById("receitas-stats");

  // Extrai ano e mês da data selecionada (ou usa mês/ano atual)
  const hoje = new Date();
  const refDate = dataIni ? new Date(dataIni + "T00:00:00") : hoje;
  const ano = refDate.getFullYear();
  const mes = refDate.getMonth() + 1;

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-10 animate-pulse">Buscando execução orçamentária...</div>';
  stats.classList.add("hidden");

  try {
    // Endpoint: despesas/por-orgao — parâmetros obrigatórios: pagina + ano + (orgaoSuperior ou orgao)
    let endpoint = `despesas/por-orgao?pagina=1&ano=${ano}`;
    if (orgaoCode && orgaoCode !== "0") endpoint += `&orgaoSuperior=${orgaoCode}`;

    const data = await api.portal(endpoint);

    if (data.erro || data.message) {
      container.innerHTML = `<div class="text-center text-red-400 py-10">${data.erro || data.message}</div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum dado encontrado para este órgão/período.</div>';
      return;
    }

    // API retorna: { orgao: string, codigoOrgao: string, orgaoSuperior: string,
    //               codigoOrgaoSuperior: string, empenhado: string, liquidado: string, pago: string }
    // Todos os valores são strings no formato BR: "1.234.567,89"
    let filtered = filtroNome
      ? data.filter((r) =>
          (typeof r.orgao === "string" ? r.orgao : r.orgaoSuperior || "")
            .toLowerCase().includes(filtroNome)
        )
      : data;

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-10">Nenhum órgão encontrado com este filtro.</div>';
      return;
    }

    let totalEmpenhado = 0;
    let totalLiquidado = 0;

    container.innerHTML = filtered.map((r) => {
      // Campos reais da API — orgao e orgaoSuperior são strings simples
      const nomeOrgao   = (typeof r.orgao === "string" && r.orgao) ? r.orgao : (r.orgaoSuperior || "Órgão não identificado");
      const codigoOrgao = r.codigoOrgao || r.codigoOrgaoSuperior || "";
      const empenhado   = window.parsePtBrFloat(r.empenhado || "0");
      const liquidado   = window.parsePtBrFloat(r.liquidado || "0");
      const pago        = window.parsePtBrFloat(r.pago || "0");
      totalEmpenhado   += empenhado;
      totalLiquidado   += liquidado;

      // Progresso: liquidado vs empenhado (dotação não disponível neste endpoint)
      const pct      = empenhado > 0 ? Math.min((liquidado / empenhado) * 100, 100) : 0;
      const pctStr   = pct.toFixed(1);
      const pctColor = pct >= 80 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400";

      return `
        <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-emerald-500 transition">
          <div class="flex flex-col md:flex-row justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-[10px] font-bold bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">📊 DESPESA</span>
                ${codigoOrgao ? `<span class="text-[10px] bg-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded font-mono">${codigoOrgao}</span>` : ""}
                <span class="text-xs text-zinc-500 font-mono">${ano}</span>
              </div>
              <h4 class="font-bold text-white text-sm mb-1 line-clamp-2">${nomeOrgao}</h4>
              <div class="mt-2">
                <div class="flex justify-between text-[10px] text-zinc-500 mb-0.5">
                  <span>Liquidado / Empenhado</span>
                  <span class="${pctColor} font-bold">${pctStr}%</span>
                </div>
                <div class="w-full bg-zinc-700 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full bg-emerald-500" style="width:${pct}%"></div>
                </div>
              </div>
              ${pago > 0 ? `<p class="text-zinc-500 text-[11px] mt-1">Pago: ${window.formatCurrency(pago)}</p>` : ""}
            </div>
            <div class="text-right flex-shrink-0 min-w-[130px]">
              <div class="text-[10px] text-zinc-500 uppercase">Liquidado</div>
              <div class="text-emerald-400 font-black text-lg">${window.formatCurrency(liquidado)}</div>
              <div class="text-[10px] text-zinc-500 mt-1">Empenhado: ${window.formatCurrency(empenhado)}</div>
            </div>
          </div>
        </div>`;
    }).join("");

    stats.innerHTML = `<div class="flex flex-wrap gap-4 text-sm">
      <span class="text-zinc-400">🏛️ <strong class="text-white">${filtered.length}</strong> órgãos</span>
      <span class="text-zinc-400">✅ Liquidado: <strong class="text-emerald-400">${window.formatCurrency(totalLiquidado)}</strong></span>
      <span class="text-zinc-400">📊 Empenhado: <strong class="text-zinc-300">${window.formatCurrency(totalEmpenhado)}</strong></span>
    </div>`;
    stats.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-10">Erro ao buscar execução orçamentária.</div>';
  }
};

// ── Imóveis Funcionais (Permissionários) ─────────────────────────────────────
window.searchPermissionarios = async function () {
  const cpf =
    document.getElementById("imoveis-cpf")?.value.replace(/\D/g, "") || "";
  const dataIni = document.getElementById("imoveis-data-ini")?.value || "";
  const container = document.getElementById("imoveis-results");
  const stats = document.getElementById("imoveis-stats");

  container.innerHTML =
    '<div class="col-span-full text-center text-zinc-500 py-10 animate-pulse">Buscando ocupantes de imóveis da União...</div>';
  stats.classList.add("hidden");

  try {
    let endpoint = `permissionarios?pagina=1`;
    if (cpf) endpoint += `&cpfOcupante=${cpf}`;
    if (dataIni) {
      const [y, m, d] = dataIni.split("-");
      endpoint += `&dataInicioOcupacao=${d}/${m}/${y}`;
    }

    const data = await api.portal(endpoint);

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="col-span-full text-center text-zinc-500 py-10">Nenhum ocupante encontrado com estes filtros.</div>';
      return;
    }

    container.innerHTML = data
      .map((p) => {
        const nome =
          p.nome ||
          p.nomeOcupante ||
          p.pessoa?.nome ||
          "Nome protegido/Não informado";
        const cpfFmt =
          p.cpfFormatado || p.cpfOcupante || p.pessoa?.cpfFormatado || "";
        const orgao =
          p.orgaoOcupante?.nome ||
          p.nomeOrgaoOcupante ||
          p.descricaoOrgaoOcupante ||
          "Órgão não informado";
        const endereco =
          p.imovel?.endereco || p.endereco || "Endereço residencial funcional";
        const dataInicio = p.dataInicioOcupacao || p.dataInicio || "";
        const dataFim = p.dataFimOcupacao || p.dataFim || "Ocupando Atualmente";

        return `
              <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-violet-500 transition flex flex-col justify-between">
                  <div>
                      <div class="flex items-center gap-2 mb-2">
                          <span class="text-[10px] font-bold bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded border border-violet-800">🏠 PERMISSIONÁRIO</span>
                          <span class="text-xs text-zinc-500 font-mono">${dataInicio} → ${dataFim}</span>
                      </div>
                      <h4 class="font-bold text-white text-sm truncate" title="${nome}">${nome}</h4>
                      ${cpfFmt ? `<p class="text-xs text-zinc-500 font-mono mt-0.5">${cpfFmt}</p>` : ""}
                      <p class="text-zinc-400 text-xs mt-2">🏛️ ${orgao}</p>
                  </div>
                  <div class="mt-3 pt-3 border-t border-zinc-700/50">
                      <p class="text-xs text-zinc-300 font-medium">📍 ${endereco}</p>
                  </div>
              </div>
          `;
      })
      .join("");

    stats.innerHTML = `<div class="text-sm text-zinc-400">📋 <strong class="text-white">${data.length}</strong> ocupantes encontrados (Exibindo 1ª página).</div>`;
    stats.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="col-span-full text-center text-red-500 py-10">Erro ao buscar imóveis funcionais.</div>';
  }
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.api !== "undefined") {
    loadDeputies();
    loadParties();
    loadYearsOptions();
    setFilterMode("mes");
  } else {
    // Retry simples caso api.js demore um pouco mais
    setTimeout(() => {
      if (typeof window.api !== "undefined") loadDeputies();
    }, 500);
  }
});
