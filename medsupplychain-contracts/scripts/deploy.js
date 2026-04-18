const hre = require("hardhat");

async function main() {
  const MedSupplyChain = await hre.ethers.getContractFactory("MedSupplyChain");
  const contract = await MedSupplyChain.deploy();
  await contract.waitForDeployment(); // Ethers v6 method
  console.log("MedSupplyChain deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
