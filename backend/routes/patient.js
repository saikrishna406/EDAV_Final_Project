const express = require('express');
const multer = require('multer');
const { generateWallet, registerPatient } = require('../utils/web3');
const { uploadToIPFS } = require('../utils/ipfs');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Generate wallet for new patient
router.post('/generate-wallet', async (req, res) => {
  try {
    const wallet = generateWallet();
    res.json({
      success: true,
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register patient on blockchain
router.post('/register', async (req, res) => {
  try {
    const { patientAddress, ipfsHash, guardianAddresses } = req.body;
    
    // Check if blockchain is configured
    if (process.env.CONTRACT_ADDRESS === 'your_deployed_contract_address') {
      // Mock response for development
      res.json({
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Mock registration - blockchain not configured'
      });
      return;
    }
    
    const txHash = await registerPatient(patientAddress, ipfsHash, guardianAddresses);
    
    res.json({
      success: true,
      transactionHash: txHash
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload medical record
router.post('/upload-record', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { patientId } = req.body;
    const encryptionKey = `patient_${patientId}_key`; // In production, use proper key management
    
    const ipfsHash = await uploadToIPFS(req.file.buffer, req.file.originalname, encryptionKey);
    
    res.json({
      success: true,
      ipfsHash,
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate QR code data
router.post('/generate-qr', async (req, res) => {
  try {
    const { patientAddress, ipfsHash } = req.body;
    
    const qrData = {
      type: 'EDAV_EMERGENCY',
      patientAddress,
      ipfsHash,
      timestamp: Date.now()
    };
    
    res.json({
      success: true,
      qrData: JSON.stringify(qrData)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add guardian
router.post('/add-guardian', async (req, res) => {
  try {
    const { patientId, name, walletAddress, relationship, contact } = req.body;
    
    if (!patientId || !name || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Patient ID, name, and wallet address are required' 
      });
    }
    
    // In a real implementation, you would save to database
    // For now, return success response
    res.json({
      success: true,
      guardian: {
        id: Date.now().toString(),
        patientId,
        name,
        walletAddress,
        relationship,
        contact,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get guardians for patient
router.get('/guardians/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // In a real implementation, you would fetch from database
    // For now, return empty array
    res.json({
      success: true,
      guardians: []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;