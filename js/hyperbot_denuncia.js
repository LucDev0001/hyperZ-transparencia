/**
 * hyperbot_denuncia.js — Gerador de Denúncias Formais
 *
 * Ajuda o cidadão a transformar os dados encontrados em uma denúncia
 * formal estruturada, pronta para enviar aos órgãos competentes.
 *
 * Canais suportados: CGU Fala.BR · MPF · TCU · Ouvidoria Câmara · ENCCLA
 * Sem dependência de IA ou integrações externas.
 */
(function () {
  "use strict";

  // ─── helpers ────────────────────────────────────────────────────────────────
  function bot(sev, titulo, html) {
    window.HyperBotChat?.pushBotMsg?.(sev, titulo, html);
  }
  function chips(list) {
    window.HyperBotAgent?.mostrarChips?.(list);
  }

  const _handlers = [];
  function reg(fn) { const i = _handlers.length; _handlers.push(fn); return i; }

  // ─── Canais de denúncia ─────────────────────────────────────────────────────
  const CANAIS = [
    {
      nome: "CGU — Fala.BR",
      icone: "🏛️",
      cor: "#60a5fa",
      url: "https://falabr.cgu.gov.br",
      desc: "Plataforma integrada de ouvidorias do Governo Federal. Denúncias são investigadas pela Controladoria-Geral da União.",
      ideal: "gastos irregulares, nepotismo, servidores, contratos suspeitos",
    },
    {
      nome: "MPF — Ministério Público Federal",
      icone: "⚖️",
      cor: "#f87171",
      url: "https://www.mpf.mp.br/navegando-no-mpf/formas-de-contato",
      desc: "Para crimes federais: corrupção, lavagem de dinheiro, improbidade administrativa.",
      ideal: "corrupção, desvio de verbas federais, crimes contra administração pública",
    },
    {
      nome: "TCU — Tribunal de Contas da União",
      icone: "📋",
      cor: "#fbbf24",
      url: "https://portal.tcu.gov.br/ouvidoria/",
      desc: "Fiscaliza o uso de recursos públicos federais. Recebe denúncias sobre irregularidades em contratos e licitações.",
      ideal: "contratos suspeitos, licitações fraudadas, superfaturamento",
    },
    {
      nome: "Ouvidoria da Câmara",
      icone: "👔",
      cor: "#a78bfa",
      url: "https://www.camara.leg.br/ouvidoria",
      desc: "Ouvidoria interna da Câmara dos Deputados. Recebe denúncias sobre deputados e uso da CEAP.",
      ideal: "uso irregular da cota parlamentar (CEAP), conduta de deputados",
    },
    {
      nome: "COAF — Conselho de Controle de Atividades Financeiras",
      icone: "💰",
      cor: "#34d399",
      url: "https://www.gov.br/coaf",
      desc: "Recebe comunicações de operações financeiras suspeitas.",
      ideal: "lavagem de dinheiro, movimentações financeiras atípicas, enriquecimento ilícito",
    },
    {
      nome: "Transparência Internacional Brasil",
      icone: "🌐",
      cor: "#71717a",
      url: "https://transparenciainternacional.org.br/denuncie/",
      desc: "ONG independente. Não tem poder de punição, mas amplifica casos e pressiona instituições.",
      ideal: "casos de grande repercussão, quando órgãos públicos são omissos",
    },
  ];

  // ─── Templates de denúncia ───────────────────────────────────────────────────
  function gerarTextoDenuncia(dep, dados) {
    const nome  = dep?.ultimoStatus?.nomeEleitoral || dep?.nomeCivil || dep?.nome || "Não identificado";
    const uf    = dep?.ultimoStatus?.siglaUf || "–";
    const partido = dep?.ultimoStatus?.siglaPartido || "–";
    const data  = new Date().toLocaleDateString("pt-BR");
    const hora  = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const linhas = [
      "═══════════════════════════════════════════",
      "   DENÚNCIA DE IRREGULARIDADE — DADOS OFICIAIS",
      "═══════════════════════════════════════════",
      "",
      `Data: ${data} às ${hora}`,
      `Fonte dos dados: Portal HyperZ Transparência (dados.gov.br / LAI)`,
      "",
      "─── IDENTIFICAÇÃO DO DENUNCIADO ───────────",
      `Nome: ${nome}`,
      `Partido: ${partido} | UF: ${uf}`,
      dep?.id ? `ID Câmara: ${dep.id}` : "",
      "",
      "─── IRREGULARIDADES ENCONTRADAS ──────────",
    ];

    let temIrregularidade = false;

    if (dados?.sancoes) {
      const tot = (dados.sancoes.ceis?.length || 0) + (dados.sancoes.cnep?.length || 0)
                + (dados.sancoes.ceaf?.length || 0) + (dados.sancoes.cepim?.length || 0);
      if (tot > 0) {
        temIrregularidade = true;
        linhas.push(`[SANÇÕES OFICIAIS — ${tot} registro(s)]`);
        if (dados.sancoes.ceis?.length) linhas.push(`  • CEIS (Empresas Inidôneas): ${dados.sancoes.ceis.length} entrada(s)`);
        if (dados.sancoes.cnep?.length) linhas.push(`  • CNEP (Empresas Punidas): ${dados.sancoes.cnep.length} entrada(s)`);
        if (dados.sancoes.ceaf?.length) linhas.push(`  • CEAF (Expulsões): ${dados.sancoes.ceaf.length} entrada(s)`);
        if (dados.sancoes.cepim?.length) linhas.push(`  • CEPIM (ONGs Impedidas): ${dados.sancoes.cepim.length} entrada(s)`);
        linhas.push("");
      }
    }

    if (dados?.processos?.length) {
      temIrregularidade = true;
      linhas.push(`[PROCESSOS JUDICIAIS — ${dados.processos.length} processo(s) — Fonte: DataJud/CNJ]`);
      dados.processos.slice(0, 5).forEach(p => {
        linhas.push(`  • ${p.numeroProcesso || p.numero || "Nº não disponível"} — ${p.classe?.nome || p.orgaoJulgador?.nome || "Tribunal não especificado"}`);
      });
      linhas.push("");
    }

    if (dados?.gastosAtipicos?.length) {
      temIrregularidade = true;
      linhas.push(`[GASTOS ATÍPICOS — CEAP (Cota Parlamentar)]`);
      dados.gastosAtipicos.slice(0, 5).forEach(g => {
        const val = parseFloat(g.valorLiquido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        linhas.push(`  • ${g.tipoDespesa || "Despesa"}: R$ ${val} — ${g.nomeFornecedor || "Fornecedor não identificado"} (${g.dataDocumento || "–"})`);
      });
      linhas.push("");
    }

    if (dados?.patrimonioVar > 50) {
      temIrregularidade = true;
      linhas.push(`[CRESCIMENTO PATRIMONIAL ATÍPICO]`);
      linhas.push(`  • Aumento de ${dados.patrimonioVar.toFixed(1)}% entre as eleições — acima da inflação do período.`);
      linhas.push("");
    }

    if (!temIrregularidade) {
      linhas.push("  • Suspeita de irregularidade — dados em análise.");
      linhas.push("  • Consultar as fontes citadas para verificação completa.");
      linhas.push("");
    }

    linhas.push(
      "─── FUNDAMENTAÇÃO LEGAL ──────────────────",
      "  • Lei nº 8.429/1992 — Improbidade Administrativa",
      "  • Lei nº 12.527/2011 — Lei de Acesso à Informação (LAI)",
      "  • Lei nº 12.846/2013 — Lei Anticorrupção",
      "  • Resolução da Mesa da Câmara nº 55/2012 — CEAP",
      "",
      "─── FONTES DOS DADOS ─────────────────────",
      "  • Portal da Transparência: transparencia.gov.br",
      "  • API Câmara dos Deputados: dadosabertos.camara.leg.br",
      "  • DataJud/CNJ: datajud.cnj.jus.br",
      "  • TSE: dados.tse.jus.br",
      "  • Todos os dados são públicos (LAI / dados.gov.br)",
      "",
      "─── PEDIDO ────────────────────────────────",
      "  Solicito a apuração das irregularidades apontadas,",
      "  com base nos dados públicos oficiais acima listados,",
      "  e que sejam tomadas as medidas cabíveis.",
      "",
      "═══════════════════════════════════════════",
      "  Gerado pelo Portal HyperZ Transparência",
      `  hyperzcommunity.com · ${data}`,
      "═══════════════════════════════════════════",
    );

    return linhas.filter(l => l !== null && l !== undefined).join("\n");
  }

  // ─── Exibir canais ───────────────────────────────────────────────────────────
  function mostrarCanais() {
    const html = CANAIS.map(c => {
      const idx = reg(() => window.open(c.url, "_blank", "noopener"));
      return `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #1a1a24;align-items:flex-start;">
        <span style="font-size:18px;flex-shrink:0;margin-top:1px;">${c.icone}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:12px;color:${c.cor};">${c.nome}</div>
          <div style="font-size:11px;color:#71717a;line-height:1.4;margin:2px 0;">${c.desc}</div>
          <div style="font-size:10px;color:#52525b;">✓ Ideal para: ${c.ideal}</div>
        </div>
        <button onclick="window.HyperBotDenuncia._runHandler(${idx})"
                style="flex-shrink:0;padding:5px 10px;background:#18181b;border:1px solid #27272a;
                       border-radius:7px;color:#a78bfa;font-size:11px;font-weight:700;cursor:pointer;">
          Abrir →
        </button>
      </div>`;
    }).join("");

    bot("info", "📢 Canais Oficiais de Denúncia", html);
    chips([
      { emoji: "📝", label: "Gerar texto de denúncia", acao: () => gerarDenuncia() },
      { emoji: "🔍", label: "Investigar antes de denunciar", acao: () => window.HyperBotAgent?.processarMensagem?.("investigação completa") },
    ]);
  }

  // ─── Gerar e mostrar denúncia ────────────────────────────────────────────────
  function gerarDenuncia(dep, dados) {
    dep = dep || window._currentDeputy;

    if (!dep) {
      bot("info", "📝 Denúncia — Qual político?",
        "Primeiro busque um político para gerar a denúncia com os dados corretos.<br>" +
        "Ex: <em>\"ver João Silva\"</em> e depois <em>\"gerar denúncia\"</em>.");
      chips([
        { emoji: "🔍", label: "Buscar político", acao: () => window.HyperBotAgent?.processarMensagem?.("buscar político") },
        { emoji: "📢", label: "Ver canais de denúncia", acao: mostrarCanais },
      ]);
      return;
    }

    const nome = dep.ultimoStatus?.nomeEleitoral || dep.nomeCivil || dep.nome;
    bot("info", `📝 Gerando denúncia sobre ${nome}...`, "Consolidando dados encontrados...");

    setTimeout(() => {
      // Coleta dados disponíveis no contexto global
      const dadosColetados = {
        sancoes:      window._lastSancoes    || null,
        processos:    window._lastProcessos  || null,
        gastosAtipicos: window._lastGastos   || null,
        patrimonioVar:  window._lastPatrimonioVar || 0,
      };

      const texto = gerarTextoDenuncia(dep, dadosColetados);

      // Mostrar preview
      const preview = texto.substring(0, 400).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");
      bot("positivo", "📝 Denúncia Gerada", `
        <div style="background:#0a0a0d;border:1px solid #27272a;border-radius:8px;padding:10px;
                    font-family:monospace;font-size:11px;color:#a1a1aa;line-height:1.6;
                    max-height:180px;overflow-y:auto;">
          ${preview}…
        </div>
        <div style="font-size:11px;color:#52525b;margin-top:8px;">
          Texto completo copiado ao clicar em "Copiar". Cole em qualquer canal de denúncia.
        </div>`);

      // Guardar texto para uso posterior
      window._ultimaDenuncia = texto;
      window._ultimaDenunciaName = nome;

      chips([
        { emoji: "📋", label: "Copiar texto completo",  acao: () => copiarDenuncia() },
        { emoji: "💬", label: "Enviar via WhatsApp",    acao: () => compartilharWhatsapp(nome) },
        { emoji: "📢", label: "Ver canais de envio",    acao: mostrarCanais },
        { emoji: "🔍", label: "Investigar mais primeiro", acao: () => window.HyperBotAgent?.processarMensagem?.("investigação completa") },
      ]);
    }, 800);
  }

  // ─── Copiar para clipboard ───────────────────────────────────────────────────
  async function copiarDenuncia() {
    const texto = window._ultimaDenuncia;
    if (!texto) {
      bot("atencao", "Nenhuma denúncia gerada", "Gere uma denúncia primeiro usando <em>\"gerar denúncia\"</em>.");
      return;
    }
    try {
      await navigator.clipboard.writeText(texto);
      bot("positivo", "✅ Copiado!", `
        Texto da denúncia copiado para a área de transferência.<br><br>
        <strong style="color:#34d399;">Próximos passos:</strong><br>
        1. Abra o canal desejado (CGU, MPF, TCU...)<br>
        2. Cole o texto (Ctrl+V ou ⌘+V)<br>
        3. Adicione seus dados pessoais como denunciante<br>
        4. Envie e guarde o número de protocolo`);
      chips([
        { emoji: "🏛️", label: "Abrir CGU Fala.BR",  acao: () => window.open("https://falabr.cgu.gov.br", "_blank") },
        { emoji: "⚖️", label: "Abrir MPF",           acao: () => window.open("https://www.mpf.mp.br/navegando-no-mpf/formas-de-contato", "_blank") },
        { emoji: "📋", label: "Abrir TCU",            acao: () => window.open("https://portal.tcu.gov.br/ouvidoria/", "_blank") },
      ]);
    } catch {
      // Fallback: mostrar em textarea copiável
      bot("atencao", "📋 Copie manualmente", `
        <textarea onclick="this.select()"
                  style="width:100%;height:120px;background:#0a0a0d;border:1px solid #27272a;
                         border-radius:8px;color:#a1a1aa;font-size:10px;font-family:monospace;
                         padding:8px;resize:vertical;"
                  readonly>${texto}</textarea>
        <div style="font-size:11px;color:#52525b;margin-top:4px;">Clique na área acima e pressione Ctrl+A → Ctrl+C</div>`);
    }
  }

  // ─── Compartilhar WhatsApp ───────────────────────────────────────────────────
  function compartilharWhatsapp(nome) {
    const resumo = `🚨 *Denúncia sobre ${nome || "político"}*\n\n` +
      `Encontrei irregularidades usando dados oficiais do governo.\n` +
      `Verifique você mesmo no Portal HyperZ Transparência:\n` +
      `➡️ Acesse, abra o HyperBot e pesquise o nome.\n\n` +
      `Fonte: transparencia.gov.br / dadosabertos.camara.leg.br`;
    const url = `https://wa.me/?text=${encodeURIComponent(resumo)}`;
    window.open(url, "_blank", "noopener");
  }

  // ─── Dicas de como denunciar ─────────────────────────────────────────────────
  function mostrarDicas() {
    bot("info", "💡 Como fazer uma boa denúncia", `
      <div style="line-height:1.8;font-size:12px;color:#d4d4d8;">
        <div style="margin-bottom:8px;">
          <strong style="color:#a78bfa;">1. Antes de denunciar</strong><br>
          • Use o HyperBot para gerar o dossiê completo (<em>"investigação completa"</em>)<br>
          • Verifique sanções no Radar Anti-Corrupção<br>
          • Salve ou copie os dados encontrados como evidência
        </div>
        <div style="margin-bottom:8px;">
          <strong style="color:#a78bfa;">2. Escolha o canal certo</strong><br>
          • Gastos da CEAP → Ouvidoria da Câmara<br>
          • Corrupção / desvio de verba → MPF ou CGU<br>
          • Contratos suspeitos → TCU<br>
          • Qualquer irregularidade federal → CGU Fala.BR
        </div>
        <div style="margin-bottom:8px;">
          <strong style="color:#a78bfa;">3. Na hora de enviar</strong><br>
          • Cite os números de processo ou registro encontrados<br>
          • Mencione as bases de dados consultadas (CEIS, CNEP, DataJud...)<br>
          • Guarde o número de protocolo da denúncia
        </div>
        <div>
          <strong style="color:#34d399;">4. Você tem proteção legal</strong><br>
          • Lei nº 13.608/2018 protege denunciantes de boa-fé<br>
          • Denúncias anônimas são aceitas pelo Fala.BR e MPF<br>
          • Dados públicos não precisam de prova adicional — são oficiais
        </div>
      </div>`);
    chips([
      { emoji: "📝", label: "Gerar texto de denúncia", acao: () => gerarDenuncia() },
      { emoji: "📢", label: "Ver canais de envio",     acao: mostrarCanais },
    ]);
  }

  // ─── Export ─────────────────────────────────────────────────────────────────
  window.HyperBotDenuncia = {
    mostrarCanais,
    gerarDenuncia,
    copiarDenuncia,
    compartilharWhatsapp,
    mostrarDicas,
    gerarTextoDenuncia,
    _runHandler(idx) { const fn = _handlers[idx]; if (typeof fn === "function") fn(); },
  };
})();
