const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting local deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");

  const EDAVAccess = await ethers.getContractFactory("EDAVAccess");
  console.log("📦 Deploying EDAVAccess contract...");
  
  const edavAccess = await EDAVAccess.deploy();
  await edavAccess.deployed();
  
  console.log("✅ EDAVAccess deployed to:", edavAccess.address);
  console.log("🔗 Transaction hash:", edavAccess.deployTransaction.hash);
  
  // Test basic functionality
  console.log("\n🧪 Testing contract...");
  const testPatient = "0x1234567890123456789012345678901234567890";
  const testIPFS = "QmTestHash123";
  const testGuardians = [deployer.address, "0x9876543210987654321098765432109876543210"];
  
  try {
    const tx = await edavAccess.registerPatient(testPatient, testIPFS, testGuardians);
    await tx.wait();
    console.log("✅ Test patient registered successfully");
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

main()
  .then(() => {
    console.log("🎉 Deployment completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });