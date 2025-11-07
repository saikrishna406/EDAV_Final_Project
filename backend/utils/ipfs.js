const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');

const PINATA_API_URL = 'https://api.pinata.cloud';

const initIPFS = () => {
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
    throw new Error('Pinata API credentials not found. Please set PINATA_API_KEY and PINATA_SECRET_KEY in .env');
  }
  return {
    apiKey: process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_KEY
  };
};

const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const keyHash = crypto.createHash('sha256').update(key).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', keyHash, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptData = (encryptedData, key) => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const keyHash = crypto.createHash('sha256').update(key).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const uploadToIPFS = async (fileBuffer, fileName, encryptionKey) => {
  try {
    const { apiKey, secretKey } = initIPFS();
    
    // Convert file buffer to Latin1 string for CryptoJS compatibility
    let binaryString = '';
    for (let i = 0; i < fileBuffer.length; i++) {
      binaryString += String.fromCharCode(fileBuffer[i]);
    }
    
    // Use CryptoJS for encryption to match frontend
    const CryptoJS = require('crypto-js');
    const encrypted = CryptoJS.AES.encrypt(binaryString, encryptionKey).toString();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', Buffer.from(encrypted), {
      filename: fileName,
      contentType: 'application/octet-stream'
    });
    
    // Upload to Pinata
    console.log('📤 Uploading to IPFS via Pinata:', fileName);
    const response = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      }
    });
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error.response?.data || error.message);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};

const downloadFromIPFS = async (cid, encryptionKey) => {
  try {
    // Download from IPFS gateway
    console.log('📥 Downloading from IPFS:', cid);
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      responseType: 'text'
    });
    
    const encryptedData = response.data;
    
    // Use CryptoJS for decryption to match frontend
    const CryptoJS = require('crypto-js');
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decryptedBytes = decrypted.toString(CryptoJS.enc.Latin1);
    
    // Convert to buffer
    const buffer = Buffer.alloc(decryptedBytes.length);
    for (let i = 0; i < decryptedBytes.length; i++) {
      buffer[i] = decryptedBytes.charCodeAt(i);
    }
    
    return buffer;
  } catch (error) {
    throw new Error(`IPFS download failed: ${error.message}`);
  }
};

module.exports = {
  uploadToIPFS,
  downloadFromIPFS,
  encryptData,
  decryptData
};