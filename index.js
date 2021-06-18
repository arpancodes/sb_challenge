const fs = require("fs");
const csv = require("@fast-csv/parse");

let block = {
  transactions: [],
  totalWeight: 0,
  totalFee: 0,
};

fs.createReadStream("mempool.csv")
  .pipe(csv.parse())
  .on("error", (error) => console.error(error))
  .on("data", handleRow)
  .on("end", createBlockTxt);

function handleRow(row) {
  if (block.totalWeight > 4000000) return;
  const [tx_id, fee, weight, parents] = row;
  const parentsArray = parents.split(";");
  if (parents === "") {
    block.transactions.push(tx_id);
    block.totalFee += Number(fee);
    block.totalWeight += Number(weight);
  } else {
    const isParentinBlock = parentsArray.every((parent) =>
      block.transactions.includes(parent)
    );
    if (isParentinBlock) {
      block.transactions.push(tx_id);
      block.totalFee += Number(fee);
      block.totalWeight += Number(weight);
    }
  }
}

function createBlockTxt() {
  console.log(block);
  fs.writeFileSync("./block.txt", block.transactions.join("\n"), {
    encoding: "utf-8",
  });
}
