import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting deployment to", (await ethers.provider.getNetwork()).name);

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy VotingTemplate
  console.log("\n📋 Deploying VotingTemplate...");
  const VotingTemplate = await ethers.getContractFactory("VotingTemplate");
  const votingTemplate = await VotingTemplate.deploy();
  await votingTemplate.waitForDeployment();
  const votingAddress = await votingTemplate.getAddress();
  console.log("✅ VotingTemplate deployed to:", votingAddress);

  // Deploy PetitionTemplate
  console.log("\n📋 Deploying PetitionTemplate...");
  const PetitionTemplate = await ethers.getContractFactory("PetitionTemplate");
  const petitionTemplate = await PetitionTemplate.deploy();
  await petitionTemplate.waitForDeployment();
  const petitionAddress = await petitionTemplate.getAddress();
  console.log("✅ PetitionTemplate deployed to:", petitionAddress);

  // Deploy SurveyTemplate
  console.log("\n📋 Deploying SurveyTemplate...");
  const SurveyTemplate = await ethers.getContractFactory("SurveyTemplate");
  const surveyTemplate = await SurveyTemplate.deploy();
  await surveyTemplate.waitForDeployment();
  const surveyAddress = await surveyTemplate.getAddress();
  console.log("✅ SurveyTemplate deployed to:", surveyAddress);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      VotingTemplate: votingAddress,
      PetitionTemplate: petitionAddress,
      SurveyTemplate: surveyAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const fileName = `deployment-${deploymentInfo.network}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, fileName),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to:", fileName);
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("VotingTemplate:", votingAddress);
  console.log("PetitionTemplate:", petitionAddress);
  console.log("SurveyTemplate:", surveyAddress);

  // Verify contracts on Etherscan (if not local network)
  if (process.env.ETHERSCAN_API_KEY && (await ethers.provider.getNetwork()).chainId !== 31337n) {
    console.log("\n🔍 Waiting for block confirmations before verification...");
    await votingTemplate.deploymentTransaction()?.wait(6);
    
    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      await run("verify:verify", {
        address: votingAddress,
        constructorArguments: [],
      });
      console.log("✅ VotingTemplate verified");
    } catch (error: any) {
      console.log("⚠️  VotingTemplate verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: petitionAddress,
        constructorArguments: [],
      });
      console.log("✅ PetitionTemplate verified");
    } catch (error: any) {
      console.log("⚠️  PetitionTemplate verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: surveyAddress,
        constructorArguments: [],
      });
      console.log("✅ SurveyTemplate verified");
    } catch (error: any) {
      console.log("⚠️  SurveyTemplate verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
