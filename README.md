# Challenge for SummerOfBitcoin

This is my submission for the [Summer of Bitcoin](https://summerofbitcoin.org).

Essentially, [index.js](./index.js) parses the [mempool](./mempool.csv) and creates the [block](./block.txt) containing the valid transactions which maximised the miners fee keeping the max weight less than 4,000,000.

## how to run

*Prerequisites: Node.js*

1. Clone the repo
```sh
git clone https://github.com/arpancodes/sb_challenge.git
cd sb_challenge
```

2. Install the dependencies
```sh
npm i
```

3. Run the index.js
```sh
node index.js
```
