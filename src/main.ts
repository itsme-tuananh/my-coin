import { Blockchain, Transaction } from './blockchain';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate(
  'key018db968b911e3b4ae49cbe037221479594406891a48ca38e2fcf924cd6301dfkey018db968b911e3b4ae49cbe037221479594406891a48ca38e2fcf924cd6301df'
);
const myWalletAddress = myKey.getPublic('hex');

let myCoin = new Blockchain(3, 100);

const tx1 = new Transaction(myWalletAddress, 'to address goes here', 10);
tx1.signTransaction(myKey);
myCoin.addTransaction(tx1);

console.log('\nStarting the miner...');
myCoin.minePendingTransactions(myWalletAddress);

console.log(
  `\nBalance of Tuan Anh is ${myCoin.getBalanceOfAddress(myWalletAddress)}`
);

console.log('\nStarting the miner again...');
myCoin.minePendingTransactions(myWalletAddress);

console.log(
  `\nBalance of Tuan Anh is ${myCoin.getBalanceOfAddress(myWalletAddress)}`
);

console.log('\nStarting the miner again...');
myCoin.minePendingTransactions(myWalletAddress);

console.log(
  `\nBalance of Tuan Anh is ${myCoin.getBalanceOfAddress(myWalletAddress)}`
);
