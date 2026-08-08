const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter bill amount (ETB): ", (billInput) => {
  rl.question("Enter party size: ", (partyInput) => {
    rl.question(
      "Enter payment method (TeleBirr / CBE Birr / Cash): ",
      (paymentMethod) => {
        const billAmount = Number(billInput);
        const partySize = Number(partyInput);

        let tipRate = billAmount > 300 ? 0.1 : 0.05;
        let tip = billAmount * tipRate;

        let serviceFee = 0;

        switch (paymentMethod) {
          case "TeleBirr":
            serviceFee = 5;
            break;
          case "CBE Birr":
            serviceFee = 3;
            break;
          default:
            serviceFee = 0;
        }

        let total = billAmount + tip + serviceFee;
        let perPerson = total / partySize;

        console.log(`\nBill: ${billAmount} ETB`);
        console.log(`Tip (${tipRate * 100}%): ${tip} ETB`);
        console.log(`Service Fee (${paymentMethod}): ${serviceFee} ETB`);
        console.log(`Total: ${total} ETB`);
        console.log(`Per Person: ${perPerson.toFixed(2)} ETB`);

        rl.close();
      },
    );
  });
});
