// scripts/grantManufacturer.js
// Grants MANUFACTURER_ROLE to TARGET (env.TARGET) or the default address below.
// Usage (PowerShell):
//   $env:TARGET='0xYourAddress'; npx hardhat run --network localhost scripts/grantManufacturer.js

async function main() {
  // Replace this with your deployed contract address if it's different
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // target address to grant (from env.TARGET or fallback)
  const target = process.env.TARGET || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  console.log("Using contract:", contractAddress);
  console.log("Granting MANUFACTURER_ROLE to:", target);

  const [deployer] = await ethers.getSigners();
  console.log("Script signer (deployer):", deployer.address);

  const Med = await ethers.getContractFactory("MedSupplyChain");
  const med = await Med.attach(contractAddress);

  const role = await med.MANUFACTURER_ROLE();
  console.log("MANUFACTURER_ROLE:", role);

  const already = await med.hasRole(role, target);
  console.log("Already has role?:", already);

  if (already) {
    console.log("Target already has MANUFACTURER_ROLE - nothing to do.");
    return;
  }

  const tx = await med.grantRole(role, target);
  console.log("tx sent:", tx.hash);
  await tx.wait();
  console.log("Grant complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});