import SHA256 from 'crypto-js/sha256';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export class Transaction {
  signature: string;
  timestamp: string;
  fromAdress: string | null;
  toAdress: string;
  amount: number;

  constructor(fromAdress: string | null, toAdress: string, amount: number) {
    this.fromAdress = fromAdress;
    this.toAdress = toAdress;
    this.amount = amount;
    this.signature = '';
    this.timestamp = Date.now().toString();
  }

  caculateHash() {
    return SHA256(
      this.fromAdress + this.toAdress + this.amount + this.timestamp
    ).toString();
  }

  signTransaction(signingKey: EC.KeyPair) {
    if (signingKey.getPublic('hex') !== this.fromAdress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const hashTx = this.caculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid() {
    if (this.fromAdress === null) {
      return true;
    }

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAdress, 'hex');
    return publicKey.verify(this.caculateHash(), this.signature);
  }
}

class Block {
  hash: string;
  nonce: number;
  timestamp: string;
  transactions: any;
  previousHash: string;

  constructor(timestamp: string, transactions: any, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.caculateHash();
    this.nonce = 0;
  }

  caculateHash() {
    return SHA256(
      this.timestamp +
        this.previousHash +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty: number) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.caculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }

  hasValidTransactions() {
    for (const tran of this.transactions) {
      if (!tran.isValid()) {
        return false;
      }
    }

    return true;
  }
}

export class Blockchain {
  chain: Block[];
  pendingTransactions: Transaction[];
  difficulty: number;
  miningReward: number;

  constructor(difficulty: number, miningReward: number) {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.difficulty = difficulty;
    this.miningReward = miningReward;
  }

  createGenesisBlock() {
    return new Block(Date.now().toString(), 'genesis block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress: string) {
    let block = new Block(Date.now().toString(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.fromAdress || !transaction.toAdress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address: string) {
    let balance = 0;

    for (const block of this.chain) {
      for (const tran of block.transactions) {
        if (tran.fromAddress === address) {
          balance -= tran.amount;
        }

        if (tran.toAdress === address) {
          balance += tran.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.caculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      return true;
    }
  }
}
