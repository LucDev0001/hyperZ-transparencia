/**
 * glossario.js — Glossário interativo de termos técnicos
 * Adiciona ícone ⓘ após termos definidos em [data-termo] e detecta siglas
 * em áreas específicas do portal, exibindo explicações em linguagem simples.
 */
(function () {
  'use strict';

  const GLOSSARIO = {
    'CEAP':     'Cota Parlamentar — verba mensal de até R$ 45.600 que cada deputado recebe para custear seu trabalho (passagens, aluguel de escritório, combustível, etc.). Não é salário.',
    'CNPJ':     'Cadastro Nacional da Pessoa Jurídica — número de identificação de uma empresa no governo federal. Todo negócio registrado no Brasil possui um.',
    'CPF':      'Cadastro de Pessoa Física — número de identificação de cada cidadão brasileiro na Receita Federal.',
    'SIAFI':    'Sistema Integrado de Administração Financeira — sistema contábil do governo federal onde todas as despesas e receitas da União são registradas em tempo real.',
    'SICONFI':  'Sistema de Informações Contábeis e Fiscais do Setor Público — onde estados e municípios enviam seus dados financeiros ao governo federal para controle e publicidade.',
    'SADIPEM':  'Sistema de Apoio à Decisão de Operações de Crédito — controla os pedidos de empréstimos e financiamentos de estados e municípios junto ao governo federal.',
    'CEAF':     'Cadastro de Expulsões da Administração Federal — lista pública de servidores federais que foram demitidos ou expulsos por irregularidades graves.',
    'CEIS':     'Cadastro de Empresas Inidôneas e Suspensas — lista de empresas e pessoas físicas proibidas de celebrar contratos com qualquer órgão público no Brasil.',
    'CNEP':     'Cadastro Nacional de Empresas Punidas — lista de empresas e pessoas que receberam sanções por descumprir contratos públicos ou cometer atos de improbidade.',
    'CEPIM':    'Cadastro de Entidades Privadas Sem Fins Lucrativos Impedidas — lista de ONGs e associações com convênios suspensos por irregularidades na prestação de contas.',
    'PEP':      'Pessoa Exposta Politicamente — quem exerce ou exerceu cargo público relevante (presidente, governador, deputado, etc.). Suas transações financeiras são monitoradas com maior rigor.',
    'LAI':      'Lei de Acesso à Informação (Lei nº 12.527/2011) — lei que garante ao cidadão o direito de solicitar quaisquer dados e documentos ao poder público.',
    'TCU':      'Tribunal de Contas da União — órgão responsável por fiscalizar o uso dos recursos federais e julgar as contas dos gestores públicos.',
    'CGU':      'Controladoria-Geral da União — órgão federal de controle interno, auditoria e combate à corrupção. Mantém o Portal da Transparência.',
    'TSE':      'Tribunal Superior Eleitoral — responsável pela organização, fiscalização e segurança das eleições em todo o Brasil.',
    'LOA':      'Lei Orçamentária Anual — lei aprovada pelo Congresso que define quanto o governo pode gastar em cada área durante o ano.',
    'STN':      'Secretaria do Tesouro Nacional — responsável pela gestão das finanças públicas federais, incluindo a dívida pública.',
    'PVL':      'Pedido de Verificação de Limites — solicitação feita por estados e municípios ao Tesouro Nacional para contrair empréstimos ou financiamentos.',
    'COMPRASNET': 'Portal de compras do governo federal onde são publicadas todas as licitações e contratos da administração pública federal.',
    'DIÁRIAS':  'Valores pagos a servidores ou agentes públicos para cobrir despesas de alimentação e hospedagem em viagens a serviço fora de sua sede.',
  };

  let activePopup = null;

  // ── Exibir popup de glossário ────────────────────────────────────────────────
  function showPopup(term, description, anchor) {
    if (activePopup) activePopup.remove();

    const popup = document.createElement('div');
    popup.className = 'hz-glossario-popup';
    popup.style.cssText = [
      'position:fixed',
      'background:rgba(18,18,22,0.98)',
      'border:1px solid rgba(124,58,237,0.4)',
      'border-radius:12px',
      'padding:14px 16px',
      'max-width:min(320px,90vw)',
      'z-index:10500',
      'box-shadow:0 8px 32px rgba(0,0,0,0.55)',
      'backdrop-filter:blur(14px)',
      'font-size:13px',
      'line-height:1.55',
      'animation:hz-popup-in .15s ease',
    ].join(';');

    // Inject keyframe once
    if (!document.getElementById('hz-popup-kf')) {
      const kf = document.createElement('style');
      kf.id = 'hz-popup-kf';
      kf.textContent = '@keyframes hz-popup-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(kf);
    }

    popup.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
        '<strong style="color:#c4b5fd;font-size:14px;line-height:1.3;">' + term + '</strong>' +
        '<button onclick="this.closest(\'.hz-glossario-popup\').remove()" ' +
          'style="background:none;border:none;color:#71717a;cursor:pointer;font-size:18px;padding:0;line-height:1;flex-shrink:0;" ' +
          'title="Fechar">×</button>' +
      '</div>' +
      '<p style="color:#d4d4d8;margin:0;">' + description + '</p>';

    document.body.appendChild(popup);
    activePopup = popup;

    // Posicionar próximo ao âncora
    const rect = anchor.getBoundingClientRect();
    const pw   = 320;
    let left   = Math.min(rect.left, window.innerWidth - pw - 16);
    if (left < 16) left = 16;
    let top = rect.bottom + 8;
    if (top + 130 > window.innerHeight - 16) top = rect.top - 130 - 8;
    popup.style.left = left + 'px';
    popup.style.top  = top  + 'px';

    // Fechar ao clicar fora
    setTimeout(function () {
      function handler(e) {
        if (!popup.contains(e.target)) {
          popup.remove();
          if (activePopup === popup) activePopup = null;
          document.removeEventListener('click', handler);
        }
      }
      document.addEventListener('click', handler);
    }, 60);
  }

  // ── Criar ícone ⓘ clicável ───────────────────────────────────────────────────
  function makeIcon(term, description) {
    const btn = document.createElement('button');
    btn.className = 'hz-glossario-icon';
    btn.textContent = 'ⓘ';
    btn.title = 'O que é ' + term + '?';
    btn.setAttribute('aria-label', 'O que é ' + term + '?');
    btn.style.cssText = [
      'background:none',
      'border:none',
      'color:#7c3aed',
      'cursor:pointer',
      'font-size:.8em',
      'padding:0 0 0 3px',
      'opacity:.65',
      'transition:opacity .15s',
      'vertical-align:middle',
      'line-height:1',
    ].join(';');
    btn.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '.65'; });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      showPopup(term, description, btn);
    });
    return btn;
  }

  // ── Processar elementos com [data-termo] ─────────────────────────────────────
  function processDataTermos(root) {
    (root || document).querySelectorAll('[data-termo]').forEach(function (el) {
      const key  = (el.getAttribute('data-termo') || '').toUpperCase();
      const desc = GLOSSARIO[key];
      if (!desc) return;
      el.removeAttribute('data-termo');
      el.appendChild(makeIcon(key, desc));
    });
  }

  // ── Escanear texto de um container e adicionar ícones às siglas ──────────────
  const TERM_REGEX = /\b(CEAP|CNEP|CEIS|CEAF|CEPIM|PEP|SIAFI|SICONFI|SADIPEM|LAI|TCU|CGU|TSE|LOA|STN|PVL|COMPRASNET|DIÁRIAS)\b/g;
  const SKIP_TAGS  = new Set(['SCRIPT','STYLE','INPUT','TEXTAREA','SELECT','BUTTON','A']);

  function scanText(container) {
    if (!container) return;

    // Coleta nós de texto dentro do container
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest('.hz-glossario-popup,.hz-glossario-icon')) return NodeFilter.FILTER_REJECT;
        if (p.hasAttribute('data-glossary-done')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (textNode) {
      const text = textNode.textContent;
      TERM_REGEX.lastIndex = 0;
      if (!TERM_REGEX.test(text)) return;
      TERM_REGEX.lastIndex = 0;

      const parent = textNode.parentElement;
      if (!parent || parent.hasAttribute('data-glossary-done')) return;
      parent.setAttribute('data-glossary-done', '1');

      // Substituir texto por fragmento com ícones
      const frag = document.createDocumentFragment();
      let last = 0;
      let match;
      TERM_REGEX.lastIndex = 0;
      while ((match = TERM_REGEX.exec(text)) !== null) {
        const term = match[0];
        const desc = GLOSSARIO[term];
        if (!desc) continue;
        if (match.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        }
        const span = document.createElement('span');
        span.style.cssText = 'display:inline;';
        span.textContent = term;
        span.appendChild(makeIcon(term, desc));
        frag.appendChild(span);
        last = match.index + term.length;
      }
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }
      parent.replaceChild(frag, textNode);
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    processDataTermos(document);

    // Escanear áreas com terminologia técnica frequente
    const scanAreas = [
      '#content-radar .glass-panel',
      '#content-gestao',
      '#content-receitas',
      '#content-licitacoes',
      '#content-viagens',
    ];
    scanAreas.forEach(function (sel) {
      scanText(document.querySelector(sel));
    });
  });

  // Expor API pública para uso em outros módulos
  window.HzGlossario = { GLOSSARIO: GLOSSARIO, scanText: scanText };
})();
