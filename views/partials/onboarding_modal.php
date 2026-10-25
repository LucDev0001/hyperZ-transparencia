<!-- ══════════════════════════════════════════════════════════════════════
     Modal de Boas-Vindas / Novidades do Portal 2.0
     Aparece apenas uma única vez para o usuário via localStorage ('hz_portal_v2_seen')
══════════════════════════════════════════════════════════════════════ -->
<div id="hz-onboarding-modal"
     role="dialog" aria-modal="true" aria-labelledby="hz-v2-modal-title"
     style="display:none;position:fixed;inset:0;z-index:99999 !important;
            background:rgba(4,4,8,0.85);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
            align-items:center;justify-content:center;padding:16px;">

  <div id="hz-v2-modal-card"
       class="hz-v2-card-scroll"
       style="background:#0c0c12;border:1px solid rgba(139,92,246,0.35);
              border-radius:24px;max-width:640px;width:100%;
              max-height:min(92vh, 760px);overflow-y:auto;
              box-shadow:0 0 60px rgba(124,58,237,0.22), 0 30px 80px rgba(0,0,0,0.85);
              position:relative;
              animation:hzV2ModalEnter 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;">

    <!-- Background Glow Decoration -->
    <div style="position:absolute;top:-80px;right:-80px;width:240px;height:240px;
                background:radial-gradient(circle,rgba(139,92,246,0.25) 0%,rgba(0,0,0,0) 70%);
                pointer-events:none;z-index:0;"></div>
    <div style="position:absolute;bottom:-60px;left:-60px;width:200px;height:200px;
                background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,rgba(0,0,0,0) 70%);
                pointer-events:none;z-index:0;"></div>

    <!-- Header Section -->
    <div style="position:relative;z-index:1;padding:26px 28px 20px;
                background:linear-gradient(180deg, rgba(124,58,237,0.18) 0%, rgba(12,12,18,0.95) 100%);
                border-bottom:1px solid rgba(255,255,255,0.07);">
      
      <!-- Top row: Badge + Close button -->
      <div style="display:flex;align-items:center;justify-content:between;margin-bottom:14px;gap:8px;">
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;
                    border-radius:999px;background:rgba(124,58,237,0.22);
                    border:1px solid rgba(139,92,246,0.45);">
          <span style="width:6px;height:6px;border-radius:50%;background:#a78bfa;
                       box-shadow:0 0 8px #a78bfa;display:inline-block;animation:hzV2Pulse 2s infinite;"></span>
          <span style="font-size:11px;font-weight:800;letter-spacing:0.06em;color:#c4b5fd;text-transform:uppercase;font-family:monospace;">
            ATUALIZAÇÃO 2.0 DISPONÍVEL
          </span>
        </div>

        <button onclick="HzOnboarding.fechar()"
                style="margin-left:auto;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
                       color:#a1a1aa;width:32px;height:32px;border-radius:10px;cursor:pointer;
                       display:flex;align-items:center;justify-content:center;transition:all .15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.15)';this.style.color='#fff';"
                onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='#a1a1aa';"
                title="Fechar (Esc)">
          <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Title & Subtitle -->
      <h2 id="hz-v2-modal-title"
          style="font-size:22px;font-weight:900;color:#ffffff;margin:0 0 6px;letter-spacing:-0.02em;line-height:1.25;">
        Conheça o novo <span style="background:linear-gradient(135deg,#a78bfa 0%,#60a5fa 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Portal Transparência 2.0</span>
      </h2>
      <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.5;max-width:520px;">
        Reconstruímos o ecossistema com motores de inteligência cívica, tempo real e arquitetura moderna para auditar o poder público com máxima velocidade.
      </p>
    </div>

    <!-- Novidades Grid (2x2) -->
    <div style="position:relative;z-index:1;display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;padding:22px 26px 18px;">

      <!-- Card 1: Eleições 2026 -->
      <div onclick="HzOnboarding.ir('apuracao')"
           style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);
                  border-radius:16px;padding:16px;cursor:pointer;transition:all .2s;
                  position:relative;display:flex;flex-direction:column;gap:8px;"
           onmouseover="this.style.background='rgba(239,68,68,0.08)';this.style.borderColor='rgba(239,68,68,0.35)';this.style.transform='translateY(-2px)';"
           onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.transform='translateY(0)';">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">
            🗳️
          </div>
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(239,68,68,0.18);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);font-family:monospace;">
            2º TURNO
          </span>
        </div>
        <div>
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:3px;display:flex;align-items:center;gap:4px;">
            Eleições 2026 & Apuração
            <span style="font-size:12px;color:#f87171;">→</span>
          </div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.45;">
            Contagem regressiva ao vivo, mapa interativo por estado e projeções da apuração oficial do TSE.
          </div>
        </div>
      </div>

      <!-- Card 2: Auditoria de Partidos -->
      <div onclick="HzOnboarding.ir('partidos')"
           style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);
                  border-radius:16px;padding:16px;cursor:pointer;transition:all .2s;
                  position:relative;display:flex;flex-direction:column;gap:8px;"
           onmouseover="this.style.background='rgba(139,92,246,0.1)';this.style.borderColor='rgba(139,92,246,0.4)';this.style.transform='translateY(-2px)';"
           onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.transform='translateY(0)';">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">
            🏛️
          </div>
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(139,92,246,0.18);color:#d8b4fe;border:1px solid rgba(139,92,246,0.3);font-family:monospace;">
            NOVO MOTOR
          </span>
        </div>
        <div>
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:3px;display:flex;align-items:center;gap:4px;">
            Auditoria de Partidos
            <span style="font-size:12px;color:#a78bfa;">→</span>
          </div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.45;">
            Compare gastos de cotas partidárias, descubra os maiores fornecedores e audite deputados com 1 clique.
          </div>
        </div>
      </div>

      <!-- Card 3: Busca Inteligente (Command Palette) -->
      <div onclick="HzOnboarding.ir('cmd')"
           style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);
                  border-radius:16px;padding:16px;cursor:pointer;transition:all .2s;
                  position:relative;display:flex;flex-direction:column;gap:8px;"
           onmouseover="this.style.background='rgba(59,130,246,0.09)';this.style.borderColor='rgba(59,130,246,0.38)';this.style.transform='translateY(-2px)';"
           onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.transform='translateY(0)';">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">
            ⚡
          </div>
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(59,130,246,0.18);color:#93c5fd;border:1px solid rgba(59,130,246,0.3);font-family:monospace;">
            CTRL + K
          </span>
        </div>
        <div>
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:3px;display:flex;align-items:center;gap:4px;">
            Busca Universal Rápida
            <span style="font-size:12px;color:#60a5fa;">→</span>
          </div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.45;">
            Command Palette remodelada com pesquisa instantânea por parlamentares, ferramentas e órgãos públicos.
          </div>
        </div>
      </div>

      <!-- Card 4: Radar Anti-Corrupção & IA -->
      <div onclick="HzOnboarding.ir('radar')"
           style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);
                  border-radius:16px;padding:16px;cursor:pointer;transition:all .2s;
                  position:relative;display:flex;flex-direction:column;gap:8px;"
           onmouseover="this.style.background='rgba(16,185,129,0.09)';this.style.borderColor='rgba(16,185,129,0.38)';this.style.transform='translateY(-2px)';"
           onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.transform='translateY(0)';">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">
            🛡️
          </div>
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(16,185,129,0.18);color:#86efac;border:1px solid rgba(16,185,129,0.3);font-family:monospace;">
            IA AUDITORIA
          </span>
        </div>
        <div>
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:3px;display:flex;align-items:center;gap:4px;">
            Radar Anti-Corrupção
            <span style="font-size:12px;color:#34d399;">→</span>
          </div>
          <div style="font-size:12px;color:#94a3b8;line-height:1.45;">
            Cruzamento de CNPJs, empresas punidas (CEIS/CNEP), histórico societário e alerta de licitações suspeitas.
          </div>
        </div>
      </div>

    </div>

    <!-- Footer Actions -->
    <div style="position:relative;z-index:1;padding:18px 26px 24px;border-top:1px solid rgba(255,255,255,0.06);
                display:flex;flex-direction:column;gap:12px;">
      
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
        <div style="font-size:11px;color:#71717a;display:flex;align-items:center;gap:6px;">
          <svg style="width:14px;height:14px;color:#a1a1aa;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Exibido apenas uma vez. Acesse quando quiser pelo menu Guia.</span>
        </div>

        <div style="display:flex;align-items:center;gap:10px;margin-left:auto;">
          <a href="guide.php"
             style="font-size:12px;color:#a1a1aa;text-decoration:none;padding:8px 14px;border-radius:10px;
                    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
                    transition:all .15s;font-weight:600;"
             onmouseover="this.style.color='#fff';this.style.background='rgba(255,255,255,0.08)';"
             onmouseout="this.style.color='#a1a1aa';this.style.background='rgba(255,255,255,0.04)';">
            Guia Completo
          </a>

          <button onclick="HzOnboarding.fechar()"
                  style="background:linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
                         color:#ffffff;border:none;padding:10px 20px;border-radius:12px;
                         font-size:13px;font-weight:700;cursor:pointer;
                         box-shadow:0 4px 18px rgba(124,58,237,0.45);
                         transition:all .2s;display:flex;align-items:center;gap:6px;"
                  onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 6px 24px rgba(124,58,237,0.6)';"
                  onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 18px rgba(124,58,237,0.45)';">
            <span>Explorar o Portal 2.0</span>
            <span style="font-size:14px;">🚀</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</div>

