// transparency/js/corruption.js — Radar Anti-Corrupção
// Funções: Varredura de Sanções, Raio-X PF/PJ, Nepotismo, Despesas, Cruzamento PF×PJ

// ── Exportar relatório como .txt ──────────────────────────────────────────────
function exportarRelatorio(elId, titulo) {
  const el = document.getElementById(elId);
  if (!el) return;
  const texto = `RADAR ANTI-CORRUPÇÃO — HyperZ\n${titulo}\nGerado em: ${new Date().toLocaleString('pt-BR')}\n${'='.repeat(60)}\n\n`
              + el.innerText.replace(/\n{3,}/g, '\n\n');
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `radar_${titulo.replace(/\W+/g,'_').toLowerCase()}_${Date.now()}.txt`;
  a.click(); URL.revokeObjectURL(a.href);
}

function _addExportBtn(elId, titulo) {
  const el = document.getElementById(elId);
  if (!el || el.querySelector('.export-btn')) return;
  const btn = document.createElement('div');
  btn.className = 'mt-4 pt-3 border-t border-zinc-800 flex justify-end';
  btn.innerHTML = `<button onclick="exportarRelatorio('${elId}','${titulo}')"
    class="export-btn flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition">
    📄 Exportar Relatório (.txt)
  </button>`;
  el.appendChild(btn);
}

// ── Histórico de consultas (sessionStorage) ───────────────────────────────────
const _HIST_KEY = 'radar_history';
function _saveHistory(tipo, query) {
  const hist = JSON.parse(sessionStorage.getItem(_HIST_KEY) || '[]');
  hist.unshift({ tipo, query, ts: new Date().toLocaleTimeString('pt-BR') });
  sessionStorage.setItem(_HIST_KEY, JSON.stringify(hist.slice(0, 20)));
  _renderHistory();
}
function _renderHistory() {
  const el = document.getElementById('radarHistoryList');
  if (!el) return;
  const hist = JSON.parse(sessionStorage.getItem(_HIST_KEY) || '[]');
  const panel = document.getElementById('radarHistoryPanel');
  if (panel) panel.classList.toggle('hidden', hist.length === 0);
  if (!hist.length) { el.innerHTML = '<div class="text-xs text-zinc-600">Nenhuma consulta ainda.</div>'; return; }
  el.innerHTML = hist.map(h => `<div class="flex items-center gap-2 py-1 border-b border-zinc-800 text-xs">
    <span class="text-zinc-500 shrink-0">${h.ts}</span>
    <span class="text-zinc-400 shrink-0 font-bold">${h.tipo}</span>
    <span class="text-white truncate">${h.query}</span>
  </div>`).join('');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function _loading(elId, color = 'red') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `<div class="flex items-center justify-center gap-3 py-12 text-zinc-400">
    <span class="animate-spin inline-block w-6 h-6 border-2 border-${color}-500 border-t-transparent rounded-full"></span>
    <span class="text-sm">Consultando bases governamentais...</span>
  </div>`;
}

function _error(elId, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `<div class="bg-red-950/40 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
    <strong>Erro:</strong> ${msg}
  </div>`;
}

function _riskBadge(risk) {
  const map = {
    critical: 'bg-red-900 text-red-200 border-red-700',
    high:     'bg-orange-900 text-orange-200 border-orange-700',
    medium:   'bg-yellow-900 text-yellow-200 border-yellow-700',
    low:      'bg-blue-900 text-blue-200 border-blue-700',
    info:     'bg-zinc-800 text-zinc-300 border-zinc-700',
  };
  return map[risk] || map.info;
}

function _fmtCurrency(v) {
  const n = parseFloat(v);
  if (!n) return 'R$ 0,00';
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function _fmtDate(d) {
  if (!d || d === 'Sem informação') return 'Sem data';
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, m, day] = d.split('T')[0].split('-');
    return `${day}/${m}/${y}`;
  }
  return d;
}

// ── 1. VARREDURA DE SANÇÕES ───────────────────────────────────────────────────
async function runRadarScan() {
  const nome = document.getElementById('radarNome')?.value.trim() || '';
  const cpf  = (document.getElementById('radarCpf')?.value || '').replace(/\D/g, '');
  const cnpj = (document.getElementById('radarCnpj')?.value || '').replace(/\D/g, '');

  if (!nome && !cpf && !cnpj) {
    _error('radarResults', 'Preencha ao menos o nome, CPF ou CNPJ para pesquisar.');
    return;
  }

  _loading('radarResults', 'red');

  const data = await api.scanCorrupcao(nome, cpf, cnpj);

  if (data.erro) { _error('radarResults', data.erro); return; }
  _saveHistory('Varredura', nome || cpf || cnpj);

  const el = document.getElementById('radarResults');
  const riskColors = { limpo: 'emerald', medio: 'yellow', alto: 'red' };
  const riskLabels = { limpo: '✅ Limpo', medio: '⚠️ Médio', alto: '🚨 Alto' };
  const rc = riskColors[data.nivel_risco] || 'zinc';
  const rl = riskLabels[data.nivel_risco] || data.nivel_risco;

  const header = `
    <div class="flex flex-wrap items-center gap-4 mb-6 p-4 bg-zinc-900 rounded-xl border border-zinc-700">
      <div class="flex-1 min-w-0">
        <div class="text-xs text-zinc-500 uppercase font-bold mb-1">Pesquisado</div>
        <div class="text-white font-bold">${data.pesquisa.nome || data.pesquisa.cpf || data.pesquisa.cnpj || '—'}</div>
        ${data.pesquisa.cpf ? `<div class="text-xs text-zinc-500">CPF: ${data.pesquisa.cpf}</div>` : ''}
      </div>
      <div class="text-center">
        <div class="text-3xl font-black text-${rc}-400">${data.total_ocorrencias}</div>
        <div class="text-xs text-zinc-500">ocorrências</div>
      </div>
      <div class="px-4 py-2 rounded-lg bg-${rc}-950 border border-${rc}-700 text-${rc}-300 font-bold text-sm">${rl}</div>
      <div class="text-xs text-zinc-600 ml-auto">${data.data_consulta || ''}</div>
    </div>`;

  const dbColors = { cnep: 'red', ceis: 'orange', ceaf: 'red', cepim: 'orange', pep: 'blue' };
  const basesHtml = Object.entries(data.bases || {}).map(([key, db]) => {
    const col = dbColors[key] || 'zinc';
    const count = db.count || 0;
    const items = db.items || [];

    const itemsHtml = count === 0
      ? `<div class="text-xs text-emerald-400 py-2">✅ Nenhuma ocorrência encontrada.</div>`
      : items.map(item => {
          const nome = item.sancionado?.nome || item.pessoa?.nome || item.nomePep || item.nome || '—';
          const tipo = item.tipoSancao?.descricaoResumida || item.tipoPep || item.tipoCargo || '—';
          const inicio = _fmtDate(item.dataInicioSancao || item.dataInicioPep || item.dataInicio || '');
          const fim    = _fmtDate(item.dataFimSancao    || item.dataFimPep    || item.dataFim    || '');
          const orgao  = item.orgaoSancionador?.nome || item.orgaoPep || item.orgao || '';
          const multa  = item.valorMulta && item.valorMulta !== '0,00' ? ` · Multa: R$ ${item.valorMulta}` : '';
          return `<div class="bg-zinc-900/60 border border-zinc-700 rounded-lg p-3 mb-2 text-xs">
            <div class="font-bold text-white mb-1">${nome}</div>
            <div class="text-zinc-400">${tipo}</div>
            <div class="text-zinc-500 mt-1">${inicio} → ${fim}${multa}</div>
            ${orgao ? `<div class="text-zinc-600 mt-1">${orgao}</div>` : ''}
          </div>`;
        }).join('');

    return `<div class="glass-panel rounded-xl border border-zinc-800 p-4 mb-4">
      <div class="flex items-center gap-3 mb-3">
        <span class="px-2 py-1 rounded text-[10px] font-black border ${_riskBadge(db.meta?.risk)}">${db.meta?.nome}</span>
        <span class="text-xs text-zinc-400">${db.meta?.desc}</span>
        <span class="ml-auto text-${count > 0 ? col + '-400' : 'emerald-400'} font-bold text-sm">${count}</span>
      </div>
      ${itemsHtml}
      ${count > (db.items?.length || 0) ? `<div class="text-xs text-zinc-600 text-center mt-2">Exibindo ${db.items?.length} de ${count} registros</div>` : ''}
    </div>`;
  }).join('');

  el.innerHTML = header + basesHtml;
  _addExportBtn('radarResults', `Varredura_${nome || cpf || cnpj}`);
}

