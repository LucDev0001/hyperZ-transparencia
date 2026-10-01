<!-- ══════════════════════════════════════════════════════════════════════
     Modal de Boas-Vindas / Onboarding — aparece apenas na primeira visita
     Controle via localStorage 'hz_visited'
══════════════════════════════════════════════════════════════════════ -->
<div id="hz-onboarding-modal"
     role="dialog" aria-modal="true" aria-labelledby="hz-onboarding-title"
     style="display:none;position:fixed;inset:0;z-index:9500;
            background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);
            align-items:center;justify-content:center;padding:16px;">

  <div style="background:#18181b;border:1px solid rgba(255,255,255,0.1);
              border-radius:20px;max-width:520px;width:100%;
              box-shadow:0 24px 64px rgba(0,0,0,0.6);
              overflow:hidden;animation:hz-modal-in .25s ease;">

    <!-- Cabeçalho -->
    <div style="background:linear-gradient(135deg,rgba(124,58,237,.25),rgba(99,102,241,.15));
                padding:24px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <div style="width:40px;height:40px;border-radius:12px;
                    background:linear-gradient(135deg,#7c3aed,#4f46e5);
                    display:flex;align-items:center;justify-content:center;
                    font-size:20px;flex-shrink:0;">🏛️</div>
        <div>
          <h2 id="hz-onboarding-title"
              style="font-size:18px;font-weight:900;color:#fff;margin:0;line-height:1.2;">
            Bem-vindo à Plataforma Hacker GZ
          </h2>
          <p style="font-size:13px;color:#a1a1aa;margin:4px 0 0;">
            O portal civic tech para cruzar dados e investigar políticos.
          </p>
        </div>
      </div>
      <p style="font-size:14px;color:#c4c4c8;margin:0;line-height:1.55;">
        O que você quer fazer hoje?
      </p>
    </div>

    <!-- Grade de ações -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:20px;">

      <!-- Card 1: Ver meu deputado -->
      <button onclick="HzOnboarding.ir('politicos')"
              style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);
                     border-radius:14px;padding:16px 14px;text-align:left;cursor:pointer;
                     transition:all .2s;display:flex;flex-direction:column;gap:8px;"
              onmouseover="this.style.background='rgba(124,58,237,0.12)';this.style.borderColor='rgba(124,58,237,0.4)';"
              onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.1)';">
        <span style="font-size:28px;line-height:1;">🔍</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff;line-height:1.3;">Investigar Deputados</div>
          <div style="font-size:12px;color:#71717a;margin-top:3px;line-height:1.4;">Gastos suspeitos, faltas e votações</div>
        </div>
      </button>

      <!-- Card 2: Investigar pessoa ou empresa -->
      <button onclick="HzOnboarding.ir('radar')"
              style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);
                     border-radius:14px;padding:16px 14px;text-align:left;cursor:pointer;
                     transition:all .2s;display:flex;flex-direction:column;gap:8px;"
              onmouseover="this.style.background='rgba(220,38,38,0.1)';this.style.borderColor='rgba(220,38,38,0.35)';"
              onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.1)';">
        <span style="font-size:28px;line-height:1;">⚠️</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff;line-height:1.3;">Radar Anti-Corrupção (IA)</div>
          <div style="font-size:12px;color:#71717a;margin-top:3px;line-height:1.4;">Cruze CNPJs e CPFs com empresas e doadores</div>
        </div>
      </button>

      <!-- Card 3: Ver gastos públicos -->
      <button onclick="HzOnboarding.ir('orcamento')"
              style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);
                     border-radius:14px;padding:16px 14px;text-align:left;cursor:pointer;
                     transition:all .2s;display:flex;flex-direction:column;gap:8px;"
              onmouseover="this.style.background='rgba(20,83,45,0.15)';this.style.borderColor='rgba(22,163,74,0.35)';"
              onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.1)';">
        <span style="font-size:28px;line-height:1;">💸</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff;line-height:1.3;">Rastrear Dinheiro Público</div>
          <div style="font-size:12px;color:#71717a;margin-top:3px;line-height:1.4;">Veja os contratos milionários do Executivo</div>
        </div>
      </button>

      <!-- Card 4: Dados da minha cidade -->
      <button onclick="HzOnboarding.ir('municipio')"
              style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);
                     border-radius:14px;padding:16px 14px;text-align:left;cursor:pointer;
                     transition:all .2s;display:flex;flex-direction:column;gap:8px;"
              onmouseover="this.style.background='rgba(217,119,6,0.1)';this.style.borderColor='rgba(217,119,6,0.35)';"
              onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.1)';">
        <span style="font-size:28px;line-height:1;">🏙️</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff;line-height:1.3;">Hackear Minha Cidade</div>
          <div style="font-size:12px;color:#71717a;margin-top:3px;line-height:1.4;">Veja quanto dinheiro o seu município recebeu</div>
        </div>
      </button>

    </div>

    <!-- Rodapé -->
    <div style="padding:0 20px 20px;text-align:center;">
      <button onclick="HzOnboarding.fechar()"
              style="background:none;border:none;color:#52525b;font-size:13px;
                     cursor:pointer;padding:8px 16px;transition:color .15s;"
              onmouseover="this.style.color='#a1a1aa';"
              onmouseout="this.style.color='#52525b';">
        Já sei usar — entrar direto no banco de dados
      </button>
    </div>
  </div>
</div>

<style>
@keyframes hz-modal-in {
  from { opacity: 0; transform: scale(.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1)  translateY(0);    }
}
</style>

<script>
window.HzOnboarding = (function () {
  var modal = null;

  function init() {
    modal = document.getElementById('hz-onboarding-modal');
    if (!modal) return;

    // Mostrar apenas na primeira visita (sem cookie, apenas localStorage)
    if (!localStorage.getItem('hz_visited')) {
      // Pequeno delay para o portal carregar primeiro
      setTimeout(function () {
        modal.style.display = 'flex';
      }, 600);
    }

    // Fechar ao clicar no backdrop
    modal.addEventListener('click', function (e) {
      if (e.target === modal) fechar();
    });

    // Fechar com ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fechar();
    });
  }

  function fechar() {
    if (!modal) return;
    modal.style.opacity    = '0';
    modal.style.transition = 'opacity .2s';
    setTimeout(function () { modal.style.display = 'none'; }, 200);
    localStorage.setItem('hz_visited', '1');
  }

  function ir(tabId) {
    fechar();
    setTimeout(function () {
      if (typeof window.customSwitchTab === 'function') {
        window.customSwitchTab(tabId);
        if (tabId === 'radar' && typeof window.initRadarTab === 'function') {
          window.initRadarTab();
        }
      }
    }, 250);
  }

  document.addEventListener('DOMContentLoaded', init);
  return { fechar: fechar, ir: ir };
})();
</script>
