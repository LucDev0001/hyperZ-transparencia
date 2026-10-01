<!-- Conteúdo: Políticos -->
<div id="content-politicos" class="hidden animate-fade-in">
  <div
    class="flex flex-col lg:flex-row gap-4 mb-6 glass-panel p-6 rounded-2xl">
    <div class="w-full lg:w-1/4">
      <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Selecione o Estado</label>
      <select
        id="stateSelect"
        onchange="loadDeputies()"
        class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2 text-white focus:border-violet-500 outline-none">
        <option value="">Todos os Estados</option>
        <option value="SP">São Paulo (SP)</option>
        <option value="RJ">Rio de Janeiro (RJ)</option>
        <option value="MG">Minas Gerais (MG)</option>
        <option value="BA">Bahia (BA)</option>
        <option value="RS">Rio Grande do Sul (RS)</option>
        <option value="PR">Paraná (PR)</option>
        <option value="PE">Pernambuco (PE)</option>
        <option value="CE">Ceará (CE)</option>
        <option value="PA">Pará (PA)</option>
        <option value="SC">Santa Catarina (SC)</option>
        <option value="MA">Maranhão (MA)</option>
        <option value="GO">Goiás (GO)</option>
        <option value="AM">Amazonas (AM)</option>
        <option value="ES">Espírito Santo (ES)</option>
        <option value="PB">Paraíba (PB)</option>
        <option value="RN">Rio Grande do Norte (RN)</option>
        <option value="MT">Mato Grosso (MT)</option>
        <option value="AL">Alagoas (AL)</option>
        <option value="PI">Piauí (PI)</option>
        <option value="DF">Distrito Federal (DF)</option>
        <option value="MS">Mato Grosso do Sul (MS)</option>
        <option value="SE">Sergipe (SE)</option>
        <option value="RO">Rondônia (RO)</option>
        <option value="TO">Tocantins (TO)</option>
        <option value="AC">Acre (AC)</option>
        <option value="AP">Amapá (AP)</option>
        <option value="RR">Roraima (RR)</option>
      </select>
    </div>
    <div class="w-full lg:w-1/4">
      <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Selecione o Partido</label>
      <select
        id="partySelect"
        onchange="loadDeputies()"
        class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2 text-white focus:border-violet-500 outline-none">
        <option value="">Todos os Partidos</option>
      </select>
    </div>
    <div class="flex-1">
      <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Buscar por Nome</label>
      <div class="flex gap-2">
        <input
          type="text"
          id="nameSearch"
          placeholder="Nome..."
          class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2 text-white focus:border-violet-500 outline-none"
          onkeydown="if (event.key === 'Enter') loadDeputies();" />
        <button
          onclick="loadDeputies()"
          class="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-violet-900/20">
          🔍
        </button>
      </div>
    </div>
    <div class="flex items-end">
      <div class="text-xs text-zinc-500">
        Fonte: Dados Abertos da Câmara
      </div>
    </div>
  </div>

  <div
    id="deputiesGrid"
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div class="col-span-full text-center py-10 text-zinc-500">
      Carregando dados...
    </div>
  </div>
</div>
