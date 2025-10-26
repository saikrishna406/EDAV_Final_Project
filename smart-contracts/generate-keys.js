const { ethers } = require('ethers');

// Generate a random wallet for development
const wallet = ethers.Wallet.createRandom();

console.log('=== DEVELOPMENT WALLET GENERATED ===');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('\n=== ADD TO .env FILE ===');
console.log(`PRIVATE_KEY=${wallet.privateKey}`);
console.log('\n⚠️  IMPORTANT: This is for DEVELOPMENT only!');
console.log('⚠️  Never use this private key on mainnet!');
console.log('⚠️  Fund this address with Mumbai testnet MATIC from: https://faucet.polygon.technology/');