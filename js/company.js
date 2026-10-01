// transparency/js/company.js

async function openCompanyDetails(cnpj) {
  if (!cnpj) return;

  // Limpar formatação do CNPJ
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");
  if (cleanCNPJ.length !== 14) {
    alert("CNPJ inválido ou não informado corretamente na base de dados.");
    return;
  }

  const modal = document.getElementById("companyModal");
  const content = document.getElementById("companyContent");

  modal.classList.remove("hidden");
  content.innerHTML =
    '<div class="text-center py-10"><span class="animate-pulse text-violet-500">Consultando Receita Federal...</span></div>';

  try {
    const data = await api.brasilApi(`cnpj/v1/${cleanCNPJ}`);

    if (data.error) {
      content.innerHTML =
        '<div class="text-center py-10 text-red-500">Dados da empresa não encontrados.</div>';
      return;
    }

    const qsaHtml =
      data.qsa && data.qsa.length > 0
        ? data.qsa
            .map(
              (s) =>
                `<li class="text-sm text-zinc-400">• ${s.nome_socio} (${s.qualificacao_socio})</li>`,
            )
            .join("")
        : '<li class="text-sm text-zinc-500">Sem sócios informados.</li>';

    content.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1 space-y-4">
                    <div>
                        <h2 class="text-xl font-bold text-white">${data.razao_social}</h2>
                        <p class="text-violet-400 text-sm font-bold">${data.nome_fantasia || data.razao_social}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-zinc-800 p-3 rounded-lg">
                            <span class="block text-xs text-zinc-500 uppercase">CNPJ</span>
                            <span class="text-white font-mono text-sm">${data.cnpj}</span>
                        </div>
                        <div class="bg-zinc-800 p-3 rounded-lg">
                            <span class="block text-xs text-zinc-500 uppercase">Situação</span>
                            <span class="${data.descricao_situacao_cadastral === "ATIVA" ? "text-green-400" : "text-red-400"} font-bold text-sm">${data.descricao_situacao_cadastral}</span>
                        </div>
                    </div>

                    <div class="bg-zinc-800 p-3 rounded-lg">
                        <span class="block text-xs text-zinc-500 uppercase mb-1">Atividade Principal (CNAE)</span>
                        <p class="text-white text-sm">${data.cnae_fiscal_descricao}</p>
                    </div>

                    <div class="bg-zinc-800 p-3 rounded-lg">
                        <span class="block text-xs text-zinc-500 uppercase mb-1">Endereço</span>
                        <p class="text-white text-sm">${data.logradouro}, ${data.numero} ${data.complemento || ""} - ${data.bairro}</p>
                        <p class="text-zinc-400 text-sm">${data.municipio} - ${data.uf}, CEP: ${data.cep}</p>
                    </div>
                </div>

                <div class="w-full md:w-1/3 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                    <h3 class="text-white font-bold mb-3 border-b border-zinc-700 pb-2">Quadro Societário</h3>
                    <ul class="space-y-2 max-h-60 overflow-y-auto">
                        ${qsaHtml}
                    </ul>
                    <div class="mt-4 pt-2 border-t border-zinc-700">
                        <span class="block text-xs text-zinc-500 uppercase">Capital Social</span>
                        <span class="text-green-400 font-bold">${window.formatCurrency(data.capital_social)}</span>
                    </div>
                </div>
            </div>
        `;
  } catch (e) {
    console.error(e);
    content.innerHTML =
      '<div class="text-center py-10 text-red-500">Erro ao carregar dados da empresa.</div>';
  }
}
