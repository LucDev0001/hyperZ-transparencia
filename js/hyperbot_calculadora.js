/**
 * hyperbot_calculadora.js — Calculadora Cívica
 *
 * Transforma dados brutos em números que o cidadão entende:
 *  • Custo real do mandato (salário + benefícios + estrutura)
 *  • Quanto VOCÊ paga por esse mandato por mês
 *  • Custo por voto emitido pelo deputado
 *  • Equivalência em salários mínimos
 *  • Calculadora de imposto pessoal — onde vai seu dinheiro
 *  • Comparativo de eficiência entre deputados
 *
 * Todos os valores são baseados em dados públicos oficiais.
 * Sem IA, sem externos.
 */
(function () {
  "use strict";

  // ─── helpers ────────────────────────────────────────────────────────────────
  function bot(sev, titulo, html) {
    window.HyperBotChat?.pushBotMsg?.(sev, titulo, html);
  }
  function chips(list) { window.HyperBotAgent?.mostrarChips?.(list); }

  const _handlers = [];
  function reg(fn) { const i = _handlers.length; _handlers.push(fn); return i; }

  const brl = (v) => "R$ " + parseFloat(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const brlK = (v) => {
    const n = parseFloat(v || 0);
    return n >= 1e9 ? `R$ ${(n/1e9).toFixed(2)}B`
         : n >= 1e6 ? `R$ ${(n/1e6).toFixed(2)}M`
         : n >= 1e3 ? `R$ ${(n/1e3).toFixed(0)}K`
         : brl(n);
  };

  // ─── Dados oficiais (2024) ───────────────────────────────────────────────────
  const DADOS_OFICIAIS = {
    salario_dep:          33_763.00,   // subsídio mensal bruto (Res. TSJE 2024)
    ceap_limite:          45_612.53,   // cota parlamentar mensal (máximo)
    ceap_medio:           18_000.00,   // média real de uso (dados Câmara 2023)
    gastos_gabinete:      100_614.77,  // verba de gabinete/mês (pessoal + estrutura)
    auxilio_moradia:       4_253.00,   // auxílio-moradia mensal
    auxilio_saude:           854.00,   // ressarcimento saúde/mês
    passagens_mes:         8_316.00,   // passagens aéreas médias (Câmara 2023)
    custo_total_anual:  1_420_000.00,  // custo total estimado/ano (DIAP / ILP)
    salario_minimo:        1_412.00,   // salário mínimo 2024
    contribuintes_br:  90_000_000,     // contribuintes ativos (RFB 2023)
    deputados:               513,
    mandato_anos:              4,
    pop_brasil:      215_000_000,
    eleitores_br:    156_000_000,
  };

  // ─── 1. Custo do mandato ─────────────────────────────────────────────────────
  function calcularCustoMandato(dep, votos) {
    // Sem dep: mostra custo médio genérico e orienta busca
    if (!dep) {
      bot("info", "💸 Custo do Mandato — Busque um deputado",
        `Posso mostrar o custo real de qualquer deputado para você.<br><br>
         <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           ✏️ Busque um deputado: <em style="color:#a78bfa;">"ver Lula"</em><br>
           ✏️ Depois diga: <em style="color:#a78bfa;">"custo do mandato"</em>
         </div>
         <div style="margin-top:10px;font-size:12px;color:#71717a;">
           💡 Média geral: cada deputado custa aproximadamente
           <strong style="color:#f87171;">R$ 118.000/mês</strong> ao contribuinte
           (salário + CEAP + gabinete + benefícios).
         </div>`);
      chips([
        { emoji: "🔍", label: "Buscar deputado",      acao: () => window.HyperBotAgent?.processarMensagem?.("buscar deputado") },
        { emoji: "🏆", label: "Ranking de gastos",    acao: () => window.HyperBotCruzador?.rankearPorGastos?.() },
        { emoji: "🧮", label: "Calcular meu imposto", acao: () => calcularImposto() },
      ]);
      return;
    }
    const nome = dep?.ultimoStatus?.nomeEleitoral || dep?.nomeCivil || "Deputado";
    const d = DADOS_OFICIAIS;

    const custoMensalTotal = d.salario_dep + d.ceap_medio + d.gastos_gabinete
                           + d.auxilio_moradia + d.auxilio_saude + d.passagens_mes;
    const custoAnual = custoMensalTotal * 12;
    const custoMandato = custoAnual * d.mandato_anos;

    const custoPorContribuinte = custoAnual / d.contribuintes_br;
    const custoPorContribuinteMandato = custoMandato / d.contribuintes_br;
    const custoPorEleitor = custoAnual / d.eleitores_br;

    const salMinEquiv = (custoMensalTotal / d.salario_minimo).toFixed(1);

    const custoPorVoto = votos > 0
      ? (custoMandato / votos)
      : null;

    const barItem = (label, val, pct, cor) => `
      <div style="margin-bottom:7px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
          <span style="color:#d4d4d8;">${label}</span>
          <span style="color:${cor};font-weight:700;">${brl(val)}/mês</span>
        </div>
        <div style="height:4px;border-radius:2px;background:#1f2937;">
          <div style="height:100%;border-radius:2px;background:${cor};width:${Math.min(100,pct)}%;"></div>
        </div>
      </div>`;

    const html = `
      <!-- Total destaque -->
      <div style="background:#0f1629;border-radius:10px;padding:12px 14px;margin-bottom:12px;text-align:center;">
        <div style="font-size:11px;color:#6b7280;margin-bottom:2px;">Custo total estimado por deputado</div>
        <div style="font-size:26px;font-weight:900;color:#f87171;">${brlK(custoMensalTotal)}<span style="font-size:14px;color:#71717a;">/mês</span></div>
        <div style="font-size:12px;color:#52525b;margin-top:2px;">${brlK(custoAnual)}/ano · ${brlK(custoMandato)}/mandato (4 anos)</div>
      </div>

      <!-- Breakdown -->
      ${barItem("Subsídio (salário)", d.salario_dep, (d.salario_dep/custoMensalTotal)*100, "#f87171")}
      ${barItem("Verba de gabinete (pessoal)", d.gastos_gabinete, (d.gastos_gabinete/custoMensalTotal)*100, "#fbbf24")}
      ${barItem("Cota Parlamentar CEAP (média)", d.ceap_medio, (d.ceap_medio/custoMensalTotal)*100, "#a78bfa")}
      ${barItem("Passagens aéreas", d.passagens_mes, (d.passagens_mes/custoMensalTotal)*100, "#60a5fa")}
      ${barItem("Aux. moradia + saúde", d.auxilio_moradia + d.auxilio_saude, ((d.auxilio_moradia+d.auxilio_saude)/custoMensalTotal)*100, "#34d399")}

      <!-- Custo por cidadão -->
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #1f2937;">
        <div style="font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Quanto VOCÊ paga por ${nome}?</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#18181b;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:18px;font-weight:900;color:#a78bfa;">${brl(custoPorContribuinte)}</div>
            <div style="font-size:10px;color:#52525b;margin-top:2px;">por ano</div>
          </div>
          <div style="background:#18181b;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:18px;font-weight:900;color:#a78bfa;">${brl(custoPorContribuinteMandato)}</div>
            <div style="font-size:10px;color:#52525b;margin-top:2px;">por mandato (4 anos)</div>
          </div>
        </div>
        ${custoPorVoto ? `
        <div style="margin-top:8px;background:#1c0505;border:1px solid #7f1d1d;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:14px;font-weight:900;color:#f87171;">${brl(custoPorVoto)}</div>
          <div style="font-size:10px;color:#7f1d1d;margin-top:2px;">custo por voto emitido no mandato (${votos.toLocaleString("pt-BR")} votações)</div>
        </div>` : ""}
        <div style="margin-top:8px;font-size:11px;color:#52525b;">
          ≈ <strong style="color:#fbbf24;">${salMinEquiv}×</strong> o salário mínimo apenas em remuneração direta.
          Todos os 513 deputados custam <strong style="color:#f87171;">${brlK(custoAnual * d.deputados)}/ano</strong> ao país.
        </div>
      </div>
      <div style="font-size:10px;color:#3f3f46;margin-top:10px;">
        * Estimativas baseadas em dados oficiais: DIAP, Portal da Transparência, Câmara dos Deputados (2023/2024).
        Valores reais por deputado variam conforme uso da CEAP e estrutura de gabinete.
      </div>`;

    bot("atencao", `💸 Custo Real do Mandato — ${nome}`, html);
    chips([
      { emoji: "📝", label: "Gerar denúncia se irregularidade", acao: () => window.HyperBotDenuncia?.gerarDenuncia?.(dep) },
      { emoji: "🔗", label: "Cruzar fornecedores",             acao: () => window.HyperBotCruzador?.cruzarFornecedores?.(dep?.id, nome) },
      { emoji: "💰", label: "Ver gastos reais CEAP",           acao: () => window.HyperBotAgent?.processarMensagem?.("gastos") },
    ]);
  }

  // ─── 2. Calculadora de imposto pessoal ──────────────────────────────────────
  function calcularImposto(salarioBruto) {
    if (!salarioBruto || salarioBruto < 1) {
      bot("info", "🧮 Calculadora de Imposto — Qual seu salário?",
        `Vou mostrar quanto do seu salário vai para o governo e para onde esse dinheiro vai.<br><br>
         <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           ✏️ Digite no chat: <em style="color:#a78bfa;">"imposto de 5000"</em><br>
           ✏️ Ou: <em style="color:#a78bfa;">"meu imposto salário 8500"</em><br>
           ✏️ Ou apenas o número: <em style="color:#a78bfa;">"3200"</em>
         </div>
         <div style="font-size:11px;color:#52525b;margin-top:8px;">Use o valor bruto (antes do desconto).</div>`);
      window.HyperBotAgent && (window.HyperBotAgent.ctx.aguardandoResposta = "calculadora_salario");
      return;
    }

    const sal = parseFloat(salarioBruto);
    const d   = DADOS_OFICIAIS;

    // INSS 2024 (tabela simplificada)
    let inss = 0;
    if (sal <= 1412.00)      inss = sal * 0.075;
    else if (sal <= 2666.68) inss = sal * 0.09;
    else if (sal <= 4000.03) inss = sal * 0.12;
    else if (sal <= 7786.02) inss = sal * 0.14;
    else                     inss = 7786.02 * 0.14;
    inss = Math.round(inss * 100) / 100;

    const baseIR = sal - inss;

    // IRPF 2024
    let ir = 0;
    if (baseIR <= 2259.20)     ir = 0;
    else if (baseIR <= 2826.65) ir = baseIR * 0.075 - 169.44;
    else if (baseIR <= 3751.05) ir = baseIR * 0.15  - 381.44;
    else if (baseIR <= 4664.68) ir = baseIR * 0.225 - 662.77;
    else                        ir = baseIR * 0.275 - 896.00;
    ir = Math.max(0, Math.round(ir * 100) / 100);

    const liquido = sal - inss - ir;
    const totalTributos = inss + ir;
    const pctTotal = ((totalTributos / sal) * 100).toFixed(1);

    // Estimativa de impostos indiretos (consumo — ICMS, PIS, COFINS, IPI)
    const indiretos = liquido * 0.36; // estimativa: 36% do líquido vai em impostos no consumo
    const cargaTotal = totalTributos + indiretos;
    const pctCargaTotal = ((cargaTotal / sal) * 100).toFixed(1);

    // Destino proporcional (orcamento federal 2023)
    const destinos = [
      { label: "Previdência Social", pct: 39.5, cor: "#60a5fa" },
      { label: "Juros da dívida pública", pct: 22.3, cor: "#f87171" },
      { label: "Saúde", pct: 10.1, cor: "#34d399" },
      { label: "Educação", pct: 4.8, cor: "#a78bfa" },
      { label: "Assistência Social", pct: 7.2, cor: "#fbbf24" },
      { label: "Segurança / Defesa", pct: 3.5, cor: "#fb923c" },
      { label: "Câmara + Senado", pct: 0.6, cor: "#e879f9" },
      { label: "Outros", pct: 12.0, cor: "#52525b" },
    ];

    const deputadosCusto = (cargaTotal * 12 * 0.006).toFixed(2);

    const destinosHtml = destinos.map(d => {
      const val = ((cargaTotal * d.pct) / 100);
      return `<div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
          <span style="color:#d4d4d8;">${d.label}</span>
          <span style="color:${d.cor};font-weight:700;">${brl(val)}/mês</span>
        </div>
        <div style="height:4px;border-radius:2px;background:#1f2937;">
          <div style="height:100%;border-radius:2px;background:${d.cor};width:${d.pct}%;"></div>
        </div>
      </div>`;
    }).join("");

    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
        <div style="background:#18181b;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:14px;font-weight:900;color:#34d399;">${brl(sal)}</div>
          <div style="font-size:10px;color:#52525b;margin-top:2px;">Bruto</div>
        </div>
        <div style="background:#18181b;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:14px;font-weight:900;color:#f87171;">${brl(totalTributos)}</div>
          <div style="font-size:10px;color:#52525b;margin-top:2px;">INSS + IR (${pctTotal}%)</div>
        </div>
        <div style="background:#18181b;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:14px;font-weight:900;color:#a78bfa;">${brl(liquido)}</div>
          <div style="font-size:10px;color:#52525b;margin-top:2px;">Líquido</div>
        </div>
      </div>

      <div style="background:#1c0505;border:1px solid #7f1d1d;border-radius:8px;padding:10px;margin-bottom:12px;">
        <div style="font-size:11px;color:#f87171;font-weight:700;margin-bottom:4px;">Carga tributária real estimada: ~${pctCargaTotal}% do seu salário</div>
        <div style="font-size:11px;color:#9ca3af;">
          Além do INSS e IR, você paga ~R$ ${indiretos.toFixed(0)}/mês em impostos indiretos
          (ICMS, PIS, COFINS, IPI) embutidos nos preços do que consome.
        </div>
      </div>

      <div style="font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Para onde vai seu dinheiro?</div>
      ${destinosHtml}

      <div style="margin-top:10px;padding:8px;background:#0a0a0d;border-radius:8px;font-size:11px;color:#71717a;">
        🏛️ Dos seus impostos, aproximadamente <strong style="color:#e879f9;">${brl(parseFloat(deputadosCusto))}/ano</strong>
        financia a Câmara e o Senado. Cada um dos 513 deputados custa ~${brl(DADOS_OFICIAIS.custo_total_anual / 12)}/mês.
      </div>`;

    bot("info", `🧮 Sua Contribuição Fiscal — ${brl(sal)}/mês`, html);
    chips([
      { emoji: "💸", label: "Custo do mandato",       acao: () => calcularCustoMandato(window._currentDeputy) },
      { emoji: "🏆", label: "Ranking de gastos CEAP", acao: () => window.HyperBotCruzador?.rankearPorGastos?.() },
      { emoji: "📢", label: "Canais de denúncia",     acao: () => window.HyperBotDenuncia?.mostrarCanais?.() },
    ]);
  }

  // ─── 3. Eficiência parlamentar ───────────────────────────────────────────────
  async function calcularEficiencia(dep) {
    dep = dep || window._currentDeputy;
    if (!dep) {
      bot("info", "📊 Eficiência Parlamentar — Busque um deputado",
        `Calculo o custo por voto emitido e o índice de participação.<br><br>
         <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           ✏️ Busque um deputado primeiro: <em style="color:#a78bfa;">"ver Tabata Amaral"</em><br>
           ✏️ Depois diga: <em style="color:#a78bfa;">"eficiência parlamentar"</em>
         </div>`);
      chips([
        { emoji: "🔍", label: "Buscar deputado",   acao: () => window.HyperBotAgent?.processarMensagem?.("buscar deputado") },
        { emoji: "💸", label: "Custo do mandato",  acao: () => calcularCustoMandato() },
      ]);
      return;
    }
    const nome = dep.ultimoStatus?.nomeEleitoral || dep.nomeCivil;
    bot("info", `📊 Calculando eficiência de ${nome}...`, "Buscando votações e gastos...");

    try {
      const [votData, despData] = await Promise.allSettled([
        fetchApi("get_deputy_votes", { id: dep.id }),
        fetchApi("proxy_camara", { endpoint: `deputados/${dep.id}/despesas?ano=${new Date().getFullYear()}&pagina=1&itens=200` }),
      ]);

      const votos = votData.value?.votacoes?.length || votData.value?.dados?.length || 0;
      const despesas = despData.value?.dados || [];
      const totalGasto = despesas.reduce((a, c) => a + parseFloat(c.valorLiquido || 0), 0);

      const d = DADOS_OFICIAIS;
      const custoAnual = d.custo_total_anual;
      const custoPorVoto = votos > 0 ? (custoAnual / votos) : null;
      const eficiencia = votos > 0 ? Math.min(100, Math.round((votos / 250) * 100)) : 0;
      const corEfic = eficiencia >= 70 ? "#34d399" : eficiencia >= 40 ? "#fbbf24" : "#f87171";

      const html = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <div style="background:#18181b;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:${corEfic};">${votos}</div>
            <div style="font-size:10px;color:#52525b;margin-top:2px;">votações no ano</div>
          </div>
          <div style="background:#18181b;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#a78bfa;">${eficiencia}%</div>
            <div style="font-size:10px;color:#52525b;margin-top:2px;">índice de participação</div>
          </div>
        </div>
        ${custoPorVoto ? `
        <div style="background:#1c0505;border:1px solid #451a03;border-radius:8px;padding:10px;margin-bottom:10px;text-align:center;">
          <div style="font-size:18px;font-weight:900;color:#fbbf24;">${brl(custoPorVoto)}</div>
          <div style="font-size:11px;color:#78350f;margin-top:2px;">custo para o contribuinte por cada voto emitido</div>
        </div>` : ""}
        <div style="font-size:11px;color:#71717a;line-height:1.6;">
          Custo anual estimado do mandato: <strong style="color:#f87171;">${brlK(custoAnual)}</strong><br>
          Gasto CEAP no ano: <strong style="color:#fbbf24;">${brlK(totalGasto)}</strong><br>
          ${votos === 0 ? "<strong style='color:#f87171;'>⚠️ Nenhuma votação encontrada — verifique presença.</strong>" : ""}
        </div>`;

      bot("info", `📊 Eficiência Parlamentar — ${nome}`, html);
      chips([
        { emoji: "💸", label: "Custo total do mandato", acao: () => calcularCustoMandato(dep, votos * 4) },
        { emoji: "🗳️", label: "Ver votações",           acao: () => window.HyperBotAgent?.processarMensagem?.("votações") },
        { emoji: "💰", label: "Ver gastos CEAP",        acao: () => window.HyperBotAgent?.processarMensagem?.("gastos") },
      ]);
    } catch {
      bot("atencao", "📊 Erro", "Não foi possível calcular a eficiência agora.");
    }
  }

  // ─── Export ─────────────────────────────────────────────────────────────────
  window.HyperBotCalculadora = {
    calcularCustoMandato,
    calcularImposto,
    calcularEficiencia,
    DADOS_OFICIAIS,
    _runHandler(idx) { const fn = _handlers[idx]; if (typeof fn === "function") fn(); },
  };
})();
