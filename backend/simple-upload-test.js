require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

async function simpleUploadTest() {
  console.log('🧪 Simple Pinata upload test...');
  
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  
  try {
    const formData = new FormData();
    formData.append('file', Buffer.from('Hello IPFS!'), 'test.txt');
    
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      }
    });
    
    console.log('✅ Upload successful!');
    console.log('CID:', response.data.IpfsHash);
    console.log('Size:', response.data.PinSize);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
  }
}

simpleUploadTest();