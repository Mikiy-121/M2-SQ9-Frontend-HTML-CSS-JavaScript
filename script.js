
let selectLang = document.getElementById("lang");
const storedLang = localStorage.getItem("lang") || "none";

const select = document.getElementById("lang");
// 1. restore the saved choice on load
const saved = localStorage.getItem("lang");
if (saved) select.value = saved;
// 2. save whenever it changes
select.addEventListener("change", () => {
  localStorage.setItem("lang", select.value);
});

