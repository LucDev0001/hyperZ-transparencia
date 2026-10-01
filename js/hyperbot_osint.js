/**
 * hyperbot_osint.js — Módulo OSINT do HyperBot
 * Investigações avançadas: CPF, CNPJ, nome, notícias, processos judiciais, busca de deputados.
 * Depende de: hyperbot.js, hyperbot_chat.js, api.js (fetchApi)
 */
(function () {
  "use strict";

  // ── Registry de handlers de ação para findings ──────────────────────────
  const _findingHandlers = [];

  // ── Atalho: delega para hyperbot_chat.js que já tem a UI correta ─────────
  function pushFinding(finding, delay) {
    // Encaminha para pushBotMsg do hyperbot_chat.js (mantém formatação unificada)
    if (window.HyperBotChat?.pushBotMsg) {
      const opts = {};
      if (finding.acao) {
        opts.acao  = finding.acao;
        // Registrar handler com índice seguro (sem serializar função em HTML)
        const idx  = _findingHandlers.length;
        _findingHandlers.push(finding.aacao || null);
        opts.aacao = () => { const fn = _findingHandlers[idx]; if (typeof fn === "function") fn(); };
      }
      opts.delay = delay || 0;
      setTimeout(() => {
        window.HyperBotChat.pushBotMsg(finding.sev, finding.titulo, finding.texto, opts);
      }, delay || 0);
      return;
    }

    // Fallback: injeta diretamente no feed (quando hyperbot_chat.js ainda não carregou)
    setTimeout(() => {
      const feed = document.getElementById("hyperbot-feed");
      if (!feed) return;
      document.getElementById("hyperbot-empty")?.remove();

      const SEV_MAP = {
        info:     { color: "#60a5fa", bg: "#0c1829", border: "#1e3a5f", icon: "ℹ️",  label: "Info"    },
        atencao:  { color: "#fbbf24", bg: "#1c1200", border: "#92400e", icon: "⚠️",  label: "Atenção" },
        critico:  { color: "#f87171", bg: "#1c0505", border: "#7f1d1d", icon: "🚨",  label: "Crítico" },
        positivo: { color: "#34d399", bg: "#021d0e", border: "#14532d", icon: "✅",  label: "Ok"      },
      };
      const s = SEV_MAP[finding.sev] || SEV_MAP.info;

      let acaoHtml = "";
      if (finding.acao) {
        const idx = _findingHandlers.length;
        _findingHandlers.push(finding.aacao || null);
        acaoHtml = `<button onclick="window.HyperBotOsint._runFinding(${idx})"
          style="margin-top:8px;font-size:12px;font-weight:700;padding:6px 14px;
                 border-radius:8px;border:1px solid ${s.border};background:${s.bg};
                 color:${s.color};cursor:pointer;">${finding.acao} →</button>`;
      }

      const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const wrapper = document.createElement("div");
      wrapper.className = "hyperbot-msg";
      wrapper.style.cssText = "padding:4px 0 8px;max-width:760px;margin:0 auto;animation:hyperbotSlide .25s ease;";
      wrapper.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                      display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🤖</div>
          <div style="flex:1;min-width:0;">
            <div style="background:${s.bg};border:1px solid ${s.border};border-radius:16px 16px 16px 4px;padding:14px 16px;">
              <div style="font-size:11px;font-weight:800;color:${s.color};
                          text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">${s.icon} ${s.label}</div>
              <div style="font-weight:700;color:#f4f4f5;font-size:14px;line-height:1.4;margin-bottom:6px;">${finding.titulo}</div>
              <div style="color:#a1a1aa;font-size:13px;line-height:1.7;">${finding.texto}</div>
              ${acaoHtml}
              ${finding.fonte ? `<div style="margin-top:8px;font-size:11px;color:#52525b;">📁 ${finding.fonte}</div>` : ""}
            </div>
            <div style="font-size:11px;color:#3f3f46;margin-top:4px;">${hora}</div>
          </div>
        </div>`;
      feed.appendChild(wrapper);
      feed.scrollTop = feed.scrollHeight;
    }, delay || 0);
  }

  // ── Garante que o painel está aberto ────────────────────────────────────
  function ensureOpen() {
    const panel = document.getElementById("hyperbot-panel");
    if (panel?.classList.contains("hidden-panel")) {
      window.HyperBot?.toggle();
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  1. SCAN CPF
  // ════════════════════════════════════════════════════════════════════════
  async function scanCPF(cpf, nomeRaw) {
    ensureOpen();
    const cpfMasked = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    pushFinding({ sev: "info", titulo: `🔍 Investigando CPF ${cpfMasked}`, texto: "Consultando bases CNEP, CEIS, CEAF, CEPIM e PEP simultaneamente..." }, 0);

    try {
      const [scanData, beneficiosData] = await Promise.allSettled([
        fetchApi("scan_anticorrupcao", { cpf }),
        fetchApi("check_beneficios_sociais", { cpf }),
      ]);

      const scan = scanData.status === "fulfilled" ? scanData.value : {};
      const bens = beneficiosData.status === "fulfilled" ? beneficiosData.value : {};

      // Sanções
      const totalSancoes =
        (scan.cnep?.length || 0) + (scan.ceis?.length || 0) +
        (scan.ceaf?.length || 0) + (scan.cepim?.length || 0);

      if (totalSancoes > 0) {
        const lista = [
          scan.ceis?.length  ? `CEIS: <strong>${scan.ceis.length}</strong> registro(s)` : null,
          scan.cnep?.length  ? `CNEP: <strong>${scan.cnep.length}</strong> registro(s)` : null,
          scan.ceaf?.length  ? `CEAF: <strong>${scan.ceaf.length}</strong> registro(s)` : null,
          scan.cepim?.length ? `CEPIM: <strong>${scan.cepim.length}</strong> registro(s)` : null,
        ].filter(Boolean).join(" · ");

        pushFinding({ sev: "critico", titulo: `🚨 ${totalSancoes} sanção(ões) encontrada(s)!`, texto: lista, acao: "Ver Ranking Completo", aacao: () => window.HyperBotAgent?.processarMensagem?.("ranking suspeitos"), fonte: "Portal Transparência" }, 1200);
      } else {
        pushFinding({ sev: "positivo", titulo: "Sem sanções nas bases oficiais", texto: `CPF ${cpfMasked} não consta em CEIS, CNEP, CEAF ou CEPIM.`, fonte: "Portal Transparência" }, 1200);
      }

      // PEP
      if ((scan.pep?.length || 0) > 0) {
        const pepItem = scan.pep[0];
        pushFinding({ sev: "atencao", titulo: "⚠️ Consta como PEP — Pessoa Exposta Politicamente", texto: `Cargo: <strong>${pepItem.descricaoFuncao || pepItem.cargo || "Não informado"}</strong><br>Órgão: ${pepItem.orgao || pepItem.nomeOrgao || "Não informado"}`, fonte: "Portal Transparência / PEP" }, 2000);
      }

      // Benefícios sociais
      if (bens && !bens.erro) {
        const bensList = [
          bens.bolsa_familia      ? `Bolsa Família: <strong>R$ ${parseFloat(bens.bolsa_familia.valor || 0).toLocaleString("pt-BR", {minimumFractionDigits:2})}</strong>` : null,
          bens.bpc                ? `BPC: <strong>${bens.bpc}</strong>` : null,
          bens.seguro_desemprego  ? `Seguro-Desemprego: <strong>${bens.seguro_desemprego}</strong>` : null,
        ].filter(Boolean);

        if (bensList.length > 0) {
          pushFinding({ sev: "info", titulo: "📋 Benefícios sociais vinculados", texto: bensList.join("<br>"), fonte: "Portal Transparência / Benefícios" }, 2800);
        }
      }
    } catch (err) {
      pushFinding({ sev: "atencao", titulo: "Erro ao consultar CPF", texto: "Não foi possível completar a investigação. Tente novamente." }, 800);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  2. SCAN CNPJ
  // ════════════════════════════════════════════════════════════════════════
  function scanCNPJ(cnpj, nomeFornecedor) {
    ensureOpen();
    // Delega para o investigarFornecedorProfundo do hyperbot.js principal
    if (window.HyperBot?.investigarFornecedorProfundo) {
      window.HyperBot.investigarFornecedorProfundo(cnpj, nomeFornecedor || cnpj);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  3. BUSCAR NOTÍCIAS DO DEPUTADO
  // ════════════════════════════════════════════════════════════════════════
  async function buscarNoticias(depId, nome) {
    ensureOpen();
    pushFinding({ sev: "info", titulo: `📰 Buscando notícias sobre ${nome}`, texto: "Consultando fontes de notícias relacionadas ao parlamentar..." }, 0);

    try {
      const data = await fetchApi("noticias_deputado", { id: depId, nome });

      if (data.erro || !data.noticias?.length) {
        pushFinding({ sev: "info", titulo: "Nenhuma notícia recente encontrada", texto: `Não foram encontradas notícias recentes para "${nome}" no momento.` }, 800);
        return;
      }

      const top = data.noticias.slice(0, 5);
      const html = top.map((n) => {
        const titulo = n.titulo || n.title || "Sem título";
        const veiculo = n.veiculo || n.source || n.fonte || "";
        const url = n.url || n.link || "#";
        const data_pub = n.dataPublicacao || n.publishedAt || n.data || "";
        const resumo = (n.resumo || n.description || n.descricao || "").substring(0, 100);
        return `• <a href="${url}" target="_blank" rel="noopener" style="color:#60a5fa;font-weight:700;">${titulo.substring(0, 70)}</a>` +
               (veiculo ? ` <span style="color:#52525b;">(${veiculo})</span>` : "") +
               (resumo ? `<br><span style="color:#a1a1aa;font-size:10px;">${resumo}...</span>` : "");
      }).join("<br><br>");

      const tom = data.analise_tom || null;
      const sevTom = tom === "negativo" ? "atencao" : tom === "positivo" ? "positivo" : "info";

      pushFinding({
        sev: sevTom,
        titulo: `📰 ${top.length} notícia(s) encontrada(s)${tom ? ` — Tom: ${tom}` : ""}`,
        texto: html,
        fonte: "Notícias agregadas",
      }, 800);
    } catch (err) {
      pushFinding({ sev: "atencao", titulo: "Erro ao buscar notícias", texto: "Não foi possível carregar as notícias. Verifique sua conexão." }, 800);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  4. BUSCAR PROCESSOS JUDICIAIS (DataJud / CNJ)
  // ════════════════════════════════════════════════════════════════════════
  async function buscarProcessos(nome) {
    ensureOpen();
    pushFinding({ sev: "info", titulo: `⚖️ Buscando processos judiciais — ${nome}`, texto: "Consultando DataJud (CNJ) — base nacional de processos judiciais..." }, 0);

    try {
      const data = await fetchApi("datajud_processos", { nome });

      if (data.erro || !data.processos?.length) {
        pushFinding({ sev: "positivo", titulo: "Nenhum processo judicial encontrado", texto: `Não foram encontrados processos no DataJud (CNJ) para "${nome}".`, fonte: "CNJ / DataJud" }, 800);
        return;
      }

      const processos = data.processos.slice(0, 6);
      const criticos = processos.filter((p) =>
        /corrup|improbidade|peculato|lavagem|fraude/i.test(
          (p.classe || "") + (p.assuntos || []).join(" ") + (p.assunto || "")
        )
      );

      const html = processos.map((p) => {
        const numero = p.numeroProcesso || p.numero || "Nº não informado";
        const classe = p.classe || p.classeProcessual || "–";
        const tribunal = p.tribunal || p.orgaoJulgador || "–";
        const assunto = (Array.isArray(p.assuntos) ? p.assuntos : [p.assunto]).filter(Boolean).join(", ") || "–";
        const status = p.situacao || p.fase || "";
        const alerta = /corrup|improbidade|peculato|lavagem|fraude/i.test(classe + assunto)
          ? ' <span style="color:#f87171;font-weight:700;">⚠️ GRAVE</span>' : "";
        const partesHtml = (p.partes || []).map(pt => pt.nome).filter(Boolean).join(" · ");
        return `• <strong>${numero}</strong>${alerta}<br>
                <span style="color:#a1a1aa;font-size:10px;">${tribunal} · ${classe}${status ? " · " + status : ""}</span><br>
                <span style="color:#71717a;font-size:10px;">Assunto: ${assunto.substring(0, 60)}</span>` +
               (partesHtml ? `<br><span style="color:#52525b;font-size:10px;">Partes: ${partesHtml.substring(0, 80)}</span>` : "");
      }).join("<br><br>");

      pushFinding({
        sev: criticos.length > 0 ? "critico" : "atencao",
        titulo: `⚖️ ${data.processos.length} processo(s) encontrado(s)${criticos.length ? ` — ${criticos.length} GRAVE(S)` : ""}`,
        texto: html + (data.processos.length > 6 ? `<br><span style="color:#71717a;font-size:10px;">... e mais ${data.processos.length - 6} processo(s)</span>` : ""),
        fonte: "CNJ / DataJud",
      }, 800);
    } catch (err) {
      pushFinding({ sev: "atencao", titulo: "Erro ao consultar DataJud", texto: "Não foi possível acessar a base de processos do CNJ. Tente novamente." }, 800);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  5. BUSCAR DEPUTADO — mostra perfil inline no chat (sem trocar de aba)
  // ════════════════════════════════════════════════════════════════════════
  async function buscarDeputado(nome) {
    ensureOpen();
    pushFinding({ sev: "info", titulo: `👔 Buscando "${nome}"...`, texto: "Consultando deputados federais ativos na Câmara..." }, 0);

    try {
      const data = await fetchApi("proxy_camara", {
        endpoint: `deputados?nome=${encodeURIComponent(nome)}&ordem=ASC&ordenarPor=nome`,
      });
      const lista = data?.dados || [];

      if (lista.length === 0) {
        pushFinding({
          sev: "info",
          titulo: "Nenhum deputado encontrado",
          texto: `Não encontrei deputados ativos com o nome "${nome}".<br>Verifique a grafia ou tente apenas o sobrenome.`,
        }, 800);
        return;
      }

      // Um único resultado — carrega e exibe perfil completo inline
      if (lista.length === 1) {
        await _exibirPerfilDeputado(lista[0]);
        return;
      }

      // Múltiplos — chips de seleção (usa _chipHandlers via HyperBotAgent)
      const MAX = 6;
      const slice = lista.slice(0, MAX);

      // Registra handlers no HyperBotAgent._runChip
      const chipHandlers = window.HyperBotAgent?._chipHandlers;
      if (chipHandlers) {
        const chips = slice.map(d => ({
          emoji: "👔",
          label: `${d.nome} (${d.siglaPartido}/${d.siglaUf})`,
          acao:  () => _exibirPerfilDeputado(d),
        }));
        window.HyperBotAgent?.mostrarChips?.(chips);

        pushFinding({
          sev: "info",
          titulo: `${lista.length} deputado(s) encontrado(s) — escolha um:`,
          texto:  `Clique no nome para ver o perfil completo aqui no chat.` +
                  (lista.length > MAX ? `<br><span style="color:#71717a;font-size:11px;">Mostrando ${MAX} de ${lista.length}</span>` : ""),
        }, 300);
      } else {
        // Fallback simples sem chips
        const html = slice.map(d =>
          `• <strong>${d.nome}</strong> <span style="color:#52525b;">(${d.siglaPartido}/${d.siglaUf})</span>`
        ).join("<br>");
        pushFinding({ sev: "info", titulo: `${lista.length} resultado(s) para "${nome}"`, texto: html }, 800);
      }
    } catch {
      pushFinding({ sev: "atencao", titulo: "Erro ao buscar deputado", texto: "Não foi possível consultar a lista. Tente novamente." }, 800);
    }
  }

  // Exibe card de perfil completo do deputado no feed e define _currentDeputy
  async function _exibirPerfilDeputado(depBasico) {
    pushFinding({ sev: "info", titulo: `⏳ Carregando perfil de ${depBasico.nome}...`, texto: "Buscando detalhes completos..." }, 200);

    try {
      // Busca detalhes completos
      const det = await fetchApi("proxy_camara", { endpoint: `deputados/${depBasico.id}` });
      const d   = det?.dados || depBasico;

      // Define como deputado ativo no contexto global
      window._currentDeputy = d;
      window.HyperBot?.onDeputyOpen?.(d);

      const status  = d.ultimoStatus || {};
      const partido = status.siglaPartido || depBasico.siglaPartido || "–";
      const uf      = status.siglaUf      || depBasico.siglaUf      || "–";
      const cargo   = status.descricaoStatus || "Deputado(a) Federal";
      const situacao = status.situacao || "Ativo";
      const foto    = status.urlFoto || d.urlFoto || "";
      const email   = status.email || d.email || "";
      const gabinete = status.gabinete?.nome || "";

      const fotoHtml = foto
        ? `<img src="${foto}" alt="${d.nomeCivil}"
               style="width:60px;height:60px;border-radius:50%;object-fit:cover;
                      border:2px solid #7c3aed;flex-shrink:0;"
               onerror="this.style.display='none'">`
        : `<div style="width:60px;height:60px;border-radius:50%;background:#1e1333;
                       border:2px solid #7c3aed;display:flex;align-items:center;
                       justify-content:center;font-size:28px;flex-shrink:0;">👔</div>`;

      const html = `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
          ${fotoHtml}
          <div>
            <div style="font-size:16px;font-weight:900;color:#f4f4f5;">${d.nomeCivil || d.nome}</div>
            <div style="font-size:12px;color:#a78bfa;font-weight:700;">${partido} · ${uf}</div>
            <div style="font-size:11px;color:#71717a;margin-top:2px;">${cargo}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
          ${[
            ["🏛️ Partido", partido],
            ["📍 Estado",   uf],
            ["📋 Situação", situacao],
            ["🏢 Gabinete", gabinete || "–"],
          ].map(([k, v]) =>
            `<div style="background:#0f1629;border-radius:7px;padding:7px 10px;">
               <div style="font-size:10px;color:#52525b;">${k}</div>
               <div style="font-size:12px;color:#d4d4d8;font-weight:700;">${v}</div>
             </div>`
          ).join("")}
        </div>
        ${email ? `<div style="font-size:11px;color:#52525b;margin-bottom:4px;">✉️ ${email}</div>` : ""}
        <div style="font-size:11px;color:#374151;border-top:1px solid #1a1a24;padding-top:8px;margin-top:4px;">
          ✅ Deputado carregado. Use os botões abaixo para investigar.
        </div>`;

      pushFinding({ sev: "positivo", titulo: `👔 ${status.nomeEleitoral || d.nomeCivil || d.nome}`, texto: html }, 300);

      // Chips de ação imediata
      setTimeout(() => {
        window.HyperBotAgent?.mostrarChips?.([
          { emoji: "💰", label: "Gastos CEAP",          acao: () => window.HyperBotAgent.processarMensagem("gastos") },
          { emoji: "🗳️", label: "Votações",              acao: () => window.HyperBotAgent.processarMensagem("votações") },
          { emoji: "🔍", label: "Verificar sanções",    acao: () => window.HyperBotAgent.processarMensagem("verificar corrupção") },
          { emoji: "⚖️", label: "Processos judiciais",  acao: () => window.HyperBotAgent.processarMensagem("processos judiciais") },
          { emoji: "📰", label: "Notícias",              acao: () => window.HyperBotAgent.processarMensagem("notícias") },
          { emoji: "🕵️", label: "Dossiê completo",      acao: () => window.HyperBotAgent.processarMensagem("investigação completa") },
        ]);
      }, 700);
    } catch {
      pushFinding({ sev: "atencao", titulo: "Erro ao carregar perfil", texto: "Não foi possível buscar os detalhes. Tente novamente." }, 400);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  6. OSINT SEARCH (busca unificada)
  // ════════════════════════════════════════════════════════════════════════
  async function osintSearch(query) {
    ensureOpen();
    pushFinding({ sev: "info", titulo: `🔎 Pesquisando: "${query}"`, texto: "Consultando múltiplas fontes de dados públicos..." }, 0);

    try {
      const data = await fetchApi("osint_search", { q: query });

      if (data.erro) {
        pushFinding({ sev: "atencao", titulo: "Busca sem resultados", texto: data.erro }, 800);
        return;
      }

      // Entidades encontradas
      const entidades = data.entidades || [];
      if (entidades.length > 0) {
        entidades.slice(0, 3).forEach((e, i) => {
          if (e.tipo === "empresa") {
            pushFinding({
              sev: (e.situacao || "").toUpperCase().includes("ATIVA") ? "info" : "atencao",
              titulo: `🏢 ${e.razao_social}`,
              texto: `<span style="color:${(e.situacao||"").toUpperCase().includes("ATIVA") ? "#34d399" : "#f87171"};">● ${e.situacao || "?"}</span><br>` +
                     `Município: <strong>${e.municipio || "–"}</strong><br>` +
                     `Abertura: ${e.abertura || "–"} · Atividade: ${e.atividade || "–"}<br>` +
                     (e.socios?.length ? `Sócios: ${e.socios.map(s => s.nome_socio || s.nome).join(", ")}` : ""),
              fonte: "BrasilAPI / CNPJ",
            }, 800 + i * 600);
          } else if (e.tipo === "deputado" || e.tipo === "senador") {
            pushFinding({
              sev: "info",
              titulo: `👔 ${e.nome} — ${e.siglaPartido || ""}/${e.siglaUf || ""}`,
              texto: `${e.tipo === "deputado" ? "Deputado Federal" : "Senador"}<br>
                      <button onclick="window.HyperBotOsint?.exibirPerfilDeputado?.({id:${e.id},nome:'${(e.nome||"").replace(/'/g,"")}'});"
                              style="background:none;border:none;color:#a78bfa;cursor:pointer;font-size:11px;font-weight:700;">
                        Ver perfil no chat →
                      </button>`,
              fonte: "Câmara dos Deputados",
            }, 800 + i * 600);
          }
        });
      }

      // Sanções
      if ((data.sancoes || []).length > 0) {
        pushFinding({
          sev: "critico",
          titulo: `🚨 ${data.sancoes.length} sanção(ões) encontrada(s)`,
          texto: data.sancoes.slice(0, 3).map(s =>
            `• <strong>${s.nomeSancionado || s.razaoSocial || "–"}</strong> — ${s.tipoSancao || s.tipo || "Sanção"}`
          ).join("<br>"),
          fonte: "CEIS / Portal Transparência",
        }, 1500);
      }

      // Contratos
      if ((data.contratos || []).length > 0) {
        const totalValor = data.contratos.reduce((a, c) => a + parseFloat(c.valorInicialCompra || c.valor || 0), 0);
        pushFinding({
          sev: "info",
          titulo: `📄 ${data.contratos.length} contrato(s) federal(is) — R$ ${totalValor.toLocaleString("pt-BR", {minimumFractionDigits:2})}`,
          texto: data.contratos.slice(0, 3).map(c =>
            `• ${(c.objeto || c.descricao || "Contrato").substring(0, 60)} — R$ ${parseFloat(c.valorInicialCompra || c.valor || 0).toLocaleString("pt-BR", {minimumFractionDigits:2})}`
          ).join("<br>"),
          fonte: "Portal Transparência / Contratos",
        }, 2200);
      }

      // Sugestões de ação
      if ((data.sugestoes || []).length > 0) {
        pushFinding({
          sev: "info",
          titulo: "💡 Sugestões de investigação",
          texto: data.sugestoes.map(s => `• ${s}`).join("<br>"),
        }, 3000);
      }

      // Se não encontrou nada relevante
      if (entidades.length === 0 && (data.sancoes || []).length === 0 && (data.contratos || []).length === 0) {
        pushFinding({ sev: "info", titulo: "Busca concluída sem achados específicos", texto: `A pesquisa por "${query}" não retornou entidades, sanções ou contratos identificáveis. Tente um nome completo, CNPJ (14 dígitos) ou CPF.` }, 800);
      }
    } catch (err) {
      pushFinding({ sev: "atencao", titulo: "Erro na busca OSINT", texto: "Não foi possível completar a pesquisa. Tente novamente." }, 800);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  7. INTELLIGENCE REPORT COMPLETO (nome + cpf + cnpj)
  // ════════════════════════════════════════════════════════════════════════
  async function osintIntelligence(params) {
    ensureOpen();
    const { nome, cpf, cnpj } = params || {};
    const identificador = nome || cpf || cnpj || "alvo";

    pushFinding({ sev: "info", titulo: `🕵️ Intelligence Report — ${identificador}`, texto: "Gerando dossiê completo: sanções · contratos · processos · patrimônio · benefícios · servidores..." }, 0);

    try {
      const data = await fetchApi("osint_intelligence", params);

      if (data.erro) {
        pushFinding({ sev: "atencao", titulo: "Relatório indisponível", texto: data.erro }, 800);
        return;
      }

      // Score de risco
      const score = data.score_risco || data.score || 0;
      const sevScore = score >= 70 ? "critico" : score >= 40 ? "atencao" : score < 20 ? "positivo" : "info";
      pushFinding({
        sev: sevScore,
        titulo: `📊 Score de Risco: ${score}/100`,
        texto: `Nível: <strong style="color:${score >= 70 ? "#f87171" : score >= 40 ? "#fbbf24" : "#34d399"}">${score >= 70 ? "ALTO" : score >= 40 ? "MÉDIO" : "BAIXO"}</strong><br>` +
               `Fatores: ${(data.fatores_risco || []).join(", ") || "Sem alertas"}`,
        fonte: "HyperZ Intelligence Engine",
      }, 800);

      // Alertas específicos
      const alertas = data.alertas || [];
      alertas.slice(0, 5).forEach((a, i) => {
        pushFinding({
          sev: a.nivel === "alto" ? "critico" : a.nivel === "medio" ? "atencao" : "info",
          titulo: a.titulo || "Alerta",
          texto: a.descricao || "",
          fonte: a.fonte || "",
        }, 1500 + i * 700);
      });
    } catch (err) {
      pushFinding({ sev: "atencao", titulo: "Erro no Intelligence Report", texto: "Não foi possível gerar o relatório completo. Tente buscar por partes." }, 800);
    }
  }

  // ── Exportar módulo ──────────────────────────────────────────────────────
  window.HyperBotOsint = {
    scanCPF,
    scanCNPJ,
    buscarNoticias,
    buscarProcessos,
    buscarDeputado,
    exibirPerfilDeputado: _exibirPerfilDeputado,
    osintSearch,
    osintIntelligence,
    _runFinding(idx) {
      const fn = _findingHandlers[idx];
      if (typeof fn === "function") fn();
    },
  };
})();
