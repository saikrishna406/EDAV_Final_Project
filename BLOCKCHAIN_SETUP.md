# EDAV Blockchain Setup Guide

## 1. Install Dependencies

```bash
cd smart-contracts
npm install
```

## 2. Start Local Blockchain (Development)

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contract
npm run deploy:local
```

## 3. Configure MetaMask

1. **Add Local Network:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Test Account:**
   - Use private key from Hardhat node output
   - Account will have 10,000 ETH for testing

## 4. Deploy to Testnet (Production)

1. **Setup Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Infura URL and private key
   ```

2. **Deploy to Sepolia:**
   ```bash
   npm run deploy:sepolia
   ```

## 5. Update Frontend Contract Address

After deployment, update the contract address in:
- `src/hooks/useContract.ts`
- Replace `CONTRACT_ADDRESS` with deployed address

## 6. Test Integration

1. **Patient Registration:**
   - Connect MetaMask
   - Add guardians with wallet addresses
   - Patient gets registered on blockchain

2. **Hospital Access:**
   - Hospital scans QR code
   - Creates access request on blockchain
   - Guardians approve via MetaMask

3. **Guardian Approval:**
   - Guardians receive notifications
   - Approve/reject via blockchain transaction
   - Access granted when threshold met

## Current Status

✅ Smart contract deployed locally
✅ Frontend integration added
✅ MetaMask connection working
⏳ IPFS integration (next step)
⏳ Guardian dashboard (next step)