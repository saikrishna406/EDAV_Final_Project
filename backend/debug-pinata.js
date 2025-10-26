require('dotenv').config();
const axios = require('axios');

async function testPinataAuth() {
  console.log('🔍 Testing Pinata authentication...');
  
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
  console.log('Secret Key:', secretKey ? `${secretKey.substring(0, 8)}...` : 'NOT SET');
  
  try {
    const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      }
    });
    
    console.log('✅ Authentication successful:', response.data);
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
  }
}

testPinataAuth();