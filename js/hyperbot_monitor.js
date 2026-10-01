/**
 * hyperbot_monitor.js — Sistema de Vigilância Política
 *
 * Permite ao cidadão monitorar políticos específicos e receber
 * alertas automáticos quando novas sanções ou processos são detectados.
 *
 * Funcionalidades:
 *  • Lista de vigilância persistida em localStorage
 *  • Verificação automática ao carregar a página
 *  • Re-verificação periódica a cada 15 minutos
 *  • Badge de alertas não-lidos no botão do HyperBot
 *  • Histórico de alertas com data/hora
 *
 * Comandos de chat:
 *  "monitorar [nome]" / "vigiar [nome]" → adiciona à lista
 *  "minhas vigilâncias" / "lista de monitoramento" → exibe lista
 *  "parar de monitorar [nome]" → remove da lista
 *  "alertas" → mostra alertas recentes
 *
 * Expõe: window.HyperBotMonitor
 */
(function () {
  "use strict";

  const STORAGE_KEY  = "hz_monitor_v2";
  const ALERT_KEY    = "hz_monitor_alertas";
  const INTERVAL_MS  = 15 * 60 * 1000; // 15 minutos
  const MAX_ALERTAS  = 50;
  const MAX_WATCH    = 20;

  // ─── Estado ──────────────────────────────────────────────────────────────
  let watchlist = [];
  let alertas   = [];

  function _loadStorage() {
    try { watchlist = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (_) { watchlist = []; }
    try { alertas   = JSON.parse(localStorage.getItem(ALERT_KEY)   || "[]"); } catch (_) { alertas   = []; }
  }
  function _saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
      localStorage.setItem(ALERT_KEY,   JSON.stringify(alertas.slice(0, MAX_ALERTAS)));
    } catch (_) {}
  }

  _loadStorage();

  // ─── Badge do HyperBot ───────────────────────────────────────────────────
  function _atualizarBadge() {
    const naoLidos = alertas.filter(a => !a.lido).length;
    const badge    = document.getElementById("hyperbot-badge");
    if (!badge) return;
    if (naoLidos > 0) {
      badge.style.display  = "flex";
      badge.textContent    = naoLidos > 9 ? "9+" : String(naoLidos);
      badge.style.background = "#ef4444";
    } else {
      badge.style.display  = "none";
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function bot(sev, titulo, texto) {
    window.HyperBotChat?.pushBotMsg?.(sev, titulo, texto, { delay: 0 });
  }
  function abrir() {
    const panel = document.getElementById("hyperbot-panel");
    if (panel?.classList.contains("hidden-panel")) window.HyperBot?.toggle?.();
  }

  // ─── Adicionar à lista ───────────────────────────────────────────────────
  function adicionar(id, nome, partido, uf) {
    if (!nome) { bot("atencao", "📡 Monitorar quem?", "Me diga o nome do político para adicionar à lista de vigilância."); return; }
    if (watchlist.length >= MAX_WATCH) {
      bot("atencao", "📡 Lista cheia", `Você já monitora ${MAX_WATCH} políticos. Remova um para adicionar outro.`);
      return;
    }
    const existe = watchlist.some(w => w.id === id || w.nome.toLowerCase() === nome.toLowerCase());
    if (existe) {
      bot("info", "📡 Já monitorado", `<strong>${nome}</strong> já está na sua lista de vigilância.`);
      return;
    }
    const item = {
      id:          id || null,
      nome:        nome,
      partido:     partido || "–",
      uf:          uf || "–",
      addedAt:     Date.now(),
      lastCheck:   null,
      lastSancoes: -1, // -1 = não verificado ainda
      lastProc:    -1,
    };
    watchlist.push(item);
    _saveStorage();

    bot("positivo", "📡 Vigilância ativada!",
      `<strong>${nome}</strong> (${partido}/${uf}) foi adicionado à sua lista de monitoramento.<br><br>
       Vou verificar automaticamente a cada 15 minutos se aparecerem novas sanções ou processos.
       <br><span style="font-size:11px;color:#52525b;">Lista atual: ${watchlist.length}/${MAX_WATCH} políticos</span>`
    );

    // Verificação imediata
    setTimeout(() => _verificarItem(item, true), 1000);
    _atualizarSidebar();
  }

  // ─── Remover da lista ────────────────────────────────────────────────────
  function remover(nomeOuId) {
    const antes = watchlist.length;
    watchlist = watchlist.filter(w =>
      w.id !== nomeOuId &&
      !w.nome.toLowerCase().includes(String(nomeOuId).toLowerCase())
    );
    if (watchlist.length < antes) {
      _saveStorage();
      bot("info", "📡 Vigilância removida", `Político removido da lista de monitoramento.`);
      _atualizarSidebar();
    } else {
      bot("atencao", "📡 Não encontrado", `Não encontrei esse político na sua lista de vigilância.`);
    }
  }

  // ─── Listar monitorados ──────────────────────────────────────────────────
  function listar() {
    if (!watchlist.length) {
      bot("info", "📡 Lista vazia",
        "Você não está monitorando nenhum político ainda.<br><br>" +
        `Me diga: <em>"monitorar [nome do político]"</em>`);
      return;
    }
    const html = watchlist.map((w, i) => {
      const addedDate = new Date(w.addedAt).toLocaleDateString("pt-BR");
      const lastDate  = w.lastCheck ? new Date(w.lastCheck).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "Nunca";
      const sancStatus = w.lastSancoes === -1 ? "⏳" : w.lastSancoes === 0 ? "✅ 0" : `🚨 ${w.lastSancoes}`;
      const procStatus = w.lastProc    === -1 ? "⏳" : w.lastProc    === 0 ? "✅ 0" : `⚠️ ${w.lastProc}`;
      return `<div style="padding:8px 0;border-bottom:1px solid #1a1a24;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div>
            <div style="font-weight:700;color:#f4f4f5;font-size:13px;">${i + 1}. ${w.nome}</div>
            <div style="font-size:11px;color:#71717a;">${w.partido}/${w.uf} · Desde ${addedDate}</div>
            <div style="font-size:11px;color:#52525b;margin-top:2px;">
              Sanções: ${sancStatus} · Processos: ${procStatus} · Verificado: ${lastDate}
            </div>
          </div>
        </div>
      </div>`;
    }).join("");

    bot("info", `📡 Lista de Vigilância — ${watchlist.length} político(s)`, html);

    window.HyperBotAgent?.mostrarChips?.([
      { emoji: "🔄", label: "Verificar agora",       acao: () => verificarTodos(true) },
      { emoji: "🔔", label: "Ver alertas recentes",   acao: () => mostrarAlertas() },
    ]);
  }

  // ─── Mostrar alertas ─────────────────────────────────────────────────────
  function mostrarAlertas() {
    if (!alertas.length) {
      bot("info", "🔔 Sem alertas", "Nenhum alerta registrado ainda. Os alertas aparecem quando novos dados são detectados.");
      return;
    }
    // Marca como lido
    alertas.forEach(a => { a.lido = true; });
    _saveStorage();
    _atualizarBadge();

    const html = alertas.slice(0, 10).map(a => {
      const dt = new Date(a.ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      const cor = a.tipo === "critico" ? "#f87171" : a.tipo === "atencao" ? "#fbbf24" : "#60a5fa";
      return `<div style="padding:8px 0;border-bottom:1px solid #1a1a24;">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <span style="font-size:16px;flex-shrink:0;">${a.tipo === "critico" ? "🚨" : a.tipo === "atencao" ? "⚠️" : "ℹ️"}</span>
          <div>
            <div style="font-size:12px;font-weight:700;color:${cor};">${a.titulo}</div>
            <div style="font-size:11px;color:#a1a1aa;">${a.texto}</div>
            <div style="font-size:10px;color:#3f3f46;margin-top:2px;">${dt}</div>
          </div>
        </div>
      </div>`;
    }).join("");

    bot("info", `🔔 Últimos ${Math.min(alertas.length, 10)} Alertas`, html);
  }

  // ─── Verificação de um item ──────────────────────────────────────────────
  async function _verificarItem(item, primeiraVez = false) {
    try {
      const [sancRes, procRes] = await Promise.allSettled([
        fetchApi("scan_anticorrupcao", { nome: item.nome }),
        fetchApi("datajud_processos",  { nome: item.nome }),
      ]);

      const sancoes   = sancRes.status === "fulfilled" ? sancRes.value   : {};
      const processos = procRes.status === "fulfilled" ? procRes.value   : {};

      const totalSanc = (sancoes?.ceis?.length||0) + (sancoes?.cnep?.length||0) +
                        (sancoes?.ceaf?.length||0)  + (sancoes?.cepim?.length||0);
      const totalProc = processos?.processos?.length || 0;

      const sancAntes = item.lastSancoes;
      const procAntes = item.lastProc;

      item.lastCheck   = Date.now();
      item.lastSancoes = totalSanc;
      item.lastProc    = totalProc;

      // Encontrou nova sanção
      if (!primeiraVez && sancAntes >= 0 && totalSanc > sancAntes) {
        const alerta = {
          ts: Date.now(), lido: false, tipo: "critico",
          titulo: `🚨 Nova sanção detectada — ${item.nome}`,
          texto: `De ${sancAntes} para ${totalSanc} sanção(ões) nas bases oficiais.`,
        };
        alertas.unshift(alerta);
        abrir();
        bot("critico", alerta.titulo, alerta.texto);
        _atualizarBadge();
      }

      // Encontrou novo processo
      if (!primeiraVez && procAntes >= 0 && totalProc > procAntes) {
        const alerta = {
          ts: Date.now(), lido: false, tipo: "atencao",
          titulo: `⚖️ Novo processo judicial — ${item.nome}`,
          texto: `De ${procAntes} para ${totalProc} processo(s) no DataJud (CNJ).`,
        };
        alertas.unshift(alerta);
        abrir();
        bot("atencao", alerta.titulo, alerta.texto);
        _atualizarBadge();
      }

      // Primeira verificação — registra linha de base silenciosamente
      if (primeiraVez) {
        const alerta = {
          ts: Date.now(), lido: false, tipo: "info",
          titulo: `📡 Vigilância iniciada — ${item.nome}`,
          texto: `Linha de base: ${totalSanc} sanção(ões) · ${totalProc} processo(s). Alertarei se houver mudanças.`,
        };
        alertas.unshift(alerta);
        _atualizarBadge();
      }

      _saveStorage();
    } catch (_) { /* silencia erros de rede */ }
  }

  // ─── Verificar todos na lista ────────────────────────────────────────────
  async function verificarTodos(manual = false) {
    if (!watchlist.length) return;
    if (manual) bot("info", "📡 Verificando lista de vigilância...", `Consultando ${watchlist.length} político(s) monitorado(s)...`);

    for (const item of watchlist) {
      await _verificarItem(item, false);
      await new Promise(r => setTimeout(r, 400)); // evita throttling
    }

    if (manual) {
      const naoLidos = alertas.filter(a => !a.lido).length;
      if (naoLidos === 0)
        bot("positivo", "📡 Tudo verificado", "Nenhuma mudança detectada nos políticos monitorados.");
    }
    _atualizarSidebar();
  }

  // ─── Sidebar: bloco de monitoramento ────────────────────────────────────
  function _atualizarSidebar() {
    const sidebar = document.getElementById("hz-agent-sidebar");
    if (!sidebar) return;

    let bloco = document.getElementById("hz-monitor-sidebar");
    if (!bloco) {
      bloco = document.createElement("div");
      bloco.id = "hz-monitor-sidebar";
      bloco.style.cssText = "padding:2px 6px 8px;border-top:1px solid #18181b;flex-shrink:0;";
      sidebar.appendChild(bloco);
    }

    const count = watchlist.length;
    const alertCount = alertas.filter(a => !a.lido).length;

    bloco.innerHTML = `
      <div style="font-size:9px;font-weight:900;color:#3f3f46;text-transform:uppercase;
                  letter-spacing:.08em;padding:10px 6px 6px;">Vigilância</div>
      <button onclick="window.HyperBotMonitor?.listar?.()"
              style="width:100%;padding:8px 10px;background:transparent;border:none;border-radius:8px;
                     color:#71717a;font-size:12px;font-weight:600;cursor:pointer;
                     display:flex;align-items:center;gap:9px;text-align:left;transition:all .12s;"
              onmouseover="this.style.background='#1c1c28';this.style.color='#d4d4d8'"
              onmouseout="this.style.background='transparent';this.style.color='#71717a'">
        <span style="font-size:15px;width:22px;text-align:center;">📡</span>
        <span style="flex:1;">Monitorados (${count})</span>
        ${alertCount > 0 ? `<span style="background:#ef4444;color:#fff;font-size:9px;font-weight:900;
                                         padding:1px 5px;border-radius:999px;">${alertCount}</span>` : ""}
      </button>
      ${count > 0 ? `<button onclick="window.HyperBotMonitor?.mostrarAlertas?.()"
              style="width:100%;padding:8px 10px;background:transparent;border:none;border-radius:8px;
                     color:#71717a;font-size:12px;font-weight:600;cursor:pointer;
                     display:flex;align-items:center;gap:9px;text-align:left;transition:all .12s;"
              onmouseover="this.style.background='#1c1c28';this.style.color='#d4d4d8'"
              onmouseout="this.style.background='transparent';this.style.color='#71717a'">
        <span style="font-size:15px;width:22px;text-align:center;">🔔</span>
        <span>Alertas recentes</span>
      </button>` : ""}`;
  }

  // ─── Inicialização ────────────────────────────────────────────────────────
  function init() {
    _atualizarBadge();

    // Aguarda DOM + outros módulos
    setTimeout(() => {
      _atualizarSidebar();
      // Verificação inicial silenciosa (apenas se já há itens na lista)
      if (watchlist.length > 0) {
        setTimeout(() => verificarTodos(false), 5000);
      }
    }, 2000);

    // Verificação periódica
    setInterval(() => verificarTodos(false), INTERVAL_MS);
  }

  // ─── API pública ─────────────────────────────────────────────────────────
  window.HyperBotMonitor = {
    adicionar,
    remover,
    listar,
    mostrarAlertas,
    verificarTodos,
    get watchlist() { return watchlist; },
    get alertas()   { return alertas; },
  };

  // Inicia após o DOM estar pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
