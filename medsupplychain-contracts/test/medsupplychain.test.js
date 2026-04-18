const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedSupplyChain", function () {
  let med;
  let owner, manufacturer, distributor;

  beforeEach(async function () {
    // get signers
    [owner, manufacturer, distributor] = await ethers.getSigners();

    // compile + get factory
    const MedFactory = await ethers.getContractFactory("MedSupplyChain");

    // deploy
    med = await MedFactory.deploy();
    // ethers v6: wait for deployment
    if (med.waitForDeployment) {
      await med.waitForDeployment();
    } else if (typeof med.deployed === "function") {
      // fallback if someone uses an older ethers
      await med.deployed();
    }
  });

  it("owner is admin and can grant MANUFACTURER_ROLE", async function () {
    const role = await med.MANUFACTURER_ROLE();
    // grant role to manufacturer
    await med.grantRole(role, manufacturer.address);
    const has = await med.hasRole(role, manufacturer.address);
    expect(has).to.equal(true);
  });

  it("manufacturer can register a batch and verify it", async function () {
    const role = await med.MANUFACTURER_ROLE();
    await med.grantRole(role, manufacturer.address);

    // connect contract to manufacturer signer
    const medFromMan = med.connect(manufacturer);

    // register batch
    const tx = await medFromMan.registerBatch("B001", "P001", "HASH001");
    await tx.wait();

    // verify (adapt if verifyBatch returns tuple)
    const info = await med.verifyBatch("B001");
    expect(info).to.not.be.undefined;
  });

  it("can transfer batch and history updates", async function () {
    const role = await med.MANUFACTURER_ROLE();
    await med.grantRole(role, manufacturer.address);
    const medFromMan = med.connect(manufacturer);

    await (await medFromMan.registerBatch("B002", "P002", "HASH002")).wait();
    await (await medFromMan.transferBatch("B002", distributor.address)).wait();

    const history = await med.getBatchHistory("B002");
    // history might be array of addresses; assert distributor present
    expect(Array.isArray(history)).to.equal(true);
    expect(history.map(h => h.toLowerCase())).to.include(distributor.address.toLowerCase());
  });
});