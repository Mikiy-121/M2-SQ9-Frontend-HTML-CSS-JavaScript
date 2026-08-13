let items = [];

const form = document.querySelector("#add-form");
const nameIn = document.querySelector("#name");
const list = document.querySelector("#list");
const count = document.querySelector("#count");

function render() {
  list.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.name;
    li.dataset.id = item.id;
    if (item.done) li.classList.add("done");

    const del = document.createElement("button");
    del.textContent = "x";
    del.className = "del";
    li.append(del);

    list.append(li);
  });

  count.textContent = `${items.length} items`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameIn.value.trim();
  if (!name) return;

  items.push({ id: Date.now(), name, done: false });
  nameIn.value = "";
  render();
});

list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.matches(".del")) {
    items = items.filter((i) => i.id !== id);
  } else {
    const item = items.find((i) => i.id === id);
    item.done = !item.done;
  }

  render();
});

render();
