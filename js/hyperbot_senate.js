/**
 * hyperbot_senate.js — Suporte a Senadores no HyperBot
 * Analisa automaticamente quando um senador é aberto no portal.
 * Depende de: hyperbot.js, hyperbot_osint.js, api.js
 */
(function () {
  "use strict";

  // ── Reutiliza o sistema de output do hyperbot_osint ──────────────────────
  function pushSenFinding(finding, delay) {
    if (window.HyperBotOsint) {
      // Chama internamente via o mesmo mecanismo do osint
      setTimeout(() => {
        const feed = document.getElementById("hyperbot-feed");
        if (!feed) return;
        const empty = document.getElementById("hyperbot-empty");
        if (empty) empty.remove();

        const SEV = {
          info:     { color: "#60a5fa", bg: "#1e3a5f", border: "#1d4ed8", icon: "ℹ️",  label: "Info"    },
          atencao:  { color: "#fbbf24", bg: "#3f2d0a", border: "#d97706", icon: "⚠️",  label: "Atenção" },
          critico:  { color: "#f87171", bg: "#3b0d0d", border: "#dc2626", icon: "🔴",  label: "Crítico" },
          positivo: { color: "#34d399", bg: "#052e16", border: "#166534", icon: "✅",  label: "Normal"  },
        };
        const s = SEV[finding.sev] || SEV.info;
        const html = `<div class="hyperbot-msg mb-3" style="animation:hyperbotSlide .3s ease">
          <div style="display:flex;align-items:flex-start;gap:8px;">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">🤖</div>
            <div style="flex:1;min-width:0;">
              <div style="background:${s.bg};border:1px solid ${s.border};border-radius:12px 12px 12px 2px;padding:10px 12px;">
                <div style="font-size:10px;font-weight:900;color:${s.color};text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px;">${s.icon} ${s.label}</div>
                <div style="font-weight:700;color:#fff;font-size:12px;margin-bottom:2px;">${finding.titulo}</div>
                <div style="color:#d4d4d8;font-size:11px;line-height:1.55;">${finding.texto}</div>
                ${finding.fonte ? `<div style="margin-top:5px;font-size:10px;color:#3f3f46;">📁 ${finding.fonte}</div>` : ""}
              </div>
              <div style="font-size:10px;color:#52525b;margin-top:3px;padding-left:4px;">${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        </div>`;
        feed.insertAdjacentHTML("beforeend", html);
        feed.scrollTop = feed.scrollHeight;
      }, delay || 0);
    }
  }

  function ensureOpen() {
    const panel = document.getElementById("hyperbot-panel");
    if (panel?.classList.contains("hidden-panel")) {
      window.HyperBot?.toggle();
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  Análise do senador aberto
  // ════════════════════════════════════════════════════════════════════════
  async function analisarSenador(senadorId, nomeDisplay) {
    ensureOpen();

    // Limpar mensagens anteriores de contexto diferente
    const feed = document.getElementById("hyperbot-feed");
    if (feed) {
      feed.innerHTML = "";
    }

    pushSenFinding({
      sev: "info",
      titulo: `🏛️ Analisando Senador — ${nomeDisplay}`,
      texto: "Carregando mandatos, comissões, votações e verificando bases de sanções...",
    }, 0);

    try {
      // Buscar detalhes do senador em paralelo
      const [detalhesRes, votacoesRes] = await Promise.allSettled([
        fetchApi("get_senator_details", { id: senadorId }),
        fetchApi("proxy_senado", { endpoint: `senador/${senadorId}/votacoes.json` }),
      ]);

      const detalhes = detalhesRes.status === "fulfilled" ? detalhesRes.value : null;
      const votacoesData = votacoesRes.status === "fulfilled" ? votacoesRes.value : null;

      // ── Perfil básico ────────────────────────────────────────────────────
      // PHP retorna: { detalhes: { IdentificacaoParlamentar, ... }, mandatos: [], comissoes: [], votacoes: [] }
      if (detalhes && !detalhes.erro) {
        const d = detalhes;
        const ident   = d.detalhes?.IdentificacaoParlamentar || d.IdentificacaoParlamentar || {};
        const mandatoAtual = (Array.isArray(d.mandatos) ? d.mandatos[0] : d.mandatos) || {};
        const nascim   = ident.DataNascimento || null;
        const idade    = nascim ? ((new Date() - new Date(nascim)) / (365.25 * 24 * 3600 * 1000)) | 0 : null;
        const partido  = ident.SiglaPartidoParlamentar || mandatoAtual.SiglaPartidoParlamentar || "–";
        const uf       = ident.UfParlamentar || mandatoAtual.UfParlamentar || "–";
        const situacao = mandatoAtual.DescricaoParticipacao || ident.DescricaoParticipacao || "Em exercício";
        const email    = ident.EmailParlamentar || "–";
        const comissoes = Array.isArray(d.comissoes) ? d.comissoes : [];

        pushSenFinding({
          sev: "info",
          titulo: `🏛️ ${nomeDisplay} — ${partido}/${uf}`,
          texto: `${idade ? idade + " anos · " : ""}${situacao}<br>
                  E-mail: <a href="mailto:${email}" style="color:#60a5fa;">${email}</a><br>
                  ${comissoes.length ? `Comissões: <strong>${comissoes.slice(0,3).map(c => c.Nome || c.SiglaComissao || String(c)).join(", ")}</strong>` : ""}`,
          fonte: "Senado Federal API",
        }, 800);

        // ── Análise de votações (usa dados já normalizados do get_senator_details) ──
        // votacoesData é do proxy_senado (raw), mas d.votacoes já é normalizado pelo PHP
        const votacoes = (Array.isArray(d.votacoes) && d.votacoes.length > 0)
          ? d.votacoes
          : votacoesData?.VotacaoParlamentar?.Parlamentar?.Votacoes?.Votacao
          || votacoesData?.votacoes || [];

        const votArray = Array.isArray(votacoes) ? votacoes : [votacoes];

        if (votArray.length >= 5) {
          const sim = votArray.filter(v =>
            (v.DescricaoVoto || v.tipoVoto || "").toLowerCase() === "sim"
          ).length;
          const nao = votArray.filter(v =>
            (v.DescricaoVoto || v.tipoVoto || "").toLowerCase() === "não"
          ).length;
          const abs = votArray.filter(v =>
            /(absten|ausente)/i.test(v.DescricaoVoto || v.tipoVoto || "")
          ).length;
          const total  = votArray.length;
          const presencaPct = (((sim + nao) / total) * 100).toFixed(0);
          const absPct = ((abs / total) * 100).toFixed(0);

          const sev = parseInt(presencaPct) < 60 ? "critico" : parseInt(presencaPct) < 75 ? "atencao" : "positivo";
          pushSenFinding({
            sev,
            titulo: `🗳️ ${presencaPct}% de presença nas votações (${total} analisadas)`,
            texto: `✅ SIM: <strong>${sim}</strong> · ❌ NÃO: <strong>${nao}</strong> · ⚫ Abstenções: <strong>${abs}</strong><br>` +
                   `${parseInt(presencaPct) < 75 ? `<span style="color:#f87171">Presença abaixo do limite de 75%.</span>` : "Participação regular."}` +
                   `${parseInt(absPct) >= 25 ? `<br><span style="color:#fbbf24">⚠️ Alto índice de abstenções: ${absPct}%</span>` : ""}`,
            fonte: "Senado Federal / Votações",
          }, 1600);
        } else if (votArray.length > 0) {
          pushSenFinding({ sev: "info", titulo: `🗳️ ${votArray.length} votação(ões) encontrada(s)`, texto: "Amostra insuficiente para análise de padrão (mínimo: 5 votações).", fonte: "Senado Federal" }, 1600);
        }

        // ── Verificar sanções ────────────────────────────────────────────
        pushSenFinding({ sev: "info", titulo: `🔍 Verificando ${nomeDisplay} nas bases de sanções...`, texto: "CEIS · CNEP · CEAF · PEP" }, 2400);

        try {
          const scan = await fetchApi("scan_anticorrupcao", { nome: nomeDisplay });
          const total = (scan.ceis?.length || 0) + (scan.cnep?.length || 0) + (scan.ceaf?.length || 0);

          if (total > 0) {
            pushSenFinding({
              sev: "critico",
              titulo: `🚨 ${total} sanção(ões) encontrada(s)!`,
              texto: `CEIS: ${scan.ceis?.length || 0} · CNEP: ${scan.cnep?.length || 0} · CEAF: ${scan.ceaf?.length || 0}`,
              acao: "Abrir Radar Anti-Corrupção",
              fonte: "Portal Transparência",
            }, 3200);
          } else {
            pushSenFinding({
              sev: "positivo",
              titulo: "Sem sanções nas bases oficiais",
              texto: `${nomeDisplay} não consta em CEIS, CNEP ou CEAF.`,
              fonte: "Portal Transparência",
            }, 3200);
          }

          // PEP
          if ((scan.pep?.length || 0) > 0) {
            pushSenFinding({
              sev: "info",
              titulo: "ℹ️ Registrado como PEP (esperado para senadores em exercício)",
              texto: "Pessoas Expostas Politicamente têm suas transações monitoradas com rigor adicional.",
              fonte: "Portal Transparência / PEP",
            }, 4000);
          }
        } catch (_) {}

      } else {
        pushSenFinding({ sev: "atencao", titulo: "Dados do senador indisponíveis", texto: "Não foi possível carregar os detalhes do perfil neste momento." }, 800);
      }
    } catch (err) {
      pushSenFinding({ sev: "atencao", titulo: "Erro ao analisar senador", texto: "Falha ao carregar os dados. Verifique sua conexão e tente novamente." }, 800);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  //  Método público no HyperBot
  // ══════════════════════════════════════════════════════════════════════
  if (window.HyperBot) {
    window.HyperBot.onSenatorOpen = function (senadorId, nomeDisplay) {
      analisarSenador(senadorId, nomeDisplay);
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  //  Hook na função openSenatorDetails de senadores.js
  // ══════════════════════════════════════════════════════════════════════
  function hookSenatorOpen() {
    const original = window.openSenatorDetails;
    if (!original || original._senHooked) return;

    window.openSenatorDetails = async function (id) {
      const result = await original.apply(this, arguments);

      // Tenta capturar o senador atual após carregamento
      setTimeout(() => {
        const senEl = document.querySelector("#senator-modal .senator-nome, #senatorModal h2, [data-senator-nome]");
        const nome  = senEl?.textContent?.trim() ||
                      window._currentSenador?.nome ||
                      window._currentSenador?.IdentificacaoParlamentar?.NomeParlamentar ||
                      `Senador ID ${id}`;
        analisarSenador(id, nome);
      }, 1000);

      return result;
    };
    window.openSenatorDetails._senHooked = true;
  }

  // ── Inicialização ────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    // Espera senadores.js carregar antes de hookear
    const waitSenate = setInterval(() => {
      if (typeof openSenatorDetails !== "undefined") {
        hookSenatorOpen();
        clearInterval(waitSenate);
      }
    }, 500);

    // Timeout de segurança: 10s
    setTimeout(() => clearInterval(waitSenate), 10000);
  });

  // Expor publicamente
  window.HyperBotSenate = { analisarSenador };
})();
