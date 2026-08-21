const state = {
  cities: [],
  weather: {},
  saved: [],
  reservations: [],
  selectedCity: "",
  search: "",
};

const STORAGE_KEY = "boleweather-saved";
const RESERVATIONS_KEY = "boleweather-reservations";
const PHONE_PATTERN = /^(?:\+251|0)9\d{8}$/;

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

const HOTELS = {
  "Addis Ababa": [
    { id: 101, name: "Skylight Hotel", pricePerNight: 3200 },
    { id: 102, name: "Jupiter International", pricePerNight: 2600 },
    { id: 103, name: "Golden Tulip Addis", pricePerNight: 4100 },
  ],
  "Bahir Dar": [
    { id: 201, name: "Kuriftu Resort", pricePerNight: 3800 },
    { id: 202, name: "Blue Nile Resort", pricePerNight: 2200 },
  ],
  Hawassa: [
    { id: 301, name: "Haile Resort", pricePerNight: 3500 },
    { id: 302, name: "Lewi Resort", pricePerNight: 2800 },
  ],
  Mekelle: [
    { id: 401, name: "Axum Hotel", pricePerNight: 1900 },
    { id: 402, name: "Planet Hotel", pricePerNight: 2100 },
  ],
  Gondar: [
    { id: 501, name: "Goha Hotel", pricePerNight: 2400 },
    { id: 502, name: "Taye Belay Hotel", pricePerNight: 1700 },
  ],
  "Dire Dawa": [
    { id: 601, name: "Ras Hotel", pricePerNight: 1800 },
    { id: 602, name: "Samrat Hotel", pricePerNight: 2000 },
  ],
  Jimma: [{ id: 701, name: "Central Jimma Hotel", pricePerNight: 1600 }],
  Adama: [
    { id: 801, name: "Adama Sabegn Hotel", pricePerNight: 1500 },
    { id: 802, name: "Adama Green Hotel", pricePerNight: 1900 },
  ],
};

const citiesEl = document.querySelector("#cities");
const savedListEl = document.querySelector("#saved-list");
const searchEl = document.querySelector("#search");
const reserveForm = document.querySelector("#reserve-form");
const reserveCityEl = document.querySelector("#reserve-city");
const reserveHotelEl = document.querySelector("#reserve-hotel");
const reserveNameEl = document.querySelector("#reserve-name");
const reservePhoneEl = document.querySelector("#reserve-phone");
const reserveErrorEl = document.querySelector("#reserve-error");
const reservationsListEl = document.querySelector("#reservations-list");

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

function formatWeather(w) {
  if (w === undefined) return { temp: "", condition: "Loading…" };
  if (w === null) return { temp: "", condition: "Unavailable" };
  return { temp: `${Math.round(w.temp)}°C`, condition: conditionText(w.code) };
}

async function loadCities() {
  citiesEl.innerHTML = `<p class="loading">Loading cities…</p>`;

  try {
    const res = await fetch("data/cities.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    state.cities = Array.isArray(data) && data.length ? data : FALLBACK_CITIES;
  } catch (err) {
    console.warn(
      "Could not load data/cities.json, using built-in city list instead.",
      err,
    );
    state.cities = FALLBACK_CITIES;
  }

  renderCityOptions();
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
  } catch (err) {
    state.weather[city.name] = null;
  }
  render();
}

function render() {
  renderCities();
  renderSaved();
}

