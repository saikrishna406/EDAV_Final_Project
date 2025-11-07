require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkHealthRecords() {
  console.log('🔍 Checking health records in database...');
  
  const { data, error } = await supabase
    .from('health_records')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('📋 Health Records:');
  data.forEach((record, index) => {
    console.log(`\n${index + 1}. Record ID: ${record.id}`);
    console.log(`   Name: ${record.name}`);
    console.log(`   Patient ID: ${record.patient_id}`);
    console.log(`   IPFS CID: ${record.ipfs_cid}`);
    console.log(`   Encryption Key: ${record.encryption_key ? 'EXISTS' : 'MISSING'}`);
    console.log(`   Is Encrypted: ${record.is_encrypted}`);
    console.log(`   Upload Date: ${record.upload_date}`);
  });
}

checkHealthRecords();