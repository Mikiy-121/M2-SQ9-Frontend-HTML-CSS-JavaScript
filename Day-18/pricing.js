const VAT_RATE = 0.15;

/**

 * @param {number} amount 
 * @returns {number}
 */
export function withVat(amount) {
  return amount * (1 + VAT_RATE);
}

/**

 * @param {number} amount
 * @returns {string} e.g. "1,234.50 ETB"
 */
export function format(amount) {
  const rounded = amount.toFixed(2);
  const [whole, decimals] = rounded.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withCommas}.${decimals} ETB`;
}
