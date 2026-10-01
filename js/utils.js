// /var/www/html/hyperz/transparency/js/utils.js

/**
 * Formata um valor numérico para moeda brasileira (R$).
 * @param {number|string} value 
 * @returns {string} Ex: "R$ 1.234,56"
 */
window.formatCurrency = function(value) {
    return "R$ " + parseFloat(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Converte uma string numérica no formato PT-BR (com pontos e vírgula) ou valor numérico para float.
 * @param {string|number} str 
 * @returns {number}
 */
window.parsePtBrFloat = function(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    // Remove pontos de milhar e substitui vírgula decimal por ponto
    return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
};

window.formatDate = function(dateInput) {
    if (!dateInput) return "-";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;
    return date.toLocaleDateString("pt-BR");
};