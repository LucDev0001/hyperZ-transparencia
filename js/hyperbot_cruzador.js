/**
 * hyperbot_cruzador.js — Motor de Cruzamento de Dados
 *
 * Detecta irregularidades cruzando múltiplas bases de dados:
 *
 *  1. cruzarFornecedores(depId, nome, despesas)
 *     Pega os 10 maiores fornecedores CEAP de um deputado e verifica
 *     cada um no CEIS/CNEP. Fornecedor sancionado pagando deputado = alerta.
 *
 *  2. comparar(nome1, nome2)
 *     Compara dois políticos lado a lado: gastos, sanções, processos,
 *     patrimônio. Apresenta como tabela comparativa no chat.
 *
 *  3. analisarVotacoesSuspeitas(depId, nome)
 *     Detecta padrões suspeitos nas votações: sempre vota com a base do
 *     governo, alta taxa de abstenção, vota contra o próprio partido.
 *
 *  4. rankearDeputadosPorGastos(uf)
 *     Busca deputados de um estado e os ordena por gasto CEAP.
 *
 * Expõe: window.HyperBotCruzador
 */
(function () {
  "use strict";

  function bot(sev, titulo, texto) {
    window.HyperBotChat?.pushBotMsg?.(sev, titulo, texto, { delay: 0 });
  }
  function chips(list) {
    window.HyperBotAgent?.mostrarChips?.(list);
  }
  const fmt = (v) =>
    "R$ " + parseFloat(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const fmtK = (v) => {
    const n = parseFloat(v || 0);
    return n >= 1e6 ? `R$ ${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `R$ ${(n/1e3).toFixed(0)}K` : fmt(n);
  };

  // ════════════════════════════════════════════════════════════════════════
  //  1. CRUZAR FORNECEDORES CEAP × CEIS/CNEP
  // ════════════════════════════════════════════════════════════════════════
  async function cruzarFornecedores(depId, nome, despesasCache) {
    bot("info", `🔗 Cruzando fornecedores de ${nome}...`,
      "Verificando se os fornecedores que receberam dinheiro do deputado estão em listas de sanção...");

    try {
      // Usa cache de despesas se disponível, senão busca
      let despesas = despesasCache;
      if (!despesas || !despesas.length) {
        const ano  = new Date().getFullYear();
        const data = await fetchApi("proxy_camara", {
          endpoint: `deputados/${depId}/despesas?ano=${ano}&pagina=1&itens=100&ordenarPor=valorLiquido&ordem=DESC`,
        });
        despesas = data?.dados || [];
      }

      if (!despesas.length) {
        bot("info", "🔗 Sem despesas", "Nenhuma despesa CEAP encontrada para cruzar.");
        return;
      }

      // Consolida fornecedores por CNPJ/CPF
      const fornMap = {};
      despesas.forEach(e => {
        const key  = e.cnpjCpfFornecedor || e.nomeFornecedor || "–";
        const cnpj = e.cnpjCpfFornecedor?.replace(/\D/g,"") || "";
        if (!fornMap[key]) {
          fornMap[key] = { nome: e.nomeFornecedor || key, cnpj, total: 0, count: 0 };
        }
        fornMap[key].total += parseFloat(e.valorLiquido || 0);
        fornMap[key].count++;
      });

      const topForn = Object.values(fornMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      // Verifica cada fornecedor (apenas CNPJ de 14 dígitos)
      const checks = await Promise.allSettled(
        topForn.filter(f => f.cnpj.length === 14).map(async f => {
          const r = await fetchApi("scan_anticorrupcao", { cnpj: f.cnpj });
          const sancoes = (r?.ceis?.length||0) + (r?.cnep?.length||0) +
                          (r?.ceaf?.length||0) + (r?.cepim?.length||0);
          return { ...f, sancoes, scan: r };
        })
      );

      const resultados = checks
        .filter(c => c.status === "fulfilled")
        .map(c => c.value);

      const sancionados = resultados.filter(f => f.sancoes > 0);
      const total       = despesas.reduce((a, c) => a + parseFloat(c.valorLiquido||0), 0);
      const valorSanc   = sancionados.reduce((a, c) => a + c.total, 0);
      const pctSanc     = total > 0 ? ((valorSanc / total) * 100).toFixed(1) : "0";

      // ── Render ──────────────────────────────────────────────────────────
      const sev = sancionados.length >= 3 ? "critico" : sancionados.length > 0 ? "atencao" : "positivo";

      const resumo = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;">
          ${[
            ["Fornecedores", topForn.length, "#a78bfa"],
            ["Sancionados",  sancionados.length, sancionados.length > 0 ? "#f87171" : "#34d399"],
            ["% do valor",   pctSanc + "%", parseFloat(pctSanc) > 20 ? "#f87171" : "#34d399"],
          ].map(([l,v,c]) =>
            `<div style="background:#0f1629;border-radius:8px;padding:8px;text-align:center;">
               <div style="font-size:18px;font-weight:900;color:${c};">${v}</div>
               <div style="font-size:10px;color:#6b7280;">${l}</div>
             </div>`
          ).join("")}
        </div>`;

      const lista = topForn.map(f => {
        const r = resultados.find(r => r.cnpj === f.cnpj);
        const sanc = r?.sancoes || 0;
        const cor  = sanc > 0 ? "#f87171" : "#34d399";
        const icon = sanc > 0 ? "🚨" : "✅";
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #1a1a24;">
          <span style="font-size:14px;flex-shrink:0;">${icon}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;color:#d4d4d8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.nome.substring(0,40)}</div>
            <div style="font-size:10px;color:#52525b;">${f.cnpj ? f.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") : "CPF"} · ${fmtK(f.total)}</div>
          </div>
          ${sanc > 0
            ? `<span style="font-size:10px;font-weight:800;color:${cor};flex-shrink:0;">${sanc} SANÇÃO</span>`
            : `<span style="font-size:10px;color:#34d399;flex-shrink:0;">OK</span>`}
        </div>`;
      }).join("");

      bot(sev,
        `🔗 Cruzamento de Fornecedores — ${nome}`,
        resumo + lista
      );

      if (sancionados.length > 0) {
        const textoAlert = sancionados.map(f =>
          `<strong>${f.nome.substring(0,30)}</strong>: ${f.sancoes} sanção(ões) — recebeu ${fmtK(f.total)} do deputado`
        ).join("<br>");
        setTimeout(() => {
          bot("critico",
            `🚨 ${sancionados.length} Fornecedor(es) Sancionado(s) receberam dinheiro de ${nome}`,
            textoAlert + `<br><br><span style="color:#52525b;font-size:11px;">
              Isso pode indicar direcionamento de verba pública para empresas irregulares.
              Represente isso ao CGU ou MP do seu estado.
            </span>`
          );
        }, 600);
      }

      chips([
        { emoji: "🕵️", label: "Dossiê completo",        acao: () => window.HyperBotInvestigador?.investigar?.(window._currentDeputy, nome) },
        { emoji: "📡", label: "Monitorar deputado",      acao: () => window.HyperBotMonitor?.adicionar?.(depId, nome) },
        { emoji: "📋", label: "Ver emendas parlamentares", acao: () => window.HyperBotAgent?.processarMensagem?.("emendas") },
      ]);
    } catch (e) {
      bot("atencao", "🔗 Erro no cruzamento", "Não foi possível cruzar os dados. Tente novamente.");
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  2. COMPARAR DOIS POLÍTICOS
  // ════════════════════════════════════════════════════════════════════════
  async function comparar(nome1, nome2) {
    if (!nome1 || !nome2) {
      bot("info", "🔄 Comparar quem?", "Me diga dois nomes. Ex: <em>\"Comparar Fulano com Beltrano\"</em>");
      return;
    }
    bot("info", `🔄 Comparando ${nome1} × ${nome2}...`,
      "Buscando dados nas bases oficiais para os dois políticos...");

    // Busca dados para os dois em paralelo
    const [r1, r2] = await Promise.allSettled([
      _coletarDadosComparacao(nome1),
      _coletarDadosComparacao(nome2),
    ]);

    const d1 = r1.status === "fulfilled" ? r1.value : { nome: nome1, erro: true };
    const d2 = r2.status === "fulfilled" ? r2.value : { nome: nome2, erro: true };

    const rows = [
      ["Partido", d1.partido || "–", d2.partido || "–"],
      ["Estado",  d1.uf || "–",     d2.uf || "–"],
      ["Sanções (CEIS/CNEP)", d1.sancoes ?? "?", d2.sancoes ?? "?"],
      ["Processos (DataJud)", d1.processos ?? "?", d2.processos ?? "?"],
      ["Gastos CEAP",  d1.totalGastos ? `R$ ${parseFloat(d1.totalGastos/1e3).toFixed(0)}K` : "–", d2.totalGastos ? `R$ ${parseFloat(d2.totalGastos/1e3).toFixed(0)}K` : "–"],
    ];

    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
        ${[d1, d2].map(d =>
          `<div style="background:#0f1629;border-radius:10px;padding:10px;text-align:center;">
             <div style="font-size:14px;font-weight:900;color:#f4f4f5;">${d.nome}</div>
             <div style="font-size:11px;color:#a78bfa;">${d.partido||"–"}/${d.uf||"–"}</div>
             <div style="font-size:22px;font-weight:900;color:${d.score >= 70?"#f87171":d.score>=40?"#fbbf24":"#34d399"};margin-top:6px;">${d.score ?? "–"}</div>
             <div style="font-size:9px;color:#52525b;">Score de Risco</div>
           </div>`
        ).join("")}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr>
            <th style="text-align:left;color:#52525b;font-size:10px;padding:4px 0;border-bottom:1px solid #1a1a24;">INDICADOR</th>
            <th style="text-align:center;color:#a78bfa;font-size:10px;padding:4px 0;border-bottom:1px solid #1a1a24;">${d1.nome.split(" ")[0]}</th>
            <th style="text-align:center;color:#60a5fa;font-size:10px;padding:4px 0;border-bottom:1px solid #1a1a24;">${d2.nome.split(" ")[0]}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(([label, v1, v2]) => {
            const n1 = parseFloat(String(v1).replace(/\D/g,"")) || 0;
            const n2 = parseFloat(String(v2).replace(/\D/g,"")) || 0;
            const pior = n1 > n2 ? 1 : n2 > n1 ? 2 : 0;
            return `<tr>
              <td style="color:#71717a;padding:5px 0;border-bottom:1px solid #111;">${label}</td>
              <td style="text-align:center;font-weight:700;color:${pior===1?"#f87171":"#34d399"};padding:5px 0;border-bottom:1px solid #111;">${v1}</td>
              <td style="text-align:center;font-weight:700;color:${pior===2?"#f87171":"#34d399"};padding:5px 0;border-bottom:1px solid #111;">${v2}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`;

    bot("info", `🔄 Comparativo — ${d1.nome} × ${d2.nome}`, html);
  }

  async function _coletarDadosComparacao(nome) {
    const [camaraRes, sancRes, procRes, despRes] = await Promise.allSettled([
      fetchApi("proxy_camara", { endpoint: `deputados?nome=${encodeURIComponent(nome)}&ordem=ASC&ordenarPor=nome` }),
      fetchApi("scan_anticorrupcao", { nome }),
      fetchApi("datajud_processos",  { nome }),
      fetchApi("proxy_camara", { endpoint: `deputados?nome=${encodeURIComponent(nome)}&ordem=ASC&ordenarPor=nome` })
        .then(async r => {
          const id = r?.dados?.[0]?.id;
          if (!id) return null;
          const ano = new Date().getFullYear();
          return fetchApi("proxy_camara", { endpoint: `deputados/${id}/despesas?ano=${ano}&pagina=1&itens=100` });
        }),
    ]);

    const camara    = camaraRes.status  === "fulfilled" ? camaraRes.value?.dados?.[0]  : null;
    const sancoes   = sancRes.status    === "fulfilled" ? sancRes.value : {};
    const processos = procRes.status    === "fulfilled" ? procRes.value : {};
    const despesas  = despRes.status    === "fulfilled" ? (despRes.value?.dados || []) : [];

    const totalSanc  = (sancoes?.ceis?.length||0)+(sancoes?.cnep?.length||0)+
                       (sancoes?.ceaf?.length||0)+(sancoes?.cepim?.length||0);
    const totalProc  = processos?.processos?.length || 0;
    const totalGastos= despesas.reduce((a,c)=>a+parseFloat(c.valorLiquido||0),0);

    const scoreData = window.HyperBotInvestigador?.calcularScore?.(
      sancoes, processos, despesas, 0, []
    ) || { score: 0 };

    return {
      nome:        camara?.nome || nome,
      partido:     camara?.siglaPartido || "–",
      uf:          camara?.siglaUf || "–",
      sancoes:     totalSanc,
      processos:   totalProc,
      totalGastos,
      score:       scoreData.score,
    };
  }

  // ════════════════════════════════════════════════════════════════════════
  //  3. ANALISAR VOTAÇÕES SUSPEITAS
  // ════════════════════════════════════════════════════════════════════════
  async function analisarVotacoesSuspeitas(depId, nome) {
    bot("info", `🗳️ Analisando padrão de votações de ${nome}...`,
      "Procurando abstenções, divergências com o partido e padrões incomuns...");

    try {
      const data  = await fetchApi("get_deputy_votes", { id: depId });
      const votos = data?.votacoes || data?.dados || [];

      if (!votos.length) {
        bot("info", "🗳️ Sem dados", "Não há votações disponíveis para análise.");
        return;
      }

      const sim     = votos.filter(v => /^sim$/i.test(v.tipoVoto||v.voto||"")).length;
      const nao     = votos.filter(v => /^n[aã]o$/i.test(v.tipoVoto||v.voto||"")).length;
      const ausente = votos.filter(v => /ausente|absten/i.test(v.tipoVoto||v.voto||"")).length;
      const total   = votos.length;
      const pctAus  = ((ausente / total) * 100).toFixed(1);
      const pctSim  = ((sim     / total) * 100).toFixed(1);

      const alertas = [];
      if (parseFloat(pctAus) > 30) alertas.push(`⚠️ Alta taxa de ausência: <strong>${pctAus}%</strong> das votações`);
      if (parseFloat(pctSim) > 95) alertas.push(`⚠️ Vota "SIM" em <strong>${pctSim}%</strong> das propostas — possível alinhamento automático`);

      const htmlStats = `
        <div style="display:flex;gap:6px;margin-bottom:10px;">
          ${[["✅ Sim", sim, pctSim+"%", "#34d399"],["❌ Não",nao,((nao/total)*100).toFixed(0)+"%","#f87171"],["⭕ Ausente",ausente,pctAus+"%","#71717a"]].map(([l,n,p,c])=>
            `<div style="flex:1;background:#0f1629;border-radius:8px;padding:8px;text-align:center;">
               <div style="font-size:17px;font-weight:900;color:${c};">${n}</div>
               <div style="font-size:10px;color:#6b7280;">${l} (${p})</div>
             </div>`
          ).join("")}
        </div>
        ${alertas.length ? alertas.map(a=>`<div style="font-size:12px;color:#fbbf24;margin-bottom:4px;">${a}</div>`).join("") : `<div style="font-size:12px;color:#34d399;">✅ Padrão de votação dentro do esperado.</div>`}`;

      bot(alertas.length > 0 ? "atencao" : "positivo",
        `🗳️ Análise de Votações — ${nome} (${total} votos)`,
        htmlStats
      );
    } catch {
      bot("atencao", "🗳️ Erro", "Não foi possível analisar as votações.");
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  4. RANKING DE DEPUTADOS POR GASTO (por UF)
  // ════════════════════════════════════════════════════════════════════════
  async function rankearPorGastos(uf) {
    if (!uf || uf.length !== 2) {
      bot("info", "💸 Qual estado?", "Me diga a sigla do estado. Ex: <em>\"Ranking gastos SP\"</em>");
      return;
    }
    bot("info", `💸 Buscando maiores gastadores de ${uf.toUpperCase()}...`,
      "Consultando deputados do estado e calculando gastos CEAP...");

    try {
      const lista = await fetchApi("proxy_camara", {
        endpoint: `deputados?siglaUf=${uf.toUpperCase()}&ordem=ASC&ordenarPor=nome&itens=50`,
      });
      const deps = lista?.dados || [];
      if (!deps.length) { bot("info", "Nenhum deputado", `Não encontrei deputados ativos por ${uf}.`); return; }

      const ano = new Date().getFullYear();
      const resultados = await Promise.allSettled(
        deps.slice(0, 15).map(async d => {
          const r = await fetchApi("proxy_camara", { endpoint: `deputados/${d.id}/despesas?ano=${ano}&pagina=1&itens=100` });
          const desp = r?.dados || [];
          const total = desp.reduce((a, c) => a + parseFloat(c.valorLiquido || 0), 0);
          return { id: d.id, nome: d.nome, partido: d.siglaPartido, uf: d.siglaUf, total };
        })
      );

      const ranking = resultados
        .filter(r => r.status === "fulfilled")
        .map(r => r.value)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      const html = ranking.map((d, i) => {
        const bar = ranking[0].total > 0 ? Math.max(4, (d.total / ranking[0].total * 100)).toFixed(0) : 0;
        return `<div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px;">
            <span style="color:#d4d4d8;">${i+1}. ${d.nome.split(" ").slice(0,3).join(" ")}</span>
            <span style="color:#fbbf24;font-weight:700;">${fmtK(d.total)}</span>
          </div>
          <div style="height:4px;border-radius:2px;background:#1f2937;">
            <div style="height:100%;border-radius:2px;background:linear-gradient(90deg,#7c3aed,#fbbf24);width:${bar}%;"></div>
          </div>
          <div style="font-size:10px;color:#52525b;">${d.partido}</div>
        </div>`;
      }).join("");

      bot("info", `💸 Top 10 Gastos CEAP — Deputados de ${uf.toUpperCase()} (${ano})`, html);
    } catch {
      bot("atencao", "💸 Erro", "Não foi possível carregar o ranking de gastos.");
    }
  }

  // ─── API pública ─────────────────────────────────────────────────────────
  window.HyperBotCruzador = {
    cruzarFornecedores,
    comparar,
    analisarVotacoesSuspeitas,
    rankearPorGastos,
  };
})();
