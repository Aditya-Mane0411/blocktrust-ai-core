import { ethers } from "hardhat";

/**
 * Script to create a voting event on deployed VotingTemplate
 * Uploads metadata to IPFS and creates on-chain event
 * Usage: npx hardhat run scripts/create-event.ts --network <network>
 */
async function main() {
  console.log("📝 Creating voting event...");

  const [deployer] = await ethers.getSigners();
  console.log("Creating with account:", deployer.address);

  const votingAddress = process.env.VOTING_CONTRACT_ADDRESS;
  if (!votingAddress) {
    throw new Error("VOTING_CONTRACT_ADDRESS not set in environment");
  }

  const VotingTemplate = await ethers.getContractFactory("VotingTemplate");
  const votingContract = VotingTemplate.attach(votingAddress);

  // Event details
  const title = "Board Member Election 2024";
  const description = "Vote for 3 new board members from the candidate list";
  const options = ["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince"];
  const startTime = Math.floor(Date.now() / 1000); // Now
  const endTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now

  // In production, upload metadata to IPFS first
  // const ipfsHash = await uploadToIPFS({ title, description, options, startTime, endTime });
  const ipfsHash = "QmTestHash123"; // Placeholder

  console.log("\nEvent details:");
  console.log("- Title:", title);
  console.log("- Description:", description);
  console.log("- Options:", options);
  console.log("- Start:", new Date(startTime * 1000).toISOString());
  console.log("- End:", new Date(endTime * 1000).toISOString());
  console.log("- IPFS Hash:", ipfsHash);

  // Create event on-chain
  const tx = await votingContract.createVotingEvent(
    title,
    description,
    options,
    startTime,
    endTime,
    ipfsHash
  );

  console.log("\n⏳ Waiting for transaction confirmation...");
  const receipt = await tx.wait();

  console.log("✅ Voting event created successfully!");
  console.log("Transaction hash:", receipt.hash);
  console.log("Block number:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  // Get event ID from event logs
  const event = receipt.logs[0];
  console.log("\n🎉 Event ID:", event.topics[1]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