// ── 2. RAIO-X PESSOA FÍSICA ───────────────────────────────────────────────────
async function runPessoaFisicaScan() {
  const cpf = (document.getElementById('pfCpf')?.value || '').replace(/\D/g, '');
  if (cpf.length !== 11) {
    _error('pfResult', 'Informe um CPF válido com 11 dígitos.');
    return;
  }

  _loading('pfResult', 'blue');

  const [data, beneficios] = await Promise.all([
    api.scanCorrupcao('', cpf, ''),
    fetchApi('check_beneficios_sociais', { codigo: cpf }).catch(() => null),
  ]);
  if (data.erro) { _error('pfResult', data.erro); return; }
  _saveHistory('Raio-X PF', cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'));

  const el = document.getElementById('pfResult');
  const total = data.total_ocorrencias || 0;
  const riskColors = { limpo: 'emerald', medio: 'yellow', alto: 'red' };
  const riskLabels = { limpo: '✅ Limpo', medio: '⚠️ Risco Médio', alto: '🚨 Risco Alto' };
  const rc = riskColors[data.nivel_risco] || 'zinc';
  const rl = riskLabels[data.nivel_risco] || data.nivel_risco;

  // ── Header ──────────────────────────────────────────────────────────────────
  let html = `<div class="glass-panel rounded-xl border border-zinc-800 p-5 mb-5">
    <div class="flex items-center gap-4 flex-wrap">
      <div class="w-14 h-14 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center text-2xl flex-shrink-0">👤</div>
      <div class="flex-1 min-w-0">
        <div class="text-xs text-zinc-500 uppercase font-bold">CPF Consultado</div>
        <div class="text-white font-bold text-lg">${data.pesquisa.cpf || cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</div>
        <div class="text-xs text-zinc-500">${data.data_consulta || ''}</div>
      </div>
      <div class="text-right flex-shrink-0">
        <div class="text-2xl font-black text-${rc}-400">${total}</div>
        <div class="text-xs text-zinc-500">ocorrências</div>
        <div class="mt-1 px-3 py-1 rounded-lg bg-${rc}-950 border border-${rc}-700 text-${rc}-300 text-xs font-bold">${rl}</div>
      </div>
    </div>
  </div>`;

  // ── PEP — card de destaque ───────────────────────────────────────────────────
  const pep = data.bases?.pep;
  if (pep && pep.count > 0) {
    html += `<div class="glass-panel rounded-xl border border-blue-700 bg-blue-950/20 p-4 mb-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">🔵</span>
        <span class="font-bold text-blue-300">Pessoa Exposta Politicamente (PEP)</span>
        <span class="ml-auto text-xs bg-blue-900 border border-blue-700 text-blue-200 px-2 py-0.5 rounded font-bold">${pep.count} registro(s)</span>
      </div>
      ${(pep.items || []).map(item => {
        const nm    = item.nomePep || item.sancionado?.nome || item.pessoa?.nome || '—';
        const tipo  = item.tipoPep || item.tipoCargo || '—';
        const orgao = item.orgaoPep || item.orgao || '';
        const ini   = _fmtDate(item.dataInicioPep || item.dataInicio || '');
        const fimStr = item.dataFimPep || item.dataFim || '';
        const fim   = _fmtDate(fimStr);
        return `<div class="bg-blue-950/40 border border-blue-800 rounded-lg p-3 mb-2 text-xs">
          <div class="font-bold text-white mb-1">${nm}</div>
          <div class="text-blue-300">${tipo}</div>
          ${orgao ? `<div class="text-blue-400/70 mt-0.5">🏛️ ${orgao}</div>` : ''}
          ${ini !== 'Sem data' ? `<div class="text-zinc-500 mt-1">${ini}${fim !== 'Sem data' ? ' → ' + fim : ' → atual'}</div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }

  // ── Sanções ──────────────────────────────────────────────────────────────────
  const now = new Date();
  Object.entries(data.bases || {}).forEach(([key, db]) => {
    if (!db.count || key === 'pep') return;
    html += `<div class="glass-panel rounded-xl border border-zinc-800 p-4 mb-3">
      <div class="flex items-center gap-2 mb-3">
        <span class="px-2 py-1 rounded text-[10px] font-black border ${_riskBadge(db.meta?.risk)}">${db.meta?.nome}</span>
        <span class="text-xs text-zinc-400 flex-1">${db.meta?.desc || ''}</span>
        <span class="text-xs text-red-400 font-bold">${db.count} registro(s)</span>
      </div>
      ${(db.items || []).map(item => {
        const nm    = item.sancionado?.nome || item.pessoa?.nome || item.nome || '—';
        const tipo  = item.tipoSancao?.descricaoResumida || item.tipoSancao?.descricaoDetalhada || '—';
        const orgao = item.orgaoSancionador?.nome || item.orgao || '';
        const fund  = item.fundamentoLegal || '';
        const multa = item.valorMulta && item.valorMulta !== '0,00' ? item.valorMulta : '';
        const ini   = _fmtDate(item.dataInicioSancao || item.dataInicio || '');
        const fimStr = item.dataFimSancao || item.dataFim || '';
        const fim   = _fmtDate(fimStr);
        const ativo = !fimStr || new Date(fimStr) > now;
        return `<div class="bg-zinc-900 rounded-lg p-3 mb-2 text-xs border border-zinc-800">
          <div class="flex items-start gap-2 mb-1">
            <div class="font-bold text-white flex-1">${nm}</div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${ativo ? 'bg-red-950 border-red-800 text-red-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}">${ativo ? 'ATIVO' : 'ENCERRADO'}</span>
          </div>
          <div class="text-zinc-300 mb-1">${tipo}</div>
          ${orgao ? `<div class="text-zinc-500">🏛️ ${orgao}</div>` : ''}
          ${fund  ? `<div class="text-zinc-600 mt-0.5">📜 ${fund}</div>` : ''}
          <div class="flex items-center gap-3 mt-1.5 flex-wrap">
            <span class="text-zinc-500">${ini}${fim !== 'Sem data' ? ' → ' + fim : ''}</span>
            ${multa ? `<span class="text-red-400 font-bold">Multa: R$ ${multa}</span>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  });

  // ── Benefícios Sociais ───────────────────────────────────────────────────────
  if (beneficios && !beneficios.erro) {
    const ativos = Object.values(beneficios.programas || {}).filter(p => p.ativo);
    if (ativos.length > 0) {
      html += `<div class="glass-panel rounded-xl border border-green-800/60 p-4 mb-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">🏦</span>
          <span class="font-bold text-green-300">Benefícios Sociais Federais</span>
          <span class="ml-auto text-xs bg-green-900/60 border border-green-700 text-green-200 px-2 py-0.5 rounded font-bold">${ativos.length} ativo(s)</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${ativos.map(p => `<span class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-950 border border-green-800 text-green-300 text-xs font-bold">
            ${p.meta.icon} ${p.meta.nome}
          </span>`).join('')}
        </div>
      </div>`;
    }
  }

  if (total === 0) {
    html += `<div class="text-center py-6 text-emerald-400 text-sm">
      <div class="text-3xl mb-2">✅</div>
      <strong>Nenhuma ocorrência encontrada</strong> nas 5 bases consultadas para este CPF.
    </div>`;
  }

  el.innerHTML = html;
  _addExportBtn('pfResult', `RaioX_PF_${cpf}`);
}

// ── 3. RAIO-X EMPRESA ─────────────────────────────────────────────────────────
async function runPessoaJuridicaScan() {
  const cnpj = (document.getElementById('pjCnpj')?.value || '').replace(/\D/g, '');
  if (cnpj.length !== 14) {
    _error('pjResult', 'Informe um CNPJ válido com 14 dígitos.');
    return;
  }

  _loading('pjResult', 'violet');

  const ano = new Date().getFullYear();
  const [empresa, sancoes, contratosList, pgtosList] = await Promise.all([
    api.brasilApi(`cnpj/v1/${cnpj}`).catch(() => null),
    api.scanCorrupcao('', '', cnpj),
    api.portal(`contratos/cpf-cnpj?cpfCnpjFornecedor=${cnpj}&pagina=1`).catch(() => null),
    api.portal(`despesas/documentos-por-favorecido?codigoPessoa=${cnpj}&fase=3&ano=${ano}&ordenacaoResultado=2&pagina=1`).catch(() => null),
  ]);

  const el = document.getElementById('pjResult');
  let html = '';

  // ── Cabeçalho da Empresa ────────────────────────────────────────────────────
  if (empresa && !empresa.error) {
    const sit = empresa.situacao_cadastral || 'INDEFINIDA';
    const sitColor = sit === 'ATIVA' ? 'emerald' : 'orange';
    const capitalSocial = empresa.capital_social ? _fmtCurrency(empresa.capital_social) : null;
    const dataSit = empresa.data_situacao_cadastral ? ` (desde ${_fmtDate(empresa.data_situacao_cadastral)})` : '';
    html += `<div class="glass-panel rounded-xl border border-zinc-800 p-5 mb-5">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-0">
          <div class="text-xs text-zinc-500 uppercase font-bold mb-1">Razão Social</div>
          <div class="text-white font-bold text-lg">${empresa.razao_social || '—'}</div>
          ${empresa.nome_fantasia ? `<div class="text-zinc-400 text-sm">${empresa.nome_fantasia}</div>` : ''}
          <div class="text-zinc-600 text-xs mt-1">${cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <span class="px-3 py-1 rounded-lg border text-sm font-bold ${sitColor === 'emerald' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-orange-950 border-orange-700 text-orange-300'}">
            ${sit}${dataSit}
          </span>
          ${empresa.porte ? `<span class="text-xs text-zinc-500">${empresa.porte}</span>` : ''}
          ${capitalSocial ? `<span class="text-xs text-zinc-400">Capital: <strong class="text-white">${capitalSocial}</strong></span>` : ''}
        </div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800">
        <div><div class="text-xs text-zinc-600">CNAE Principal</div><div class="text-xs text-zinc-300">${empresa.cnae_fiscal_descricao || '—'}</div></div>
        <div><div class="text-xs text-zinc-600">Município</div><div class="text-xs text-zinc-300">${empresa.municipio || '—'}/${empresa.uf || ''}</div></div>
        <div><div class="text-xs text-zinc-600">Início</div><div class="text-xs text-zinc-300">${_fmtDate(empresa.data_inicio_atividade)}</div></div>
        <div><div class="text-xs text-zinc-600">Natureza</div><div class="text-xs text-zinc-300">${empresa.natureza_juridica || '—'}</div></div>
        ${empresa.email ? `<div class="col-span-2"><div class="text-xs text-zinc-600">E-mail</div><div class="text-xs text-zinc-300">${empresa.email}</div></div>` : ''}
        ${empresa.telefone1 ? `<div><div class="text-xs text-zinc-600">Telefone</div><div class="text-xs text-zinc-300">${empresa.telefone1}</div></div>` : ''}
      </div>
      ${(empresa.cnaes_secundarios || []).length > 0 ? `
        <div class="mt-3 pt-3 border-t border-zinc-800">
          <div class="text-xs text-zinc-500 uppercase font-bold mb-2">CNAEs Secundários</div>
          <div class="flex flex-wrap gap-1.5">
            ${empresa.cnaes_secundarios.slice(0, 6).map(c => `<span class="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-400">${c.descricao || c.codigo}</span>`).join('')}
            ${empresa.cnaes_secundarios.length > 6 ? `<span class="text-xs text-zinc-600 self-center">+${empresa.cnaes_secundarios.length - 6} mais</span>` : ''}
          </div>
        </div>` : ''}
      ${(empresa.qsa || []).length > 0 ? `
        <div class="mt-4 pt-4 border-t border-zinc-800">
          <div class="text-xs text-zinc-500 uppercase font-bold mb-2">Quadro Societário (QSA)</div>
          <div class="flex flex-wrap gap-2">
            ${empresa.qsa.map(s => `<span class="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-xs text-zinc-300">
              👤 ${s.nome_socio} <span class="text-zinc-600">(${s.qualificacao_socio})</span>
            </span>`).join('')}
          </div>
        </div>` : ''}
    </div>`;
  }

  // ── Sanções ──────────────────────────────────────────────────────────────────
  if (sancoes && !sancoes.erro) {
    const total = sancoes.total_ocorrencias || 0;
    const rc = total === 0 ? 'emerald' : 'red';
    const now = new Date();
    html += `<div class="glass-panel rounded-xl border border-zinc-800 p-4 mb-4">
      <div class="flex items-center gap-3 mb-3">
        <span class="font-bold text-white">🚨 Sanções Governamentais</span>
        <span class="ml-auto px-3 py-1 rounded-lg bg-${rc}-950 border border-${rc}-700 text-${rc}-300 text-xs font-bold">${total} ocorrência(s)</span>
      </div>`;
    Object.entries(sancoes.bases || {}).forEach(([, db]) => {
      if (!db.count) return;
      html += `<div class="mb-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-black border ${_riskBadge(db.meta?.risk)}">${db.meta?.nome}</span>
          <span class="text-xs text-zinc-400">${db.count} registro(s)</span>
        </div>
        ${(db.items || []).map(item => {
          const nm    = item.sancionado?.nome || item.pessoa?.nome || '—';
          const tipo  = item.tipoSancao?.descricaoResumida || '—';
          const orgao = item.orgaoSancionador?.nome || '';
          const fund  = item.fundamentoLegal || '';
          const multa = item.valorMulta && item.valorMulta !== '0,00' ? item.valorMulta : '';
          const fimStr = item.dataFimSancao || '';
          const ativo = !fimStr || new Date(fimStr) > now;
          return `<div class="bg-zinc-900 rounded-lg p-3 mb-2 text-xs border border-zinc-800">
            <div class="flex items-start gap-2 mb-1">
              <div class="font-bold text-white flex-1">${nm}</div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${ativo ? 'bg-red-950 border-red-800 text-red-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}">${ativo ? 'ATIVO' : 'ENCERRADO'}</span>
            </div>
            <div class="text-zinc-300">${tipo}</div>
            ${orgao ? `<div class="text-zinc-500 mt-0.5">🏛️ ${orgao}</div>` : ''}
            ${fund  ? `<div class="text-zinc-600 mt-0.5">📜 ${fund}</div>` : ''}
            <div class="flex items-center gap-3 mt-1.5 flex-wrap">
              <span class="text-zinc-500">${_fmtDate(item.dataInicioSancao)} → ${_fmtDate(item.dataFimSancao)}</span>
              ${multa ? `<span class="text-red-400 font-bold">Multa: R$ ${multa}</span>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>`;
    });
    if (total === 0) {
      html += `<div class="text-emerald-400 text-sm text-center py-2">✅ Empresa sem sanções nas bases federais.</div>`;
    }
    html += `</div>`;
  }

  // ── Contratos Federais ───────────────────────────────────────────────────────
  const contratos = Array.isArray(contratosList) ? contratosList : (contratosList?.data || []);
  if (contratos.length > 0) {
    const totalContVal = contratos.reduce((s, c) => s + parseFloat(c.valorInicialCompra || c.valorContrato || 0), 0);
    html += `<div class="glass-panel rounded-xl border border-violet-900/40 p-4 mb-4">
      <div class="flex items-center gap-3 mb-3">
        <span class="font-bold text-white">📋 Contratos Federais</span>
        <span class="ml-auto text-violet-400 font-black text-sm">${_fmtCurrency(totalContVal)}</span>
      </div>
      <div class="space-y-2">
        ${contratos.map(c => {
          const objeto = c.objeto || c.descricaoObjeto || '—';
          const orgao  = c.unidadeGestora?.nome || c.orgaoSuperior?.nome || '—';
          const valor  = _fmtCurrency(parseFloat(c.valorInicialCompra || c.valorContrato || 0));
          const ini    = _fmtDate(c.dataInicioVigencia || c.dataAssinatura || '');
          const fimStr = c.dataFimVigencia || '';
          const fim    = _fmtDate(fimStr);
          const status = c.situacaoContrato?.descricao || '';
          const ativo  = !fimStr || new Date(fimStr) > new Date();
          return `<div class="bg-zinc-900 rounded-lg p-3 border border-zinc-800 text-xs">
            <div class="flex items-start gap-2 mb-1">
              <div class="font-bold text-white flex-1 min-w-0">${objeto}</div>
              ${status ? `<span class="px-2 py-0.5 rounded text-[10px] border flex-shrink-0 ${ativo ? 'bg-green-950 border-green-800 text-green-300' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}">${status}</span>` : ''}
            </div>
            <div class="text-zinc-500">${orgao}</div>
            <div class="flex items-center gap-3 mt-1 flex-wrap">
              <span class="text-violet-400 font-bold">${valor}</span>
              <span class="text-zinc-600">${ini}${fim !== 'Sem data' ? ' → ' + fim : ''}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="text-xs text-zinc-600 mt-3">Exibindo ${contratos.length} contrato(s) — Portal da Transparência.</div>
    </div>`;
  }

  // ── Pagamentos Federais Recebidos ────────────────────────────────────────────
  const pgtos = Array.isArray(pgtosList) ? pgtosList : (pgtosList?.erro ? [] : []);
  if (pgtos.length > 0) {
    const totalPgVal = pgtos.reduce((s, c) => s + window.parsePtBrFloat(c.valor || c.valorDocumento || '0'), 0);
    html += `<div class="glass-panel rounded-xl border border-orange-900/40 p-4 mb-4">
      <div class="flex items-center gap-3 mb-3">
        <span class="font-bold text-white">💰 Pagamentos Federais (${ano})</span>
        <span class="ml-auto text-orange-400 font-black text-sm">${_fmtCurrency(totalPgVal)}</span>
      </div>
      <div class="space-y-2">
        ${pgtos.map(c => {
          const objeto = c.descricao || c.objeto || c.especie?.descricao || 'Documento federal';
          const orgao  = c.unidadeGestora?.nome || c.orgaoSuperior?.nome || '—';
          const valor  = _fmtCurrency(window.parsePtBrFloat(c.valor || c.valorDocumento || '0'));
          const data   = _fmtDate(c.dataEmissao || c.dataInicio || '');
          return `<div class="bg-zinc-900 rounded-lg p-3 border border-zinc-800 text-xs flex items-start gap-2">
            <div class="flex-1 min-w-0">
              <div class="font-bold text-white truncate">${objeto}</div>
              <div class="text-zinc-500 mt-0.5">${orgao}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-orange-400 font-bold">${valor}</div>
              <div class="text-zinc-600">${data}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  el.innerHTML = html || `<div class="text-zinc-500 text-sm text-center py-8">Nenhum dado encontrado para este CNPJ.</div>`;
  _saveHistory('Raio-X PJ', cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'));
  _addExportBtn('pjResult', `RaioX_Empresa_${cnpj}`);
}

// ── 4. DETECTOR DE NEPOTISMO ──────────────────────────────────────────────────
async function runNepotismoSearch() {
  const nome = document.getElementById('nepotismoNome')?.value.trim() || '';
  if (nome.length < 3) {
    _error('nepotismoResults', 'Digite ao menos 3 caracteres para buscar.');
    return;
  }

  _loading('nepotismoResults', 'yellow');

  const data = await api.buscaServidores(nome);
  const el = document.getElementById('nepotismoResults');

  if (data.erro) { _error('nepotismoResults', data.erro); return; }

  const servidores = Array.isArray(data) ? data : (data.data || data.servidores || []);

  if (!servidores.length) {
    el.innerHTML = `<div class="text-center py-8 text-zinc-500 text-sm">Nenhum servidor encontrado com o nome <strong class="text-white">"${nome}"</strong>.</div>`;
    return;
  }

  const camaraKeywords = ['câmara', 'camara', 'congresso', 'deputado', 'legislativo', 'senado'];
  const isCamara = (s) => {
    const srv = s.servidor || s;
    const ficha = (s.fichasCargoEfetivo || s.fichasMilitar || [])[0] || {};
    const orgao = (srv.orgaoServidorExercicio?.nome || srv.orgaoServidorLotacao?.nome || ficha.orgaoExercicio || s.orgaoLotacao || '').toLowerCase();
    return camaraKeywords.some(k => orgao.includes(k));
  };

  el.innerHTML = `<div class="glass-panel rounded-xl border border-zinc-800 p-4">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-white font-bold">${servidores.length} servidor(es) encontrado(s)</span>
      <span class="text-xs text-zinc-500">com o nome "${nome}"</span>
    </div>
    <div class="space-y-2">
      ${servidores.map(s => {
        const srv = s.servidor || s;
        const ficha = (s.fichasCargoEfetivo || s.fichasMilitar || [])[0] || {};
        const nm = srv.pessoa?.nome || s.nome || s.nomeServidor || '—';
        const orgao = srv.orgaoServidorExercicio?.nome || srv.orgaoServidorLotacao?.nome || ficha.orgaoExercicio || s.orgaoLotacao || 'Órgão não informado';
        const cargo = ficha.cargo || srv.funcao?.descricaoFuncaoCargo || s.cargoEfetivo || s.cargo || '';
        const situacao = srv.situacao || ficha.situacaoServidor || s.situacaoVinculo || '';
        const remuneracao = s.remuneracaoBasicaBruta || s.remuneracao || 0;
        const camara = isCamara(s);
        return `<div class="flex items-start gap-3 p-3 rounded-lg border ${camara ? 'bg-violet-950/40 border-violet-700' : 'bg-zinc-900 border-zinc-800'}">
          <div class="text-xl">${camara ? '🏛️' : '👤'}</div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm ${camara ? 'text-violet-300' : 'text-white'}">${nm}</div>
            <div class="text-xs text-zinc-400 mt-0.5">${orgao}</div>
            ${cargo ? `<div class="text-xs text-zinc-500">${cargo}</div>` : ''}
            ${situacao ? `<div class="text-xs text-zinc-600">${situacao}</div>` : ''}
          </div>
          <div class="text-right shrink-0">
            ${remuneracao ? `<div class="text-xs font-bold text-emerald-400">${_fmtCurrency(remuneracao)}</div>` : ''}
            ${camara ? `<div class="text-[10px] bg-violet-800 text-violet-200 rounded px-2 py-0.5 mt-1">Câmara/Senado</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-600">
      ⚠️ Correspondência de sobrenome não prova nepotismo. Use como ponto de partida para investigação.
    </div>
  </div>`;
  _saveHistory('Nepotismo', nome);
  _addExportBtn('nepotismoResults', `Nepotismo_${nome}`);
}

// ── 5a. BUSCA DEPUTADO POR NOME (para Análise de Despesas) ───────────────────
async function searchDeputyForRisk() {
  const name = document.getElementById('riskDeputyName')?.value.trim() || '';
  if (name.length < 3) { _error('deputySearchResults', 'Digite ao menos 3 letras.'); return; }

  const box = document.getElementById('deputySearchResults');
  box.classList.remove('hidden');
  box.innerHTML = `<div class="text-xs text-zinc-500 animate-pulse py-2">Buscando deputados...</div>`;

  const data = await api.camara(`deputados?nome=${encodeURIComponent(name)}&itens=10&ordem=ASC&ordenarPor=nome`).catch(() => null);
  const lista = data?.dados || [];

  if (!lista.length) {
    box.innerHTML = `<div class="text-xs text-zinc-500 py-2">Nenhum deputado encontrado com esse nome.</div>`;
    return;
  }

  box.innerHTML = `<div class="flex flex-wrap gap-2">
    ${lista.map(d => `
      <button onclick="document.getElementById('riskDeputyId').value='${d.id}'; document.getElementById('deputySearchResults').classList.add('hidden'); runExpandedRisk();"
        class="flex items-center gap-2 bg-zinc-800 hover:bg-orange-950 border border-zinc-700 hover:border-orange-600 rounded-lg px-3 py-1.5 text-xs text-white transition">
        <img src="${d.urlFoto}" class="w-6 h-6 rounded-full object-cover">
        <span class="font-bold">${d.nome}</span>
        <span class="text-zinc-500">${d.siglaPartido}·${d.siglaUf}</span>
      </button>`).join('')}
  </div>`;
}

// ── 5. ANÁLISE AVANÇADA DE DESPESAS ──────────────────────────────────────────
async function runExpandedRisk() {
  const id = document.getElementById('riskDeputyId')?.value.trim() || '';
  if (!id) {
    _error('expandedRiskResult', 'Informe o ID do deputado.');
    return;
  }

  _loading('expandedRiskResult', 'orange');

  const data = await api.analyzeExpenses(id);
  const el = document.getElementById('expandedRiskResult');

  if (data.erro || data.status === 'error') {
    _error('expandedRiskResult', data.message || data.erro || 'Erro ao analisar despesas.');
    return;
  }

  const flags = data.flags || [];
  const riskOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => (riskOrder[a.risk] ?? 9) - (riskOrder[b.risk] ?? 9));

  const riskMap = {
    high:   { label: 'Alto',  cls: 'bg-red-950 border-red-700 text-red-300' },
    medium: { label: 'Médio', cls: 'bg-yellow-950 border-yellow-700 text-yellow-300' },
    low:    { label: 'Baixo', cls: 'bg-blue-950 border-blue-700 text-blue-300' },
  };

  const counts = flags.reduce((acc, f) => {
    acc[f.risk] = (acc[f.risk] || 0) + 1;
    return acc;
  }, {});

  el.innerHTML = `<div class="glass-panel rounded-xl border border-zinc-800 p-5 mb-5">
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex-1">
        <div class="text-xs text-zinc-500 uppercase font-bold">Despesas Analisadas</div>
        <div class="text-3xl font-black text-white">${data.total_analyzed}</div>
      </div>
      <div class="flex gap-3">
        ${Object.entries(counts).map(([r, n]) => `
          <div class="text-center px-3 py-2 rounded-lg border ${riskMap[r]?.cls || ''}">
            <div class="text-xl font-black">${n}</div>
            <div class="text-[10px] font-bold">${riskMap[r]?.label || r}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  ${flags.length === 0
    ? `<div class="text-center py-8 text-emerald-400 text-sm">
        <div class="text-3xl mb-2">✅</div>
        <strong>Nenhuma anomalia detectada</strong> nas ${data.total_analyzed} despesas analisadas.
      </div>`
    : `<div class="space-y-2">
        ${flags.map(f => {
          const rm = riskMap[f.risk] || riskMap.low;
          const tipo = f.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          const fornecedor = f.data?.nomeFornecedor || '';
          const cnpj = f.data?.cnpjCpfFornecedor || '';
          return `<div class="flex items-start gap-3 p-3 rounded-xl border ${rm.cls} bg-opacity-20">
            <span class="px-2 py-0.5 rounded text-[10px] font-black border shrink-0 ${rm.cls}">${rm.label}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-white">${f.desc}</div>
              ${fornecedor ? `<div class="text-xs text-zinc-400 mt-0.5">${fornecedor} ${cnpj ? `· ${cnpj}` : ''}</div>` : ''}
              <div class="text-xs text-zinc-600">${tipo}</div>
            </div>
            ${cnpj && cnpj.length === 14 ? `<button onclick="document.getElementById('pjCnpj').value='${cnpj}'; showRadarSubTab('pessoajuridica'); runPessoaJuridicaScan();"
              class="shrink-0 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition">
              🔍 Investigar
            </button>` : ''}
          </div>`;
        }).join('')}
      </div>`
  }`;
  _saveHistory('Despesas', `ID ${id}`);
  _addExportBtn('expandedRiskResult', `Despesas_${id}`);
}

// ── 6. CRUZAMENTO PF×PJ ───────────────────────────────────────────────────────
async function runCruzamentoPFPJ() {
  const nome = document.getElementById('cruzNome')?.value.trim() || '';
  const cpf  = (document.getElementById('cruzCpf')?.value  || '').replace(/\D/g, '');
  const cnpj = (document.getElementById('cruzCnpj')?.value || '').replace(/\D/g, '');

  if (!nome) {
    _error('cruzamentoResult', 'O nome é obrigatório para o cruzamento.');
    return;
  }

  _loading('cruzamentoResult', 'cyan');

  const data = await fetchApi('cruzamento_pfpj', { nome, cpf, cnpj });
  const el = document.getElementById('cruzamentoResult');

  if (data.erro) { _error('cruzamentoResult', data.erro); return; }

  // ── Calcular risco geral
  const pfFlags = [
    ...(data.pf?.pep  || []).length > 0 ? ['PEP']  : [],
    ...(data.pf?.ceis || []).length > 0 ? ['CEIS'] : [],
    ...(data.pf?.cnep || []).length > 0 ? ['CNEP'] : [],
  ];
  const servidoresArr = Array.isArray(data.servidores) ? data.servidores : [];
  const isCamaraServidor = servidoresArr.some(s => {
    const orgao = (s.orgaoServidorLotacao?.nome || s.orgaoLotacao || '').toLowerCase();
    return ['câmara', 'camara', 'congresso', 'legislativo', 'senado'].some(k => orgao.includes(k));
  });
  const temEmpresa   = !!data.empresa;
  const temQsaMatch  = !!data.qsa_match;
  const temContratos = (data.num_contratos || 0) > 0;
  const pjFlags = [
    ...(data.pj?.ceis || []).length > 0 ? ['CEIS-PJ'] : [],
    ...(data.pj?.cnep || []).length > 0 ? ['CNEP-PJ'] : [],
  ];

  const totalRiscos = pfFlags.length + (temQsaMatch ? 3 : 0) + (isCamaraServidor ? 2 : 0)
                    + pjFlags.length + (temContratos ? 1 : 0);
  const riskLevel = totalRiscos === 0 ? 'baixo' : totalRiscos <= 2 ? 'medio' : 'alto';
  const riskColors2 = { baixo: 'emerald', medio: 'yellow', alto: 'red' };
  const riskLabels2 = { baixo: '✅ Baixo Risco', medio: '⚠️ Risco Médio', alto: '🚨 Alto Risco' };
  const rc = riskColors2[riskLevel];
  const rl = riskLabels2[riskLevel];

  let html = `
  <!-- Cabeçalho do cruzamento -->
  <div class="glass-panel rounded-xl border border-zinc-800 p-5 mb-5">
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex-1">
        <div class="text-xs text-zinc-500 uppercase font-bold mb-1">Investigado</div>
        <div class="text-white font-bold text-lg">${data.pesquisa.nome || '—'}</div>
        ${data.pesquisa.cpf  ? `<div class="text-xs text-zinc-500">CPF: ${data.pesquisa.cpf}</div>` : ''}
        ${data.pesquisa.cnpj ? `<div class="text-xs text-zinc-500">CNPJ: ${data.pesquisa.cnpj}</div>` : ''}
      </div>
      <div class="px-4 py-2 rounded-lg bg-${rc}-950 border border-${rc}-700 text-${rc}-300 font-bold">${rl}</div>
    </div>

    <!-- Resumo visual do cruzamento -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800">
      <div class="text-center p-3 rounded-lg bg-zinc-900 border border-zinc-800">
        <div class="text-xl mb-1">${pfFlags.length > 0 ? '🚨' : '✅'}</div>
        <div class="text-xs text-zinc-400 font-bold">Sanções PF</div>
        <div class="text-sm font-black ${pfFlags.length > 0 ? 'text-red-400' : 'text-emerald-400'}">${pfFlags.length > 0 ? pfFlags.join(', ') : 'Nenhuma'}</div>
      </div>
      <div class="text-center p-3 rounded-lg bg-zinc-900 border ${isCamaraServidor ? 'border-violet-700' : 'border-zinc-800'}">
        <div class="text-xl mb-1">${servidoresArr.length > 0 ? '🏛️' : '—'}</div>
        <div class="text-xs text-zinc-400 font-bold">Servidor Federal</div>
        <div class="text-sm font-black ${isCamaraServidor ? 'text-violet-400' : servidoresArr.length ? 'text-yellow-400' : 'text-zinc-600'}">
          ${servidoresArr.length > 0 ? (isCamaraServidor ? 'Câmara/Senado' : `${servidoresArr.length} encontrado(s)`) : 'Não encontrado'}
        </div>
      </div>
      <div class="text-center p-3 rounded-lg bg-zinc-900 border ${temQsaMatch ? 'border-cyan-700' : 'border-zinc-800'}">
        <div class="text-xl mb-1">${temQsaMatch ? '🔗' : temEmpresa ? '🏢' : '—'}</div>
        <div class="text-xs text-zinc-400 font-bold">Sócio da Empresa</div>
        <div class="text-sm font-black ${temQsaMatch ? 'text-cyan-400' : 'text-zinc-600'}">
          ${temQsaMatch ? '✅ Confirmado' : temEmpresa ? 'Não identificado' : 'Sem empresa'}
        </div>
      </div>
      <div class="text-center p-3 rounded-lg bg-zinc-900 border ${temContratos ? 'border-orange-700' : 'border-zinc-800'}">
        <div class="text-xl mb-1">${temContratos ? '💰' : '—'}</div>
        <div class="text-xs text-zinc-400 font-bold">Contratos Federais</div>
        <div class="text-sm font-black ${temContratos ? 'text-orange-400' : 'text-zinc-600'}">
          ${temContratos ? `${data.num_contratos} contrato(s)` : 'Nenhum'}
        </div>
      </div>
    </div>
  </div>`;

  // ── Seção PF: Sanções
  const pfTotal = (data.pf?.pep?.length || 0) + (data.pf?.ceis?.length || 0) + (data.pf?.cnep?.length || 0);
  html += `<div class="glass-panel rounded-xl border border-zinc-800 p-4 mb-4">
    <div class="font-bold text-white mb-3 flex items-center gap-2">
      👤 Sanções da Pessoa Física
      <span class="ml-auto text-xs px-2 py-0.5 rounded border ${pfTotal > 0 ? 'bg-red-950 border-red-700 text-red-300' : 'bg-emerald-950 border-emerald-700 text-emerald-300'}">${pfTotal > 0 ? pfTotal + ' ocorrência(s)' : 'Limpo'}</span>
    </div>
    ${[['pep','PEP','Pessoa Politicamente Exposta','info'],['ceis','CEIS','Empresa/Pessoa Inidônea','high'],['cnep','CNEP','Empresa/Pessoa Punida','critical']].map(([key, label, desc, risk]) => {
      const items = data.pf?.[key] || [];
      return `<div class="mb-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded text-[10px] font-black border ${_riskBadge(risk)}">${label}</span>
          <span class="text-xs text-zinc-500">${desc}</span>
          <span class="ml-auto text-xs ${items.length > 0 ? 'text-red-400' : 'text-emerald-400'}">${items.length}</span>
        </div>
        ${items.map(item => `<div class="bg-zinc-900 rounded p-2 mb-1 text-xs border border-zinc-800">
          <span class="text-white">${item.sancionado?.nome || item.pessoa?.nome || item.nomePep || '—'}</span>
          <span class="text-zinc-500 ml-2">${item.tipoSancao?.descricaoResumida || item.tipoPep || '—'}</span>
        </div>`).join('') || '<div class="text-xs text-emerald-500 py-1 pl-2">Nenhuma ocorrência.</div>'}
      </div>`;
    }).join('')}
  </div>`;

  // ── Seção Servidores
  html += `<div class="glass-panel rounded-xl border border-zinc-800 p-4 mb-4">
    <div class="font-bold text-white mb-3">🏛️ Vínculo como Servidor Federal</div>
    ${servidoresArr.length === 0
      ? `<div class="text-xs text-zinc-500 text-center py-2">Nenhum servidor encontrado com esse nome.</div>`
      : servidoresArr.map(s => {
          const orgao = s.orgaoServidorLotacao?.nome || s.orgaoLotacao || '—';
          const camara = ['câmara','camara','congresso','legislativo','senado'].some(k => orgao.toLowerCase().includes(k));
          return `<div class="flex items-center gap-3 p-2 rounded-lg border ${camara ? 'bg-violet-950/40 border-violet-700' : 'bg-zinc-900 border-zinc-800'} mb-2">
            <div class="text-xl">${camara ? '🏛️' : '👤'}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold ${camara ? 'text-violet-300' : 'text-white'}">${s.nome || '—'}</div>
              <div class="text-xs text-zinc-400">${orgao}</div>
              ${s.cargoEfetivo || s.cargo ? `<div class="text-xs text-zinc-500">${s.cargoEfetivo || s.cargo}</div>` : ''}
            </div>
            ${camara ? `<span class="text-[10px] bg-violet-800 text-violet-200 rounded px-2 py-0.5">⚠️ Gabinete</span>` : ''}
          </div>`;
        }).join('')
    }
  </div>`;

  // ── Seção Empresa + QSA
  if (data.empresa) {
    const emp = data.empresa;
    html += `<div class="glass-panel rounded-xl border ${data.qsa_match ? 'border-cyan-700' : 'border-zinc-800'} p-4 mb-4">
      <div class="font-bold text-white mb-3 flex items-center gap-2">
        🏢 Empresa Investigada
        ${data.qsa_match ? `<span class="ml-auto px-2 py-0.5 rounded text-xs font-black bg-cyan-950 border border-cyan-700 text-cyan-300">🔗 SÓCIO IDENTIFICADO</span>` : ''}
      </div>
      <div class="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div><span class="text-zinc-500">Razão Social: </span><span class="text-white font-bold">${emp.razao_social || '—'}</span></div>
        <div><span class="text-zinc-500">Situação: </span><span class="text-white">${emp.situacao_cadastral || '—'}</span></div>
        <div><span class="text-zinc-500">Município: </span><span class="text-white">${emp.municipio || '—'}/${emp.uf || ''}</span></div>
        <div><span class="text-zinc-500">Início: </span><span class="text-white">${_fmtDate(emp.data_inicio)}</span></div>
      </div>
      ${(data.qsa || []).length > 0 ? `<div class="border-t border-zinc-800 pt-3">
        <div class="text-xs text-zinc-500 uppercase font-bold mb-2">Quadro Societário</div>
        <div class="space-y-1">
          ${data.qsa.map(s => `<div class="flex items-center gap-2 p-2 rounded ${s._match ? 'bg-cyan-950/50 border border-cyan-700' : 'bg-zinc-900 border border-zinc-800'}">
            <span class="text-sm">${s._match ? '🔗' : '👤'}</span>
            <span class="text-xs ${s._match ? 'text-cyan-300 font-bold' : 'text-zinc-300'}">${s.nome_socio || '—'}</span>
            <span class="text-xs text-zinc-600 ml-auto">${s.qualificacao_socio || ''}</span>
            ${s._match ? `<span class="text-[10px] bg-cyan-800 text-cyan-200 rounded px-2 py-0.5">MATCH</span>` : ''}
          </div>`).join('')}
        </div>
      </div>` : ''}
    </div>`;
  }

  // ── Seção Sanções PJ
  const pjTotal = (data.pj?.ceis?.length || 0) + (data.pj?.cnep?.length || 0);
  if (pjTotal > 0) {
    html += `<div class="glass-panel rounded-xl border border-red-900/50 p-4 mb-4">
      <div class="font-bold text-white mb-3">🚨 Sanções da Empresa (${pjTotal} ocorrência(s))</div>
      ${[['ceis','CEIS','high'],['cnep','CNEP','critical']].map(([key, label, risk]) => {
        const items = data.pj?.[key] || [];
        return items.length > 0 ? `<div class="mb-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-black border mr-2 ${_riskBadge(risk)}">${label}</span>
          ${items.map(item => `<div class="bg-zinc-900 rounded p-2 mt-1 text-xs border border-zinc-800">
            <span class="text-white">${item.sancionado?.nome || '—'}</span> —
            <span class="text-zinc-400">${item.tipoSancao?.descricaoResumida || '—'}</span>
          </div>`).join('')}
        </div>` : '';
      }).join('')}
    </div>`;
  }

  // ── Seção Contratos
  if ((data.contratos || []).length > 0) {
    html += `<div class="glass-panel rounded-xl border border-orange-900/50 p-4 mb-4">
      <div class="font-bold text-white mb-3 flex items-center gap-2">
        💰 Contratos Federais Recebidos
        <span class="ml-auto text-orange-400 font-black">${_fmtCurrency(data.total_contratos)}</span>
      </div>
      <div class="space-y-2">
        ${data.contratos.map(c => `<div class="bg-zinc-900 rounded-lg p-3 border border-zinc-800 text-xs">
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <div class="font-bold text-white">${c.objeto || c.descricao || 'Objeto não informado'}</div>
              <div class="text-zinc-500 mt-0.5">${c.orgaoSuperior?.nome || c.unidadeGestora?.nome || '—'}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-orange-400 font-bold">${_fmtCurrency(c.valorInicial || c.valor || 0)}</div>
              <div class="text-zinc-600">${_fmtDate(c.dataInicioVigencia || c.dataInicio || '')}</div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  el.innerHTML = html;
  _saveHistory('Cruzamento PF×PJ', nome);
  _addExportBtn('cruzamentoResult', `Cruzamento_${nome.replace(/\s+/g,'_')}`);
}

// ── Enter key listeners ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const pairs = [
    ['radarNome',       runRadarScan],
    ['radarCpf',        runRadarScan],
    ['radarCnpj',       runRadarScan],
    ['pfCpf',           runPessoaFisicaScan],
    ['pjCnpj',          runPessoaJuridicaScan],
    ['nepotismoNome',   runNepotismoSearch],
    ['riskDeputyName',  searchDeputyForRisk],
    ['riskDeputyId',    runExpandedRisk],
    ['cruzNome',        runCruzamentoPFPJ],
    ['cruzCpf',         runCruzamentoPFPJ],
    ['cruzCnpj',        runCruzamentoPFPJ],
  ];
  pairs.forEach(([id, fn]) => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') fn();
    });
  });
});

// ── initRadarTab: chamada pelo sistema de abas ao abrir o Radar ───────────────
function initRadarTab() {
  if (typeof showRadarSubTab === 'function') showRadarSubTab('sancoes');
  // Mostrar painel de histórico se houver consultas prévias
  const hist = JSON.parse(sessionStorage.getItem(_HIST_KEY) || '[]');
  const panel = document.getElementById('radarHistoryPanel');
  if (panel && hist.length > 0) panel.classList.remove('hidden');
  _renderHistory();
}

// ── Expose globals ─────────────────────────────────────────────────────────────
window.initRadarTab           = initRadarTab;
window.runRadarScan           = runRadarScan;
window.runPessoaFisicaScan    = runPessoaFisicaScan;
window.runPessoaJuridicaScan  = runPessoaJuridicaScan;
window.runNepotismoSearch     = runNepotismoSearch;
window.searchDeputyForRisk    = searchDeputyForRisk;
window.runExpandedRisk        = runExpandedRisk;
window.runCruzamentoPFPJ      = runCruzamentoPFPJ;
window.exportarRelatorio      = exportarRelatorio;
window._renderHistory         = _renderHistory;
