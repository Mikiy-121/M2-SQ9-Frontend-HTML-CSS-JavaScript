const state = {
  cities: [],
  weather: {},
  saved: [],
  search: "",
};

const STORAGE_KEY = "boleweather-saved";

const FALLBACK_CITIES = [
  { id: 1, name: "Addis Ababa", lat: 9.03, lon: 38.74 },
  { id: 2, name: "Bahir Dar", lat: 11.6, lon: 37.39 },
  { id: 3, name: "Hawassa", lat: 7.05, lon: 38.48 },
  { id: 4, name: "Mekelle", lat: 13.5, lon: 39.47 },
  { id: 5, name: "Gondar", lat: 12.6, lon: 37.47 },
  { id: 6, name: "Dire Dawa", lat: 9.6, lon: 41.86 },
  { id: 7, name: "Jimma", lat: 7.67, lon: 36.83 },
  { id: 8, name: "Adama", lat: 8.54, lon: 39.27 },
];

const citiesEl = document.querySelector("#cities");
const savedListEl = document.querySelector("#saved-list");
const searchEl = document.querySelector("#search");

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  80: "Rain showers",
  95: "Thunderstorm",
};

function conditionText(code) {
  return WEATHER_CODES[code] || "Unknown";
}

async function loadCities() {
  citiesEl.innerHTML = `<p class="loading">Loading cities…</p>`;
  try {
    const res = await fetch("data/cities.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    state.cities = await res.json();
  } catch (err) {
    console.warn(
      "Could not load data/cities.json, using built-in city list instead.",
      err,
    );
    state.cities = FALLBACK_CITIES;
  }

  render();
  state.cities.forEach((city) => fetchWeather(city));
}

async function fetchWeather(city) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    state.weather[city.name] = {
      temp: data.current_weather.temperature,
      code: data.current_weather.weathercode,
    };
    render();
  } catch (err) {
    state.weather[city.name] = null;
    render();
  }
}

function render() {
  const term = state.search.toLowerCase();
  const shown = state.cities.filter((c) => c.name.toLowerCase().includes(term));

  citiesEl.innerHTML = shown.length
    ? shown
        .map((c) => {
          const w = state.weather[c.name];
          const isSaved = state.saved.includes(c.name);
          const weatherHtml =
            w === undefined
              ? `<p class="condition">Loading…</p>`
              : w === null
                ? `<p class="condition">Unavailable</p>`
                : `<p class="temp">${Math.round(w.temp)}°C</p><p class="condition">${conditionText(w.code)}</p>`;

          return `
            <article class="city" data-name="${c.name}">
              <h3>${c.name}</h3>
              ${weatherHtml}
              <button type="button" class="save" ${isSaved ? "disabled" : ""}>
                ${isSaved ? "Saved" : "Save"}
              </button>
            </article>
          `;
        })
        .join("")
    : `<p class="empty">No cities found.</p>`;

  renderSaved();
}

function renderSaved() {
  if (state.saved.length === 0) {
    savedListEl.innerHTML = `<li>No cities saved yet.</li>`;
    return;
  }

  savedListEl.innerHTML = state.saved
    .map((name) => {
      const w = state.weather[name];
      const weatherText =
        w === undefined
          ? "Loading…"
          : w === null
            ? "Unavailable"
            : `${Math.round(w.temp)}°C, ${conditionText(w.code)}`;

      return `
        <li data-name="${name}">
          ${name} — ${weatherText}
          <button type="button" class="rm">Remove</button>
        </li>
      `;
    })
    .join("");
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) state.saved = JSON.parse(raw);
}

searchEl.addEventListener("input", (e) => {
  state.search = e.target.value;
  render();
});

citiesEl.addEventListener("click", (e) => {
  if (!e.target.matches(".save")) return;

  const name = e.target.closest(".city").dataset.name;
  if (state.saved.includes(name)) return;

  state.saved.push(name);
  save();
  render();
});

savedListEl.addEventListener("click", (e) => {
  if (!e.target.matches(".rm")) return;

  const name = e.target.closest("li").dataset.name;
  state.saved = state.saved.filter((c) => c !== name);
  save();
  render();
});

async function init() {
  load();
  await loadCities();
}

init();
