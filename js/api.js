// /var/www/html/hyperz/transparency/js/api.js

const API_BASE_URL = (window.BASE_PATH || '') + '/api.php';

// ── Response cache (avoid duplicate API calls within 30s) ─────────────────────
const _apiCache = new Map();
const _API_TTL = 30000; // 30 seconds

function _cachedFetch(url, opts = {}) {
    if (opts.method && opts.method !== 'GET') return fetch(url, opts);
    const cached = _apiCache.get(url);
    if (cached && Date.now() - cached.ts < _API_TTL) {
        return Promise.resolve(new Response(JSON.stringify(cached.data), { headers: { 'Content-Type': 'application/json' } }));
    }
    return fetch(url, opts).then(r => {
        if (r.ok && r.status === 200) {
            const clone = r.clone();
            clone.json().then(data => _apiCache.set(url, { data, ts: Date.now() })).catch(() => {});
        }
        return r;
    });
}

/**
 * Centraliza chamadas à API do backend.
 */
async function fetchApi(action, params = {}) {
    const url = new URL(API_BASE_URL, window.location.href);
    url.searchParams.append('action', action);

    for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
            // Se o parâmetro for 'endpoint' e já contiver '?', vamos extrair os parâmetros dele
            if (key === 'endpoint' && typeof params[key] === 'string' && params[key].includes('?')) {
                const [pureEndpoint, queryString] = params[key].split('?');
                url.searchParams.append('endpoint', pureEndpoint);
                const extra = new URLSearchParams(queryString);
                extra.forEach((val, k) => {
                    url.searchParams.append(k, val);
                });
            } else {
                url.searchParams.append(key, params[key]);
            }
        }
    }

    try {
        const response = await _cachedFetch(url.toString(), {
            credentials: 'include', // Fix 403 Forbidden (Session/Cookies)
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Resposta não é JSON válido:", text.substring(0, 100));
            throw new Error("Resposta inválida do servidor (não é JSON).");
        }
    } catch (error) {
        console.error(`Erro na requisição API (${action}):`, error);
        return { erro: error.message, status: 'error' };
    }
}

// Objeto global 'api'
window.api = {
    camara: (endpoint, extraParams = {}) => fetchApi('proxy_camara', { endpoint, ...extraParams }),
    senado: (endpoint, extraParams = {}) => fetchApi('proxy_senado', { endpoint, ...extraParams }),
    portal: (endpoint, extraParams = {}) => fetchApi('proxy_portal_transparencia', { endpoint, ...extraParams }),
    tse: (endpoint, extraParams = {}) => fetchApi('proxy_tse', { endpoint, ...extraParams }),
    tseDados: (endpoint, extraParams = {}) => fetchApi('proxy_tse_dados', { endpoint, ...extraParams }),
    brasilApi: (endpoint, extraParams = {}) => fetchApi('proxy_brasilapi', { endpoint, ...extraParams }),
    nominatim: (q) => fetchApi('proxy_nominatim', { q }),
    news: () => fetchApi('political_news'),
    analyzeExpenses: (id) => fetchApi('analyze_expenses', { id }),
    scanCorrupcao: (nome, cpf = '', cnpj = '') => fetchApi('scan_anticorrupcao', { nome, cpf, cnpj }),
    buscaServidores: (nome) => fetchApi('busca_servidores', { nome }),

    // ── OSINT Intelligence Module ────────────────────────────────────────────
    // Busca unificada com interpretação de linguagem natural
    osintSearch: (q) => fetchApi('osint_search', { q }),
    // Relatório completo com score de suspeição 0-100
    osintIntelligence: (params) => fetchApi('osint_intelligence', params),
    // Busca de datasets no dados.gov.br (CKAN)
    dadosGov: (q, rows = 10) => fetchApi('dados_gov_search', { q, rows }),
    // Dossiê de fornecedor (CNPJ)
    investigarFornecedor: (cnpj) => fetchApi('investigate_supplier', { cnpj }),

    get: fetchApi
};

console.log('API Module Loaded');