<style>
.hz-v2-card-scroll::-webkit-scrollbar {
  width: 6px;
}
.hz-v2-card-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.hz-v2-card-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}
.hz-v2-card-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}
@keyframes hzV2ModalEnter {
  from { opacity: 0; transform: scale(0.95) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes hzV2Pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}
</style>

<script>
window.HzOnboarding = (function () {
  var STORAGE_KEY = 'hz_portal_v2_seen';
  var modal = null;

  function init() {
    modal = document.getElementById('hz-onboarding-modal');
    if (!modal) return;

    // Exibe apenas uma única vez para os usuários
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(function () {
        abrir();
      }, 700);
    }

    // Fechar ao clicar no fundo escuro
    modal.addEventListener('click', function (e) {
      if (e.target === modal) fechar();
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
        fechar();
      }
    });
  }

  function abrir() {
    if (!modal) modal = document.getElementById('hz-onboarding-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.style.opacity = '1';
  }

  function fechar() {
    if (!modal) modal = document.getElementById('hz-onboarding-modal');
    if (!modal) return;
    modal.style.opacity = '0';
    modal.style.transition = 'opacity .22s ease';
    setTimeout(function () {
      modal.style.display = 'none';
    }, 220);

    // Marca como visto definitivamente no navegador do usuário
    try {
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.setItem('hz_visited', '1');
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }

  function ir(tabId) {
    fechar();
    setTimeout(function () {
      if (tabId === 'cmd') {
        if (typeof window.openCommandPalette === 'function') {
          window.openCommandPalette();
        }
        return;
      }
      if (typeof window.customSwitchTab === 'function') {
        window.customSwitchTab(tabId);
        if (tabId === 'radar' && typeof window.initRadarTab === 'function') {
          window.initRadarTab();
        }
      }
    }, 250);
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    abrir: abrir,
    fechar: fechar,
    ir: ir
  };
})();

// Atalho global para conveniência
window.openWelcome2Modal = function() {
  if (window.HzOnboarding) window.HzOnboarding.abrir();
};
</script>
