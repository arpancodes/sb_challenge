const fs = require("fs");
const csv = require("@fast-csv/parse");

let block = {
  transactions: [],
  totalWeight: 0,
  totalFee: 0,
};

const transactions = [];
const MAX_WEIGHT = 4_000_000;

fs.createReadStream("mempool.csv")
  .pipe(csv.parse())
  .on("error", (error) => console.error(error))
  .on("data", handleRow) // handle each row
  .on("end", createBlockTxt); // after reading the stream

let position = 1;
function handleRow(row) {
  if (row[0] === "tx_id") return;
  const [tx_id, fee, weight, parents] = row;
  transactions.push({
    tx_id,
    fee: Number(fee),
    weight: Number(weight),
    parents: parents === "" ? [] : parents.split(";"),
    order: position,
    feeWeight_ratio: Number(fee) / Number(weight),
  });
  position++;
}

function createBlockTxt() {
  const validTransactions = filterValidTransactions(transactions); // Filter valid transactions by their parents
  validTransactions.sort((a, b) =>
    a.feeWeight_ratio > b.feeWeight_ratio ? -1 : 1
  ); // Sort according to the fee/weight ratio for maximum profit
  const topTransactions = filterTopTransactions(validTransactions); // Filter the top transaction so that total weight is just less than 4,000,000
  topTransactions.sort((a, b) => (a.order < b.order ? -1 : 1)); // Sort according to the order so the initial order is retained
  createBlock(topTransactions);
  console.log(block);
  fs.writeFileSync("./block.txt", block.transactions.join("\n"), {
    encoding: "utf-8",
  });
}

function filterTopTransactions(transactions) {
  const topTransactions = [];
  let totalWeight = 0,
    i = 0;

  while (MAX_WEIGHT > totalWeight + transactions[i].weight) {
    topTransactions.push(transactions[i]);
    totalWeight += transactions[i].weight;
    i++;
  }
  console.log(transactions[i].weight);

  return topTransactions;
}

function createBlock(transactions) {
  transactions.forEach((txn) => {
    block.transactions.push(txn.tx_id);
    block.totalFee += txn.fee;
    block.totalWeight += txn.weight;
  });
}

function filterValidTransactions(transactions) {
  const validTransactions = [];
  transactions.forEach((txn) => {
    if (txn.parents.length > 0) {
      const isParentInBlock = txn.parents.every((parent) =>
        validTransactions.some((t) => t.tx_id === parent)
      );
      if (isParentInBlock) {
        validTransactions.push(txn);
      }
    } else {
      validTransactions.push(txn);
    }
  });
  return validTransactions;
}
