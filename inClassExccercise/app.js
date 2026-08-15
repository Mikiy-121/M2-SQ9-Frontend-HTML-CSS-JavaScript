const form = document.getElementById("signup-form");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const errorEl = document.getElementById("error");
const successEl = document.getElementById("success");
const countEl = document.getElementById("count");

const STORAGE_KEY = "signups";

const ETHIOPIAN_PHONE_REGEX = /^(?:\+251|251|0)[79]\d{8}$/;

function getSignups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSignups(signups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(signups));
}

function updateCount() {
  const signups = getSignups();
  countEl.textContent =
    signups.length === 1
      ? "1 person has signed up so far."
      : `${signups.length} people have signed up so far.`;
}

function showError(message) {
  errorEl.textContent = message;
  successEl.textContent = "";
}

function clearMessages() {
  errorEl.textContent = "";
  successEl.textContent = "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearMessages();

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (name.length < 2) {
    showError("Please enter a name with at least 2 characters.");
    return;
  }

  if (!ETHIOPIAN_PHONE_REGEX.test(phone)) {
    showError(
      "Please enter a valid Ethiopian phone number (e.g. 0912345678 or +251912345678).",
    );
    return;
  }

  const signups = getSignups();
  signups.push({ name, phone, signedUpAt: new Date().toISOString() });
  saveSignups(signups);

  form.reset();
  successEl.textContent = "You're signed up! Thank you!";
  updateCount();
});

// On load: show how many people have signed up
updateCount();
