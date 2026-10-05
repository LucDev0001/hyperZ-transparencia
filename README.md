# 🏛️ Portal Transparência - HyperZ

![Licença](https://img.shields.io/badge/license-GPLv3-blue.svg)
![PHP](https://img.shields.io/badge/php-%3E%3D8.0-777BB4.svg)
![Frontend](https://img.shields.io/badge/frontend-Vanilla%20JS%20%7C%20TailwindCSS-38B2AC.svg)

O **Portal Transparência HyperZ** é uma aplicação web em código aberto focada em monitoramento governamental, análise de dados políticos e investigações públicas (OSINT). Seu objetivo é facilitar o acesso aos dados abertos de políticos do Brasil e incentivar o engajamento através de recursos como mapas, relatórios detalhados e até um jogo de conscientização (DepuMon GO).

---

## 🌟 Funcionalidades

- **👨‍💼 Consulta a Políticos**: Veja todos os Deputados e Senadores, investigue seus gastos, assiduidade, projetos propostos e discursos.
- **🚨 Radar e Análise de Risco**: Identificação rápida de potenciais irregularidades ou comportamentos suspeitos usando um sistema de pontuação (Risco e "Top Corrupção").
- **💰 Orçamento e Gestão**: Relatórios e análises de Execução Orçamentária e gastos a nível federal e municipal.
- **⚖️ Comparador Político**: Compare a atuação, gastos e alinhamentos entre diferentes políticos do cenário brasileiro.
- **🗳️ Eleições TSE**: Informações abertas sobre resultados e dados das eleições do TSE.
- **🕸️ Radar de Conexões (OSINT)**: Interface de grafos e rede de contatos para investigar ligações políticas, licitações e empresas fornecedoras governamentais.
- **🎮 DepuMon GO & Wiki**: Uma forma interativa (gamificada) de engajar o usuário a caçar "DepuMons" corruptos e aprender sobre a política através de uma enciclopédia wiki.

---

## 🚀 Como Executar o Projeto Localmente

Este projeto foi construído para rodar em um servidor web PHP básico. O front-end utiliza HTML, JS Puro e TailwindCSS injetado (via CDN ou build).

### 📋 Pré-requisitos
- Um servidor web, como o **Apache** ou **Nginx**. A maneira mais fácil no Windows/Linux/Mac é utilizando o **XAMPP**, **WAMP** ou **Laragon**.
- **PHP 8.0** ou superior.
- Conexão com a Internet (o painel consome APIs abertas governamentais em tempo real).

### 🛠️ Passos de Instalação

1. **Faça o Clone do Repositório**
   Clone (ou baixe o ZIP) deste repositório para o diretório raiz público do seu servidor web (ex: `htdocs/` no XAMPP ou `/var/www/html/` no Linux).
   ```bash
   git clone https://github.com/SeuUsuario/hyperZ-transparencia.git transparency
   ```

2. **Inicie o Servidor Web**
   Abra o painel de controle do seu XAMPP/WAMP e inicie o serviço do **Apache**.

3. **Acesse no Navegador**
   Vá até o navegador e digite o endereço local:
   ```text
   http://localhost/transparency/
   ```

---

## 🔌 Integração de Backend (APIs)

**Atenção:** Este módulo faz chamadas de API (como para a Câmara, Senado, TSE e Portal da Transparência) através de um arquivo de roteamento proxy, comumente definido em `js/api.js`.

Por padrão, ele busca um arquivo `api/api.php` para encaminhar as requisições e evitar erros de **CORS**. Para rodar o projeto localmente, as configurações sensíveis (como chaves de APIs privadas) devem ficar protegidas em um arquivo `.env`.

**🔐 Importante sobre o arquivo `.env`:**
1. **Nunca publique** seu arquivo `.env` real no GitHub, pois ele contém suas chaves secretas.
2. Adicione o `.env` ao seu arquivo `.gitignore`.
3. Publique apenas um arquivo chamado `.env.example` (ou `.env.example.txt`) com dados falsos para servir de modelo, por exemplo:
   ```env
   API_KEY_TRANSPARENCIA=sua_chave_aqui
   
   ```
   Assim, quem baixar o projeto renomeará esse arquivo para `.env` e colocará suas próprias chaves.

As APIs governamentais integradas são baseadas em (vide arquivos Swagger `*.json` incluídos):
- [Dados Abertos da Câmara dos Deputados](https://dadosabertos.camara.leg.br/)
- [Dados Abertos do Senado Federal](https://legis.senado.leg.br/dadosabertos/docs/)
- [Portal da Transparência (CGU)](https://portaldatransparencia.gov.br/api-de-dados)
- [TSE Dados](https://dadosabertos.tse.jus.br/)
- [BrasilAPI](https://brasilapi.com.br/)

---

## 🤝 Como Contribuir

Contribuições são super bem-vindas! Se você é desenvolvedor, pesquisador de dados abertos ou simplesmente quer ajudar:
1. Faça um *Fork* do projeto.
2. Crie uma branch com a sua feature (`git checkout -b feature/minha-feature`).
3. Commit suas alterações (`git commit -m 'feat: adicionando nova análise de risco'`).
4. Faça o *Push* para a branch (`git push origin feature/minha-feature`).
5. Abra um *Pull Request*.

---

## 📜 Licença

Este projeto é licenciado sob os termos da **GPL-3.0**. Isso significa que qualquer versão modificada (trabalho derivado) deve, obrigatoriamente, ser distribuída também em código aberto sob a mesma licença. Leia o arquivo `LICENSE` para mais detalhes.
