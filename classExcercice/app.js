// the single source of truth
const state = {
  base: "ETB",
  rates: {}, // filled by the API
  watchlist: [], // e.g. ["USD","KES"]
  history: [], // past converted results
  amount: 100,
  currency: "USD",
};

const WATCHLIST_KEY = "birrwatch-watchlist";
const HISTORY_KEY = "birrwatch-history";

// restore saved watchlist, if any
const savedWatchlist = localStorage.getItem(WATCHLIST_KEY);
if (savedWatchlist) {
  state.watchlist = JSON.parse(savedWatchlist);
}

// restore saved history, if any
const savedHistory = localStorage.getItem(HISTORY_KEY);
if (savedHistory) {
  state.history = JSON.parse(savedHistory);
}

const API = "https://open.er-api.com/v6/latest/ETB";
const ALLOWED = ["USD", "EUR", "KES", "GBP"];

const status = document.querySelector("#status");
const select = document.querySelector("#currency");
const form = document.querySelector("#convert-form");
const amountInput = document.querySelector("#amount");
const resultEl = document.querySelector("#result");
const watchlistEl = document.querySelector("#watchlist");
const historyEl = document.querySelector("#history");
const clearWatchlistButton = document.querySelector("#clear-watchlist");
const clearHistoryButton = document.querySelector("#clear-history");

async function loadRates() {
  status.textContent = "Loading rates...";
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    // only the currencies we want to offer
    state.rates = Object.fromEntries(
      ALLOWED.map((code) => [code, data.rates[code]]),
    );

    status.textContent = "";
    render();
  } catch (err) {
    status.textContent = "Could not load rates.";
  }
}

function render() {
  // fill the dropdown from the live rates
  const codes = Object.keys(state.rates);
  select.innerHTML = codes.map((c) => `<option>${c}</option>`).join("");
  select.value = state.currency;
  renderWatchlist();
  renderHistory();
}

function renderWatchlist() {
  if (state.watchlist.length === 0) {
    watchlistEl.innerHTML = "<li></li>";
    return;
  }

  watchlistEl.innerHTML = state.watchlist
    .map(
      (code) => `
        <li>
          ${state.base}/${code}
          <button type="button" data-remove="${code}">Remove</button>
        </li>
      `,
    )
    .join("");
}

function renderHistory() {
  if (!historyEl) return;

  if (state.history.length === 0) {
    historyEl.innerHTML = "<li>No conversions yet.</li>";
    return;
  }

  historyEl.innerHTML = state.history
    .slice()
    .reverse() // most recent first
    .map(
      (entry) =>
        `<li>${entry.amount} ${entry.base} = ${entry.result} ${entry.currency}</li>`,
    )
    .join("");
}

function convert() {
  const amount = Number(amountInput.value);
  const rate = state.rates[state.currency];

  if (!Number.isFinite(amount) || rate === undefined) {
    resultEl.textContent = "Enter a valid amount and currency.";
    return;
  }

  const converted = amount * rate;
  resultEl.textContent = `${amount} ${state.base} = ${converted.toFixed(2)} ${state.currency}`;

  // save this result to history
  state.history.push({
    base: state.base,
    amount,
    currency: state.currency,
    result: converted.toFixed(2),
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  renderHistory();

  // add the converted currency to the watchlist automatically,
  // removing any existing entry for it first so it never duplicates
  state.watchlist = state.watchlist.filter((c) => c !== state.currency);
  state.watchlist.push(state.currency);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(state.watchlist));
  renderWatchlist();
}

// keep state.currency in sync with the dropdown
select.addEventListener("change", () => {
  state.currency = select.value;
});

// keep state.amount in sync as the user types, so the watchlist updates live
amountInput.addEventListener("input", () => {
  state.amount = Number(amountInput.value) || 0;
  renderWatchlist();
});

// handle the convert form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  state.amount = Number(amountInput.value);
  state.currency = select.value;
  convert();
});

// remove a currency from the watchlist (event delegation)
watchlistEl.addEventListener("click", (e) => {
  const code = e.target.dataset.remove;
  if (!code) return;
  state.watchlist = state.watchlist.filter((c) => c !== code);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(state.watchlist));
  renderWatchlist();
});

// clear the whole watchlist
clearWatchlistButton.addEventListener("click", () => {
  state.watchlist = [];
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(state.watchlist));
  renderWatchlist();
});

// clear the whole history
clearHistoryButton.addEventListener("click", () => {
  state.history = [];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  renderHistory();
});

loadRates();
