// 1. Async function that fetches USD -> ETB rate from a public API,
//    checks res.ok, and returns the rate.

async function fetchUsdToEtbRate() {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.rates.ETB;
}

// Run it directly: node 1-fetch-rate.js
if (require.main === module) {
  fetchUsdToEtbRate()
    .then((rate) => console.log(`1 USD = ${rate} ETB`))
    .catch((err) => console.error('Failed to fetch rate:', err.message));
}

module.exports = { fetchUsdToEtbRate };
