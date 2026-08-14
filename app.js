const form = document.querySelector("#search-form");
const input = document.querySelector("#country-input");
const out = document.querySelector("#facts");

function render(container, label, value) {
  const p = document.createElement("p");
  p.className = "fact";
  p.innerHTML = `<strong>${label}:</strong> `;
  p.append(value);
  container.append(p);
}

async function showCountry(name) {
  out.className = "loading";
  out.textContent = "Loading...";

  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${name}`);
    if (!res.ok) throw new Error("Country not found");
    const [c] = await res.json();

    out.className = "";
    out.innerHTML = "";

    const flag = document.createElement("img");
    flag.className = "flag";
    flag.src = c.flags.png;
    flag.alt = `Flag of ${c.name.common}`;
    out.append(flag);

    render(out, "Capital", c.capital[0]);
    render(out, "Population", c.population.toLocaleString());
    render(out, "Region", c.region);

    const currencyNames = Object.values(c.currencies)
      .map((cur) => cur.name)
      .join(", ");
    render(out, "Currencies", currencyNames);
  } catch (err) {
    out.className = "error";
    out.textContent = err.message;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;
  showCountry(name);
});

showCountry("ethiopia");
