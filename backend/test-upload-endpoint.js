require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { uploadToIPFS } = require('./utils/ipfs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.post('/test-upload', upload.single('file'), async (req, res) => {
  try {
    console.log('File received:', req.file ? req.file.originalname : 'No file');
    console.log('Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const encryptionKey = 'test-key-123';
    console.log('Starting IPFS upload...');
    
    const ipfsHash = await uploadToIPFS(req.file.buffer, req.file.originalname, encryptionKey);
    
    console.log('Upload successful:', ipfsHash);
    
    res.json({
      success: true,
      ipfsHash,
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test upload server running on port ${PORT}`);
  console.log('Test with: curl -F "file=@test.txt" http://localhost:3002/test-upload');
});