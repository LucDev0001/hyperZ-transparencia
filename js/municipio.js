// transparency/js/municipio.js — Fiscal Municipal (Fiorilli)

// ── Estado global ─────────────────────────────────────────────────────────────
window._munBaseUrl   = null;
window._munCityName  = '';
window._munUf        = '';
window._munYear      = new Date().getFullYear();
window._munContratosCache = null; // cache dos contratos para aba 'O que foi comprado'

// ── Slug helper ───────────────────────────────────────────────────────────────
function _slugify(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

// ── Proxy Fiorilli via backend ────────────────────────────────────────────────
async function _fiorilliCall(baseUrl, path) {
    // INTERCEPTADOR PARA MODO DE TESTE (OFFLINE)
    if (window._munCityName === 'Cidade de Teste') {
        if (path.includes('DespesasPorOrgao')) return [
            { Orgao: 'Secretaria de Saúde', ValorEmpenhado: '1500000,00', ValorLiquidado: '1200000,00', ValorPago: '1000000,00' },
            { Orgao: 'Secretaria de Educação', ValorEmpenhado: '2500000,00', ValorLiquidado: '2000000,00', ValorPago: '1800000,00' },
            { Orgao: 'Gabinete do Prefeito', ValorEmpenhado: '300000,00', ValorLiquidado: '250000,00', ValorPago: '200000,00' }
        ];
        if (path.includes('Receitas')) return [
            { Descricao: 'IPTU', ValorPrevisto: '5000000,00', ValorRealizado: '4800000,00' },
            { Descricao: 'ISS', ValorPrevisto: '3000000,00', ValorRealizado: '3200000,00' }
        ];
        if (path.includes('VersaoJson/Despesas')) return []; // Evita erros em outras chamadas
        return { ExercicioDefinido: true }; // Para o probe de descoberta
    }
    const url = new URL((window.BASE_PATH || "") + "/api.php", window.location.origin);
    url.searchParams.set('action', 'proxy_fiorilli');
    url.searchParams.set('municipioUrl', baseUrl);
    url.searchParams.set('endpoint', path);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(45000) });
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (_) {
        throw new Error('Resposta inválida do servidor. Verifique o console.');
    }
    if (!res.ok) {
        throw new Error(data?.details || data?.error || 'Erro ' + res.status);
    }
    if (data?.error) throw new Error(data.error);
    return data;
}

