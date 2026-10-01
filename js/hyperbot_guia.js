/**
 * hyperbot_guia.js — Guia interativo do Portal HyperZ Transparência
 *
 * Fornece ao HyperBot uma base de conhecimento completa de todas as seções
 * do portal, com descrições, dicas, exemplos de uso e navegação guiada.
 *
 * Sem dependência de IA ou serviços externos — tudo local.
 * Depende de: hyperbot_chat.js, hyperbot_brain.js
 */
(function () {
  "use strict";

  // ════════════════════════════════════════════════════════════════════════
  //  BASE DE CONHECIMENTO — todas as seções do portal
  // ════════════════════════════════════════════════════════════════════════
  const SECOES = {
    politicos: {
      id: "politicos",
      nome: "Deputados Federais",
      icone: "👔",
      cor: "#a78bfa",
      descricao: "Consulte todos os 513 deputados federais em exercício na Câmara dos Deputados.",
      oque_fazer: [
        "Buscar deputado por nome, partido ou estado",
        "Ver foto, partido, UF e situação do mandato",
        "Acessar gastos da Cota Parlamentar (CEAP)",
        "Ver histórico de votações",
        "Verificar processos judiciais e sanções",
        "Gerar dossiê completo com score de risco",
      ],
      dicas: [
        "Digite o nome parcial — ex: 'Lula' mostra todos os deputados com esse nome",
        "Clique em um deputado para abrir o perfil completo no HyperBot",
        "Use 'Investigação completa' no perfil para gerar um dossiê automático",
      ],
      exemplo_chat: ["ver Bolsonaro", "deputados de SP", "meu deputado federal"],
      relacionadas: ["radar", "risco", "comparador"],
    },

    senadores: {
      id: "senadores",
      nome: "Senadores",
      icone: "🏛️",
      cor: "#60a5fa",
      descricao: "Consulte os 81 senadores da República em exercício no Senado Federal.",
      oque_fazer: [
        "Buscar senador por nome, partido ou estado",
        "Ver perfil, foto e informações de mandato",
        "Analisar votações e posicionamentos",
        "Verificar sanções e processos judiciais",
      ],
      dicas: [
        "Use 'senador [nome]' no chat para buscar diretamente",
        "Os dados vêm da API oficial do Senado Federal",
      ],
      exemplo_chat: ["senador Flávio Bolsonaro", "senadores do PT", "ver senadores de MG"],
      relacionadas: ["politicos", "radar"],
    },

    radar: {
      id: "radar",
      nome: "Radar Anti-Corrupção",
      icone: "🔍",
      cor: "#f87171",
      descricao: "Varredura em 5 bases de dados oficiais do Governo Federal: CEIS, CNEP, CEAF, CEPIM e PEP.",
      oque_fazer: [
        "Pesquisar qualquer nome, CPF ou CNPJ nas 5 bases simultaneamente",
        "Verificar se uma empresa ou pessoa está sancionada",
        "Consultar o Cadastro de Empresas Inidôneas (CEIS)",
        "Consultar o Cadastro Nacional de Empresas Punidas (CNEP)",
        "Ver expulsões do serviço público (CEAF)",
        "Verificar ONGs impedidas de receber recursos (CEPIM)",
        "Consultar Pessoas Expostas Politicamente (PEP)",
      ],
      dicas: [
        "Cole um CPF (11 dígitos) ou CNPJ (14 dígitos) para busca direta",
        "A pesquisa é feita em tempo real no Portal da Transparência",
        "Resultado limpo não garante ausência de irregularidades — pode haver processos em andamento",
        "PEP (Pessoa Exposta Politicamente) é esperado para políticos em exercício",
      ],
      bases: {
        "CEIS": "Cadastro de Empresas Inidôneas e Suspensas — empresas proibidas de contratar com o governo",
        "CNEP": "Cadastro Nacional de Empresas Punidas — empresas que sofreram sanções administrativas",
        "CEAF": "Cadastro de Expulsões da Administração Federal — servidores demitidos ou expulsos",
        "CEPIM": "Cadastro de Entidades Privadas Sem Fins Lucrativos Impedidas — ONGs bloqueadas",
        "PEP": "Pessoas Expostas Politicamente — agentes públicos em cargos de relevância",
      },
      exemplo_chat: ["verificar João Silva sanções", "CNPJ 12345678000195", "checar corrupção Fulano"],
      relacionadas: ["risco", "top_corrupcao", "politicos"],
    },

    risco: {
      id: "risco",
      nome: "Monitor de Gastos Atípicos",
      icone: "🚨",
      cor: "#f87171",
      descricao: "Algoritmo que analisa milhares de notas fiscais da CEAP e identifica padrões suspeitos de uso indevido.",
      oque_fazer: [
        "Analisar amostra aleatória de 10 deputados",
        "Focar nos líderes de partido",
        "Identificar os maiores gastadores do mês",
        "Ver score de risco com fatores detalhados",
        "Identificar fornecedores concentrados e valores atípicos",
      ],
      dicas: [
        "Um alerta NÃO confirma crime — indica necessidade de investigação humana",
        "Scores acima de 70 merecem atenção especial",
        "Compare o resultado com dados do Radar Anti-Corrupção",
      ],
      exemplo_chat: ["gastos atípicos", "analisar risco deputados", "monitor de corrupção"],
      relacionadas: ["radar", "top_corrupcao", "politicos"],
    },

    top_corrupcao: {
      id: "top_corrupcao",
      nome: "Top Corrupção",
      icone: "🏆",
      cor: "#f87171",
      descricao: "Ranking dos deputados com maiores indícios de irregularidades, baseado em análise de dados públicos.",
      oque_fazer: [
        "Ver ranking dos deputados mais investigados",
        "Comparar scores de risco entre parlamentares",
        "Acessar perfil completo de cada deputado no ranking",
        "Filtrar por partido ou estado",
      ],
      dicas: [
        "O ranking é calculado com base em sanções, processos, crescimento patrimonial e concentração de fornecedores",
        "Use o HyperBot para gerar dossiê completo de qualquer nome no ranking",
      ],
      exemplo_chat: ["ranking suspeitos", "top corrupção", "deputados investigados"],
      relacionadas: ["risco", "radar", "politicos"],
    },

    comparador: {
      id: "comparador",
      nome: "Comparador Parlamentar",
      icone: "⚖️",
      cor: "#60a5fa",
      descricao: "Coloque dois deputados lado a lado para comparar gastos, votações e desempenho.",
      oque_fazer: [
        "Comparar gastos CEAP entre dois deputados",
        "Analisar diferenças de posicionamento em votações",
        "Ver side-by-side: partido, UF, situação, patrimônio",
        "Identificar quem gasta mais com cada categoria",
      ],
      dicas: [
        "Diga 'comparar [nome1] com [nome2]' no chat e o HyperBot faz a comparação inline",
        "Funciona melhor com deputados da mesma UF ou partido para contexto",
      ],
      exemplo_chat: ["comparar Lula com Bolsonaro", "versus entre dois deputados"],
      relacionadas: ["politicos", "risco"],
    },

    mapa: {
      id: "mapa",
      nome: "Mapa de Gastos",
      icone: "🗺️",
      cor: "#fbbf24",
      descricao: "Visualize repasses e gastos federais por estado no mapa do Brasil.",
      oque_fazer: [
        "Ver repasses federais por estado",
        "Comparar investimentos entre regiões",
        "Identificar estados que mais recebem recursos",
        "Filtrar por tipo de despesa ou período",
      ],
      dicas: [
        "Clique em um estado no mapa para detalhar os repasses",
        "Use junto com 'Minha Cidade' para ver repasses do seu município",
      ],
      exemplo_chat: ["mapa de repasses", "gastos por estado", "repasse federal SP"],
      relacionadas: ["orcamento", "municipio"],
    },

    partidos: {
      id: "partidos",
      nome: "Partidos Políticos",
      icone: "🚩",
      cor: "#a1a1aa",
      descricao: "Informações sobre todos os partidos registrados no TSE — membros, financiamento e histórico.",
      oque_fazer: [
        "Listar todos os partidos registrados",
        "Ver deputados federais por partido",
        "Consultar financiamento e doadores de campanha",
        "Comparar tamanho e representatividade dos partidos",
      ],
      dicas: [
        "Use 'partido PT' ou 'partido PL' para buscar diretamente",
        "Os dados de financiamento vêm do TSE",
      ],
      exemplo_chat: ["partidos políticos", "deputados do PT", "partido PL"],
      relacionadas: ["politicos", "eleicoes"],
    },

    servidores: {
      id: "servidores",
      nome: "Servidores Públicos",
      icone: "👥",
      cor: "#a1a1aa",
      descricao: "Consulte servidores públicos federais — salários, cargos e órgãos.",
      oque_fazer: [
        "Buscar servidor por nome",
        "Ver salário, cargo e órgão de lotação",
        "Verificar situação funcional",
        "Identificar acúmulo de cargos",
      ],
      dicas: [
        "Digite o nome completo para resultados precisos",
        "Os dados são do SIAPE — Sistema de Administração de Pessoal",
        "Use junto ao Radar para cruzar com bases de sanções",
      ],
      exemplo_chat: ["servidor João Silva", "salário servidor federal", "buscar funcionário público"],
      relacionadas: ["radar", "imoveis"],
    },

    eleicoes: {
      id: "eleicoes",
      nome: "Eleições & TSE",
      icone: "🗳️",
      cor: "#a1a1aa",
      descricao: "Dados eleitorais oficiais do TSE — candidatos, financiamento de campanha e patrimônio declarado.",
      oque_fazer: [
        "Buscar candidato por nome",
        "Ver patrimônio declarado ao TSE",
        "Consultar financiamento de campanha e doadores",
        "Comparar patrimônio antes e depois do mandato",
        "Verificar fontes de financiamento (PJ, PF, próprio)",
      ],
      dicas: [
        "Diga 'patrimônio de [nome]' no chat para ver a declaração TSE diretamente",
        "Crescimento patrimonial acima da inflação pode indicar enriquecimento ilícito",
        "Verifique doadores empresariais e cruze com fornecedores da CEAP",
      ],
      exemplo_chat: ["patrimônio João Silva", "financiamento campanha PT", "declaração TSE deputado"],
      relacionadas: ["politicos", "radar", "partidos"],
    },

    presidentes: {
      id: "presidentes",
      nome: "Presidentes do Brasil",
      icone: "🇧🇷",
      cor: "#a1a1aa",
      descricao: "Histórico completo dos presidentes brasileiros — de Deodoro da Fonseca até o atual mandato.",
      oque_fazer: [
        "Ver linha do tempo dos presidentes",
        "Consultar mandatos, partidos e períodos",
        "Ler resumo biográfico e principais fatos de cada governo",
        "Comparar indicadores econômicos por governo",
      ],
      dicas: [
        "Clique em um presidente para expandir os detalhes do mandato",
      ],
      exemplo_chat: ["presidentes do Brasil", "história Lula", "governos militares"],
      relacionadas: ["partidos"],
    },

    orcamento: {
      id: "orcamento",
      nome: "Orçamento & Dívida Pública",
      icone: "💰",
      cor: "#34d399",
      descricao: "Execução do orçamento federal — receitas, despesas, dívida pública e transferências.",
      oque_fazer: [
        "Ver total arrecadado e gasto pelo governo federal",
        "Consultar evolução da dívida pública",
        "Analisar categorias de despesa (saúde, educação, juros...)",
        "Comparar orçamento previsto vs. executado",
      ],
      dicas: [
        "Os dados vêm do SIAFI — Sistema Integrado de Administração Financeira",
        "Juros da dívida geralmente representam o maior item de despesa",
        "Use junto ao Mapa para ver como o dinheiro é distribuído geograficamente",
      ],
      exemplo_chat: ["orçamento federal", "dívida pública Brasil", "gastos governo federal"],
      relacionadas: ["receitas", "mapa", "gestao"],
    },

    gestao: {
      id: "gestao",
      nome: "Gestão & Finanças",
      icone: "📊",
      cor: "#34d399",
      descricao: "Indicadores de gestão fiscal e financeira do governo federal.",
      oque_fazer: [
        "Monitorar indicadores de gestão fiscal",
        "Ver resultado primário e nominal",
        "Consultar dados do SADIPEM — Sistema de Análise da Dívida Pública",
      ],
      dicas: [
        "Use junto com Orçamento para ter uma visão fiscal completa",
      ],
      exemplo_chat: ["gestão fiscal", "finanças governo", "resultado primário"],
      relacionadas: ["orcamento", "receitas"],
    },

    receitas: {
      id: "receitas",
      nome: "Execução Orçamentária",
      icone: "📊",
      cor: "#34d399",
      descricao: "Despesas federais por órgão — dotação autorizada versus valor liquidado.",
      oque_fazer: [
        "Comparar orçamento autorizado vs. liquidado por órgão",
        "Identificar órgãos com maior execução orçamentária",
        "Verificar percentual de execução por ministério",
      ],
      dicas: [
        "Órgão com execução < 50% pode indicar contingenciamento ou ineficiência",
        "Dados atualizados mensalmente via Portal da Transparência",
      ],
      exemplo_chat: ["execução orçamentária", "gastos por ministério", "MEC orçamento"],
      relacionadas: ["orcamento", "gestao"],
    },

    viagens: {
      id: "viagens",
      nome: "Viagens a Serviço",
      icone: "✈️",
      cor: "#a1a1aa",
      descricao: "Diárias, passagens e despesas de autoridades federais em viagens a serviço.",
      oque_fazer: [
        "Consultar viagens por período e órgão",
        "Ver destinos, motivos e valores de diárias",
        "Identificar viagens internacionais e seus custos",
        "Cruzar com o nome de autoridades específicas",
      ],
      dicas: [
        "Diga 'viagens de [nome do deputado]' no chat para ver diretamente",
        "Viagens sem justificativa clara merecem investigação",
        "Dados vêm do SCDP — Sistema de Concessão de Diárias e Passagens",
      ],
      exemplo_chat: ["viagens João Silva", "diárias deputados", "passagens internacionais"],
      relacionadas: ["politicos", "orcamento"],
    },

    licitacoes: {
      id: "licitacoes",
      nome: "Licitações & Contratos",
      icone: "📝",
      cor: "#a1a1aa",
      descricao: "Contratos federais vigentes — valores, órgãos contratantes e empresas contratadas.",
      oque_fazer: [
        "Buscar contratos por órgão e período",
        "Ver empresa contratada, valor e objeto",
        "Identificar empresas com muitos contratos",
        "Cruzar empresa contratada com bases de sanções (CEIS/CNEP)",
      ],
      dicas: [
        "Cole o CNPJ de uma empresa para ver todos os contratos federais dela",
        "Cruzar fornecedores da CEAP com licitações pode revelar conflitos de interesse",
        "Use o Radar Anti-Corrupção para verificar a idoneidade do contratado",
      ],
      exemplo_chat: ["contratos federais", "licitações Ministério Saúde", "empresa CNPJ contratos"],
      relacionadas: ["radar", "orcamento"],
    },

    imoveis: {
      id: "imoveis",
      nome: "Imóveis Funcionais",
      icone: "🏢",
      cor: "#a1a1aa",
      descricao: "Apartamentos residenciais pertencentes à União em Brasília — ocupantes e situação.",
      oque_fazer: [
        "Ver lista de ocupantes de imóveis da União",
        "Consultar situação de cada imóvel (regular/irregular)",
        "Identificar imóveis com ocupação irregular",
        "Cruzar ocupantes com bases de sanções",
      ],
      dicas: [
        "Imóveis da União em situação 'irregular' podem indicar uso indevido",
        "Dados disponíveis para imóveis em Brasília (DF)",
      ],
      exemplo_chat: ["imóveis funcionais Brasília", "apartamentos União", "imóvel funcional"],
      relacionadas: ["servidores", "radar"],
    },

    noticias: {
      id: "noticias",
      nome: "Notícias",
      icone: "📰",
      cor: "#a1a1aa",
      descricao: "Notícias políticas em tempo real de fontes jornalísticas brasileiras.",
      oque_fazer: [
        "Acompanhar últimas notícias políticas",
        "Buscar notícias sobre um político específico",
        "Ver cobertura sobre investigações e escândalos",
        "Filtrar por tema (corrupção, economia, eleições...)",
      ],
      dicas: [
        "Diga 'notícias sobre [nome]' no chat para busca contextual",
        "Combine com o dossiê do HyperBot para investigação completa",
      ],
      exemplo_chat: ["notícias políticas", "notícias Lula", "escândalos recentes"],
      relacionadas: ["politicos", "radar"],
    },

    rede: {
      id: "rede",
      nome: "Radar de Conexões",
      icone: "🕸️",
      cor: "#a78bfa",
      descricao: "Mapa visual de conexões entre deputados, empresas, servidores e sanções.",
      oque_fazer: [
        "Visualizar rede de relacionamentos de um deputado",
        "Ver quais empresas financiaram a campanha",
        "Identificar sócios em comuns entre políticos",
        "Cruzar com bases de sanções automaticamente",
        "Exportar o mapa de conexões como imagem",
      ],
      dicas: [
        "Busque um deputado pelo nome ou uma empresa pelo CNPJ",
        "Clique em um nó do grafo para expandir as conexões",
        "Use 'Ver Mapa' para abrir a visualização interativa em tela cheia",
        "Exporte com 📷 para compartilhar a rede de conexões",
      ],
      exemplo_chat: ["rede de conexões Fulano", "mapa conexões deputado", "grafo político"],
      relacionadas: ["politicos", "radar", "licitacoes"],
    },

    municipio: {
      id: "municipio",
      nome: "Minha Cidade",
      icone: "🏘️",
      cor: "#34d399",
      descricao: "Hackeie as contas da sua prefeitura — exponha gastos, contratos secretos e servidores fantasmas.",
      oque_fazer: [
        "Ver orçamento executado pela prefeitura por secretaria",
        "Consultar servidores municipais e salários",
        "Verificar contratos e licitações da prefeitura",
        "Comparar gastos previstos vs. realizados",
        "Fiscalizar fornecedores e empresas contratadas",
      ],
      dicas: [
        "Funciona com prefeituras que usam o sistema Fiorilli/MS Gestão Pública",
        "Diga 'sou de [cidade]' no chat para salvar sua cidade e acesso rápido",
        "Use junto ao Radar para verificar empresas que recebem da prefeitura",
        "Secretaria com execução abaixo do previsto pode indicar obras paradas",
      ],
      exemplo_chat: ["minha cidade", "prefeitura Campinas", "gastos prefeitura SP"],
      relacionadas: ["orcamento", "radar", "servidores"],
    },
  };

  // ════════════════════════════════════════════════════════════════════════
  //  TOURS GUIADOS — sequências passo a passo por objetivo
  // ════════════════════════════════════════════════════════════════════════
  const TOURS = {
    iniciante: {
      nome: "Tour do Iniciante",
      descricao: "Aprenda a usar o portal em 5 passos simples",
      passos: [
        {
          titulo: "Passo 1 — Buscar um político",
          html: `Digite o nome de qualquer deputado federal no chat.<br>
                 Ex: <em>"ver Lula"</em>, <em>"deputada Tabata Amaral"</em> ou <em>"deputados de SP"</em>.<br><br>
                 Vou encontrar o perfil e mostrar foto, partido, estado e situação do mandato.`,
          acao_label: "Buscar meu deputado",
          acao: () => window.HyperBotAgent?.processarMensagem?.("meu deputado federal"),
        },
        {
          titulo: "Passo 2 — Verificar sanções",
          html: `Com um político aberto, diga <em>"verificar corrupção"</em> ou clique no chip.<br><br>
                 Faço uma varredura em tempo real nas 5 bases do governo: <strong>CEIS, CNEP, CEAF, CEPIM e PEP</strong>.`,
          acao_label: "Ir ao Radar Anti-Corrupção",
          acao: () => window.customSwitchTab?.("radar"),
        },
        {
          titulo: "Passo 3 — Analisar gastos",
          html: `Diga <em>"gastos"</em> para ver as despesas da Cota Parlamentar (CEAP).<br><br>
                 Mostro um gráfico de barras com as categorias de gasto e o maior fornecedor.`,
          acao_label: "Ver gastos do deputado atual",
          acao: () => window.HyperBotAgent?.processarMensagem?.("gastos"),
        },
        {
          titulo: "Passo 4 — Investigação completa",
          html: `Diga <em>"investigação completa"</em> ou <em>"dossiê"</em> para gerar um relatório automático.<br><br>
                 Analiso gastos, sanções, processos judiciais, patrimônio, emendas e calculo um <strong>score de risco 0-100</strong>.`,
          acao_label: "Iniciar investigação",
          acao: () => window.HyperBotAgent?.processarMensagem?.("investigação completa"),
        },
        {
          titulo: "Passo 5 — Monitorar",
          html: `Diga <em>"monitorar [nome]"</em> para adicionar à sua lista de vigilância.<br><br>
                 Verifico automaticamente a cada 15 minutos e aviso se algum dado mudar — sanções novas, processos, etc.`,
          acao_label: "Ver minhas vigilâncias",
          acao: () => window.HyperBotMonitor?.listar?.(),
        },
      ],
    },

    investigar_fundo: {
      nome: "Como investigar a fundo",
      descricao: "Roteiro completo de investigação de um político",
      passos: [
        {
          titulo: "1. Perfil básico",
          html: `Busque o político: <em>"ver [nome]"</em><br>
                 Confirme: partido, UF, situação do mandato, email de contato.`,
          acao_label: "Buscar político",
          acao: () => { window.HyperBotAgent?.ctx && (window.HyperBotAgent.ctx.aguardandoResposta = "buscar_politico"); window.HyperBotChat?.pushBotMsg?.("info","✏️ Digite o nome","Qual político quer investigar?"); },
        },
        {
          titulo: "2. Sanções e fichas sujas",
          html: `Diga <em>"verificar corrupção"</em>.<br>
                 Cruzo com CEIS, CNEP, CEAF, CEPIM e PEP em tempo real.`,
          acao_label: "Verificar sanções",
          acao: () => window.HyperBotAgent?.processarMensagem?.("verificar corrupção"),
        },
        {
          titulo: "3. Processos judiciais",
          html: `Diga <em>"processos judiciais"</em>.<br>
                 Busco no DataJud/CNJ — base nacional de processos de todos os tribunais.`,
          acao_label: "Buscar processos",
          acao: () => window.HyperBotAgent?.processarMensagem?.("processos judiciais"),
        },
        {
          titulo: "4. Gastos e fornecedores",
          html: `Diga <em>"gastos"</em> e depois <em>"cruzar fornecedores"</em>.<br>
                 Identifico os maiores recebedores e cruzo com CEIS/CNEP.`,
          acao_label: "Ver gastos",
          acao: () => window.HyperBotAgent?.processarMensagem?.("gastos"),
        },
        {
          titulo: "5. Patrimônio TSE",
          html: `Diga <em>"patrimônio"</em> para ver a declaração de bens ao TSE.<br>
                 Patrimônio acima de R$2M merece atenção; crescimento acelerado é sinal de alerta.`,
          acao_label: "Ver patrimônio",
          acao: () => window.HyperBotAgent?.processarMensagem?.("patrimônio"),
        },
        {
          titulo: "6. Score de risco final",
          html: `Diga <em>"investigação completa"</em> para gerar o dossiê com score 0-100.<br>
                 Pontuação por: sanções (35pts), processos graves (30pts), patrimônio (20pts), concentração de fornecedores (15pts).`,
          acao_label: "Gerar dossiê completo",
          acao: () => window.HyperBotAgent?.processarMensagem?.("investigação completa"),
        },
      ],
    },

    fiscalizar_municipio: {
      nome: "Fiscalizar sua prefeitura",
      descricao: "Passo a passo para fiscalizar o município",
      passos: [
        {
          titulo: "1. Registre sua cidade",
          html: `Diga <em>"sou de [sua cidade]"</em> — ex: <em>"sou de Campinas"</em>.<br>
                 Salvo sua cidade para acesso rápido em todas as pesquisas.`,
          acao_label: "Registrar minha cidade",
          acao: () => { window.HyperBotAgent.ctx.aguardandoResposta = "config_cidade"; window.HyperBotChat?.pushBotMsg?.("info","📍 Qual sua cidade?","Ex: Sou de Belo Horizonte, Recife, Porto Alegre..."); },
        },
        {
          titulo: "2. Ver execução orçamentária",
          html: `Diga <em>"dados do meu município"</em> ou abra a aba <strong>Minha Cidade</strong>.<br>
                 Veja quanto cada secretaria gastou vs. o que foi orçado.`,
          acao_label: "Abrir Minha Cidade",
          acao: () => window.customSwitchTab?.("municipio"),
        },
        {
          titulo: "3. Verificar fornecedores",
          html: `Nos contratos da prefeitura, copie o CNPJ de uma empresa e cole no chat.<br>
                 Verifico automaticamente no Radar Anti-Corrupção se a empresa é idônea.`,
          acao_label: "Ir ao Radar Anti-Corrupção",
          acao: () => window.customSwitchTab?.("radar"),
        },
        {
          titulo: "4. Seu deputado federal",
          html: `Diga <em>"meu deputado federal"</em> para saber quem representa sua cidade.<br>
                 Verifique se ele destinou emendas parlamentares para o seu município.`,
          acao_label: "Ver meu deputado",
          acao: () => window.HyperBotAgent?.processarMensagem?.("meu deputado federal"),
        },
      ],
    },
  };

  // ════════════════════════════════════════════════════════════════════════
  //  REGISTRY — botões de ação do guia
  // ════════════════════════════════════════════════════════════════════════
  const _guiaHandlers = [];

  function _regHandler(fn) {
    const idx = _guiaHandlers.length;
    _guiaHandlers.push(fn);
    return idx;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════════════════════
  function bot(sev, titulo, html) {
    window.HyperBotChat?.pushBotMsg?.(sev, titulo, html);
  }

  function chips(lista) {
    window.HyperBotAgent?.mostrarChips?.(lista);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  EXIBIR GUIA DE UMA SEÇÃO
  // ════════════════════════════════════════════════════════════════════════
  function exibirSecao(idSecao) {
    const s = SECOES[idSecao];
    if (!s) {
      bot("atencao", "Seção não encontrada", `Não tenho informações sobre a seção "<em>${idSecao}</em>".`);
      return;
    }

    // Monta HTML rico
    const listaoFazer = s.oque_fazer.map(item => `<li style="padding:3px 0;color:#d4d4d8;">• ${item}</li>`).join("");
    const listaDicas  = s.dicas.map(d => `<li style="padding:2px 0;color:#a1a1aa;font-size:11px;">💡 ${d}</li>`).join("");
    const exemploChat = s.exemplo_chat
      .map(ex => {
        const idx = _regHandler(() => window.HyperBotAgent?.processarMensagem?.(ex));
        return `<button onclick="window.HyperBotGuia._runHandler(${idx})"
                  style="font-size:11px;background:#1c1c2e;border:1px solid #3f3f46;color:#a78bfa;
                         padding:3px 10px;border-radius:6px;cursor:pointer;margin:2px;">${ex}</button>`;
      }).join(" ");

    const basesHtml = s.bases
      ? Object.entries(s.bases).map(([k, v]) =>
          `<div style="margin-bottom:5px;"><strong style="color:#f87171;">${k}:</strong> <span style="color:#9ca3af;font-size:11px;">${v}</span></div>`
        ).join("") : "";

    const html = `
      <div style="margin-bottom:10px;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">O que você pode fazer</div>
        <ul style="list-style:none;padding:0;margin:0;">${listaoFazer}</ul>
      </div>
      ${basesHtml ? `<div style="margin-bottom:10px;background:#0f1629;border-radius:8px;padding:10px;">${basesHtml}</div>` : ""}
      ${listaDicas ? `<div style="margin-bottom:10px;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;">Dicas</div>
        <ul style="list-style:none;padding:0;margin:0;">${listaDicas}</ul>
      </div>` : ""}
      <div>
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;">Exemplos — clique para usar</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">${exemploChat}</div>
      </div>`;

    bot("info", `${s.icone} ${s.nome}`, html);

    // Chips: ir para seção + seções relacionadas
    const chipsAcoes = [
      {
        emoji: s.icone,
        label: `Abrir ${s.nome}`,
        acao: () => window.customSwitchTab?.(s.id),
      },
    ];
    (s.relacionadas || []).slice(0, 2).forEach(rel => {
      const r = SECOES[rel];
      if (r) chipsAcoes.push({
        emoji: r.icone,
        label: r.nome,
        acao: () => exibirSecao(rel),
      });
    });
    chipsAcoes.push({ emoji: "🗺️", label: "Ver todas as seções", acao: mostrarMapaPortal });
    chips(chipsAcoes);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MAPA GERAL DO PORTAL
  // ════════════════════════════════════════════════════════════════════════
  function mostrarMapaPortal() {
    const grupos = [
      {
        titulo: "👔 POLÍTICOS",
        cor: "#a78bfa",
        ids: ["politicos", "senadores", "presidentes", "partidos"],
      },
      {
        titulo: "🔍 INVESTIGAÇÃO",
        cor: "#f87171",
        ids: ["radar", "risco", "top_corrupcao"],
      },
      {
        titulo: "💰 DINHEIRO PÚBLICO",
        cor: "#34d399",
        ids: ["orcamento", "receitas", "gestao", "licitacoes", "imoveis"],
      },
      {
        titulo: "🗺️ TERRITÓRIO",
        cor: "#fbbf24",
        ids: ["mapa", "municipio"],
      },
      {
        titulo: "👥 PESSOAS",
        cor: "#60a5fa",
        ids: ["servidores", "viagens"],
      },
      {
        titulo: "🔎 ANÁLISE",
        cor: "#c084fc",
        ids: ["comparador", "rede", "eleicoes"],
      },
    ];

    const gruposHtml = grupos.map(g => {
      const secoes = g.ids
        .map(id => {
          const s = SECOES[id];
          if (!s) return "";
          const idx = _regHandler(() => exibirSecao(id));
          return `<button onclick="window.HyperBotGuia._runHandler(${idx})"
                    style="display:flex;align-items:center;gap:6px;width:100%;text-align:left;
                           background:#18181b;border:1px solid #27272a;border-radius:8px;
                           padding:7px 10px;cursor:pointer;transition:background .15s;margin-bottom:4px;"
                    onmouseover="this.style.background='#27272a'" onmouseout="this.style.background='#18181b'">
                    <span style="font-size:14px;">${s.icone}</span>
                    <div style="min-width:0;flex:1;">
                      <div style="font-size:12px;font-weight:700;color:#e4e4e7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.nome}</div>
                      <div style="font-size:10px;color:#71717a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.descricao.substring(0, 55)}…</div>
                    </div>
                    <span style="font-size:10px;color:#52525b;flex-shrink:0;">→</span>
                  </button>`;
        }).join("");
      return `<div style="margin-bottom:12px;">
        <div style="font-size:10px;font-weight:800;color:${g.cor};text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;">${g.titulo}</div>
        ${secoes}
      </div>`;
    }).join("");

    bot("info", "🗺️ Mapa do Portal — Todas as Seções",
      `<div style="font-size:11px;color:#71717a;margin-bottom:10px;">Clique em qualquer seção para saber como usar.</div>${gruposHtml}`);

    chips([
      { emoji: "🚀", label: "Tour do iniciante",         acao: () => iniciarTour("iniciante") },
      { emoji: "🕵️", label: "Como investigar a fundo",   acao: () => iniciarTour("investigar_fundo") },
      { emoji: "🏘️", label: "Fiscalizar meu município",  acao: () => iniciarTour("fiscalizar_municipio") },
    ]);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TOURS GUIADOS
  // ════════════════════════════════════════════════════════════════════════
  function iniciarTour(tourId) {
    const tour = TOURS[tourId];
    if (!tour) return;

    bot("positivo", `🚀 ${tour.nome}`, `${tour.descricao}<br><br>Vou te guiar passo a passo. Clique nos botões abaixo para avançar.`);

    // Mostra o primeiro passo imediatamente
    setTimeout(() => exibirPassoTour(tour, 0), 600);
  }

  function exibirPassoTour(tour, passoIdx) {
    const passo = tour.passos[passoIdx];
    if (!passo) return;

    const total = tour.passos.length;
    const progresso = `<div style="display:flex;gap:4px;margin-bottom:8px;">
      ${tour.passos.map((_, i) => `<div style="height:3px;flex:1;border-radius:2px;background:${i <= passoIdx ? '#7c3aed' : '#27272a'};"></div>`).join("")}
    </div>`;
    const contagem = `<div style="font-size:10px;color:#52525b;margin-bottom:6px;">Passo ${passoIdx + 1} de ${total}</div>`;

    bot("info", passo.titulo, `${progresso}${contagem}${passo.html}`);

    const chipsPassos = [];
    if (passo.acao_label) {
      chipsPassos.push({ emoji: "▶️", label: passo.acao_label, acao: passo.acao });
    }
    if (passoIdx + 1 < total) {
      chipsPassos.push({
        emoji: "→",
        label: `Próximo: ${tour.passos[passoIdx + 1].titulo.replace(/^\d+\.\s*/, "")}`,
        acao: () => exibirPassoTour(tour, passoIdx + 1),
      });
    } else {
      chipsPassos.push({
        emoji: "✅",
        label: "Concluído! Ver mapa do portal",
        acao: mostrarMapaPortal,
      });
    }

    setTimeout(() => chips(chipsPassos), 200);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  BUSCA SEMÂNTICA NA BASE DE CONHECIMENTO
  // ════════════════════════════════════════════════════════════════════════

  // Mapa de palavras-chave → id de seção
  const KEYWORDS = {
    politicos:     /dep[ue]tad[ao]|câmara|513|parlamentar|mandato/i,
    senadores:     /senator?|senado\b/i,
    radar:         /radar|ceis|cnep|ceaf|cepim|pep\b|sanç[aã]o|base\s+de\s+dados|anticorrup|ficha\s+suj/i,
    risco:         /risco|gastos?\s+at[ií]pic|monitor\s+(?:de\s+)?gasto|anomalia|alerta\s+ceap/i,
    top_corrupcao: /top\s*corrup|ranking\s+corrup|piores?\s+dep/i,
    comparador:    /comparad|versus|vs\.?|lado\s+a\s+lado/i,
    mapa:          /mapa\s+(?:de\s+)?gastos?|repasse\s+por\s+estado|transfer[eê]ncia\s+estado/i,
    partidos:      /partido(?:s)?\b|sigla\s+partid/i,
    servidores:    /servidor|funcional|siape|cargo\s+p[uú]blico|concurs/i,
    eleicoes:      /elei[çc][aã]o|tse\b|candidato|financiamento\s+campanha|bens?\s+tse|patrim[oô]nio\s+tse/i,
    presidentes:   /presidente\s+brasil|hist[oó]ria\s+presid|governo\s+militar|deodoro|vargas/i,
    orcamento:     /or[çc]amento|d[ií]vida\s+p[uú]blica|siafi|arrecada|receita\s+federal/i,
    gestao:        /gest[aã]o\s+fiscal|resultado\s+prim[aá]rio|sadipem|incc/i,
    receitas:      /execu[çc][aã]o\s+or[çc]ament|minist[eé]rio\s+(?:gasto|recurso)|[oó]rg[aã]o\s+federal/i,
    viagens:       /viagem|diária|passagem|scdp|viaj/i,
    licitacoes:    /licita[çc][aã]o|contrato\s+federal|empresa\s+contratad|pregão/i,
    imoveis:       /im[oó]vel|apartamento\s+uni[aã]o|resid[eê]ncia\s+funcional/i,
    noticias:      /not[ií]cia|imprensa|jornal|reportagem|mídia/i,
    rede:          /rede\s+(?:de\s+)?cone[cx]|grafo|mapa\s+cone[cx]|relacionamento\s+pol/i,
    municipio:     /minha\s+cidade|prefeitura|munic[ií]p|fiorilli|fiscal\s+municipal/i,
  };

  function buscarSecao(texto) {
    for (const [id, re] of Object.entries(KEYWORDS)) {
      if (re.test(texto)) return id;
    }
    return null;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ENTRY POINTS PÚBLICOS
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Tenta responder a uma pergunta sobre o portal.
   * Retorna true se o guia tratou a mensagem, false caso contrário.
   */
  function tentarResponder(texto) {
    const raw = texto.toLowerCase();

    // Mapa do portal
    if (/mapa\s+do\s+portal|todas?\s+as\s+se[çc][oõ]es|o\s+que\s+(?:tem|existe|posso|consigo)\s+(?:no\s+portal|aqui|ver)|menu\s+do\s+portal|funcionalidades|navegar\s+pelo\s+portal|guia\s+do\s+portal|tour\b/i.test(raw)) {
      mostrarMapaPortal();
      return true;
    }

    // Tour específico
    if (/tour\s+inici|como\s+come[çc]ar|primeiro\s+passo|n[aã]o\s+sei\s+(?:por\s+onde|como)|ajud[ae]\s+inici/i.test(raw)) {
      iniciarTour("iniciante");
      return true;
    }
    if (/como\s+investigar|investigar\s+a\s+fundo|roteiro\s+(?:de\s+)?invest/i.test(raw)) {
      iniciarTour("investigar_fundo");
      return true;
    }
    if (/fiscalizar\s+(?:minha?\s+)?(?:cidade|prefeitura|munic[ií]p)|como\s+fiscalizar\s+prefeitura/i.test(raw)) {
      iniciarTour("fiscalizar_municipio");
      return true;
    }

    // "como funciona [seção]" / "o que é [seção]" / "para que serve [seção]"
    if (/como\s+funciona|o\s+que\s+[eé]\s+(?:o\s+|a\s+)?|para\s+que\s+serve|me\s+explica|explica\s+(?:o\s+|a\s+)?|como\s+(?:usar?|utilizar?)|o\s+que\s+(?:tem|posso)\s+(?:no|na|em)/i.test(raw)) {
      const secaoId = buscarSecao(raw);
      if (secaoId) {
        exibirSecao(secaoId);
        return true;
      }
    }

    // Busca direta por nome de seção + "como"/"o que"/"ajuda"
    const secaoId = buscarSecao(raw);
    if (secaoId && /como|o\s+que|ajuda|guia|navegar|onde\s+fica|para\s+que/i.test(raw)) {
      exibirSecao(secaoId);
      return true;
    }

    return false;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  EXPORT
  // ════════════════════════════════════════════════════════════════════════
  window.HyperBotGuia = {
    tentarResponder,
    exibirSecao,
    mostrarMapaPortal,
    iniciarTour,
    buscarSecao,
    SECOES,
    TOURS,
    _runHandler(idx) {
      const fn = _guiaHandlers[idx];
      if (typeof fn === "function") fn();
    },
  };
})();
