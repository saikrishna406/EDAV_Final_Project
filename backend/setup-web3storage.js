const { create } = require('@web3-storage/w3up-client');

async function setupWeb3Storage() {
  console.log('🌐 Setting up Web3.Storage...');
  
  try {
    const client = await create();
    console.log('✅ Web3.Storage client created');
    
    console.log('\n📋 Next steps:');
    console.log('1. Visit: https://web3.storage/');
    console.log('2. Sign up with your email');
    console.log('3. Verify your email');
    console.log('4. Create a space for your project');
    console.log('5. Get your API token from the dashboard');
    console.log('6. Update .env: WEB3_STORAGE_TOKEN=your_actual_token');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupWeb3Storage();