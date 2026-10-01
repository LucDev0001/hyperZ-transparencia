/**
 * hyperbot_chat.js — Interface de chat do HyperZ Agente
 *
 * Responsabilidades:
 *  • Injeta a UI de chat (input, botão voz, footer) no painel do HyperBot
 *  • Delega TODA a lógica de processamento para HyperBotAgent (hyperbot_brain.js)
 *  • Expõe pushBotMsg / pushUserBubble para todos os módulos do sistema
 *  • Gerencia animações, foco e acessibilidade do chat
 *
 * Depende de: hyperbot.js, hyperbot_brain.js, hyperbot_osint.js, api.js
 */
(function () {
  "use strict";

  // ════════════════════════════════════════════════════════════════════════
  //  MAPA DE ESTILOS POR SEVERIDADE
  // ════════════════════════════════════════════════════════════════════════
  const SEV = {
    info:     { color: "#60a5fa", bg: "#0c1829", border: "#1e3a5f", icon: "ℹ️",  label: "Info"    },
    atencao:  { color: "#fbbf24", bg: "#1c1200", border: "#92400e", icon: "⚠️",  label: "Atenção" },
    critico:  { color: "#f87171", bg: "#1c0505", border: "#7f1d1d", icon: "🚨",  label: "Crítico" },
    positivo: { color: "#34d399", bg: "#021d0e", border: "#14532d", icon: "✅",  label: "Ok"      },
  };

  // Registry de handlers para botões de ação dentro das mensagens
  const _actionHandlers = [];

  // ════════════════════════════════════════════════════════════════════════
  //  MENSAGEM DO BOT — renderiza no feed com animação de digitação
  // ════════════════════════════════════════════════════════════════════════
  function pushBotMsg(sev, titulo, texto, opts = {}) {
    const feed = document.getElementById("hyperbot-feed");
    if (!feed) return;

    const empty = document.getElementById("hyperbot-empty");
    if (empty) empty.remove();

    const s = SEV[sev] || SEV.info;

    // ── Typing indicator ──
    const typing = document.createElement("div");
    typing.className = "hz-typing";
    typing.style.cssText = "padding:4px 0 8px;max-width:760px;margin:0 auto;";
    typing.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                    display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🤖</div>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:16px 16px 16px 4px;padding:10px 14px;">
          <div style="display:flex;gap:5px;align-items:center;height:18px;">
            <span style="width:7px;height:7px;border-radius:50%;background:#7c3aed;animation:hyperbotBounce 1s ease infinite;display:inline-block;"></span>
            <span style="width:7px;height:7px;border-radius:50%;background:#7c3aed;animation:hyperbotBounce 1s ease .2s infinite;display:inline-block;"></span>
            <span style="width:7px;height:7px;border-radius:50%;background:#7c3aed;animation:hyperbotBounce 1s ease .4s infinite;display:inline-block;"></span>
          </div>
        </div>
      </div>`;
    feed.appendChild(typing);
    feed.scrollTop = feed.scrollHeight;

    const delay = opts.delay ?? 500;
    setTimeout(() => {
      typing.remove();

      // Registrar handler de ação (evita serializar função em onclick)
      let acaoHtml = "";
      if (opts.acao) {
        const aidx = _actionHandlers.length;
        _actionHandlers.push(opts.aacao || null);
        acaoHtml = `<button
          onclick="window.HyperBotChat._runAction(${aidx})"
          style="margin-top:8px;font-size:12px;font-weight:700;padding:6px 14px;
                 border-radius:8px;border:1px solid ${s.border};background:${s.bg};
                 color:${s.color};cursor:pointer;transition:opacity .15s;"
          onmouseover="this.style.opacity='.75'"
          onmouseout="this.style.opacity='1'">${opts.acao} →</button>`;
      }

      const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      // Wrapper centralizado igual ao empty-state (max-width:760px)
      const wrapper = document.createElement("div");
      wrapper.className = "hyperbot-msg";
      wrapper.style.cssText = "padding:4px 0 8px;max-width:760px;margin:0 auto;animation:hyperbotSlide .25s ease;";
      wrapper.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                      display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🤖</div>
          <div style="flex:1;min-width:0;">
            <div style="background:${s.bg};border:1px solid ${s.border};
                        border-radius:16px 16px 16px 4px;padding:14px 16px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="font-size:11px;font-weight:800;color:${s.color};
                             text-transform:uppercase;letter-spacing:.06em;">${s.icon} ${s.label}</span>
              </div>
              <div style="font-weight:700;color:#f4f4f5;font-size:14px;line-height:1.4;margin-bottom:6px;">${titulo}</div>
              <div style="color:#a1a1aa;font-size:13px;line-height:1.7;">${texto}</div>
              ${acaoHtml}
            </div>
            <div style="font-size:11px;color:#3f3f46;margin-top:4px;padding-left:2px;">${hora}</div>
          </div>
        </div>`;

      feed.appendChild(wrapper);
      feed.scrollTop = feed.scrollHeight;
    }, delay);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  BOLHA DO USUÁRIO — lado direito, roxo
  // ════════════════════════════════════════════════════════════════════════
  function pushUserBubble(text) {
    const feed = document.getElementById("hyperbot-feed");
    if (!feed) return;
    const empty = document.getElementById("hyperbot-empty");
    if (empty) empty.remove();

    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const wrapper = document.createElement("div");
    wrapper.className = "hyperbot-msg";
    wrapper.style.cssText = "padding:4px 0 8px;max-width:760px;margin:0 auto;animation:hyperbotSlide .2s ease;";
    wrapper.innerHTML = `
      <div style="display:flex;justify-content:flex-end;">
        <div style="max-width:75%;">
          <div style="background:#2e1065;border:1px solid #4c1d95;border-radius:16px 16px 4px 16px;
                      padding:12px 16px;font-size:14px;color:#ede9fe;
                      word-break:break-word;line-height:1.55;">
            ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </div>
          <div style="font-size:11px;color:#3f3f46;margin-top:4px;text-align:right;">${hora}</div>
        </div>
      </div>`;

    feed.appendChild(wrapper);
    feed.scrollTop = feed.scrollHeight;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PROCESSAR INPUT — delega para o Agente ou fallback direto
  // ════════════════════════════════════════════════════════════════════════
  function handleInput(raw) {
    if (!raw?.trim()) return;

    const input = document.getElementById("hyperbot-chat-input");
    if (input) input.value = "";

    // Garante que o painel está aberto
    const panel = document.getElementById("hyperbot-panel");
    if (panel?.classList.contains("hidden-panel")) window.HyperBot?.toggle?.();

    pushUserBubble(raw);

    // Fechar sidebar mobile ao enviar mensagem
    window.HyperBot?.closeSidebar?.();

    // Usa o Agente se disponível; caso contrário, fallback CNPJ/CPF direto
    if (window.HyperBotAgent?.processarMensagem) {
      window.HyperBotAgent.processarMensagem(raw);
      return;
    }

    // Fallback básico (hyperbot_brain.js ainda não carregou)
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 14) { window.HyperBotOsint?.scanCNPJ(digits, raw); return; }
    if (digits.length === 11) { window.HyperBotOsint?.scanCPF(digits, raw);  return; }
    pushBotMsg("info", "Aguardando...", "Módulo de IA carregando, tente novamente em instantes.");
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INJETAR INTERFACE NO PAINEL DO HYPERBOT
  // ════════════════════════════════════════════════════════════════════════
  function injectChatUI() {
    // Usa o placeholder criado pelo novo layout full-screen em hyperbot.js
    const footer = document.getElementById("hyperbot-chat-footer");
    if (!footer) return;

    // Já foi inicializado (evita dupla injeção)
    if (footer.dataset.initialized) return;
    footer.dataset.initialized = "1";

    const temVoz = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    footer.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <input id="hyperbot-chat-input"
               type="text"
               placeholder="Pergunte qualquer coisa sobre política..."
               autocomplete="off"
               style="flex:1;background:#111115;border:1px solid #2a2a34;border-radius:12px;
                      color:#e4e4e7;padding:10px 14px;font-size:13px;outline:none;
                      transition:border-color .15s,box-shadow .15s;" />
        ${temVoz ? `
        <button id="hz-mic-btn"
                title="Falar (entrada por voz)"
                style="width:38px;height:38px;border-radius:50%;background:#3f3f46;
                       border:none;color:#fff;cursor:pointer;font-size:16px;
                       display:flex;align-items:center;justify-content:center;flex-shrink:0;
                       transition:background .15s;">🎤</button>` : ""}
        <button id="hyperbot-chat-send"
                title="Enviar"
                style="width:38px;height:38px;border-radius:50%;background:#7c3aed;
                       border:none;color:#fff;cursor:pointer;font-size:18px;font-weight:700;
                       display:flex;align-items:center;justify-content:center;flex-shrink:0;
                       transition:background .15s;">↑</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;padding:0 2px;">
        <div style="font-size:9px;color:#3f3f46;">Câmara · CGU · Senado · TSE · DataJud · Web</div>
        <div id="hyperbot-status-dot"
             style="width:6px;height:6px;border-radius:50%;background:#34d399;
                    box-shadow:0 0 4px #34d399;"
             title="Agente ativo"></div>
      </div>`;

    const input   = document.getElementById("hyperbot-chat-input");
    const sendBtn = document.getElementById("hyperbot-chat-send");
    const micBtn  = document.getElementById("hz-mic-btn");

    // Estilos de foco
    input.addEventListener("focus", () => {
      input.style.borderColor  = "#7c3aed";
      input.style.boxShadow    = "0 0 0 2px #7c3aed33";
    });
    input.addEventListener("blur", () => {
      input.style.borderColor  = "#2a2a34";
      input.style.boxShadow    = "none";
    });

    // Enviar com Enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleInput(input.value.trim());
      }
    });

    // Botão enviar
    sendBtn.addEventListener("click",     () => handleInput(input.value.trim()));
    sendBtn.addEventListener("mouseover", () => { sendBtn.style.background = "#6d28d9"; });
    sendBtn.addEventListener("mouseout",  () => { sendBtn.style.background = "#7c3aed"; });

    // Botão voz
    if (micBtn) {
      micBtn.addEventListener("click", () => window.HyperBotAgent?.iniciarVoz?.());
      micBtn.addEventListener("mouseover", () => { micBtn.style.background = "#52525b"; });
      micBtn.addEventListener("mouseout",  () => { if (!micBtn._ativo) micBtn.style.background = "#3f3f46"; });
    }

    // Saudação inicial do Agente (após tudo carregar)
    setTimeout(() => {
      if (window.HyperBotAgent?.saudar) {
        window.HyperBotAgent.saudar();
      }
    }, 800);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  EXPORTAR API PÚBLICA — usada por todos os módulos do sistema
  // ════════════════════════════════════════════════════════════════════════
  window.HyperBotChat = {
    pushBotMsg,
    pushUserBubble,
    handleInput,
    _runAction(idx) {
      const fn = _actionHandlers[idx];
      if (typeof fn === "function") fn();
    },
  };

  // ════════════════════════════════════════════════════════════════════════
  //  INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════
  document.addEventListener("DOMContentLoaded", () => {
    // Aguarda hyperbot.js criar o painel (síncrono no DOMContentLoaded)
    setTimeout(injectChatUI, 200);
  });
})();
