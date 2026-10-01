/**
 * help_inline.js — Blocos de ajuda contextuais por aba
 * Injeta um bloco colapsável "Como usar esta seção" no topo de cada aba.
 * Estado de colapso persistido via localStorage.
 */
(function () {
  'use strict';

  const STORE_PREFIX = 'hz_help_';

  const AJUDA = {
    radar: {
      titulo: 'Como usar o Radar Anti-Corrupção',
      texto:  'Digite o <strong>nome, CPF ou CNPJ</strong> de uma pessoa ou empresa no campo abaixo e clique em Buscar. O sistema verifica automaticamente se ela aparece em listas oficiais do governo federal (empresas punidas, servidores expulsos, pessoas investigadas).',
      dica:   'Não precisa saber o CNPJ — só o nome completo já funciona na maioria dos casos.',
    },
    politicos: {
      titulo: 'Como pesquisar Deputados Federais',
      texto:  'Escolha um <strong>estado</strong> para ver os deputados daquela região, ou deixe em branco para ver todos os 513. Você pode também digitar um <strong>nome</strong> no campo de busca. Clique em qualquer deputado para ver seus gastos, votos e dados detalhados.',
      dica:   'O Brasil tem 513 deputados federais — o número por estado é proporcional à população.',
    },
    senadores: {
      titulo: 'Como pesquisar Senadores',
      texto:  'Cada card mostra um senador com foto, nome, partido e estado. <strong>Clique no card</strong> para abrir o perfil completo com histórico de votos, comissões e dados de mandato. Use a busca para encontrar pelo nome.',
      dica:   'O Brasil tem 81 senadores — exatamente 3 por estado, independente da população.',
    },
    gestao: {
      titulo: 'Como usar Gestão & Finanças',
      texto:  'Esta seção mostra como o dinheiro público federal é gasto. Selecione uma das abas acima para ver gastos com <strong>cartões corporativos</strong>, <strong>contratos públicos</strong> ou o <strong>orçamento executado</strong>. Use os filtros de data e estado para refinar os resultados.',
      dica:   'Os dados vêm direto do SIAFI — o sistema oficial de contabilidade do governo federal.',
    },
    orcamento: {
      titulo: 'Como usar a seção de Orçamento',
      texto:  'Veja o orçamento aprovado e o quanto realmente foi gasto pelo governo federal. Selecione o <strong>estado ou município</strong> e clique em Pesquisar. Os gráficos mostram como o dinheiro foi distribuído.',
      dica:   'O orçamento é aprovado pelo Congresso todo ano — aqui você acompanha o que foi efetivamente executado.',
    },
    risco: {
      titulo: 'Como usar a Análise de Risco',
      texto:  'Selecione um <strong>deputado ou senador</strong> e o sistema calcula automaticamente um <strong>score de risco</strong> com base em dados públicos: ausências, gastos atípicos, fornecedores suspeitos e ocorrências em bases de sanções.',
      dica:   'Score acima de 60 indica padrão que merece atenção. Acima de 80 é considerado crítico.',
    },
    municipio: {
      titulo: 'Como usar a seção Minha Cidade',
      texto:  'Selecione seu <strong>estado e município</strong> para ver repasses federais, obras, servidores e representantes eleitos da sua região. Clique em "Salvar" para fixar sua cidade e acessar mais rápido nas próximas visitas.',
      dica:   'Os dados incluem transferências constitucionais (FPM, SUS, educação) e convênios diretos.',
    },
    viagens: {
      titulo: 'Como consultar Viagens a Serviço',
      texto:  'Pesquise por <strong>nome</strong> ou <strong>CPF</strong> para ver as viagens realizadas a serviço do governo e os valores de diárias pagos. Você pode filtrar por período e órgão para análises específicas.',
      dica:   'Diárias são os valores pagos para cobrir alimentação e hospedagem durante viagens a trabalho.',
    },
    licitacoes: {
      titulo: 'Como consultar Licitações e Contratos',
      texto:  'Pesquise contratos e licitações do governo federal por <strong>estado, período ou órgão</strong>. Clique em qualquer resultado para ver os detalhes do contrato, incluindo o fornecedor e os valores.',
      dica:   'Licitação é o processo obrigatório pelo qual o governo escolhe o fornecedor com o melhor preço. Contratos sem licitação precisam de justificativa legal.',
    },
    servidores: {
      titulo: 'Como pesquisar Servidores Federais',
      texto:  'Pesquise por <strong>nome ou órgão</strong> para encontrar servidores do poder executivo federal. Os dados incluem cargo, órgão de lotação e faixa de remuneração.',
      dica:   'Esta base cobre servidores do executivo federal. Para estados e municípios, cada ente tem seu próprio portal.',
    },
    comparador: {
      titulo: 'Como usar o Comparador',
      texto:  'Selecione <strong>dois deputados ou entidades</strong> para comparar seus dados lado a lado: gastos, presença em votações, partidos e ocorrências em bases de sanções.',
      dica:   'Útil para comparar o desempenho de dois representantes do mesmo estado ou partido.',
    },
    mapa: {
      titulo: 'Como usar o Mapa de Gastos',
      texto:  'O mapa mostra a distribuição geográfica dos gastos e repasses federais. <strong>Clique em um estado</strong> para ver os detalhes. Use os filtros para selecionar tipo de gasto e período.',
      dica:   'Cores mais escuras indicam maiores volumes de recursos. Passe o cursor sobre o mapa para ver os valores.',
    },
  };

  function criarBloco(tabId) {
    const info = AJUDA[tabId];
    if (!info) return null;

    const chave      = STORE_PREFIX + tabId;
    const colapsado  = localStorage.getItem(chave) === '1';

    const bloco = document.createElement('div');
    bloco.className = 'hz-help-block';
    bloco.style.cssText = [
      'background:rgba(30,58,138,0.10)',
      'border:1px solid rgba(59,130,246,0.22)',
      'border-radius:12px',
      'margin-bottom:18px',
      'overflow:hidden',
    ].join(';');

    const cabecalho = document.createElement('button');
    cabecalho.style.cssText = [
      'width:100%',
      'display:flex',
      'align-items:center',
      'gap:8px',
      'padding:10px 14px',
      'background:none',
      'border:none',
      'cursor:pointer',
      'text-align:left',
    ].join(';');

    const seta = document.createElement('span');
    seta.className = 'hz-help-seta';
    seta.style.cssText = 'color:#60a5fa;font-size:11px;transition:transform .2s;margin-left:auto;flex-shrink:0;';
    seta.textContent = colapsado ? '▼' : '▲';

    cabecalho.innerHTML =
      '<span style="font-size:15px;">❓</span>' +
      '<span style="color:#93c5fd;font-size:13px;font-weight:700;flex:1;text-align:left;">' + info.titulo + '</span>';
    cabecalho.appendChild(seta);

    const corpo = document.createElement('div');
    corpo.style.cssText = [
      'padding:0 14px 12px 38px',
      'display:' + (colapsado ? 'none' : 'block'),
    ].join(';');
    corpo.innerHTML =
      '<p style="color:#bfdbfe;font-size:13px;line-height:1.65;margin:0 0 6px;">' + info.texto + '</p>' +
      (info.dica
        ? '<p style="color:#7dd3fc;font-size:12px;margin:0;"><strong>💡 Dica:</strong> ' + info.dica + '</p>'
        : '');

    cabecalho.addEventListener('click', function () {
      const aberto = corpo.style.display !== 'none';
      corpo.style.display = aberto ? 'none' : 'block';
      seta.textContent    = aberto ? '▼' : '▲';
      localStorage.setItem(chave, aberto ? '1' : '0');
    });

    bloco.appendChild(cabecalho);
    bloco.appendChild(corpo);
    return bloco;
  }

  document.addEventListener('DOMContentLoaded', function () {
    Object.keys(AJUDA).forEach(function (tabId) {
      const container = document.getElementById('content-' + tabId);
      if (!container) return;
      const bloco = criarBloco(tabId);
      if (!bloco) return;
      container.insertBefore(bloco, container.firstChild);
    });
  });
})();
