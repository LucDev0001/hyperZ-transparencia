// transparency/js/game_tutorial.js

function initTutorial() {
    // Check if tutorial was already completed
    if (localStorage.getItem('depumon_tutorial_done')) return;

    const steps = [
        {
            title: "Bem-vindo ao DepuMon GO!",
            text: "Sua missão é capturar deputados, fiscalizar gastos e batalhar pela transparência! O Brasil precisa de você.",
            target: null
        },
        {
            title: "Movimentação",
            text: "Use o Joystick na tela ou as teclas W, A, S, D para explorar o mapa 3D de Brasília.",
            target: ".joystick-btn" // Highlight joystick
        },
        {
            title: "Radar",
            text: "Use o botão 'Escanear Área' para encontrar políticos corruptos e arenas próximas.",
            target: "button[onclick='scanArea()']"
        },
        {
            title: "Captura",
            text: "Clique nos deputados que aparecerem no mapa para ver sua ficha e tentar capturá-los com a UrnaBola.",
            target: null
        },
        {
            title: "Menu",
            text: "Acesse sua Pokédex, Mercado, Eventos e Ranking pelos botões laterais.",
            target: "button[onclick='openPokedex()']"
        }
    ];

    let currentStep = 0;

    // Create Modal Elements
    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.className = 'fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300';
    
    const modal = document.createElement('div');
    modal.className = 'bg-zinc-900 border-2 border-violet-600 rounded-2xl p-6 max-w-sm w-full relative shadow-[0_0_50px_rgba(124,58,237,0.3)] transform transition-all duration-300 scale-100';
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function renderStep() {
        const step = steps[currentStep];
        
        // Remove previous highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight', 'z-[201]', 'relative', 'ring-4', 'ring-violet-500', 'rounded-full');
        });

        // Highlight new target
        if (step.target) {
            const el = document.querySelector(step.target);
            if (el) {
                el.classList.add('tutorial-highlight', 'z-[201]', 'relative', 'ring-4', 'ring-violet-500', 'rounded-full');
            }
        }

        modal.innerHTML = `
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-xl font-bold text-white border-4 border-zinc-900">
                ${currentStep + 1}
            </div>
            <h3 class="text-xl font-black text-white text-center mt-4 mb-2">${step.title}</h3>
            <p class="text-zinc-300 text-center text-sm mb-6 leading-relaxed">${step.text}</p>
            <div class="flex justify-between gap-4">
                <button id="btnSkip" class="text-zinc-500 text-xs font-bold hover:text-white px-4">Pular</button>
                <button id="btnNext" class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition shadow-lg flex-1">
                    ${currentStep === steps.length - 1 ? 'Começar!' : 'Próximo'}
                </button>
            </div>
        `;

        document.getElementById('btnNext').onclick = nextStep;
        document.getElementById('btnSkip').onclick = endTutorial;
    }

    function nextStep() {
        currentStep++;
        if (currentStep >= steps.length) {
            endTutorial();
        } else {
            renderStep();
        }
    }

    function endTutorial() {
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.remove();
            document.querySelectorAll('.tutorial-highlight').forEach(el => {
                el.classList.remove('tutorial-highlight', 'z-[201]', 'relative', 'ring-4', 'ring-violet-500', 'rounded-full');
            });
        }, 300);
        localStorage.setItem('depumon_tutorial_done', 'true');
        
        if (typeof showGameAlert === 'function') {
            showGameAlert("Tutorial concluído! Boa caçada!", "success");
        }
    }

    renderStep();
}

// Public: replay tutorial manually
function openTutorial() {
    localStorage.removeItem('depumon_tutorial_done');
    initTutorial();
}

// Auto start
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initTutorial, 1500);
});