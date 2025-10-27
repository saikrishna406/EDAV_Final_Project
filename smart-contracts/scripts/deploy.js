const hre = require("hardhat");

async function main() {
  console.log("Deploying EDAV Access Contract...");

  const EDAVAccess = await hre.ethers.getContractFactory("EDAVAccess");
  const edavAccess = await EDAVAccess.deploy();

  await edavAccess.waitForDeployment();

  const contractAddress = await edavAccess.getAddress();
  console.log("EDAVAccess deployed to:", contractAddress);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    '../src/contracts/deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to src/contracts/deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});