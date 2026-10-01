// transparency/js/hyperbot.js — HyperBot: Agente de Investigação Política
// Monitora dados carregados no portal e dispara análises automáticas de padrões suspeitos

(function () {
  "use strict";

  // ── Estado global do bot ──────────────────────────────────────────────────
  const Bot = {
    isOpen: false,
    isMinimized: false,
    messages: [],
    context: { type: null, data: null }, // o que o usuário está vendo agora
    queue: [], // investigações pendentes
    running: false,
    unread: 0,
    typingTimer: null,
  };

  // ── Severidade e emojis ───────────────────────────────────────────────────
  const SEV = {
    info: {
      label: "Info",
      color: "#60a5fa",
      bg: "#1e3a5f",
      border: "#1d4ed8",
      icon: "ℹ️",
    },
    atencao: {
      label: "Atenção",
      color: "#fbbf24",
      bg: "#3f2d0a",
      border: "#d97706",
      icon: "⚠️",
    },
    critico: {
      label: "Crítico",
      color: "#f87171",
      bg: "#3b0d0d",
      border: "#dc2626",
      icon: "🔴",
    },
    positivo: {
      label: "Normal",
      color: "#34d399",
      bg: "#052e16",
      border: "#166534",
      icon: "✅",
    },
  };

  // ── Motor de Investigação ─────────────────────────────────────────────────
  const Engine = {
    // 1. Concentração de fornecedores
    concentracaoFornecedor(despesas) {
      if (!despesas || despesas.length < 5) return null;
      const total = despesas.reduce(
        (a, c) => a + (parseFloat(c.valorLiquido) || 0),
        0,
      );
      if (total === 0) return null;

      const por_cnpj = {};
      despesas.forEach((d) => {
        const k = d.cnpjCpfFornecedor || d.nomeFornecedor || "Sem ID";
        por_cnpj[k] = (por_cnpj[k] || 0) + (parseFloat(d.valorLiquido) || 0);
      });
      const sorted = Object.entries(por_cnpj).sort((a, b) => b[1] - a[1]);
      const top1pct = ((sorted[0][1] / total) * 100).toFixed(1);
      const top3total = sorted.slice(0, 3).reduce((a, c) => a + c[1], 0);
      const top3pct = ((top3total / total) * 100).toFixed(1);
      const topName =
        despesas.find(
          (d) => (d.cnpjCpfFornecedor || d.nomeFornecedor) === sorted[0][0],
        )?.nomeFornecedor || sorted[0][0];

      if (parseFloat(top1pct) >= 70) {
        return {
          sev: parseFloat(top1pct) >= 85 ? "critico" : "atencao",
          titulo: `Concentração ${parseFloat(top1pct) >= 85 ? "extrema" : "alta"} em 1 fornecedor`,
          texto: `<strong>${top1pct}% de todos os gastos</strong> foram direcionados a um único fornecedor: <em>${topName}</em>. Padrão acima de 70% é associado a direcionamento de recursos (ref. metodologia CGU).`,
          acao: "Verificar CNPJ no Radar Anti-Corrupção",
          aacao: () => window.customSwitchTab && window.customSwitchTab("radar"),
          fonte: "despesas[]",
        };
      }
      if (parseFloat(top3pct) >= 90 && sorted.length > 3) {
        return {
          sev: "atencao",
          titulo: "Alta concentração em poucos fornecedores",
          texto: `Top 3 fornecedores concentram <strong>${top3pct}%</strong> do total de gastos. Baixa diversificação pode indicar favorecimento.`,
          acao: null,
          fonte: "despesas[]",
        };
      }
      return null;
    },

    // 2. Pagamentos mensais fixos suspeitos (possível contrato fictício)
    pagamentosFixos(despesas) {
      if (!despesas || despesas.length < 4) return null;
      const por_cnpj = {};
      despesas.forEach((d) => {
        const k = d.cnpjCpfFornecedor || d.nomeFornecedor || "X";
        if (!por_cnpj[k])
          por_cnpj[k] = { valores: [], nome: d.nomeFornecedor, count: 0 };
        por_cnpj[k].valores.push(parseFloat(d.valorLiquido) || 0);
        por_cnpj[k].count++;
      });

      for (const [, info] of Object.entries(por_cnpj)) {
        if (info.count < 4) continue;
        const unique = new Set(info.valores.map((v) => v.toFixed(2)));
        if (unique.size === 1 && info.count >= 4) {
          return {
            sev: "atencao",
            titulo: "Pagamentos mensais idênticos",
            texto: `O fornecedor <em>${info.nome}</em> recebeu o mesmo valor exato por <strong>${info.count} meses consecutivos</strong>: R$ ${info.valores[0].toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Padrão comum em contratos fictícios de escritório.`,
            acao: null,
          };
        }
      }
      return null;
    },

    // 3. Fracionamento: valores próximos a limites de licitação
    valoresLimite(despesas) {
      if (!despesas || despesas.length < 2) return null;
      // Lei 8.666/93 (serviços) — ainda em vigor para contratos em curso
      const LIMITE_ANTIGO = 17600;
      // Nova Lei 14.133/2021 (serviços)
      const LIMITE_NOVO = 57200;

      const suspeitos8666 = despesas.filter((d) => {
        const v = parseFloat(d.valorLiquido) || 0;
        return v > LIMITE_ANTIGO * 0.85 && v < LIMITE_ANTIGO * 1.02;
      });
      const suspeitos14133 = despesas.filter((d) => {
        const v = parseFloat(d.valorLiquido) || 0;
        return v > LIMITE_NOVO * 0.85 && v < LIMITE_NOVO * 1.02;
      });

      const total = suspeitos8666.length + suspeitos14133.length;
      if (total >= 3) {
        const detalhes = [];
        if (suspeitos8666.length >= 2)
          detalhes.push(
            `${suspeitos8666.length} próximos a R$17.600 (Lei 8.666/93)`,
          );
        if (suspeitos14133.length >= 2)
          detalhes.push(
            `${suspeitos14133.length} próximos a R$57.200 (Lei 14.133/2021)`,
          );
        return {
          sev: total >= 5 ? "critico" : "atencao",
          titulo: `${total} pagamento(s) próximos ao limite de licitação`,
          texto: `Detectados <strong>${total} pagamentos</strong> logo abaixo de limiares legais de dispensa de licitação: ${detalhes.join("; ")}. Fracionamento é vedado pelo art. 8° §5° da Lei 14.133/2021 e art. 23 §5° da Lei 8.666/93.`,
          acao: null,
          fonte: "despesas[]",
        };
      }
      return null;
    },

    // 3b. Limite mensal da CEAP (R$45.613,55)
    ceapLimite(despesas) {
      if (!despesas || despesas.length < 2) return null;
      const TETO_MENSAL = 45613.55;
      const porMes = {};
      despesas.forEach((d) => {
        const k = `${d.ano}-${String(d.mes).padStart(2, "0")}`;
        porMes[k] = (porMes[k] || 0) + (parseFloat(d.valorLiquido) || 0);
      });
      const mesesAcima = Object.entries(porMes).filter(
        ([, v]) => v > TETO_MENSAL,
      );
      const mesesAlerta = Object.entries(porMes).filter(
        ([, v]) => v > TETO_MENSAL * 0.92 && v <= TETO_MENSAL,
      );

      if (mesesAcima.length > 0) {
        const [mes, val] = mesesAcima.sort((a, b) => b[1] - a[1])[0];
        const [ano, m] = mes.split("-");
        const nomeMes = new Date(ano, m - 1).toLocaleString("pt-BR", {
          month: "long",
          year: "numeric",
        });
        return {
          sev: "critico",
          titulo: `Teto da CEAP ultrapassado em ${mesesAcima.length} mês(es)`,
          texto: `Em <strong>${nomeMes}</strong>, os gastos atingiram <strong>R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>, acima do teto legal da CEAP de <strong>R$ 45.613,55/mês</strong>. Gasto acima do teto é irregular e sujeito à devolução.`,
          acao: null,
          fonte: "despesas[]",
        };
      }
      if (mesesAlerta.length >= 2) {
        return {
          sev: "atencao",
          titulo: `${mesesAlerta.length} mês(es) com gastos acima de 92% do teto CEAP`,
          texto: `Em ${mesesAlerta.length} meses os gastos ficaram entre R$ 42.000 e R$ 45.613 — acima de 92% do teto mensal. Utilização consistentemente próxima ao máximo é padrão de uso integral da cota.`,
          acao: null,
          fonte: "despesas[]",
        };
      }
      return null;
    },

    // 3c. Pagamentos em fins de semana e feriados
    pagamentosFinsDeSemana(despesas) {
      if (!despesas || despesas.length < 5) return null;
      const FERIADOS = [
        "01-01",
        "04-21",
        "05-01",
        "09-07",
        "10-12",
        "11-02",
        "11-15",
        "11-20",
        "12-25",
      ];
      const suspeitos = despesas.filter((d) => {
        if (!d.dataDocumento) return false;
        const dt = new Date(d.dataDocumento + "T12:00:00");
        const diaSemana = dt.getDay();
        const mmdd = `${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        return diaSemana === 0 || diaSemana === 6 || FERIADOS.includes(mmdd);
      });
      if (suspeitos.length >= 5) {
        return {
          sev: "critico",
          titulo: `${suspeitos.length} pagamentos em fins de semana ou feriados`,
          texto: `Detectados <strong>${suspeitos.length} documentos fiscais</strong> emitidos em fins de semana ou feriados nacionais. Pagamentos realizados fora de dias úteis são anomalia na gestão da cota parlamentar — estabelecimentos legítimos raramente emitem notas fora do horário comercial.`,
          acao: null,
          fonte: "despesas[]",
        };
      }
      if (suspeitos.length >= 2) {
        return {
          sev: "atencao",
          titulo: `${suspeitos.length} pagamentos em dias não úteis`,
          texto: `${suspeitos.length} transações registradas em fins de semana ou feriados. Requer verificação dos documentos originais.`,
          acao: null,
          fonte: "despesas[]",
        };
      }
      return null;
    },

    // 4. Gastos elevados num único mês
    picoGastoMensal(despesas) {
      if (!despesas || despesas.length < 10) return null;
      const porMes = {};
      despesas.forEach((d) => {
        const k = `${d.ano}-${String(d.mes).padStart(2, "0")}`;
        porMes[k] = (porMes[k] || 0) + (parseFloat(d.valorLiquido) || 0);
      });
      const valores = Object.values(porMes);
      if (valores.length < 3) return null;
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const max = Math.max(...valores);
      const maxMes = Object.entries(porMes).find(([, v]) => v === max)?.[0];
      if (max > media * 2.5) {
        const [ano, mes] = maxMes.split("-");
        const nomeMes = new Date(ano, mes - 1).toLocaleString("pt-BR", {
          month: "long",
          year: "numeric",
        });
        return {
          sev: "atencao",
          titulo: "Pico incomum de gastos em " + nomeMes,
          texto: `Em <strong>${nomeMes}</strong>, os gastos foram <strong>${((max / media - 1) * 100) | 0}% acima da média mensal</strong> (R$${max.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} vs média de R$${media.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}). Períodos eleitorais ou de fim de mandato costumam concentrar gastos irregulares.`,
          acao: null,
        };
      }
      return null;
    },

    // 5. Análise de alinhamento em votações
    alinhamentoVotos(votos, _partido) {
      if (!votos || votos.length < 5) return null;
      const sim = votos.filter((v) => v.tipoVoto === "Sim").length;
      const nao = votos.filter((v) => v.tipoVoto === "Não").length;
      const abs = votos.filter((v) => v.tipoVoto === "Abstenção").length;
      const total = sim + nao + abs;
      if (total < 5) return null;
      const absPct = ((abs / total) * 100).toFixed(0);
      const presenca = (((sim + nao) / total) * 100).toFixed(0);

      if (parseInt(absPct) >= 30) {
        return {
          sev: "atencao",
          titulo: `${absPct}% de abstenções nas votações`,
          texto: `O deputado se absteve em <strong>${abs} de ${total} votações</strong> analisadas (${absPct}%). Alta abstenção pode indicar fuga de posicionamento em pautas polêmicas ou negociação de apoio em troca de recursos.`,
          acao: null,
          fonte: "votações[]",
        };
      }
      if (parseInt(presenca) < 75) {
        return {
          sev: parseInt(presenca) < 60 ? "critico" : "atencao",
          titulo: `Ausência sistemática: ${100 - parseInt(presenca)}% das votações`,
          texto: `Apenas <strong>${presenca}% de presença efetiva</strong> nas votações nominais do plenário. O limite de atenção é 75%; abaixo de 60% é crítico. O subsídio mensal de <strong>R$ 46.366</strong> é pago integralmente independentemente de frequência.`,
          acao: null,
          fonte: "votações[]",
        };
      }
      return {
        sev: "positivo",
        titulo: "Participação regular nas votações",
        texto: `<strong>${presenca}% de presença</strong> nas votações analisadas. ${sim} votos SIM · ${nao} votos NÃO · ${abs} abstenções. Índice acima do limiar de 75%.`,
        acao: null,
        fonte: "votações[]",
      };
    },

    // 5b. Ausência sistemática cruzada com CEAP
    cruzamentoCEAPVotos(despesas, votos) {
      if (!despesas || despesas.length < 5 || !votos || votos.length < 5)
        return null;
      const sim = votos.filter((v) => v.tipoVoto === "Sim").length;
      const nao = votos.filter((v) => v.tipoVoto === "Não").length;
      const total =
        sim + nao + votos.filter((v) => v.tipoVoto === "Abstenção").length;
      const presenca = ((sim + nao) / total) * 100;
      const totalGastos = despesas.reduce(
        (a, c) => a + (parseFloat(c.valorLiquido) || 0),
        0,
      );
      const mediaGastos =
        totalGastos /
        (new Set(despesas.map((d) => `${d.ano}-${d.mes}`)).size || 1);

      if (presenca < 70 && mediaGastos > 20000) {
        return {
          sev: "critico",
          titulo: "Baixa presença + CEAP elevada: risco combinado",
          texto: `<strong>${(100 - presenca).toFixed(0)}% de ausência</strong> nas votações, enquanto a média mensal de gastos com a cota é <strong>R$ ${mediaGastos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>. Combinar baixa participação legislativa com alto consumo da CEAP é padrão incompatível com a função parlamentar (Lei 14.192/2021).`,
          acao: null,
          fonte: "cruzamento votações×CEAP",
        };
      }
      return null;
    },

    // 6. Votações contra a maioria (postura independente vs isolamento)
    votoContraCorrente(votos) {
      if (!votos || votos.length < 5) return null;
      const contraAprovados = votos.filter(
        (v) => v.tipoVoto === "Não" && v.aprovacao === 1,
      ).length;
      const pct = ((contraAprovados / votos.length) * 100).toFixed(0);
      if (contraAprovados >= 3) {
        return {
          sev: "info",
          titulo: `Votou contra ${contraAprovados} projetos aprovados`,
          texto: `Em <strong>${contraAprovados} ocasiões</strong> (${pct}% das votações), o deputado votou <strong>NÃO</strong> em projetos que foram aprovados pelo plenário. Pode indicar oposição consistente ou isolamento político.`,
          acao: null,
          fonte: "votações[]",
        };
      }
      return null;
    },

    // 6b. Alinhamento com o partido
    alinhamentoPartido(votos, partido) {
      if (!votos || votos.length < 10 || !partido) return null;
      const comMaioria = votos.filter(
        (v) => v.comMaioria === true || v.comMaioria === 1,
      ).length;
      const pct = ((comMaioria / votos.length) * 100).toFixed(0);
      if (parseInt(pct) < 40) {
        return {
          sev: "atencao",
          titulo: `Baixo alinhamento com ${partido}: ${pct}%`,
          texto: `Em apenas <strong>${pct}% das votações</strong> o deputado votou de acordo com a maioria do plenário. Baixo alinhamento pode refletir independência ideológica ou negociações paralelas de apoio.`,
          acao: null,
          fonte: "votações[]",
        };
      }
      return null;
    },

    // 7. Resumo de perfil
    resumoPerfil(deputado) {
      const ls = deputado.ultimoStatus;
      const nascimento = deputado.dataNascimento
        ? new Date(deputado.dataNascimento)
        : null;
      const idade = nascimento
        ? ((new Date() - nascimento) / (365.25 * 24 * 3600 * 1000)) | 0
        : null;
      return {
        sev: "info",
        titulo: `${ls.nomeEleitoral} — ${ls.siglaPartido}/${ls.siglaUf}`,
        texto: `${idade ? idade + " anos · " : ""}${ls.situacao || "Em exercício"} · ${deputado.escolaridade || "Escolaridade não informada"}. Carregando análise de dados financeiros e votações...`,
        acao: "Ver análise completa",
        aacao: () => {
          if (typeof switchDeputyTab !== "undefined" && window._currentDeputy)
            switchDeputyTab("analise", window._currentDeputy.id);
        },
      };
    },

    // 8. Viagens a Serviço
    viagensInternacionais(viagens) {
      if (!viagens || viagens.length === 0) return null;
      const suspeitas = viagens.filter((v) => {
        const destinos = v.destinos || [];
        return destinos.some(
          (d) => d.nomePais && !d.nomePais.toLowerCase().includes("brasil"),
        );
      });
      if (suspeitas.length > 0) {
        return {
          sev: "atencao",
          titulo: `✈️ ${suspeitas.length} viagem(ns) para o exterior`,
          texto:
            `Foram detectadas viagens internacionais, que exigem justificativa clara e possuem altos custos de diárias em moeda estrangeira.<br>` +
            suspeitas
              .slice(0, 3)
              .map(
                (v) =>
                  `• ${v.pessoa?.nome || "Servidor"} ➔ <strong>${v.destinos.map((d) => d.nomePais).join(", ")}</strong> (R$ ${(parseFloat(v.valorTotalViagem) || 0).toLocaleString("pt-BR")})`,
              )
              .join("<br>"),
          acao: null,
          fonte: "Viagens a Serviço",
        };
      }
      return null;
    },

    viagensSemMotivo(viagens) {
      if (!viagens || viagens.length === 0) return null;
      const suspeitas = viagens.filter((v) => {
        const motivo = (v.motivo || v.justificativa || "").toLowerCase();
        return (
          motivo.length < 10 ||
          motivo.includes("sem motivo") ||
          motivo.includes("não informado") ||
          motivo.includes("sigiloso")
        );
      });
      if (suspeitas.length > 0) {
        return {
          sev: "critico",
          titulo: `⚠️ ${suspeitas.length} viagem(ns) com motivo omitido ou sigiloso`,
          texto:
            `Viagens com justificativa genérica ou não informada contrariam o princípio da transparência pública (LAI).<br>` +
            suspeitas
              .slice(0, 3)
              .map(
                (v) =>
                  `• ${v.pessoa?.nome || "Servidor"} (R$ ${(parseFloat(v.valorTotalViagem) || 0).toLocaleString("pt-BR")})`,
              )
              .join("<br>"),
          acao: null,
        };
      }
      return null;
    },

    viagensAltoCusto(viagens) {
      if (!viagens || viagens.length === 0) return null;
      const suspeitas = viagens.filter(
        (v) => (parseFloat(v.valorTotalViagem) || 0) > 25000,
      );
      if (suspeitas.length > 0) {
        return {
          sev: "atencao",
          titulo: `💸 ${suspeitas.length} viagem(ns) de custo extremo`,
          texto:
            `Viagens que custaram mais de <strong>R$ 25.000,00</strong> cada aos cofres públicos num único lançamento.<br>` +
            suspeitas
              .slice(0, 2)
              .map(
                (v) =>
                  `• ${v.pessoa?.nome || "Servidor"} (R$ ${(parseFloat(v.valorTotalViagem) || 0).toLocaleString("pt-BR")})`,
              )
              .join("<br>"),
          acao: null,
        };
      }
      return null;
    },
  };

  // ── Registry de ações do engine de investigação ──────────────────────────
  const _engineHandlers = [];

  // ── Renderização de mensagem ──────────────────────────────────────────────
  function renderMessage(msg) {
    const s = SEV[msg.sev] || SEV.info;
    let acaoHtml = "";
    if (msg.acao) {
      const idx = _engineHandlers.length;
      _engineHandlers.push(msg.aacao || null);
      acaoHtml = `<button class="hyperbot-acao"
           style="margin-top:8px;font-size:12px;font-weight:700;padding:6px 14px;
                  border-radius:8px;border:1px solid ${s.border};background:${s.bg};
                  color:${s.color};cursor:pointer;"
           onclick="window.HyperBot._runEngine(${idx})">
           ${msg.acao} →
         </button>`;
    }

    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `
      <div class="hyperbot-msg" style="padding:4px 0 8px;max-width:760px;margin:0 auto;animation:hyperbotSlide .3s ease;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                      display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🤖</div>
          <div style="flex:1;min-width:0;">
            <div style="background:${s.bg};border:1px solid ${s.border};border-radius:16px 16px 16px 4px;padding:14px 16px;">
              <div style="font-size:11px;font-weight:800;color:${s.color};
                          text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">${s.icon} ${s.label}</div>
              <div style="font-weight:700;color:#f4f4f5;font-size:14px;line-height:1.4;margin-bottom:6px;">${msg.titulo}</div>
              <div style="color:#a1a1aa;font-size:13px;line-height:1.7;">${msg.texto}</div>
              ${acaoHtml}
              ${msg.fonte ? `<div style="margin-top:8px;font-size:11px;color:#52525b;">📁 ${msg.fonte}</div>` : ""}
            </div>
            <div style="font-size:11px;color:#3f3f46;margin-top:4px;">${hora}</div>
          </div>
        </div>
      </div>`;
  }

  function renderTyping() {
    return `
      <div class="hyperbot-msg hyperbot-typing mb-3">
        <div class="flex items-start gap-2">
          <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
               style="background:linear-gradient(135deg,#7c3aed,#4f46e5)">🤖</div>
          <div class="rounded-xl rounded-tl-none px-3 py-2.5" style="background:#18181b;border:1px solid #27272a">
            <div style="display:flex;gap:4px;align-items:center;height:16px">
              <span class="hyperbot-dot" style="width:6px;height:6px;border-radius:50%;background:#7c3aed;animation:hyperbotBounce 1s ease infinite"></span>
              <span class="hyperbot-dot" style="width:6px;height:6px;border-radius:50%;background:#7c3aed;animation:hyperbotBounce 1s ease .2s infinite"></span>
              <span class="hyperbot-dot" style="width:6px;height:6px;border-radius:50%;background:#7c3aed;animation:hyperbotBounce 1s ease .4s infinite"></span>
            </div>
          </div>
        </div>
      </div>`;
  }

  // ── Injetar CSS ───────────────────────────────────────────────────────────
  function injectCSS() {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes hyperbotSlide  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
      @keyframes hyperbotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      @keyframes hyperbotPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.55)} 70%{box-shadow:0 0 0 12px rgba(124,58,237,0)} }
      @keyframes hzSlideIn      { from{transform:translateX(-100%)} to{transform:translateX(0)} }

      /* ── Botão flutuante ── */
      #hyperbot-btn { animation: hyperbotPulse 2.5s infinite; }

      /* ── Painel full-screen ── */
      #hyperbot-panel {
        position: fixed;
        inset: 0;
        z-index: 9998;
        transition: opacity .25s ease, transform .3s cubic-bezier(.4,0,.2,1);
      }
      #hyperbot-panel.hidden-panel {
        opacity: 0;
        transform: translateY(24px) scale(.985);
        pointer-events: none !important;
      }

      /* ── Feed scrollbar ── */
      #hyperbot-feed { scrollbar-width: thin; scrollbar-color: #27272a transparent; }
      #hyperbot-feed::-webkit-scrollbar { width: 4px; }
      #hyperbot-feed::-webkit-scrollbar-thumb { background:#27272a; border-radius:4px; }

      /* ── Centraliza filhos do feed ── */
      #hyperbot-feed > * {
        max-width: 760px;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        box-sizing: border-box;
      }

      /* ── Links dentro do chat ── */
      #hyperbot-feed a { color:#60a5fa; }
      #hyperbot-feed a:hover { text-decoration:underline; }

      /* ══ MOBILE (<768px) ════════════════════════════════════════════════ */
      @media (max-width: 767px) {

        /* Botão flutuante — acima da bottom-nav do portal, canto direito */
        #hyperbot-btn {
          bottom: 68px !important;
          right: 16px !important;
          width: 48px !important;
          height: 48px !important;
          font-size: 20px !important;
        }

        /* Sidebar — overlay deslizante da esquerda */
        #hz-agent-sidebar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          z-index: 10001 !important;
          width: 280px !important;
          min-width: 0 !important;
          transform: translateX(-100%);
          transition: transform .25s cubic-bezier(.4,0,.2,1);
          display: flex !important;
        }
        #hz-agent-sidebar.hz-sidebar-open {
          transform: translateX(0);
          box-shadow: 4px 0 32px rgba(0,0,0,.6);
        }

        /* Backdrop escuro atrás da sidebar */
        #hz-sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0,0,0,.6);
        }
        #hz-sidebar-backdrop.hz-sidebar-open { display: block; }

        /* Mostrar botão hamburger */
        #hz-sidebar-toggle { display: flex !important; }

        /* Feed — padding menor */
        #hyperbot-feed { padding: 12px 10px !important; }

        /* Mensagens — largura total */
        #hyperbot-feed > * { max-width: 100% !important; }

        /* Topbar compacta */
        #hz-topbar { padding: 10px 12px !important; }

        /* Input footer — respeita área segura iOS */
        #hz-chat-footer-wrap {
          padding: 10px 12px !important;
          padding-bottom: max(10px, env(safe-area-inset-bottom)) !important;
        }

        /* Empty state — compacto */
        #hyperbot-empty { padding: 24px 12px !important; }
        #hyperbot-empty .hz-empty-emoji { font-size: 36px !important; margin-bottom: 10px !important; }
        #hyperbot-empty .hz-empty-title { font-size: 17px !important; }
        #hyperbot-empty .hz-empty-desc  { font-size: 12px !important; }

        /* Tour button — menor */
        #hz-tour-btn { padding: 9px 16px !important; font-size: 12px !important; }

        /* Chips de ação — menores e wrap */
        .hz-chip-btn { padding: 6px 10px !important; font-size: 11px !important; }

        /* Balão do usuário — 90% de largura */
        .hyperbot-msg > div > div { max-width: 90% !important; }

        /* Avatar menor no mobile */
        .hz-avatar { width: 28px !important; height: 28px !important; font-size: 14px !important; }
      }

      /* ══ TABLET (768-1023px) ════════════════════════════════════════════ */
      @media (min-width: 768px) and (max-width: 1023px) {
        #hz-agent-sidebar { width: 200px !important; min-width: 200px !important; }
        #hyperbot-feed { padding: 16px 14px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Criar widget full-screen ──────────────────────────────────────────────
  function createWidget() {
    injectCSS();

    // ── Ações rápidas da sidebar ──
    const QUICK = [
      ["🕵️", "Investigar Completo",  "window.HyperBotChat?.handleInput?.('investigação completa')"],
      ["🏆", "Top Corrupção",        "HyperBot.runCorruptionRanking()"],
      ["💸", "Gastos CEAP",          "HyperBot.runSuggestion('gastos')"],
      ["🗳️", "Votações",             "HyperBot.runSuggestion('votos')"],
      ["🏢", "Cruzar Fornecedores",  "window.HyperBotChat?.handleInput?.('cruzar fornecedores')"],
      ["📋", "Emendas",              "HyperBot.runSuggestion('emendas')"],
      ["💰", "Patrimônio TSE",       "HyperBot.runSuggestion('patrimonio')"],
      ["📡", "Minhas Vigilâncias",   "window.HyperBotMonitor?.listar?.()"],
      ["🔗", "Comparar Políticos",   "window.HyperBotChat?.handleInput?.('comparar')"],
      ["🌐", "Buscar na Web",        "window.HyperBotChat?.handleInput?.('pesquisar na web')"],
    ];

    // ── Ferramentas Cívicas ──
    const CIVICAS = [
      ["📝", "Gerar Denúncia",       "window.HyperBotDenuncia?.gerarDenuncia?.()"],
      ["📢", "Canais de Denúncia",   "window.HyperBotDenuncia?.mostrarCanais?.()"],
      ["💸", "Custo do Mandato",     "window.HyperBotCalculadora?.calcularCustoMandato?.()"],
      ["🧮", "Meu Imposto",          "window.HyperBotCalculadora?.calcularImposto?.()"],
      ["📤", "Compartilhar",         "window.HyperBotExportar?.mostrarMenuCompartilhar?.()"],
      ["📄", "Baixar Relatório",     "window.HyperBotExportar?.baixarRelatorio?.()"],
    ];

    const _sidebarBtn = ([ico, lbl, act], cor) =>
      `<button onclick="${act}"
               style="width:100%;padding:8px 10px;background:transparent;border:none;border-radius:8px;
                      color:#71717a;font-size:12px;font-weight:600;cursor:pointer;
                      display:flex;align-items:center;gap:9px;text-align:left;transition:all .12s;"
               onmouseover="this.style.background='#18181b';this.style.color='${cor || "#a78bfa"}'"
               onmouseout="this.style.background='transparent';this.style.color='#71717a'">
         <span style="font-size:15px;width:22px;text-align:center;flex-shrink:0;">${ico}</span>
         <span>${lbl}</span>
       </button>`;

    const qaHTML      = QUICK.map(b => _sidebarBtn(b, "#a78bfa")).join("");
    const civicaHTML  = CIVICAS.map(b => _sidebarBtn(b, "#f87171")).join("");

    // ── Guia & Navegação da sidebar ──
    const GUIA_LINKS = [
      ["🗺️", "Mapa do portal",           "window.HyperBotGuia?.mostrarMapaPortal?.()"],
      ["🚀", "Tour do iniciante",          "window.HyperBotGuia?.iniciarTour?.('iniciante')"],
      ["🕵️", "Como investigar a fundo",   "window.HyperBotGuia?.iniciarTour?.('investigar_fundo')"],
      ["🏘️", "Fiscalizar meu município",  "window.HyperBotGuia?.iniciarTour?.('fiscalizar_municipio')"],
    ];
    const guiaHTML = GUIA_LINKS.map(([ico, lbl, act]) =>
      `<button onclick="${act}"
               style="width:100%;padding:8px 10px;background:transparent;border:none;border-radius:8px;
                      color:#71717a;font-size:12px;font-weight:600;cursor:pointer;
                      display:flex;align-items:center;gap:9px;text-align:left;transition:all .12s;"
               onmouseover="this.style.background='#18181b';this.style.color='#a78bfa'"
               onmouseout="this.style.background='transparent';this.style.color='#71717a'">
         <span style="font-size:15px;width:22px;text-align:center;flex-shrink:0;">${ico}</span>
         <span>${lbl}</span>
       </button>`
    ).join("");

    const wrapper = document.createElement("div");
    wrapper.id = "hyperbot-wrapper";

    wrapper.innerHTML = `

      <!-- ════ PAINEL FULL-SCREEN ════ -->
      <div id="hyperbot-panel" class="hidden-panel"
           style="background:#09090b;display:flex;overflow:hidden;">

        <!-- ── Sidebar esquerda ─────────────────────────────────────────── -->
        <div id="hz-agent-sidebar"
             style="width:248px;min-width:248px;background:#0c0c0f;border-right:1px solid #18181b;
                    display:flex;flex-direction:column;overflow:hidden;">

          <!-- Brand -->
          <div style="padding:18px 16px 14px;border-bottom:1px solid #18181b;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:38px;height:38px;border-radius:12px;
                          background:linear-gradient(135deg,#7c3aed,#4f46e5);
                          display:flex;align-items:center;justify-content:center;
                          font-size:20px;flex-shrink:0;">🤖</div>
              <div>
                <div style="color:#fff;font-weight:900;font-size:14px;line-height:1.2;">
                  HyperZ Agente
                  <span style="background:#7c3aed;color:#fff;border-radius:4px;
                               padding:1px 5px;font-size:9px;font-weight:800;
                               vertical-align:middle;margin-left:3px;">IA</span>
                </div>
                <div style="color:#34d399;font-size:10px;font-weight:700;margin-top:2px;">
                  ● Investigação · Web · Memória
                </div>
              </div>
            </div>
          </div>

          <!-- Botão Nova Conversa -->
          <div style="padding:10px 12px 6px;flex-shrink:0;">
            <button onclick="HyperBot.clearMessages()"
                    style="width:100%;padding:9px 12px;background:#18181b;border:1px solid #27272a;
                           border-radius:10px;color:#a78bfa;font-size:12px;font-weight:700;
                           cursor:pointer;display:flex;align-items:center;gap:8px;
                           transition:all .15s;"
                    onmouseover="this.style.background='#1c1c28';this.style.borderColor='#7c3aed'"
                    onmouseout="this.style.background='#18181b';this.style.borderColor='#27272a'">
              <span style="font-size:15px;">✏️</span> Nova Conversa
            </button>
          </div>

          <!-- Área scrollável: Ferramentas + Guia -->
          <div style="flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#27272a transparent;">

            <!-- Ações Rápidas -->
            <div style="padding:2px 6px 6px;">
              <div style="font-size:9px;font-weight:900;color:#3f3f46;text-transform:uppercase;
                          letter-spacing:.08em;padding:10px 6px 6px;">Ferramentas</div>
              ${qaHTML}
            </div>

            <!-- Ação Cívica -->
            <div style="padding:2px 6px 8px;border-top:1px solid #18181b;">
              <div style="font-size:9px;font-weight:900;color:#f87171;text-transform:uppercase;
                          letter-spacing:.08em;padding:10px 6px 6px;">Ação Cívica</div>
              ${civicaHTML}
            </div>

            <!-- Guia do Portal -->
            <div style="padding:2px 6px 8px;border-top:1px solid #18181b;">
              <div style="font-size:9px;font-weight:900;color:#a78bfa;text-transform:uppercase;
                          letter-spacing:.08em;padding:10px 6px 6px;">Guia & Navegação</div>
              ${guiaHTML}
            </div>

          </div>

          <!-- Status bar -->
          <div style="padding:12px 16px;border-top:1px solid #18181b;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div id="hyperbot-status"
                   style="width:8px;height:8px;border-radius:50%;background:#34d399;
                          box-shadow:0 0 6px #34d399aa;flex-shrink:0;"></div>
              <div style="font-size:10px;color:#3f3f46;line-height:1.5;">
                Câmara · CGU · Senado<br>TSE · DataJud · Web
              </div>
            </div>
          </div>
        </div><!-- /sidebar -->

        <!-- Backdrop mobile para fechar sidebar -->
        <div id="hz-sidebar-backdrop" onclick="HyperBot.closeSidebar()"></div>

        <!-- ── Área principal de chat ───────────────────────────────────── -->
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;">

          <!-- Topbar -->
          <div id="hz-topbar" style="padding:12px 20px;border-bottom:1px solid #18181b;background:#0a0a0d;
                      display:flex;align-items:center;gap:10px;flex-shrink:0;">
            <!-- Botão hamburger (visível só no mobile via CSS) -->
            <button id="hz-sidebar-toggle" onclick="HyperBot.toggleSidebar()"
                    style="display:none;width:36px;height:36px;border-radius:8px;background:#18181b;
                           border:1px solid #27272a;color:#a78bfa;cursor:pointer;font-size:18px;
                           align-items:center;justify-content:center;flex-shrink:0;">☰</button>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:800;color:#fff;line-height:1.2;">HyperZ Agente</div>
              <div style="font-size:10px;color:#52525b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                Fiscalização política · Dados oficiais do Governo
              </div>
            </div>
            <button onclick="HyperBot.toggle()"
                    style="padding:7px 12px;background:#18181b;border:1px solid #27272a;
                           border-radius:8px;color:#71717a;cursor:pointer;font-size:12px;
                           font-weight:700;display:flex;align-items:center;gap:5px;
                           transition:all .15s;white-space:nowrap;flex-shrink:0;"
                    onmouseover="this.style.background='#27272a';this.style.color='#fff'"
                    onmouseout="this.style.background='#18181b';this.style.color='#71717a'">
              ✕ <span style="display:inline">Fechar</span>
            </button>
          </div>

          <!-- Feed de mensagens -->
          <div id="hyperbot-feed"
               style="flex:1;overflow-y:auto;padding:20px 16px;">
            <div style="max-width:760px;margin:0 auto;">
              <div id="hyperbot-empty"
                   style="text-align:center;padding:40px 16px;">
                <div class="hz-empty-emoji" style="font-size:48px;margin-bottom:14px;">🤖</div>
                <div class="hz-empty-title" style="font-weight:900;font-size:20px;color:#a78bfa;margin-bottom:8px;">
                  Olá! Sou o HyperZ Agente
                </div>
                <div class="hz-empty-desc" style="color:#52525b;font-size:13px;line-height:1.7;max-width:440px;margin:0 auto 20px;">
                  Investigo políticos, verifico sanções, busco processos, analiso gastos e gero denúncias — tudo com dados oficiais do governo.
                </div>
                <!-- Botão destaque: Tour do Portal -->
                <div style="margin-bottom:14px;">
                  <button id="hz-tour-btn" onclick="window.HyperBotGuia?.iniciarTour?.('iniciante')"
                          style="padding:10px 20px;background:linear-gradient(135deg,#4c1d95,#3730a3);
                                 border:1px solid #7c3aed;border-radius:12px;color:#fff;font-size:13px;
                                 font-weight:800;cursor:pointer;transition:all .15s;
                                 display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 18px #7c3aed33;"
                          onmouseover="this.style.boxShadow='0 0 28px #7c3aed66'"
                          onmouseout="this.style.boxShadow='0 0 18px #7c3aed33'">
                    🚀 Iniciar tour do portal
                  </button>
                  <div style="font-size:11px;color:#3f3f46;margin-top:5px;">Aprenda a usar tudo em 5 passos</div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:460px;margin:0 auto;">
                  ${[
                    ["🕵️", "Investigar um deputado"],
                    ["🔍", "Verificar sanções (CPF/CNPJ)"],
                    ["🗺️", "Mapa do portal"],
                    ["🏆", "Ranking de suspeitos"],
                  ].map(([ico, txt]) =>
                    `<button onclick="window.HyperBotChat?.handleInput?.('${txt}')"
                             style="padding:8px 14px;background:#18181b;border:1px solid #27272a;
                                    border-radius:10px;color:#a78bfa;font-size:12px;font-weight:600;
                                    cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:6px;"
                             onmouseover="this.style.background='#1c1c28';this.style.borderColor='#7c3aed'"
                             onmouseout="this.style.background='#18181b';this.style.borderColor='#27272a'">
                       ${ico} ${txt}
                     </button>`
                  ).join("")}
                </div>
              </div>
            </div>
          </div>

          <!-- Área do input (preenchida pelo hyperbot_chat.js) -->
          <div style="border-top:1px solid #18181b;background:#09090b;flex-shrink:0;">
            <div id="hz-chat-footer-wrap" style="max-width:760px;margin:0 auto;padding:12px 16px 16px;">
              <div id="hyperbot-chat-footer"></div>
            </div>
          </div>

        </div><!-- /chat principal -->

        <!-- Oculto: mantém compatibilidade com initChipsScroll -->
        <div id="hyperbot-suggestions" style="display:none;"></div>

      </div><!-- /hyperbot-panel -->

      <!-- ── Botão flutuante ─────────────────────────────────────────────── -->
      <button id="hyperbot-btn" onclick="HyperBot.toggle()"
              style="position:fixed;bottom:24px;right:24px;z-index:9999;
                     width:56px;height:56px;border-radius:50%;
                     background:linear-gradient(135deg,#7c3aed,#4f46e5);
                     border:none;cursor:pointer;
                     display:flex;align-items:center;justify-content:center;
                     font-size:24px;color:#fff;
                     box-shadow:0 4px 24px rgba(124,58,237,.45);"
              title="HyperZ Agente — Investigação Política com IA">
        🤖
        <span id="hyperbot-badge"
              style="display:none;position:absolute;top:-4px;right:-4px;
                     background:#ef4444;color:#fff;font-size:10px;font-weight:900;
                     min-width:18px;height:18px;border-radius:999px;
                     align-items:center;justify-content:center;
                     border:2px solid #09090b;"></span>
      </button>
    `;

    document.body.appendChild(wrapper);
  }

  // ── Adicionar mensagem ao feed ────────────────────────────────────────────
  function pushMessage(finding, delay = 0) {
    setTimeout(() => {
      const feed = document.getElementById("hyperbot-feed");
      if (!feed) return;

      // Remove estado vazio
      const empty = document.getElementById("hyperbot-empty");
      if (empty) empty.remove();

      // Mostra "digitando..." por 600ms
      feed.insertAdjacentHTML("beforeend", renderTyping());
      feed.scrollTop = feed.scrollHeight;

      setTimeout(
        () => {
          const typing = feed.querySelector(".hyperbot-typing");
          if (typing) typing.remove();
          feed.insertAdjacentHTML("beforeend", renderMessage(finding));
          feed.scrollTop = feed.scrollHeight;
          Bot.messages.push(finding);

          // Badge de não-lido se painel fechado
          if (!Bot.isOpen) {
            Bot.unread++;
            updateBadge();
          }
        },
        600 + Math.random() * 400,
      );
    }, delay);
  }

  function updateBadge() {
    const badge = document.getElementById("hyperbot-badge");
    if (!badge) return;
    if (Bot.unread > 0) {
      badge.style.display = "flex";
      badge.textContent = Bot.unread > 9 ? "9+" : Bot.unread;
    } else {
      badge.style.display = "none";
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────
  // ── Sidebar mobile: toggle / close ───────────────────────────────────────────
  function _sidebarEl()   { return document.getElementById("hz-agent-sidebar"); }
  function _backdropEl()  { return document.getElementById("hz-sidebar-backdrop"); }

  window.HyperBot = {
    toggleSidebar() {
      const sb = _sidebarEl();
      const bd = _backdropEl();
      if (!sb) return;
      const open = sb.classList.toggle("hz-sidebar-open");
      if (bd) bd.classList.toggle("hz-sidebar-open", open);
    },
    closeSidebar() {
      const sb = _sidebarEl();
      const bd = _backdropEl();
      if (sb) sb.classList.remove("hz-sidebar-open");
      if (bd) bd.classList.remove("hz-sidebar-open");
    },

    toggle() {
      const panel = document.getElementById("hyperbot-panel");
      if (!panel) return;
      Bot.isOpen = !Bot.isOpen;
      panel.classList.toggle("hidden-panel", !Bot.isOpen);

      // Fechar sidebar mobile sempre que o painel alternar
      this.closeSidebar();

      if (Bot.isOpen) {
        Bot.unread = 0;
        updateBadge();

        // Ao abrir pela primeira vez com um deputado carregado:
        // mostra o perfil e roda análises pendentes
        const dep = Bot.context?.data;
        if (dep) {
          if (Bot.messages.length === 0) {
            // Ainda não mostrou nada — exibe perfil + análises disponíveis
            pushMessage(Engine.resumoPerfil(dep), 100);
          }
          // Roda análises de dados já carregados que ainda não foram processados
          const despesas = Bot.context.despesas || [];
          const votos = Bot.context.votos || [];
          const partido = dep.ultimoStatus?.siglaPartido || "";
          if (despesas.length > 0) this._rodarAnalyseDespesas(despesas);
          if (votos.length > 0)
            setTimeout(() => this._rodarAnalyseVotos(votos, partido), 800);
        }
      }
    },

    clearMessages() {
      Bot.messages = [];
      const feed = document.getElementById("hyperbot-feed");
      if (!feed) return;
      feed.innerHTML = `
        <div style="max-width:760px;margin:0 auto;">
          <div id="hyperbot-empty" style="text-align:center;padding:60px 24px;">
            <div style="font-size:52px;margin-bottom:18px;">🤖</div>
            <div style="font-weight:900;font-size:22px;color:#a78bfa;margin-bottom:10px;">Conversa reiniciada</div>
            <div style="color:#52525b;font-size:14px;line-height:1.75;max-width:480px;margin:0 auto 24px;">
              Pronto para uma nova investigação. O que deseja pesquisar?
            </div>
          </div>
        </div>`;
    },

    // Quando um deputado é aberto — captura contexto silenciosamente
    // Não envia mensagens automaticamente; análises só rodam quando o usuário abre o bot
    onDeputyOpen(deputado) {
      Bot.context = { type: "deputy", data: deputado };
      // Reseta análises pendentes para este novo deputado
      Bot.context.despesas = [];
      Bot.context.votos = [];
      Bot.context._analisadoDespesas = false;
      Bot.context._analisadoVotos = false;
    },

    // Quando despesas são carregadas — armazena dados, analisa só se bot estiver aberto
    onExpensesLoad(despesas) {
      if (!despesas || despesas.length === 0) return;
      Bot.context.despesas = despesas;
      Bot.context._analisadoDespesas = false;

      // Só processa se o usuário já abriu o bot
      if (!Bot.isOpen) return;
      this._rodarAnalyseDespesas(despesas);
    },

    _rodarAnalyseDespesas(despesas) {
      if (Bot.context._analisadoDespesas) return;
      Bot.context._analisadoDespesas = true;

      const checks = [
        Engine.concentracaoFornecedor(despesas),
        Engine.pagamentosFixos(despesas),
        Engine.valoresLimite(despesas),
        Engine.ceapLimite(despesas),
        Engine.pagamentosFinsDeSemana(despesas),
        Engine.picoGastoMensal(despesas),
      ].filter(Boolean);

      if (checks.length === 0) {
        pushMessage(
          {
            sev: "positivo",
            titulo: "Padrão de gastos sem alertas críticos",
            texto: `Analisei ${despesas.length} registros de despesas e não detectei padrões típicos de irregularidade no período selecionado.`,
            acao: null,
          },
          300,
        );
      } else {
        checks.forEach((c, i) => pushMessage(c, 300 + i * 1200));
      }
    },

    // Quando votações são carregadas — armazena dados, analisa só se bot estiver aberto
    onVotesLoad(votos, partido) {
      if (!votos || votos.length === 0) return;
      Bot.context.votos = votos;
      Bot.context._analisadoVotos = false;

      if (!Bot.isOpen) return;
      this._rodarAnalyseVotos(votos, partido);
    },

    _rodarAnalyseVotos(votos, partido) {
      if (Bot.context._analisadoVotos) return;
      Bot.context._analisadoVotos = true;

      const despesas = Bot.context.despesas || [];
      const checks = [
        Engine.alinhamentoVotos(votos, partido),
        Engine.votoContraCorrente(votos),
        Engine.alinhamentoPartido(votos, partido),
        despesas.length > 0
          ? Engine.cruzamentoCEAPVotos(despesas, votos)
          : null,
      ].filter(Boolean);

      checks.forEach((c, i) => pushMessage(c, 300 + i * 1000));
    },

    // Quando viagens são pesquisadas
    onViagensLoad(viagens) {
      if (!viagens || viagens.length === 0) return;
      Bot.context.viagens = viagens;
      Bot.context._analisadoViagens = false;
      if (!Bot.isOpen) return;
      this._rodarAnalyseViagens(viagens);
    },

    _rodarAnalyseViagens(viagens) {
      if (Bot.context._analisadoViagens) return;
      Bot.context._analisadoViagens = true;
      const checks = [
        Engine.viagensInternacionais(viagens),
        Engine.viagensSemMotivo(viagens),
        Engine.viagensAltoCusto(viagens),
      ].filter(Boolean);

      if (checks.length === 0) {
        pushMessage(
          {
            sev: "positivo",
            titulo: "Padrão de viagens normal",
            texto: `Analisei ${viagens.length} viagens na lista e não encontrei destinos internacionais suspeitos, falta de justificativas ou custos extremos acima de 25 mil.`,
            acao: null,
          },
          300,
        );
      } else {
        pushMessage(
          {
            sev: "info",
            titulo: `Analisando ${viagens.length} viagens...`,
            texto:
              "Procurando por indícios de irregularidades e farra com passagens...",
            acao: null,
          },
          0,
        );
        checks.forEach((c, i) => pushMessage(c, 1000 + i * 1200));
      }
    },

    // Sugestões rápidas manuais
    runSuggestion(tipo) {
      if (!Bot.isOpen) this.toggle();

      const dep = Bot.context.data;
      const despesas =
        Bot.context.despesas ||
        (typeof currentExpensesData !== "undefined" ? currentExpensesData : []);
      const votos = Bot.context.votos || [];

      if (tipo === "gastos") {
        if (despesas.length === 0) {
          pushMessage(
            {
              sev: "info",
              titulo: "Sem dados de despesas carregados",
              texto:
                "Abra um deputado e acesse a aba <strong>Gastos</strong> primeiro. Depois clique aqui novamente.",
              acao: null,
            },
            0,
          );
          return;
        }
        const total = despesas.reduce(
          (a, c) => a + (parseFloat(c.valorLiquido) || 0),
          0,
        );
        const MEDIA_NACIONAL = 150000;
        const diff = (total / MEDIA_NACIONAL - 1) * 100;
        pushMessage(
          {
            sev: diff > 30 ? "critico" : diff > 0 ? "atencao" : "positivo",
            titulo: "Gastos vs. Média Nacional",
            texto: `Total no período: <strong>R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong><br>Média nacional por período: ~R$ ${MEDIA_NACIONAL.toLocaleString("pt-BR")}<br>${diff > 0 ? `<strong style="color:#f87171">▲ ${diff.toFixed(0)}% acima da média</strong>` : `<strong style="color:#34d399">▼ ${Math.abs(diff).toFixed(0)}% abaixo da média</strong>`}`,
            acao: null,
          },
          0,
        );
        const conc = Engine.concentracaoFornecedor(despesas);
        if (conc) pushMessage(conc, 1200);
        const fix = Engine.pagamentosFixos(despesas);
        if (fix) pushMessage(fix, 2400);
      }

      if (tipo === "votos") {
        if (votos.length === 0) {
          pushMessage(
            {
              sev: "info",
              titulo: "Sem dados de votações",
              texto:
                "Abra um deputado e acesse a aba <strong>Votações</strong> primeiro.",
              acao: null,
            },
            0,
          );
          return;
        }
        const align = Engine.alinhamentoVotos(votos, "");
        if (align) pushMessage(align, 0);
        const contra = Engine.votoContraCorrente(votos);
        if (contra) pushMessage(contra, 1000);
      }

      if (tipo === "fornecedor") {
        if (despesas.length === 0) {
          pushMessage(
            {
              sev: "info",
              titulo: "Sem dados de despesas",
              texto:
                "Abra um deputado e acesse a aba <strong>Gastos</strong> primeiro.",
              acao: null,
            },
            0,
          );
          return;
        }
        const lim = Engine.valoresLimite(despesas);
        if (lim) pushMessage(lim, 0);
        const fix2 = Engine.pagamentosFixos(despesas);
        if (fix2) pushMessage(fix2, 1000);
        else
          pushMessage(
            {
              sev: "positivo",
              titulo: "Sem padrões suspeitos de fornecedor detectados",
              texto:
                "Não encontrei fracionamento de despesas nem contratos com valores fixos suspeitos no período analisado.",
              acao: null,
            },
            800,
          );
      }

      if (tipo === "comparar") {
        if (!dep) {
          pushMessage(
            {
              sev: "info",
              titulo: "Abra um deputado primeiro",
              texto:
                "Selecione um deputado para comparar com a média da câmara.",
              acao: null,
            },
            0,
          );
          return;
        }
        const ls = dep.ultimoStatus;
        pushMessage(
          {
            sev: "info",
            titulo: `Comparativo — ${ls.siglaPartido}/${ls.siglaUf}`,
            texto: `Referências nacionais (2024):<br>
            📊 Cota parlamentar média: <strong>R$ 40.000/mês</strong><br>
            ✈️ Passagens aéreas (média): <strong>R$ 8.200/ano</strong><br>
            🍽️ Alimentação (média): <strong>R$ 3.100/ano</strong><br>
            🏢 Escritório (média): <strong>R$ 6.000/mês</strong><br>
            <span style="color:#71717a;font-size:10px">Fonte: Câmara dos Deputados · Transparência</span>`,
            acao: null,
          },
          0,
        );
      }

      // ── NEPOTISMO ──────────────────────────────────────────────────────────
      if (tipo === "nepotismo") {
        if (!dep) {
          pushMessage(
            {
              sev: "info",
              titulo: "Abra um deputado primeiro",
              texto:
                "Selecione um deputado para verificar indícios de nepotismo.",
              acao: null,
            },
            0,
          );
          return;
        }
        this.investigarNepotismo(dep);
      }

      // ── CRUZAMENTO DE DADOS ────────────────────────────────────────────────
      if (tipo === "cruzamento") {
        if (!dep) {
          pushMessage(
            {
              sev: "info",
              titulo: "Abra um deputado primeiro",
              texto: "Selecione um deputado para cruzamento de dados.",
              acao: null,
            },
            0,
          );
          return;
        }
        const cruzamentos = [
          despesas.length > 0 && votos.length > 0
            ? Engine.cruzamentoCEAPVotos(despesas, votos)
            : null,
          despesas.length > 0 ? Engine.ceapLimite(despesas) : null,
          despesas.length > 0 ? Engine.pagamentosFinsDeSemana(despesas) : null,
          despesas.length > 0 ? Engine.concentracaoFornecedor(despesas) : null,
        ].filter(Boolean);

        if (cruzamentos.length === 0) {
          pushMessage(
            {
              sev: "positivo",
              titulo: "Nenhum cruzamento suspeito detectado",
              texto:
                despesas.length === 0
                  ? "Carregue os dados de gastos e votações do deputado para executar o cruzamento completo."
                  : "Não encontrei combinações de fatores suspeitos nos dados disponíveis.",
              acao: null,
            },
            0,
          );
        } else {
          pushMessage(
            {
              sev: "info",
              titulo: `🔗 ${cruzamentos.length} cruzamento(s) detectado(s)`,
              texto: "Analisando combinações de sinais suspeitos...",
              acao: null,
            },
            0,
          );
          cruzamentos.forEach((c, i) => pushMessage(c, 800 + i * 1000));
        }
      }

      // ── EMENDAS ────────────────────────────────────────────────────────────
      if (tipo === "emendas") {
        if (!dep) {
          pushMessage(
            {
              sev: "info",
              titulo: "Abra um deputado primeiro",
              texto:
                "Selecione um deputado para analisar as emendas parlamentares.",
              acao: null,
            },
            0,
          );
          return;
        }
        this.investigarEmendas(dep);
      }

      // ── PATRIMÔNIO TSE ─────────────────────────────────────────────────────
      if (tipo === "patrimonio") {
        if (!dep) {
          pushMessage(
            {
              sev: "info",
              titulo: "Abra um deputado primeiro",
              texto:
                "Selecione um deputado para buscar o patrimônio declarado no TSE.",
              acao: null,
            },
            0,
          );
          return;
        }
        this.investigarPatrimonio(dep);
      }

      // ── MODO DETETIVE (cadeia completa) ────────────────────────────────────
      if (tipo === "detetive") {
        if (!dep) {
          pushMessage(
            {
              sev: "info",
              titulo: "Abra um deputado primeiro",
              texto:
                "O Modo Detetive faz uma investigação completa em cadeia: gastos → fornecedores → CEIS/CNEP → sócios → emendas → patrimônio TSE.",
              acao: null,
            },
            0,
          );
          return;
        }
        this.modoDetetive(dep, despesas, votos);
      }
    },

    // ── INVESTIGAÇÃO: FORNECEDOR PROFUNDO ─────────────────────────────────
    async investigarFornecedorProfundo(cnpj, nomeFornecedor) {
      if (!cnpj || cnpj.length < 11) return;
      if (!Bot.isOpen) this.toggle();

      pushMessage(
        {
          sev: "info",
          titulo: `🔍 Investigando ${nomeFornecedor}`,
          texto: `Iniciando dossiê completo: CNPJ, sócios, CEIS/CNEP, contratos federais e pagamentos do governo...`,
          acao: null,
        },
        0,
      );

      try {
        const data = await fetchApi("investigate_supplier", { cnpj });

        if (data.erro) {
          pushMessage(
            {
              sev: "atencao",
              titulo: "CNPJ não encontrado",
              texto: data.erro,
              acao: null,
            },
            800,
          );
          return;
        }

        // Empresa
        if (data.empresa) {
          const e = data.empresa;
          const situacaoColor = (e.situacao || "")
            .toUpperCase()
            .includes("ATIVA")
            ? "#34d399"
            : "#f87171";
          const capitalSocial = parseFloat(e.capital_social || 0);
          pushMessage(
            {
              sev: (e.situacao || "").toUpperCase().includes("ATIVA")
                ? "info"
                : "critico",
              titulo: `🏢 ${e.razao_social || nomeFornecedor}`,
              texto: `<span style="color:${situacaoColor}">● ${e.situacao || "Situação desconhecida"}</span><br>
              Fantasia: <strong>${e.nome_fantasia || "Não informado"}</strong><br>
              Abertura: ${e.abertura || "–"} · Porte: ${e.porte || "–"}<br>
              Município: <strong>${e.municipio || "–"}/${e.uf || ""}</strong><br>
              Atividade: ${e.atividade_principal || "–"}<br>
              Capital social: <strong>R$ ${capitalSocial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>`,
              acao: null,
              fonte: "BrasilAPI CNPJ",
            },
            800,
          );

          // Verifica ratio pagamentos federais vs capital social
          const totalPagamentos = despesas
            .filter(
              (d) =>
                (d.cnpjCpfFornecedor || "").replace(/\D/g, "") ===
                cnpj.replace(/\D/g, ""),
            )
            .reduce((a, c) => a + (parseFloat(c.valorLiquido) || 0), 0);
          if (capitalSocial > 0 && totalPagamentos > capitalSocial * 10) {
            pushMessage(
              {
                sev: "critico",
                titulo: `🚨 Pagamentos ${(totalPagamentos / capitalSocial).toFixed(0)}× o capital social`,
                texto: `Esta empresa recebeu <strong>R$ ${totalPagamentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> do deputado, mas seu capital social é de apenas <strong>R$ ${capitalSocial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>. Receber mais de 10× o capital social em contratos é sinal de empresa de fachada (ref. metodologia CGU).`,
                acao: null,
                fonte: "cruzamento despesas×capital social",
              },
              1400,
            );
          }

          // Verifica idade da empresa vs primeiro contrato
          if (e.abertura) {
            const partes = e.abertura.split("/");
            const dataAbertura =
              partes.length === 3
                ? new Date(`${partes[2]}-${partes[1]}-${partes[0]}`)
                : new Date(e.abertura);
            const primeiroContrato =
              data.contratos && data.contratos.length > 0
                ? data.contratos.reduce((min, c) => {
                    const d = new Date(
                      c.dataInicioVigencia || c.dataAssinatura || "9999-01-01",
                    );
                    return d < min ? d : min;
                  }, new Date("9999-01-01"))
                : null;
            if (primeiroContrato && !isNaN(dataAbertura)) {
              const diffMeses =
                (primeiroContrato - dataAbertura) / (30.5 * 24 * 3600 * 1000);
              if (diffMeses < 6 && diffMeses >= 0) {
                pushMessage(
                  {
                    sev: "atencao",
                    titulo: `⚠️ Empresa tinha ${diffMeses < 1 ? "menos de 1 mês" : Math.round(diffMeses) + " meses"} quando assinou o 1° contrato`,
                    texto: `Abertura em <strong>${e.abertura}</strong>, primeiro contrato fechado em <strong>${primeiroContrato.toLocaleDateString("pt-BR")}</strong>. Empresas recém-criadas que imediatamente recebem contratos públicos são padrão de fraude contratual.`,
                    acao: null,
                    fonte: "BrasilAPI CNPJ × contratos federais",
                  },
                  2000,
                );
              }
            }
          }
        }

        // Sócios
        if (data.socios && data.socios.length > 0) {
          const socios_html = data.socios
            .map((s) => {
              const alerta = (data.socios_alertas || []).find(
                (a) => a.nome === s.nome_socio,
              );
              const tag = alerta
                ? ` <span style="color:#f87171;font-size:10px">⚠️ ${alerta.alertas.join(", ")}</span>`
                : "";
              return `• ${s.nome_socio || "–"} (${s.qualificacao_socio || "Sócio"})${tag}`;
            })
            .join("<br>");
          const temAlerta = (data.socios_alertas || []).length > 0;
          pushMessage(
            {
              sev: temAlerta ? "critico" : "info",
              titulo: `👥 ${data.socios.length} sócio(s) identificado(s)${temAlerta ? " — ALERTAS!" : ""}`,
              texto: socios_html,
              acao: temAlerta ? "Ver Radar Anti-Corrupção" : null,
              aacao: temAlerta
                ? () => {
                    window.customSwitchTab && window.customSwitchTab("radar");
                  }
                : null,
            },
            1600,
          );
        }

        // CEIS/CNEP da empresa
        if ((data.ceis || []).length > 0 || (data.cnep || []).length > 0) {
          const totalSancoes =
            (data.ceis || []).length + (data.cnep || []).length;
          pushMessage(
            {
              sev: "critico",
              titulo: `🚨 ${totalSancoes} sanção(ões) encontrada(s)!`,
              texto: `Esta empresa está nas listas oficiais de sancionados:<br>
              🔴 CEIS: <strong>${(data.ceis || []).length} registro(s)</strong><br>
              🔴 CNEP: <strong>${(data.cnep || []).length} registro(s)</strong><br>
              Empresas sancionadas não podem contratar com o governo federal.`,
              acao: "Abrir Radar Anti-Corrupção",
              aacao: () => {
                window.customSwitchTab && window.customSwitchTab("radar");
              },
            },
            2400,
          );
        } else {
          pushMessage(
            {
              sev: "positivo",
              titulo: "Empresa não consta em CEIS/CNEP",
              texto:
                "Sem registros nas listas de sancionados do Portal da Transparência.",
              acao: null,
            },
            2400,
          );
        }

        // Contratos federais
        if (data.total_contratos > 0) {
          const valorStr = data.total_contratos.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          pushMessage(
            {
              sev: data.total_contratos > 1000000 ? "atencao" : "info",
              titulo: `📄 R$ ${valorStr} em contratos federais`,
              texto: `${(data.contratos || []).length} contrato(s) encontrado(s) com o governo federal.<br>
              ${(data.contratos || [])
                .slice(0, 3)
                .map(
                  (c) =>
                    `• ${c.objeto || c.descricao || "Contrato"} — R$ ${parseFloat(c.valorInicialCompra || c.valorContrato || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                )
                .join("<br>")}`,
              acao: null,
            },
            3200,
          );
        }

        // Cruzamento de pagamentos de outros órgãos
        try {
          const cross = await fetchApi("cross_payments", { cnpj });
          if ((cross.fontes || 0) > 1) {
            pushMessage(
              {
                sev: "atencao",
                titulo: `🔗 Empresa recebe de ${cross.fontes} órgão(s) do governo`,
                texto: `Total recebido do governo federal: <strong>R$ ${parseFloat(cross.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong><br>
                Recebe pagamentos de <strong>${cross.fontes} fontes distintas</strong> do governo. Quanto maior a dependência do governo, maior o risco de favorecimento.`,
                acao: null,
              },
              4200,
            );
          }
        } catch (e) {}
      } catch (err) {
        pushMessage(
          {
            sev: "atencao",
            titulo: "Erro ao buscar dossiê",
            texto:
              "Não foi possível completar a investigação do fornecedor. Tente novamente.",
            acao: null,
          },
          800,
        );
      }
    },

    // ── INVESTIGAÇÃO: EMENDAS PARLAMENTARES ──────────────────────────────
    async investigarEmendas(dep) {
      const ls = dep.ultimoStatus;
      const nome = ls.nomeEleitoral || dep.nomeCivil;

      pushMessage(
        {
          sev: "info",
          titulo: `📋 Buscando emendas de ${nome}...`,
          texto:
            "Consultando Portal da Transparência e API da Câmara para mapear emendas parlamentares e seus municípios destino.",
          acao: null,
        },
        0,
      );

      try {
        const data = await fetchApi("get_emendas", { nome, id: dep.id });

        if (data.erro) {
          pushMessage(
            {
              sev: "atencao",
              titulo: "Não foi possível buscar emendas",
              texto: data.erro,
              acao: null,
            },
            800,
          );
          return;
        }

        const total = data.total_emendas || 0;
        const valor = data.total_valor || 0;

        if (total === 0) {
          pushMessage(
            {
              sev: "info",
              titulo: "Nenhuma emenda encontrada",
              texto:
                "Não localizei emendas parlamentares registradas para este deputado no Portal da Transparência.",
              acao: null,
            },
            800,
          );
          return;
        }

        pushMessage(
          {
            sev: valor > 50000000 ? "atencao" : "info",
            titulo: `💰 ${total} emenda(s) — R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            texto: `Total de emendas parlamentares encontradas: <strong>${total}</strong><br>Valor total empenhado: <strong>R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>`,
            acao: null,
          },
          800,
        );

        // Total vs média nacional (R$33.7M/ano × anos de mandato)
        const anosAtivos = data.anos_ativos || 1;
        const MEDIA_ANUAL = 33700000;
        const mediaTotalEsperada = MEDIA_ANUAL * anosAtivos;
        if (valor > 0 && mediaTotalEsperada > 0) {
          const ratioEmenda = ((valor / mediaTotalEsperada - 1) * 100).toFixed(
            0,
          );
          const acimaDaMedia = valor > mediaTotalEsperada * 1.2;
          const abaixoDaMedia = valor < mediaTotalEsperada * 0.5;
          if (acimaDaMedia || abaixoDaMedia) {
            pushMessage(
              {
                sev: acimaDaMedia ? "atencao" : "info",
                titulo: acimaDaMedia
                  ? `📊 Emendas ${ratioEmenda}% acima da média nacional`
                  : `📊 Emendas abaixo da média esperada`,
                texto: `Valor total: <strong>R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong><br>
                Média nacional: <strong>R$ ${MEDIA_ANUAL.toLocaleString("pt-BR")}/ano</strong> (EC 105/2019 — impositivas)<br>
                ${
                  acimaDaMedia
                    ? `<span style="color:#fbbf24">▲ ${ratioEmenda}% acima da média esperada para ${anosAtivos} ano(s) de mandato</span>`
                    : `<span style="color:#60a5fa">▼ Abaixo da média — pode indicar subutilização do orçamento parlamentar</span>`
                }`,
                acao: null,
                fonte: "Portal Transparência / emendas",
              },
              1200,
            );
          }
        }

        // Municípios destino
        const munis = data.por_municipio || [];
        const ufDeputado = ls?.siglaUf || "";
        if (munis.length > 0) {
          const top5 = munis.slice(0, 5);
          const topTotal = top5.reduce((a, m) => a + m.total, 0);
          const pct = valor > 0 ? ((topTotal / valor) * 100).toFixed(0) : 0;
          const muniHtml = top5
            .map(
              (m) =>
                `• <strong>${m.municipio}/${m.uf}</strong> — R$ ${m.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${m.count} emenda${m.count > 1 ? "s" : ""})${ufDeputado && m.uf && m.uf !== ufDeputado ? ' <span style="color:#fbbf24">⚠️ fora do estado</span>' : ""}`,
            )
            .join("<br>");

          // Verifica municípios fora do estado de origem
          const foraEstado = munis.filter(
            (m) => ufDeputado && m.uf && m.uf !== ufDeputado,
          );
          const pctForaEstado =
            munis.length > 0
              ? ((foraEstado.length / munis.length) * 100).toFixed(0)
              : 0;

          pushMessage(
            {
              sev: parseFloat(pct) > 60 ? "atencao" : "info",
              titulo: `🗺️ Top 5 municípios destino (${pct}% do total)`,
              texto:
                muniHtml +
                (parseFloat(pctForaEstado) > 30
                  ? `<br><span style="color:#fbbf24;font-size:10px">⚠️ ${pctForaEstado}% dos municípios estão fora do ${ufDeputado} — reduz conexão com base eleitoral</span>`
                  : `<br><span style="color:#71717a;font-size:10px">Concentração alta pode indicar favorecimento eleitoral</span>`),
              acao: null,
              fonte: "Portal Transparência / emendas",
            },
            1800,
          );
        }

        // Valores repetidos (possível direcionamento)
        const emendas = data.emendas || [];
        if (emendas.length >= 4) {
          const valoresMap = {};
          emendas.forEach((e) => {
            const v = parseFloat(e.valor || e.valorEmpenho || 0).toFixed(2);
            if (parseFloat(v) > 1000) valoresMap[v] = (valoresMap[v] || 0) + 1;
          });
          const repetidos = Object.entries(valoresMap)
            .filter(([, cnt]) => cnt >= 3)
            .sort((a, b) => b[1] - a[1]);
          if (repetidos.length > 0) {
            const [valRep, cntRep] = repetidos[0];
            pushMessage(
              {
                sev: "atencao",
                titulo: `🔁 Valor R$ ${parseFloat(valRep).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} repetido ${cntRep}× nas emendas`,
                texto: `O mesmo valor exato aparece em <strong>${cntRep} emendas diferentes</strong>. Valores idênticos em emendas distintas podem indicar rateio planejado para contornar limites por beneficiário.`,
                acao: null,
                fonte: "Portal Transparência / emendas",
              },
              2500,
            );
          }
        }

        // Proposições de emenda
        if ((data.proposicoes || []).length > 0) {
          pushMessage(
            {
              sev: "info",
              titulo: `📝 ${data.proposicoes.length} emenda(s) ao orçamento (via Câmara)`,
              texto: data.proposicoes
                .slice(0, 4)
                .map(
                  (p) =>
                    `• ${p.siglaTipo} ${p.numero}/${p.ano} — ${p.ementa || "Sem ementa"}`,
                )
                .join("<br>"),
              acao: null,
            },
            3200,
          );
        }
      } catch (err) {
        pushMessage(
          {
            sev: "atencao",
            titulo: "Erro ao buscar emendas",
            texto: "Falha na consulta. Verifique sua conexão.",
            acao: null,
          },
          800,
        );
      }
    },

    // ── INVESTIGAÇÃO: PATRIMÔNIO TSE ──────────────────────────────────────
    async investigarPatrimonio(dep) {
      const ls = dep.ultimoStatus;
      const nome = ls.nomeEleitoral || dep.nomeCivil;

      pushMessage(
        {
          sev: "info",
          titulo: `💰 Buscando patrimônio declarado de ${nome}`,
          texto:
            "Consultando TSE — bens declarados nas eleições de 2022 e 2018 para comparação de evolução patrimonial.",
          acao: null,
        },
        0,
      );

      try {
        const data = await fetchApi("patrimonio_tse", { nome });
        const candidatos = data.candidatos || [];

        if (candidatos.length === 0) {
          pushMessage(
            {
              sev: "info",
              titulo: "Patrimônio não localizado no TSE",
              texto: `Não encontrei declaração de bens para "${nome}" nas eleições de 2022/2018.`,
              acao: null,
            },
            800,
          );
          return;
        }

        // Busca candidatos do mesmo nome ordenados por ano
        const por2022 = candidatos.filter(
          (c) => c.ano === "2022" && c.partido === ls.siglaPartido,
        );
        const por2018 = candidatos.filter(
          (c) => c.ano === "2018" && c.partido === ls.siglaPartido,
        );
        const ref2022 = por2022[0] || candidatos.find((c) => c.ano === "2022");
        const ref2018 = por2018[0] || candidatos.find((c) => c.ano === "2018");

        const pat2022 = parseFloat(ref2022?.patrimonio || 0);
        const pat2018 = parseFloat(ref2018?.patrimonio || 0);

        if (pat2022 > 0) {
          let textoComparativo = `Eleições 2022: <strong>R$ ${pat2022.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>`;
          let sev = "info";
          let crescimento = 0;
          if (pat2018 > 0) {
            crescimento = (((pat2022 - pat2018) / pat2018) * 100).toFixed(0);
            const crescStr =
              pat2022 > pat2018
                ? `<span style="color:#f87171">▲ ${crescimento}% de crescimento</span>`
                : `<span style="color:#34d399">▼ ${Math.abs(crescimento)}% de redução</span>`;
            textoComparativo += `<br>Eleições 2018: <strong>R$ ${pat2018.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong><br>${crescStr} no patrimônio declarado entre 2018 e 2022`;
            if (parseFloat(crescimento) > 300) sev = "critico";
            else if (parseFloat(crescimento) > 150) sev = "atencao";
          }
          textoComparativo += `<br><span style="color:#71717a;font-size:10px">Fonte: TSE — Divulgação de Candidaturas e Contas</span>`;
          pushMessage(
            {
              sev,
              titulo:
                sev === "critico"
                  ? `🚨 Patrimônio cresceu ${crescimento}% em 4 anos`
                  : "💼 Patrimônio TSE",
              texto: textoComparativo,
              acao: null,
              fonte: "TSE",
            },
            800,
          );

          // Incompatibilidade com salário: R$46.366/mês × 48 meses = R$2.225.568 de 2019 a 2022
          if (pat2018 > 0 && pat2022 > pat2018) {
            const SALARIO_MENSAL = 46366;
            const MESES_MANDATO = 48;
            const maxCompativel = pat2018 + SALARIO_MENSAL * MESES_MANDATO;
            if (pat2022 > maxCompativel) {
              const excedente = pat2022 - maxCompativel;
              pushMessage(
                {
                  sev: "critico",
                  titulo: "🚨 Crescimento patrimonial incompatível com salário",
                  texto: `Mesmo acumulando 100% do subsídio por 48 meses (<strong>R$ ${(SALARIO_MENSAL * MESES_MANDATO).toLocaleString("pt-BR")}</strong>), o patrimônio em 2022 supera o máximo esperado em <strong>R$ ${excedente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>. Indica renda não declarada ou omissão de bens no TSE.`,
                  acao: null,
                  fonte: "TSE × subsídio parlamentar",
                },
                1800,
              );
            }
          }
        } else {
          pushMessage(
            {
              sev: "info",
              titulo: "Candidatos TSE encontrados",
              texto: candidatos
                .slice(0, 3)
                .map(
                  (c) =>
                    `• ${c.nome} (${c.partido}/${c.uf}) ${c.ano} — ${c.situacao}`,
                )
                .join("<br>"),
              acao: null,
            },
            800,
          );
        }
      } catch (err) {
        pushMessage(
          {
            sev: "atencao",
            titulo: "Erro ao buscar TSE",
            texto: "Falha na consulta do TSE. Verifique sua conexão.",
            acao: null,
          },
          800,
        );
      }
    },

    // ── INVESTIGAÇÃO: NEPOTISMO ───────────────────────────────────────────
    async investigarNepotismo(dep) {
      const ls = dep.ultimoStatus;
      const nomeCivil = dep.nomeCivil || ls.nomeEleitoral;

      pushMessage(
        {
          sev: "info",
          titulo: `👨‍👩‍👧 Verificando nepotismo — ${ls.nomeEleitoral}`,
          texto:
            "Buscando servidores federais com o mesmo sobrenome admitidos próximo ao início do mandato...",
          acao: null,
        },
        0,
      );

      try {
        const partes = nomeCivil.trim().split(/\s+/);
        const PREPOSICOES = new Set([
          "DOS",
          "DAS",
          "DES",
          "DE",
          "DA",
          "DO",
          "E",
        ]);
        const sobrenomesRelevantes = partes
          .slice(1)
          .filter((s) => s.length >= 5 && !PREPOSICOES.has(s.toUpperCase()));

        if (sobrenomesRelevantes.length === 0) {
          pushMessage(
            {
              sev: "info",
              titulo: "Não foi possível extrair sobrenomes",
              texto: "Nome civil insuficiente para busca de nepotismo.",
              acao: null,
            },
            800,
          );
          return;
        }

        const sobrenome = sobrenomesRelevantes[0];
        const data = await fetchApi("busca_servidores", { nome: sobrenome });

        if (data.erro || !data.servidores || data.servidores.length === 0) {
          pushMessage(
            {
              sev: "positivo",
              titulo: `Nenhum servidor com sobrenome "${sobrenome}" encontrado`,
              texto:
                "Não foram encontrados servidores federais com este sobrenome.",
              acao: null,
              fonte: "SIAPE / Portal Transparência",
            },
            800,
          );
          return;
        }

        const dataInicioMandato = new Date(
          (ls.dataInicio || "2023-02-01") + "T00:00:00",
        );
        const janela = 365 * 24 * 3600 * 1000; // ±1 ano do início do mandato
        const suspeitos = data.servidores.filter((s) => {
          const dataStr = s.dataIngressoOrgao || s.dataIngressoCargo;
          if (!dataStr) return false;
          const dataIngresso = new Date(dataStr + "T00:00:00");
          return Math.abs(dataIngresso - dataInicioMandato) <= janela;
        });

        if (suspeitos.length > 0) {
          const listHtml = suspeitos
            .slice(0, 5)
            .map((s) => {
              const orgao = s.orgao || s.uorg || "Órgão não informado";
              const dt = s.dataIngressoOrgao || s.dataIngressoCargo || "–";
              return `• <strong>${s.nome}</strong> — ${orgao} (ingresso: ${dt})`;
            })
            .join("<br>");
          pushMessage(
            {
              sev: "critico",
              titulo: `🚨 ${suspeitos.length} servidor(es) homônimo(s) admitido(s) próximo ao mandato`,
              texto:
                listHtml +
                '<br><br><span style="color:#f87171;font-size:10px">A Súmula Vinculante 13 do STF proíbe nepotismo no serviço público. A coincidência temporal entre início do mandato e admissão de homônimos requer verificação de parentesco.</span>',
              acao: null,
              fonte: "SIAPE × início do mandato",
            },
            800,
          );
        } else {
          pushMessage(
            {
              sev: "info",
              titulo: `${data.servidores.length} servidor(es) com sobrenome "${sobrenome}" encontrado(s)`,
              texto: `Nenhum com ingresso próximo ao início do mandato (${dataInicioMandato.toLocaleDateString("pt-BR")}). Sem indício de nepotismo temporal nos dados disponíveis.`,
              acao: null,
              fonte: "SIAPE / Portal Transparência",
            },
            800,
          );
        }
      } catch (err) {
        pushMessage(
          {
            sev: "atencao",
            titulo: "Erro ao buscar servidores",
            texto:
              "Não foi possível consultar a base de servidores federais. Tente novamente.",
            acao: null,
          },
          800,
        );
      }
    },

    // ── MODO DETETIVE: INVESTIGAÇÃO EM CADEIA COMPLETA ────────────────────
    async modoDetetive(dep, despesas, votos) {
      const ls = dep.ultimoStatus;

      pushMessage(
        {
          sev: "info",
          titulo: `🕵️ MODO DETETIVE — ${ls.nomeEleitoral}`,
          texto: `Iniciando investigação completa em 8 etapas:<br>
          <span style="color:#a78bfa">① Análise de gastos + CEAP</span><br>
          <span style="color:#60a5fa">② Padrão de votações</span><br>
          <span style="color:#fca5a5">③ Dossiê dos principais fornecedores</span><br>
          <span style="color:#86efac">④ Emendas parlamentares</span><br>
          <span style="color:#fcd34d">⑤ Patrimônio TSE</span><br>
          <span style="color:#f87171">⑥ Cruzamento CEIS/CNEP</span><br>
          <span style="color:#d8b4fe">⑦ Nepotismo</span><br>
          <span style="color:#7dd3fc">⑧ Cruzamentos combinados</span>`,
          acao: null,
        },
        0,
      );

      // ① Gastos
      setTimeout(() => {
        if (despesas.length > 0) {
          const total = despesas.reduce(
            (a, c) => a + (parseFloat(c.valorLiquido) || 0),
            0,
          );
          const checks = [
            Engine.concentracaoFornecedor(despesas),
            Engine.pagamentosFixos(despesas),
            Engine.valoresLimite(despesas),
            Engine.ceapLimite(despesas),
            Engine.pagamentosFinsDeSemana(despesas),
            Engine.picoGastoMensal(despesas),
          ].filter(Boolean);
          checks.forEach((c, i) => pushMessage(c, i * 800));
          if (checks.length === 0)
            pushMessage(
              {
                sev: "positivo",
                titulo: "① Gastos sem alertas",
                texto: `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} no período. Nenhum padrão suspeito detectado.`,
                acao: null,
              },
              0,
            );
        } else {
          pushMessage(
            {
              sev: "info",
              titulo: "① Gastos não carregados",
              texto: "Abra a aba Gastos para análise financeira completa.",
              acao: null,
            },
            0,
          );
        }
      }, 1500);

      // ② Votos
      setTimeout(() => {
        if (votos.length > 0) {
          const partido = ls.siglaPartido;
          const checks = [
            Engine.alinhamentoVotos(votos, partido),
            Engine.votoContraCorrente(votos),
            Engine.alinhamentoPartido(votos, partido),
          ].filter(Boolean);
          checks.forEach((c, i) => pushMessage(c, i * 800));
        } else {
          pushMessage(
            {
              sev: "info",
              titulo: "② Votações não carregadas",
              texto: "Abra a aba Votações para análise de padrão de votos.",
              acao: null,
            },
            0,
          );
        }
      }, 4500);

      // ③ Fornecedor principal (CNPJ do maior gasto)
      setTimeout(() => {
        if (despesas.length > 0) {
          const por_cnpj = {};
          despesas.forEach((d) => {
            const k = d.cnpjCpfFornecedor || "";
            if (k.length === 14) {
              if (!por_cnpj[k])
                por_cnpj[k] = { total: 0, nome: d.nomeFornecedor };
              por_cnpj[k].total += parseFloat(d.valorLiquido) || 0;
            }
          });
          const sorted = Object.entries(por_cnpj).sort(
            (a, b) => b[1].total - a[1].total,
          );
          if (sorted.length > 0) {
            const [topCnpj, info] = sorted[0];
            this.investigarFornecedorProfundo(topCnpj, info.nome);
          }
        }
      }, 8000);

      // ④ Emendas
      setTimeout(() => this.investigarEmendas(dep), 14000);

      // ⑤ Patrimônio
      setTimeout(() => this.investigarPatrimonio(dep), 20000);

      // ⑥ Anticorrupção — busca real nas bases CEIS/CNEP/CEAF/PEP
      setTimeout(async () => {
        pushMessage({ sev: "info", titulo: `⑥ Verificando ${ls.nomeEleitoral} em CEIS/CNEP/CEAF/PEP`, texto: "Cruzando nome do parlamentar nas 5 bases oficiais de sancionados...", acao: null }, 0);
        try {
          const scanData = await fetchApi("scan_anticorrupcao", { nome: ls.nomeEleitoral });
          const totalSancoes = (scanData.cnep?.length || 0) + (scanData.ceis?.length || 0) + (scanData.ceaf?.length || 0) + (scanData.cepim?.length || 0);
          const pep = scanData.pep || [];
          if (totalSancoes > 0) {
            pushMessage({ sev: "critico", titulo: `🚨 ${totalSancoes} sanção(ões) encontrada(s) para ${ls.nomeEleitoral}!`,
              texto: `CEIS: <strong>${scanData.ceis?.length || 0}</strong> · CNEP: <strong>${scanData.cnep?.length || 0}</strong> · CEAF: <strong>${scanData.ceaf?.length || 0}</strong> · CEPIM: <strong>${scanData.cepim?.length || 0}</strong>`,
              acao: "Abrir Radar Anti-Corrupção", aacao: () => window.customSwitchTab && window.customSwitchTab("radar") }, 600);
          } else if (pep.length > 0) {
            pushMessage({ sev: "atencao", titulo: `⑥ Consta como PEP (Pessoa Exposta Politicamente)`, texto: `${ls.nomeEleitoral} está registrado na base PEP do Portal da Transparência. Isso é esperado para parlamentares em exercício.`, acao: null }, 600);
          } else {
            pushMessage({ sev: "positivo", titulo: `⑥ Sem sanções nas bases oficiais`, texto: `Nenhum registro encontrado para "${ls.nomeEleitoral}" nas bases CEIS, CNEP, CEAF, CEPIM. Consta em PEP por exercer mandato.`, acao: null }, 600);
          }
        } catch (e) {
          pushMessage({ sev: "atencao", titulo: "⑥ Erro na verificação anticorrupção", texto: "Não foi possível consultar as bases. Tente manualmente pelo Radar Anti-Corrupção.", acao: "Abrir Radar", aacao: () => window.customSwitchTab && window.customSwitchTab("radar") }, 600);
        }
      }, 25000);

      // ⑦ Nepotismo
      setTimeout(() => this.investigarNepotismo(dep), 28000);

      // ⑧ Cruzamentos combinados
      setTimeout(() => {
        const cruzamentos = [
          despesas.length > 0 && votos.length > 0
            ? Engine.cruzamentoCEAPVotos(despesas, votos)
            : null,
        ].filter(Boolean);
        if (cruzamentos.length > 0) {
          pushMessage(
            {
              sev: "info",
              titulo: "⑧ Cruzamentos combinados",
              texto: "Analisando sinais combinados...",
              acao: null,
            },
            0,
          );
          cruzamentos.forEach((c, i) => pushMessage(c, 600 + i * 800));
        } else {
          pushMessage(
            {
              sev: "positivo",
              titulo: "⑧ Nenhum cruzamento crítico detectado",
              texto:
                "Não encontrei combinações suspeitas entre os dados financeiros e de votações disponíveis.",
              acao: null,
            },
            0,
          );
        }
      }, 32000);
    },

    // ── RANKING TOP CORRUPÇÃO ──────────────────────────────────────────────
    async runCorruptionRanking() {
      if (typeof window.customSwitchTab === "function") {
        window.customSwitchTab("top_corrupcao");
      }
      await new Promise((r) => setTimeout(r, 200));

      const resultsDiv = document.getElementById("corruption-ranking-results");
      const statusDiv = document.getElementById("corruption-ranking-status");
      if (!resultsDiv || !statusDiv) {
        console.error("Elementos do ranking de corrupção não encontrados.");
        return;
      }

      resultsDiv.innerHTML = "";
      statusDiv.innerHTML =
        '<div class="text-center py-12"><div class="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-red-400 font-bold animate-pulse">Analisando uma amostra de 15 deputados...</p><p class="text-zinc-500 text-xs mt-2">Isso pode levar um minuto. Estamos cruzando milhares de despesas.</p></div>';

      try {
        const deputiesRes = await fetchApi("proxy_camara", {
          endpoint: "deputados?ordem=ASC&ordenarPor=nome&itens=513",
        });
        if (!deputiesRes?.dados?.length) {
          statusDiv.innerHTML = '<p class="text-red-400 font-bold">Erro ao carregar lista de deputados. Tente novamente.</p>';
          return;
        }
        const sampleDeputies = deputiesRes.dados
          .sort(() => 0.5 - Math.random())
          .slice(0, 15);

        let ranking = [];

        for (let i = 0; i < sampleDeputies.length; i++) {
          const dep = sampleDeputies[i];
          statusDiv.innerHTML = `<p class="text-red-400 font-bold animate-pulse">Analisando ${i + 1}/${sampleDeputies.length}: ${dep.nome}</p>`;

          let score = 0;
          let flags = [];

          try {
            const expensesRes = await fetchApi("proxy_camara", {
              endpoint: `deputados/${dep.id}/despesas?ano=${new Date().getFullYear()}&itens=500`,
            });
            const despesas = expensesRes?.dados || [];

            if (despesas.length > 5) {
              const checks = [
                Engine.concentracaoFornecedor(despesas),
                Engine.pagamentosFixos(despesas),
                Engine.valoresLimite(despesas),
                Engine.ceapLimite(despesas),
                Engine.pagamentosFinsDeSemana(despesas),
              ].filter(Boolean);

              checks.forEach((result) => {
                flags.push(result);
                if (result.sev === "critico") score += 10;
                if (result.sev === "atencao") score += 3;
              });
            }
          } catch (e) {
            console.warn(`Failed to analyze ${dep.nome}`, e);
          }

          if (score > 0) {
            ranking.push({ deputy: dep, score, flags });
          }
        }

        ranking.sort((a, b) => b.score - a.score);

        statusDiv.innerHTML = `<p class="text-emerald-400 font-bold">Análise concluída! ${ranking.length} deputados com alertas encontrados na amostra.</p>`;

        if (ranking.length === 0) {
          resultsDiv.innerHTML =
            '<div class="p-6 bg-green-900/10 border border-green-900/30 rounded-xl text-center text-green-400">✅ Nenhuma anomalia crítica detectada na amostra de hoje.</div>';
          return;
        }

        resultsDiv.innerHTML = ranking
          .map((item, index) => {
            const dep = item.deputy;
            const scoreColor =
              item.score >= 20 ? "red" : item.score >= 10 ? "orange" : "yellow";
            return `
                    <div class="bg-zinc-900 border border-${scoreColor}-800/50 rounded-xl p-4 flex gap-4 items-start">
                        <div class="text-center"><div class="text-2xl font-black text-${scoreColor}-400">#${index + 1}</div><div class="text-xs text-zinc-500">${item.score} pts</div></div>
                        <img src="${dep.urlFoto}" class="w-16 h-16 rounded-full object-cover border-2 border-${scoreColor}-600">
                        <div class="flex-1"><h4 class="font-bold text-white">${dep.nome} <span class="text-xs text-zinc-500">(${dep.siglaPartido}/${dep.siglaUf})</span></h4><div class="mt-2 space-y-1">${item.flags.map((f) => `<div class="text-xs text-zinc-300 flex items-start gap-1.5"><span class="mt-0.5">${f.sev === "critico" ? "🔴" : "⚠️"}</span><span>${f.titulo}</span></div>`).join("")}</div><button onclick="openDeputyDetails(${dep.id})" class="mt-3 text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded font-bold transition">Ver Perfil Completo</button></div>
                    </div>`;
          })
          .join("");
      } catch (e) {
        statusDiv.innerHTML = "";
        resultsDiv.innerHTML = `<div class="text-center text-red-500 py-10">Erro ao gerar ranking: ${e.message}</div>`;
      }
    },

    onPatrimonioLoad: function (d22, d18, variacao, pct) {
      if (!variacao) return;
      if (!Bot.isOpen) return;
      const varAbs = Math.abs(variacao);
      if (varAbs < 100000) return; // Variação insignificante
      const cresceu = variacao > 0;
      pushMessage(
        {
          sev:
            varAbs > 1000000 ? "critico" : varAbs > 300000 ? "atencao" : "info",
          titulo: cresceu
            ? `💰 Patrimônio cresceu ${pct ? pct + "%" : ""} no mandato`
            : `📉 Patrimônio reduziu no mandato`,
          texto: cresceu
            ? `De <strong>${window.formatCurrency ? window.formatCurrency(d18.total) : "R$ " + d18.total}</strong> em 2018 para <strong>${window.formatCurrency ? window.formatCurrency(d22.total) : "R$ " + d22.total}</strong> em 2022. Variação de <strong>${window.formatCurrency ? window.formatCurrency(varAbs) : "R$" + varAbs}</strong> durante o mandato.`
            : `Patrimônio declarado menor em 2022 do que em 2018. Pode indicar alienação de bens ou declaração incompleta.`,
          acao: null,
        },
        0,
      );
    },

    // Handler para botões de ação do engine de investigação
    _runEngine(idx) {
      const fn = _engineHandlers[idx];
      if (typeof fn === "function") fn();
    },

    onFinanciamentoLoad: function (data, conflitos) {
      if (!Bot.isOpen) return;
      if (data.total_receitas > 0) {
        pushMessage(
          {
            sev: "info",
            titulo: `🏦 Campanha 2022: ${window.formatCurrency ? window.formatCurrency(data.total_receitas) : "R$" + data.total_receitas} arrecadados`,
            texto: `Total arrecadado: <strong>${window.formatCurrency ? window.formatCurrency(data.total_receitas) : data.total_receitas}</strong><br>Total gasto: <strong>${window.formatCurrency ? window.formatCurrency(data.total_despesas) : data.total_despesas}</strong><br>Maior doador: <strong>${data.top_doadores?.[0]?.nome || "—"}</strong> (${window.formatCurrency ? window.formatCurrency(data.top_doadores?.[0]?.total || 0) : ""})`,
            acao: null,
          },
          0,
        );
      }
      if (conflitos && conflitos.length > 0) {
        pushMessage(
          {
            sev: "critico",
            titulo: `🚨 ${conflitos.length} empresa(s) doaram para a campanha E receberam gastos do deputado`,
            texto:
              conflitos
                .map(
                  (c) =>
                    `• <strong>${c.nome}</strong> — doou <strong>${window.formatCurrency ? window.formatCurrency(c.total_doado) : c.total_doado}</strong> e depois recebeu pagamentos públicos`,
                )
                .join("<br>") +
              '<br><span style="color:#f87171;font-size:10px">Padrão clássico de retorno de favor político</span>',
            acao: "Ver Financiamento",
            aacao: () => {
              if (
                typeof switchDeputyTab !== "undefined" &&
                window._currentDeputy
              )
                switchDeputyTab("financiamento", window._currentDeputy.id);
            },
          },
          500,
        );
      }
    },
  };

  // ── Hooks nos eventos existentes ─────────────────────────────────────────
  // Intercepta openDeputyDetails para capturar abertura de deputado
  function hookDeputyOpen() {
    const original = window.openDeputyDetails;
    if (!original || original._hooked) return;
    window.openDeputyDetails = async function (_id) {
      // Limpa estado anterior
      Bot.context = { type: "deputy", data: null };
      // Chama original
      const result = await original.apply(this, arguments);
      // Tenta capturar currentDeputy após carregamento
      // Usa polling curto para garantir que os dados chegaram
      let _hookTries = 0;
      const _hookTimer = setInterval(() => {
        _hookTries++;
        const dep = window._currentDeputy || (typeof currentDeputy !== "undefined" ? currentDeputy : null);
        if (dep && dep.id) {
          clearInterval(_hookTimer);
          HyperBot.onDeputyOpen(dep);
        } else if (_hookTries >= 10) {
          clearInterval(_hookTimer); // desiste após 3s
        }
      }, 300);
      return result;
    };
    window.openDeputyDetails._hooked = true;
  }

  // Intercepta loadDeputyExpenses para capturar dados de despesas
  function hookExpenses() {
    const original = window.loadDeputyExpenses;
    if (!original || original._hooked) return;
    window.loadDeputyExpenses = async function () {
      const result = await original.apply(this, arguments);
      setTimeout(() => {
        if (
          typeof currentExpensesData !== "undefined" &&
          currentExpensesData?.length > 0
        ) {
          HyperBot.onExpensesLoad(currentExpensesData);
        }
      }, 600);
      return result;
    };
    window.loadDeputyExpenses._hooked = true;
  }

  // Intercepta loadDeputyVotes para capturar dados de votações
  function hookVotes() {
    const original = window.loadDeputyVotes;
    if (!original || original._hooked) return;
    window.loadDeputyVotes = async function () {
      const result = await original.apply(this, arguments);
      setTimeout(() => {
        if (Bot.context?.data) {
          const partido = Bot.context?.data?.ultimoStatus?.siglaPartido || "";
          // Usa dados globais se existirem
          if (typeof window._lastVotesData !== "undefined") {
            HyperBot.onVotesLoad(window._lastVotesData, partido);
          }
        }
      }, 1200);
      return result;
    };
    window.loadDeputyVotes._hooked = true;
  }

  // Intercepta searchViagens para capturar viagens listadas
  function hookViagens() {
    const original = window.searchViagens;
    if (!original || original._hooked) return;
    window.searchViagens = async function () {
      const result = await original.apply(this, arguments);
      setTimeout(() => {
        if (
          typeof currentViagensData !== "undefined" &&
          currentViagensData?.length > 0
        ) {
          HyperBot.onViagensLoad(currentViagensData);
        }
      }, 600);
      return result;
    };
    window.searchViagens._hooked = true;
  }

  // ── Scroll horizontal nos chips (desktop: wheel + drag-to-scroll) ──────────
  function initChipsScroll() {
    const el = document.getElementById("hyperbot-suggestions");
    if (!el) return;

    // Mouse wheel → scroll horizontal
    el.addEventListener(
      "wheel",
      function (e) {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.8;
      },
      { passive: false },
    );

    // Drag-to-scroll (click + arrastar)
    let isDragging = false,
      startX = 0,
      scrollStart = 0;

    el.addEventListener("mousedown", function (e) {
      // Não iniciar drag se o clique foi num botão
      if (e.target.closest("button")) return;
      isDragging = true;
      startX = e.pageX;
      scrollStart = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      el.scrollLeft = scrollStart - (e.pageX - startX);
    });

    document.addEventListener("mouseup", function () {
      if (!isDragging) return;
      isDragging = false;
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
    });

    // Cursor grab padrão para indicar arrasto
    el.style.cursor = "grab";
  }

  // ── Inicialização ─────────────────────────────────────────────────────────
  function init() {
    createWidget();
    initChipsScroll();
    // Aplica hooks quando as funções estiverem disponíveis
    const waitForFunctions = setInterval(() => {
      if (
        typeof openDeputyDetails !== "undefined" &&
        typeof loadDeputyExpenses !== "undefined"
      ) {
        hookDeputyOpen();
        hookExpenses();
        hookVotes();
        if (typeof searchViagens !== "undefined") hookViagens();
        clearInterval(waitForFunctions);
      }
    }, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