// ── Descoberta automática da URL base ────────────────────────────────────────
async function _discoverUrl(cityName, uf) {
    const slug = _slugify(cityName);
    const ufLow = uf.toLowerCase();
    const yr = new Date().getFullYear();
    const probe = `VersaoJson/Despesas/?Listagem=DespesasPorOrgao&ConectarExercicio=${yr}&Exercicio=${yr}&Empresa=1&MostraDadosConsolidado=False`;

    // Lista expandida de padrões Fiorilli baseada em implementações reais
    const candidates = [
        `https://transparencia.${slug}.${ufLow}.gov.br/transparencia`,
        `https://transparencia.${slug}.${ufLow}.gov.br`,
        `https://${slug}.fiorilli.com.br/transparencia`,
        `https://${slug}.portaltpa.com.br/transparencia`,
        `https://${slug}.msgestaopublica.app.br/transparencia`,
        `https://${slug}.flowdocs.com.br/portal-transparencia`,
        `https://${slug}.msgestaopublica.app.br:8079/transparencia`,
        `https://${slug}.portaltpa.com.br:8079/transparencia`,
        `https://${slug}.fiorilli.com.br:8079/transparencia`,
        `http://${slug}.msgestaopublica.app.br:8079/transparencia`,
        `http://${slug}.portaltpa.com.br:8079/transparencia`,
        `https://${slug}.atende.net/transparencia`,
        `https://www.${slug}.${ufLow}.gov.br/transparencia`,
        `https://${slug}.${ufLow}.gov.br/transparencia`,
        `http://transparencia.${slug}.${ufLow}.gov.br:8080/transparencia`,
        `https://veranopolis.flowdocs.com.br/portal-transparencia`, // Hardcoded candidate based on research
    ];

    // Tenta primeiro as URLs HTTPS, depois HTTP se necessário
    for (const base of candidates) {
        try {
            console.log(`[Discovery] Testando portal em: ${base}`);
            const data = await _fiorilliCall(base, probe);

            // Se retornar um array (mesmo que vazio) ou o objeto de exercício, o portal é Fiorilli
            if (data && (Array.isArray(data) || data.ExercicioDefinido || (typeof data === 'object' && !data.error))) {
                console.log(`[Discovery] Sucesso encontrado: ${base}`);
                return base;
            }
        } catch (err) {
            // Silencioso, continua para o próximo candidato
        }
    }
    return null;
}
// ── Formatação cidadã ─────────────────────────────────────────────────────────
function _brl(val) {
    const n = parseFloat(String(val || 0).replace(',', '.')) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function _pct(a, b) {
    if (!b || parseFloat(b) === 0) return '—';
    return ((parseFloat(String(a).replace(',','.')) / parseFloat(String(b).replace(',','.'))) * 100).toFixed(1) + '%';
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function _setStatus(msg, isErr) {
    const el = document.getElementById('mun-status');
    if (!el) return;
    
    if (isErr && msg.includes('não encontrado')) {
        el.innerHTML = `
            <div class="flex flex-col gap-3">
                <p>❌ ${msg}</p>
                <div class="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 mt-2">
                    <p class="text-xs text-zinc-300 mb-2">Conhece a URL do portal Fiorilli desta cidade? Cole abaixo:</p>
                    <div class="flex gap-2">
                        <input type="text" id="mun-url-manual" placeholder="https://portal.cidade.sp.gov.br/transparencia" 
                               class="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-violet-500">
                        <button onclick="window.buscarMunicipio(document.getElementById('mun-url-manual').value)"
                                class="bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold px-3 py-1 rounded transition">Usar esta URL</button>
                    </div>
                </div>
            </div>`;
    } else {
        el.textContent = msg;
    }

    if (!msg) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.className = isErr
        ? 'mb-4 p-4 rounded-xl border border-red-800/50 bg-red-900/20 text-red-400 text-sm font-medium'
        : 'mb-4 p-4 rounded-xl border border-zinc-700 bg-zinc-900/60 text-zinc-400 text-sm font-medium animate-pulse';
}

function _setSection(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

// ── Histórico de buscas (localStorage) ───────────────────────────────────────
function _salvarHistorico(city, uf, ano) {
    try {
        const key = 'mun_historico';
        const hist = JSON.parse(localStorage.getItem(key) || '[]');
        const entrada = { city, uf, ano, ts: Date.now() };
        const sem = hist.filter(h => !(h.city === city && h.uf === uf));
        sem.unshift(entrada);
        localStorage.setItem(key, JSON.stringify(sem.slice(0, 7)));
        _renderHistorico();
    } catch(_) {}
}

function _renderHistorico() {
    try {
        const hist = JSON.parse(localStorage.getItem('mun_historico') || '[]');
        const wrap = document.getElementById('mun-historico');
        const chips = document.getElementById('mun-historico-chips');
        if (!wrap || !chips || !hist.length) { wrap?.classList.add('hidden'); return; }
        wrap.classList.remove('hidden');
        chips.innerHTML = hist.map(h => `
            <button onclick="document.getElementById('mun-cidade').value='${h.city}';document.getElementById('mun-uf').value='${h.uf}';document.getElementById('mun-ano').value='${h.ano}';buscarMunicipio()"
                    class="text-[11px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-lg transition">
                📍 ${h.city} / ${h.uf.toUpperCase()} <span class="text-zinc-600">${h.ano}</span>
            </button>`).join('');
    } catch(_) {}
}

// ── Progresso de carregamento ─────────────────────────────────────────────────
let _progTotal = 0, _progDone = 0;
function _progInicio(total) {
    _progTotal = total; _progDone = 0;
    const el = document.getElementById('mun-progresso');
    if (el) el.classList.remove('hidden');
    _progAtualizar('Carregando dados do portal...');
}
function _progTick(label) {
    _progDone++;
    _progAtualizar(label);
    if (_progDone >= _progTotal) {
        setTimeout(() => document.getElementById('mun-progresso')?.classList.add('hidden'), 1200);
    }
}
function _progAtualizar(label) {
    const pct = _progTotal > 0 ? Math.round((_progDone / _progTotal) * 100) : 0;
    const bar  = document.getElementById('mun-prog-bar');
    const lbl  = document.getElementById('mun-prog-label');
    const cnt  = document.getElementById('mun-prog-count');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = label;
    if (cnt) cnt.textContent = `${_progDone} / ${_progTotal}`;
}

async function _renderDashboard(base, cityName, uf) {
    document.getElementById('mun-dashboard')?.classList.remove('hidden');
    document.getElementById('mun-titulo').textContent = `📍 ${cityName} — ${uf.toUpperCase()}`;
    document.getElementById('mun-fonte').textContent  = base;

    _progInicio(6);

    const tick = label => fn => fn().finally(() => _progTick(label));

    await Promise.allSettled([
        tick('Secretarias')(()=>_carregarGastosPorSecretaria()),
        tick('Fornecedores')(()=>_carregarFornecedores()),
        tick('Receitas')(()=>_carregarReceitas()),
    ]);
    await Promise.allSettled([
        tick('Contratos')(()=>_carregarContratos()),
        tick('Licitações')(()=>_carregarLicitacoes()),
        tick('Servidores')(()=>_carregarServidores()),
    ]);
}

// ── Busca inicial ─────────────────────────────────────────────────────────────
window.buscarMunicipio = async function (manualUrl) {
    const cityInput = document.getElementById('mun-cidade');
    const ufSelect  = document.getElementById('mun-uf');
    const yearSel   = document.getElementById('mun-ano');
    const cityName  = cityInput?.value.trim();
    const uf        = ufSelect?.value;
    const year      = yearSel?.value || new Date().getFullYear();

    if (!cityName || !uf) {
        _setStatus('Preencha o nome do município e o estado.', true);
        return;
    }

    // MODO DE TESTE PARA LOCALHOST SEM CONEXÃO
    if (cityName.toUpperCase() === 'TESTE') {
        _setStatus(`✨ Modo de Teste Ativado. Carregando dados fictícios...`);
        setTimeout(() => {
            window._munBaseUrl = 'https://ipua.portaltpa.com.br/transparencia';
            window._munCityName = 'Cidade de Teste';
            window._munUf = uf.toUpperCase();
            window._munYear = year;
            _renderDashboard('https://ipua.portaltpa.com.br/transparencia', 'Cidade de Teste', uf.toUpperCase());
        }, 1000);
        return;
    }

    document.getElementById('mun-dashboard')?.classList.add('hidden');
    
    let base = manualUrl;
    if (base) {
        _setStatus(`⏳ Validando URL manual...`);
        // Garante que termina em /transparencia ou algo similar se necessário, 
        // mas vamos confiar no que o usuário colou e apenas validar via probe.
        const yr = new Date().getFullYear();
        const probe = `VersaoJson/Despesas/?Listagem=DespesasPorOrgao&ConectarExercicio=${yr}&Exercicio=${yr}&Empresa=1&MostraDadosConsolidado=False`;
        try {
            const data = await _fiorilliCall(base, probe);
            if (!data || (!Array.isArray(data) && !data.ExercicioDefinido)) {
                throw new Error('O portal não respondeu com dados válidos.');
            }
        } catch (e) {
            _setStatus(`❌ A URL fornecida parece não ser um portal Fiorilli válido: ${e.message}`, true);
            return;
        }
    } else {
        _setStatus(`🔍 Procurando portal de ${cityName}/${uf}...`);
        base = await _discoverUrl(cityName, uf);
    }

    if (!base) {
        _setStatus(`❌ Portal não encontrado para ${cityName}/${uf}. O município pode não usar o sistema Fiorilli ou o endereço é diferente.`, true);
        return;
    }

    window._munBaseUrl   = base;
    window._munCityName  = cityName;
    window._munUf        = uf;
    window._munYear      = year;
    window._munContratosCache = null;

    // Atualiza URL para compartilhamento
    try {
        const params = new URLSearchParams(window.location.search);
        params.set('municipio', cityName);
        params.set('uf', uf);
        params.set('ano', year);
        history.replaceState(null, '', '?' + params.toString());
    } catch(_) {}

    _salvarHistorico(cityName, uf, year);

    _setStatus('');
    await _renderDashboard(base, cityName, uf);
};

// ── Render histórico ao carregar página ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    _renderHistorico();
});

// ── Auto-busca por URL params (deep link) ─────────────────────────────────────
(function _initFromUrl() {
    try {
        const p = new URLSearchParams(window.location.search);
        const municipio = p.get('municipio');
        const uf  = p.get('uf');
        const ano = p.get('ano');
        if (!municipio || !uf) return;
        const waitEl = setInterval(() => {
            const el = document.getElementById('mun-cidade');
            if (!el) return;
            clearInterval(waitEl);
            el.value = municipio;
            const ufEl = document.getElementById('mun-uf');
            if (ufEl) ufEl.value = uf;
            const anoEl = document.getElementById('mun-ano');
            if (anoEl && ano) anoEl.value = ano;
            buscarMunicipio();
        }, 150);
    } catch(_) {}
})();

// ── Aba switcher interno ──────────────────────────────────────────────────────
window.munAba = function (name) {
    ['secretarias','fornecedores','contratos','licitacoes','receitas','servidores','empenhos','itens'].forEach(t => {
        document.getElementById('mun-sec-' + t)?.classList.add('hidden');
        const btn = document.getElementById('mun-btn-' + t);
        if (btn) btn.className = 'px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap';
    });
    document.getElementById('mun-sec-' + name)?.classList.remove('hidden');
    const active = document.getElementById('mun-btn-' + name);
    if (active) active.className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-violet-600 text-white whitespace-nowrap';
};

// ── 1. Gastos por Secretaria ──────────────────────────────────────────────────
async function _carregarGastosPorSecretaria() {
    const sec = document.getElementById('mun-sec-secretarias');
    if (!sec) return;
    sec.innerHTML = '<div class="text-zinc-500 text-center py-6 animate-pulse">Carregando gastos...</div>';

    try {
        const mkPathOrg = yr => `VersaoJson/Despesas/?Listagem=DespesasPorOrgao&DiaInicioPeriodo=01&MesInicialPeriodo=01&DiaFinalPeriodo=31&MesFinalPeriodo=12&Exercicio=${yr}&Empresa=1&MostraDadosConsolidado=False`;
        let data;
        try { data = await _fiorilliCall(window._munBaseUrl, mkPathOrg(window._munYear)); } catch(_) { data = []; }
        if (!Array.isArray(data) || !data.length)
            data = await _fiorilliCall(window._munBaseUrl, mkPathOrg(parseInt(window._munYear) - 1));

        if (!Array.isArray(data) || !data.length) {
            sec.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Sem dados de gastos para este ano.</p>';
            return;
        }

        // Calcular totais
        let totalOrc = 0, totalPago = 0;
        data.forEach(d => {
            totalOrc  += parseFloat(String(d.DOTACAO_ATUALIZADA || 0).replace(',', '.')) || 0;
            totalPago += parseFloat(String(d.PAGO || 0).replace(',', '.')) || 0;
        });

        // Ordenar por pago decrescente
        const sorted = [...data].sort((a, b) =>
            (parseFloat(String(b.PAGO||0).replace(',','.')) || 0) -
            (parseFloat(String(a.PAGO||0).replace(',','.')) || 0)
        );

        sec.innerHTML = `
            <div class="flex gap-4 mb-4 flex-wrap">
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-700 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Orçamento Total</div>
                    <div class="text-lg font-black text-white">${_brl(totalOrc)}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-violet-800/50 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total Pago</div>
                    <div class="text-lg font-black text-violet-400">${_brl(totalPago)}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-700 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Executado</div>
                    <div class="text-lg font-black text-emerald-400">${_pct(totalPago, totalOrc)}</div>
                </div>
            </div>
            <div class="space-y-2">
            ${sorted.map(d => {
                const orc  = parseFloat(String(d.DOTACAO_ATUALIZADA||0).replace(',','.')) || 0;
                const pago = parseFloat(String(d.PAGO||0).replace(',','.')) || 0;
                const pctN = orc > 0 ? Math.min((pago / orc) * 100, 100) : 0;
                const nome = d.DESCRICAO || d.CODIGO || '—';
                return `
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-violet-700/50 transition">
                    <div class="flex justify-between items-start gap-2 mb-1.5">
                        <span class="text-sm font-bold text-white leading-tight">${nome}</span>
                        <span class="text-sm font-black text-violet-400 shrink-0">${_brl(pago)}</span>
                    </div>
                    <div class="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Orçado: ${_brl(orc)}</span>
                        <span>${pctN.toFixed(0)}% executado</span>
                    </div>
                    <div class="w-full bg-zinc-800 rounded-full h-1.5">
                        <div class="h-1.5 rounded-full ${pctN > 90 ? 'bg-red-500' : 'bg-violet-500'}" style="width:${pctN}%"></div>
                    </div>
                </div>`;
            }).join('')}
            </div>`;
    } catch (e) {
        sec.innerHTML = `<p class="text-red-500 text-sm text-center py-6">Erro: ${e.message}</p>`;
    }
}

// ── 2. Fornecedores — quem recebeu e quanto ─────────────────────────────────
async function _carregarFornecedores() {
    const sec = document.getElementById('mun-sec-fornecedores');
    if (!sec) return;
    sec.innerHTML = '<div class="text-zinc-500 text-center py-6 animate-pulse">Carregando fornecedores...</div>';

    try {
        const mkPath = yr => `VersaoJson/Despesas/?Listagem=DespesasPorFornecedor&DiaInicioPeriodo=01&MesInicialPeriodo=01&DiaFinalPeriodo=31&MesFinalPeriodo=12&Exercicio=${yr}&Empresa=1&MostrarFornecedor=True&MostraDadosConsolidado=False`;

        let data;
        let yearUsed = parseInt(window._munYear);
        try { data = await _fiorilliCall(window._munBaseUrl, mkPath(yearUsed)); }
        catch (_) { data = []; }

        // Ano corrente pode ter JSON truncado, vazio ou erro 502 — tenta ano anterior
        if (!Array.isArray(data) || !data.length) {
            yearUsed = parseInt(window._munYear) - 1;
            sec.innerHTML = `<div class="text-zinc-500 text-xs text-center py-2 animate-pulse">Sem dados em ${window._munYear}, buscando ${yearUsed}...</div>`;
            data = await _fiorilliCall(window._munBaseUrl, mkPath(yearUsed));
        }

        if (!Array.isArray(data) || !data.length) {
            sec.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Sem dados de fornecedores para este período.</p>';
            return;
        }

        const fallbackNotice = yearUsed !== parseInt(window._munYear)
            ? `<div class="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 mb-4 text-xs text-amber-300">
                ⚠️ <strong>Exibindo dados de ${yearUsed}</strong> — o portal não retornou dados para ${window._munYear} (ano incompleto ou não disponível).
               </div>` : '';

        // Limpa o prefixo de CNPJ que vem embutido no nome (ex: "26.221.668 NOME")
        const cleanName = str => str.replace(/^\d{2,3}\.\d{3}\.\d{3}[\s\/]*/, '').trim();
        const toNum = v => parseFloat(String(v || 0).replace(',', '.')) || 0;

        let totalEmp = 0, totalLiq = 0, totalPago = 0;
        data.forEach(d => {
            totalEmp  += toNum(d.EMPENHADO);
            totalLiq  += toNum(d.LIQUIDADO);
            totalPago += toNum(d.PAGO);
        });

        // Guarda dados para re-sort/re-filter
        window._munFornData      = [...data].map(d => ({ ...d, _nomeClean: cleanName(d.DESCRICAO || '—') }));
        window._munFornTotalPago = totalPago;
        window._munFornYearUsed  = yearUsed;

        // Alerta de concentração
        const top3pago   = [...data].sort((a,b)=>toNum(b.PAGO)-toNum(a.PAGO)).slice(0,3).reduce((s,d)=>s+toNum(d.PAGO),0);
        const concPct    = totalPago > 0 ? ((top3pago / totalPago) * 100).toFixed(1) : 0;
        const concAlert  = concPct > 50 ? `
            <div class="bg-red-950/30 border border-red-700/50 rounded-xl p-4 mb-4 flex items-start gap-3">
                <span class="text-2xl shrink-0">⚠️</span>
                <div>
                    <div class="text-red-300 font-black text-sm mb-1">Alta concentração de gastos detectada</div>
                    <p class="text-red-300/80 text-xs">Os <strong class="text-white">3 maiores fornecedores</strong> concentram
                    <strong class="text-white">${concPct}%</strong> de todo o gasto pago em ${yearUsed} (${_brl(top3pago)} de ${_brl(totalPago)}).
                    Concentração acima de 50% pode indicar dependência excessiva de poucos fornecedores ou falta de concorrência nas contratações.
                    Verifique se esses contratos passaram por licitação.</p>
                </div>
            </div>` : (concPct > 30 ? `
            <div class="bg-amber-950/20 border border-amber-700/30 rounded-xl p-3 mb-4 text-xs text-amber-300/80">
                ℹ️ Top 3 fornecedores concentram <strong class="text-amber-300">${concPct}%</strong> do total pago (${_brl(top3pago)}).
            </div>` : '');

        sec.innerHTML = `
            ${fallbackNotice}
            <div class="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4 mb-4 text-xs text-zinc-400 leading-relaxed">
                <div class="font-black text-white text-sm mb-2">🏭 O que são os Fornecedores?</div>
                <p class="mb-2">São as <strong class="text-white">empresas e pessoas físicas</strong> que receberam dinheiro público da prefeitura em troca de produtos ou serviços — de merenda escolar a obras de asfalto.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div class="bg-zinc-800/50 rounded-lg p-2 border border-amber-800/30">
                        <div class="text-amber-400 font-bold mb-1">📋 Empenhado</div>
                        <p>A prefeitura <strong>reservou</strong> esse valor no orçamento para pagar este fornecedor. É uma promessa de pagamento.</p>
                    </div>
                    <div class="bg-zinc-800/50 rounded-lg p-2 border border-blue-800/30">
                        <div class="text-blue-400 font-bold mb-1">✅ Liquidado</div>
                        <p>O produto foi entregue ou o serviço foi prestado. A prefeitura <strong>confirmou</strong> que recebeu o que foi contratado.</p>
                    </div>
                    <div class="bg-zinc-800/50 rounded-lg p-2 border border-emerald-800/30">
                        <div class="text-emerald-400 font-bold mb-1">💸 Pago</div>
                        <p>O dinheiro <strong>saiu do cofre</strong>. Esta é a cifra real transferida ao fornecedor. Diferença entre empenhado e pago = ainda a pagar.</p>
                    </div>
                </div>
                <p class="mt-3 text-zinc-500">📅 Filtro de exercício: mostra apenas fornecedores com empenhos registrados <strong>no ano ${yearUsed}</strong>. Fornecedores com contratos antigos que receberam pagamentos em outros anos podem não aparecer.</p>
            </div>
            ${concAlert}
            <div class="flex gap-3 mb-5 flex-wrap">
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-700 flex-1 min-w-[120px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Fornecedores</div>
                    <div class="text-lg font-black text-white">${data.length.toLocaleString('pt-BR')}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-amber-800/40 flex-1 min-w-[120px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total Empenhado</div>
                    <div class="text-base font-black text-amber-400">${_brl(totalEmp)}</div>
                    <div class="text-[10px] text-zinc-600">valor reservado</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-blue-800/40 flex-1 min-w-[120px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total Recebido</div>
                    <div class="text-base font-black text-blue-400">${_brl(totalLiq)}</div>
                    <div class="text-[10px] text-zinc-600">serviço/produto entregue</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-emerald-800/40 flex-1 min-w-[120px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total Pago</div>
                    <div class="text-base font-black text-emerald-400">${_brl(totalPago)}</div>
                    <div class="text-[10px] text-zinc-600">dinheiro já transferido</div>
                </div>
            </div>
            <!-- Barra de controles: busca + ordenação + CSV -->
            <div class="flex flex-wrap gap-2 mb-3 items-center">
                <input type="text" id="mun-forn-busca" placeholder="🔍 Filtrar por nome ou CNPJ..."
                       oninput="window._renderFornLista()"
                       class="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-violet-500">
                <div class="flex gap-1 items-center">
                    <span class="text-[10px] text-zinc-600 mr-1">Ordenar:</span>
                    <button onclick="window._fornSortBy='pago'; window._renderFornLista()" id="forn-sort-pago"
                            class="text-[10px] px-2 py-1 rounded bg-violet-700 text-white font-bold">💸 Pago</button>
                    <button onclick="window._fornSortBy='emp'; window._renderFornLista()" id="forn-sort-emp"
                            class="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 font-bold">📋 Empenhado</button>
                    <button onclick="window._fornSortBy='pendente'; window._renderFornLista()" id="forn-sort-pendente"
                            class="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 font-bold">⏳ Pendente</button>
                    <button onclick="window._fornSortBy='nome'; window._renderFornLista()" id="forn-sort-nome"
                            class="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 font-bold">🔤 Nome</button>
                </div>
                <button onclick="window._exportCSV(window._munFornData.map(d=>({Nome:d._nomeClean,CNPJ:d.INSMF,Cidade:d.CEPCI||'',Empenhado:d.EMPENHADO,Liquidado:d.LIQUIDADO,Pago:d.PAGO})),'fornecedores_${yearUsed}')"
                        class="text-[10px] bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/40 text-emerald-400 px-3 py-1.5 rounded-xl font-bold transition">
                    ⬇️ CSV
                </button>
            </div>
            <p class="text-zinc-600 text-[10px] mb-2" id="mun-forn-count">Top 100 fornecedores por valor pago em <strong>${yearUsed}</strong>.</p>
            <div id="mun-forn-lista" class="space-y-2"></div>`;

        window._fornSortBy = 'pago';
        window._renderFornLista();
    } catch (e) {
        sec.innerHTML = `<p class="text-red-500 text-sm text-center py-6">Erro: ${e.message}</p>`;
    }
}

// ── Exportar CSV ─────────────────────────────────────────────────────────────
window._exportCSV = function(rows, filename) {
    if (!rows || !rows.length) return;
    const cols = Object.keys(rows[0]);
    const esc  = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const csv  = [cols.join(';'), ...rows.map(r => cols.map(c => esc(r[c])).join(';'))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename + '.csv'; a.click();
    URL.revokeObjectURL(url);
};

// ── Consultar CNPJ via cnpj.ws ────────────────────────────────────────────────
window._consultarCNPJ = async function(cnpj) {
    const modal = document.getElementById('mun-cnpj-modal');
    const body  = document.getElementById('mun-cnpj-body');
    if (!modal || !body) return;
    modal.classList.remove('hidden');
    body.innerHTML = '<div class="text-zinc-400 text-sm animate-pulse text-center py-4">Consultando Receita Federal...</div>';
    try {
        const url = new URL((window.BASE_PATH || "") + "/api.php", window.location.origin);
        url.searchParams.set('action', 'proxy_fiorilli');
        url.searchParams.set('municipioUrl', 'https://publica.cnpj.ws');
        url.searchParams.set('endpoint', 'cnpj/' + cnpj);
        const res  = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
        const text = await res.text();
        let d;
        try { d = JSON.parse(text); } catch(_) { throw new Error('Resposta inválida'); }
        if (d.error || d.status === 'ERROR') throw new Error(d.message || d.error || 'CNPJ não encontrado');
        const razao    = d.razao_social || '—';
        const fantasia = d.estabelecimento?.nome_fantasia || '';
        const sit      = d.estabelecimento?.situacao_cadastral || '—';
        const sitCor   = sit.toLowerCase().includes('ativa') ? 'text-emerald-400' : 'text-red-400';
        const abertura = d.estabelecimento?.data_inicio_atividade || '—';
        const porte    = d.porte?.descricao || '—';
        const cnae     = d.estabelecimento?.atividade_principal?.descricao || '—';
        const sociosList = (d.socios || []).slice(0, 5).map(s =>
            `<li class="text-zinc-300">${s.nome} <span class="text-zinc-600 text-[10px]">(${s.qualificacao_socio?.descricao || 'Sócio'})</span></li>`
        ).join('');
        const end = d.estabelecimento ? [
            d.estabelecimento.logradouro,
            d.estabelecimento.numero,
            d.estabelecimento.bairro,
            d.estabelecimento.cidade?.nome,
            d.estabelecimento.estado?.sigla,
        ].filter(Boolean).join(', ') : '';
        body.innerHTML = `
            <h3 class="text-white font-black text-base mb-1 pr-6">${razao}</h3>
            ${fantasia ? `<p class="text-zinc-400 text-xs mb-3">Nome fantasia: ${fantasia}</p>` : ''}
            <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div class="bg-zinc-800/60 rounded-lg p-2"><div class="text-zinc-500 text-[10px] mb-0.5">Situação</div><div class="font-bold ${sitCor}">${sit}</div></div>
                <div class="bg-zinc-800/60 rounded-lg p-2"><div class="text-zinc-500 text-[10px] mb-0.5">Porte</div><div class="font-bold text-zinc-300">${porte}</div></div>
                <div class="bg-zinc-800/60 rounded-lg p-2"><div class="text-zinc-500 text-[10px] mb-0.5">Abertura</div><div class="font-bold text-zinc-300">${abertura}</div></div>
                <div class="bg-zinc-800/60 rounded-lg p-2"><div class="text-zinc-500 text-[10px] mb-0.5">CNPJ</div><div class="font-mono text-zinc-300">${cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5')}</div></div>
            </div>
            <div class="bg-zinc-800/40 rounded-lg p-2 mb-3 text-xs"><div class="text-zinc-500 text-[10px] mb-0.5">Atividade Principal</div><div class="text-zinc-300">${cnae}</div></div>
            ${end ? `<div class="bg-zinc-800/40 rounded-lg p-2 mb-3 text-xs"><div class="text-zinc-500 text-[10px] mb-0.5">Endereço</div><div class="text-zinc-300">${end}</div></div>` : ''}
            ${sociosList ? `<div class="bg-zinc-800/40 rounded-lg p-2 text-xs"><div class="text-zinc-500 text-[10px] mb-1">Quadro Societário</div><ul class="space-y-0.5">${sociosList}</ul></div>` : ''}
            <p class="text-zinc-600 text-[10px] mt-3">Fonte: Receita Federal via cnpj.ws</p>`;
    } catch(e) {
        body.innerHTML = `<p class="text-red-400 text-sm text-center py-4">Erro: ${e.message}</p>`;
    }
};

// ── Render lista de fornecedores (suporta sort + filtro) ──────────────────────
window._renderFornLista = function() {
    const lista = document.getElementById('mun-forn-lista');
    const count = document.getElementById('mun-forn-count');
    if (!lista || !window._munFornData) return;

    const q      = (document.getElementById('mun-forn-busca')?.value || '').toLowerCase().trim();
    const sortBy = window._fornSortBy || 'pago';
    const toNum  = v => parseFloat(String(v || 0).replace(',', '.')) || 0;
    const yr     = window._munFornYearUsed || window._munYear;

    // Atualiza destaque do botão de sort ativo
    ['pago','emp','pendente','nome'].forEach(s => {
        const btn = document.getElementById('forn-sort-' + s);
        if (btn) btn.className = `text-[10px] px-2 py-1 rounded font-bold ${s === sortBy ? 'bg-violet-700 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`;
    });

    let rows = window._munFornData;
    if (q) rows = rows.filter(d =>
        (d._nomeClean || '').toLowerCase().includes(q) ||
        (d.INSMF || '').includes(q)
    );

    rows = [...rows].sort((a, b) => {
        if (sortBy === 'nome') return (a._nomeClean || '').localeCompare(b._nomeClean || '');
        if (sortBy === 'emp')  return toNum(b.EMPENHADO) - toNum(a.EMPENHADO);
        if (sortBy === 'pendente') return (toNum(b.EMPENHADO) - toNum(b.PAGO)) - (toNum(a.EMPENHADO) - toNum(a.PAGO));
        return toNum(b.PAGO) - toNum(a.PAGO);
    }).slice(0, 100);

    const maxPago = Math.max(...rows.map(d => toNum(d.PAGO)), 1);
    const CNPJS_FOLHA = ['98671597000109','00000000000000','99999999999999'];
    const NOMES_FOLHA = ['DIVERSOS FUNCIONARIOS','FUNCIONARIOS','FOLHA DE PAGAMENTO','FOLHA PAGAMENTO','SERVIDORES MUNICIPAIS'];

    if (count) count.innerHTML = `${rows.length} fornecedor${rows.length !== 1 ? 'es' : ''} — ano <strong>${yr}</strong>`;

    if (!rows.length) {
        lista.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Nenhum fornecedor encontrado.</p>';
        return;
    }

    lista.innerHTML = rows.map((d, i) => {
        const nome    = d._nomeClean || '—';
        const cnpj    = (d.INSMF || '').replace(/[^\d]/g, '');
        const cnpjFmt = d.INSMF || '—';
        const cidade  = d.CEPCI ? d.CEPCI.trim() : '';
        const emp     = toNum(d.EMPENHADO);
        const liq     = toNum(d.LIQUIDADO);
        const pago    = toNum(d.PAGO);
        const pendente = emp - pago;
        const barPct  = maxPago > 0 ? Math.min((pago / maxPago) * 100, 100) : 0;
        const isPF    = cnpj.length === 11;
        const nomeEsc = nome.replace(/'/g, "\\'");
        const isFolha = CNPJS_FOLHA.includes(cnpj) || NOMES_FOLHA.some(n => nome.toUpperCase().includes(n));
        return `
        <div class="bg-zinc-900 border ${isFolha ? 'border-violet-800/60' : 'border-zinc-800'} rounded-xl p-3 hover:border-violet-700/50 transition">
            <div class="flex items-start gap-3">
                <span class="text-zinc-600 text-xs font-mono w-6 shrink-0 pt-0.5">${i+1}</span>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-bold text-white leading-tight">${nome}</div>
                            <div class="flex items-center gap-2 mt-1 flex-wrap">
                                <span class="text-[10px] ${isPF ? 'bg-blue-900/30 text-blue-400 border-blue-800/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700'} border px-2 py-0.5 rounded font-mono">${cnpjFmt}</span>
                                ${isFolha ? '<span class="text-[10px] bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded border border-violet-700/50 font-bold">👥 Folha de Pagamento</span>'
                                    : isPF ? '<span class="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-800/40">Pessoa Física</span>'
                                    : '<span class="text-[10px] bg-zinc-800/60 text-zinc-500 px-2 py-0.5 rounded">Empresa</span>'}
                                ${cidade ? `<span class="text-[10px] text-zinc-600">📍 ${cidade}</span>` : ''}
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-sm font-black text-emerald-400">${_brl(pago)}</div>
                            <div class="text-[10px] text-zinc-600">pago</div>
                        </div>
                    </div>
                    ${isFolha ? `
                    <div class="bg-violet-950/30 border border-violet-800/30 rounded-lg px-3 py-2 my-2 text-xs text-violet-300 leading-relaxed">
                        <strong class="text-violet-200">ℹ️ Isso não é uma empresa.</strong>
                        Registro contábil genérico para <strong class="text-white">salários dos servidores municipais</strong>.
                        O valor de <strong class="text-white">${_brl(pago)}</strong> é a <strong class="text-white">folha de pagamento de ${yr}</strong>.
                        Veja a aba <strong class="text-violet-200">👥 Servidores</strong> para detalhe individual.
                    </div>` : ''}
                    <div class="w-full bg-zinc-800 rounded-full h-1 my-2">
                        <div class="h-1 rounded-full ${isFolha ? 'bg-violet-500' : 'bg-emerald-500'}" style="width:${barPct.toFixed(0)}%"></div>
                    </div>
                    <div class="flex flex-wrap gap-3 text-[11px] text-zinc-500 mb-2">
                        <span>📋 Empenhado: <strong class="text-amber-400">${_brl(emp)}</strong></span>
                        <span>✅ Recebido: <strong class="text-blue-400">${_brl(liq)}</strong></span>
                        ${pendente > 0.5 ? `<span>⏳ Pendente: <strong class="text-zinc-300">${_brl(pendente)}</strong></span>` : ''}
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        ${!isFolha ? `<button onclick="munAba('empenhos'); window._carregarEmpenhos('${nomeEsc}')"
                                class="text-[10px] bg-violet-900/40 hover:bg-violet-700/60 border border-violet-800/50 text-violet-300 px-2 py-1 rounded transition font-bold">
                            📄 Ver contratos</button>` : `<button onclick="munAba('servidores')"
                                class="text-[10px] bg-violet-900/40 hover:bg-violet-700/60 border border-violet-800/50 text-violet-300 px-2 py-1 rounded transition font-bold">
                            👥 Ver Servidores</button>`}
                        ${!isFolha && cnpj.length === 14 ? `
                            <button onclick="window._consultarCNPJ('${cnpj}')"
                                    class="text-[10px] bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 text-blue-300 px-2 py-1 rounded transition font-bold">
                                🏢 Consultar CNPJ</button>
                            <button onclick="window.openSupplierRadar && window.openSupplierRadar('${cnpj}')"
                                    class="text-[10px] bg-red-900/40 hover:bg-red-700/60 border border-red-800/50 text-red-400 px-2 py-1 rounded transition font-bold">
                                🚨 Investigar</button>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
};

// ── 3. Contratos ─────────────────────────────────────────────────────────────
async function _carregarContratos() {
    const sec = document.getElementById('mun-sec-contratos');
    if (!sec) return;
    sec.innerHTML = '<div class="text-zinc-500 text-center py-6 animate-pulse">Carregando contratos...</div>';

    try {
        const mkPathCont = yr => `VersaoJson/LicitacoesEContratos/?Listagem=Contratos&Exercicio=${yr}&Empresa=1&MostraDadosConsolidado=False&ContratosApenasPublicados=False`;
        let data;
        let yearUsed = parseInt(window._munYear);
        try { data = await _fiorilliCall(window._munBaseUrl, mkPathCont(yearUsed)); } catch(_) { data = []; }
        if (!Array.isArray(data) || !data.length) {
            yearUsed = parseInt(window._munYear) - 1;
            sec.innerHTML = `<div class="text-zinc-500 text-xs text-center py-2 animate-pulse">Sem dados em ${window._munYear}, buscando ${yearUsed}...</div>`;
            data = await _fiorilliCall(window._munBaseUrl, mkPathCont(yearUsed));
        }

        if (!Array.isArray(data) || !data.length) {
            sec.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Sem contratos para este ano.</p>';
            return;
        }

        const toNum = v => parseFloat(String(v || 0).replace(',', '.')) || 0;
        const fallbackNotice = yearUsed !== parseInt(window._munYear)
            ? `<div class="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 mb-4 text-xs text-amber-300">
                ⚠️ <strong>Exibindo dados de ${yearUsed}</strong> — o portal não retornou dados para ${window._munYear}.
               </div>` : '';

        let totalVal = 0, totalEmp = 0, totalLiq = 0, totalAdit = 0;
        let semLicCount = 0, vencidoCount = 0;
        const hoje = new Date();

        data.forEach(d => {
            totalVal  += toNum(d.VALCON);
            totalEmp  += toNum(d.EMPENHADO);
            totalLiq  += toNum(d.LIQUIDADO);
            totalAdit += toNum(d.ADITADO);
            if (['DISPENSA','INEXIGIBILIDADE'].some(x => (d.MODALI||'').toUpperCase().includes(x))) semLicCount++;
            const venc = d.VIGENF ? new Date(d.VIGENF.split(' ')[0].split('/').reverse().join('-')) : null;
            if (venc && venc < hoje) vencidoCount++;
        });

        window._munContData = data;
        window._munContYearUsed = yearUsed;

        sec.innerHTML = `
            ${fallbackNotice}
            <div class="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4 mb-4 text-xs text-zinc-400 leading-relaxed">
                <div class="font-black text-white text-sm mb-2">📄 O que são os Contratos?</div>
                <p class="mb-3">Um contrato é o <strong class="text-white">documento legal</strong> que formaliza a compra de um produto ou a contratação de um serviço pela prefeitura. Todo contrato deve ter origem em uma licitação, salvo exceções previstas em lei.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div class="bg-zinc-800/50 rounded-lg p-2 border border-emerald-800/30">
                        <div class="text-emerald-400 font-bold mb-1">✅ Com Licitação (normal)</div>
                        <p>A prefeitura abriu concorrência pública. Empresas disputaram e a vencedora foi contratada. Isso é o procedimento correto e mais transparente.</p>
                    </div>
                    <div class="bg-zinc-800/50 rounded-lg p-2 border border-amber-800/40">
                        <div class="text-amber-400 font-bold mb-1">⚠️ Sem Licitação (atenção)</div>
                        <p><strong>Dispensa:</strong> permitida por lei para valores baixos ou urgência. <strong>Inexigibilidade:</strong> quando há fornecedor único no mercado. Ambas precisam de justificativa — verifique a "Base Legal".</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    <div class="bg-zinc-800/50 rounded-lg p-2">
                        <div class="text-zinc-300 font-bold mb-1">📋 Empenhado</div>
                        <p>Valor reservado no orçamento para este contrato.</p>
                    </div>
                    <div class="bg-zinc-800/50 rounded-lg p-2">
                        <div class="text-blue-400 font-bold mb-1">✅ Liquidado</div>
                        <p>Produto/serviço já entregue e aprovado pela prefeitura.</p>
                    </div>
                    <div class="bg-zinc-800/50 rounded-lg p-2">
                        <div class="text-zinc-300 font-bold mb-1">➕ Aditamento</div>
                        <p>Acréscimo ao valor ou prazo original. Aditamentos excessivos merecem atenção.</p>
                    </div>
                </div>
                <div class="mt-3 border-t border-zinc-700 pt-3">
                    <div class="flex items-start gap-3 bg-blue-950/30 border border-blue-700/40 rounded-xl p-3">
                        <span class="text-2xl shrink-0">📅</span>
                        <div>
                            <div class="text-blue-300 font-black text-xs mb-1">O QUE O FILTRO DE ANO REALMENTE SIGNIFICA AQUI</div>
                            <p class="text-zinc-300 text-xs mb-2">
                                Ao selecionar <strong class="text-white">${yearUsed}</strong>, você está vendo os contratos que foram
                                <strong class="text-blue-300">cadastrados no sistema nesse exercício fiscal</strong> — ou seja, contratos novos assinados em ${yearUsed}.
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                <div class="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-2 text-xs">
                                    <div class="text-emerald-400 font-bold mb-0.5">✅ O que aparece</div>
                                    <p class="text-zinc-400">Contratos <strong class="text-white">firmados em ${yearUsed}</strong>, independentemente de quando terminam.</p>
                                </div>
                                <div class="bg-red-950/30 border border-red-800/30 rounded-lg p-2 text-xs">
                                    <div class="text-red-400 font-bold mb-0.5">❌ O que NÃO aparece</div>
                                    <p class="text-zinc-400">Contratos de <strong class="text-white">anos anteriores</strong> que ainda estão em vigor e gerando pagamentos em ${yearUsed}.</p>
                                </div>
                            </div>
                            <p class="text-zinc-500 text-xs">
                                <strong class="text-zinc-400">Exemplo prático:</strong> Um contrato de limpeza urbana assinado em 2021 com vigência de 5 anos
                                <strong class="text-white">não aparece</strong> ao filtrar 2024 — ele só aparece ao selecionar 2021.
                                Para ver contratos antigos ainda ativos, consulte cada ano anterior e observe os campos <span class="text-zinc-300">"Vigência"</span> e <span class="text-red-400">"Vencido"</span>.
                                Esta é uma limitação da API do portal municipal (Fiorilli), não desta ferramenta.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex gap-3 mb-5 flex-wrap">
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-700 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total de Contratos</div>
                    <div class="text-lg font-black text-white">${data.length.toLocaleString('pt-BR')}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-emerald-800/40 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Valor Total</div>
                    <div class="text-base font-black text-emerald-400">${_brl(totalVal)}</div>
                </div>
                ${totalAdit > 0 ? `
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-blue-800/40 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total Aditado</div>
                    <div class="text-base font-black text-blue-400">${_brl(totalAdit)}</div>
                    <div class="text-[10px] text-zinc-600">acréscimos ao valor original</div>
                </div>` : ''}
                ${semLicCount > 0 ? `
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-amber-800/50 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">⚠️ Sem Licitação</div>
                    <div class="text-base font-black text-amber-400">${semLicCount}</div>
                    <div class="text-[10px] text-zinc-600">dispensa / inexigibilidade</div>
                </div>` : ''}
                ${vencidoCount > 0 ? `
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-red-800/50 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">⏰ Vencidos</div>
                    <div class="text-base font-black text-red-400">${vencidoCount}</div>
                    <div class="text-[10px] text-zinc-600">vigência encerrada</div>
                </div>` : ''}
            </div>
            <!-- controles -->
            <div class="flex flex-wrap gap-2 mb-3 items-center">
                <input type="text" id="mun-cont-busca" placeholder="🔍 Filtrar por objeto, fornecedor ou CNPJ..."
                       oninput="window._renderContLista()"
                       class="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-violet-500">
                <button onclick="window._exportCSV((window._munContData||[]).map(d=>({Contrato:d.CODIGO||'',Objeto:d.OBJETO||'',Fornecedor:d.FORNECEDOR||'',CNPJ:d.INSMF||'',Valor:d.VALCON||0,Empenhado:d.EMPENHADO||0,Modalidade:d.MODALI||'',Assinado:d.DTASSI||'',VigenciaFim:d.VIGENF||''})),'contratos_${yearUsed}')"
                        class="text-[10px] bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/40 text-emerald-400 px-3 py-1.5 rounded-xl font-bold transition">
                    ⬇️ CSV
                </button>
            </div>
            <p class="text-zinc-600 text-[10px] mb-2" id="mun-cont-count">${data.length} contratos — ano ${yearUsed}</p>
            <div id="mun-cont-lista" class="space-y-3"></div>`;

        window._renderContLista();
    } catch (e) {
        sec.innerHTML = `<p class="text-red-500 text-sm text-center py-6">Erro: ${e.message}</p>`;
    }
}

window._renderContLista = function() {
    const lista = document.getElementById('mun-cont-lista');
    const count = document.getElementById('mun-cont-count');
    if (!lista || !window._munContData) return;
    const q = (document.getElementById('mun-cont-busca')?.value || '').toLowerCase().trim();
    const toNum = v => parseFloat(String(v || 0).replace(',', '.')) || 0;
    const hoje = new Date();
    const yr = window._munContYearUsed || window._munYear;

    let rows = window._munContData;
    if (q) rows = rows.filter(d =>
        (d.OBJETO_COMPLETO || d.OBJETO || '').toLowerCase().includes(q) ||
        (d.FORNECEDOR || '').toLowerCase().includes(q) ||
        (d.INSMF || '').includes(q)
    );
    rows = [...rows].sort((a, b) => toNum(b.VALCON) - toNum(a.VALCON));
    if (count) count.textContent = `${rows.length} contrato${rows.length !== 1 ? 's' : ''} — ano ${yr}`;
    if (!rows.length) { lista.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Nenhum contrato encontrado.</p>'; return; }

    lista.innerHTML = rows.map(d => {
                const val      = toNum(d.VALCON);
                const emp      = toNum(d.EMPENHADO);
                const liq      = toNum(d.LIQUIDADO);
                const adit     = toNum(d.ADITADO);
                const saldoEmp = toNum(d.SALDOEMPENHAR);
                const forn     = d.FORNECEDOR || '—';
                const cnpj     = (d.INSMF || '').replace(/[^\d]/g, '');
                const cnpjFmt  = d.INSMF || '';
                const objFull  = (d.OBJETO_COMPLETO || d.OBJETO || '—').trim().replace(/\r\n|\n/g, ' ');
                const objCurto = d.OBJETO || '';
                const modal    = d.MODALI || d.LICIT || '';
                const fundLegal = d.FUNDLEGAL || '';
                const num      = d.CODIGO || '';
                const contNum  = d.CONTRATONUM || '';
                const dtAssi   = (d.DTASSI || '').split(' ')[0];
                const vigIni   = (d.VIGENI || '').split(' ')[0];
                const vigFim   = (d.VIGENF || '').split(' ')[0];
                const vencAtual = (d.VENCIMENTO_ATUAL || '').split(' ')[0];
                const dtAnula  = (d.DTANULA || '').split(' ')[0];
                const respon   = d.RESPON || '';
                const gestor   = d.CODLO_GESTORNOME || '';
                const multa    = d.MULTA_RESCISORIA || '';
                const garant   = d.GARANT || '';
                const semLic   = ['DISPENSA','INEXIGIBILIDADE'].some(x => modal.toUpperCase().includes(x));
                const vencFimDate = vigFim ? new Date(vigFim.split('/').reverse().join('-')) : null;
                const isVencido  = vencFimDate && vencFimDate < hoje;
                const isAnulado  = !!dtAnula;
                return `
                <div class="bg-zinc-900 border ${isAnulado ? 'border-red-900/50' : semLic ? 'border-amber-800/50' : isVencido ? 'border-red-800/30' : 'border-zinc-800'} rounded-2xl p-4 hover:border-violet-700/40 transition">
                    <!-- Cabeçalho -->
                    <div class="flex items-start justify-between gap-3 mb-3">
                        <div class="flex items-center gap-2 flex-wrap">
                            ${semLic ? `<span class="text-[10px] font-black bg-amber-900/40 text-amber-400 px-2 py-1 rounded-lg border border-amber-800/50">⚠️ SEM LICITAÇÃO</span>` : ''}
                            ${isAnulado ? `<span class="text-[10px] font-black bg-red-900/40 text-red-400 px-2 py-1 rounded-lg border border-red-800/50">❌ ANULADO</span>` : ''}
                            ${isVencido && !isAnulado ? `<span class="text-[10px] font-bold bg-red-900/20 text-red-400 px-2 py-0.5 rounded border border-red-800/30">⏰ Vencido</span>` : ''}
                            ${modal ? `<span class="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">${modal}</span>` : ''}
                            ${num ? `<span class="text-[10px] font-mono text-zinc-600">Contrato ${num}</span>` : ''}
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-base font-black text-emerald-400">${_brl(val)}</div>
                            ${adit > 0 ? `<div class="text-[10px] text-blue-400">+${_brl(adit)} aditado</div>` : ''}
                        </div>
                    </div>
                    <!-- Objeto -->
                    ${objCurto ? `<p class="text-[11px] font-bold text-violet-300 uppercase tracking-wide mb-1">${objCurto}</p>` : ''}
                    <p class="text-sm text-white leading-snug mb-3">${objFull.substring(0,500)}${objFull.length>500?'…':''}</p>
                    <!-- Fornecedor -->
                    <div class="bg-zinc-950/60 rounded-xl p-3 mb-3">
                        <div class="text-[10px] text-zinc-500 uppercase mb-1">Fornecedor / Contratado</div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-sm font-bold text-white">${forn}</span>
                            ${cnpjFmt ? `<span class="text-[10px] font-mono text-zinc-500">${cnpjFmt}</span>` : ''}
                            ${cnpj.length===14 ? `<button onclick="window.openSupplierRadar && window.openSupplierRadar('${cnpj}')" class="text-[10px] bg-red-900/40 hover:bg-red-700/50 border border-red-800/50 text-red-400 px-2 py-0.5 rounded transition font-bold">🚨 Investigar</button>` : ''}
                        </div>
                    </div>
                    <!-- Datas e execução -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-[11px]">
                        ${dtAssi ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Assinado em</div><div class="text-zinc-300 font-bold">${dtAssi}</div></div>` : ''}
                        ${vigIni ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Início da vigência</div><div class="text-zinc-300 font-bold">${vigIni}</div></div>` : ''}
                        ${vigFim ? `<div class="bg-zinc-800/40 rounded-lg p-2 ${isVencido ? 'border border-red-800/40' : ''}"><div class="text-zinc-600 text-[10px]">Fim da vigência</div><div class="${isVencido ? 'text-red-400' : 'text-zinc-300'} font-bold">${vigFim}${isVencido?' ⏰':''}</div></div>` : ''}
                        ${emp > 0 ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Empenhado</div><div class="text-amber-400 font-bold">${_brl(emp)}</div></div>` : ''}
                        ${liq > 0 ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Liquidado</div><div class="text-blue-400 font-bold">${_brl(liq)}</div></div>` : ''}
                        ${saldoEmp > 0 ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Saldo a empenhar</div><div class="text-zinc-300 font-bold">${_brl(saldoEmp)}</div></div>` : ''}
                        ${respon ? `<div class="bg-zinc-800/40 rounded-lg p-2 col-span-2"><div class="text-zinc-600 text-[10px]">Responsável</div><div class="text-zinc-300 font-bold">${respon}</div></div>` : ''}
                        ${gestor ? `<div class="bg-zinc-800/40 rounded-lg p-2 col-span-2"><div class="text-zinc-600 text-[10px]">Gestor do contrato</div><div class="text-zinc-300 font-bold">${gestor}</div></div>` : ''}
                    </div>
                    ${semLic && fundLegal ? `
                    <div class="bg-amber-950/30 border border-amber-800/30 rounded-xl p-3 text-[11px]">
                        <div class="text-amber-500 font-bold mb-1">⚖️ Base Legal para contratação sem licitação:</div>
                        <div class="text-amber-300">${fundLegal}</div>
                    </div>` : ''}
                    ${dtAnula ? `<div class="bg-red-950/30 border border-red-800/30 rounded-xl p-2 mt-2 text-[11px] text-red-400">❌ Contrato anulado em ${dtAnula}${d.TIPOANU ? ' — ' + d.TIPOANU : ''}</div>` : ''}
                </div>`;
    }).join('');
};

// ── 4. Licitações ────────────────────────────────────────────────────────────
async function _carregarLicitacoes() {
    const sec = document.getElementById('mun-sec-licitacoes');
    if (!sec) return;
    sec.innerHTML = '<div class="text-zinc-500 text-center py-6 animate-pulse">Carregando licitações...</div>';

    try {
        const mkPathLic = yr => `VersaoJson/LicitacoesEContratos/?Listagem=Licitacoes&Exercicio=${yr}&Empresa=1&MostraDadosConsolidado=False`;
        let data;
        let yearUsed = parseInt(window._munYear);
        try { data = await _fiorilliCall(window._munBaseUrl, mkPathLic(yearUsed)); } catch(_) { data = []; }
        if (!Array.isArray(data) || !data.length) {
            yearUsed = parseInt(window._munYear) - 1;
            sec.innerHTML = `<div class="text-zinc-500 text-xs text-center py-2 animate-pulse">Sem dados em ${window._munYear}, buscando ${yearUsed}...</div>`;
            data = await _fiorilliCall(window._munBaseUrl, mkPathLic(yearUsed));
        }

        if (!Array.isArray(data) || !data.length) {
            sec.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Sem licitações para este ano.</p>';
            return;
        }

        const toNum = v => parseFloat(String(v || 0).replace(',', '.')) || 0;
        const fallbackNotice = yearUsed !== parseInt(window._munYear)
            ? `<div class="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 mb-4 text-xs text-amber-300">
                ⚠️ <strong>Exibindo dados de ${yearUsed}</strong> — o portal não retornou dados para ${window._munYear}.
               </div>` : '';

        window._munLicData = data;
        window._munLicYearUsed = yearUsed;

        // Agrupa por tipo
        const grupos = {};
        let totalGeral = 0;
        data.forEach(d => {
            const tipo = d.LICIT || 'OUTROS';
            if (!grupos[tipo]) grupos[tipo] = { count: 0, total: 0 };
            grupos[tipo].count++;
            grupos[tipo].total += toNum(d.VALOR);
            totalGeral += toNum(d.VALOR);
        });

        const semLicTotal = (grupos['DISPENSA']?.count || 0) + (grupos['INEXIGIBILIDADE']?.count || 0);
        const semLicVal   = (grupos['DISPENSA']?.total  || 0) + (grupos['INEXIGIBILIDADE']?.total  || 0);

        // Ordena: mais recente primeiro
        const sorted = [...data].sort((a, b) => {
            const da = a.DATAE ? new Date(a.DATAE.split('/').reverse().join('-').replace(' 00:00:00','')) : new Date(0);
            const db = b.DATAE ? new Date(b.DATAE.split('/').reverse().join('-').replace(' 00:00:00','')) : new Date(0);
            return db - da;
        });

        const tipoInfo = tipo => {
            const t = tipo.toUpperCase();
            if (t.includes('INEXIGIBILIDADE')) return {cor:'amber', label:'INEXIGIBILIDADE', desc:'Único fornecedor no mercado — deve ter justificativa técnica'};
            if (t.includes('DISPENSA'))        return {cor:'amber', label:'DISPENSA', desc:'Contratação direta permitida por lei — verifique o valor e a justificativa'};
            if (t.includes('PREGÃO'))          return {cor:'blue',  label:'PREGÃO', desc:'Modalidade mais transparente — disputa pública com menor preço'};
            if (t.includes('CONCORRÊNCIA'))    return {cor:'green', label:'CONCORRÊNCIA', desc:'Licitação para grandes valores'};
            if (t.includes('TOMADA'))          return {cor:'green', label:'TOMADA DE PREÇOS', desc:'Licitação para médios valores'};
            if (t.includes('CONVITE'))         return {cor:'violet',label:'CONVITE', desc:'Licitação simplificada para pequenos valores'};
            return {cor:'zinc', label:tipo, desc:''};
        };

        sec.innerHTML = `
            ${fallbackNotice}
            <div class="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4 mb-4 text-xs text-zinc-400 leading-relaxed">
                <div class="font-black text-white text-sm mb-2">📋 O que é uma Licitação?</div>
                <p class="mb-3">Antes de gastar dinheiro público, a prefeitura é <strong class="text-white">obrigada por lei</strong> a abrir uma concorrência pública (licitação) para que diferentes empresas apresentem propostas. Isso garante o menor preço e evita favorecimentos.</p>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    <div class="bg-blue-950/30 rounded-lg p-2 border border-blue-800/30">
                        <div class="text-blue-400 font-bold mb-1">🏆 Pregão</div>
                        <p>Modalidade mais <strong>transparente e comum</strong>. Disputa aberta pelo menor preço. Pode ser presencial ou eletrônico (online).</p>
                    </div>
                    <div class="bg-green-950/30 rounded-lg p-2 border border-green-800/30">
                        <div class="text-green-400 font-bold mb-1">🏛️ Concorrência</div>
                        <p>Para contratos de <strong>grande valor</strong>. Processo mais detalhado e rigoroso.</p>
                    </div>
                    <div class="bg-green-950/20 rounded-lg p-2 border border-green-800/20">
                        <div class="text-green-400 font-bold mb-1">📊 Tomada de Preços</div>
                        <p>Para <strong>valores médios</strong>. Empresas previamente cadastradas participam.</p>
                    </div>
                    <div class="bg-violet-950/20 rounded-lg p-2 border border-violet-800/30">
                        <div class="text-violet-400 font-bold mb-1">✉️ Convite</div>
                        <p>Para <strong>pequenos valores</strong>. A prefeitura convida ao menos 3 empresas.</p>
                    </div>
                    <div class="bg-amber-950/30 rounded-lg p-2 border border-amber-800/40 col-span-2">
                        <div class="text-amber-400 font-bold mb-1">⚠️ Dispensa e Inexigibilidade</div>
                        <p><strong>Contratação direta sem concorrência.</strong> Dispensa: valores baixos ou emergência. Inexigibilidade: fornecedor único. <strong>Devem ter justificativa legal</strong> — verifique a "Base Legal" de cada uma.</p>
                    </div>
                </div>
                <div class="mt-3 border-t border-zinc-700 pt-3">
                    <div class="flex items-start gap-3 bg-blue-950/30 border border-blue-700/40 rounded-xl p-3">
                        <span class="text-2xl shrink-0">📅</span>
                        <div>
                            <div class="text-blue-300 font-black text-xs mb-1">O QUE O FILTRO DE ANO REALMENTE SIGNIFICA AQUI</div>
                            <p class="text-zinc-300 text-xs mb-2">
                                Ao selecionar <strong class="text-white">${yearUsed}</strong>, você está vendo as licitações cujo processo foi
                                <strong class="text-blue-300">aberto nesse exercício fiscal</strong> — ou seja, concorrências iniciadas em ${yearUsed}.
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                <div class="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-2 text-xs">
                                    <div class="text-emerald-400 font-bold mb-0.5">✅ O que aparece</div>
                                    <p class="text-zinc-400">Processos licitatórios <strong class="text-white">abertos em ${yearUsed}</strong>, mesmo que o contrato resultante ainda esteja em vigor hoje.</p>
                                </div>
                                <div class="bg-red-950/30 border border-red-800/30 rounded-lg p-2 text-xs">
                                    <div class="text-red-400 font-bold mb-0.5">❌ O que NÃO aparece</div>
                                    <p class="text-zinc-400">Licitações de <strong class="text-white">anos anteriores</strong> que resultaram em contratos sendo executados e pagos em ${yearUsed}.</p>
                                </div>
                            </div>
                            <p class="text-zinc-500 text-xs">
                                <strong class="text-zinc-400">Exemplo prático:</strong> Um pregão aberto em 2022 para fornecimento de merenda escolar por 3 anos
                                <strong class="text-white">não aparece</strong> ao filtrar 2024 — ele só aparece ao selecionar 2022.
                                Para rastrear gastos <em>efetivamente pagos</em> em ${yearUsed} por fornecedor, consulte a aba
                                <strong class="text-violet-400">🏭 Fornecedores</strong> — lá os valores refletem o que foi pago no ano selecionado.
                                Esta é uma limitação da API do portal municipal (Fiorilli), não desta ferramenta.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Resumo por tipo -->
            <div class="flex flex-wrap gap-2 mb-5">
            ${Object.entries(grupos)
                .sort(([,a],[,b]) => b.total - a.total)
                .map(([tipo, g]) => {
                    const info = tipoInfo(tipo);
                    const pct  = totalGeral > 0 ? ((g.total/totalGeral)*100).toFixed(0) : 0;
                    return `
                    <div class="bg-zinc-900 border border-${info.cor}-800/40 rounded-xl px-3 py-2 flex-1 min-w-[130px]">
                        <div class="text-[10px] font-bold text-${info.cor}-400">${info.label}</div>
                        <div class="text-base font-black text-white">${g.count} <span class="text-xs font-normal text-zinc-500">processos</span></div>
                        <div class="text-sm text-${info.cor}-400 font-bold">${_brl(g.total)}</div>
                        <div class="text-[10px] text-zinc-600">${pct}% do total</div>
                    </div>`;
                }).join('')}
            </div>
            ${semLicTotal > 0 ? `
            <div class="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 mb-5">
                <div class="text-amber-400 font-black text-sm mb-1">⚠️ Atenção: ${semLicTotal} contratações sem licitação</div>
                <p class="text-amber-300/80 text-xs">Total de <strong>${_brl(semLicVal)}</strong> contratados diretamente sem concorrência (Dispensa + Inexigibilidade).
                Isso é legal quando justificado, mas merece fiscalização. Verifique a base legal de cada uma abaixo.</p>
            </div>` : ''}
            <!-- controles -->
            <div class="flex flex-wrap gap-2 mb-3 items-center">
                <input type="text" id="mun-lic-busca" placeholder="🔍 Filtrar por objeto, empresa ou processo..."
                       oninput="window._renderLicLista()"
                       class="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-violet-500">
                <button onclick="window._exportCSV((window._munLicData||[]).map(d=>({Processo:d.PROCLIC||'',Numero:d.NUMERO||'',Modalidade:d.LICIT||'',Objeto:d.DISCR||'',Valor:d.VALOR||0,Situacao:d.SITUACAO||'',Abertura:d.DATAE||'',Vencedor:d.NOMEEMPRESA||''})),'licitacoes_${yearUsed}')"
                        class="text-[10px] bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/40 text-emerald-400 px-3 py-1.5 rounded-xl font-bold transition">
                    ⬇️ CSV
                </button>
            </div>
            <p class="text-zinc-600 text-[10px] mb-2" id="mun-lic-count">${data.length} licitações — ano ${yearUsed}</p>
            <div id="mun-lic-lista" class="space-y-3"></div>`;

        window._renderLicLista();
    } catch (e) {
        sec.innerHTML = `<p class="text-red-500 text-sm text-center py-6">Erro: ${e.message}</p>`;
    }
}

window._renderLicLista = function() {
    const lista = document.getElementById('mun-lic-lista');
    const count = document.getElementById('mun-lic-count');
    if (!lista || !window._munLicData) return;
    const q = (document.getElementById('mun-lic-busca')?.value || '').toLowerCase().trim();
    const toNum = v => parseFloat(String(v || 0).replace(',', '.')) || 0;
    const yr = window._munLicYearUsed || window._munYear;
    const tipoInfo = tipo => {
        const t = tipo.toUpperCase();
        if (t.includes('INEXIGIBILIDADE')) return {cor:'amber', label:'INEXIGIBILIDADE'};
        if (t.includes('DISPENSA'))        return {cor:'amber', label:'DISPENSA'};
        if (t.includes('PREGÃO'))          return {cor:'blue',  label:'PREGÃO'};
        if (t.includes('CONCORRÊNCIA'))    return {cor:'green', label:'CONCORRÊNCIA'};
        if (t.includes('TOMADA'))          return {cor:'green', label:'TOMADA DE PREÇOS'};
        if (t.includes('CONVITE'))         return {cor:'violet',label:'CONVITE'};
        return {cor:'zinc', label:tipo};
    };

    let rows = window._munLicData;
    if (q) rows = rows.filter(d =>
        (d.DISCR || '').toLowerCase().includes(q) ||
        (d.NOMEEMPRESA || '').toLowerCase().includes(q) ||
        (d.PROCLIC || '').toLowerCase().includes(q) ||
        (d.NUMERO || '').toLowerCase().includes(q)
    );
    rows = [...rows].sort((a, b) => {
        const da = a.DATAE ? new Date(a.DATAE.split('/').reverse().join('-').replace(' 00:00:00','')) : new Date(0);
        const db = b.DATAE ? new Date(b.DATAE.split('/').reverse().join('-').replace(' 00:00:00','')) : new Date(0);
        return db - da;
    });
    if (count) count.textContent = `${rows.length} licitação${rows.length !== 1 ? 'ões' : ''} — ano ${yr}`;
    if (!rows.length) { lista.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Nenhuma licitação encontrada.</p>'; return; }

    lista.innerHTML = rows.map(d => {
                const tipo    = d.LICIT || '—';
                const info    = tipoInfo(tipo);
                const val     = toNum(d.VALOR);
                const obj     = d.DISCR || '—';
                const proc    = d.PROCLIC || d.PROCLICITACAO || '';
                const num     = d.NUMERO || d.NLICITACAO || '';
                const dtAber  = (d.DATAE || '').split(' ')[0];
                const dtEnc   = (d.DTENC || '').split(' ')[0];
                const sit     = (d.SITUACAO || '').trim();
                const venc    = d.NOMEEMPRESA && d.NOMEEMPRESA !== 'Para consultar clique duas vezes na linha deste registro' ? d.NOMEEMPRESA : '';
                const artigo  = d.ARTIGO_INCISO && d.ARTIGO_INCISO !== 'Para consultar clique duas vezes na linha deste registro' ? d.ARTIGO_INCISO : '';
                const regPreco = d.REGISTROPRECO === 'S';
                const sigiloso = d.ORCAMENTO_SIGILOSO === 'S';
                const semLic  = ['DISPENSA','INEXIGIBILIDADE'].some(x => tipo.toUpperCase().includes(x));
                const sitCor  = sit.toLowerCase().includes('homolog') ? 'text-emerald-400'
                               : sit.toLowerCase().includes('cancel') || sit.toLowerCase().includes('anul') ? 'text-red-400'
                               : sit.toLowerCase().includes('andamento') || sit.toLowerCase().includes('aberta') ? 'text-blue-400'
                               : 'text-zinc-400';
                return `
                <div class="bg-zinc-900 border ${semLic ? 'border-amber-800/40' : 'border-zinc-800'} rounded-2xl p-4 hover:border-violet-700/40 transition">
                    <div class="flex items-start justify-between gap-3 mb-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-[10px] font-black bg-${info.cor}-900/40 text-${info.cor}-400 px-2 py-1 rounded-lg border border-${info.cor}-800/40">${info.label}</span>
                            ${regPreco ? '<span class="text-[10px] font-bold bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">📋 Registro de Preço</span>' : ''}
                            ${sigiloso ? '<span class="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">🔒 Orçamento Sigiloso</span>' : ''}
                            ${sit ? `<span class="text-[10px] font-bold ${sitCor}">${sit}</span>` : ''}
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-base font-black text-emerald-400">${_brl(val)}</div>
                            <div class="text-[10px] text-zinc-600">valor estimado</div>
                        </div>
                    </div>
                    <p class="text-sm font-bold text-white mb-2">${obj}</p>
                    ${info.desc && semLic ? `<p class="text-[11px] text-amber-300/70 mb-2">ℹ️ ${info.desc}</p>` : ''}
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] mb-2">
                        ${proc ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Processo</div><div class="text-zinc-300 font-bold">${proc}</div></div>` : ''}
                        ${num  ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Nº Licitação</div><div class="text-zinc-300 font-bold">${num}</div></div>` : ''}
                        ${dtAber ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Abertura</div><div class="text-zinc-300 font-bold">${dtAber}</div></div>` : ''}
                        ${dtEnc  ? `<div class="bg-zinc-800/40 rounded-lg p-2"><div class="text-zinc-600 text-[10px]">Encerramento</div><div class="text-zinc-300 font-bold">${dtEnc}</div></div>` : ''}
                        ${venc   ? `<div class="bg-zinc-800/40 rounded-lg p-2 col-span-2"><div class="text-zinc-600 text-[10px]">Empresa Vencedora / Contratada</div><div class="text-white font-bold">${venc}</div></div>` : ''}
                    </div>
                    ${artigo ? `
                    <div class="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 text-[11px]">
                        <div class="text-amber-500 font-bold mb-0.5">⚖️ Base Legal:</div>
                        <div class="text-amber-300/80">${artigo}</div>
                    </div>` : ''}
                </div>`;
    }).join('');
};

// ── 5. Receitas ───────────────────────────────────────────────────────────────
async function _carregarReceitas() {
    const sec = document.getElementById('mun-sec-receitas');
    if (!sec) return;
    sec.innerHTML = '<div class="text-zinc-500 text-center py-6 animate-pulse">Carregando receitas...</div>';

    try {
        const path = `VersaoJson/Receitas/?Listagem=ReceitaOrcamentaria&DiaInicioPeriodo=01&MesInicialPeriodo=01&DiaFinalPeriodo=31&MesFinalPeriodo=12&Exercicio=${window._munYear}&Empresa=1&MostraDadosConsolidado=False`;
        const data = await _fiorilliCall(window._munBaseUrl, path);

        if (!Array.isArray(data) || !data.length) {
            sec.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Sem dados de receita.</p>';
            return;
        }

        window._munRecData = data;
        let totalPrev = 0, totalArr = 0;
        data.forEach(d => {
            totalPrev += parseFloat(String(d.PREVISAO_ATUALIZADA||0).replace(',','.')) || 0;
            totalArr  += parseFloat(String(d.ARRECADADO_TOTAL||0).replace(',','.')) || 0;
        });

        const top = [...data]
            .filter(d => parseFloat(String(d.ARRECADADO_TOTAL||0).replace(',','.')) > 0)
            .sort((a, b) =>
                (parseFloat(String(b.ARRECADADO_TOTAL||0).replace(',','.')) || 0) -
                (parseFloat(String(a.ARRECADADO_TOTAL||0).replace(',','.')) || 0)
            ).slice(0, 30);

        sec.innerHTML = `
            <div class="flex justify-end mb-2">
                <button onclick="window._exportCSV((window._munRecData||[]).map(d=>({Nome:d.NOME||'',Previsto:d.PREVISAO_ATUALIZADA||0,Arrecadado:d.ARRECADADO_TOTAL||0})),'receitas_${window._munYear}')"
                        class="text-[10px] bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/40 text-emerald-400 px-3 py-1.5 rounded-xl font-bold transition">
                    ⬇️ CSV
                </button>
            </div>
            <div class="flex gap-4 mb-4 flex-wrap">
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-700 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Receita Prevista</div>
                    <div class="text-lg font-black text-white">${_brl(totalPrev)}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-emerald-800/50 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total Arrecadado</div>
                    <div class="text-lg font-black text-emerald-400">${_brl(totalArr)}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-700 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">% Arrecadado</div>
                    <div class="text-lg font-black text-amber-400">${_pct(totalArr, totalPrev)}</div>
                </div>
            </div>
            <div class="space-y-2">
            ${top.map(d => {
                const prev = parseFloat(String(d.PREVISAO_ATUALIZADA||0).replace(',','.')) || 0;
                const arr  = parseFloat(String(d.ARRECADADO_TOTAL||0).replace(',','.')) || 0;
                const pctN = prev > 0 ? Math.min((arr / prev) * 100, 100) : 0;
                return `
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <div class="flex justify-between items-start gap-2 mb-1">
                        <span class="text-sm font-bold text-white leading-tight">${d.NOME || '—'}</span>
                        <span class="text-sm font-black text-emerald-400 shrink-0">${_brl(arr)}</span>
                    </div>
                    <div class="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Previsto: ${_brl(prev)}</span>
                        <span>${pctN.toFixed(0)}% arrecadado</span>
                    </div>
                    <div class="w-full bg-zinc-800 rounded-full h-1.5">
                        <div class="h-1.5 rounded-full ${pctN > 100 ? 'bg-amber-400' : 'bg-emerald-500'}" style="width:${Math.min(pctN,100)}%"></div>
                    </div>
                </div>`;
            }).join('')}
            </div>`;
    } catch (e) {
        sec.innerHTML = `<p class="text-red-500 text-sm text-center py-6">Erro: ${e.message}</p>`;
    }
}

// ── 6. Servidores ─────────────────────────────────────────────────────────────
async function _carregarServidores() {
    const sec = document.getElementById('mun-sec-servidores');
    if (!sec) return;
    sec.innerHTML = '<div class="text-zinc-500 text-center py-6 animate-pulse">Carregando servidores...</div>';

    try {
        const mes   = String(new Date().getMonth() + 1).padStart(2, '0');
        const path  = `VersaoJson/Pessoal/?Listagem=Servidores&Empresa=1&Exercicio=${window._munYear}&MesFinalPeriodo=${mes}`;
        const data  = await _fiorilliCall(window._munBaseUrl, path);

        if (!Array.isArray(data) || !data.length) {
            sec.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Sem dados de servidores.</p>';
            return;
        }

        const sorted = [...data].sort((a, b) =>
            (parseFloat(String(b['LIQUIDO + (IsNull(PROVENTOS, 0)-IsNull(DESCONTOS,0))'] || b.LIQUIDO || b.PROVENTOS || 0).replace(',','.')) || 0) -
            (parseFloat(String(a['LIQUIDO + (IsNull(PROVENTOS, 0)-IsNull(DESCONTOS,0))'] || a.LIQUIDO || a.PROVENTOS || 0).replace(',','.')) || 0)
        );
        window._munServData = sorted;

        const total = sorted.reduce((acc, d) =>
            acc + (parseFloat(String(d['LIQUIDO + (IsNull(PROVENTOS, 0)-IsNull(DESCONTOS,0))'] || d.PROVENTOS || 0).replace(',','.')) || 0), 0);

        sec.innerHTML = `
            <div class="flex gap-4 mb-4 flex-wrap">
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-700 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Total de Servidores</div>
                    <div class="text-lg font-black text-white">${data.length.toLocaleString('pt-BR')}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-3 border border-violet-800/50 flex-1 min-w-[140px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Folha de Pagamento</div>
                    <div class="text-lg font-black text-violet-400">${_brl(total)}</div>
                </div>
            </div>
            <div class="flex items-center justify-between mb-3">
                <p class="text-zinc-500 text-xs">👆 Os ${Math.min(50,sorted.length)} maiores salários. CPFs são protegidos por lei.</p>
                <button onclick="window._exportCSV((window._munServData||[]).map(d=>({Nome:d.NOME||'',Cargo:d.CARGO||'',Setor:d.SUBDIVISAO||d.DIVISAO||'',Vinculo:d.VINCULO||'',Proventos:d.PROVENTOS||0,Descontos:d.DESCONTOS||0})),'servidores_${window._munYear}')"
                        class="text-[10px] bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/40 text-emerald-400 px-3 py-1.5 rounded-xl font-bold transition">
                    ⬇️ CSV
                </button>
            </div>
            <div class="space-y-2">
            ${sorted.slice(0, 50).map(d => {
                const liq   = parseFloat(String(d['LIQUIDO + (IsNull(PROVENTOS, 0)-IsNull(DESCONTOS,0))'] || d.PROVENTOS || 0).replace(',','.')) || 0;
                const desc  = parseFloat(String(d.DESCONTOS || 0).replace(',','.')) || 0;
                const nome  = d.NOME || '—';
                const cargo = d.CARGO || '';
                const sec_  = d.SUBDIVISAO || d.DIVISAO || '';
                const vinc  = d.VINCULO || '';
                return `
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-violet-700/40 transition">
                    <div class="flex justify-between items-start gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-bold text-white truncate">${nome}</div>
                            <div class="text-xs text-zinc-400">${cargo}</div>
                            <div class="text-[10px] text-zinc-600 mt-0.5">${sec_}${vinc ? ' · ' + vinc : ''}</div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-sm font-black text-violet-400">${_brl(liq)}</div>
                            ${desc > 0 ? `<div class="text-[10px] text-zinc-600">−${_brl(desc)} descontos</div>` : ''}
                        </div>
                    </div>
                </div>`;
            }).join('')}
            </div>`;
    } catch (e) {
        sec.innerHTML = `<p class="text-red-500 text-sm text-center py-6">Erro: ${e.message}</p>`;
    }
}

// ── 7. O que foi contratado — usa endpoint Contratos (OBJETO_COMPLETO) ────────
window._carregarEmpenhos = async function (filtroFornecedor) {
    const sec = document.getElementById('mun-sec-empenhos');
    if (!sec) return;

    const filtroAtual = (filtroFornecedor || '').trim();
    sec.innerHTML = `
        <div class="glass-panel p-5 rounded-2xl">
            <h4 class="text-base font-black text-white mb-1">📦 O que foi contratado / comprado</h4>
            <p class="text-zinc-500 text-xs mb-4">Contratos firmados pela prefeitura com descrição completa do objeto. Filtre por fornecedor ou pelo que foi comprado.</p>
            <div class="flex gap-2 mb-4">
                <input type="text" id="mun-emp-filtro" value="${filtroAtual.replace(/"/g,'&quot;')}"
                       placeholder="Ex: asfalto, informática, saúde, empresa..."
                       class="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-500"
                       onkeydown="if(event.key==='Enter') window._carregarEmpenhos(this.value)">
                <button onclick="window._carregarEmpenhos(document.getElementById('mun-emp-filtro').value)"
                        class="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition">Filtrar</button>
                <button onclick="window._carregarEmpenhos('')"
                        class="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-3 py-2 rounded-xl text-sm transition" title="Limpar">✕</button>
            </div>
            <div id="mun-emp-corpo" class="space-y-2">
                <div class="text-zinc-500 text-center py-8 animate-pulse">Carregando contratos...</div>
            </div>
        </div>`;

    const corpo = document.getElementById('mun-emp-corpo');

    try {
        // Reutiliza cache dos contratos se já carregado
        if (!window._munContratosCache) {
            const path = `VersaoJson/LicitacoesEContratos/?Listagem=Contratos&Exercicio=${window._munYear}&Empresa=1&MostraDadosConsolidado=False&ContratosApenasPublicados=False`;
            const data = await _fiorilliCall(window._munBaseUrl, path);
            window._munContratosCache = Array.isArray(data) ? data : [];
        }

        let lista = window._munContratosCache;

        if (filtroAtual) {
            const q = filtroAtual.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            lista = lista.filter(d => {
                const forn = (d.FORNECEDOR || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const obj  = (d.OBJETO_COMPLETO || d.OBJETO || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return forn.includes(q) || obj.includes(q);
            });
        }

        if (!lista.length) {
            corpo.innerHTML = '<p class="text-zinc-500 text-sm text-center py-6">Nenhum contrato encontrado com esse filtro.</p>';
            return;
        }

        let totalVal = 0;
        lista.forEach(d => {
            totalVal += parseFloat(String(d.VALCON || 0).replace(',', '.')) || 0;
        });

        const sorted = [...lista].sort((a, b) => {
            return (parseFloat(String(b.VALCON || 0).replace(',', '.')) || 0)
                 - (parseFloat(String(a.VALCON || 0).replace(',', '.')) || 0);
        });

        const semLicCount = lista.filter(d =>
            ['DISPENSA','INEXIGIBILIDADE'].some(x => (d.MODALI || d.LICIT || '').toUpperCase().includes(x))
        ).length;

        corpo.innerHTML = `
            <div class="flex gap-3 mb-4 flex-wrap">
                <div class="bg-zinc-900 rounded-xl px-4 py-2 border border-zinc-700 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Contratos</div>
                    <div class="text-lg font-black text-white">${lista.length.toLocaleString('pt-BR')}</div>
                </div>
                <div class="bg-zinc-900 rounded-xl px-4 py-2 border border-emerald-800/40 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Valor Total</div>
                    <div class="text-base font-black text-emerald-400">${_brl(totalVal)}</div>
                </div>
                ${semLicCount > 0 ? `
                <div class="bg-zinc-900 rounded-xl px-4 py-2 border border-amber-800/50 flex-1 min-w-[110px]">
                    <div class="text-[10px] text-zinc-500 uppercase">Sem Licitação ⚠️</div>
                    <div class="text-base font-black text-amber-400">${semLicCount}</div>
                </div>` : ''}
            </div>
            ${sorted.map(d => {
                const val      = parseFloat(String(d.VALCON || 0).replace(',', '.')) || 0;
                const forn     = d.FORNECEDOR || '—';
                const cnpj     = (d.INSMF || '').replace(/[^\d]/g, '');
                const objFull  = (d.OBJETO_COMPLETO || d.OBJETO || '—').trim().replace(/\r\n/g, ' ');
                const objCurto = d.OBJETO || '';
                const modal    = d.MODALI || d.LICIT || '';
                const num      = d.CODIGO || d.CONTRATONUM || '';
                const dtAssi   = (d.DTASSI || '').split(' ')[0];
                const vigFim   = (d.VIGENF || '').split(' ')[0];
                const semLic   = ['DISPENSA','INEXIGIBILIDADE'].some(x => modal.toUpperCase().includes(x));
                const responsavel = d.RESPON || '';
                return `
                <div class="bg-zinc-900 border ${semLic ? 'border-amber-800/50' : 'border-zinc-800'} rounded-xl p-4 hover:border-violet-700/40 transition">
                    <div class="flex items-start justify-between gap-3 mb-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            ${num ? `<span class="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Nº ${num}</span>` : ''}
                            ${dtAssi ? `<span class="text-[10px] text-zinc-500">${dtAssi}</span>` : ''}
                            ${semLic ? `<span class="text-[10px] font-bold bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded border border-amber-800/50">⚠️ SEM LICITAÇÃO</span>` : ''}
                            ${modal ? `<span class="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">${modal}</span>` : ''}
                            ${vigFim ? `<span class="text-[10px] text-zinc-600">até ${vigFim}</span>` : ''}
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-sm font-black text-emerald-400">${_brl(val)}</div>
                        </div>
                    </div>
                    ${objCurto ? `<p class="text-xs font-bold text-violet-300 mb-1 uppercase tracking-wide">${objCurto}</p>` : ''}
                    <p class="text-sm text-white leading-snug mb-2">${objFull.substring(0, 400)}${objFull.length > 400 ? '…' : ''}</p>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs text-zinc-400">🏭 ${forn}</span>
                        ${cnpj.length === 14
                            ? `<button onclick="window.openSupplierRadar && window.openSupplierRadar('${cnpj}')" class="text-[10px] bg-red-900/40 hover:bg-red-700/50 border border-red-800/50 text-red-400 px-2 py.0.5 rounded transition font-bold shrink-0">🚨 Investigar</button>`
                            : ''}
                        ${responsavel ? `<span class="text-[10px] text-zinc-600">👤 ${responsavel}</span>` : ''}
                    </div>
                </div>`;
            }).join('')}
            ${lista.length > 200 ? `<p class="text-zinc-600 text-xs text-center pt-3">Mostrando todos os ${lista.length.toLocaleString('pt-BR')} contratos filtrados.</p>` : ''}`;

    } catch (e) {
        corpo.innerHTML = `<p class="text-red-500 text-sm text-center py-6">Erro: ${e.message}</p>`;
    }
};

// ── 8. Itens de Compra — busca real nos empenhos (ItensEmpenhoPorNumeroEmpenho) ─
window._buscarItensCompra = async function () {
    const sec    = document.getElementById('mun-sec-itens');
    const termo  = (document.getElementById('mun-itens-busca')?.value || '').trim();
    const empMax = parseInt(document.getElementById('mun-itens-ate')?.value || '300');
    if (!sec) return;

    sec.innerHTML = `
        <div class="glass-panel p-5 rounded-2xl">
            ${_itensFormHTML(termo, empMax)}
            <div id="mun-itens-corpo">
                <div class="text-zinc-500 text-center py-8 animate-pulse">
                    🔍 Varrendo empenhos 1 a ${empMax}...<br>
                    <span class="text-xs">(pode levar alguns segundos)</span>
                </div>
            </div>
        </div>`;

    const corpo = document.getElementById('mun-itens-corpo');
    const q = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

    // Busca em lotes de 20 empenhos em paralelo
    const BATCH = 20;
    const toNum = v => parseFloat(String(v||0).replace(',','.')) || 0;
    let allItems = [];
    let totalScanned = 0;

    for (let start = 1; start <= empMax; start += BATCH) {
        const end = Math.min(start + BATCH - 1, empMax);
        const promises = [];
        for (let n = start; n <= end; n++) {
            promises.push(
                _fiorilliCall(window._munBaseUrl,
                    `VersaoJson/Despesas/?Listagem=ItensEmpenhoPorNumeroEmpenho&intNumeroEmpenho=${n}&strTipoEmpenho=OR&Empresa=1`)
                .then(items => ({ n, items: Array.isArray(items) ? items : [] }))
                .catch(() => ({ n, items: [] }))
            );
        }
        const results = await Promise.all(promises);
        totalScanned += results.length;

        results.forEach(({ n, items }) => {
            items.forEach(item => {
                const desc = (item.DESCR || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
                if (!q || desc.includes(q)) {
                    allItems.push({ ...item, _empNum: n });
                }
            });
        });

        // Atualiza progresso
        if (corpo) {
            corpo.innerHTML = `<div class="text-zinc-500 text-center py-4 text-sm animate-pulse">
                🔍 Verificado ${totalScanned}/${empMax} empenhos — ${allItems.length} itens encontrados...</div>`;
        }
    }

    if (!allItems.length) {
        corpo.innerHTML = `<p class="text-zinc-500 text-sm text-center py-6">
            Nenhum item encontrado${termo ? ` para "${termo}"` : ''}.<br>
            <span class="text-xs">Tente aumentar o número de empenhos ou mudar o termo.</span></p>`;
        return;
    }

    // Agrupa por descrição para mostrar resumo
    const porDesc = {};
    allItems.forEach(item => {
        const key = item.DESCR || '—';
        if (!porDesc[key]) porDesc[key] = { descr: key, qtdTotal: 0, vlTotal: 0, empenhos: [], marca: item.MARCA || '', und: item.UND || '' };
        porDesc[key].qtdTotal += toNum(item.QTD);
        porDesc[key].vlTotal  += toNum(item.VLTOTAL);
        porDesc[key].empenhos.push(item._empNum);
    });

    const sorted = Object.values(porDesc).sort((a,b) => b.vlTotal - a.vlTotal);
    let totalGeral = sorted.reduce((s,d) => s + d.vlTotal, 0);

    corpo.innerHTML = `
        <div class="flex gap-3 mb-4 flex-wrap">
            <div class="bg-zinc-900 rounded-xl px-4 py-2 border border-zinc-700 flex-1 min-w-[110px]">
                <div class="text-[10px] text-zinc-500 uppercase">Itens distintos</div>
                <div class="text-lg font-black text-white">${sorted.length.toLocaleString('pt-BR')}</div>
            </div>
            <div class="bg-zinc-900 rounded-xl px-4 py-2 border border-emerald-800/40 flex-1 min-w-[110px]">
                <div class="text-[10px] text-zinc-500 uppercase">Valor Total</div>
                <div class="text-base font-black text-emerald-400">${_brl(totalGeral)}</div>
            </div>
            <div class="bg-zinc-900 rounded-xl px-4 py-2 border border-zinc-700 flex-1 min-w-[110px]">
                <div class="text-[10px] text-zinc-500 uppercase">Empenhos varridos</div>
                <div class="text-base font-black text-zinc-300">${empMax}</div>
            </div>
        </div>
        <div class="space-y-2">
        ${sorted.slice(0, 150).map(d => `
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-violet-700/40 transition flex items-center gap-3">
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold text-white leading-tight">${d.descr}</div>
                    <div class="flex items-center gap-3 mt-1 flex-wrap text-[11px] text-zinc-500">
                        ${d.marca ? `<span>🏷️ ${d.marca}</span>` : ''}
                        <span>📦 ${d.qtdTotal.toLocaleString('pt-BR')} ${d.und}</span>
                        <span class="text-zinc-600 font-mono">Emp: ${[...new Set(d.empenhos)].slice(0,5).join(', ')}${d.empenhos.length>5?'…':''}</span>
                    </div>
                </div>
                <div class="text-right shrink-0">
                    <div class="text-sm font-black text-emerald-400">${_brl(d.vlTotal)}</div>
                    <div class="text-[10px] text-zinc-600">${d.empenhos.length} empenho${d.empenhos.length>1?'s':''}</div>
                </div>
            </div>`).join('')}
        </div>
        ${sorted.length > 150 ? `<p class="text-zinc-600 text-xs text-center pt-3">Mostrando 150 de ${sorted.length} itens distintos.</p>` : ''}`;
};

function _itensFormHTML(termo, empMax) {
    return `
        <h4 class="text-base font-black text-white mb-1">🛒 Itens Comprados pela Prefeitura</h4>
        <p class="text-zinc-500 text-xs mb-4">Busca nos empenhos individuais — veja exatamente o que foi comprado: descrição, quantidade, preço unitário e total.</p>
        <div class="flex flex-wrap gap-2 mb-4">
            <input type="text" id="mun-itens-busca" value="${(termo||'').replace(/"/g,'&quot;')}"
                   placeholder="Ex: cadeira, computador, medicamento, combustível..."
                   class="flex-1 min-w-[180px] bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-500"
                   onkeydown="if(event.key==='Enter') window._buscarItensCompra()">
            <select id="mun-itens-ate" class="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500">
                <option value="100">Até empenho 100</option>
                <option value="300" selected>Até empenho 300</option>
                <option value="500">Até empenho 500</option>
                <option value="1000">Até empenho 1000</option>
            </select>
            <button onclick="window._buscarItensCompra()"
                    class="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition">
                🔍 Buscar
            </button>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
            <span class="text-[10px] text-zinc-600">Sugestões:</span>
            ${['computador','cadeira','combustível','medicamento','material escolar','equipamento','uniforme','serviço'].map(s =>
                `<button onclick="document.getElementById('mun-itens-busca').value='${s}'; window._buscarItensCompra()"
                         class="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-2 py-1 rounded transition">${s}</button>`
            ).join('')}
        </div>`;
}

// Inicializa a aba itens sem buscar
window._iniciarItens = function () {
    const sec = document.getElementById('mun-sec-itens');
    if (!sec) return;
    sec.innerHTML = `
        <div class="glass-panel p-5 rounded-2xl">
            ${_itensFormHTML('', 300)}
            <div id="mun-itens-corpo">
                <p class="text-zinc-600 text-sm text-center py-6">Digite um termo ou clique em "Buscar" para ver todos os itens.</p>
            </div>
        </div>`;
};

// ── Listagem de cidades por estado ───────────────────────────────────────────
window._atualizarCidades = async function(uf) {
    const listEl = document.getElementById('mun-cidades-sugestoes');
    const statusEl = document.getElementById('mun-cidades-status');
    const inputEl = document.getElementById('mun-cidade');
    if (!listEl) return;

    listEl.innerHTML = '';
    statusEl.textContent = '⌛ Carregando cidades de ' + uf.toUpperCase() + '...';
    inputEl.placeholder = 'Carregando...';

    // Lista de cidades que sabemos que costumam usar Fiorilli (padrão de exemplo)
    const fiorilliCities = {
        'sp': ['Ipuã', 'Ibaté', 'Brodowski', 'Tapiraí', 'Américo de Campos', 'São Joaquim da Barra', 'Paraguaçu Paulista', 'Cajati', 'Sales Oliveira', 'Nuporanga', 'Bauru', 'Sorocaba', 'Marília', 'Presidente Prudente', 'Araraquara', 'Campinas'],
        'rs': ['Veranópolis', 'Bento Gonçalves', 'Garibaldi', 'Carlos Barbosa', 'Farroupilha', 'Caxias do Sul', 'Nova Prata', 'Porto Alegre'],
        'mt': ['Jauru', 'Figueirópolis D\'Oeste', 'Indiavaí'],
        'ms': ['Pedro Gomes', 'Ribas do Rio Pardo'],
        'pi': ['João Costa'],
        'es': ['Viana'],
        'pr': ['Arapuã']
    };

    try {
        const res = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${uf}?providers=dados-abertos-br,gov,wikipedia`);
        const cidades = await res.json();
        
        const known = fiorilliCities[uf.toLowerCase()] || [];
        
        let html = '';
        // Primeiro as conhecidas
        known.forEach(c => {
            html += `<option value="${c}">${c} (✨ Recomendada Fiorilli)</option>`;
        });
        
        // Depois todas as outras
        cidades.forEach(c => {
            if (!known.includes(c.nome)) {
                html += `<option value="${c.nome}">${c.nome}</option>`;
            }
        });

        listEl.innerHTML = html;
        statusEl.textContent = `✅ ${cidades.length} cidades carregadas. Tente a sua.`;
        inputEl.placeholder = 'Digite ou selecione a cidade...';
    } catch (e) {
        statusEl.textContent = '❌ Digite o nome da cidade manualmente.';
        inputEl.placeholder = 'Ex: Campinas, Maringá...';
    }
};
