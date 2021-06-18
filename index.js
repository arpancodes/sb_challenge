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
  .on("data", handleRow)
  .on("end", createBlockTxt);

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
  transactions.sort((a, b) => (a.feeWeight_ratio > b.feeWeight_ratio ? -1 : 1));
  const topTransactions = filterTopTransactions(transactions);
  topTransactions.sort((a, b) => (a.order < b.order ? -1 : 1));
  createBlock(topTransactions);
  console.log(block.transactions.length);
  fs.writeFileSync("./block.txt", block.transactions.join("\n"), {
    encoding: "utf-8",
  });
}

function filterTopTransactions(transactions) {
  const topTransactions = [];
  let totalWeight = 0;
  for (let i = 0; i < transactions.length; i++) {
    topTransactions.push({ ...transactions[i] });
    totalWeight += transactions[i].weight;
    if (totalWeight > MAX_WEIGHT) {
      break;
    }
  }
  return topTransactions;
}

function createBlock(transactions) {
  console.log(transactions.length);
  transactions.forEach((txn) => {
    addToBlock(txn);
  });
}

function addToBlock(txn) {
  if (txn.parents.length > 0) {
    const isParentInBlock = txn.parents.every((parent) =>
      block.transactions.includes(parent)
    );
    if (isParentInBlock) {
      block.transactions.push(txn.tx_id);
      block.totalFee += txn.fee;
      block.totalWeight += txn.weight;
    }
  } else {
    block.transactions.push(txn.tx_id);
    block.totalFee += txn.fee;
    block.totalWeight += txn.weight;
  }
}