function renderCities() {
  if (state.cities.length === 0) {
    citiesEl.innerHTML = `<p class="empty">No cities available.</p>`;
    return;
  }

  const term = state.search.trim().toLowerCase();
  const shown = term
    ? state.cities.filter((c) => c.name.toLowerCase().includes(term))
    : state.cities;

  if (shown.length === 0) {
    citiesEl.innerHTML = `<p class="empty">No cities match "${state.search}".</p>`;
    return;
  }

  citiesEl.innerHTML = shown
    .map((c) => {
      const w = formatWeather(state.weather[c.name]);
      const isSaved = state.saved.includes(c.name);
      const isSelected = c.name === state.selectedCity;
      return `
        <article class="city ${isSelected ? "selected" : ""}" data-name="${c.name}">
          <h3>${c.name}</h3>
          ${w.temp ? `<p class="temp">${w.temp}</p>` : ""}
          <p class="condition">${w.condition}</p>
          <div class="city-actions">
            <button type="button" class="select" ${isSelected ? "disabled" : ""}>
              ${isSelected ? "Selected" : "Select"}
            </button>
            <button type="button" class="save" ${isSaved ? "disabled" : ""}>
              ${isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSaved() {
  if (state.saved.length === 0) {
    savedListEl.innerHTML = `<li class="empty">No cities saved yet.</li>`;
    return;
  }

  savedListEl.innerHTML = state.saved
    .map((name) => {
      const w = formatWeather(state.weather[name]);
      const text = w.temp ? `${w.temp}, ${w.condition}` : w.condition;
      return `
        <li data-name="${name}">
          ${name} — ${text}
          <button type="button" class="rm">Remove</button>
        </li>
      `;
    })
    .join("");
}

function renderCityOptions() {
  reserveCityEl.innerHTML = state.cities
    .map((c) => `<option value="${c.name}">${c.name}</option>`)
    .join("");

  if (state.selectedCity) reserveCityEl.value = state.selectedCity;
  renderHotelOptions(reserveCityEl.value);
}

function renderHotelOptions(cityName) {
  const hotels = HOTELS[cityName] || [];
  reserveHotelEl.innerHTML = hotels.length
    ? hotels
        .map(
          (h) =>
            `<option value="${h.id}">${h.name} — ${h.pricePerNight} ETB/night</option>`,
        )
        .join("")
    : `<option value="">No hotels listed for this city</option>`;
}

function renderReservations() {
  if (state.reservations.length === 0) {
    reservationsListEl.innerHTML = `<li class="empty">No reservations yet.</li>`;
    return;
  }

  reservationsListEl.innerHTML = state.reservations
    .map(
      (r) => `
        <li data-id="${r.id}">
          ${r.hotelName}, ${r.city} — ${r.name}, ${r.phone} (${r.pricePerNight} ETB/night)
          <button type="button" class="rm-reservation">Cancel</button>
        </li>
      `,
    )
    .join("");
}

function selectCity(name) {
  state.selectedCity = name;
  reserveCityEl.value = name;
  renderHotelOptions(name);
  renderCities();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.saved = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    state.saved = [];
  }
}

function loadReservations() {
  const raw = localStorage.getItem(RESERVATIONS_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.reservations = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    state.reservations = [];
  }
}

function saveReservations() {
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(state.reservations));
}

function validateReservation({ city, hotelId, name, phone }) {
  if (!city) return "Choose a city.";
  if (!hotelId) return "Choose a hotel.";
  if (!name.trim()) return "Please enter your name.";
  if (!PHONE_PATTERN.test(phone)) return "Enter a valid Ethiopian phone.";
  return "";
}

function placeReservation(data) {
  const hotel = (HOTELS[data.city] || []).find(
    (h) => h.id === Number(data.hotelId),
  );

  const reservation = {
    id: Date.now(),
    city: data.city,
    hotelName: hotel ? hotel.name : "Unknown hotel",
    pricePerNight: hotel ? hotel.pricePerNight : 0,
    name: data.name.trim(),
    phone: data.phone,
    reservedAt: new Date().toISOString(),
  };

  state.reservations.push(reservation);
  saveReservations();
  renderReservations();

  return reservation;
}

searchEl.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderCities();
});

citiesEl.addEventListener("click", (e) => {
  if (e.target.matches(".select")) {
    const name = e.target.closest(".city").dataset.name;
    selectCity(name);
    return;
  }

  if (e.target.matches(".save")) {
    const name = e.target.closest(".city").dataset.name;
    if (state.saved.includes(name)) return;
    state.saved.push(name);
    save();
    render();
  }
});

savedListEl.addEventListener("click", (e) => {
  if (!e.target.matches(".rm")) return;

  const name = e.target.closest("li").dataset.name;
  state.saved = state.saved.filter((c) => c !== name);
  save();
  render();
});

reserveCityEl.addEventListener("change", (e) => {
  selectCity(e.target.value);
});

reservationsListEl.addEventListener("click", (e) => {
  if (!e.target.matches(".rm-reservation")) return;

  const id = Number(e.target.closest("li").dataset.id);
  state.reservations = state.reservations.filter((r) => r.id !== id);
  saveReservations();
  renderReservations();
});

reserveForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    city: reserveCityEl.value,
    hotelId: reserveHotelEl.value,
    name: reserveNameEl.value,
    phone: reservePhoneEl.value.trim(),
  };

  const msg = validateReservation(data);
  reserveErrorEl.classList.remove("success");
  reserveErrorEl.textContent = msg;
  if (msg) return;

  const reservation = placeReservation(data);

  reserveNameEl.value = "";
  reservePhoneEl.value = "";
  reserveErrorEl.classList.add("success");
  reserveErrorEl.textContent = `${reservation.hotelName} reserved in ${reservation.city} — ${reservation.pricePerNight} ETB/night.`;
});

async function init() {
  load();
  loadReservations();
  renderReservations();
  await loadCities();
}

init();
