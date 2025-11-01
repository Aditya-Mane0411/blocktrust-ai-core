import { ethers } from "hardhat";

/**
 * Deploy a single PetitionTemplate contract
 * Used for creating individual petition events
 */
async function main() {
  console.log("📝 Deploying PetitionTemplate...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const PetitionTemplate = await ethers.getContractFactory("PetitionTemplate");
  const petitionTemplate = await PetitionTemplate.deploy();
  await petitionTemplate.waitForDeployment();

  const address = await petitionTemplate.getAddress();
  console.log("✅ PetitionTemplate deployed to:", address);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
