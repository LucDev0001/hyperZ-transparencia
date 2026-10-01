/**
 * toast.js — Sistema de notificações flutuantes (toasts)
 * Uso: window.HzToast.show('Mensagem', 'success' | 'error' | 'info' | 'warning', duracaoMs)
 */
window.HzToast = (function () {
  'use strict';

  let container = null;

  const STYLES = {
    success: 'background:rgba(5,46,22,0.97);border-color:rgba(22,163,74,0.45);color:#86efac;',
    error:   'background:rgba(59,7,7,0.97);border-color:rgba(220,38,38,0.45);color:#fca5a5;',
    warning: 'background:rgba(63,45,10,0.97);border-color:rgba(217,119,6,0.45);color:#fcd34d;',
    info:    'background:rgba(24,24,27,0.97);border-color:rgba(255,255,255,0.12);color:#e4e4e7;',
  };

  function getContainer() {
    if (!container || !document.body.contains(container)) {
      container = document.createElement('div');
      container.id = 'hz-toast-container';
      container.style.cssText = [
        'position:fixed',
        'bottom:90px',
        'left:50%',
        'transform:translateX(-50%)',
        'z-index:9800',
        'display:flex',
        'flex-direction:column-reverse',
        'align-items:center',
        'gap:8px',
        'pointer-events:none',
        'width:max-content',
        'max-width:calc(100vw - 32px)',
      ].join(';');
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type, duration) {
    type     = type     || 'info';
    duration = duration || 3000;

    const c     = getContainer();
    const toast = document.createElement('div');
    const style = STYLES[type] || STYLES.info;

    toast.style.cssText = [
      style,
      'border:1px solid',
      'border-radius:12px',
      'padding:10px 20px',
      'font-size:13px',
      'font-weight:600',
      'line-height:1.4',
      'backdrop-filter:blur(12px)',
      'box-shadow:0 4px 24px rgba(0,0,0,0.45)',
      'opacity:0',
      'transform:translateY(8px)',
      'transition:opacity .2s ease,transform .2s ease',
      'pointer-events:none',
      'white-space:nowrap',
      'max-width:calc(100vw - 48px)',
      'overflow:hidden',
      'text-overflow:ellipsis',
    ].join(';');

    toast.textContent = message;
    c.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateY(0)';
      });
    });

    // Animar saída e remover
    setTimeout(function () {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(function () { toast.remove(); }, 250);
    }, duration);
  }

  return { show: show };
})();
