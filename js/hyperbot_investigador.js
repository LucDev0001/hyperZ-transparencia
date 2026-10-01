/**
 * hyperbot_investigador.js — Dossiê Completo Automatizado
 *
 * Executa uma investigação em 6 frentes em paralelo e gera um dossiê
 * estruturado com Score de Risco (0–100) transparente, sem IA, apenas
 * com dados oficiais do Governo Federal.
 *
 * Frentes:
 *  1. Dados básicos (Câmara dos Deputados)
 *  2. Sanções — CEIS · CNEP · CEAF · CEPIM · PEP
 *  3. Processos judiciais — DataJud (CNJ)
 *  4. Patrimônio TSE 2018 vs 2022 (enriquecimento no mandato)
 *  5. Financiamento de campanha 2022 (top doadores × contratos)
 *  6. Gastos CEAP — concentração de fornecedores
 *
 * Expõe: window.HyperBotInvestigador
 */
(function () {
  "use strict";

  // ─── helpers ────────────────────────────────────────────────────────────
  function bot(sev, titulo, texto, opts) {
    window.HyperBotChat?.pushBotMsg?.(sev, titulo, texto, opts);
  }
  function chips(list) {
    window.HyperBotAgent?.mostrarChips?.(list);
  }
  const fmt = (v) =>
    "R$ " + parseFloat(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const fmtK = (v) => {
    const n = parseFloat(v || 0);
    return n >= 1e9 ? `R$ ${(n/1e9).toFixed(1)}B`
         : n >= 1e6 ? `R$ ${(n/1e6).toFixed(1)}M`
         : n >= 1e3 ? `R$ ${(n/1e3).toFixed(0)}K`
         : fmt(n);
  };

  // ─── Score de Risco ──────────────────────────────────────────────────────
  function calcularScore(sancoes, processos, desp, patrimonioVar, doadores) {
    let pts = 0;
    const fatores = [];

    // 1. Sanções (max 35 pts)
    const totSancoes =
      (sancoes?.ceis?.length || 0) + (sancoes?.cnep?.length || 0) +
      (sancoes?.ceaf?.length || 0) + (sancoes?.cepim?.length || 0);
    if (totSancoes > 0) {
      const p = Math.min(35, totSancoes * 12);
      pts += p;
      fatores.push({ desc: `${totSancoes} sanção(ões) em bases oficiais (CEIS/CNEP/CEAF/CEPIM)`, pts: p, icon: "🚨" });
    }
    if ((sancoes?.pep?.length || 0) > 0) {
      const p = 5;
      pts += p;
      fatores.push({ desc: "Consta como PEP — Pessoa Exposta Politicamente", pts: p, icon: "⚠️" });
    }

    // 2. Processos graves (max 30 pts)
    const graves = (processos?.processos || []).filter(p =>
      /corrup|improbidade|peculato|lavagem|fraude/i.test(
        (p.classe || "") + (p.assuntos || []).join(" ")
      )
    ).length;
    const totProc = processos?.processos?.length || 0;
    if (graves > 0) {
      const p = Math.min(30, graves * 15);
      pts += p;
      fatores.push({ desc: `${graves} processo(s) grave(s): corrupção · improbidade · peculato`, pts: p, icon: "🔴" });
    } else if (totProc > 0) {
      const p = Math.min(10, totProc * 2);
      pts += p;
      fatores.push({ desc: `${totProc} processo(s) judicial(is) encontrado(s) no DataJud`, pts: p, icon: "⚖️" });
    }

    // 3. Enriquecimento patrimonial (max 20 pts)
    if (patrimonioVar > 2_000_000) {
      pts += 20;
      fatores.push({ desc: `Patrimônio cresceu ${fmtK(patrimonioVar)} durante o mandato`, pts: 20, icon: "💰" });
    } else if (patrimonioVar > 500_000) {
      pts += 12;
      fatores.push({ desc: `Patrimônio cresceu ${fmtK(patrimonioVar)} durante o mandato`, pts: 12, icon: "💰" });
    }

    // 4. Concentração de fornecedor CEAP (max 15 pts)
    if (desp.length > 5) {
      const total = desp.reduce((a, c) => a + parseFloat(c.valorLiquido || 0), 0);
      const porForn = {};
      desp.forEach(e => {
        const k = e.cnpjCpfFornecedor || e.nomeFornecedor || "–";
        porForn[k] = (porForn[k] || 0) + parseFloat(e.valorLiquido || 0);
      });
      const max1 = Math.max(...Object.values(porForn));
      const pct1 = total > 0 ? (max1 / total) * 100 : 0;
      if (pct1 >= 85) {
        pts += 15;
        fatores.push({ desc: `${pct1.toFixed(0)}% dos gastos CEAP concentrados em 1 fornecedor`, pts: 15, icon: "⚠️" });
      } else if (pct1 >= 70) {
        pts += 8;
        fatores.push({ desc: `${pct1.toFixed(0)}% dos gastos CEAP concentrados em 1 fornecedor`, pts: 8, icon: "⚠️" });
      }
    }

    // 5. Doadores de campanha do setor privado (max 10 pts)
    const totalDoadoresPJ = (doadores || []).filter(d =>
      d.cpfCnpj && d.cpfCnpj.replace(/\D/g,"").length === 14
    ).length;
    if (totalDoadoresPJ > 10) {
      pts += 10;
      fatores.push({ desc: `${totalDoadoresPJ} empresas financiaram a campanha (possível conflito de interesse)`, pts: 10, icon: "🏢" });
    }

    return {
      score: Math.min(100, pts),
      nivel: pts >= 70 ? "ALTO" : pts >= 40 ? "MÉDIO" : pts >= 15 ? "BAIXO" : "LIMPO",
      cor: pts >= 70 ? "#f87171" : pts >= 40 ? "#fbbf24" : pts >= 15 ? "#60a5fa" : "#34d399",
      fatores,
    };
  }

  // ─── Render section helper ───────────────────────────────────────────────
  function sec(titulo, conteudo) {
    return `<div style="margin-bottom:14px;">
      <div style="font-size:10px;font-weight:900;color:#52525b;text-transform:uppercase;
                  letter-spacing:.08em;margin-bottom:6px;">${titulo}</div>
      ${conteudo}
    </div>`;
  }
  function badge(txt, cor) {
    return `<span style="display:inline-block;padding:2px 8px;border-radius:999px;
                         background:${cor}22;border:1px solid ${cor};
                         color:${cor};font-size:10px;font-weight:800;">${txt}</span>`;
  }

  // ─── Investigação principal ──────────────────────────────────────────────
  async function investigar(dep, nomeForce) {
    const depId = dep?.id;
    const nome  = nomeForce || dep?.ultimoStatus?.nomeEleitoral || dep?.nomeCivil || dep?.nome || "–";
    const partido = dep?.ultimoStatus?.siglaPartido || dep?.siglaPartido || "–";
    const uf      = dep?.ultimoStatus?.siglaUf      || dep?.siglaUf      || "–";
    const foto    = dep?.ultimoStatus?.urlFoto       || dep?.urlFoto      || "";

    bot("info", `🕵️ Investigando ${nome}...`,
      `Executando 6 verificações simultâneas em bases oficiais.<br>
       <span style="color:#52525b;font-size:11px;">Câmara · CEIS · CNEP · DataJud · TSE · Portal Transparência</span>`
    );

    const ano = new Date().getFullYear();

    // Todas as requisições em paralelo
    const [sancRes, procRes, despRes, patriRes, finRes] = await Promise.allSettled([
      fetchApi("scan_anticorrupcao", { nome }),
      fetchApi("datajud_processos",  { nome }),
      depId
        ? fetchApi("proxy_camara", { endpoint: `deputados/${depId}/despesas?ano=${ano}&pagina=1&itens=100&ordenarPor=valorLiquido&ordem=DESC` })
        : Promise.resolve(null),
      fetchApi("get_bens_tse",         { nome, uf }),
      fetchApi("get_financiamento_tse", { nome, uf }),
    ]);

    const sancoes   = sancRes.status   === "fulfilled" ? sancRes.value   : {};
    const processos = procRes.status   === "fulfilled" ? procRes.value   : {};
    const despesas  = (despRes.status  === "fulfilled" ? despRes.value?.dados  : null) || [];
    const patrimonio= patriRes.status  === "fulfilled" ? patriRes.value  : null;
    const financ    = finRes.status    === "fulfilled" ? finRes.value    : null;

    // Variação patrimonial
    let patriVar = 0;
    if (patrimonio && !patrimonio.erro) {
      const t22 = parseFloat(patrimonio["2022"]?.totalBens || 0);
      const t18 = parseFloat(patrimonio["2018"]?.totalBens || 0);
      patriVar = t22 - t18;
    }

    // Top doadores campanha
    const doadores = financ?.top_doadores || financ?.receitas || [];

    // Score
    const scoreData = calcularScore(sancoes, processos, despesas, patriVar, doadores);

    // ─── Render do dossiê ─────────────────────────────────────────────────
    const feed = document.getElementById("hyperbot-feed");
    if (!feed) return;
    document.getElementById("hyperbot-empty")?.remove();

    // Cartão de identificação + score
    const scoreCor  = scoreData.cor;
    const scoreNivel = scoreData.nivel;

    const fotoHtml = foto
      ? `<img src="${foto}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;
                border:2px solid ${scoreCor};flex-shrink:0;" onerror="this.style.display='none'">`
      : `<div style="width:56px;height:56px;border-radius:50%;background:#1e1333;border:2px solid ${scoreCor};
                     display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">👔</div>`;

    // ── Bloco 1: Cabeçalho + Score ─────────────────────────────────────────
    const totalSancoes = (sancoes?.ceis?.length||0)+(sancoes?.cnep?.length||0)+
                         (sancoes?.ceaf?.length||0)+(sancoes?.cepim?.length||0);
    const totalProc    = processos?.processos?.length || 0;

    const htmlScore = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
        ${fotoHtml}
        <div style="flex:1;">
          <div style="font-size:17px;font-weight:900;color:#f4f4f5;">${nome}</div>
          <div style="font-size:12px;color:#a78bfa;font-weight:700;">${partido} · ${uf}</div>
        </div>
        <div style="text-align:center;background:${scoreCor}1a;border:2px solid ${scoreCor};
                    border-radius:12px;padding:10px 14px;flex-shrink:0;">
          <div style="font-size:28px;font-weight:900;color:${scoreCor};line-height:1;">${scoreData.score}</div>
          <div style="font-size:9px;font-weight:800;color:${scoreCor};text-transform:uppercase;letter-spacing:.06em;">Risco<br>${scoreNivel}</div>
        </div>
      </div>

      ${sec("📊 Resumo da investigação",
        `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
          ${[
            ["🚨 Sanções",   totalSancoes, totalSancoes > 0 ? "#f87171" : "#34d399"],
            ["⚖️ Processos", totalProc,    totalProc > 0    ? "#fbbf24" : "#34d399"],
            ["💰 Patrimônio",patriVar > 0 ? "+" + fmtK(patriVar) : "–", patriVar > 500000 ? "#fbbf24" : "#34d399"],
          ].map(([l,v,c]) =>
            `<div style="background:#0f1629;border-radius:8px;padding:8px;text-align:center;">
               <div style="font-size:17px;font-weight:900;color:${c};">${v}</div>
               <div style="font-size:10px;color:#6b7280;">${l}</div>
             </div>`
          ).join("")}
        </div>`
      )}

      ${scoreData.fatores.length > 0 ? sec("⚠️ Fatores de risco detectados",
        scoreData.fatores.map(f =>
          `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
             <span style="flex-shrink:0;font-size:13px;">${f.icon}</span>
             <span style="font-size:12px;color:#d4d4d8;flex:1;">${f.desc}</span>
             <span style="font-size:11px;font-weight:800;color:#fbbf24;flex-shrink:0;">+${f.pts}pts</span>
           </div>`
        ).join("")
      ) : sec("✅ Sem fatores críticos detectados",
        `<div style="font-size:12px;color:#34d399;">Nenhuma sanção, processo grave ou padrão suspeito encontrado nas bases consultadas.</div>`
      )}`;

    _pushDossieCard(scoreData.score >= 70 ? "critico" : scoreData.score >= 40 ? "atencao" : "positivo",
      `🕵️ Dossiê — ${nome}`, htmlScore);

    // ── Bloco 2: Sanções detalhadas ────────────────────────────────────────
    if (totalSancoes > 0) {
      const linhas = [
        ...(sancoes.ceis  ||[]).slice(0,2).map(s => `<div style="padding:5px 0;border-bottom:1px solid #1a1a24;"><span style="color:#f87171;font-size:10px;font-weight:800;">CEIS</span> <span style="font-size:12px;color:#d4d4d8;">${s.sancionado?.nome || s.nome || "–"}</span><br><span style="font-size:10px;color:#71717a;">${s.tipoSancao?.descricao||""} · ${s.orgaoSancionador?.nome||""}</span></div>`),
        ...(sancoes.cnep  ||[]).slice(0,2).map(s => `<div style="padding:5px 0;border-bottom:1px solid #1a1a24;"><span style="color:#f87171;font-size:10px;font-weight:800;">CNEP</span> <span style="font-size:12px;color:#d4d4d8;">${s.sancionado?.nome || s.nome || "–"}</span><br><span style="font-size:10px;color:#71717a;">${s.tipoSancao?.descricao||""}</span></div>`),
        ...(sancoes.pep   ||[]).slice(0,1).map(s => `<div style="padding:5px 0;"><span style="color:#fbbf24;font-size:10px;font-weight:800;">PEP</span> <span style="font-size:12px;color:#d4d4d8;">${s.nome||"–"}</span><br><span style="font-size:10px;color:#71717a;">${s.descricaoFuncao||s.cargo||""}</span></div>`),
      ];
      if (linhas.length)
        _pushDossieCard("critico", `🚨 ${totalSancoes} Sanção(ões) — Bases Oficiais`, linhas.join(""), 400);
    }

    // ── Bloco 3: Processos ─────────────────────────────────────────────────
    if (totalProc > 0) {
      const graves = (processos.processos||[]).filter(p =>
        /corrup|improbidade|peculato|lavagem|fraude/i.test((p.classe||"")+(p.assuntos||[]).join(" "))
      );
      const html = (processos.processos||[]).slice(0,5).map(p => {
        const assunto = Array.isArray(p.assuntos) ? p.assuntos.join(", ") : (p.assunto||"–");
        const grave   = /corrup|improbidade|peculato|lavagem|fraude/i.test((p.classe||"")+assunto);
        return `<div style="padding:5px 0;border-bottom:1px solid #1a1a24;">
          <div style="display:flex;align-items:center;gap:6px;">
            ${grave ? `<span style="color:#f87171;font-size:10px;font-weight:800;">⚠️ GRAVE</span>` : ""}
            <span style="font-size:11px;color:#a1a1aa;">${p.tribunal||p.orgaoJulgador||"–"} · ${p.classe||"–"}</span>
          </div>
          <div style="font-size:11px;color:#71717a;margin-top:2px;">${assunto.substring(0,70)}</div>
        </div>`;
      }).join("");
      _pushDossieCard(graves.length > 0 ? "critico" : "atencao",
        `⚖️ ${totalProc} Processo(s) no DataJud (CNJ)`, html, 700);
    }

    // ── Bloco 4: Patrimônio ────────────────────────────────────────────────
    if (patrimonio && !patrimonio.erro) {
      const t22 = parseFloat(patrimonio["2022"]?.totalBens || 0);
      const t18 = parseFloat(patrimonio["2018"]?.totalBens || 0);
      const variacao = t22 - t18;
      const varPct   = t18 > 0 ? ((variacao / t18) * 100).toFixed(1) : null;
      const bens22   = (patrimonio["2022"]?.bens || []).slice(0,4);

      const htmlP = `
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          ${[["2018", t18, "#6b7280"], ["2022", t22, variacao >= 0 ? "#fbbf24" : "#34d399"]].map(([a,v,c]) =>
            `<div style="flex:1;background:#0f1629;border-radius:8px;padding:8px;text-align:center;">
               <div style="font-size:13px;font-weight:900;color:${c};">${fmtK(v)}</div>
               <div style="font-size:10px;color:#6b7280;">Declarado ${a}</div>
             </div>`
          ).join("")}
          <div style="flex:1;background:#0f1629;border-radius:8px;padding:8px;text-align:center;">
            <div style="font-size:13px;font-weight:900;color:${variacao>0?"#f87171":"#34d399"};">
              ${variacao >= 0 ? "+" : ""}${fmtK(variacao)}
            </div>
            <div style="font-size:10px;color:#6b7280;">Variação${varPct ? ` (${varPct}%)` : ""}</div>
          </div>
        </div>
        ${bens22.map(b => `<div style="font-size:11px;color:#a1a1aa;padding:3px 0;border-bottom:1px solid #1a1a24;">
          ${b.descricaoTipoBem||"Bem"} — <strong>${fmtK(b.valor||0)}</strong>
        </div>`).join("")}`;
      _pushDossieCard(
        variacao > 2_000_000 ? "critico" : variacao > 500_000 ? "atencao" : "positivo",
        `💰 Patrimônio TSE — 2018 × 2022`, htmlP, 1000
      );
    }

    // ── Bloco 5: Gastos CEAP ──────────────────────────────────────────────
    if (despesas.length > 0) {
      const total = despesas.reduce((a, c) => a + parseFloat(c.valorLiquido || 0), 0);
      const porCat = {};
      despesas.forEach(e => {
        const k = e.tipoDespesa || "Outros";
        porCat[k] = (porCat[k] || 0) + parseFloat(e.valorLiquido || 0);
      });
      const sorted = Object.entries(porCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const htmlD = `
        <div style="font-size:20px;font-weight:900;color:#34d399;margin-bottom:10px;">${fmtK(total)}
          <span style="font-size:11px;color:#52525b;font-weight:400;"> total ${ano}</span>
        </div>
        ${sorted.map(([cat, val]) => {
          const pct = ((val / total) * 100).toFixed(1);
          const bar = Math.max(4, (val / sorted[0][1]) * 100).toFixed(0);
          return `<div style="margin-bottom:7px;">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
              <span style="color:#d4d4d8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;">${cat}</span>
              <span style="color:#a78bfa;font-weight:700;">${pct}%</span>
            </div>
            <div style="height:4px;border-radius:2px;background:#1f2937;">
              <div style="height:100%;border-radius:2px;background:linear-gradient(90deg,#7c3aed,#a78bfa);width:${bar}%;"></div>
            </div>
          </div>`;
        }).join("")}`;
      _pushDossieCard("info", `💸 Gastos CEAP — ${despesas.length} registros (${ano})`, htmlD, 1300);
    }

    // ── Bloco 6: Financiamento de campanha ────────────────────────────────
    if (financ && !financ.erro && (financ.total_receitas || 0) > 0) {
      const topD  = (financ.top_doadores || []).slice(0, 5);
      const htmlF = `
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          ${[["Receitas", financ.total_receitas, "#34d399"], ["Despesas", financ.total_despesas, "#f87171"]].map(([l,v,c]) =>
            `<div style="flex:1;background:#0f1629;border-radius:8px;padding:8px;text-align:center;">
               <div style="font-size:13px;font-weight:900;color:${c};">${fmtK(v)}</div>
               <div style="font-size:10px;color:#6b7280;">Campanha ${l}</div>
             </div>`
          ).join("")}
        </div>
        ${topD.length ? `<div style="font-size:10px;color:#52525b;margin-bottom:5px;">TOP DOADORES</div>
        ${topD.map(d => `<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid #1a1a24;">
            <span style="color:#d4d4d8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${d.nomeDoador||d.nome||"–"}</span>
            <span style="color:#a78bfa;font-weight:700;flex-shrink:0;">${fmtK(d.valor||d.valorReceita||0)}</span>
          </div>`).join("")}` : ""}`;
      _pushDossieCard("info", "🏛️ Financiamento de Campanha 2022 (TSE)", htmlF, 1600);
    }

    // ── Chips finais ───────────────────────────────────────────────────────
    setTimeout(() => {
      chips([
        { emoji: "📡", label: "Monitorar este político",    acao: () => window.HyperBotMonitor?.adicionar?.(depId, nome, partido, uf) },
        { emoji: "🏢", label: "Cruzar fornecedores CEAP",   acao: () => window.HyperBotCruzador?.cruzarFornecedores?.(depId, nome, despesas) },
        { emoji: "📰", label: "Notícias",                   acao: () => depId && window.HyperBotOsint?.buscarNoticias?.(depId, nome) },
        { emoji: "🔄", label: "Nova investigação",          acao: () => { window.HyperBotChat?.handleInput?.("investigar outro político"); } },
      ]);
    }, 1900);
  }

  // Renderiza um card do dossiê no feed
  function _pushDossieCard(sev, titulo, html, delay = 0) {
    setTimeout(() => {
      window.HyperBotChat?.pushBotMsg?.(sev, titulo, html, { delay: 0 });
    }, delay);
  }

  // ─── API pública ─────────────────────────────────────────────────────────
  window.HyperBotInvestigador = {
    investigar,
    calcularScore,
  };
})();
