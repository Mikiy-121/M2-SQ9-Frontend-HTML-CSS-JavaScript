import { withVat, format } from "./pricing.js";

const orders = [
  {
    id: "ORD-001",
    customer: "Bethlehem Tadesse",
    items: [
      { name: "Coffee (1kg)", price: 350, qty: 2 },
      { name: "Berbere Spice", price: 120, qty: 1 },
    ],
  },
  {
    id: "ORD-002",
    customer: "Yonas Girma",
    items: [{ name: "Injera Pack", price: 80, qty: 3 }],
  },
  {
    id: "ORD-003",
    customer: "Selamawit Alemu",
    items: [
      { name: "Honey Wine (Tej)", price: 300, qty: 2 },
      { name: "Shiro Powder", price: 90, qty: 4 },
      { name: "Coffee (1kg)", price: 350, qty: 1 },
    ],
  },
];

function orderSubtotal(items) {
  return items.reduce((sum, { price, qty }) => sum + price * qty, 0);
}

const ordersWithTotals = orders.map((order) => {
  const subtotal = orderSubtotal(order.items);
  const total = withVat(subtotal);
  return { ...order, subtotal, total };
});

const bigOrders = ordersWithTotals.filter((order) => order.total > 500);

const grandTotal = ordersWithTotals.reduce((sum, { total }) => sum + total, 0);

console.log("===== Addis Market — Order Summary =====\n");

ordersWithTotals.forEach(({ id, customer, subtotal, total }) => {
  console.log(`${id}  |  ${customer}`);
  console.log(`  Subtotal: ${format(subtotal)}`);
  console.log(`  Total (incl. 15% VAT): ${format(total)}\n`);
});

console.log("----- Orders over 500 ETB -----");
if (bigOrders.length === 0) {
  console.log("None");
} else {
  bigOrders.forEach(({ id, customer, total }) =>
    console.log(`${id} — ${customer}: ${format(total)}`),
  );
}

console.log("\n=========================================");
console.log(`GRAND TOTAL: ${format(grandTotal)}`);
console.log("=========================================");
