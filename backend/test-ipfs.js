require('dotenv').config();
const { uploadToIPFS, downloadFromIPFS } = require('./utils/ipfs');

async function testIPFS() {
  console.log('🧪 Testing IPFS with Pinata...');
  
  try {
    // Test data
    const testData = Buffer.from('Test medical record data', 'utf8');
    const fileName = 'test-record.txt';
    const encryptionKey = 'test-encryption-key-123';
    
    console.log('📤 Testing upload...');
    const cid = await uploadToIPFS(testData, fileName, encryptionKey);
    console.log('✅ Upload successful! CID:', cid);
    
    console.log('📥 Testing download...');
    const downloadedData = await downloadFromIPFS(cid, encryptionKey);
    console.log('✅ Download successful! Data:', downloadedData.toString());
    
    console.log('🎉 IPFS test completed successfully!');
    
  } catch (error) {
    console.error('❌ IPFS test failed:', error.message);
    
    if (error.message.includes('Pinata API credentials')) {
      console.log('');
      console.log('💡 Please run: node setup-pinata.js');
      console.log('   Then update your .env file with real Pinata keys');
    }
  }
}

testIPFS();