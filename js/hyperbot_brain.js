/**
 * hyperbot_brain.js — Cérebro do Agente HyperZ
 *
 * Transforma o HyperBot em um agente conversacional completo:
 *  • Memória persistente do usuário (cidade, interesses, histórico)
 *  • NLP em português — detecta intenção sem precisar de comandos exatos
 *  • Orquestração de TODAS as ferramentas do portal
 *  • Busca na web (DuckDuckGo + Wikipedia PT via proxy)
 *  • Sugestões proativas baseadas no contexto
 *  • Modo guiado para usuários simples
 *  • Voz (Web Speech API — microfone)
 *
 * Depende de: hyperbot.js, hyperbot_chat.js, hyperbot_osint.js, api.js
 */
(function () {
  "use strict";

  // ════════════════════════════════════════════════════════════════════════
  //  PERFIL DO USUÁRIO — persistido em localStorage
  // ════════════════════════════════════════════════════════════════════════
  const PROFILE_KEY = "hz_agent_v2";
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch (_) {}
  profile = {
    municipio:    profile.municipio    || null,
    uf:           profile.uf           || null,
    deputado:     profile.deputado     || null,
    interesses:   profile.interesses   || [],   // ['saude','educacao','corrupcao']
    historico:    (profile.historico   || []).slice(0, 60),
    sessoes:      profile.sessoes      || 0,
    modoSimples:  profile.modoSimples  || false,
    primeiroUso:  profile.primeiroUso  !== false,
  };

  function salvarPerfil() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) {}
  }

  // ════════════════════════════════════════════════════════════════════════
  //  CONTEXTO DE SESSÃO — em memória (não persiste)
  // ════════════════════════════════════════════════════════════════════════
  const ctx = {
    ultimoPolitico: null,   // nome do último político mencionado
    ultimaEmpresa:  null,
    tarefaAtual:    null,   // 'investigando_dep', 'buscando_municipio', etc.
    aguardandoResposta: null, // pergunta pendente de resposta do user
    mensagensCount: 0,
  };

  // ── Registry de handlers para chips ──────────────────────────────────────
  // Armazena funções reais (com acesso ao closure do IIFE) indexadas por ID.
  // Botões usam onclick="window.HyperBotAgent._runChip(N)" em vez de serializar
  // a função — evita quebra de atributo HTML por aspas e perda de escopo.
  const _chipHandlers = [];

  // ════════════════════════════════════════════════════════════════════════
  //  INTENÇÕES — NLP em português (sem deps externas)
  // ════════════════════════════════════════════════════════════════════════
  const INTENTS = [
    // Configuração de localização
    {
      id: "config_cidade",
      re: /(?:sou de|moro (?:em|na?)|minha cidad[ea]|meu munic[ií]pio|sou d[ao])\s+([A-ZÀ-Úa-zà-ú\s]+)/i,
      extrai: (m) => m[1]?.trim(),
    },
    // Deputado do usuário
    {
      id: "meu_deputado",
      re: /meu\s+(?:dep[ue]tad[oa]|representante)|quem\s+me\s+representa|minha\s+cidade\s+vota|deputad[oa]\s+da\s+minha/i,
    },
    // Buscar político por nome
    {
      id: "buscar_politico",
      re: /(?:buscar?|ver?|abrir?|pesquisar?|mostrar?|quero\s+ver?|investigar?|procurar?)\s+(?:o\s+)?(?:dep[ue]tad[oa]|senador[a]?|vereador[a]?|prefeito|pol[ií]tico\s+)?([A-ZÀ-Úa-zà-ú][a-zà-ú\s]{2,30})/i,
      extrai: (m) => m[1]?.trim(),
    },
    // Gastos / CEAP
    {
      id: "gastos",
      re: /gastos?|despesas?|ceap|verba\s+parlamentar|cota\s+parlamentar|quanto\s+gast/i,
    },
    // Corrupção / Sanções
    {
      id: "corrupcao",
      re: /corrup|sanç[aã]o|sancionad|punid|inid[oô]ne|ceis|cnep|ceaf|cepin|pep\b|ficha\s+suja|ladr[aã]o|desvio/i,
    },
    // Processos judiciais
    {
      id: "processos",
      re: /process[oa]|judicial|tribunal|r[eé]u\b|acusad|improbidade|crime|condenad|pres[oó]\b|juiz|stj|stf|cnj|datajud/i,
    },
    // Notícias
    {
      id: "noticias",
      re: /not[ií]cia|novidade|news|imprensa|reportagem|publicou|jornal|manchete|cobertura/i,
    },
    // Empresa / CNPJ
    {
      id: "empresa",
      re: /empresa|fornecedor|cnpj|contrato\s+com|licit[aã](?:ç[aã]o)?|compra|servi[çc][oa]\s+contratad/i,
    },
    // Município / Prefeitura
    {
      id: "municipio",
      re: /munic[ií]p|prefeitura|c[aâ]mara\s+municipal|secretaria|cidade\b|minha\s+cidade/i,
    },
    // Nepotismo
    {
      id: "nepotismo",
      re: /nepotism|parente|familiar|filho[as]?|esposa|marido|c[oô]njuge|sobrinho|neto|irm[aã]o/i,
    },
    // Patrimônio TSE
    {
      id: "patrimonio",
      re: /patrim[oô]nio|bens?\s+(?:declarad)?|declaraç[aã]o\s+tse|enriquecimento|ficou\s+rico/i,
    },
    // Emendas parlamentares
    {
      id: "emendas",
      re: /emenda|obra\s+parlamentar|pix\s+parlamentar|investimento\s+parlamentar/i,
    },
    // Investigação completa
    {
      id: "investigar_tudo",
      re: /detetive|investigaç[aã]o\s+completa|dossi[eê]|tudo\s+sobre|investiga\s+tudo|investigar?\s+(?:o\s+)?(?:tudo|completo)/i,
    },
    // Ranking
    {
      id: "ranking",
      re: /ranking|top\s+\d*\s*corrup|piores?|mais\s+suspeito|mais\s+investigad/i,
    },
    // Radar anticorrupção
    {
      id: "radar",
      re: /radar|base\s+(?:de\s+)?dados|verificar\s+(?:nome|cpf|cnpj)|buscar\s+sanç/i,
    },
    // Busca na web
    {
      id: "web",
      re: /(?:pesquisar?|buscar?|procurar?)\s+(?:na\s+)?(?:web|internet|google)|o\s+que\s+[eé]\s+|quem\s+[eé]\s+|quem\s+foi\s+|explique?\s+|me\s+fale\s+sobre\s+|o\s+que\s+s[aã]o\s+/i,
      extrai: (m, raw) => raw.replace(/pesquisar?\s+(?:na\s+)?(?:web|internet|google)|o\s+que\s+[eé]?\s+|quem\s+[eé]?\s+|quem\s+foi\s+|explique?\s+|me\s+fale\s+sobre\s+|o\s+que\s+s[aã]o\s+/gi, "").trim(),
    },
    // Rede de conexões
    {
      id: "rede",
      re: /rede|conexão|conexoes|relacion|grafo|mapa\s+de\s+(?:rede|conexão)/i,
    },
    // Viagens
    {
      id: "viagens",
      re: /viagem|viagens|passagem|viajar|missão\s+oficial/i,
    },
    // Mapa
    {
      id: "mapa",
      re: /mapa|repasse|transfer[eê]ncia\s+(?:para\s+)?estado/i,
    },
    // Servidores públicos
    {
      id: "servidores",
      re: /servidor|funcional|salário\s+(?:de\s+)?(?:servidor|funcional)|concurs[ao]/i,
    },
    // Eleições
    {
      id: "eleicoes",
      re: /elei(?:ç[aã]o|coes)|candidato|urna|voto|tse|financiamento\s+(?:de\s+)?campanha/i,
    },
    // Ajuda
    {
      id: "ajuda",
      re: /ajud[ae]|help\b|socorro|como\s+(?:uso|funciona|posso)|o\s+que\s+(?:voc[eê]|vc)\s+(?:faz|pode)|comandos|menu/i,
    },
    // Obrigado / encerramento
    {
      id: "obrigado",
      re: /obrigad[ao]|valeu|brigad[ao]|thanks|massa|top\b|show\b|perfeito|excelente|muito\s+bom/i,
    },
    // Modo simples toggle
    {
      id: "modo_simples",
      re: /modo\s+simples|interface\s+simples|mais\s+simples|difícil\s+de\s+usar|n[aã]o\s+entendo/i,
    },
    // Monitorar político
    {
      id: "monitorar",
      re: /(?:monitorar?|vigiar?|acompanhar?|alertar?-?me\s+sobre)\s+(?:o\s+|a\s+)?([A-ZÀ-Úa-zà-ú][a-zà-úA-ZÀ-Ú\s]{2,40})/i,
      extrai: (m) => m[1]?.trim(),
    },
    // Listar vigilâncias
    {
      id: "minhas_vigilancias",
      re: /minhas?\s+vigil[aâ]ncias?|minha\s+lista\s+de\s+monitor|(?:ver|listar?|mostrar?)\s+monitorad|quem\s+(?:eu\s+)?estou?\s+(?:monitorando|vigiando)/i,
    },
    // Ver alertas do monitor
    {
      id: "ver_alertas",
      re: /(?:ver|mostrar?|meus?)\s+alertas?|novos?\s+alertas?|o\s+que\s+mudou/i,
    },
    // Comparar dois políticos
    {
      id: "comparar",
      re: /comparar?\s+(.+?)\s+(?:com|versus?|vs\.?)\s+(.+)/i,
      extrai: (m) => ({ nome1: m[1]?.trim(), nome2: m[2]?.trim() }),
    },
    // Cruzar fornecedores
    {
      id: "cruzar_fornecedores",
      re: /cruzar?\s+fornecedor|fornecedor\s+suspeito|empresa\s+(?:que\s+)?recebe\s+(?:dinheiro|verba|recurso)|fornecedor.*sancion/i,
    },
    // Ranking de gastos por UF
    {
      id: "ranking_gastos",
      re: /ranking\s+(?:de\s+)?gastos?|(?:maiores?|mais)\s+gastadores?|top\s+(?:gastos?|despesas?)|quem\s+mais\s+gasta/i,
      extrai: (m, raw) => {
        const ufMatch = raw.match(/\b([A-Z]{2})\b/);
        return ufMatch ? ufMatch[1] : null;
      },
    },
    // Votações suspeitas
    {
      id: "votos_suspeitos",
      re: /vot[ao][çc][aã]o\s+suspeita|vot[ao]u?\s+contra\s+o\s+povo|padr[aã]o\s+de\s+vot|vot[ao]\s+(?:com|junto)\s+(?:a\s+)?bancada/i,
    },
    // Mapa do portal / tour
    {
      id: "guia_portal",
      re: /mapa\s+do\s+portal|tour\b|todas?\s+as\s+se[çc][oõ]es|o\s+que\s+(?:tem|existe|posso)\s+(?:no\s+portal|aqui)|menu\s+do\s+portal|funcionalidades|navegar\s+pelo\s+portal|guia\s+do\s+portal/i,
    },
    // "como funciona X" / "o que é X" referente a uma seção
    {
      id: "guia_secao",
      re: /como\s+funciona\s+(?:o\s+|a\s+)?(\w[\w\s]{2,25})|o\s+que\s+[eé]\s+(?:o\s+|a\s+)?(\w[\w\s]{2,20})|para\s+que\s+serve\s+(?:o\s+|a\s+)?(\w[\w\s]{2,20})|me\s+explica\s+(?:o\s+|a\s+)?(\w[\w\s]{2,20})/i,
      extrai: (m) => (m[1] || m[2] || m[3] || m[4])?.trim(),
    },
    // Denúncia
    {
      id: "denuncia",
      re: /den[uú]nci|como\s+denunci|onde\s+denunci|quero\s+denunci|registrar?\s+queixa|canal\s+(?:de\s+)?den|ouvidoria|fala\.?br|mpf\b|tcu\b/i,
    },
    // Custo do mandato / calculadora
    {
      id: "custo_mandato",
      re: /custo\s+(?:do\s+)?mandato|quanto\s+custa\s+(?:o\s+|este?\s+)?dep[ue]tado|quanto\s+(?:eu\s+)?pago\s+(?:por|para)\s+esse|efici[eê]ncia\s+parlamentar|custo\s+por\s+voto/i,
    },
    // Calculadora de imposto pessoal
    {
      id: "calculadora_imposto",
      re: /(?:meu\s+)?imposto\s+(?:de\s+)?(?:renda|salário|mensal)|quanto\s+(?:pago|eu\s+pago)\s+de\s+imposto|calcula\s+(?:meu\s+)?imposto|minha\s+contribui[çc][aã]o\s+fiscal|imposto\s+(?:de\s+)?\d|inss\s+ir\b/i,
      extrai: (m, raw) => {
        const num = raw.replace(/\./g, "").replace(",", ".").match(/\d[\d.]{2,}/);
        return num ? parseFloat(num[0]) : null;
      },
    },
    // Exportar / compartilhar / baixar
    {
      id: "exportar",
      re: /exportar?|baixar?\s+relat[oó]rio|salvar?\s+relat[oó]rio|compartilhar?|whatsapp|telegram|twitter|download|gerar?\s+pdf|copiar?\s+relat[oó]rio/i,
    },
    // Histórico de investigações
    {
      id: "historico_investigacoes",
      re: /hist[oó]rico\s+(?:de\s+)?investiga[çc][oõ]es?|minhas?\s+investiga[çc][oõ]es?|o\s+que\s+(?:j[aá]\s+)?investiguei/i,
    },
  ];

  function detectarIntencao(raw) {
    for (const intent of INTENTS) {
      const m = raw.match(intent.re);
      if (m) {
        const extraido = intent.extrai ? intent.extrai(m, raw) : null;
        return { id: intent.id, match: m, extraido, raw };
      }
    }
    // Detecta CNPJ/CPF
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 14) return { id: "cnpj", digits, raw };
    if (digits.length === 11) return { id: "cpf",  digits, raw };
    // Nome próprio?
    if (/^[A-ZÀ-Ú][a-zà-úA-ZÀ-Ú\s]{2,40}$/.test(raw.trim()) && !/\d/.test(raw)) {
      return { id: "buscar_politico", extraido: raw.trim(), raw };
    }
    return { id: "livre", raw };
  }

  // ════════════════════════════════════════════════════════════════════════
  //  FERRAMENTAS DO PORTAL — registro unificado
  // ════════════════════════════════════════════════════════════════════════
  function dep() { return window._currentDeputy; }
  function depNome() {
    const d = dep();
    return d ? (d.ultimoStatus?.nomeEleitoral || d.nomeCivil) : null;
  }
  function precisaDep(acao) {
    if (!dep()) {
      bot("info", "👔 Primeiro, busque um político",
        `Para <strong>${acao}</strong>, preciso saber quem você quer investigar.<br><br>
         <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
           ✏️ Digite o nome no chat: <em style="color:#a78bfa;">"ver Lula"</em><br>
           ✏️ Ou o estado: <em style="color:#a78bfa;">"deputados de SP"</em><br>
           ✏️ Ou diga: <em style="color:#a78bfa;">"meu deputado federal"</em>
         </div>`);
      mostrarChips([
        { emoji: "🔍", label: "Buscar por nome",      acao: () => solicitarNome("buscar_politico") },
        { emoji: "👔", label: "Meu deputado federal",  acao: () => executar("meu_deputado") },
        { emoji: "🏆", label: "Ver ranking suspeitos", acao: () => executar("ranking") },
      ]);
      return true;
    }
    return false;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RENDERERS INLINE — exibem dados diretamente no feed sem trocar de aba
  // ════════════════════════════════════════════════════════════════════════

  // ── Gastos CEAP ──────────────────────────────────────────────────────────
  async function mostrarGastosInline() {
    const d = dep();
    if (!d) return;
    const nome = depNome();
    const ano  = new Date().getFullYear();
    bot("info", `💰 Buscando gastos de ${nome}...`, `Consultando CEAP — Cota Parlamentar ${ano}...`);
    try {
      const data = await fetchApi("proxy_camara", {
        endpoint: `deputados/${d.id}/despesas?ano=${ano}&pagina=1&itens=100&ordenarPor=valorLiquido&ordem=DESC`,
      });
      const despesas = data?.dados || [];
      if (!despesas.length) {
        bot("info", `💰 Sem despesas em ${ano}`, "Nenhuma despesa CEAP registrada para este ano ainda.");
        return;
      }
      const total = despesas.reduce((a, c) => a + parseFloat(c.valorLiquido || 0), 0);
      const porCat = {};
      despesas.forEach((e) => {
        const cat = e.tipoDespesa || "Outros";
        porCat[cat] = (porCat[cat] || 0) + parseFloat(e.valorLiquido || 0);
      });
      const sorted = Object.entries(porCat).sort((a, b) => b[1] - a[1]).slice(0, 7);
      const maxVal = sorted[0]?.[1] || 1;

      const html = `
        <div style="background:#0f1629;border-radius:10px;padding:12px 14px;margin-bottom:12px;">
          <div style="font-size:11px;color:#6b7280;margin-bottom:2px;">${despesas.length} registros · ${ano}</div>
          <div style="font-size:22px;font-weight:900;color:#34d399;">R$ ${total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
          <div style="font-size:11px;color:#374151;margin-top:2px;">Total gasto na Cota Parlamentar</div>
        </div>
        ${sorted.map(([cat, val]) => {
          const pct = ((val / total) * 100).toFixed(1);
          const bar = Math.max(3, (val / maxVal) * 100).toFixed(0);
          return `<div style="margin-bottom:9px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
              <span style="color:#d4d4d8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:58%;">${cat}</span>
              <span style="color:#a78bfa;font-weight:700;flex-shrink:0;">R$ ${val.toLocaleString("pt-BR",{maximumFractionDigits:0})} <span style="color:#52525b;">(${pct}%)</span></span>
            </div>
            <div style="height:5px;border-radius:3px;background:#1f2937;">
              <div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#7c3aed,#a78bfa);width:${bar}%;"></div>
            </div>
          </div>`;
        }).join("")}
        ${despesas[0] ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #1f2937;font-size:11px;color:#52525b;">
          🏆 Maior gasto: <strong style="color:#fbbf24;">${despesas[0].nomeFornecedor || "–"}</strong>
          — R$ ${parseFloat(despesas[0].valorLiquido||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}
        </div>` : ""}`;
      bot("atencao", `💰 Gastos CEAP — ${nome} (${ano})`, html);
      mostrarChips([
        { emoji: "🔍", label: "Verificar sanções",    acao: () => executar("scan_corrupcao", nome) },
        { emoji: "⚖️", label: "Processos judiciais",  acao: () => executar("buscar_processos", nome) },
        { emoji: "📰", label: "Notícias",              acao: () => executar("buscar_noticias", nome) },
        { emoji: "🗳️", label: "Votações",              acao: () => executar("ver_votos") },
      ]);
    } catch {
      bot("atencao", "💰 Erro ao buscar gastos", "Não foi possível carregar as despesas. Tente novamente.");
    }
  }

  // ── Votações ─────────────────────────────────────────────────────────────
  async function mostrarVotosInline() {
    const d = dep();
    if (!d) return;
    const nome = depNome();
    bot("info", `🗳️ Buscando votações de ${nome}...`, "Consultando registro de votos na Câmara Federal...");
    try {
      const data = await fetchApi("get_deputy_votes", { id: d.id });
      const votos = data?.votacoes || data?.dados || data?.votes || [];
      if (!votos.length) {
        bot("info", "🗳️ Sem votações", "Nenhuma votação recente encontrada para este deputado.");
        return;
      }
      const slice = votos.slice(0, 12);
      const sim     = slice.filter(v => /^sim$/i.test(v.tipoVoto || v.voto || "")).length;
      const nao     = slice.filter(v => /^n[aã]o$/i.test(v.tipoVoto || v.voto || "")).length;
      const ausente = slice.filter(v => /ausente|absten/i.test(v.tipoVoto || v.voto || "")).length;

      const html = `
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          ${[["✅ Sim", sim, "#34d399"], ["❌ Não", nao, "#f87171"], ["⭕ Ausente", ausente, "#71717a"]].map(([l, n, c]) =>
            `<div style="flex:1;background:#0f1629;border-radius:8px;padding:8px 4px;text-align:center;">
               <div style="font-size:20px;font-weight:900;color:${c};">${n}</div>
               <div style="font-size:10px;color:#6b7280;">${l}</div>
             </div>`
          ).join("")}
        </div>
        ${slice.map(v => {
          const voto = (v.tipoVoto || v.voto || "–").toUpperCase();
          const desc = v.proposicao?.ementa || v.descricao || v.proposicaoPrincipal || v.tema || "Votação";
          const cor  = /^SIM$/.test(voto) ? "#34d399" : /^N[AÃ]O$/.test(voto) ? "#f87171" : "#71717a";
          return `<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid #1a1a24;">
            <span style="color:${cor};font-weight:800;font-size:10px;min-width:44px;flex-shrink:0;padding-top:1px;">${voto}</span>
            <span style="font-size:12px;color:#a1a1aa;line-height:1.45;">${String(desc).substring(0, 90)}</span>
          </div>`;
        }).join("")}`;
      bot("info", `🗳️ Votações recentes — ${nome}`, html);
      mostrarChips([
        { emoji: "💰", label: "Gastos CEAP",          acao: () => executar("ver_gastos") },
        { emoji: "🔍", label: "Verificar sanções",    acao: () => executar("scan_corrupcao", nome) },
        { emoji: "📰", label: "Notícias",              acao: () => executar("buscar_noticias", nome) },
      ]);
    } catch {
      bot("atencao", "🗳️ Erro ao buscar votações", "Não foi possível carregar as votações. Tente novamente.");
    }
  }

  // ── Notícias políticas gerais ─────────────────────────────────────────────
  async function mostrarNoticiasInline(tema) {
    const q = tema || "política brasil governo deputados";
    bot("info", "📰 Buscando notícias...", `Pesquisando: <em>${q}</em>`);
    try {
      const data = await fetchApi("web_search", { q });
      if (!data.resultados?.length && !data.abstract) {
        bot("info", "📰 Sem resultados", "Nenhuma notícia encontrada no momento.");
        return;
      }
      let html = "";
      if (data.abstract) {
        html += `<div style="background:#0f1629;border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:12px;color:#cbd5e1;line-height:1.55;">
          ${data.abstract}
          ${data.fonte ? `<br><span style="color:#52525b;font-size:10px;">📖 ${data.fonte}</span>` : ""}
        </div>`;
      }
      html += (data.resultados || []).slice(0, 5).map(r =>
        `<div style="padding:8px 0;border-bottom:1px solid #1a1a24;">
           <a href="${r.url}" target="_blank" rel="noopener"
              style="color:#60a5fa;font-weight:700;font-size:13px;line-height:1.4;text-decoration:none;">
             ${(r.titulo || "").substring(0, 80)}
           </a>
           ${r.resumo ? `<div style="font-size:11px;color:#71717a;margin-top:3px;">${r.resumo.substring(0, 100)}...</div>` : ""}
         </div>`
      ).join("");
      bot("info", "📰 Notícias políticas", html);
      mostrarChips([
        { emoji: "🔍", label: "Buscar político",   acao: () => solicitarNome("buscar_politico") },
        { emoji: "🏆", label: "Ranking suspeitos",  acao: () => executar("ranking") },
      ]);
    } catch {
      bot("atencao", "📰 Erro", "Não foi possível buscar notícias agora.");
    }
  }

  // ── Orçamento / Execução ─────────────────────────────────────────────────
  async function mostrarOrcamentoInline() {
    bot("info", "💰 Buscando execução orçamentária...", "Consultando dados de despesas federais (SADIPEM)...");
    try {
      const data = await fetchApi("proxy_pvl", { limit: 20 });
      const items = data?.items || [];
      if (!items.length) {
        bot("atencao", "💰 Sem dados", "Não foi possível carregar a execução orçamentária no momento.");
        return;
      }
      const totalEmp = items.reduce((a, c) => a + (window.parsePtBrFloat?.(c.empenhado||"0") || 0), 0);
      const totalLiq = items.reduce((a, c) => a + (window.parsePtBrFloat?.(c.liquidado||"0") || 0), 0);
      const pctLiq   = totalEmp > 0 ? ((totalLiq / totalEmp) * 100).toFixed(1) : "0";

      const html = `
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <div style="flex:1;background:#0f1629;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;">Empenhado</div>
            <div style="font-size:15px;font-weight:900;color:#fbbf24;">R$ ${(totalEmp/1e9).toFixed(1)}B</div>
          </div>
          <div style="flex:1;background:#052e16;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;">Liquidado</div>
            <div style="font-size:15px;font-weight:900;color:#34d399;">R$ ${(totalLiq/1e9).toFixed(1)}B</div>
          </div>
          <div style="flex:1;background:#0f1629;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;">Execução</div>
            <div style="font-size:15px;font-weight:900;color:#a78bfa;">${pctLiq}%</div>
          </div>
        </div>
        ${items.slice(0, 6).map(r => {
          const orgao = (typeof r.orgao === "string" ? r.orgao : r.orgaoSuperior) || "Órgão";
          const emp   = window.parsePtBrFloat?.(r.empenhado || "0") || 0;
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1a1a24;gap:8px;">
            <span style="font-size:12px;color:#d4d4d8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${orgao.substring(0,45)}</span>
            <span style="font-size:12px;color:#fbbf24;font-weight:700;flex-shrink:0;">R$ ${(emp/1e6).toFixed(0)}M</span>
          </div>`;
        }).join("")}`;
      bot("info", "💰 Execução Orçamentária Federal", html);
    } catch {
      bot("atencao", "💰 Erro", "Não foi possível carregar o orçamento.");
    }
  }

  // ── Servidores ───────────────────────────────────────────────────────────
  async function mostrarServidoresInline(nome) {
    if (!nome) {
      bot("info", "👨‍💼 Buscar servidor", "Me diga o nome do servidor público federal para consultar.<br>Ex: <em>\"Servidor João Silva\"</em>");
      ctx.aguardandoResposta = "servidores_nome";
      return;
    }
    bot("info", `👨‍💼 Buscando servidor: ${nome}`, "Consultando Portal da Transparência...");
    try {
      const data = await fetchApi("busca_servidores", { nome });
      const lista = data?.servidores || data?.dados || data || [];
      if (!lista.length) {
        bot("info", "👨‍💼 Sem resultados", `Nenhum servidor encontrado com o nome "${nome}".`);
        return;
      }
      const html = lista.slice(0, 6).map(s => {
        const nm  = s.nome || s.nomeFuncionario || "–";
        const org = s.orgaoLotacao || s.orgao || "–";
        const cargo = s.cargoFuncao || s.cargo || "–";
        const rem = s.remuneracaoLiquida ? `R$ ${parseFloat(s.remuneracaoLiquida).toLocaleString("pt-BR",{minimumFractionDigits:2})}` : "–";
        return `<div style="padding:8px 0;border-bottom:1px solid #1a1a24;">
          <div style="font-weight:700;color:#f4f4f5;font-size:13px;">${nm}</div>
          <div style="font-size:11px;color:#71717a;margin-top:2px;">${cargo} · ${org}</div>
          <div style="font-size:12px;color:#34d399;font-weight:700;margin-top:2px;">${rem}</div>
        </div>`;
      }).join("");
      bot("info", `👨‍💼 ${lista.length} servidor(es) encontrado(s)`, html);
    } catch {
      bot("atencao", "👨‍💼 Erro", "Não foi possível consultar os servidores.");
    }
  }

  // ── Emendas parlamentares inline ─────────────────────────────────────────
  async function mostrarEmendasInline() {
    const d = dep();
    if (!d) return;
    const nome = depNome();
    bot("info", `📋 Buscando emendas de ${nome}...`, "Consultando emendas parlamentares...");
    try {
      const data = await fetchApi("get_emendas", { id: d.id });
      const emendas = data?.emendas || data?.dados || data || [];
      if (!emendas.length) {
        bot("info", "📋 Sem emendas", "Nenhuma emenda parlamentar encontrada para este deputado.");
        return;
      }
      const total = emendas.reduce((a, e) => a + parseFloat(e.valorEmpenhado || e.valor || 0), 0);
      const html = `
        <div style="background:#0f1629;border-radius:8px;padding:10px 12px;margin-bottom:10px;">
          <div style="font-size:11px;color:#6b7280;">${emendas.length} emenda(s)</div>
          <div style="font-size:20px;font-weight:900;color:#a78bfa;">R$ ${total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
        </div>
        ${emendas.slice(0, 6).map(e => {
          const desc  = e.funcaoNome || e.descricao || e.subfuncaoNome || "Emenda";
          const mun   = e.municipio || e.localidadeGasto || "–";
          const val   = parseFloat(e.valorEmpenhado || e.valor || 0);
          return `<div style="padding:7px 0;border-bottom:1px solid #1a1a24;">
            <div style="display:flex;justify-content:space-between;gap:8px;">
              <span style="font-size:12px;color:#d4d4d8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${desc.substring(0,45)}</span>
              <span style="font-size:12px;color:#a78bfa;font-weight:700;flex-shrink:0;">R$ ${(val/1e3).toFixed(0)}K</span>
            </div>
            <div style="font-size:11px;color:#52525b;margin-top:2px;">📍 ${mun}</div>
          </div>`;
        }).join("")}`;
      bot("info", `📋 Emendas Parlamentares — ${nome}`, html);
    } catch {
      bot("atencao", "📋 Erro", "Não foi possível carregar as emendas.");
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  FERRAMENTAS — todas renderizam inline no chat
  // ════════════════════════════════════════════════════════════════════════
  const FERRAMENTAS = {
    buscar_deputado:      (nome) => window.HyperBotOsint?.buscarDeputado(nome),
    ver_gastos:           async () => { if (!precisaDep("ver gastos")) await mostrarGastosInline(); },
    ver_votos:            async () => { if (!precisaDep("ver votações")) await mostrarVotosInline(); },
    buscar_processos:     (nome) => window.HyperBotOsint?.buscarProcessos(nome),
    buscar_noticias:      (nome) => {
      const d = dep();
      if (d) window.HyperBotOsint?.buscarNoticias(d.id, depNome());
      else    mostrarNoticiasInline(nome);
    },
    modo_detetive: async () => {
      const d = dep();
      if (!d) return;
      if (window.HyperBotInvestigador) {
        window.HyperBotInvestigador.investigar(d);
      } else {
        const nome = depNome();
        bot("info", `🕵️ Iniciando dossiê completo de ${nome}...`,
          "Vou analisar tudo: gastos, sanções, processos, emendas e notícias.");
        await new Promise(r => setTimeout(r, 600));
        await mostrarGastosInline();
        await new Promise(r => setTimeout(r, 800));
        executar("scan_corrupcao", nome);
        await new Promise(r => setTimeout(r, 1200));
        executar("buscar_processos", nome);
        await new Promise(r => setTimeout(r, 1600));
        window.HyperBotOsint?.buscarNoticias(d.id, nome);
      }
    },
    investigar_nepotismo: () => { const d = dep(); if (d) window.HyperBot?.investigarNepotismo?.(d); },
    investigar_patrimonio:() => { const d = dep(); if (d) window.HyperBot?.investigarPatrimonio?.(d); },
    investigar_emendas:   async () => { if (!precisaDep("ver emendas")) await mostrarEmendasInline(); },
    scan_corrupcao:       (nome) => fetchApi("scan_anticorrupcao", { nome }).then(mostrarSancoes),
    scan_cnpj:            (cnpj) => window.HyperBotOsint?.scanCNPJ(cnpj),
    scan_cpf:             (cpf, nome) => window.HyperBotOsint?.scanCPF(cpf, nome),

    // Ranking inline
    ranking: async () => {
      bot("info", "🏆 Buscando ranking de risco político...", "Consultando CEIS + CNEP — bases oficiais de sanções...");
      try {
        const data = await fetchApi("corruption_ranking", {});
        if (!data?.ranking?.length) {
          bot("atencao", "🏆 Sem dados de ranking", "Não foi possível carregar o ranking. Tente <em>verificar [nome] sanções</em>.");
          return;
        }
        const html = data.ranking.slice(0, 10).map((p, i) => {
          const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
          const cor     = p.score >= 80 ? "#f87171" : p.score >= 50 ? "#fbbf24" : "#a1a1aa";
          const sub     = [p.fontes, p.multa].filter(Boolean).join(" · ");
          return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #1f1f23;">
            <span style="font-size:16px;width:26px;text-align:center;flex-shrink:0;">${medalha}</span>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;color:#f4f4f5;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.nome}</div>
              <div style="font-size:11px;color:#71717a;">${sub}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div style="font-size:11px;font-weight:800;color:${cor};">Score ${p.score}</div>
            </div>
          </div>`;
        }).join("");
        bot("critico", `🏆 Ranking de Risco — Top ${Math.min(data.ranking.length, 10)} Sancionados`, html);
        mostrarChips([
          { emoji: "🔍", label: "Verificar um nome", acao: () => solicitarNome("buscar_politico") },
          { emoji: "💰", label: "Orçamento federal",  acao: () => mostrarOrcamentoInline() },
        ]);
      } catch {
        bot("atencao", "🏆 Erro no ranking", "Não foi possível carregar o ranking. Tente novamente.");
      }
    },

    // Seções do portal — todas mostram dados inline
    abrir_aba: async (id) => {
      switch (id) {
        case "radar":       await executar("ranking"); break;
        case "noticias":    await mostrarNoticiasInline(); break;
        case "orcamento":   await mostrarOrcamentoInline(); break;
        case "servidores":  await mostrarServidoresInline(); break;
        case "viagens":
          if (dep()) {
            bot("info", `✈️ Viagens de ${depNome()}`, "Buscando viagens a serviço...");
            const data = await fetchApi("proxy_camara", { endpoint: `deputados/${dep().id}/viagens?pagina=1&itens=10` }).catch(() => null);
            const viagens = data?.dados || [];
            if (!viagens.length) { bot("info","✈️ Sem viagens","Nenhuma viagem a serviço registrada."); break; }
            const html = viagens.map(v => {
              const destinos = (v.destinos||[]).map(d=>d.nomePais||d.municipio||"–").join(", ");
              return `<div style="padding:6px 0;border-bottom:1px solid #1a1a24;">
                <div style="font-size:12px;color:#d4d4d8;">📍 ${destinos}</div>
                <div style="font-size:11px;color:#71717a;margin-top:2px;">${v.motivo||"Sem motivo"} · R$ ${parseFloat(v.valorTotalViagem||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
              </div>`;
            }).join("");
            bot("info", `✈️ Viagens a Serviço — ${depNome()}`, html);
          } else {
            bot("info", "✈️ Viagens", "Me diga o nome do político para buscar as viagens.<br>Ex: <em>\"Viagens do Fulano\"</em>");
            ctx.aguardandoResposta = "buscar_politico";
          }
          break;
        case "eleicoes":
          bot("info", "🗳️ Dados Eleitorais", "Para ver dados eleitorais, me diga o nome do candidato ou um CNPJ de partido.<br>Ex: <em>\"Eleições João Silva\"</em> ou <em>\"Eleições PT\"</em>");
          break;
        case "mapa":
          bot("info", "🗺️ Mapa de Repasses Federais", "Para ver repasses para uma cidade, me diga o município.<br>Ex: <em>\"Repasses para Campinas\"</em>");
          ctx.aguardandoResposta = "config_cidade";
          break;
        case "municipio":
          if (profile.municipio) {
            bot("info", `🏘️ Dados de ${profile.municipio}`, "Buscando informações do município...");
            await mostrarNoticiasInline(`prefeitura ${profile.municipio} governo municipal`);
          } else {
            bot("info", "🏘️ Qual município?", "Me diga sua cidade: <em>\"Sou de [cidade]\"</em>");
            ctx.aguardandoResposta = "config_cidade";
          }
          break;
        default:
          bot("info", "🔎 Dados não disponíveis inline", `Não consigo carregar "${id}" diretamente no chat ainda. Me faça uma pergunta específica — ex: <em>"Ver gastos do [nome]"</em>, <em>"Processos do [nome]"</em>.`);
      }
    },

    busca_web:      (q)         => buscaWeb(q),
    osint:          (q)         => window.HyperBotOsint?.osintSearch(q),
    analisar_senador: (id, nome) => window.HyperBotSenate?.analisarSenador?.(id, nome),
  };

  function executar(ferramenta, ...args) {
    const fn = FERRAMENTAS[ferramenta];
    if (fn) fn(...args);
    else console.warn("[Brain] Ferramenta não encontrada:", ferramenta);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  BUSCA NA WEB — DuckDuckGo + Wikipedia PT via proxy PHP
  // ════════════════════════════════════════════════════════════════════════
  async function buscaWeb(query) {
    if (!query || query.length < 2) {
      bot("info", "🌐 Pesquisar o quê?", "Digite o que quer pesquisar na web. Ex: <em>\"pesquisar na web lei de improbidade\"</em>");
      return;
    }
    bot("info", "🌐 Pesquisando na web...", `Buscando: <strong>"${query}"</strong>`);
    try {
      const data = await fetchApi("web_search", { q: query });
      if (data.erro && !data.abstract && !data.resultados?.length) {
        bot("atencao", "🌐 Sem resultados", `Não encontrei informações sobre "${query}". Tente um termo diferente.`);
        return;
      }
      let html = "";
      if (data.abstract) {
        html += `<div style="background:#1e293b;border-radius:8px;padding:8px;margin-bottom:8px;font-size:11px;color:#cbd5e1;line-height:1.5;">
          ${data.abstract}
          ${data.fonte ? `<br><span style="color:#64748b;font-size:10px;">📖 Fonte: ${data.fonte}</span>` : ""}
        </div>`;
      }
      if (data.resultados?.length) {
        html += data.resultados.slice(0, 4).map((r) =>
          `• <a href="${r.url}" target="_blank" rel="noopener"
               style="color:#60a5fa;font-weight:700;">${r.titulo?.substring(0, 65)}</a>
           <br><span style="color:#71717a;font-size:10px;">${(r.resumo || "").substring(0, 90)}...</span>`
        ).join("<br><br>");
      }
      if (!html) html = `Nenhum resultado detalhado encontrado para "<em>${query}</em>".`;
      bot("info", `🌐 Resultado: "${query}"`, html);
      // Sugerir busca interna relacionada
      setTimeout(() => {
        mostrarChips([
          { emoji: "🔍", label: "Buscar nos dados do portal", acao: () => executar("osint", query) },
          { emoji: "📰", label: "Notícias políticas",          acao: () => mostrarNoticiasInline() },
        ]);
      }, 1000);
    } catch {
      bot("atencao", "🌐 Erro na busca web", "Não foi possível acessar a internet agora. Tente os dados internos do portal.");
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MOSTRAR SANÇÕES (helper)
  // ════════════════════════════════════════════════════════════════════════
  function mostrarSancoes(scan) {
    if (!scan || scan.erro) { bot("atencao", "Erro ao consultar sanções", scan?.erro || "Tente novamente."); return; }
    const total = (scan.cnep?.length || 0) + (scan.ceis?.length || 0) + (scan.ceaf?.length || 0) + (scan.cepim?.length || 0);
    const pep   = scan.pep?.length || 0;
    if (total > 0) {
      bot("critico", `🚨 ${total} sanção(ões) encontrada(s)`,
        `CEIS: <strong>${scan.ceis?.length || 0}</strong> · CNEP: <strong>${scan.cnep?.length || 0}</strong> · CEAF: <strong>${scan.ceaf?.length || 0}</strong> · CEPIM: <strong>${scan.cepim?.length || 0}</strong><br>
         <a onclick="window.HyperBotAgent?.processarMensagem?.('ranking suspeitos')" style="color:#f87171;cursor:pointer;font-size:11px;text-decoration:underline;">Ver Ranking de Sancionados →</a>`);
    } else if (pep > 0) {
      bot("atencao", "⚠️ PEP — Pessoa Exposta Politicamente", "Consta nas bases PEP. Esperado para políticos em exercício, mas merece atenção.");
    } else {
      bot("positivo", "✅ Sem sanções encontradas", "Não consta em CEIS, CNEP, CEAF ou CEPIM.");
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HANDLER PRINCIPAL — processa cada mensagem do usuário
  // ════════════════════════════════════════════════════════════════════════
  async function processarMensagem(raw) {
    if (!raw?.trim()) return;
    ctx.mensagensCount++;

    // Registrar no histórico
    profile.historico.unshift({ texto: raw.substring(0, 100), ts: Date.now() });
    profile.historico = profile.historico.slice(0, 60);
    salvarPerfil();

    // Verificar se estava aguardando resposta
    if (ctx.aguardandoResposta) {
      const acao = ctx.aguardandoResposta;
      ctx.aguardandoResposta = null;
      return await responderPergunta(acao, raw);
    }

    // ── Guia do portal — intercepta perguntas sobre navegação/seções ────────
    if (window.HyperBotGuia?.tentarResponder?.(raw)) return;

    const intent = detectarIntencao(raw);

    switch (intent.id) {

      // ── Localização ──────────────────────────────────────────────────────
      case "config_cidade": {
        const cidade = intent.extraido || raw;
        profile.municipio = cidade;
        salvarPerfil();
        bot("positivo", `📍 Cidade registrada: ${cidade}`,
          `Agora sei que você é de <strong>${cidade}</strong>. Posso buscar dados do seu município ou encontrar seu deputado federal.`);
        mostrarChips([
          { emoji: "🏘️", label: `Dados de ${cidade}`,    acao: () => executar("abrir_aba", "municipio") },
          { emoji: "👔", label: "Meu deputado federal",  acao: () => executar("buscar_deputado", cidade) },
          { emoji: "💰", label: "Gastos federais",       acao: () => executar("abrir_aba", "orcamento") },
        ]);
        break;
      }

      // ── Meu deputado ─────────────────────────────────────────────────────
      case "meu_deputado":
        if (profile.municipio) {
          bot("info", `👔 Buscando seu representante...`, `Procurando deputados de <strong>${profile.municipio}</strong>...`);
          setTimeout(() => executar("buscar_deputado", profile.municipio), 400);
        } else {
          bot("info", "👔 Me diga sua cidade", "Para saber quem é seu deputado, preciso saber onde você mora.<br>Ex: <em>\"Sou de Campinas\"</em> ou <em>\"Moro em Salvador\"</em>");
          ctx.aguardandoResposta = "config_cidade";
        }
        break;

      // ── Buscar político ──────────────────────────────────────────────────
      case "buscar_politico": {
        const nome = intent.extraido;
        if (nome?.length >= 3) {
          ctx.ultimoPolitico = nome;
          executar("buscar_deputado", nome);
        } else {
          bot("info", "👔 Qual o nome?", "Me diga o nome completo ou parcial do político que quer ver.");
          ctx.aguardandoResposta = "buscar_politico";
        }
        break;
      }

      // ── Gastos ───────────────────────────────────────────────────────────
      case "gastos":
        if (precisaDep("analisar gastos")) break;
        bot("info", `💰 Analisando gastos de ${depNome()}...`, "Buscando despesas da cota parlamentar (CEAP)...");
        setTimeout(() => executar("ver_gastos"), 300);
        break;

      // ── Corrupção ────────────────────────────────────────────────────────
      case "corrupcao": {
        const alvo = depNome() || ctx.ultimoPolitico;
        if (alvo) {
          bot("info", `🔍 Verificando ${alvo} nas bases de sanções...`, "Consultando CEIS · CNEP · CEAF · CEPIM · PEP...");
          fetchApi("scan_anticorrupcao", { nome: alvo }).then(mostrarSancoes).catch(() =>
            bot("atencao", "Erro na consulta", "Tente novamente em instantes."));
        } else {
          bot("info", "🔍 Verificar quem?",
            "Me diga o nome, CPF ou CNPJ para verificar nas bases oficiais de sancionados.<br>Ex: <em>\"Verificar João Silva\"</em> ou cole um CPF/CNPJ.");
        }
        break;
      }

      // ── Processos ────────────────────────────────────────────────────────
      case "processos": {
        const alvo = depNome() || ctx.ultimoPolitico;
        if (alvo) {
          executar("buscar_processos", alvo);
        } else {
          bot("info", "⚖️ Processos de quem?", "Me diga o nome para buscar no DataJud (CNJ).<br>Ex: <em>\"Processos do Fulano\"</em>");
          ctx.aguardandoResposta = "processos";
        }
        break;
      }

      // ── Notícias ─────────────────────────────────────────────────────────
      case "noticias": {
        const alvo = depNome() || ctx.ultimoPolitico;
        if (alvo) {
          executar("buscar_noticias", alvo);
        } else {
          bot("info", "📰 Notícias de quem?", "Me diga o nome do político para buscar notícias.<br>Ou <em>\"notícias políticas\"</em> para ver as gerais.");
          mostrarChips([
            { emoji: "🗞️", label: "Notícias gerais",  acao: () => executar("abrir_aba", "noticias") },
            { emoji: "🔍", label: "Buscar político", acao: () => solicitarNome("noticias") },
          ]);
        }
        break;
      }

      // ── Empresa / CNPJ ───────────────────────────────────────────────────
      case "empresa":
        bot("info", "🏢 Investigar empresa?",
          "Cole o CNPJ (14 dígitos) da empresa para eu fazer a investigação completa:<br>contratos, sanções, donos e histórico de pagamentos federais.");
        ctx.aguardandoResposta = "empresa";
        break;

      // ── CNPJ direto ──────────────────────────────────────────────────────
      case "cnpj":
        ctx.ultimaEmpresa = intent.digits;
        executar("scan_cnpj", intent.digits);
        break;

      // ── CPF direto ───────────────────────────────────────────────────────
      case "cpf":
        executar("scan_cpf", intent.digits, raw);
        break;

      // ── Município ────────────────────────────────────────────────────────
      case "municipio":
        if (profile.municipio) {
          bot("info", `🏘️ Dados de ${profile.municipio}`, "Abrindo a seção de dados municipais...");
          executar("abrir_aba", "municipio");
        } else {
          bot("info", "🏘️ Qual cidade?", "Me diga o nome da cidade para buscar os dados.<br>Ex: <em>\"Sou de Ribeirão Preto\"</em>");
          ctx.aguardandoResposta = "config_cidade";
        }
        break;

      // ── Nepotismo ────────────────────────────────────────────────────────
      case "nepotismo":
        if (precisaDep("verificar nepotismo")) break;
        executar("investigar_nepotismo");
        break;

      // ── Patrimônio ───────────────────────────────────────────────────────
      case "patrimonio":
        if (precisaDep("verificar patrimônio")) break;
        executar("investigar_patrimonio");
        break;

      // ── Emendas ──────────────────────────────────────────────────────────
      case "emendas":
        if (precisaDep("ver emendas")) break;
        executar("investigar_emendas");
        break;

      // ── Investigação completa ─────────────────────────────────────────────
      case "investigar_tudo":
        if (precisaDep("iniciar investigação completa")) break;
        bot("info", `🕵️ Iniciando dossiê completo de ${depNome()}`,
          "Vou analisar: gastos, nepotismo, patrimônio, processos judiciais, sanções e emendas.<br>Isso levará cerca de 30 segundos...");
        setTimeout(() => executar("modo_detetive"), 800);
        break;

      // ── Monitorar político ────────────────────────────────────────────────
      case "monitorar": {
        const nomeMon = intent.extraido;
        if (!nomeMon) {
          bot("info", "📡 Monitorar quem?", "Me diga o nome do político para adicionar à vigilância.<br>Ex: <em>\"monitorar João Silva\"</em>");
          ctx.aguardandoResposta = "monitorar";
          break;
        }
        // Tenta obter dados do político atual se coincidir
        const dAtual = dep();
        const nomeAtual = depNome();
        if (dAtual && nomeAtual && nomeAtual.toLowerCase().includes(nomeMon.toLowerCase())) {
          window.HyperBotMonitor?.adicionar(dAtual.id, nomeAtual,
            dAtual.ultimoStatus?.siglaPartido || "–",
            dAtual.ultimoStatus?.siglaUf || "–");
        } else {
          window.HyperBotMonitor?.adicionar(null, nomeMon, "–", "–");
        }
        break;
      }

      // ── Lista de vigilâncias ──────────────────────────────────────────────
      case "minhas_vigilancias":
        window.HyperBotMonitor?.listar?.();
        break;

      // ── Ver alertas do monitor ────────────────────────────────────────────
      case "ver_alertas":
        window.HyperBotMonitor?.mostrarAlertas?.();
        break;

      // ── Comparar dois políticos ───────────────────────────────────────────
      case "comparar": {
        const { nome1, nome2 } = intent.extraido || {};
        if (nome1 && nome2) {
          window.HyperBotCruzador?.comparar?.(nome1, nome2);
        } else if (nome1) {
          bot("info", "⚖️ Comparar com quem?",
            `Encontrei o primeiro nome: <strong style="color:#a78bfa;">${nome1}</strong><br><br>
             Agora me diga o segundo nome:<br>
             <em>"comparar ${nome1} com <strong>[segundo nome]</strong>"</em>`);
          ctx.aguardandoResposta = "comparar_segundo";
          ctx._comparar_primeiro = nome1;
        } else {
          bot("info", "⚖️ Comparar quem?",
            `Compare dois deputados lado a lado.<br><br>
             <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
               ✏️ <em style="color:#a78bfa;">"comparar Lula com Bolsonaro"</em><br>
               ✏️ <em style="color:#a78bfa;">"comparar Tabata Amaral com Kim Kataguiri"</em>
             </div>`);
        }
        break;
      }

      // ── Cruzar fornecedores ───────────────────────────────────────────────
      case "cruzar_fornecedores": {
        const dCruz = dep();
        if (!dCruz) {
          bot("info", "🔗 Cruzar fornecedores — Busque um deputado primeiro",
            `Cruzo os fornecedores da CEAP do deputado com as bases de sanções (CEIS/CNEP).<br><br>
             <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
               1️⃣ Busque: <em style="color:#a78bfa;">"ver [nome do deputado]"</em><br>
               2️⃣ Diga: <em style="color:#a78bfa;">"cruzar fornecedores"</em>
             </div>`);
          mostrarChips([
            { emoji: "🔍", label: "Buscar deputado",   acao: () => solicitarNome("buscar_politico") },
            { emoji: "🏆", label: "Ranking de gastos", acao: () => window.HyperBotCruzador?.rankearPorGastos?.() },
          ]);
        } else {
          window.HyperBotCruzador?.cruzarFornecedores?.(dCruz.id, depNome());
        }
        break;
      }

      // ── Ranking de gastos ─────────────────────────────────────────────────
      case "ranking_gastos": {
        const uf = intent.extraido;
        if (!uf) {
          bot("info", "💰 Ranking de gastos — Por qual estado?",
            `Mostro os 10 deputados que mais gastaram na CEAP.<br><br>
             <div style="background:#18181b;border-radius:8px;padding:10px;font-size:12px;color:#a1a1aa;line-height:1.9;">
               ✏️ <em style="color:#a78bfa;">"ranking gastos SP"</em> — deputados de São Paulo<br>
               ✏️ <em style="color:#a78bfa;">"ranking gastos RJ"</em> — deputados do Rio<br>
               ✏️ <em style="color:#a78bfa;">"ranking de gastos"</em> — todos os estados
             </div>`);
          mostrarChips([
            { emoji: "🇸🇵", label: "Gastos SP", acao: () => window.HyperBotCruzador?.rankearPorGastos?.("SP") },
            { emoji: "🇷🇯", label: "Gastos RJ", acao: () => window.HyperBotCruzador?.rankearPorGastos?.("RJ") },
            { emoji: "🇲🇬", label: "Gastos MG", acao: () => window.HyperBotCruzador?.rankearPorGastos?.("MG") },
            { emoji: "📊",  label: "Todos os estados", acao: () => window.HyperBotCruzador?.rankearPorGastos?.() },
          ]);
        } else {
          window.HyperBotCruzador?.rankearPorGastos?.(uf);
        }
        break;
      }

      // ── Votações suspeitas ────────────────────────────────────────────────
      case "votos_suspeitos": {
        const dVot = dep();
        if (!dVot) {
          if (precisaDep("analisar padrão de votações")) break;
        } else {
          window.HyperBotCruzador?.analisarVotacoesSuspeitas?.(dVot.id, depNome());
        }
        break;
      }

      // ── Denúncia ─────────────────────────────────────────────────────────
      case "denuncia":
        if (/canal|onde|como|ouvidoria|mpf|tcu|fala/i.test(raw)) {
          window.HyperBotDenuncia?.mostrarCanais?.();
        } else if (/dica|orienta|como\s+fazer/i.test(raw)) {
          window.HyperBotDenuncia?.mostrarDicas?.();
        } else {
          window.HyperBotDenuncia?.gerarDenuncia?.(dep());
        }
        break;

      // ── Custo do mandato ──────────────────────────────────────────────────
      case "custo_mandato":
        if (/efici[eê]ncia/i.test(raw)) {
          window.HyperBotCalculadora?.calcularEficiencia?.(dep());
        } else {
          window.HyperBotCalculadora?.calcularCustoMandato?.(dep());
        }
        break;

      // ── Calculadora de imposto ────────────────────────────────────────────
      case "calculadora_imposto": {
        const salario = intent.extraido;
        window.HyperBotCalculadora?.calcularImposto?.(salario);
        break;
      }

      // ── Exportar / compartilhar ───────────────────────────────────────────
      case "exportar":
        if (/baixar?|download|relat[oó]rio|txt/i.test(raw)) {
          window.HyperBotExportar?.baixarRelatorio?.(dep());
        } else {
          window.HyperBotExportar?.mostrarMenuCompartilhar?.(dep());
        }
        break;

      // ── Histórico de investigações ────────────────────────────────────────
      case "historico_investigacoes":
        window.HyperBotExportar?.mostrarHistorico?.();
        break;

      // ── Guia do portal ───────────────────────────────────────────────────
      case "guia_portal":
        window.HyperBotGuia?.mostrarMapaPortal?.();
        break;

      // ── Como funciona / O que é [seção] ──────────────────────────────────
      case "guia_secao": {
        const termoBusca = intent.extraido || raw;
        const secaoId = window.HyperBotGuia?.buscarSecao?.(termoBusca);
        if (secaoId) {
          window.HyperBotGuia.exibirSecao(secaoId);
        } else {
          // Fallback: tenta o guia com o texto completo
          if (!window.HyperBotGuia?.tentarResponder?.(raw)) {
            bot("info", "ℹ️ Ajuda sobre o portal",
              `Não encontrei uma seção específica para "<em>${termoBusca}</em>".<br>
               Diga <em>"mapa do portal"</em> para ver todas as seções, ou me faça uma pergunta mais específica.`);
            window.HyperBotGuia?.mostrarMapaPortal?.();
          }
        }
        break;
      }

      // ── Ranking ──────────────────────────────────────────────────────────
      case "ranking":
        executar("ranking");
        break;

      // ── Radar ────────────────────────────────────────────────────────────
      case "radar":
        executar("abrir_aba", "radar");
        break;

      // ── Abas do portal ───────────────────────────────────────────────────
      case "viagens":   executar("abrir_aba", "viagens");   break;
      case "mapa":      executar("abrir_aba", "mapa");      break;
      case "rede":      executar("abrir_aba", "rede");      break;
      case "servidores":executar("abrir_aba", "servidores");break;
      case "eleicoes":  executar("abrir_aba", "eleicoes");  break;

      // ── Busca na web ─────────────────────────────────────────────────────
      case "web": {
        const q = (intent.extraido || raw).trim();
        await buscaWeb(q || raw);
        break;
      }

      // ── Ajuda ────────────────────────────────────────────────────────────
      case "ajuda":
        mostrarAjuda();
        break;

      // ── Modo simples ─────────────────────────────────────────────────────
      case "modo_simples":
        profile.modoSimples = !profile.modoSimples;
        salvarPerfil();
        bot("positivo",
          profile.modoSimples ? "✅ Modo Simples ativado" : "✅ Modo Completo ativado",
          profile.modoSimples
            ? "Vou usar linguagem mais simples e te guiar passo a passo."
            : "Interface completa ativada. Digite <em>modo simples</em> para voltar.");
        break;

      // ── Obrigado ─────────────────────────────────────────────────────────
      case "obrigado":
        bot("positivo", "😊 Disponha!",
          "Estou aqui para ajudar o cidadão a fiscalizar os políticos. Quer investigar mais alguma coisa?");
        setTimeout(() => mostrarChipsProativos(), 500);
        break;

      // ── Busca livre / OSINT ───────────────────────────────────────────────
      case "livre":
      default:
        if (raw.length >= 3) {
          executar("osint", raw);
        } else {
          bot("info", "💬 Como posso ajudar?",
            "Não entendi bem. Digite <em>ajuda</em> para ver o que posso fazer por você.");
        }
        break;
    }

    // Atualizar chips de sugestão após 2.5s
    setTimeout(() => mostrarChipsProativos(), 2500);
  }

  // Responde a perguntas pendentes
  async function responderPergunta(acao, raw) {
    switch (acao) {
      case "config_cidade":
        profile.municipio = raw;
        salvarPerfil();
        bot("positivo", `📍 Cidade: ${raw}`, "Salvo! Agora posso buscar dados do seu município.");
        mostrarChips([{ emoji: "🏘️", label: `Dados de ${raw}`, acao: () => executar("abrir_aba", "municipio") }]);
        break;
      case "buscar_politico":
        if (raw.length >= 3) executar("buscar_deputado", raw);
        break;
      case "monitorar":
        if (raw.length >= 3) window.HyperBotMonitor?.adicionar(null, raw, "–", "–");
        break;
      case "comparar_segundo": {
        const nome1 = ctx._comparar_primeiro;
        ctx._comparar_primeiro = null;
        if (nome1 && raw.length >= 3) {
          window.HyperBotCruzador?.comparar?.(nome1, raw.trim());
        } else {
          bot("atencao", "⚖️ Nome inválido", "Digite um nome válido para comparar.");
        }
        break;
      }
      case "calculadora_salario": {
        const val = parseFloat(raw.replace(/\./g, "").replace(",", ".").match(/\d[\d.]{2,}/)?.[0]);
        if (val > 0) window.HyperBotCalculadora?.calcularImposto?.(val);
        else bot("atencao", "Valor inválido", "Digite um valor numérico. Ex: <em>\"imposto de 5000\"</em>");
        break;
      }
      case "processos":
        executar("buscar_processos", raw);
        break;
      case "noticias":
        executar("buscar_noticias", raw);
        break;
      case "empresa":
        const cnpj = raw.replace(/\D/g, "");
        if (cnpj.length === 14) executar("scan_cnpj", cnpj);
        else bot("atencao", "CNPJ inválido", "O CNPJ precisa ter 14 dígitos. Tente novamente.");
        break;
      default:
        await processarMensagem(raw);
    }
  }

  function solicitarNome(intencao) {
    const labels = {
      buscar_politico: "Me diga o nome do político:",
      noticias:        "Me diga o nome para buscar notícias:",
    };
    bot("info", "✏️ Digite o nome", labels[intencao] || "Me diga o nome:");
    ctx.aguardandoResposta = intencao;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  CHIPS DE SUGESTÃO — botões contextuais no feed
  // ════════════════════════════════════════════════════════════════════════
  function mostrarChips(chips) {
    const feed = document.getElementById("hyperbot-feed");
    if (!feed || !chips?.length) return;

    // Remove chips anteriores
    feed.querySelectorAll(".hz-chips").forEach((el) => el.remove());

    const el = document.createElement("div");
    el.className = "hz-chips";
    el.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 10px;max-width:760px;margin:0 auto;";

    // Registrar cada handler e usar índice numérico no onclick
    // (evita serializar closures com aspas duplas em atributo HTML)
    el.innerHTML = chips.map((c) => {
      const idx = _chipHandlers.length;
      _chipHandlers.push(c.acao);
      return `<button class="hz-chip-btn"
               style="font-size:12px;font-weight:700;padding:7px 14px;border-radius:999px;
                      background:#1c1c24;border:1px solid #3f3f46;color:#a78bfa;cursor:pointer;
                      transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:5px;"
               onmouseover="this.style.background='#4c1d95';this.style.borderColor='#7c3aed';this.style.color='#fff'"
               onmouseout="this.style.background='#1c1c24';this.style.borderColor='#3f3f46';this.style.color='#a78bfa'"
               onclick="window.HyperBotAgent._runChip(${idx})">${c.emoji} ${c.label}</button>`;
    }).join("");

    feed.appendChild(el);
    feed.scrollTop = feed.scrollHeight;
  }

  // Chips proativos baseados no contexto atual
  function mostrarChipsProativos() {
    const d = dep();
    const chips = [];

    if (d) {
      const nome = depNome();
      const dep_ = d;
      chips.push(
        { emoji: "🕵️", label: "Investigação completa",  acao: () => executar("modo_detetive") },
        { emoji: "🔍", label: "Sanções",                acao: () => fetchApi("scan_anticorrupcao", { nome }).then(mostrarSancoes) },
        { emoji: "⚖️", label: "Processos",              acao: () => executar("buscar_processos", nome) },
        { emoji: "💸", label: "Custo do mandato",       acao: () => window.HyperBotCalculadora?.calcularCustoMandato?.(dep_) },
        { emoji: "📝", label: "Gerar denúncia",         acao: () => window.HyperBotDenuncia?.gerarDenuncia?.(dep_) },
        { emoji: "📤", label: "Compartilhar",           acao: () => window.HyperBotExportar?.mostrarMenuCompartilhar?.(dep_) },
        { emoji: "📡", label: "Monitorar",              acao: () => window.HyperBotMonitor?.adicionar(dep_.id, nome, dep_.ultimoStatus?.siglaPartido || "–", dep_.ultimoStatus?.siglaUf || "–") },
      );
    } else {
      chips.push(
        { emoji: "🏆", label: "Ranking suspeitos",    acao: () => executar("ranking") },
        { emoji: "🔍", label: "Buscar político",       acao: () => solicitarNome("buscar_politico") },
        { emoji: "💸", label: "Custo do mandato",     acao: () => window.HyperBotCalculadora?.calcularCustoMandato?.() },
        { emoji: "🧮", label: "Meu imposto",           acao: () => window.HyperBotCalculadora?.calcularImposto?.() },
        { emoji: "📢", label: "Como denunciar",        acao: () => window.HyperBotDenuncia?.mostrarCanais?.() },
      );
    }
    mostrarChips(chips);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  AJUDA COMPLETA
  // ════════════════════════════════════════════════════════════════════════
  function mostrarAjuda() {
    bot("info", "🤖 O que posso fazer por você", `
      <strong style="color:#a78bfa;">👔 Políticos & Deputados</strong><br>
      • <em>"Ver João Silva"</em> — abrir perfil<br>
      • <em>"Meu deputado"</em> — seu representante<br>
      • <em>"Gastos"</em> — analisar CEAP<br>
      • <em>"Votações"</em> — histórico de votos<br><br>

      <strong style="color:#f87171;">🔍 Investigação</strong><br>
      • <em>"Verificar corrupção"</em> — CEIS, CNEP, PEP<br>
      • <em>"Processos judiciais"</em> — DataJud/CNJ<br>
      • <em>"Nepotismo"</em> — parentes em cargos<br>
      • <em>"Investigação completa"</em> — dossiê total<br>
      • <em>"Ranking suspeitos"</em> — top da semana<br><br>

      <strong style="color:#60a5fa;">💡 Dados & Busca</strong><br>
      • Cole um <strong>CPF</strong> (11 dígitos) — sanções, benefícios<br>
      • Cole um <strong>CNPJ</strong> (14 dígitos) — investigar empresa<br>
      • <em>"Pesquisar na web: ..."</em> — busca na internet<br>
      • <em>"Notícias sobre..."</em> — buscar notícias<br><br>

      <strong style="color:#34d399;">🏘️ Localização</strong><br>
      • <em>"Sou de Campinas"</em> — salva sua cidade<br>
      • <em>"Dados do meu município"</em> — ver prefeitura<br><br>

      <strong style="color:#fbbf24;">📊 Seções do Portal</strong><br>
      • <em>"Mapa de repasses"</em> · <em>"Eleições"</em> · <em>"Viagens"</em><br>
      • <em>"Rede de conexões"</em> · <em>"Servidores"</em><br><br>

      <strong style="color:#fb923c;">🦸 Superpoderes de Fiscalização</strong><br>
      • <em>"Monitorar [nome]"</em> — vigilância automática com alertas<br>
      • <em>"Minhas vigilâncias"</em> — lista de monitorados<br>
      • <em>"Comparar [A] com [B]"</em> — confrontar dois políticos<br>
      • <em>"Cruzar fornecedores"</em> — fornecedores × CEIS/CNEP<br>
      • <em>"Ranking de gastos"</em> — maiores gastadores da CEAP<br>
      • <em>"Investigação completa"</em> — dossiê com score de risco<br><br>

      <strong style="color:#f87171;">📢 Ação Cívica</strong><br>
      • <em>"Gerar denúncia"</em> — texto pronto para CGU, MPF, TCU<br>
      • <em>"Canais de denúncia"</em> — onde e como denunciar<br>
      • <em>"Dicas de denúncia"</em> — como fazer uma boa denúncia<br><br>

      <strong style="color:#34d399;">🧮 Calculadora Cívica</strong><br>
      • <em>"Custo do mandato"</em> — quanto o deputado custa pra você<br>
      • <em>"Imposto de 5000"</em> — calculadora fiscal pessoal<br>
      • <em>"Eficiência parlamentar"</em> — custo por voto emitido<br><br>

      <strong style="color:#60a5fa;">📤 Exportar & Compartilhar</strong><br>
      • <em>"Baixar relatório"</em> — download .txt com todos os dados<br>
      • <em>"Compartilhar"</em> — WhatsApp, Twitter, Telegram<br>
      • <em>"Meu histórico"</em> — investigações desta sessão
    `);
    mostrarChips([
      { emoji: "🗺️", label: "Mapa do portal",     acao: () => window.HyperBotGuia?.mostrarMapaPortal?.() },
      { emoji: "🚀", label: "Tour do iniciante",   acao: () => window.HyperBotGuia?.iniciarTour?.("iniciante") },
      { emoji: "👔", label: "Buscar político",     acao: () => solicitarNome("buscar_politico") },
      { emoji: "🏆", label: "Ranking suspeitos",   acao: () => executar("ranking") },
    ]);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SAUDAÇÃO INICIAL
  // ════════════════════════════════════════════════════════════════════════
  function saudar() {
    profile.sessoes++;
    salvarPerfil();

    const hora      = new Date().getHours();
    const saudacao  = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    const cidade    = profile.municipio ? ` de <strong>${profile.municipio}</strong>` : "";
    const primeiroUso = profile.primeiroUso;

    if (primeiroUso) {
      profile.primeiroUso = false;
      salvarPerfil();
      setTimeout(() => {
        bot("positivo", `${saudacao}, cidadão! 👋`,
          `Sou o <strong>HyperZ Agente</strong> — seu assistente de fiscalização política.<br><br>
           Posso te ajudar a:<br>
           🔍 Investigar qualquer político<br>
           💰 Verificar gastos com dinheiro público<br>
           ⚖️ Buscar processos judiciais<br>
           🚨 Checar sanções e corrupção<br>
           🌐 Pesquisar na internet<br><br>
           <em>Para começar, me diga de qual cidade você é ou o nome de um político que quer investigar.</em>`);
        setTimeout(() => mostrarChips([
          { emoji: "🚀", label: "Tour do portal",          acao: () => window.HyperBotGuia?.iniciarTour?.("iniciante") },
          { emoji: "🗺️", label: "Ver todas as seções",     acao: () => window.HyperBotGuia?.mostrarMapaPortal?.() },
          { emoji: "📍", label: "Minha cidade é...",       acao: () => { ctx.aguardandoResposta = "config_cidade"; bot("info", "📍 Qual sua cidade?", "Ex: São Paulo, Recife, Porto Alegre..."); } },
          { emoji: "👔", label: "Buscar meu deputado",     acao: () => executar("meu_deputado") },
          { emoji: "🏆", label: "Ver ranking suspeitos",   acao: () => executar("ranking") },
        ]), 800);
      }, 700);
    } else {
      setTimeout(() => {
        const dep_nome = profile.deputado || ctx.ultimoPolitico;
        bot("positivo", `${saudacao}${cidade}! 💪`,
          dep_nome
            ? `Pronto para fiscalizar? Quer continuar investigando <strong>${dep_nome}</strong> ou começar algo novo?`
            : "Pronto para fiscalizar os políticos? Pesquise um nome, cole um CPF/CNPJ ou use os botões abaixo.");
        setTimeout(() => mostrarChipsProativos(), 600);
      }, 500);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INPUT POR VOZ (Web Speech API)
  // ════════════════════════════════════════════════════════════════════════
  let reconhecimento = null;

  function iniciarVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      bot("atencao", "🎤 Voz não suportada",
        "Seu navegador não suporta entrada por voz. Use o Chrome ou Edge para esta função.");
      return;
    }
    if (reconhecimento && reconhecimento._ativo) {
      reconhecimento.stop();
      return;
    }
    reconhecimento = new SpeechRecognition();
    reconhecimento.lang         = "pt-BR";
    reconhecimento.continuous   = false;
    reconhecimento.interimResults = false;
    reconhecimento._ativo       = true;

    const micBtn = document.getElementById("hz-mic-btn");
    if (micBtn) micBtn.style.background = "#dc2626";

    reconhecimento.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      const input = document.getElementById("hyperbot-chat-input");
      if (input) input.value = texto;
      window.HyperBotChat?.handleInput?.(texto);
    };
    reconhecimento.onerror = (e) => {
      if (e.error !== "aborted") bot("atencao", "🎤 Erro no microfone", `Erro: ${e.error}. Tente novamente.`);
      reconhecimento._ativo = false;
      if (micBtn) micBtn.style.background = "#3f3f46";
    };
    reconhecimento.onend = () => {
      reconhecimento._ativo = false;
      if (micBtn) micBtn.style.background = "#3f3f46";
    };
    reconhecimento.start();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HELPER bot() — atalho para pushBotMsg
  // ════════════════════════════════════════════════════════════════════════
  function bot(sev, titulo, texto) {
    window.HyperBotChat?.pushBotMsg?.(sev, titulo, texto);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  EXPORTAR API PÚBLICA
  // ════════════════════════════════════════════════════════════════════════
  window.HyperBotAgent = {
    processarMensagem,
    saudar,
    iniciarVoz,
    mostrarChips,
    mostrarChipsProativos,
    mostrarAjuda,
    buscaWeb,
    profile,
    salvarPerfil,
    ctx,
    // Invocado pelos botões de chip via onclick="window.HyperBotAgent._runChip(N)"
    _runChip(idx) {
      const fn = _chipHandlers[idx];
      if (typeof fn === "function") fn();
    },
  };
})();
