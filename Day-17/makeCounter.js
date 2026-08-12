"use strict";

// makeCounter() — the closure remembers a private "count" variable,
// letting each returned counter track its own running total independently.
function makeCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counterA = makeCounter();
console.log(counterA()); // 1
console.log(counterA()); // 2
console.log(counterA()); // 3

const counterB = makeCounter();

console.log(counterB()); // 1 (separate closure, own private count)

// once(fn) — the closure remembers a private "called" flag,
// letting the returned function know if it has already run before,
// so it can block every call after the first one.
function once(fn) {
  let called = false;

  return function (...args) {
    if (called) return;
    called = true;
    return fn(...args);
  };
}

function submitPayment(amount) {
  console.log(`Payment of ${amount} ETB submitted.`);
}

const pay = once(submitPayment);
pay(500); // runs — "Payment of 500 ETB submitted."
pay(500); // ignored — nothing happens
