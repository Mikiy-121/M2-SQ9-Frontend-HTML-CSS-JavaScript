const out = document.querySelector("#facts");
const form = document.querySelector("#search-form");
const input = document.querySelector("#search-input");

// Appends one label/value row to the given container.
function render(container, label, value) {
  const row = document.createElement("div");
  row.className = "fact-row";
  row.innerHTML = `
    <span class="fact-label">${label}</span>
    <span class="fact-value">${value}</span>
  `;
  container.appendChild(row);
}

async function showCountry(name) {
  out.classList.remove("error");
  out.textContent = "Loading...";

  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${name}`);
    if (!res.ok) throw new Error("Country not found");

    const [c] = await res.json();

    out.innerHTML = "";
    render(out, "Name", c.name.common);
    render(out, "Capital", c.capital ? c.capital[0] : "—");
    render(out, "Population", c.population.toLocaleString());
    render(out, "Region", c.region);
  } catch (err) {
    out.classList.add("error");
    out.textContent = err.message; // friendly error
  }
}

// Default on first load.
showCountry("ethiopia");

// Search on submit.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  showCountry(query);
});
