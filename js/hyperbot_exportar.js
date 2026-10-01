/**
 * hyperbot_exportar.js — Exportar e Compartilhar Investigações
 *
 * Permite ao cidadão salvar e compartilhar os dados encontrados:
 *  • Download de relatório .txt completo
 *  • Copiar resumo para clipboard
 *  • Compartilhar via WhatsApp / Telegram / Twitter(X)
 *  • Gerar card visual de resumo (texto formatado)
 *  • Histórico de investigações da sessão
 *
 * Sem dependência de IA ou serviços externos.
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

  // ─── Histórico de investigações da sessão ────────────────────────────────────
  const _historico = []; // { nome, ts, resumo, texto }

  function registrarInvestigacao(nome, resumo, textoCompleto) {
    _historico.unshift({ nome, ts: Date.now(), resumo, texto: textoCompleto });
    if (_historico.length > 20) _historico.pop();
  }

  // ─── Gerar relatório de texto completo ──────────────────────────────────────
  function gerarRelatorio(dep, dados) {
    dep  = dep  || window._currentDeputy;
    dados = dados || {};

    if (!dep) {
      bot("info", "📄 Exportar — Primeiro busque um político",
        `O relatório é gerado com todos os dados encontrados durante a investigação.<br><br>
         <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           <strong style="color:#fff;">Como fazer:</strong><br>
           1️⃣ Busque: <em style="color:#a78bfa;">"ver [nome do deputado]"</em><br>
           2️⃣ Investigue: <em style="color:#a78bfa;">"investigação completa"</em><br>
           3️⃣ Exporte: <em style="color:#a78bfa;">"baixar relatório"</em>
         </div>`);
      chips([
        { emoji: "🔍", label: "Buscar deputado",          acao: () => window.HyperBotAgent?.processarMensagem?.("buscar deputado") },
        { emoji: "🕵️", label: "Investigação completa",    acao: () => window.HyperBotAgent?.processarMensagem?.("investigação completa") },
      ]);
      return null;
    }

    const nome    = dep.ultimoStatus?.nomeEleitoral || dep.nomeCivil || "Deputado";
    const partido = dep.ultimoStatus?.siglaPartido  || "–";
    const uf      = dep.ultimoStatus?.siglaUf       || "–";
    const data    = new Date().toLocaleDateString("pt-BR");
    const hora    = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const linhas = [
      "╔══════════════════════════════════════════════╗",
      "║      RELATÓRIO DE INVESTIGAÇÃO PÚBLICA       ║",
      "║         Portal HyperZ Transparência          ║",
      "╚══════════════════════════════════════════════╝",
      "",
      `Data: ${data} às ${hora}`,
      `Gerado por: HyperZ Agente (hyperzcommunity.com)`,
      `Dados: Portal da Transparência / LAI / dados.gov.br`,
      "",
      "══ IDENTIFICAÇÃO ══════════════════════════════",
      `Nome:    ${nome}`,
      `Partido: ${partido}   |   UF: ${uf}`,
      dep.id ? `ID Câmara: ${dep.id}` : "",
      dep.ultimoStatus?.email ? `Email: ${dep.ultimoStatus.email}` : "",
      dep.ultimoStatus?.situacao ? `Situação: ${dep.ultimoStatus.situacao}` : "",
      "",
    ];

    // Score de risco
    if (dados.score !== undefined) {
      const nivel = dados.score >= 70 ? "ALTO" : dados.score >= 40 ? "MÉDIO" : "BAIXO";
      linhas.push("══ SCORE DE RISCO ═════════════════════════════");
      linhas.push(`Score: ${dados.score}/100 — Nível: ${nivel}`);
      if (dados.fatores?.length) {
        dados.fatores.forEach(f => linhas.push(`  ${f.icon || "•"} ${f.desc} (+${f.pts}pts)`));
      }
      linhas.push("");
    }

    // Sanções
    if (dados.sancoes) {
      const tot = (dados.sancoes.ceis?.length || 0) + (dados.sancoes.cnep?.length || 0)
                + (dados.sancoes.ceaf?.length || 0) + (dados.sancoes.cepim?.length || 0);
      linhas.push("══ SANÇÕES OFICIAIS ═══════════════════════════");
      linhas.push(`Total: ${tot} registro(s)`);
      if (dados.sancoes.ceis?.length)  linhas.push(`  CEIS:  ${dados.sancoes.ceis.length}`);
      if (dados.sancoes.cnep?.length)  linhas.push(`  CNEP:  ${dados.sancoes.cnep.length}`);
      if (dados.sancoes.ceaf?.length)  linhas.push(`  CEAF:  ${dados.sancoes.ceaf.length}`);
      if (dados.sancoes.cepim?.length) linhas.push(`  CEPIM: ${dados.sancoes.cepim.length}`);
      if (dados.sancoes.pep?.length)   linhas.push(`  PEP:   ${dados.sancoes.pep.length}`);
      linhas.push("");
    }

    // Processos
    if (dados.processos?.length) {
      linhas.push("══ PROCESSOS JUDICIAIS (DataJud/CNJ) ══════════");
      linhas.push(`Total: ${dados.processos.length} processo(s)`);
      dados.processos.slice(0, 8).forEach(p => {
        linhas.push(`  • ${p.numeroProcesso || p.numero || "–"} — ${p.orgaoJulgador?.nome || p.tribunal || "–"}`);
        if (p.assuntos?.length) linhas.push(`    Assunto: ${p.assuntos[0]?.nome || "–"}`);
      });
      linhas.push("");
    }

    // Gastos
    if (dados.totalGastos !== undefined) {
      linhas.push("══ GASTOS CEAP (Cota Parlamentar) ═════════════");
      linhas.push(`Total no ano: ${brl(dados.totalGastos)}`);
      if (dados.maiorFornecedor) {
        linhas.push(`Maior fornecedor: ${dados.maiorFornecedor}`);
      }
      if (dados.gastosCategoria?.length) {
        dados.gastosCategoria.slice(0, 5).forEach(([cat, val]) =>
          linhas.push(`  ${cat}: ${brl(val)}`));
      }
      linhas.push("");
    }

    // Patrimônio
    if (dados.patrimonio) {
      linhas.push("══ PATRIMÔNIO (TSE) ══════════════════════════");
      if (dados.patrimonio.total2022) linhas.push(`2022: ${brl(dados.patrimonio.total2022)}`);
      if (dados.patrimonio.total2018) linhas.push(`2018: ${brl(dados.patrimonio.total2018)}`);
      if (dados.patrimonio.variacao)  linhas.push(`Variação: ${dados.patrimonio.variacao.toFixed(1)}%`);
      linhas.push("");
    }

    // Financiamento
    if (dados.doadores?.length) {
      linhas.push("══ FINANCIAMENTO DE CAMPANHA (TSE 2022) ══════");
      dados.doadores.slice(0, 5).forEach(d =>
        linhas.push(`  • ${d.nome || d.nmDoador || "–"}: ${brl(d.valor || d.vlrDoacoes)}`));
      linhas.push("");
    }

    linhas.push(
      "══ FONTES DOS DADOS ══════════════════════════",
      "  • transparencia.gov.br (CGU / Portal da Transparência)",
      "  • dadosabertos.camara.leg.br (Câmara dos Deputados)",
      "  • datajud.cnj.jus.br (CNJ — Conselho Nacional de Justiça)",
      "  • dados.tse.jus.br (Tribunal Superior Eleitoral)",
      "  • Lei nº 12.527/2011 — Lei de Acesso à Informação",
      "",
      "══ AVISO ═════════════════════════════════════",
      "  Este relatório contém dados públicos obtidos por meio da LAI.",
      "  O HyperZ não garante completude. Dados podem ter atualizações",
      "  posteriores. Para fins legais, consulte as fontes originais.",
      "",
      "══════════════════════════════════════════════",
      `  Portal HyperZ Transparência — ${data}`,
      "══════════════════════════════════════════════",
    );

    return linhas.filter(l => l !== null && l !== undefined).join("\n");
  }

  // ─── Download como arquivo .txt ─────────────────────────────────────────────
  function baixarRelatorio(dep, dados) {
    dep = dep || window._currentDeputy;
    if (!dep) {
      bot("info", "📄 Baixar relatório — Busque um político primeiro",
        `<div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           1️⃣ Busque: <em style="color:#a78bfa;">"ver [nome]"</em><br>
           2️⃣ Investigue: <em style="color:#a78bfa;">"investigação completa"</em><br>
           3️⃣ Diga: <em style="color:#a78bfa;">"baixar relatório"</em>
         </div>`);
      chips([{ emoji: "🔍", label: "Buscar deputado", acao: () => window.HyperBotAgent?.processarMensagem?.("buscar deputado") }]);
      return;
    }

    // Mescla dados globais disponíveis
    const dadosMerge = {
      score:        window._lastScore        || dados?.score,
      fatores:      window._lastFatores      || dados?.fatores,
      sancoes:      window._lastSancoes      || dados?.sancoes,
      processos:    window._lastProcessos    || dados?.processos,
      totalGastos:  window._lastTotalGastos  || dados?.totalGastos,
      maiorFornecedor: window._lastMaiorFornecedor || dados?.maiorFornecedor,
      patrimonio:   window._lastPatrimonio   || dados?.patrimonio,
      doadores:     window._lastDoadores     || dados?.doadores,
      ...dados,
    };

    const texto = gerarRelatorio(dep, dadosMerge);
    if (!texto) return;

    const nome = (dep.ultimoStatus?.nomeEleitoral || dep.nomeCivil || "deputado")
      .toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const data = new Date().toISOString().slice(0, 10);
    const filename = `hyperz_${nome}_${data}.txt`;

    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Registrar no histórico da sessão
    registrarInvestigacao(dep.ultimoStatus?.nomeEleitoral || dep.nomeCivil, `Score: ${dadosMerge.score ?? "–"} | ${new Date().toLocaleString("pt-BR")}`, texto);

    bot("positivo", "✅ Relatório baixado!", `
      Arquivo <strong>${filename}</strong> salvo no seu dispositivo.<br><br>
      O relatório contém todos os dados encontrados: sanções, processos, gastos, patrimônio e fontes oficiais.`);
    chips([
      { emoji: "💬", label: "Compartilhar via WhatsApp",  acao: () => compartilharWhatsapp(dep) },
      { emoji: "📢", label: "Gerar denúncia formal",      acao: () => window.HyperBotDenuncia?.gerarDenuncia?.(dep, dadosMerge) },
      { emoji: "📋", label: "Copiar resumo",              acao: () => copiarResumo(dep, dadosMerge) },
    ]);
  }

  // ─── Copiar resumo curto ─────────────────────────────────────────────────────
  async function copiarResumo(dep, dados) {
    dep = dep || window._currentDeputy;
    if (!dep) {
      bot("info", "📋 Copiar resumo — Busque um político primeiro",
        `<div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           ✏️ <em style="color:#a78bfa;">"ver [nome do deputado]"</em> para abrir o perfil<br>
           ✏️ Depois: <em style="color:#a78bfa;">"compartilhar"</em> ou <em style="color:#a78bfa;">"copiar resumo"</em>
         </div>`);
      chips([{ emoji: "🔍", label: "Buscar deputado", acao: () => window.HyperBotAgent?.processarMensagem?.("buscar deputado") }]);
      return;
    }

    const nome    = dep.ultimoStatus?.nomeEleitoral || dep.nomeCivil;
    const partido = dep.ultimoStatus?.siglaPartido || "–";
    const uf      = dep.ultimoStatus?.siglaUf || "–";

    const sancoes = window._lastSancoes || dados?.sancoes;
    const totSanc = sancoes
      ? (sancoes.ceis?.length||0)+(sancoes.cnep?.length||0)+(sancoes.ceaf?.length||0)
      : 0;
    const score = window._lastScore ?? dados?.score ?? "–";

    const resumo =
`🔎 INVESTIGAÇÃO: ${nome} (${partido}/${uf})
Gerado pelo Portal HyperZ Transparência — dados oficiais do governo.

📊 Score de Risco: ${score}/100
🚨 Sanções (CEIS/CNEP/CEAF): ${totSanc} registro(s)
⚖️ Processos DataJud: ${window._lastProcessos?.length ?? "–"}

🔗 Verifique você mesmo:
Acesse o Portal HyperZ → abra o HyperBot → pesquise "${nome}"

Fonte: transparencia.gov.br | dadosabertos.camara.leg.br | datajud.cnj.jus.br
#TransparênciaPública #FiscalizeSeuDeputado #HyperZ`;

    try {
      await navigator.clipboard.writeText(resumo);
      bot("positivo", "✅ Resumo copiado!",
        "Cole em qualquer lugar: redes sociais, grupos de WhatsApp, email...<br><br>" +
        `<div style="background:#0a0a0d;border:1px solid #27272a;border-radius:8px;padding:10px;font-size:11px;color:#71717a;white-space:pre-line;">${resumo}</div>`);
    } catch {
      bot("info", "📋 Copie o texto abaixo",
        `<textarea onclick="this.select()" readonly
                   style="width:100%;height:120px;background:#0a0a0d;border:1px solid #27272a;
                          border-radius:8px;color:#a1a1aa;font-size:10px;font-family:monospace;
                          padding:8px;resize:vertical;">${resumo}</textarea>`);
    }
    chips([
      { emoji: "💬", label: "WhatsApp", acao: () => compartilharWhatsapp(dep) },
      { emoji: "🐦", label: "X/Twitter", acao: () => compartilharTwitter(dep) },
      { emoji: "✈️", label: "Telegram",  acao: () => compartilharTelegram(dep) },
    ]);
  }

  // ─── Compartilhar redes sociais ──────────────────────────────────────────────
  function compartilharWhatsapp(dep) {
    const nome  = dep?.ultimoStatus?.nomeEleitoral || dep?.nomeCivil || "deputado";
    const score = window._lastScore ?? "–";
    const texto = `🔎 *Investigação: ${nome}*\n\nScore de risco: *${score}/100*\nDados oficiais do governo (transparencia.gov.br)\n\nVerifique você mesmo no Portal HyperZ Transparência 👇`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  function compartilharTwitter(dep) {
    const nome  = dep?.ultimoStatus?.nomeEleitoral || dep?.nomeCivil || "deputado";
    const score = window._lastScore ?? "–";
    const texto = `🔎 Investiguei ${nome} com dados oficiais do governo. Score de risco: ${score}/100. #TransparênciaPública #FiscalizeSeuDeputado`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  function compartilharTelegram(dep) {
    const nome  = dep?.ultimoStatus?.nomeEleitoral || dep?.nomeCivil || "deputado";
    const texto = `🔎 Investigação sobre ${nome} — dados oficiais do governo. Score de risco: ${window._lastScore ?? "–"}/100. Portal HyperZ Transparência.`;
    window.open(`https://t.me/share/url?url=https://transparencia.gov.br&text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  // ─── Mostrar histórico da sessão ─────────────────────────────────────────────
  function mostrarHistorico() {
    if (!_historico.length) {
      bot("info", "📚 Histórico vazio",
        "Ainda não há investigações nesta sessão. Busque um deputado e faça uma investigação completa.");
      chips([{ emoji: "🔍", label: "Buscar político", acao: () => window.HyperBotAgent?.processarMensagem?.("buscar político") }]);
      return;
    }
    const html = _historico.map((h, i) => {
      const ts = new Date(h.ts).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
      const idxBaixar = reg(() => {
        const blob = new Blob([h.texto], { type: "text/plain;charset=utf-8" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = `hyperz_${h.nome.toLowerCase().replace(/\s+/g,"_")}.txt`;
        a.click(); URL.revokeObjectURL(url);
      });
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #1a1a24;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;color:#e4e4e7;font-size:12px;">${h.nome}</div>
          <div style="font-size:10px;color:#52525b;">${ts} · ${h.resumo}</div>
        </div>
        <button onclick="window.HyperBotExportar._runHandler(${idxBaixar})"
                style="flex-shrink:0;padding:4px 10px;background:#18181b;border:1px solid #27272a;
                       border-radius:7px;color:#a78bfa;font-size:11px;font-weight:700;cursor:pointer;">
          ↓ .txt
        </button>
      </div>`;
    }).join("");
    bot("info", `📚 Histórico — ${_historico.length} investigação(ões)`, html);
    chips([
      { emoji: "🔍", label: "Nova investigação",    acao: () => window.HyperBotAgent?.processarMensagem?.("investigação completa") },
      { emoji: "📢", label: "Gerar denúncia",        acao: () => window.HyperBotDenuncia?.gerarDenuncia?.() },
    ]);
  }

  // ─── Menu de compartilhamento ────────────────────────────────────────────────
  function mostrarMenuCompartilhar(dep) {
    dep = dep || window._currentDeputy;
    if (!dep) {
      bot("info", "📤 Compartilhar — Busque um político primeiro",
        `Para compartilhar os dados de uma investigação, primeiro selecione um deputado.<br><br>
         <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           1️⃣ Busque: <em style="color:#a78bfa;">"ver [nome]"</em><br>
           2️⃣ Investigue: <em style="color:#a78bfa;">"investigação completa"</em><br>
           3️⃣ Diga: <em style="color:#a78bfa;">"compartilhar"</em>
         </div>`);
      chips([{ emoji: "🔍", label: "Buscar deputado", acao: () => window.HyperBotAgent?.processarMensagem?.("buscar deputado") }]);
      return;
    }
    const nome = dep.ultimoStatus?.nomeEleitoral || dep.nomeCivil;
    bot("info", `📤 Compartilhar — ${nome}`, "Escolha como quer salvar ou compartilhar os dados:");
    chips([
      { emoji: "📄", label: "Baixar relatório .txt",   acao: () => baixarRelatorio(dep) },
      { emoji: "📋", label: "Copiar resumo",            acao: () => copiarResumo(dep) },
      { emoji: "💬", label: "Compartilhar WhatsApp",   acao: () => compartilharWhatsapp(dep) },
      { emoji: "🐦", label: "Compartilhar X/Twitter",  acao: () => compartilharTwitter(dep) },
      { emoji: "✈️", label: "Compartilhar Telegram",   acao: () => compartilharTelegram(dep) },
      { emoji: "📝", label: "Gerar denúncia formal",   acao: () => window.HyperBotDenuncia?.gerarDenuncia?.(dep) },
    ]);
  }

  // ─── Export ─────────────────────────────────────────────────────────────────
  window.HyperBotExportar = {
    gerarRelatorio,
    baixarRelatorio,
    copiarResumo,
    mostrarMenuCompartilhar,
    mostrarHistorico,
    compartilharWhatsapp,
    compartilharTwitter,
    compartilharTelegram,
    registrarInvestigacao,
    _runHandler(idx) { const fn = _handlers[idx]; if (typeof fn === "function") fn(); },
  };
})();
