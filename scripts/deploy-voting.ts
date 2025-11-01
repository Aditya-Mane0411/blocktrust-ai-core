import { ethers } from "hardhat";

/**
 * Deploy a single VotingTemplate contract
 * Used for creating individual voting events
 */
async function main() {
  console.log("🗳️  Deploying VotingTemplate...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const VotingTemplate = await ethers.getContractFactory("VotingTemplate");
  const votingTemplate = await VotingTemplate.deploy();
  await votingTemplate.waitForDeployment();

  const address = await votingTemplate.getAddress();
  console.log("✅ VotingTemplate deployed to:", address);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
