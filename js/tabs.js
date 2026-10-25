// /var/www/html/hyperz/transparency/js/tabs.js

// Base classes matching the compact sidebar buttons
const _BASE =
  "w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2 text-sm font-medium whitespace-nowrap border border-transparent";
const _ACTIVE =
  "w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2 text-sm font-bold whitespace-nowrap";

window.switchTab = function (tab) {
  // Hide all content panels
  document
    .querySelectorAll('[id^="content-"]')
    .forEach((el) => el.classList.add("hidden"));

  // Show active content
  const content = document.getElementById(`content-${tab}`);
  if (content) content.classList.remove("hidden");

  // Scroll main area back to top on tab change
  const mainEl = document.querySelector("main");
  if (mainEl) mainEl.scrollTop = 0;

  // Set active button style via centralized updateDesktopSidebar
  if (typeof window.updateDesktopSidebar === "function") {
    window.updateDesktopSidebar(tab);
  }

  // On-demand loading
  if (tab === "presidentes" && typeof window.loadPresidents === "function")
    window.loadPresidents();
  if (tab === "partidos" && typeof window.loadPartyOptions === "function")
    window.loadPartyOptions();
  if (tab === "politicos" && typeof window.loadParties === "function")
    window.loadParties();
  if (tab === "senadores" && typeof window.loadSenators === "function")
    window.loadSenators();
  if (tab === "noticias" && typeof window.loadPoliticalNews === "function")
    window.loadPoliticalNews();
  if (tab === "gestao" && typeof window.loadFederalExpenses === "function") {
    window.loadFederalExpenses();
  }
  if (tab === "outros" && typeof window.loadYearsOptions === "function")
    window.loadYearsOptions();
  if (tab === "radar" && typeof window.initRadarTab === "function")
    window.initRadarTab();
  if (
    tab === "eleicoes" &&
    typeof window.loadTseDatasets === "function" &&
    !window.tseDataLoaded
  )
    window.loadTseDatasets();
  if (tab === "eleicoes" && typeof window.updateRoleSelect === "function")
    window.updateRoleSelect(window.currentElectionYear || 2022);

  if (tab === "apuracao") {
    if (window.Apuracao) {
      if (!window.Apuracao.map) window.Apuracao.init();
      window.Apuracao.fetchResults();
      if (!window.Apuracao.intervalId) {
        window.Apuracao.intervalId = setInterval(() => window.Apuracao.fetchResults(), 30000);
      }
      setTimeout(() => { if (window.Apuracao.map) window.Apuracao.map.invalidateSize(); }, 300);
      if (window.ApuracaoChat && typeof window.ApuracaoChat.checkState === "function") {
        window.ApuracaoChat.checkState();
      }
    }
  } else {
    if (window.Apuracao && window.Apuracao.intervalId) {
      clearInterval(window.Apuracao.intervalId);
      window.Apuracao.intervalId = null;
    }
    if (window.ApuracaoChat && typeof window.ApuracaoChat.stopPolling === "function") {
      window.ApuracaoChat.stopPolling();
    }
  }

  if (tab === "mapa" && typeof window.initSpendingMap === "function") {
    setTimeout(() => window.initSpendingMap(), 100);
  }
  if (tab === "rede" && typeof window.initNetworkGraph === "function") {
    window.initNetworkGraph();
  }
  if (
    tab === "orcamento" &&
    typeof loadCharts === "function" &&
    !window.chartsLoaded
  ) {
    loadCharts();
    window.chartsLoaded = true;
  }

  if (tab === "viagens") {
    const dIni = document.getElementById("viagem-data-ini");
    const dFim = document.getElementById("viagem-data-fim");
    const today = new Date();
    const past = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
    );
    if (dIni && !dIni.value) dIni.value = past.toISOString().split("T")[0];
    if (dFim && !dFim.value) dFim.value = today.toISOString().split("T")[0];
    if (typeof window.searchViagens === "function") window.searchViagens();
  }
  if (tab === "licitacoes") {
    const dIni = document.getElementById("licitacao-data-ini");
    const dFim = document.getElementById("licitacao-data-fim");
    const today = new Date();
    const past = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
    );
    if (dIni && !dIni.value) dIni.value = past.toISOString().split("T")[0];
    if (dFim && !dFim.value) dFim.value = today.toISOString().split("T")[0];
    if (typeof window.searchLicitacoes === "function")
      window.searchLicitacoes();
  }
  if (tab === "receitas") {
    const dIni = document.getElementById("receitas-data-ini");
    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    if (dIni && !dIni.value) dIni.value = ym;
    if (typeof window.searchReceitas === "function") window.searchReceitas();
  }
  if (tab === "imoveis") {
    if (typeof window.searchPermissionarios === "function")
      window.searchPermissionarios();
  }
  if (tab === "top_corrupcao") {
    // A análise é manual, não faz nada ao abrir
  }

  // Set default date inputs
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const s = document.getElementById("card-month-start");
  const e = document.getElementById("card-month-end");
  if (s && !s.value) s.value = lastMonth.toISOString().slice(0, 7);
  if (e && !e.value) e.value = today.toISOString().slice(0, 7);

  // Scroll active tab button into view on mobile sidebar
  const activeBtn2 = document.getElementById(`tab-${tab}`);
  if (activeBtn2)
    activeBtn2.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
};

// Activate default tab on load (Removido para usar a lógica do scripts.php / home)
/*
document.addEventListener("DOMContentLoaded", () => {
  window.switchTab("politicos");
});
*/
