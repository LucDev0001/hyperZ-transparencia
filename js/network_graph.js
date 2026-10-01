// ═══════════════════════════════════════════════════════════════════════════
//  Radar de Conexões — Super Mapa Mental
//  Cruza: Deputados · Empresas · Servidores · Sanções · PEP · Notícias
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Estado ────────────────────────────────────────────────────────────────
  let network  = null;
  let nodes    = null;
  let edges    = null;
  let nodeId   = 0;
  let edgeId   = 0;
  const expanded = new Set(); // nodeIds já expandidos

  // Paleta por tipo
  const COLORS = {
    deputado:  { bg: '#4c1d95', border: '#7c3aed', font: '#e9d5ff', shape: 'ellipse' },
    senador:   { bg: '#1e3a5f', border: '#3b82f6', font: '#bfdbfe', shape: 'ellipse' },
    empresa:   { bg: '#7c2d12', border: '#f97316', font: '#fed7aa', shape: 'box' },
    servidor:  { bg: '#1c3329', border: '#22c55e', font: '#bbf7d0', shape: 'ellipse' },
    sancao:    { bg: '#7f1d1d', border: '#ef4444', font: '#fecaca', shape: 'diamond' },
    pep:       { bg: '#713f12', border: '#eab308', font: '#fef08a', shape: 'star' },
    noticia:   { bg: '#1e1b4b', border: '#818cf8', font: '#c7d2fe', shape: 'triangle' },
    proposta:  { bg: '#064e3b', border: '#10b981', font: '#a7f3d0', shape: 'box' },
    partido:   { bg: '#374151', border: '#9ca3af', font: '#e5e7eb', shape: 'ellipse' },
    beneficio: { bg: '#4a1942', border: '#c084fc', font: '#f3e8ff', shape: 'diamond' },
    search:    { bg: '#0f172a', border: '#a78bfa', font: '#ffffff',  shape: 'ellipse' },
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  function newNodeId() { return ++nodeId; }
  function newEdgeId() { return ++edgeId; }

  function makeNode(type, label, options = {}) {
    const c = COLORS[type] || COLORS.search;
    return {
      id:          newNodeId(),
      label:       _wrap(label, 16),
      title:       options.tooltip || label,
      type,
      color:       { background: c.bg, border: c.border, highlight: { background: c.bg, border: '#fff' } },
      font:        { color: c.font, size: 11, face: 'system-ui' },
      shape:       options.shape || c.shape,
      size:        options.size || (type === 'deputado' ? 28 : 20),
      borderWidth: 2,
      meta:        options.meta || {},
    };
  }

  function makeEdge(from, to, label = '', options = {}) {
    return {
      id:     newEdgeId(),
      from, to,
      label:  label.length > 25 ? label.substring(0, 24) + '…' : label,
      color:  { color: options.color || '#52525b', highlight: '#a78bfa' },
      font:   { color: '#a1a1aa', size: 9, align: 'middle' },
      arrows: options.arrows || 'to',
      dashes: options.dashes || false,
      width:  options.width || 1,
    };
  }

  function _wrap(str, len) {
    if (!str) return '—';
    const words = str.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      if ((line + w).length > len) { lines.push(line.trim()); line = ''; }
      line += w + ' ';
    }
    if (line.trim()) lines.push(line.trim());
    return lines.slice(0, 3).join('\n');
  }

  function _setStatus(txt) {
    const s1 = document.getElementById('ng-status');
    const s2 = document.getElementById('ng-modal-status');
    if (s1) s1.textContent = txt;
    if (s2) s2.textContent = txt;
  }

  function fmtCurrency(v) {
    if (!v) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);
  }

  function parseBR(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }

  // ── Inicializar vis-network ────────────────────────────────────────────────
  // Sempre usa a modal — resolve o problema de dimensões em qualquer viewport
  function _getCanvasContainer() {
    return document.getElementById('ng-modal-canvas');
  }

  function initNetwork() {
    const container = _getCanvasContainer();
    if (!container) { console.error('[NG] container não encontrado:', _isDesktop() ? 'ng-modal-canvas' : 'ng-canvas'); return; }
    if (typeof vis === 'undefined') { console.error('[NG] vis-network não carregado'); return; }

    try {
      nodes = new vis.DataSet([]);
      edges = new vis.DataSet([]);

      network = new vis.Network(container, { nodes, edges }, {
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based',
          forceAtlas2Based: { gravitationalConstant: -60, springLength: 120, springConstant: 0.05 },
          stabilization: { iterations: 150 },
        },
        interaction: { hover: true, tooltipDelay: 200, navigationButtons: true, keyboard: false },
        nodes: { borderWidth: 2, shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', size: 8 } },
        edges: { smooth: { type: 'dynamic' }, shadow: false },
        layout: { improvedLayout: false },
      });
    } catch(err) {
      console.error('[NG] Erro ao criar vis.Network:', err);
      nodes = null; edges = null; network = null;
      return;
    }

    // Clique em nó → mostrar painel
    network.on('click', e => {
      if (e.nodes.length) showNodePanel(nodes.get(e.nodes[0]));
    });

    // Duplo-clique → expandir conexões
    network.on('doubleClick', e => {
      if (e.nodes.length) {
        const node = nodes.get(e.nodes[0]);
        if (!expanded.has(node.id)) expandNode(node);
      }
    });

    network.on('stabilizationIterationsDone', () => {
      network.setOptions({ physics: { enabled: false } });
      network.fit();
    });
  }

  // ── Modal (desktop) ───────────────────────────────────────────────────────
  window.ngOpenModal = function() {
    const modal = document.getElementById('ng-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Inicializa rede dentro da modal se ainda não foi feito
    if (!network) {
      setTimeout(() => {
        initNetwork();
        _setStatus('Pronto. Busque um deputado ou CNPJ para começar.');
      }, 80);
    } else {
      // Rede já existe — redimensionar para o container da modal
      setTimeout(() => network.fit(), 100);
    }
  };

  window.ngCloseModal = function() {
    const modal = document.getElementById('ng-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  // Fechar modal ao pressionar Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.ngCloseModal();
  });

  // ── Painel lateral do nó selecionado ─────────────────────────────────────
  function showNodePanel(node) {
    const panel = document.getElementById('ng-modal-panel');
    if (!panel) return;

    const typeLabels = {
      deputado: '🏛️ Deputado', empresa: '🏢 Empresa', servidor: '👤 Servidor',
      sancao: '🚨 Sanção', pep: '⚠️ PEP', noticia: '📰 Notícia',
      proposta: '📋 Proposta', partido: '🚩 Partido', beneficio: '🎁 Benefício',
    };
    const m = node.meta || {};
    const tipo = typeLabels[node.type] || node.type;
    const expandBtn = !expanded.has(node.id) && ['deputado', 'empresa', 'partido'].includes(node.type)
      ? `<button onclick="window.ngExpand(${node.id})" class="w-full mt-3 bg-violet-700 hover:bg-violet-600 text-white text-xs font-bold py-2 rounded-lg transition">
           ⚡ Expandir conexões
         </button>` : '';

    let rows = '';
    if (m.siglaPartido) rows += `<div class="flex justify-between text-xs"><span class="text-zinc-500">Partido</span><span class="text-white font-bold">${m.siglaPartido}</span></div>`;
    if (m.siglaUf)      rows += `<div class="flex justify-between text-xs"><span class="text-zinc-500">UF</span><span class="text-white">${m.siglaUf}</span></div>`;
    if (m.cnpj)         rows += `<div class="flex justify-between text-xs"><span class="text-zinc-500">CNPJ</span><span class="text-white font-mono text-[10px]">${m.cnpj}</span></div>`;
    if (m.situacao)     rows += `<div class="flex justify-between text-xs"><span class="text-zinc-500">Situação</span><span class="${m.situacao === 'ATIVA' ? 'text-green-400' : 'text-orange-400'} font-bold">${m.situacao}</span></div>`;
    if (m.valor)        rows += `<div class="flex justify-between text-xs"><span class="text-zinc-500">Valor</span><span class="text-orange-400 font-bold">${fmtCurrency(m.valor)}</span></div>`;
    if (m.orgao)        rows += `<div class="flex justify-between text-xs"><span class="text-zinc-500">Órgão</span><span class="text-white text-right" style="max-width:60%">${m.orgao}</span></div>`;
    if (m.cargo)        rows += `<div class="flex justify-between text-xs"><span class="text-zinc-500">Cargo</span><span class="text-white">${m.cargo}</span></div>`;

    const fotoHtml = m.urlFoto
      ? `<img src="${m.urlFoto}" alt="${node.label}" class="w-16 h-20 object-cover rounded-lg float-right ml-3 mb-2 border border-white/10">`
      : '';
    const extraId = 'ng-modal-panel-extra';
    panel.innerHTML = `
      <div class="text-[10px] font-bold text-violet-400 uppercase mb-2">${tipo}</div>
      ${fotoHtml}
      <div class="font-bold text-white text-sm mb-3 leading-snug">${node.label.replace(/\n/g, ' ')}</div>
      <div class="space-y-2 mb-3 clear-both">${rows}</div>
      ${expandBtn}
      <div id="${extraId}" class="mt-3 space-y-2 text-xs text-zinc-500"></div>
    `;
    panel.classList.remove('hidden');
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
  }

  // ── Expandir nó ──────────────────────────────────────────────────────────
  window.ngExpand = function(id) {
    const node = nodes.get(id);
    if (node) expandNode(node);
  };

  async function expandNode(node) {
    if (expanded.has(node.id)) return;
    expanded.add(node.id);

    // Visual feedback
    nodes.update({ id: node.id, borderWidth: 4 });
    _setStatus(`⚡ Expandindo: ${node.label.replace(/\n/g, ' ')}...`);

    try {
      if (node.type === 'deputado') await expandDeputado(node);
      else if (node.type === 'empresa') await expandEmpresa(node);
      else if (node.type === 'partido') await expandPartido(node);
    } catch(e) {
      console.error('Expand error:', e);
    }

    _setStatus('Clique em um nó para ver detalhes. Duplo-clique para expandir.');
  }

  // ── Expandir Deputado ────────────────────────────────────────────────────
  async function expandDeputado(node) {
    const id = node.meta.id;
    const year = new Date().getFullYear() - 1;

    // Paralelo: despesas + propostas + sanções
    const [despesasRaw, sancoes, propostasRaw] = await Promise.all([
      api.camara(`deputados/${id}/despesas?ano=${year}&itens=100`).catch(() => null),
      api.scanCorrupcao(node.meta.nome || node.label.replace(/\n/g,' '), '', '').catch(() => null),
      api.camara(`proposicoes?idDeputadoAutor=${id}&ano=${year}&itens=20&ordem=DESC&ordenarPor=id`).catch(() => null),
    ]);

    // Partido
    if (node.meta.siglaPartido && !_nodeExistsByLabel(node.meta.siglaPartido)) {
      const pNode = makeNode('partido', node.meta.siglaPartido, {
        size: 18,
        meta: { sigla: node.meta.siglaPartido },
      });
      nodes.add(pNode);
      edges.add(makeEdge(node.id, pNode.id, 'filiado', { color: '#6d28d9' }));
    }

    // Sanções
    if (sancoes && sancoes.total_ocorrencias > 0) {
      Object.entries(sancoes.bases || {}).forEach(([, db]) => {
        if (!db.count) return;
        (db.items || []).slice(0, 2).forEach(item => {
          const label = item.tipoSancao?.descricaoResumida || db.meta?.nome || 'Sanção';
          const sNode = makeNode('sancao', label, {
            size: 18,
            tooltip: `${db.meta?.nome}: ${label}\n${item.dataInicioSancao || ''}`,
            meta: { tipo: db.meta?.nome, descricao: label },
          });
          nodes.add(sNode);
          edges.add(makeEdge(node.id, sNode.id, db.meta?.nome, { color: '#ef4444', width: 2 }));
        });
      });
    }

    // Empresas das despesas (top 8 por valor)
    const despesas = (despesasRaw?.dados || despesasRaw || []);
    const byEmpresa = {};
    despesas.forEach(d => {
      const cnpj = d.cnpjCpfFornecedor;
      const nome = d.nomeFornecedor || 'Fornecedor';
      if (!cnpj || cnpj.length < 8) return;
      if (!byEmpresa[cnpj]) byEmpresa[cnpj] = { nome, total: 0, cnpj };
      byEmpresa[cnpj].total += parseBR(d.valorLiquido || d.valor || '0');
    });

    const top = Object.values(byEmpresa).sort((a,b) => b.total - a.total).slice(0, 5);
    top.forEach(emp => {
      if (_nodeExistsByMeta('cnpj', emp.cnpj)) return;
      const eNode = makeNode('empresa', emp.nome, {
        tooltip: `CNPJ: ${emp.cnpj}\nTotal: ${fmtCurrency(emp.total)}`,
        meta: { cnpj: emp.cnpj, nome: emp.nome, valor: emp.total },
      });
      nodes.add(eNode);
      edges.add(makeEdge(node.id, eNode.id, fmtCurrency(emp.total), {
        color: '#f97316', width: Math.min(1 + emp.total / 50000, 4),
      }));
    });

    // Propostas (top 5)
    const propostas = (propostasRaw?.dados || []).slice(0, 3);
    propostas.forEach(p => {
      const label = `${p.siglaTipo || 'PL'} ${p.numero}/${p.ano}`;
      const pNode = makeNode('proposta', label, {
        tooltip: p.ementa ? p.ementa.substring(0, 120) : label,
        size: 15,
        meta: { numero: p.numero, tipo: p.siglaTipo, ementa: p.ementa },
      });
      nodes.add(pNode);
      edges.add(makeEdge(node.id, pNode.id, 'autoria', { color: '#10b981', dashes: true }));
    });

    _rerunPhysics();
  }

  // ── Expandir Empresa ─────────────────────────────────────────────────────
  async function expandEmpresa(node) {
    const cnpj = node.meta.cnpj;
    if (!cnpj) return;

    const cleanCnpj = cnpj.replace(/\D/g, '');

    const [empresa, sancoes, contratos] = await Promise.all([
      api.brasilApi(`cnpj/v1/${cleanCnpj}`).catch(() => null),
      api.scanCorrupcao('', '', cleanCnpj).catch(() => null),
      api.portal(`despesas/documentos-por-favorecido?codigoPessoa=${cleanCnpj}&fase=3&ano=${new Date().getFullYear()}&pagina=1`).catch(() => null),
    ]);

    // Sócios (QSA)
    if (empresa?.qsa) {
      empresa.qsa.slice(0, 4).forEach(socio => {
        const sNode = makeNode('servidor', socio.nome_socio, {
          tooltip: `Sócio: ${socio.qualificacao_socio}`,
          size: 16,
          meta: { nome: socio.nome_socio, cargo: socio.qualificacao_socio },
        });
        nodes.add(sNode);
        edges.add(makeEdge(node.id, sNode.id, socio.qualificacao_socio, { color: '#22c55e', dashes: true }));
      });
    }

    // Sanções
    if (sancoes?.total_ocorrencias > 0) {
      Object.entries(sancoes.bases || {}).forEach(([, db]) => {
        if (!db.count) return;
        const sNode = makeNode('sancao', db.meta?.nome || 'Sanção', {
          tooltip: `${db.meta?.desc} — ${db.count} registro(s)`,
          size: 16,
          meta: { tipo: db.meta?.nome, count: db.count },
        });
        nodes.add(sNode);
        edges.add(makeEdge(node.id, sNode.id, `${db.count} registro(s)`, { color: '#ef4444', width: 2 }));
      });
    }

    // Pagamentos recebidos
    const docs = Array.isArray(contratos) ? contratos.slice(0, 3) : [];
    docs.forEach(d => {
      const orgao = d.unidadeGestora?.nome || d.orgao || 'Órgão Federal';
      if (_nodeExistsByLabel(orgao)) return;
      const oNode = makeNode('partido', orgao, {
        tooltip: `Órgão pagador\nValor: ${fmtCurrency(parseBR(d.valor || '0'))}`,
        size: 14,
        meta: { orgao, valor: parseBR(d.valor || '0') },
      });
      nodes.add(oNode);
      edges.add(makeEdge(oNode.id, node.id, fmtCurrency(parseBR(d.valor || '0')), { color: '#f59e0b' }));
    });

    _rerunPhysics();
  }

  // ── Expandir Partido ─────────────────────────────────────────────────────
  async function expandPartido(node) {
    const sigla = node.meta.sigla || node.label.replace(/\n/g, ' ').trim();
    const data = await api.camara(`deputados?siglaPartido=${sigla}&itens=10`).catch(() => null);
    const deps = (data?.dados || []).slice(0, 6);
    deps.forEach(dep => {
      if (_nodeExistsByMeta('id', dep.id)) return;
      const dNode = makeNode('deputado', dep.nome, {
        image: dep.urlFoto,
        tooltip: `${dep.nome}\n${dep.siglaUf} — ${dep.siglaPartido}`,
        size: 22,
        meta: { id: dep.id, nome: dep.nome, siglaPartido: dep.siglaPartido, siglaUf: dep.siglaUf, foto: dep.urlFoto },
      });
      nodes.add(dNode);
      edges.add(makeEdge(node.id, dNode.id, dep.siglaUf, { color: '#7c3aed' }));
    });
    _rerunPhysics();
  }

  // ── Helpers internos ─────────────────────────────────────────────────────
  function _nodeExistsByLabel(label) {
    return nodes.get({ filter: n => n.label.includes(label.substring(0, 12)) }).length > 0;
  }
  function _nodeExistsByMeta(key, val) {
    return nodes.get({ filter: n => n.meta?.[key] == val }).length > 0;
  }
  function _rerunPhysics() {
    if (!network) return;
    network.setOptions({ physics: { enabled: true } });
    setTimeout(() => {
      network.setOptions({ physics: { enabled: false } });
      network.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    }, 2500);
    // fit parcial imediato para não deixar tela em branco enquanto física roda
    setTimeout(() => network.fit(), 300);
  }

  // ── Busca inicial ─────────────────────────────────────────────────────────
  window.ngSearch = async function() {
    const q = document.getElementById('ng-search-input')?.value?.trim();
    if (!q || q.length < 3) return;

    _setStatus(`🔍 Buscando "${q}"...`);

    // Garante que a rede está inicializada antes de prosseguir
    if (!network) {
      window.ngOpenModal(); // abre modal (funciona em qualquer tamanho de tela)
      // Aguarda até network estar pronto (máx 3s)
      try {
        await new Promise((resolve, reject) => {
          let tries = 0;
          const check = setInterval(() => {
            if (network && nodes) { clearInterval(check); resolve(); }
            else if (++tries > 60) { clearInterval(check); reject(new Error('timeout')); }
          }, 50);
        });
      } catch {
        _setStatus('Não foi possível inicializar o mapa. Clique na aba "Radar Conexões" e tente novamente.');
        return;
      }
    }

    // Detectar se é CNPJ
    const cleanQ = q.replace(/\D/g, '');
    if (cleanQ.length === 14) {
      await _addCompanyBySearch(cleanQ);
      return;
    }

    // Buscar como deputado
    const data = await api.camara(`deputados?nome=${encodeURIComponent(q)}&itens=8`).catch(() => null);
    const deps = data?.dados || [];

    if (!deps.length) {
      _setStatus(`Nenhum deputado encontrado. Tente o CNPJ de uma empresa.`);
      return;
    }

    // Se um único resultado, adiciona direto
    if (deps.length === 1) {
      _addDeputadoNode(deps[0]);
      _setStatus('Deputado adicionado. Duplo-clique para expandir conexões.');
      return;
    }

    // Mostrar lista de seleção
    const list = document.getElementById('ng-search-results');
    if (list) {
      list.innerHTML = deps.map(d => `
        <button onclick="window.ngAddDeputado(${d.id},'${d.nome.replace(/'/g,"\\'")}','${d.siglaPartido}','${d.siglaUf}','${d.urlFoto || ''}')"
          class="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded-lg transition text-xs flex items-center gap-2">
          ${d.urlFoto ? `<img src="${d.urlFoto}" class="w-7 h-7 rounded-full object-cover flex-shrink-0">` : '<div class="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0"></div>'}
          <div>
            <div class="font-bold text-white">${d.nome}</div>
            <div class="text-zinc-500">${d.siglaPartido} · ${d.siglaUf}</div>
          </div>
        </button>
      `).join('');
      list.classList.remove('hidden');
    }
    _setStatus(`${deps.length} resultado(s) encontrado(s). Selecione um.`);
  };

  window.ngAddDeputado = async function(id, nome, partido, uf, foto) {
    document.getElementById('ng-search-results')?.classList.add('hidden');
    if (!network || !nodes) return; // segurança
    _addDeputadoNode({ id, nome, siglaPartido: partido, siglaUf: uf, urlFoto: foto });
    _setStatus('Deputado adicionado. Duplo-clique para expandir conexões.');
  };

  async function _addCompanyBySearch(cnpj) {
    _setStatus(`Buscando empresa...`);
    const emp = await api.brasilApi(`cnpj/v1/${cnpj}`).catch(() => null);
    if (!emp || emp.status === 404) { _setStatus('Empresa não encontrada.'); return; }
    const eNode = makeNode('empresa', emp.razao_social || cnpj, {
      tooltip: `CNPJ: ${cnpj}\n${emp.razao_social}\nSituação: ${emp.situacao_cadastral}`,
      meta: { cnpj, nome: emp.razao_social, situacao: emp.situacao_cadastral },
    });
    nodes.add(eNode);
    network.fit();
    _setStatus('Empresa adicionada. Duplo-clique para expandir conexões.');
    showNodePanel(eNode);
  }

  function _addDeputadoNode(dep) {
    if (_nodeExistsByMeta('id', dep.id)) return;
    const dNode = makeNode('deputado', dep.nome, {
      tooltip: `${dep.nome}\n${dep.siglaUf} — ${dep.siglaPartido}`,
      size: 28,
      meta: { id: dep.id, nome: dep.nome, siglaPartido: dep.siglaPartido, siglaUf: dep.siglaUf, urlFoto: dep.urlFoto },
    });
    nodes.add(dNode);
    network.fit();
    showNodePanel(dNode);
  }

  // ── Limpar grafo ──────────────────────────────────────────────────────────
  window.ngClear = function() {
    nodes.clear();
    edges.clear();
    expanded.clear();
    nodeId = 0; edgeId = 0;
    document.getElementById('ng-panel')?.classList.add('hidden');
    document.getElementById('ng-modal-panel')?.classList.add('hidden');
    _setStatus('Grafo limpo. Faça uma nova busca.');
  };

  // ── Exportar como PNG ─────────────────────────────────────────────────────
  window.ngExport = function() {
    if (!network) return;
    const canvas = document.querySelector('#ng-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'radar_conexoes.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // ── Inicialização ─────────────────────────────────────────────────────────
  window.initNetworkGraph = function() {
    // Apenas pré-carrega a rede ao clicar na tab (sem abrir a modal ainda)
    // A modal abre quando o usuário busca ou clica em "Abrir Mapa"
  };

})();
