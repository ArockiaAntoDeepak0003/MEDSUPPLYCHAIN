const hre = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const [admin, manufacturer, distributor, regulator] = await hre.ethers.getSigners();
  const MedSupplyChain = await hre.ethers.getContractFactory("MedSupplyChain");
  const contract = MedSupplyChain.attach(contractAddress);

  console.log("Connected to MedSupplyChain at:", await contract.getAddress());

  // Roles
  const MANUFACTURER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MANUFACTURER"));
  const REGULATOR_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("REGULATOR"));

  await (await contract.connect(admin).grantRole(MANUFACTURER_ROLE, manufacturer.address)).wait();
  console.log("Granted MANUFACTURER role to:", manufacturer.address);

  await (await contract.connect(admin).grantRole(REGULATOR_ROLE, regulator.address)).wait();
  console.log("Granted REGULATOR role to:", regulator.address);

  // Register batch
  await (await contract.connect(manufacturer).registerBatch("BATCH001", "Paracetamol-500mg", "hash123456789")).wait();
  console.log("Registered batch BATCH001 by:", manufacturer.address);

  // Transfer to distributor
  await (await contract.connect(manufacturer).transferBatch("BATCH001", distributor.address)).wait();
  console.log("Transferred BATCH001 to:", distributor.address);

  // Verify before recall
  let batchData = await contract.verifyBatch("BATCH001");
  console.log("Before Recall:", {
    productId: batchData[0],
    productHash: batchData[1],
    currentHolder: batchData[2],
    timestamp: batchData[3].toString(),
    recalled: batchData[4]
  });

  // Recall the batch
  await (await contract.connect(regulator).recallBatch("BATCH001")).wait();
  console.log("Batch BATCH001 recalled by:", regulator.address);

  // Verify after recall
  batchData = await contract.verifyBatch("BATCH001");
  console.log("After Recall:", {
    productId: batchData[0],
    productHash: batchData[1],
    currentHolder: batchData[2],
    timestamp: batchData[3].toString(),
    recalled: batchData[4]
  });

  // History
  const history = await contract.getBatchHistory("BATCH001");
  console.log("Batch History:");
  history.forEach((holder, i) => {
    console.log(`Step ${i + 1}: ${holder}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
