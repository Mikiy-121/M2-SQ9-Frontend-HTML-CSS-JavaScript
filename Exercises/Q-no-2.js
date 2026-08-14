// 2. Rewriting a three-step .then chain as async/await + try/catch.

// ---- ORIGINAL (.then chain) ----
// fetch('https://jsonplaceholder.typicode.com/users/1')
//   .then((res) => res.json())
//   .then((data) => render(data))
//   .catch((err) => console.error('Error:', err));

function render(user) {
  console.log(`Name:  ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`City:  ${user.address.city}`);
}

// ---- REWRITTEN (async/await) ----
async function loadUser() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users/1');

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    render(data);
  } catch (err) {
    console.error('Error loading user:', err.message);
  }
}

loadUser();
