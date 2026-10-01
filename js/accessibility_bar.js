document.addEventListener('DOMContentLoaded', function() {
    const css = `
        .acc-bar { position: fixed; bottom: 24px; left: 24px; z-index: 9999; display: flex; gap: 4px; background: #18181b; border: 1px solid #3f3f46; padding: 4px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        @media (max-width: 1024px) {
            .acc-bar { bottom: 80px; left: 12px; }
        }
        .acc-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; color: #a1a1aa; transition: all 0.2s; font-weight: bold; font-size: 14px; }
        .acc-btn:hover { background: #27272a; color: #fff; }
        .acc-btn.active { background: #7c3aed; color: #fff; }
        html.font-lg { font-size: 115% !important; }
        html.font-xl { font-size: 130% !important; }
        html.high-contrast { filter: contrast(1.2) brightness(1.1); }
        html.high-contrast body { background: #000 !important; color: #fff !important; }
    `;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.className = 'acc-bar';
    bar.innerHTML = `
        <div class="acc-btn" onclick="setAccFont('normal')" id="font-normal">A</div>
        <div class="acc-btn" onclick="setAccFont('lg')" id="font-lg">A+</div>
        <div class="acc-btn" onclick="setAccFont('xl')" id="font-xl">A++</div>
        <div class="acc-btn" onclick="toggleContrast()">◑</div>
    `;
    document.body.appendChild(bar);

    window.setAccFont = (size) => {
        document.documentElement.classList.remove('font-lg', 'font-xl');
        document.querySelectorAll('.acc-btn').forEach(b => b.classList.remove('active'));
        if(size !== 'normal') document.documentElement.classList.add('font-' + size);
        const btn = document.getElementById('font-' + size);
        if(btn) btn.classList.add('active');
        localStorage.setItem('acc-font', size);
    };

    window.toggleContrast = () => {
        const active = document.documentElement.classList.toggle('high-contrast');
        localStorage.setItem('acc-contrast', active);
    };

    const savedFont = localStorage.getItem('acc-font') || 'normal';
    setAccFont(savedFont);
    if(localStorage.getItem('acc-contrast') === 'true') toggleContrast();
});
